// App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import OAuthCallback from './pages/OAuthCallback';
import ProfilePage from './pages/ProfilePage';
import ProfileGeneration from './pages/ProfileGeneration';
import ViewUserProfilePage from './pages/ViewUserProfilePage';
// --- NEW IMPORTS ---
import JobBoardPage from './pages/JobBoardPage';
import CvMatcherPage from './pages/CvMatcherPage';

function App() {
    return (
        <Routes>
            {/* Existing Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/auth/callback" element={<OAuthCallback />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/view/:userId" element={<ViewUserProfilePage />} />
            <Route path="/generate" element={<ProfileGeneration />} />

            {/* --- NEW ROUTES --- */}
            <Route path="/jobs" element={<JobBoardPage />} />
            <Route path="/matcher" element={<CvMatcherPage />} />
        </Routes>
    );
}

export default App;
