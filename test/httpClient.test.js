import test from 'node:test'
import assert from 'node:assert/strict'
import { httpRequest } from '../src/api/httpClient.js'

function jsonResponse(payload, init = {}) {
  return {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    headers: {
      get(name) {
        return name.toLowerCase() === 'content-type' ? 'application/json; charset=utf-8' : null
      },
    },
    async json() {
      return payload
    },
    async text() {
      return JSON.stringify(payload)
    },
  }
}

function textResponse(payload, init = {}) {
  return {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    headers: {
      get() {
        return 'text/plain'
      },
    },
    async json() {
      throw new Error('json should not be read for text responses')
    },
    async text() {
      return payload
    },
  }
}

test.afterEach(() => {
  delete globalThis.fetch
})

test('httpRequest sends json headers, credentials and normalized path', async () => {
  const calls = []
  globalThis.fetch = async (...args) => {
    calls.push(args)
    return jsonResponse({ ok: true })
  }

  const payload = await httpRequest('api/ping', {
    method: 'POST',
    headers: { Authorization: 'Bearer token' },
    body: '{"hello":true}',
  })

  assert.deepEqual(payload, { ok: true })
  assert.equal(calls[0][0], '/api/ping')
  assert.deepEqual(calls[0][1], {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer token',
    },
    body: '{"hello":true}',
    credentials: 'include',
  })
})

test('httpRequest returns text payload for non-json responses', async () => {
  globalThis.fetch = async () => textResponse('plain response')

  assert.equal(await httpRequest('/health'), 'plain response')
})

test('httpRequest throws backend message from json error payload', async () => {
  globalThis.fetch = async () => jsonResponse({ message: 'Nope' }, { ok: false, status: 400 })

  await assert.rejects(() => httpRequest('/api/fail'), /Nope/)
})

test('httpRequest throws HTTP status when error payload has no message', async () => {
  globalThis.fetch = async () => textResponse('not found', { ok: false, status: 404 })

  await assert.rejects(() => httpRequest('/missing'), /HTTP 404/)
})
