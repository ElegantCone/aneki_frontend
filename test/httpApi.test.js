import test from 'node:test'
import assert from 'node:assert/strict'
import { authApi } from '../src/api/http/authApi.js'
import { jokesApi } from '../src/api/http/jokesApi.js'
import { authApi as exportedAuthApi, jokesApi as exportedJokesApi } from '../src/api/http/index.js'

function okResponse(payload = { ok: true }) {
  return {
    ok: true,
    status: 200,
    headers: {
      get() {
        return 'application/json'
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

function installFetchRecorder() {
  const calls = []
  globalThis.fetch = async (...args) => {
    calls.push(args)
    return okResponse()
  }
  return calls
}

test.afterEach(() => {
  delete globalThis.fetch
})

test('http index re-exports auth and jokes APIs', () => {
  assert.equal(exportedAuthApi, authApi)
  assert.equal(exportedJokesApi, jokesApi)
})

test('authApi sends expected auth requests', async () => {
  const calls = installFetchRecorder()

  await authApi.login({ email: 'a@example.com', password: 'secret' })
  await authApi.signup({ name: 'Anna', email: 'a@example.com', password: 'secret' })
  await authApi.me()

  assert.equal(calls[0][0], '/api/auth/login')
  assert.equal(calls[0][1].method, 'POST')
  assert.equal(calls[0][1].body, JSON.stringify({ email: 'a@example.com', password: 'secret' }))
  assert.equal(calls[1][0], '/api/auth/signup')
  assert.equal(calls[1][1].method, 'POST')
  assert.equal(calls[1][1].body, JSON.stringify({ name: 'Anna', email: 'a@example.com', password: 'secret' }))
  assert.equal(calls[2][0], '/api/auth/me')
})

test('jokesApi sends expected joke requests', async () => {
  const calls = installFetchRecorder()

  await jokesApi.listFeed()
  await jokesApi.listMyJokes('token')
  await jokesApi.create({ content: 'hello', token: 'token' })
  await jokesApi.update({ jokeId: 'j1', content: 'updated', token: 'token' })
  await jokesApi.remove({ jokeId: 'j1', token: 'token' })

  assert.equal(calls[0][0], '/api/jokes')
  assert.equal(calls[1][0], '/api/jokes/me')
  assert.equal(calls[1][1].headers.Authorization, 'Bearer token')
  assert.equal(calls[2][0], '/api/jokes')
  assert.equal(calls[2][1].method, 'POST')
  assert.equal(calls[2][1].headers.Authorization, 'Bearer token')
  assert.equal(calls[2][1].body, JSON.stringify({ content: 'hello' }))
  assert.equal(calls[3][0], '/api/jokes/j1')
  assert.equal(calls[3][1].method, 'PUT')
  assert.equal(calls[3][1].body, JSON.stringify({ content: 'updated' }))
  assert.equal(calls[4][0], '/api/jokes/j1')
  assert.equal(calls[4][1].method, 'DELETE')
})
