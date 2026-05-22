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

test('mockAppApi getFeed returns seeded jokes with author names', async () => {
  const feed = await mockAppApi.getFeed()

  assert.equal(feed.length, 2)
  assert.equal(feed[0].userName, 'Илья')
})

test('mockAppApi updateJoke edits current user joke', async () => {
  await mockAppApi.login({
    email: 'marina@example.com',
    password: '123456',
  })

  const updated = await mockAppApi.updateJoke({
    jokeId: 'j-demo-1',
    content: '  Обновленный текст  ',
  })

  assert.equal(updated.content, 'Обновленный текст')
  assert.equal(updated.userName, 'Марина')
})

test('mockAppApi updateJoke throws when current user cannot edit joke', async () => {
  await mockAppApi.login({
    email: 'marina@example.com',
    password: '123456',
  })

  await assert.rejects(
    () => mockAppApi.updateJoke({ jokeId: 'j-demo-2', content: 'Чужой текст' }),
    /Анекдот не найден/,
  )
})

test('mockAppApi deleteJoke removes current user joke only', async () => {
  await mockAppApi.login({
    email: 'marina@example.com',
    password: '123456',
  })

  const result = await mockAppApi.deleteJoke({ jokeId: 'j-demo-1' })
  const state = readAppState()

  assert.deepEqual(result, { ok: true })
  assert.equal(state.jokes.some((joke) => joke.id === 'j-demo-1'), false)
  assert.equal(state.jokes.some((joke) => joke.id === 'j-demo-2'), true)
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

test('mockAppApi session accepts token even when current user id is missing from state', async () => {
  setStoredToken('mock-token:u-demo-2')

  const session = await mockAppApi.session()

  assert.equal(session.currentUser.email, 'ilya@example.com')
  assert.equal(session.token, 'mock-token:u-demo-2')
})
