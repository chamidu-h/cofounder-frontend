import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import OAuthCallback from './pages/OAuthCallback';
import ProfilePage from './pages/ProfilePage';
import ProfileGeneration from './pages/ProfileGeneration'; // ADDED: Missing import
import ViewUserProfilePage from './pages/ViewUserProfilePage';

function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth/callback" element={<OAuthCallback />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/view/:userId" element={<ViewUserProfilePage />} /> {/* New route */}
            <Route path="/generate" element={<ProfileGeneration />} /> {/* ADDED: Missing route */}
        </Routes>
    );
}

export default App;
