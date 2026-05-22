import test from 'node:test'
import assert from 'node:assert/strict'
import React from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { Window } from 'happy-dom'
import { appApi } from '../src/api/index.js'
import { AnekiProvider } from '../src/context/AnekiContext.jsx'
import { useAneki } from '../src/context/anekiContext.js'

const user = { id: 'u1', name: 'Марина', email: 'marina@example.com' }
const loginUser = { id: 'u2', name: 'Павел', email: 'pavel@example.com' }
const signupUser = { id: 'u3', name: 'Саша', email: 'sasha@example.com' }

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

function createJoke(id, userId = user.id, content = `Анекдот ${id}`) {
  return {
    id,
    userId,
    userName: userId === user.id ? user.name : signupUser.name,
    content,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}

function replaceAppApi(overrides) {
  const original = {}

  for (const [key, value] of Object.entries(overrides)) {
    original[key] = appApi[key]
    appApi[key] = value
  }

  return () => {
    for (const [key, value] of Object.entries(original)) {
      appApi[key] = value
    }
  }
}

function defineGlobal(name, value) {
  Object.defineProperty(globalThis, name, {
    configurable: true,
    writable: true,
    value,
  })
}

function setupDom(t) {
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

async function settleEffects() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0))
  })
}

function renderProvider(root, onContext) {
  function Probe() {
    const context = useAneki()
    onContext(context)
    return React.createElement('span', null, context.isBootstrapping ? 'loading' : context.currentUser?.name ?? 'anon')
  }

  return act(async () => {
    root.render(React.createElement(AnekiProvider, null, React.createElement(Probe)))
  })
}

test('AnekiProvider bootstraps session and exposes state actions', async (t) => {
  const { container, root } = setupDom(t)
  const initialJoke = createJoke('j1')
  const loginJoke = createJoke('j2', loginUser.id)
  const signupJoke = createJoke('j3', signupUser.id)
  const reloadJoke = createJoke('j4', signupUser.id)
  const addedJoke = createJoke('j5', signupUser.id, 'Новый анекдот')
  const updatedJoke = { ...reloadJoke, content: 'Обновленный анекдот' }
  const calls = []
  const feedQueue = [[initialJoke], [loginJoke], [signupJoke], [reloadJoke]]
  let latestContext

  const restoreApi = replaceAppApi({
    async session() {
      calls.push(['session'])
      return { currentUser: user, token: 'initial-token' }
    },
    async getFeed() {
      calls.push(['getFeed'])
      return feedQueue.shift() ?? []
    },
    async login(payload) {
      calls.push(['login', payload])
      return { user: loginUser, token: 'login-token' }
    },
    async signup(payload) {
      calls.push(['signup', payload])
      return { user: signupUser, token: 'signup-token' }
    },
    async logout(payload) {
      calls.push(['logout', payload])
      return { ok: true }
    },
    async createJoke(payload) {
      calls.push(['createJoke', payload])
      return addedJoke
    },
    async updateJoke(payload) {
      calls.push(['updateJoke', payload])
      return updatedJoke
    },
    async deleteJoke(payload) {
      calls.push(['deleteJoke', payload])
      return { ok: true }
    },
  })
  t.after(restoreApi)

  await renderProvider(root, (context) => {
    latestContext = context
  })
  await settleEffects()

  assert.equal(container.textContent, user.name)
  assert.equal(latestContext.isBootstrapping, false)
  assert.equal(latestContext.isAuthenticated, true)
  assert.deepEqual(latestContext.feed, [initialJoke])
  assert.deepEqual(latestContext.getUserJokes(user.id), [initialJoke])

  await act(async () => {
    assert.deepEqual(await latestContext.login('pavel@example.com', 'secret'), loginUser)
  })
  assert.equal(latestContext.currentUser.id, loginUser.id)
  assert.deepEqual(latestContext.feed, [loginJoke])

  await act(async () => {
    assert.deepEqual(
      await latestContext.signup({ name: 'Саша', email: 'sasha@example.com', password: 'secret' }),
      signupUser,
    )
  })
  assert.equal(latestContext.currentUser.id, signupUser.id)
  assert.deepEqual(latestContext.feed, [signupJoke])

  await act(async () => {
    assert.deepEqual(await latestContext.reloadFeed(), [reloadJoke])
  })
  assert.deepEqual(latestContext.feed, [reloadJoke])

  await act(async () => {
    assert.deepEqual(await latestContext.addJoke('Новый анекдот'), addedJoke)
  })
  assert.deepEqual(latestContext.feed, [addedJoke, reloadJoke])

  await act(async () => {
    assert.deepEqual(await latestContext.updateJoke(reloadJoke.id, 'Обновленный анекдот'), updatedJoke)
  })
  assert.deepEqual(latestContext.feed, [addedJoke, updatedJoke])

  await act(async () => {
    await latestContext.deleteJoke(addedJoke.id)
  })
  assert.deepEqual(latestContext.feed, [updatedJoke])

  await act(async () => {
    await latestContext.logout()
  })
  assert.equal(latestContext.currentUser, null)
  assert.equal(latestContext.token, null)
  assert.deepEqual(latestContext.feed, [])

  assert.deepEqual(calls, [
    ['session'],
    ['getFeed'],
    ['login', { email: 'pavel@example.com', password: 'secret' }],
    ['getFeed'],
    ['signup', { name: 'Саша', email: 'sasha@example.com', password: 'secret' }],
    ['getFeed'],
    ['getFeed'],
    ['createJoke', { content: 'Новый анекдот', token: 'signup-token' }],
    ['updateJoke', { jokeId: reloadJoke.id, content: 'Обновленный анекдот', token: 'signup-token' }],
    ['deleteJoke', { jokeId: addedJoke.id, token: 'signup-token' }],
    ['logout', { token: 'signup-token' }],
  ])
})

test('AnekiProvider handles anonymous session', async (t) => {
  const { container, root } = setupDom(t)
  let latestContext
  const restoreApi = replaceAppApi({
    async session() {
      return { currentUser: null, token: null }
    },
    async getFeed() {
      throw new Error('getFeed should not run for anonymous sessions')
    },
  })
  t.after(restoreApi)

  await renderProvider(root, (context) => {
    latestContext = context
  })
  await settleEffects()

  assert.equal(container.textContent, 'anon')
  assert.equal(latestContext.isAuthenticated, false)
  assert.equal(latestContext.isBootstrapping, false)
  assert.deepEqual(latestContext.feed, [])
})

test('AnekiProvider clears state when bootstrap fails', async (t) => {
  const { root } = setupDom(t)
  let latestContext
  const restoreApi = replaceAppApi({
    async session() {
      throw new Error('session failed')
    },
    async getFeed() {
      throw new Error('getFeed should not run after failed session')
    },
  })
  t.after(restoreApi)

  await renderProvider(root, (context) => {
    latestContext = context
  })
  await settleEffects()

  assert.equal(latestContext.currentUser, null)
  assert.equal(latestContext.token, null)
  assert.equal(latestContext.isBootstrapping, false)
  assert.deepEqual(latestContext.feed, [])
})
