function isObject(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function hasString(value) {
    return typeof value === 'string' && value.length > 0
}

export function unwrapData(payload) {
    if (isObject(payload) && isObject(payload.data)) {
        return payload.data
    }
    return payload
}

export function normalizeUser(payload) {
    const data = unwrapData(payload)
    const user = isObject(data) && isObject(data.user) ? data.user : data

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
    const user = normalizeUser({user: data.user ?? data.profile ?? data.account})

    if (!hasString(token)) {
        throw new Error('Invalid auth response: expected token')
    }

    return {token, user}
}

export function normalizeJoke(payload) {
    const data = unwrapData(payload)
    const joke = isObject(data) && isObject(data.joke) ? data.joke : data

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
    const data = unwrapData(payload)
    const jokes = Array.isArray(data?.jokes) ? data.jokes : Array.isArray(data) ? data : null

    if (!Array.isArray(jokes)) {
        throw new Error('Invalid jokes response: expected jokes array')
    }

    return jokes.map((joke) => normalizeJoke({joke}))
}

