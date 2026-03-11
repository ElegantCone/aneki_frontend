import test from 'node:test'
import assert from 'node:assert/strict'
import {
  normalizeAuthResponse,
  normalizeJoke,
  normalizeJokesList,
  normalizeUser,
  unwrapData,
} from '../src/api/contracts.js'

test('unwrapData supports top-level data wrapper', () => {
  assert.deepEqual(unwrapData({ data: { ok: true } }), { ok: true })
  assert.deepEqual(unwrapData({ data: { jokes: [1, 2] } }, 'jokes'), [1, 2])
})

test('normalizeUser accepts direct user or wrapped user', () => {
  assert.equal(normalizeUser({ id: 'u1', name: 'Anna', email: 'a@a.ru' }).id, 'u1')
  assert.equal(normalizeUser({ user: { id: 'u2', name: 'Oleg', email: 'o@o.ru' } }).id, 'u2')
})

test('normalizeAuthResponse accepts wrapped payload and token aliases', () => {
  const auth = normalizeAuthResponse({
    data: {
      access_token: 'token-1',
      account: { id: 'u1', name: 'Anna', email: 'a@a.ru' },
    },
  })

  assert.equal(auth.token, 'token-1')
  assert.equal(auth.user.id, 'u1')
})

test('normalizeJoke fills timestamps when missing', () => {
  const joke = normalizeJoke({
    joke: { id: 'j1', userId: 'u1', content: 'text' },
  })

  assert.equal(joke.id, 'j1')
  assert.equal(typeof joke.createdAt, 'number')
  assert.equal(typeof joke.updatedAt, 'number')
})

test('normalizeJokesList validates array payload', () => {
  const jokes = normalizeJokesList({
    data: {
      jokes: [{ id: 'j1', userId: 'u1', content: 'text' }],
    },
  })

  assert.equal(jokes.length, 1)
  assert.equal(jokes[0].id, 'j1')
})

test('normalizeAuthResponse throws on invalid payload', () => {
  assert.throws(() => normalizeAuthResponse({ token: 'x' }), /Invalid user payload/)
})

