import NavigationBar from '../components/NavigationBar.jsx'
import JokeCard from '../components/JokeCard.jsx'
import {useAneki} from '../context/AnekiContext.jsx'

export default function HomePage() {
    const {currentUser, feed} = useAneki()

    return (
        <div className="page-shell">
            <NavigationBar/>

            <main className="page-content">
                <section className="cards-column">
                    {feed.map((joke) => (
                        <JokeCard key={joke.id} joke={joke} currentUserId={currentUser?.id}/>
                    ))}
                    {!feed.length ? (
                        <div className="empty-card">Здесь пусто :( Будь первым!</div>
                    ) : null}
                </section>
            </main>
        </div>
    )
}
