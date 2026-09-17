import assert from 'node:assert/strict'

// Start a production server and Chrome with --remote-debugging-port=9223 first.
// Uses Node's built-in WebSocket: no browser automation dependency required.
const baseUrl = process.env.PERF_BASE_URL || 'http://127.0.0.1:3100'
const debugUrl = process.env.PERF_DEBUG_URL || 'http://127.0.0.1:9223'
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

async function checkViewport(name, width, height, mobile) {
  const target = await fetch(`${debugUrl}/json/new?about:blank`, { method: 'PUT' }).then(r => r.json())
  const socket = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true })
    socket.addEventListener('error', reject, { once: true })
  })
  let id = 0
  const pending = new Map()
  const exceptions = []
  const sockets = []
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data)
    if (message.id && pending.has(message.id)) {
      const { resolve, reject, timer } = pending.get(message.id)
      pending.delete(message.id)
      clearTimeout(timer)
      message.error ? reject(new Error(message.error.message)) : resolve(message.result)
    }
    if (message.method === 'Runtime.exceptionThrown') exceptions.push(message.params.exceptionDetails.text)
    if (message.method === 'Network.webSocketCreated') sockets.push(message.params.url)
  })
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const requestId = ++id
    const timer = setTimeout(() => { pending.delete(requestId); reject(new Error(`Timed out: ${method}`)) }, 15000)
    pending.set(requestId, { resolve, reject, timer })
    socket.send(JSON.stringify({ id: requestId, method, params }))
  })
  const evaluate = async expression => {
    const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text)
    return result.result.value
  }
  const waitFor = async expression => {
    for (let i = 0; i < 60; i++) {
      if (await evaluate(expression)) return
      await sleep(250)
    }
    throw new Error(`Condition not met: ${expression}`)
  }
  try {
    await send('Runtime.enable')
    await send('Network.enable')
    await send('Network.setCacheDisabled', { cacheDisabled: true })
    await send('Page.enable')
    await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: mobile ? 2 : 1, mobile })
    await send('Page.navigate', { url: baseUrl })
    await waitFor("document.readyState === 'complete' && document.body.innerText.includes('Play workflow demo')")
    await sleep(1500)
    const before = await evaluate(`(() => {
      const nav = performance.getEntriesByType('navigation')[0];
      return {
        viewport: innerWidth,
        documentWidth: document.documentElement.scrollWidth,
        canvases: document.querySelectorAll('canvas').length,
        demoMounted: document.body.textContent.includes('Choreographed Studio Demo'),
        ttfbMs: Math.round(nav.responseStart - nav.startTime),
        domContentLoadedMs: Math.round(nav.domContentLoadedEventEnd - nav.startTime),
        scriptBytes: performance.getEntriesByType('resource').filter(r => r.initiatorType === 'script').reduce((n,r) => n + r.encodedBodySize, 0)
      };
    })()`)
    assert.ok(before.documentWidth <= before.viewport + 1, `${name}: horizontal overflow`)
    assert.equal(before.canvases, 0, `${name}: decorative canvas loaded`)
    assert.equal(before.demoMounted, false, `${name}: demo eagerly mounted`)
    assert.equal(sockets.length, 0, `${name}: unsolicited websocket`)
    await evaluate(`(() => {
      const button = [...document.querySelectorAll('button')].find(b => b.textContent.includes('Play workflow demo'));
      button.scrollIntoView({ block: 'center' }); button.click();
    })()`)
    await waitFor("document.body.textContent.includes('Choreographed Studio Demo')")
    await sleep(1500)
    const afterBytes = await evaluate("performance.getEntriesByType('resource').filter(r => r.initiatorType === 'script').reduce((n,r) => n + r.encodedBodySize, 0)")
    assert.ok(afterBytes > before.scriptBytes, `${name}: expected on-demand demo chunk`)
    assert.deepEqual(exceptions, [], `${name}: uncaught browser exceptions`)
    console.log(JSON.stringify({ device: name, status: 'PASS', ...before, deferredScriptBytes: afterBytes - before.scriptBytes, uncaughtExceptions: exceptions.length, websockets: sockets.length }))
  } finally {
    socket.close()
    await fetch(`${debugUrl}/json/close/${target.id}`)
  }
}

await checkViewport('desktop', 1440, 900, false)
await checkViewport('mobile', 390, 844, true)
