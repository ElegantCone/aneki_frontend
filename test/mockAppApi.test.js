import test from 'node:test'
import assert from 'node:assert/strict'
import { mockAppApi } from '../src/api/mock/appApi.js'
import { readAppState, writeAppState } from '../src/api/storage.js'
import { getStoredToken, setStoredToken } from '../src/api/tokenStorage.js'
import { installLocalStorageMock } from './helpers/localStorage.js'

test.beforeEach(() => {
  installLocalStorageMock()
})

test('mockAppApi login persists token and session restores current user', async () => {
  const result = await mockAppApi.login({
    email: 'marina@example.com',
    password: '123456',
  })

  assert.equal(result.user.name, 'Марина')
  assert.equal(getStoredToken(), result.token)

  const session = await mockAppApi.session()
  assert.equal(session.currentUser?.email, 'marina@example.com')
  assert.equal(session.token, result.token)
})

test('mockAppApi signup adds user to storage', async () => {
  const result = await mockAppApi.signup({
    name: 'Пётр',
    email: 'petr@example.com',
    password: '123456',
  })

  const state = readAppState()
  assert.equal(result.user.email, 'petr@example.com')
  assert.equal(state.users.some((user) => user.email === 'petr@example.com'), true)
})

test('mockAppApi createJoke returns enriched joke with userName', async () => {
  await mockAppApi.login({
    email: 'marina@example.com',
    password: '123456',
  })

  const joke = await mockAppApi.createJoke({ content: '  Новый анекдот  ' })
  assert.equal(joke.content, 'Новый анекдот')
  assert.equal(joke.userName, 'Марина')
})

test('mockAppApi logout clears current user and token', async () => {
  await mockAppApi.login({
    email: 'marina@example.com',
    password: '123456',
  })

  await mockAppApi.logout()

  const session = await mockAppApi.session()
  assert.equal(session.currentUser, null)
  assert.equal(session.token, null)
  assert.equal(getStoredToken(), null)
})

test('mockAppApi clears invalid stored token on session check', async () => {
  const state = readAppState()
  writeAppState({ ...state, currentUserId: null })
  setStoredToken('broken-token')

  const session = await mockAppApi.session()
  assert.equal(session.currentUser, null)
  assert.equal(getStoredToken(), null)
})
