import {useMemo, useState} from 'react'
import NavigationBar from '../components/NavigationBar.jsx'
import JokeCard from '../components/JokeCard.jsx'
import {useAneki} from '../context/AnekiContext.jsx'

export default function Profile() {
    const {currentUser, getUserJokes, addJoke, updateJoke, deleteJoke} = useAneki()
    const [draft, setDraft] = useState('')
    const [editingId, setEditingId] = useState(null)
    const [editingText, setEditingText] = useState('')
    const [error, setError] = useState('')

    const myJokes = useMemo(() => getUserJokes(currentUser.id), [currentUser.id, getUserJokes])

    async function handleCreate(event) {
        event.preventDefault()
        setError('')
        try {
            await addJoke(draft)
            setDraft('')
        } catch (err) {
            setError(err.message || 'Не удалось создать анекдот')
        }
    }

    function startEdit(joke) {
        setEditingId(joke.id)
        setEditingText(joke.content)
        setError('')
    }

    async function handleSaveEdit(event) {
        event.preventDefault()
        if (!editingId) return

        setError('')
        try {
            await updateJoke(editingId, editingText)
            setEditingId(null)
            setEditingText('')
        } catch (err) {
            setError(err.message || 'Не удалось обновить анекдот')
        }
    }

    async function handleDelete(jokeId) {
        const confirmed = window.confirm('Удалить анекдот?')
        if (!confirmed) return

        setError('')
        try {
            await deleteJoke(jokeId)
            if (editingId === jokeId) {
                setEditingId(null)
                setEditingText('')
            }
        } catch (err) {
            setError(err.message || 'Не удалось удалить анекдот')
        }
    }

    return (
        <div className="page-shell">
            <NavigationBar/>

            <main className="page-content page-grid">
                <section className="profile-card">
                    <div>
                        <h2>{currentUser.name}</h2>
                        <p>{currentUser.email}</p>
                        <p>Общий вклад в анекдотовое сообщество: {myJokes.length}</p>
                    </div>
                </section>

                <section className="editor-card">
                    <h3>Новый анекдот</h3>
                    <form className="form-stack" onSubmit={handleCreate}>
                        <label>
                            Текст
                            <textarea
                                rows={4}
                                value={draft}
                                onChange={(event) => setDraft(event.target.value)}
                                placeholder="Напишите анекдот..."
                                required
                            />
                        </label>
                        {error ? <div className="form-error">{error}</div> : null}
                        <button className="btn btn-primary" type="submit">
                            Опубликовать
                        </button>
                    </form>
                </section>

                {editingId ? (
                    <section className="editor-card">
                        <h3>Редактирование</h3>
                        <form className="form-stack" onSubmit={handleSaveEdit}>
                            <label>
                                Текст
                                <textarea
                                    rows={4}
                                    value={editingText}
                                    onChange={(event) => setEditingText(event.target.value)}
                                    required
                                />
                            </label>
                            <div className="row-actions">
                                <button className="btn btn-primary" type="submit">
                                    Сохранить
                                </button>
                                <button
                                    className="btn btn-secondary"
                                    type="button"
                                    onClick={() => {
                                        setEditingId(null)
                                        setEditingText('')
                                    }}
                                >
                                    Отмена
                                </button>
                            </div>
                        </form>
                    </section>
                ) : null}

                <section className="cards-column">
                    <div className="section-title">
                        <h3>Мои публикации</h3>
                        <span>{myJokes.length}</span>
                    </div>

                    {myJokes.map((joke) => (
                        <JokeCard
                            key={joke.id}
                            joke={joke}
                            currentUserId={currentUser.id}
                            onEdit={startEdit}
                            onDelete={handleDelete}
                        />
                    ))}

                    {!myJokes.length ? (
                        <div className="empty-card">
                            Пока пусто. Добавьте первый анекдот, и он сразу появится в ленте.
                        </div>
                    ) : null}
                </section>
            </main>
        </div>
    )
}
