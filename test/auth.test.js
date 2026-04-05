import test from 'node:test'
import assert from 'node:assert/strict'
import { loginUser, signupUser } from '../src/api/auth.js'

const users = [
  { id: 'u1', name: 'Anna', email: 'anna@example.com', password: 'secret' },
]

test('loginUser matches email case-insensitively', () => {
  const user = loginUser(users, 'ANNA@example.com', 'secret')
  assert.equal(user.id, 'u1')
})

test('loginUser throws on invalid credentials', () => {
  assert.throws(() => loginUser(users, 'anna@example.com', 'wrong'), /Неверный email или пароль/)
})

test('signupUser trims name and normalizes email', () => {
  const user = signupUser(users, {
    name: '  Oleg  ',
    email: 'OLEG@EXAMPLE.COM',
    password: '123456',
  })

  assert.equal(user.name, 'Oleg')
  assert.equal(user.email, 'oleg@example.com')
  assert.match(user.id, /^u-/)
})

test('signupUser rejects duplicate email', () => {
  assert.throws(
    () => signupUser(users, { name: 'Anna 2', email: 'ANNA@example.com', password: '123456' }),
    /Пользователь с таким email уже существует/,
  )
})

