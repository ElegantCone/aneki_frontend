import {generateId} from './storage.js'

export function loginUser(users, email, password) {
    const normalizedEmail = email.trim().toLowerCase()
    const user = users.find((entry) => entry.email.trim().toLowerCase() === normalizedEmail)

    if (!user || user.password !== password) {
        throw new Error('Неверный email или пароль')
    }

    return user
}

export function signupUser(users, {name, email, password}) {
    const normalizedEmail = email.trim().toLowerCase()
    const trimmedName = name.trim()

    if (!trimmedName) {
        throw new Error('Введите имя')
    }

    if (users.some((user) => user.email.trim().toLowerCase() === normalizedEmail)) {
        throw new Error('Пользователь с таким email уже существует')
    }

    return {
        id: generateId('u'),
        name: trimmedName,
        email: normalizedEmail,
        password
    }
}

