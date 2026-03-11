function isObject(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function hasString(value) {
  return typeof value === 'string' && value.length > 0
}

export function unwrapData(payload, field) {
  const base = isObject(payload) && isObject(payload.data) ? payload.data : payload

  if (typeof field === 'undefined') {
    return base
  }

  const value = base?.[field]
  if ((isObject(base) && isObject(value)) || Array.isArray(value)) {
    return value
  }

  return base
}

export function normalizeUser(payload) {
  const user = unwrapData(payload, 'user')

  if (!isObject(user)) {
    throw new Error('Invalid user payload: expected object')
  }

  if (!hasString(user.id) || !hasString(user.name) || !hasString(user.email)) {
    throw new Error('Invalid user payload: expected id, name, email')
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    ...user,
  }
}

export function normalizeAuthResponse(payload) {
  const data = unwrapData(payload)
  if (!isObject(data)) {
    throw new Error('Invalid auth response: expected object')
  }

  const token = data.token ?? data.accessToken ?? data.access_token
  const user = normalizeUser({ user: data.user ?? data.profile ?? data.account })

  if (!hasString(token)) {
    throw new Error('Invalid auth response: expected token')
  }

  return { token, user }
}

export function normalizeJoke(payload) {
  const joke = unwrapData(payload, 'joke')

  if (!isObject(joke)) {
    throw new Error('Invalid joke payload: expected object')
  }

  if (!hasString(joke.id) || !hasString(joke.userId) || !hasString(joke.content)) {
    throw new Error('Invalid joke payload: expected id, userId, content')
  }

  return {
    createdAt: joke.createdAt ?? Date.now(),
    updatedAt: joke.updatedAt ?? joke.createdAt ?? Date.now(),
    ...joke,
  }
}

export function normalizeJokesList(payload) {
  const jokes = unwrapData(payload, 'jokes')

  if (!Array.isArray(jokes)) {
    throw new Error('Invalid jokes response: expected jokes array')
  }

  return jokes.map((joke) => normalizeJoke({ joke }))
}
