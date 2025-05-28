import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import OAuthCallback from './pages/OAuthCallback';
import ProfilePage from './pages/ProfilePage';
import ProfileGeneration from './pages/ProfileGeneration'; // ADDED: Missing import

function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth/callback" element={<OAuthCallback />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/generate" element={<ProfileGeneration />} /> {/* ADDED: Missing route */}
        </Routes>
    );
}

export default App;
