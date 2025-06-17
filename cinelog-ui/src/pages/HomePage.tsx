import React, { useState, useEffect } from 'react';
import { moviesApi } from '../services/api';
import MovieCard from '../components/MovieCard';
import AuthModal from '../components/AuthModal';
import RatingModal from '../components/RatingModal';
import EmailVerificationBanner from '../components/EmailVerificationBanner';
import Navbar from '../components/Navbar';
import type { Movie } from '../types/api';
import { useAuth } from '../context/AuthContext';

const HomePage: React.FC = () => {
    const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Movie[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
    const [ratingModalOpen, setRatingModalOpen] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
    const [searchType, setSearchType] = useState<'movie' | 'tv'>('movie');
    const [trendingType, setTrendingType] = useState<'movie' | 'tv'>('movie');
    const { isAuthenticated, user } = useAuth();

    // Reload trending when type changes
    useEffect(() => {
        loadTrendingMovies();
    }, [trendingType]);

    const loadTrendingMovies = async () => {
        try {
            setIsLoading(true);
            setError(null);
            console.log(`Loading trending ${trendingType}s...`);

            const response = await moviesApi.getTrending('week', trendingType);
            console.log(`Trending ${trendingType}s response:`, response.data);

            const movies = response.data.results || response.data || [];
            setTrendingMovies(movies);

            if (movies.length === 0) {
                setError(`No trending ${trendingType}s found. Check if your backend is running on http://localhost:5003`);
            }
        } catch (error) {
            console.error(`Error loading trending ${trendingType}s:`, error);
            setError(`Failed to load trending ${trendingType}s: ${error.response?.data?.message || error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        try {
            setIsSearching(true);
            setError(null);
            console.log(`Searching for ${searchType}s:`, searchQuery);

            const response = await moviesApi.search(searchQuery, 1, searchType);
            console.log(`${searchType} search response:`, response.data);

            const movies = response.data.results || response.data || [];
            setSearchResults(movies);

            if (movies.length === 0) {
                setError(`No ${searchType}s found for "${searchQuery}"`);
            }
        } catch (error) {
            console.error(`Error searching ${searchType}s:`, error);
            setError(`Search failed: ${error.response?.data?.message || error.message}`);
        } finally {
            setIsSearching(false);
        }
    };

    const clearSearch = () => {
        setSearchQuery('');
        setSearchResults([]);
        setError(null);
    };

    const handleRatingSubmitted = async (rating: number) => {
        // Refresh trending movies to show updated ratings
        await loadTrendingMovies();

        // If we have search results, refresh those too
        if (searchResults.length > 0 && searchQuery) {
            try {
                setIsSearching(true);
                const response = await moviesApi.search(searchQuery, 1, searchType);
                setSearchResults(response.data.results || []);
            } catch (error) {
                console.error('Error refreshing search results:', error);
            } finally {
                setIsSearching(false);
            }
        }
    };

    const handleMovieClick = (movie: Movie) => {
        console.log('Clicked movie:', movie);
    };

    const handleRateMovie = (movie: Movie) => {
        if (!isAuthenticated) {
            setAuthModalTab('login');
            setAuthModalOpen(true);
            return;
        }

        // Check if email is verified
        if (!user?.isEmailVerified) {
            // Could show a specific modal or just prevent rating
            alert('Please verify your email address before rating movies.');
            return;
        }

        console.log('Rate movie:', movie);
        // TODO: Open rating modal
    };

    return (
        <div className="min-h-screen bg-gray-900">
            {/* Navigation Bar */}
            <Navbar
                onLoginClick={() => {
                    setAuthModalTab('login');
                    setAuthModalOpen(true);
                }}
                onRegisterClick={() => {
                    setAuthModalTab('register');
                    setAuthModalOpen(true);
                }}
            />

            {/* Email Verification Banner */}
            <EmailVerificationBanner />

            {/* Hero Section - Reduced height for more content space */}
            <div className="relative h-[400px] bg-gradient-to-r from-blue-900 to-purple-900 flex items-center justify-center">
                <div className="text-center z-10 w-full max-w-7xl mx-auto px-8">
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
                        Welcome to CineLog
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-300 mb-8">
                        Discover, Rate, and Track Your Favorite Movies & TV Shows
                    </p>

                    {/* Search Controls */}
                    <div className="max-w-5xl mx-auto mb-6">
                        <div className="flex justify-center space-x-4 mb-4">
                            <button
                                onClick={() => setSearchType('movie')}
                                className={`px-6 py-2 rounded-lg font-semibold transition duration-200 ${searchType === 'movie'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                            >
                                🎬 Movies
                            </button>
                            <button
                                onClick={() => setSearchType('tv')}
                                className={`px-6 py-2 rounded-lg font-semibold transition duration-200 ${searchType === 'tv'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                            >
                                📺 TV Shows
                            </button>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="w-full max-w-5xl mx-auto">
                        <div className="flex shadow-2xl">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={`Search for ${searchType === 'movie' ? 'movies' : 'TV shows'} like '${searchType === 'movie' ? 'Fight Club' : 'Breaking Bad'}', '${searchType === 'movie' ? 'The Dark Knight' : 'Game of Thrones'}'...`}
                                className="flex-1 px-6 py-3 text-lg bg-white text-gray-900 rounded-l-lg focus:outline-none focus:ring-4 focus:ring-blue-500"
                            />
                            <button
                                type="submit"
                                disabled={isSearching}
                                className="px-10 py-3 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-r-lg transition duration-200 disabled:opacity-50"
                            >
                                {isSearching ? 'Searching...' : `Search ${searchType === 'movie' ? 'Movies' : 'TV Shows'}`}
                            </button>
                        </div>
                        {searchResults.length > 0 && (
                            <button
                                type="button"
                                onClick={clearSearch}
                                className="mt-4 px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition duration-200"
                            >
                                Clear Search
                            </button>
                        )}
                    </form>
                </div>

                <div className="absolute inset-0 bg-black opacity-40"></div>
            </div>

            {/* Main Content Container - Full width with better spacing */}
            <div className="w-full px-4 lg:px-8 py-8">

                {/* Error Display */}
                {error && (
                    <div className="max-w-7xl mx-auto mb-8 p-6 bg-red-900/50 border border-red-500 rounded-lg">
                        <p className="text-red-200 text-lg">{error}</p>
                        <button
                            onClick={() => {
                                setError(null);
                                if (searchResults.length === 0) {
                                    loadTrendingMovies();
                                }
                            }}
                            className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition duration-200"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Search Results */}
                {searchResults.length > 0 && (
                    <section className="max-w-[2000px] mx-auto mb-12">
                        <h2 className="text-3xl font-bold text-white mb-6 px-4">
                            Search Results for "{searchQuery}" ({searchResults.length} found)
                        </h2>
                        {/* Responsive grid that scales up to many columns on large screens */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 3xl:grid-cols-10 gap-4 lg:gap-6 px-4">
                            {searchResults.map((movie, index) => (
                                <MovieCard
                                    key={movie.tmdbId || movie.id || index}
                                    movie={movie}
                                    onClick={handleMovieClick}
                                    onRate={isAuthenticated ? handleRateMovie : undefined}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* Trending Section */}
                <section className="max-w-[2000px] mx-auto">
                    <div className="flex justify-between items-center mb-6 px-4">
                        <h2 className="text-3xl font-bold text-white">
                            Trending This Week ({trendingMovies.length})
                        </h2>
                    </div>

                    {isLoading ? (
                        <div className="flex flex-col justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mb-4"></div>
                            <div className="text-white text-xl">Loading trending {trendingType}s...</div>
                            <div className="text-gray-400 mt-2">Connecting to backend at localhost:5003</div>
                        </div>
                    ) : trendingMovies.length > 0 ? (
                        /* Ultra-wide responsive grid for large screens */
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 3xl:grid-cols-10 gap-4 lg:gap-6 px-4">
                            {trendingMovies.map((movie, index) => (
                                <MovieCard
                                    key={movie.tmdbId || movie.id || index}
                                    movie={movie}
                                    onClick={handleMovieClick}
                                    onRate={isAuthenticated ? handleRateMovie : undefined}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <div className="text-gray-400 text-xl mb-4">No trending {trendingType}s to display</div>
                            <button
                                onClick={loadTrendingMovies}
                                className="btn-primary"
                            >
                                Retry Loading
                            </button>
                        </div>
                    )}
                </section>

                {/* Welcome Message for New Users */}
                {!isAuthenticated && (
                    <section className="max-w-4xl mx-auto mt-16">
                        <div className="bg-gray-800 rounded-xl p-8 text-center mx-4">
                            <h3 className="text-2xl font-bold text-white mb-4">
                                Join the CineLog Community
                            </h3>
                            <p className="text-lg text-gray-300 mb-6">
                                Create an account to rate movies, build your watchlist, and discover new favorites!
                            </p>
                            <div className="space-x-4">
                                <button
                                    onClick={() => {
                                        setAuthModalTab('register');
                                        setAuthModalOpen(true);
                                    }}
                                    className="btn-primary text-lg px-6 py-2"
                                >
                                    Sign Up
                                </button>
                                <button
                                    onClick={() => {
                                        setAuthModalTab('login');
                                        setAuthModalOpen(true);
                                    }}
                                    className="btn-secondary text-lg px-6 py-2"
                                >
                                    Log In
                                </button>
                            </div>
                        </div>
                    </section>
                )}
            </div>

            {/* Auth Modal */}
            <AuthModal
                isOpen={authModalOpen}
                onClose={() => setAuthModalOpen(false)}
                defaultTab={authModalTab}
            />

            {/* Rating Modal */}
            <RatingModal
                isOpen={ratingModalOpen}
                onClose={() => setRatingModalOpen(false)}
                movie={selectedMovie}
                onRatingSubmitted={handleRatingSubmitted}
            />
        </div>
    );
};

export default HomePage;