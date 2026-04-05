import {httpRequest} from '../httpClient.js'

export const authApi = {
    async login({email, password}) {
        return httpRequest('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({email, password}),
        })
    },

    async signup({name, email, password}) {
        return httpRequest('/api/auth/signup', {
            method: 'POST',
            body: JSON.stringify({name, email, password}),
        })
    },

    async me() {
        return httpRequest('/api/auth/me', {
        })
    },
}

