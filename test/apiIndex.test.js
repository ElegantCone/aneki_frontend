import test from 'node:test'
import assert from 'node:assert/strict'
import {
  API_BASE_URL,
  API_MODE,
  appApi,
  buildFeed,
  createJoke,
  deleteFromJokesList,
  httpApi,
  httpRequest,
  loginUser,
  mockApi,
  readAppState,
  signupUser,
  tokenStorage,
  updateJokesList,
  writeAppState,
} from '../src/api/index.js'

test('api index exposes public API surface', () => {
  assert.equal(API_BASE_URL, '')
  assert.equal(API_MODE, 'http')
  assert.equal(typeof appApi.session, 'function')
  assert.equal(typeof httpRequest, 'function')
  assert.equal(typeof httpApi.authApi.login, 'function')
  assert.equal(typeof mockApi.readAppState, 'function')
  assert.equal(typeof tokenStorage.getStoredToken, 'function')
  assert.equal(typeof readAppState, 'function')
  assert.equal(typeof writeAppState, 'function')
  assert.equal(typeof loginUser, 'function')
  assert.equal(typeof signupUser, 'function')
  assert.equal(typeof buildFeed, 'function')
  assert.equal(typeof createJoke, 'function')
  assert.equal(typeof updateJokesList, 'function')
  assert.equal(typeof deleteFromJokesList, 'function')
})
