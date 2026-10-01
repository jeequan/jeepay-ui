import { afterEach, expect, test, vi } from 'vitest'

let router
async function open(url, response = { code: 0, data: 'test-openid' }) {
  vi.resetModules()
  window.history.replaceState(null, '', url)
  Object.defineProperty(navigator, 'userAgent', { configurable: true, value: 'Mozilla/5.0 MicroMessenger/8.0' })
  localStorage.clear()
  localStorage.setItem('channelUserId', 'stale-openid')
  document.body.innerHTML = '<div id="app"></div>'
  const calls = []
  const axios = (await import('axios')).default
  axios.defaults.adapter = async config => {
    const data = JSON.parse(config.data)
    calls.push({ path: config.url, data })
    let result
    if (config.url.endsWith('/channelUserId')) result = typeof response === 'function' ? await response(data) : response
    else if (config.url.endsWith('/payOrderInfo')) result = { code: 0, data: { mchName: 'Test merchant', amount: 0 } }
    else throw new Error(`Unexpected payment request: ${config.url}`)
    return { data: result, status: 200, statusText: 'OK', headers: {}, config }
  }
  router = (await import('../src/router')).default
  await import('../src/main')
  await router.isReady()
  return calls
}
const settled = () => new Promise(resolve => setTimeout(resolve, 50))
const waitForRoute = name => vi.waitFor(() => expect(router.currentRoute.value.name).toBe(name))
afterEach(() => {
  document.querySelector('#app')?.__vue_app__?.unmount()
  router?.options.history.destroy()
  vi.restoreAllMocks()
})

for (const [name, url, code] of [
  ['search with percent decoding', '/?code=search%2Bcode&state=#/oauth2Callback/test-token', 'search+code'],
  ['hash query', '/#/oauth2Callback/test-token?code=hash-code', 'hash-code'],
  ['search overrides hash', '/?code=search-code#/oauth2Callback/test-token?code=hash-code', 'search-code'],
]) {
  test(name, async () => {
    const calls = await open(url)
    await waitForRoute('CashierWxpay')
    expect(calls[0].data).toMatchObject({ code, token: 'test-token', wayCode: 'WX_JSAPI' })
    expect(localStorage.getItem('channelUserId')).toBe('test-openid')
    await vi.waitFor(() => expect(document.body.textContent).toContain('付款给Test merchant'))
  })
}
for (const [label, response] of [
  ['null', { code: 0, data: null }], ['missing', { code: 0 }], ['empty', { code: 0, data: '' }],
  ['whitespace', { code: 0, data: '  ' }], ['undefined string', { code: 0, data: 'undefined' }],
  ['null string', { code: 0, data: 'null' }], ['object', { code: 0, data: {} }],
  ['API error', { code: 999, msg: 'invalid oauth code' }],
]) {
  test(`rejects ${label}, clears stale ID and stops payment`, async () => {
    const calls = await open('/?code=test-code#/oauth2Callback/test-token', response)
    await waitForRoute('Error')
    expect(router.currentRoute.value.query.errInfo).toBe(response.msg || '获取用户信息失败')
    expect(localStorage.getItem('channelUserId')).toBeNull()
    expect(calls.map(call => call.path)).toEqual(['/api/cashier/channelUserId'])
    await vi.waitFor(() => expect(document.body.textContent).toContain(response.msg || '获取用户信息失败'))
  })
}
test('network failure stops payment', async () => {
  const calls = await open('/#/oauth2Callback/test-token?code=test-code', () => { throw new Error('test network failure') })
  await waitForRoute('Error')
  expect(document.body.textContent).toContain('网络异常，请稍后重试')
  expect(calls).toHaveLength(1)
})
test('Back does not replay a consumed callback', async () => {
  const calls = await open('/#/error?errInfo=before')
  await router.push('/oauth2Callback/test-token?code=test-code')
  await waitForRoute('CashierWxpay')
  router.back()
  await waitForRoute('Error')
  expect(router.currentRoute.value.query.errInfo).toBe('before')
  expect(calls.filter(call => call.path.endsWith('/channelUserId'))).toHaveLength(1)
})
test('ignores a late callback after navigating away', async () => {
  let release
  const response = new Promise(resolve => { release = resolve })
  const calls = await open('/#/oauth2Callback/test-token?code=old-code', () => response)
  await vi.waitFor(() => expect(calls).toHaveLength(1))
  await router.push('/error?errInfo=cancelled')
  release({ code: 0, data: 'old-openid' })
  await settled()
  expect(router.currentRoute.value.query.errInfo).toBe('cancelled')
  expect(localStorage.getItem('channelUserId')).toBeNull()
  expect(calls).toHaveLength(1)
})
test('newer callback wins when component is reused', async () => {
  let release
  const response = new Promise(resolve => { release = resolve })
  const calls = await open('/#/oauth2Callback/old-token?code=old-code', data => data.code === 'old-code' ? response : { code: 0, data: 'new-openid' })
  await vi.waitFor(() => expect(calls).toHaveLength(1))
  await router.push('/oauth2Callback/new-token?code=new-code')
  try {
    await waitForRoute('CashierWxpay')
    release({ code: 0, data: 'old-openid' })
    await settled()
    expect(localStorage.getItem('channelUserId')).toBe('new-openid')
    expect(calls.filter(call => call.path.endsWith('/channelUserId')).map(call => call.data.token)).toEqual(['old-token', 'new-token'])
  } finally { release({ code: 0, data: 'old-openid' }) }
})

test('storage failure displays an error without exchanging or paying', async () => {
  vi.spyOn(Storage.prototype, 'removeItem').mockImplementationOnce(() => { throw new Error('storage unavailable') })
  const calls = await open('/#/oauth2Callback/test-token?code=test-code')
  await waitForRoute('Error')
  expect(document.body.textContent).toContain('storage unavailable')
  expect(calls).toHaveLength(0)
})
