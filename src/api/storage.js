export const STORAGE_KEY = 'aneki-app-state-v1'

const now = Date.now()

export const seedState = {
    currentUserId: null,
    users: [
        {id: 'u-demo-1', name: 'Марина', email: 'marina@example.com', password: '123456'},
        {id: 'u-demo-2', name: 'Илья', email: 'ilya@example.com', password: '123456'},
    ],
    jokes: [
        {
            id: 'j-demo-1',
            userId: 'u-demo-1',
            content:
                'В семье Хаффмана праздник\n' +
                '.\n' +
                '.\n' +
                '.\n' +
                '.\n' +
                '.\n' +
                '.\n' +
                '.\n' +
                '.\n' +
                '.\n' +
                '.\n' +
                '.\n' +
                '.\n' +
                '.\n' +
                '.\n' +
                '.\n' +
                '.\n' +
                '.\n' +
                '.\n' +
                '.\n' +
                '.\n' +
                '.\n' +
                'Батю закодировали',
            createdAt: now - 1000 * 60 * 90,
            updatedAt: now - 1000 * 60 * 90,
        },
        {
            id: 'j-demo-2',
            userId: 'u-demo-2',
            content:
                'Как называют безработного java-программиста?\n' +
                '.\n' +
                '.\n' +
                '.\n' +
                '.\n' +
                '.\n' +
                '.\n' +
                '.\n' +
                '.\n' +
                '.\n' +
                '.\n' +
                '.\n' +
                '.\n' +
                'garbage collector',
            createdAt: now - 1000 * 60 * 30,
            updatedAt: now - 1000 * 60 * 30,
        },
    ],
}

export function readAppState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return seedState
        const parsed = JSON.parse(raw)
        if (!parsed || typeof parsed !== 'object') return seedState

        return {
            currentUserId: parsed.currentUserId ?? null,
            users: Array.isArray(parsed.users) ? parsed.users : seedState.users,
            jokes: Array.isArray(parsed.jokes) ? parsed.jokes : seedState.jokes,
        }
    } catch {
        return seedState
    }
}

export function writeAppState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function generateId(prefix) {
    return `${prefix}-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36)}`
}

