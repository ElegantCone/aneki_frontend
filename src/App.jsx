import {Link, useNavigate} from 'react-router-dom'
import {useAneki} from './context/AnekiContext.jsx'

function App() {
    const navigate = useNavigate()
    const {isAuthenticated} = useAneki()

    return (
        <main className="landing-shell">
            <section className="landing-card">
                <div className="badge">aneki</div>
                <h1>Публикуйте анекдоты и собирайте свою ленту юмора</h1>
                <p>
                    В приложении есть логин, общая лента анекдотов пользователей и профиль с созданием,
                    редактированием и удалением своих публикаций.
                </p>
                <div className="landing-actions">
                    <button className="btn btn-primary" onClick={() => navigate(isAuthenticated ? '/feed' : '/login')}>
                        {isAuthenticated ? 'Открыть ленту' : 'Войти'}
                    </button>
                    <Link className="btn btn-secondary" to={isAuthenticated ? '/profile' : '/login'}>
                        {isAuthenticated ? 'Мой профиль' : 'Регистрация'}
                    </Link>
                </div>
            </section>
        </main>
    )
}

export default App
