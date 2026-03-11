import test from 'node:test'
import assert from 'node:assert/strict'
import { buildFeed, createJoke, deleteFromJokesList, updateJokesList } from '../src/api/jokes.js'

const users = [
  { id: 'u1', name: 'Anna' },
  { id: 'u2', name: 'Oleg' },
]

test('buildFeed sorts jokes by createdAt desc and injects userName', () => {
  const feed = buildFeed(
    [
      { id: 'j1', userId: 'u1', content: 'first', createdAt: 1 },
      { id: 'j2', userId: 'u2', content: 'second', createdAt: 2 },
    ],
    users,
  )

  assert.deepEqual(
    feed.map((joke) => ({ id: joke.id, userName: joke.userName })),
    [
      { id: 'j2', userName: 'Oleg' },
      { id: 'j1', userName: 'Anna' },
    ],
  )
})

test('createJoke trims content and assigns owner', () => {
  const joke = createJoke({
    currentUser: { id: 'u1' },
    content: '  hello  ',
  })

  assert.equal(joke.userId, 'u1')
  assert.equal(joke.content, 'hello')
  assert.equal(typeof joke.createdAt, 'number')
  assert.equal(joke.createdAt, joke.updatedAt)
})

test('updateJokesList updates only current user joke', () => {
  const jokes = [
    { id: 'j1', userId: 'u1', content: 'old', updatedAt: 1 },
    { id: 'j2', userId: 'u2', content: 'keep', updatedAt: 1 },
  ]

  const updated = updateJokesList({
    jokes,
    currentUser: { id: 'u1' },
    jokeId: 'j1',
    content: '  new text ',
  })

  assert.equal(updated[0].content, 'new text')
  assert.equal(updated[1].content, 'keep')
})

test('deleteFromJokesList removes only current user joke', () => {
  const jokes = [
    { id: 'j1', userId: 'u1' },
    { id: 'j2', userId: 'u2' },
  ]

  const filtered = deleteFromJokesList({
    jokes,
    currentUser: { id: 'u1' },
    jokeId: 'j1',
  })

  assert.deepEqual(filtered, [{ id: 'j2', userId: 'u2' }])
})

