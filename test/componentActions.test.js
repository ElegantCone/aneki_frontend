import test from 'node:test'
import assert from 'node:assert/strict'
import React from 'react'
import { act } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { Window } from 'happy-dom'
import App from '../src/App.jsx'
import JokeCard from '../src/components/JokeCard.jsx'
import NavigationBar from '../src/components/NavigationBar.jsx'
import { AnekiContext } from '../src/context/anekiContext.js'
import Login from '../src/pages/Login.jsx'
import Profile from '../src/pages/Profile.jsx'

const user = { id: 'u1', name: 'Марина', email: 'marina@example.com' }
const joke = {
  id: 'j1',
  userId: user.id,
  username: user.name,
  content: 'Старый анекдот',
  createdAt: Date.now(),
  updatedAt: Date.now(),
}

const domGlobals = [
  'window',
  'document',
  'navigator',
  'HTMLElement',
  'HTMLInputElement',
  'HTMLTextAreaElement',
  'Node',
  'Event',
  'MouseEvent',
  'KeyboardEvent',
  'CustomEvent',
  'getComputedStyle',
  'requestAnimationFrame',
  'cancelAnimationFrame',
  'IS_REACT_ACT_ENVIRONMENT',
]

function defineGlobal(name, value) {
  Object.defineProperty(globalThis, name, {
    configurable: true,
    writable: true,
    value,
  })
}

async function setupDom(t) {
  const originalGlobals = new Map(domGlobals.map((name) => [name, Object.getOwnPropertyDescriptor(globalThis, name)]))
  const window = new Window({ url: 'http://localhost/' })

  defineGlobal('window', window)
  defineGlobal('document', window.document)
  defineGlobal('navigator', window.navigator)
  defineGlobal('HTMLElement', window.HTMLElement)
  defineGlobal('HTMLInputElement', window.HTMLInputElement)
  defineGlobal('HTMLTextAreaElement', window.HTMLTextAreaElement)
  defineGlobal('Node', window.Node)
  defineGlobal('Event', window.Event)
  defineGlobal('MouseEvent', window.MouseEvent)
  defineGlobal('KeyboardEvent', window.KeyboardEvent)
  defineGlobal('CustomEvent', window.CustomEvent)
  defineGlobal('getComputedStyle', window.getComputedStyle.bind(window))
  defineGlobal('requestAnimationFrame', window.requestAnimationFrame.bind(window))
  defineGlobal('cancelAnimationFrame', window.cancelAnimationFrame.bind(window))
  defineGlobal('IS_REACT_ACT_ENVIRONMENT', true)

  const container = window.document.createElement('div')
  window.document.body.append(container)
  const { createRoot } = await import('react-dom/client')
  const root = createRoot(container)

  t.after(async () => {
    await act(async () => {
      root.unmount()
    })
    window.close()

    for (const name of domGlobals) {
      const descriptor = originalGlobals.get(name)
      if (descriptor) {
        Object.defineProperty(globalThis, name, descriptor)
      } else {
        delete globalThis[name]
      }
    }
  })

  return { container, root }
}

function createContext(overrides = {}) {
  return {
    currentUser: user,
    isAuthenticated: true,
    isBootstrapping: false,
    feed: [joke],
    async login() {},
    async signup() {},
    async logout() {},
    getUserJokes() {
      return [joke]
    },
    async addJoke() {},
    async updateJoke() {},
    async deleteJoke() {},
    ...overrides,
  }
}

async function renderWithContext(root, element, context = createContext(), route = '/') {
  await act(async () => {
    root.render(
      React.createElement(
        AnekiContext.Provider,
        { value: context },
        React.createElement(MemoryRouter, { initialEntries: [route] }, element),
      ),
    )
  })
}

function buttonByText(container, text) {
  const button = [...container.querySelectorAll('button')].find((candidate) => candidate.textContent.includes(text))
  assert.ok(button, `button "${text}" should exist`)
  return button
}

async function click(element) {
  await act(async () => {
    element.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }))
  })
}

async function submit(form) {
  await act(async () => {
    form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }))
  })
}

async function setFieldValue(field, value) {
  const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(field), 'value')

  await act(async () => {
    descriptor.set.call(field, value)
    field.dispatchEvent(new window.Event('input', { bubbles: true }))
    field.dispatchEvent(new window.Event('change', { bubbles: true }))
  })
}

test('landing and navigation actions call route handlers', async (t) => {
  const { container, root } = await setupDom(t)
  let logoutCalled = false

  await renderWithContext(root, React.createElement(App), createContext())
  await click(buttonByText(container, 'Открыть ленту'))

  await renderWithContext(
    root,
    React.createElement(NavigationBar),
    createContext({
      async logout() {
        logoutCalled = true
      },
    }),
    '/feed',
  )
  await click(buttonByText(container, 'ANEKI'))
  await click(buttonByText(container, 'Выйти'))

  assert.equal(logoutCalled, true)
})

test('JokeCard owner actions pass selected joke to callbacks', async (t) => {
  const { container, root } = await setupDom(t)
  let editedJoke
  let deletedJokeId

  await act(async () => {
    root.render(
      React.createElement(JokeCard, {
        joke,
        currentUserId: user.id,
        onEdit(selectedJoke) {
          editedJoke = selectedJoke
        },
        onDelete(jokeId) {
          deletedJokeId = jokeId
        },
      }),
    )
  })

  await click(buttonByText(container, 'Редактировать'))
  await click(buttonByText(container, 'Удалить'))

  assert.deepEqual(editedJoke, joke)
  assert.equal(deletedJokeId, joke.id)
})

test('Login submits login and signup forms', async (t) => {
  const { container, root } = await setupDom(t)
  let loginArgs
  let signupArgs
  const context = createContext({
    currentUser: null,
    isAuthenticated: false,
    async login(email, password) {
      loginArgs = [email, password]
    },
    async signup(payload) {
      signupArgs = payload
    },
  })

  await renderWithContext(root, React.createElement(Login), context, '/login')
  await setFieldValue(container.querySelector('input[type="email"]'), 'marina@example.com')
  await setFieldValue(container.querySelector('input[type="password"]'), 'secret1')
  await submit(container.querySelector('form'))

  await click(buttonByText(container, 'Регистрация'))
  await setFieldValue(container.querySelector('input:not([type])'), 'Саша')
  await setFieldValue(container.querySelector('input[type="email"]'), 'sasha@example.com')
  await setFieldValue(container.querySelector('input[type="password"]'), 'secret2')
  await submit(container.querySelector('form'))

  assert.deepEqual(loginArgs, ['marina@example.com', 'secret1'])
  assert.deepEqual(signupArgs, { name: 'Саша', email: 'sasha@example.com', password: 'secret2' })
})

test('Login renders authorization errors', async (t) => {
  const { container, root } = await setupDom(t)
  const context = createContext({
    currentUser: null,
    isAuthenticated: false,
    async login() {
      throw new Error('Неверный пароль')
    },
  })

  await renderWithContext(root, React.createElement(Login), context, '/login')
  await setFieldValue(container.querySelector('input[type="email"]'), 'marina@example.com')
  await setFieldValue(container.querySelector('input[type="password"]'), 'wrong-password')
  await submit(container.querySelector('form'))

  assert.match(container.textContent, /Неверный пароль/)
})

test('Profile handles create, edit and delete actions', async (t) => {
  const { container, root } = await setupDom(t)
  const calls = []
  const context = createContext({
    async addJoke(content) {
      calls.push(['add', content])
    },
    async updateJoke(jokeId, content) {
      calls.push(['update', jokeId, content])
    },
    async deleteJoke(jokeId) {
      calls.push(['delete', jokeId])
    },
  })

  await renderWithContext(root, React.createElement(Profile), context, '/profile')
  await setFieldValue(container.querySelector('textarea'), 'Новый анекдот')
  await submit(container.querySelector('form'))

  await click(buttonByText(container, 'Редактировать'))
  await setFieldValue(container.querySelectorAll('textarea')[1], 'Обновленный анекдот')
  await submit(container.querySelectorAll('form')[1])

  window.confirm = () => false
  await click(buttonByText(container, 'Удалить'))

  window.confirm = () => true
  await click(buttonByText(container, 'Редактировать'))
  await click(buttonByText(container, 'Удалить'))

  assert.deepEqual(calls, [
    ['add', 'Новый анекдот'],
    ['update', joke.id, 'Обновленный анекдот'],
    ['delete', joke.id],
  ])
})
