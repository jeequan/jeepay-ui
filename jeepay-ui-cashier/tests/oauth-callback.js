const results = document.querySelector('#results')
const frameHost = document.querySelector('#frame')
const button = document.querySelector('#run')
const tests = []
const test = (name, run) => tests.push({ name, run })
const assert = (condition, message) => { if (!condition) throw new Error(message) }
const equal = (actual, expected) => assert(JSON.stringify(actual) === JSON.stringify(expected), `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
async function waitFor(check) {
  for (let i = 0; i < 200; i++) {
    if (check()) return
    await sleep(10)
  }
  throw new Error('Timed out waiting for callback result')
}
async function open(url, scenario = {}) {
  window.oauthScenario = scenario
  const frame = document.createElement('iframe')
  frame.style.cssText = 'width:390px;height:550px'
  frame.src = `/tests/oauth-frame.html${url}`
  frameHost.replaceChildren(frame)
  await waitFor(() => scenario.router && frame.contentDocument?.querySelector('#app'))
  await scenario.router.isReady()
  return { frame, scenario, win: frame.contentWindow }
}
const callback = '#/oauth2Callback/test-token'
const cashier = '#/cashier/wxpay'
const id = win => win.localStorage.getItem('channelUserId')
const exchanges = scenario => scenario.calls.filter(call => call.path.endsWith('/channelUserId'))

for (const [label, url, code] of [
  ['search query (including percent decoding)', `?code=search%2Bcode&state=${callback}`, 'search+code'],
  ['hash query', `${callback}?code=hash-code`, 'hash-code'],
  ['search overrides hash', `?code=search-code${callback}?code=hash-code`, 'search-code'],
]) {
  test(label, async () => {
    const { win, scenario } = await open(url)
    await waitFor(() => win.location.hash === cashier)
    equal(exchanges(scenario)[0].data.code, code)
    equal(exchanges(scenario)[0].data.token, 'test-token')
    equal(id(win), 'test-openid')
    await waitFor(() => win.document.body.textContent.includes('付款给Test merchant'))
  })
}

for (const [label, response] of [
  ['null', { code: 0, data: null }],
  ['missing', { code: 0 }],
  ['empty', { code: 0, data: '' }],
  ['whitespace', { code: 0, data: '  ' }],
  ['undefined string', { code: 0, data: 'undefined' }],
  ['null string', { code: 0, data: 'null' }],
  ['object', { code: 0, data: {} }],
  ['API error', { code: 999, msg: 'invalid oauth code' }],
]) {
  test(`rejects ${label} and clears stale ID`, async () => {
    const { win, scenario } = await open(`?code=test-code${callback}`, { response, staleId: 'stale-openid' })
    await waitFor(() => win.location.hash.startsWith('#/error?errInfo='))
    await waitFor(() => win.document.body.textContent.includes(response.msg || '获取用户信息失败'))
    equal(id(win), null)
    equal(scenario.calls.map(call => call.path), ['/api/cashier/channelUserId'])
  })
}

test('network failure stops payment', async () => {
  const { win, scenario } = await open(`${callback}?code=test-code`, { networkError: true })
  await waitFor(() => win.location.hash.startsWith('#/error?errInfo='))
  await waitFor(() => win.document.body.textContent.includes('网络异常，请稍后重试'))
  equal(scenario.calls.length, 1)
})

test('Back does not replay a consumed callback', async () => {
  const { win, scenario } = await open('#/error?errInfo=before')
  await scenario.router.push('/oauth2Callback/test-token?code=test-code')
  await waitFor(() => win.location.hash === cashier)
  equal(win.history.state.back, '/error?errInfo=before')
  win.history.back()
  await waitFor(() => win.location.hash === '#/error?errInfo=before')
  equal(exchanges(scenario).length, 1)
})

test('ignores a late callback after navigating away', async () => {
  let release
  const delay = new Promise(resolve => { release = resolve })
  const { win, scenario } = await open(`${callback}?code=old-code`, { delay })
  await waitFor(() => exchanges(scenario).length === 1)
  await scenario.router.push('/error?errInfo=cancelled')
  release()
  await waitFor(() => scenario.completed === 1)
  await sleep(50)
  equal(win.location.hash, '#/error?errInfo=cancelled')
  equal(id(win), null)
  equal(scenario.calls.length, 1)
})

test('newer callback wins when the component is reused', async () => {
  let release
  const delay = new Promise(resolve => { release = resolve })
  const { win, scenario } = await open('#/oauth2Callback/old-token?code=old-code', { delay })
  await waitFor(() => exchanges(scenario).length === 1)
  await scenario.router.push('/oauth2Callback/new-token?code=new-code')
  try {
    await waitFor(() => win.location.hash === cashier)
    release()
    await waitFor(() => scenario.completed === 3)
    await sleep(50)
    equal(id(win), 'new-openid')
    equal(exchanges(scenario).map(call => call.data.token), ['old-token', 'new-token'])
  } finally { release() }
})

button.addEventListener('click', async () => {
  button.disabled = true
  results.textContent = ''
  let passed = 0
  for (const { name, run } of tests) {
    try { await run(); passed++; results.textContent += `PASS ${name}\n` }
    catch (error) { results.textContent += `FAIL ${name}: ${error.message}\n` }
  }
  results.textContent += `\n${passed}/${tests.length} passed`
  button.disabled = false
})
