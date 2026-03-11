import { loginUser, signupUser } from '../auth.js'
import { buildFeed, createJoke, deleteFromJokesList, updateJokesList } from '../jokes.js'
import { readAppState, writeAppState } from '../storage.js'
import { clearStoredToken, getStoredToken, setStoredToken } from '../tokenStorage.js'

const TOKEN_PREFIX = 'mock-token:'

function mockTokenForUser(userId) {
  return `${TOKEN_PREFIX}${userId}`
}

function parseMockToken(token) {
  if (!token?.startsWith(TOKEN_PREFIX)) return null
  return token.slice(TOKEN_PREFIX.length) || null
}

function withUserName(joke, users) {
  return {
    ...joke,
    userName: users.find((user) => user.id === joke.userId)?.name ?? 'Пользователь',
  }
}

export const mockAppApi = {
  async session() {
    const state = readAppState()
    const token = getStoredToken()
    const tokenUserId = parseMockToken(token)
    const currentUserId = tokenUserId ?? state.currentUserId ?? null
    const currentUser = state.users.find((user) => user.id === currentUserId) ?? null

    if (!currentUser && token) {
      clearStoredToken()
    }

    return {
      token: currentUser ? mockTokenForUser(currentUser.id) : null,
      currentUser,
    }
  },

  async login({ email, password }) {
    const state = readAppState()
    const user = loginUser(state.users, email, password)
    const nextState = { ...state, currentUserId: user.id }
    writeAppState(nextState)

    const token = mockTokenForUser(user.id)
    setStoredToken(token)

    return { user, token }
  },

  async signup({ name, email, password }) {
    const state = readAppState()
    const user = signupUser(state.users, { name, email, password })
    const nextState = {
      ...state,
      currentUserId: user.id,
      users: [...state.users, user],
    }
    writeAppState(nextState)

    const token = mockTokenForUser(user.id)
    setStoredToken(token)

    return { user, token }
  },

  async logout() {
    const state = readAppState()
    writeAppState({ ...state, currentUserId: null })
    clearStoredToken()
    return { ok: true }
  },

  async getFeed() {
    const state = readAppState()
    return buildFeed(state.jokes, state.users)
  },

  async createJoke({ content }) {
    const { currentUser } = await this.session()
    const state = readAppState()
    const joke = createJoke({ currentUser, content })
    writeAppState({ ...state, jokes: [joke, ...state.jokes] })
    return withUserName(joke, state.users)
  },

  async updateJoke({ jokeId, content }) {
    const { currentUser } = await this.session()
    const state = readAppState()
    const jokes = updateJokesList({ jokes: state.jokes, currentUser, jokeId, content })
    writeAppState({ ...state, jokes })
    const updated = jokes.find((joke) => joke.id === jokeId)
    if (!updated) {
      throw new Error('Анекдот не найден')
    }
    return withUserName(updated, state.users)
  },

  async deleteJoke({ jokeId }) {
    const { currentUser } = await this.session()
    const state = readAppState()
    const jokes = deleteFromJokesList({ jokes: state.jokes, currentUser, jokeId })
    writeAppState({ ...state, jokes })
    return { ok: true }
  },
}
