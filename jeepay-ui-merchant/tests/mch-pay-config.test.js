import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { createApp, defineComponent, h, nextTick, ref, watch } from 'vue'
import MchPayConfigAddOrEdit from '../src/views/mchApp/MchPayConfigAddOrEdit.vue'

const api = vi.hoisted(() => ({ get: vi.fn(), save: vi.fn() }))
vi.mock('../src/api/manage', () => ({
  API_URL_MCH_PAYCONFIGS_LIST: '/mock/mchPayConfigs',
  getMchPayConfigUnique: api.get,
  req: { add: api.save },
  upload: { cert: '/mock/upload' },
}))

// Mount the real compiled SFC. Only Ant Design's presentation/validation shell
// is replaced; show(), API loading, schema parsing, v-model and save are real.
const Container = defineComponent({
  setup:
    (_, { slots }) =>
    () =>
      h('div', slots.default?.()),
})
const Form = defineComponent({
  setup(_, { slots, expose }) {
    expose({ validate: async () => true, resetFields: () => {} })
    return () => h('form', { onSubmit: (event) => event.preventDefault() }, slots.default?.())
  },
})
const FormItem = defineComponent({
  props: ['name', 'label'],
  setup:
    (props, { slots }) =>
    () =>
      h('label', { 'data-field': props.name }, [props.label, slots.default?.()]),
})
const Input = defineComponent({
  inheritAttrs: false,
  props: ['value', 'type'],
  emits: ['update:value'],
  setup:
    (props, { attrs, emit }) =>
    () =>
      h(props.type === 'textarea' ? 'textarea' : 'input', {
        ...attrs,
        value: props.value ?? '',
        onInput: (event) => emit('update:value', event.target.value),
      }),
})
const Drawer = defineComponent({
  props: ['open'],
  emits: ['close', 'update:open'],
  setup(props, { slots }) {
    // Ant Design Drawer defaults to destroyOnClose=false: retain form refs.
    const mounted = ref(false)
    watch(
      () => props.open,
      (open) => {
        if (open) mounted.value = true
      },
      { immediate: true }
    )
    return () =>
      mounted.value
        ? h(
            'section',
            {
              'data-drawer': props.open ? '' : undefined,
              hidden: !props.open,
            },
            slots.default?.()
          )
        : null
  },
})
const Button = defineComponent({
  inheritAttrs: false,
  props: ['type', 'loading'],
  setup:
    (_, { attrs, slots }) =>
    () =>
      h('button', { ...attrs, type: 'button' }, slots.default?.()),
})

let app
let component
let callback
let error
let success
beforeEach(() => {
  vi.clearAllMocks()
  api.save.mockResolvedValue({})
  callback = vi.fn()
  error = vi.fn()
  success = vi.fn()
  document.body.innerHTML = '<div id="test-app"></div>'
  app = createApp(MchPayConfigAddOrEdit, { callbackFunc: callback })
  app.config.globalProperties.$access = () => true
  app.config.globalProperties.$infoBox = { message: { error, success } }
  for (const name of ['a-row', 'a-col', 'a-divider', 'a-tag', 'a-radio-group', 'a-radio'])
    app.component(name, Container)
  for (const [name, stub] of Object.entries({
    'a-drawer': Drawer,
    'a-form': Form,
    'a-form-item': FormItem,
    'a-input': Input,
    'a-textarea': Input,
    'a-button': Button,
    JeepayUpload: Container,
    'a-icon': Container,
  }))
    app.component(name, stub)
  component = app.mount('#test-app')
})
afterEach(() => {
  app?.unmount()
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})

const field = (name) => document.querySelector(`[data-field="${name}"] input`)
const drawer = () => document.querySelector('[data-drawer]')
const click = (text) =>
  [...document.querySelectorAll('button')].find((button) => button.textContent === text).click()
async function edit(name, value) {
  field(name).value = value
  field(name).dispatchEvent(new Event('input', { bubbles: true }))
  await nextTick()
}
const textParam = (name, desc = name) => ({ name, desc, type: 'text', verify: 'required' })
const definitions = [
  textParam('merchantNumber', '商户编号'),
  { ...textParam('apiSecret', '密钥'), star: '1' },
]
function record(mchType, legacy = true) {
  return {
    ifCode: 'testpay',
    mchType,
    ifConfigState: 1,
    mchParams: JSON.stringify(definitions),
    ...(legacy
      ? {
          // Both definitions are valid but deliberately disagree with mchParams.
          normalMchParams: JSON.stringify([textParam('legacyNormal', 'Legacy normal definition')]),
          isvsubMchParams: JSON.stringify([
            textParam('legacySub', 'Legacy sub-merchant definition'),
          ]),
        }
      : {}),
  }
}
function saved(values = {}) {
  return {
    infoId: 'test-app-id',
    ifCode: 'testpay',
    state: 0,
    remark: 'Saved remark',
    ifParams: JSON.stringify({
      merchantNumber: 'saved-number',
      apiSecret: 'masked-secret',
      ...values,
    }),
  }
}
async function show(value) {
  component.show('test-app-id', value)
  await vi.waitFor(() => expect(drawer()).not.toBeNull())
  await nextTick()
}

for (const mchType of [1, 2]) {
  test(`type ${mchType}: mchParams wins over both legacy definitions, preserving loaded and saved values`, async () => {
    api.get.mockResolvedValue(saved())
    await show(record(mchType))
    expect(api.get).toHaveBeenCalledWith('test-app-id', 'testpay')
    expect(field('merchantNumber')).not.toBeNull()
    expect(field('merchantNumber').value).toBe('saved-number')
    expect(field('apiSecret').value).toBe('')
    expect(field('apiSecret').placeholder).toBe('masked-secret')
    expect(field('legacyNormal')).toBeNull()
    expect(field('legacySub')).toBeNull()
    expect(document.body.textContent).not.toContain('Legacy')

    await edit('merchantNumber', 'edited-number')
    click('保存')
    await vi.waitFor(() => expect(api.save).toHaveBeenCalledTimes(1))
    expect(api.save).toHaveBeenCalledWith('/mock/mchPayConfigs', {
      infoId: 'test-app-id',
      ifCode: 'testpay',
      state: 0,
      remark: 'Saved remark',
      ifParams: JSON.stringify({ merchantNumber: 'edited-number' }),
    })
    await vi.waitFor(() => expect(drawer()).toBeNull())
    expect(callback).toHaveBeenCalledTimes(1)
    expect(success).toHaveBeenCalledWith('保存成功')
    expect(error).not.toHaveBeenCalled()

    // Simulate the backend preserving the unchanged masked secret on save.
    api.get.mockResolvedValue(saved({ merchantNumber: 'edited-number' }))
    await show(record(mchType))
    expect(field('merchantNumber').value).toBe('edited-number')
    expect(field('apiSecret').placeholder).toBe('masked-secret')
    expect(field('legacyNormal')).toBeNull()
    expect(field('legacySub')).toBeNull()
  })

  test(`type ${mchType}: unified mchParams works without either legacy definition`, async () => {
    api.get.mockResolvedValue(null)
    await show(record(mchType, false))
    expect(field('merchantNumber')).not.toBeNull()
    expect(field('merchantNumber').value).toBe('')
    expect(field('apiSecret').placeholder).toBe('请输入')
    expect(error).not.toHaveBeenCalled()
    expect(api.save).not.toHaveBeenCalled()
  })
}

test('cancel discards edits; reopening another merchant type replaces the prior schema and saved values', async () => {
  api.get.mockResolvedValue(saved())
  await show(record(1))
  await edit('merchantNumber', 'unsaved-number')
  click('取消')
  await nextTick()
  expect(drawer()).toBeNull()
  expect(api.save).not.toHaveBeenCalled()
  expect(callback).not.toHaveBeenCalled()

  await show(record(1))
  expect(field('merchantNumber').value).toBe('saved-number')
  click('取消')
  await nextTick()

  api.get.mockResolvedValue(saved({ subMerchantNumber: 'saved-sub-number' }))
  await show({ ...record(2), mchParams: JSON.stringify([textParam('subMerchantNumber')]) })
  expect(field('subMerchantNumber').value).toBe('saved-sub-number')
  expect(field('merchantNumber')).toBeNull()
  expect(field('apiSecret')).toBeNull()
  expect(field('legacyNormal')).toBeNull()
  expect(field('legacySub')).toBeNull()
  expect(error).not.toHaveBeenCalled()
  expect(api.get).toHaveBeenCalledTimes(3)
  expect(api.save).not.toHaveBeenCalled()
})
