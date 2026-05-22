import test from 'node:test'
import assert from 'node:assert/strict'
import { readAppState, seedState, STORAGE_KEY, writeAppState } from '../src/api/storage.js'
import { installLocalStorageMock } from './helpers/localStorage.js'

test.beforeEach(() => {
  installLocalStorageMock()
})

test('readAppState falls back to seed state when storage is empty or invalid', () => {
  assert.deepEqual(readAppState(), seedState)

  localStorage.setItem(STORAGE_KEY, 'not-json')
  assert.deepEqual(readAppState(), seedState)

  localStorage.setItem(STORAGE_KEY, JSON.stringify(null))
  assert.deepEqual(readAppState(), seedState)
})

test('readAppState normalizes missing fields and writeAppState persists state', () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ currentUserId: 'u1', users: 'bad', jokes: [] }))

  assert.deepEqual(readAppState(), {
    currentUserId: 'u1',
    users: seedState.users,
    jokes: [],
  })

  const nextState = { currentUserId: null, users: [], jokes: [] }
  writeAppState(nextState)

  assert.deepEqual(JSON.parse(localStorage.getItem(STORAGE_KEY)), nextState)
})
