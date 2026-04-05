import {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react'
import {appApi} from '../api/index.js'

const AnekiContext = createContext(null)

export function AnekiProvider({children}) {
    const [currentUser, setCurrentUser] = useState(null)
    const [token, setToken] = useState(null)
    const [feed, setFeed] = useState([])
    const [isBootstrapping, setIsBootstrapping] = useState(true)

    const refreshFeed = useCallback(async () => {
        const items = await appApi.getFeed()
        setFeed(Array.isArray(items) ? items : [])
        return items
    }, [])

    useEffect(() => {
        let cancelled = false

        async function bootstrap() {
            try {
                const session = await appApi.session()
                if (cancelled) return

                setCurrentUser(session.currentUser ?? null)
                setToken(session.token ?? null)

                if (session.currentUser) {
                    await refreshFeed()
                } else {
                    setFeed([])
                }
            } catch {
                if (!cancelled) {
                    setCurrentUser(null)
                    setToken(null)
                    setFeed([])
                }
            } finally {
                if (!cancelled) {
                    setIsBootstrapping(false)
                }
            }
        }

        bootstrap()

        return () => {
            cancelled = true
        }
    }, [refreshFeed])

    const value = useMemo(() => {
        return {
            currentUser,
            token,
            feed,
            isBootstrapping,
            isAuthenticated: Boolean(currentUser),
            async login(email, password) {
                const result = await appApi.login({email, password})
                setCurrentUser(result.user ?? null)
                setToken(result.token ?? null)
                await refreshFeed()
                return result.user
            },
            async signup({name, email, password}) {
                const result = await appApi.signup({name, email, password})
                setCurrentUser(result.user ?? null)
                setToken(result.token ?? null)
                await refreshFeed()
                return result.user
            },
            async logout() {
                await appApi.logout({token})
                setCurrentUser(null)
                setToken(null)
                setFeed([])
            },
            async reloadFeed() {
                return refreshFeed()
            },
            getUserJokes(userId) {
                return feed.filter((joke) => joke.userId === userId)
            },
            async addJoke(content) {
                const joke = await appApi.createJoke({content, token})
                setFeed((prev) => [joke, ...prev])
                return joke
            },
            async updateJoke(jokeId, content) {
                const updated = await appApi.updateJoke({jokeId, content, token})
                setFeed((prev) => prev.map((joke) => (joke.id === updated.id ? updated : joke)))
                return updated
            },
            async deleteJoke(jokeId) {
                await appApi.deleteJoke({jokeId, token})
                setFeed((prev) => prev.filter((joke) => joke.id !== jokeId))
            },
        }
    }, [currentUser, feed, isBootstrapping, refreshFeed, token])

    return <AnekiContext.Provider value={value}>{children}</AnekiContext.Provider>
}

export function useAneki() {
    const context = useContext(AnekiContext)
    if (!context) {
        throw new Error('useAneki must be used within AnekiProvider')
    }
    return context
}
