# Backend API Contract (ANEKI Frontend)

- JSON для всех запросов/ответов
- Ошибки: HTTP status `4xx/5xx` + JSON с полем `message`
- Авторизация: `Authorization: Bearer <token>`

## Auth

### `POST /auth/login`

Request:

```json
{
  "email": "user@example.com",
  "password": "secret"
}
```

Response:

```json
{
  "token": "jwt-token",
  "user": {
    "id": "u_123",
    "name": "Анна",
    "email": "user@example.com"
  }
}
```

### `POST /auth/signup`

Request:

```json
{
  "name": "Анна",
  "email": "user@example.com",
  "password": "secret"
}
```

Response:

```json
{
  "token": "jwt-or-access-token",
  "user": {
    "id": "u_123",
    "name": "Анна",
    "email": "user@example.com"
  }
}
```

### `GET /auth/me`

Response:

```json
{
  "user": {
    "id": "u_123",
    "name": "Анна",
    "email": "user@example.com"
  }
}
```

## Jokes

### Joke

```json
{
  "id": "j_123",
  "userId": "u_123",
  "content": "Текст анекдота",
  "createdAt": 1730000000000,
  "updatedAt": 1730000000000
}
```
### `GET /jokes`

Response:

```json
{
  "jokes": [
    {
      "id": "j_123",
      "userId": "u_123",
      "username": "Анна",
      "content": "Текст анекдота",
      "createdAt": 1730000000000,
      "updatedAt": 1730000000000
    }
  ]
}
```

### `POST /jokes`

Request:

```json
{
  "content": "Текст анекдота"
}
```

Response:

```json
{
  "joke": {
    "id": "j_123",
    "userId": "u_123",
    "username": "Анна",
    "content": "Текст анекдота",
    "createdAt": 1730000000000,
    "updatedAt": 1730000000000
  }
}
```

### `PUT /jokes/:id`

Request:

```json
{
  "content": "Обновленный текст анекдота"
}
```

Response:

```json
{
  "joke": {
    "id": "j_123",
    "userId": "u_123",
    "username": "Анна",
    "content": "Обновленный текст анекдота",
    "createdAt": 1730000000000,
    "updatedAt": 1730000100000
  }
}
```

### `DELETE /jokes/:id`

Response:

```json
{
  "ok": true
}
```