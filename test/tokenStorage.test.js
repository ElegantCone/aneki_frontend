import test from 'node:test'
import assert from 'node:assert/strict'
import { clearStoredToken, getStoredToken, setStoredToken } from '../src/api/tokenStorage.js'
import { installLocalStorageMock } from './helpers/localStorage.js'

test.beforeEach(() => {
  installLocalStorageMock()
})

test('tokenStorage stores and clears token', () => {
  setStoredToken('abc')
  assert.equal(getStoredToken(), 'abc')

  clearStoredToken()
  assert.equal(getStoredToken(), null)
})

test('setStoredToken removes token on falsy value', () => {
  setStoredToken('abc')
  setStoredToken('')
  assert.equal(getStoredToken(), null)
})

