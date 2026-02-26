import {NavLink, useNavigate} from 'react-router-dom'
import {useAneki} from '../context/AnekiContext.jsx'

export default function NavigationBar() {
    const navigate = useNavigate()
    const {currentUser, logout} = useAneki()

    return (
        <header className="topbar">
            <div className="topbar-inner">
                <button type="button" className="brand" onClick={() => navigate('/feed')}>
                    <span className="brand-dot"/>
                    <span>ANEKI</span>
                </button>

                <nav className="nav-links" aria-label="Основная навигация">
                    <NavLink to="/feed" className={({isActive}) => (isActive ? 'nav-link active' : 'nav-link')}>
                        Лента
                    </NavLink>
                    <NavLink
                        to="/profile"
                        className={({isActive}) => (isActive ? 'nav-link active' : 'nav-link')}
                    >
                        Профиль
                    </NavLink>
                </nav>

                <div className="user-area">
                    <div className="user-pill">
                        <span>{currentUser?.name}</span>
                    </div>
                    <button
                        className="btn btn-secondary"
                        type="button"
                        onClick={async () => {
                            await logout()
                            navigate('/login')
                        }}
                    >
                        Выйти
                    </button>
                </div>
            </div>
        </header>
    )
}
