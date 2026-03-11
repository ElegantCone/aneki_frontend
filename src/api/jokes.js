import { generateId } from './storage.js'

export function buildFeed(jokes, users) {
  return jokes
    .map((joke) => ({
      ...joke,
      userName: users.find((user) => user.id === joke.userId)?.name ?? 'Пользователь',
    }))
    .sort((a, b) => b.createdAt - a.createdAt)
}

export function createJoke({ currentUser, content }) {
  if (!currentUser) throw new Error('Нужна авторизация')

  const trimmed = content.trim()
  if (!trimmed) throw new Error('Анекдот не может быть пустым')

  const timestamp = Date.now()
  return {
    id: generateId('j'),
    userId: currentUser.id,
    content: trimmed,
    createdAt: timestamp,
    updatedAt: timestamp,
  }
}

export function updateJokesList({ jokes, currentUser, jokeId, content }) {
  if (!currentUser) throw new Error('Нужна авторизация')

  const trimmed = content.trim()
  if (!trimmed) throw new Error('Анекдот не может быть пустым')

  return jokes.map((joke) =>
    joke.id === jokeId && joke.userId === currentUser.id
      ? { ...joke, content: trimmed, updatedAt: Date.now() }
      : joke,
  )
}

export function deleteFromJokesList({ jokes, currentUser, jokeId }) {
  if (!currentUser) throw new Error('Нужна авторизация')

  return jokes.filter((joke) => !(joke.id === jokeId && joke.userId === currentUser.id))
}
