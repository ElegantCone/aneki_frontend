import React from 'react'
import {Navigate} from 'react-router-dom'
import {useAneki} from '../context/anekiContext.js'

export default function ProtectedRoute({children}) {
    const {isAuthenticated, isBootstrapping} = useAneki()

    if (isBootstrapping) {
        return null
    }

    return isAuthenticated ? children : <Navigate to="/login" replace/>
}
