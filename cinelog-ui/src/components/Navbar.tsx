import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
    onLoginClick: () => void;
    onRegisterClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onLoginClick, onRegisterClick }) => {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        setIsProfileMenuOpen(false);
        navigate('/');
    };

    const handleProfileClick = () => {
        setIsProfileMenuOpen(false);
        navigate('/profile');
    };

    return (
        <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">

                    {/* Logo/Brand */}
                    <div className="flex items-center">
                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center space-x-2 text-white hover:text-blue-400 transition-colors"
                        >
                            <div className="text-2xl">🎬</div>
                            <span className="text-xl font-bold">CineLog</span>
                        </button>
                    </div>

                    {/* Navigation Links */}
                    <div className="hidden md:block">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate('/')}
                                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                                Home
                            </button>
                            {/* Add more nav links here later */}
                        </div>
                    </div>

                    {/* Right side - Auth/Profile */}
                    <div className="flex items-center space-x-4">
                        {isAuthenticated ? (
                            /* Logged in user menu */
                            <div className="relative">
                                <button
                                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                    className="flex items-center space-x-2 text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                        <span className="text-white font-semibold text-sm">
                                            {user?.firstName?.[0] || user?.username?.[0] || '?'}
                                        </span>
                                    </div>
                                    <span className="hidden sm:block">{user?.firstName || user?.username}</span>
                                    <svg
                                        className={`w-4 h-4 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Dropdown Menu */}
                                {isProfileMenuOpen && (
                                    <>
                                        {/* Backdrop to close menu */}
                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={() => setIsProfileMenuOpen(false)}
                                        />

                                        {/* Menu */}
                                        <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-md shadow-lg py-1 z-20">
                                            {/* User info */}
                                            <div className="px-4 py-2 border-b border-gray-600">
                                                <p className="text-sm font-medium text-white">{user?.firstName || user?.username}</p>
                                                <p className="text-xs text-gray-400">{user?.email}</p>
                                                {!user?.isEmailVerified && (
                                                    <p className="text-xs text-yellow-400 mt-1">⚠️ Email not verified</p>
                                                )}
                                            </div>

                                            {/* Menu items */}
                                            <button
                                                onClick={handleProfileClick}
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-600 transition-colors"
                                            >
                                                👤 My Profile
                                            </button>

                                            <button
                                                onClick={handleProfileClick}
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-600 transition-colors"
                                            >
                                                ⭐ My Ratings
                                            </button>

                                            <div className="border-t border-gray-600 mt-1">
                                                <button
                                                    onClick={handleLogout}
                                                    className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-600 transition-colors"
                                                >
                                                    🚪 Logout
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            /* Not logged in - show login/register buttons */
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={onLoginClick}
                                    className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    Login
                                </button>
                                <button
                                    onClick={onRegisterClick}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    Sign Up
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;