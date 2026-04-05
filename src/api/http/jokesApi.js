import {httpRequest} from '../httpClient.js'

export const jokesApi = {
    async listFeed() {
        return httpRequest('/api/jokes')
    },

    async listMyJokes(token) {
        return httpRequest('/api/jokes/me', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
    },

    async create({content, token}) {
        return httpRequest('/api/jokes', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({content}),
        })
    },

    async update({jokeId, content, token}) {
        return httpRequest(`/api/jokes/${jokeId}`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({content}),
        })
    },

    async remove({jokeId, token}) {
        return httpRequest(`/api/jokes/${jokeId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
    },
}

