import test from 'node:test'
import assert from 'node:assert/strict'
import { httpAppApi } from '../src/api/http/appApi.js'
import { getStoredToken, setStoredToken } from '../src/api/tokenStorage.js'
import { installLocalStorageMock } from './helpers/localStorage.js'

const user = { id: 'u1', name: 'Anna', email: 'anna@example.com' }
const joke = { id: 'j1', userId: 'u1', content: 'hello', createdAt: 1, updatedAt: 1 }

function responseFor(payload, init = {}) {
  return {
    ok: init.ok ?? true,
    status: init.status ?? 200,
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

function installRouteFetch(routes) {
  const calls = []
  globalThis.fetch = async (path, options = {}) => {
    calls.push([path, options])
    const route = routes.shift()
    assert.equal(path, route.path)
    if (route.reject) throw route.reject
    return responseFor(route.payload, route.init)
  }
  return calls
}

test.beforeEach(() => {
  installLocalStorageMock()
})

test.afterEach(() => {
  delete globalThis.fetch
})

test('httpAppApi session returns empty session without token', async () => {
  assert.deepEqual(await httpAppApi.session(), { token: null, currentUser: null })
})

test('httpAppApi login and signup store token', async () => {
  installRouteFetch([
    { path: '/api/auth/login', payload: { token: 'login-token', user } },
    { path: '/api/auth/signup', payload: { accessToken: 'signup-token', profile: user } },
  ])

  assert.deepEqual(await httpAppApi.login({ email: user.email, password: 'secret' }), {
    token: 'login-token',
    user,
  })
  assert.equal(getStoredToken(), 'login-token')

  assert.deepEqual(await httpAppApi.signup({ name: user.name, email: user.email, password: 'secret' }), {
    token: 'signup-token',
    user,
  })
  assert.equal(getStoredToken(), 'signup-token')
})

test('httpAppApi session restores user and clears bad token on failure', async () => {
  setStoredToken('token')
  installRouteFetch([{ path: '/api/auth/me', payload: { user } }])

  assert.deepEqual(await httpAppApi.session(), { token: 'token', currentUser: user })

  setStoredToken('bad-token')
  globalThis.fetch = async () => responseFor({ message: 'Unauthorized' }, { ok: false, status: 401 })

  assert.deepEqual(await httpAppApi.session(), { token: null, currentUser: null })
  assert.equal(getStoredToken(), null)
})

test('httpAppApi delegates feed and joke mutations to http APIs', async () => {
  const calls = installRouteFetch([
    { path: '/api/jokes', payload: { jokes: [joke] } },
    { path: '/api/jokes', payload: { joke: { ...joke, id: 'j2' } } },
    { path: '/api/jokes/j2', payload: { joke: { ...joke, id: 'j2', content: 'updated' } } },
    { path: '/api/jokes/j2', payload: { ok: true } },
  ])

  assert.deepEqual(await httpAppApi.getFeed(), [joke])
  assert.equal((await httpAppApi.createJoke({ content: 'new', token: 'token' })).id, 'j2')
  assert.equal((await httpAppApi.updateJoke({ jokeId: 'j2', content: 'updated', token: 'token' })).content, 'updated')
  assert.deepEqual(await httpAppApi.deleteJoke({ jokeId: 'j2', token: 'token' }), { ok: true })

  assert.equal(calls[1][1].headers.Authorization, 'Bearer token')
  assert.equal(calls[2][1].headers.Authorization, 'Bearer token')
  assert.equal(calls[3][1].headers.Authorization, 'Bearer token')
})

test('httpAppApi logout clears token locally', async () => {
  setStoredToken('token')

  assert.deepEqual(await httpAppApi.logout(), { ok: true })
  assert.equal(getStoredToken(), null)
})
