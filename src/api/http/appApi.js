import {authApi} from './authApi.js'
import {jokesApi} from './jokesApi.js'
import {clearStoredToken, getStoredToken, setStoredToken} from '../tokenStorage.js'
import {
    normalizeAuthResponse,
    normalizeJoke,
    normalizeJokesList,
    normalizeUser,
} from '../contracts.js'

export const httpAppApi = {
    async session() {
        const token = getStoredToken()
        if (!token) {
            return {token: null, currentUser: null}
        }

        try {
            const mePayload = await authApi.me(token)
            const currentUser = normalizeUser(mePayload)
            return {token, currentUser}
        } catch {
            clearStoredToken()
            return {token: null, currentUser: null}
        }
    },

    async login({email, password}) {
        const payload = await authApi.login({email, password})
        const {user, token} = normalizeAuthResponse(payload)
        setStoredToken(token)
        return {user, token}
    },

    async signup({name, email, password}) {
        const payload = await authApi.signup({name, email, password})
        const {user, token} = normalizeAuthResponse(payload)
        setStoredToken(token)
        return {user, token}
    },

    async logout() {
        clearStoredToken()
        return {ok: true}
    },

    async getFeed() {
        const payload = await jokesApi.listFeed()
        return normalizeJokesList(payload)
    },

    async createJoke({content, token}) {
        const payload = await jokesApi.create({content, token})
        return normalizeJoke(payload)
    },

    async updateJoke({jokeId, content, token}) {
        const payload = await jokesApi.update({jokeId, content, token})
        return normalizeJoke(payload)
    },

    async deleteJoke({jokeId, token}) {
        return jokesApi.remove({jokeId, token})
    },
}
