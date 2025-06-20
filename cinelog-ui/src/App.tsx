import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import MovieDetailsPage from './pages/MovieDetailsPage';
import TvDetailsPage from './pages/TvDetailsPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import './index.css';

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="App">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/:type/:id" element={<MovieDetailsPage />} />
                        <Route path="/tv/:id" element={<TvDetailsPage />} />
                        <Route path="/verify-email" element={<VerifyEmailPage />} />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;