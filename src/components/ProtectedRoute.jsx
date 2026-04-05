import {Navigate} from 'react-router-dom'
import {useAneki} from '../context/AnekiContext.jsx'

export default function ProtectedRoute({children}) {
    const {isAuthenticated, isBootstrapping} = useAneki()

    if (isBootstrapping) {
        return null
    }

    return isAuthenticated ? children : <Navigate to="/login" replace/>
}
