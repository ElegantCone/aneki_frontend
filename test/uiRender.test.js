import test from 'node:test'
import assert from 'node:assert/strict'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import App from '../src/App.jsx'
import JokeCard from '../src/components/JokeCard.jsx'
import NavigationBar from '../src/components/NavigationBar.jsx'
import ProtectedRoute from '../src/components/ProtectedRoute.jsx'
import { AnekiContext, useAneki } from '../src/context/anekiContext.js'
import HomePage from '../src/pages/HomePage.jsx'
import Login from '../src/pages/Login.jsx'
import NotFoundPage from '../src/pages/NotFoundPage.jsx'
import Profile from '../src/pages/Profile.jsx'

const user = { id: 'u1', name: 'Марина', email: 'marina@example.com' }
const joke = {
  id: 'j1',
  userId: 'u1',
  username: 'Марина',
  content: 'Тестовый анекдот',
  createdAt: Date.now() - 1000,
  updatedAt: Date.now() - 1000,
}

function createContextValue(overrides = {}) {
  return {
    currentUser: user,
    token: 'token',
    feed: [joke],
    isBootstrapping: false,
    isAuthenticated: true,
    async login() {
      return user
    },
    async signup() {
      return user
    },
    async logout() {},
    async reloadFeed() {
      return [joke]
    },
    getUserJokes() {
      return [joke]
    },
    async addJoke() {
      return joke
    },
    async updateJoke() {
      return joke
    },
    async deleteJoke() {},
    ...overrides,
  }
}

function renderWithContext(element, context = createContextValue(), route = '/') {
  return renderToStaticMarkup(
    React.createElement(
      AnekiContext.Provider,
      { value: context },
      React.createElement(MemoryRouter, { initialEntries: [route] }, element),
    ),
  )
}

test('useAneki returns context value and rejects missing provider', () => {
  function Probe() {
    const context = useAneki()
    return React.createElement('span', null, context.currentUser.name)
  }

  assert.equal(renderWithContext(React.createElement(Probe)), '<span>Марина</span>')
  assert.throws(() => renderToStaticMarkup(React.createElement(Probe)), /useAneki must be used within AnekiProvider/)
})

test('App renders authenticated and anonymous landing actions', () => {
  const authenticated = renderWithContext(React.createElement(App))
  const anonymous = renderWithContext(
    React.createElement(App),
    createContextValue({ currentUser: null, isAuthenticated: false }),
  )

  assert.match(authenticated, /Открыть ленту/)
  assert.match(authenticated, /Мой профиль/)
  assert.match(anonymous, /Войти/)
  assert.match(anonymous, /Регистрация/)
})

test('JokeCard renders author, content and owner actions', () => {
  const ownerHtml = renderToStaticMarkup(
    React.createElement(JokeCard, {
      joke,
      currentUserId: 'u1',
      onEdit() {},
      onDelete() {},
    }),
  )
  const guestHtml = renderToStaticMarkup(React.createElement(JokeCard, { joke, currentUserId: 'u2' }))

  assert.match(ownerHtml, /Марина/)
  assert.match(ownerHtml, /Тестовый анекдот/)
  assert.match(ownerHtml, /Редактировать/)
  assert.match(ownerHtml, /Удалить/)
  assert.doesNotMatch(guestHtml, /Редактировать/)
})

test('NavigationBar renders links and current user', () => {
  const html = renderWithContext(React.createElement(NavigationBar))

  assert.match(html, /ANEKI/)
  assert.match(html, /Лента/)
  assert.match(html, /Профиль/)
  assert.match(html, /Марина/)
  assert.match(html, /Выйти/)
})

test('ProtectedRoute handles authenticated, anonymous and bootstrapping states', () => {
  const child = React.createElement('strong', null, 'secret')
  const authenticated = renderWithContext(React.createElement(ProtectedRoute, null, child))
  const anonymous = renderWithContext(
    React.createElement(ProtectedRoute, null, child),
    createContextValue({ currentUser: null, isAuthenticated: false }),
  )
  const bootstrapping = renderWithContext(
    React.createElement(ProtectedRoute, null, child),
    createContextValue({ isBootstrapping: true }),
  )

  assert.match(authenticated, /secret/)
  assert.doesNotMatch(anonymous, /secret/)
  assert.equal(bootstrapping, '')
})

test('Login renders form, bootstrapping state and authenticated redirect', () => {
  const anonymous = renderWithContext(
    React.createElement(Login),
    createContextValue({ currentUser: null, isAuthenticated: false }),
  )
  const bootstrapping = renderWithContext(React.createElement(Login), createContextValue({ isBootstrapping: true }))
  const authenticated = renderWithContext(React.createElement(Login))

  assert.match(anonymous, /Войти в аккаунт/)
  assert.match(anonymous, /Email/)
  assert.match(anonymous, /Пароль/)
  assert.equal(bootstrapping, '')
  assert.equal(authenticated, '')
})

test('HomePage renders feed and empty state', () => {
  const feedHtml = renderWithContext(React.createElement(HomePage))
  const emptyHtml = renderWithContext(React.createElement(HomePage), createContextValue({ feed: [] }))

  assert.match(feedHtml, /Тестовый анекдот/)
  assert.match(emptyHtml, /Здесь пусто/)
})

test('Profile renders user details, editor and own jokes', () => {
  const html = renderWithContext(React.createElement(Profile))
  const emptyHtml = renderWithContext(
    React.createElement(Profile),
    createContextValue({
      getUserJokes() {
        return []
      },
    }),
  )

  assert.match(html, /marina@example.com/)
  assert.match(html, /Новый анекдот/)
  assert.match(html, /Мои публикации/)
  assert.match(html, /Тестовый анекдот/)
  assert.match(emptyHtml, /Пока пусто/)
})

test('NotFoundPage renders fallback links', () => {
  const html = renderWithContext(React.createElement(NotFoundPage))

  assert.match(html, /404/)
  assert.match(html, /Страница не найдена/)
  assert.match(html, /На главную/)
  assert.match(html, /Лента/)
})
