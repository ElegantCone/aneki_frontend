import React from 'react'
import {createRoot} from 'react-dom/client'
import {BrowserRouter, Route, Routes} from 'react-router-dom'
import App from './App.jsx'
import Login from './pages/Login.jsx'
import HomePage from './pages/HomePage.jsx'
import Profile from './pages/Profile.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import {AnekiProvider} from './context/AnekiContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <AnekiProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<App/>}/>
                    <Route path="/login" element={<Login/>}/>
                    <Route
                        path="/feed"
                        element={
                            <ProtectedRoute>
                                <HomePage/>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <Profile/>
                            </ProtectedRoute>
                        }
                    />
                    <Route path="*" element={<NotFoundPage/>}/>
                </Routes>
            </BrowserRouter>
        </AnekiProvider>
    </React.StrictMode>,
)
