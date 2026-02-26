import {BrowserRouter, Route, Routes} from 'react-router-dom'
import App from '../App.jsx'
import Login from '../pages/Login.jsx'
import HomePage from '../pages/HomePage.jsx'
import Profile from '../pages/Profile.jsx'
import NotFoundPage from '../pages/NotFoundPage.jsx'

function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<App/>}/>
                <Route path="/login" element={<Login/>}/>
                <Route path="/feed" element={<HomePage/>}/>
                <Route path="/profile" element={<Profile/>}/>
                <Route path="*" element={<NotFoundPage/>}/>
            </Routes>
        </BrowserRouter>
    )
}
