import {Link} from 'react-router-dom'

export default function NotFoundPage() {
    return (
        <main className="landing-shell">
            <section className="landing-card">
                <div className="badge">404</div>
                <h1>Страница не найдена</h1>
                <div className="landing-actions">
                    <Link to="/" className="btn btn-primary">
                        На главную
                    </Link>
                    <Link to="/feed" className="btn btn-secondary">
                        Лента
                    </Link>
                </div>
            </section>
        </main>
    )
}
