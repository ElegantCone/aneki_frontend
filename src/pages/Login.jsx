import {useState} from 'react'
import {Navigate, useNavigate} from 'react-router-dom'
import {useAneki} from '../context/AnekiContext.jsx'

export default function Login() {
    const navigate = useNavigate()
    const {isAuthenticated, isBootstrapping, login, signup} = useAneki()
    const [mode, setMode] = useState('login')
    const [form, setForm] = useState({name: '', email: '', password: ''})
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    if (isBootstrapping) {
        return null
    }

    if (isAuthenticated) {
        return <Navigate to="/feed" replace/>
    }

    const isSignup = mode === 'signup'

    function updateField(field, value) {
        setForm((prev) => ({...prev, [field]: value}))
    }

    async function handleSubmit(event) {
        event.preventDefault()
        setError('')
        setLoading(true)

        try {
            if (isSignup) {
                await signup(form)
            } else {
                await login(form.email, form.password)
            }

            navigate('/feed')
        } catch (err) {
            setError(err.message || 'Ошибка авторизации')
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="auth-shell">
            <section className="auth-panel">
                <div className="auth-header">
                    <div className="badge">aneki</div>
                    <h1>{isSignup ? 'Создать аккаунт' : 'Войти в аккаунт'}</h1>
                    <p>
                        {isSignup
                            ? 'Зарегистрируйтесь, чтобы публиковать анекдоты и редактировать свои записи.'
                            : 'Войдите, чтобы открыть ленту и профиль с вашими анекдотами.'}
                    </p>
                </div>

                <div className="segmented">
                    <button
                        className={mode === 'login' ? 'is-active' : ''}
                        type="button"
                        onClick={() => {
                            setMode('login')
                            setError('')
                        }}
                    >
                        Логин
                    </button>
                    <button
                        className={mode === 'signup' ? 'is-active' : ''}
                        type="button"
                        onClick={() => {
                            setMode('signup')
                            setError('')
                        }}
                    >
                        Регистрация
                    </button>
                </div>

                <form className="form-stack" onSubmit={handleSubmit}>
                    {isSignup && (
                        <label>
                            Имя
                            <input
                                value={form.name}
                                onChange={(event) => updateField('name', event.target.value)}
                                placeholder="Например, Иван"
                                required
                            />
                        </label>
                    )}

                    <label>
                        Email
                        <input
                            type="email"
                            value={form.email}
                            onChange={(event) => updateField('email', event.target.value)}
                            placeholder="you@example.com"
                            required
                        />
                    </label>

                    <label>
                        Пароль
                        <input
                            type="password"
                            value={form.password}
                            onChange={(event) => updateField('password', event.target.value)}
                            placeholder="Минимум 6 символов"
                            minLength={6}
                            required
                        />
                    </label>

                    {error ? <div className="form-error">{error}</div> : null}

                    <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
                        {loading ? 'Подождите...' : isSignup ? 'Создать аккаунт' : 'Войти'}
                    </button>
                </form>
            </section>
        </main>
    )
}
