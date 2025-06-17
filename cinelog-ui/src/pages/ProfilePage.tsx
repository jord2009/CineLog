import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ratingsApi } from '../services/api';
import Navbar from '../components/Navbar';
import MovieCard from '../components/MovieCard';
import { useNavigate } from 'react-router-dom';
import type { RatingResponse } from '../types/api';

const ProfilePage: React.FC = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [ratings, setRatings] = useState<RatingResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<'recent' | 'rating' | 'title'>('recent');
    const [filterRating, setFilterRating] = useState<number | null>(null);

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        if (isAuthenticated) {
            loadUserRatings();
        }
    }, [isAuthenticated]);

    const loadUserRatings = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await ratingsApi.getMyRatings(1, 100); // Get up to 100 ratings
            setRatings(response.data || []);
        } catch (error: any) {
            setError('Failed to load your ratings. Please try again.');
            console.error('Error loading ratings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Calculate statistics
    const getStats = () => {
        if (ratings.length === 0) return null;

        const totalRatings = ratings.length;
        const averageRating = ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings;

        // Rating distribution
        const distribution = ratings.reduce((acc, r) => {
            const roundedRating = Math.floor(r.rating);
            acc[roundedRating] = (acc[roundedRating] || 0) + 1;
            return acc;
        }, {} as Record<number, number>);

        // Favorite genres (would need genre data from movies)
        const highestRating = Math.max(...ratings.map(r => r.rating));
        const lowestRating = Math.min(...ratings.map(r => r.rating));
        const recentRatings = ratings.slice(0, 5);

        return {
            totalRatings,
            averageRating,
            distribution,
            highestRating,
            lowestRating,
            recentRatings
        };
    };

    // Sort and filter ratings
    const getSortedAndFilteredRatings = () => {
        let filteredRatings = [...ratings];

        // Apply rating filter
        if (filterRating !== null) {
            const min = filterRating;
            const max = filterRating + 0.9;
            filteredRatings = filteredRatings.filter(r => r.rating >= min && r.rating <= max);
        }

        // Apply sorting
        switch (sortBy) {
            case 'rating':
                return filteredRatings.sort((a, b) => b.rating - a.rating);
            case 'title':
                return filteredRatings.sort((a, b) => a.mediaTitle.localeCompare(b.mediaTitle));
            case 'recent':
            default:
                return filteredRatings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
    };

    const stats = getStats();
    const sortedRatings = getSortedAndFilteredRatings();

    if (!isAuthenticated) {
        return null; // Will redirect
    }

    return (
        <div className="min-h-screen bg-gray-900">
            <Navbar
                onLoginClick={() => { }}
                onRegisterClick={() => { }}
            />

            <div className="max-w-6xl mx-auto px-4 py-8">

                {/* Profile Header */}
                <div className="bg-gray-800 rounded-2xl p-8 mb-8">
                    <div className="flex items-center space-x-6">
                        <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-2xl">
                                {user?.firstName?.[0] || user?.username?.[0] || '?'}
                            </span>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">
                                {user?.firstName && user?.lastName
                                    ? `${user.firstName} ${user.lastName}`
                                    : user?.username}
                            </h1>
                            <p className="text-gray-400 mb-2">{user?.email}</p>
                            <div className="flex items-center space-x-4 text-sm">
                                <span className={`px-3 py-1 rounded-full ${user?.isEmailVerified
                                        ? 'bg-green-900 text-green-200'
                                        : 'bg-yellow-900 text-yellow-200'
                                    }`}>
                                    {user?.isEmailVerified ? '✅ Verified' : '⚠️ Not Verified'}
                                </span>
                                <span className="text-gray-400">
                                    Member since {new Date(user?.createdAt || '').toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Statistics Cards */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-gray-800 rounded-xl p-6 text-center">
                            <div className="text-3xl font-bold text-blue-400 mb-2">{stats.totalRatings}</div>
                            <div className="text-gray-300">Movies Rated</div>
                        </div>

                        <div className="bg-gray-800 rounded-xl p-6 text-center">
                            <div className="text-3xl font-bold text-yellow-400 mb-2">
                                {stats.averageRating.toFixed(1)}
                            </div>
                            <div className="text-gray-300">Average Rating</div>
                        </div>

                        <div className="bg-gray-800 rounded-xl p-6 text-center">
                            <div className="text-3xl font-bold text-green-400 mb-2">{stats.highestRating}</div>
                            <div className="text-gray-300">Highest Rating</div>
                        </div>

                        <div className="bg-gray-800 rounded-xl p-6 text-center">
                            <div className="text-3xl font-bold text-red-400 mb-2">{stats.lowestRating}</div>
                            <div className="text-gray-300">Lowest Rating</div>
                        </div>
                    </div>
                )}

                {/* Rating Distribution Chart */}
                {stats && (
                    <div className="bg-gray-800 rounded-xl p-6 mb-8">
                        <h3 className="text-xl font-bold text-white mb-4">Rating Distribution</h3>
                        <div className="flex items-end justify-center space-x-2 h-40 bg-gray-700 rounded-lg p-4">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rating => {
                                const count = stats.distribution[rating] || 0;
                                const maxCount = Math.max(...Object.values(stats.distribution));
                                const height = maxCount > 0 ? Math.max((count / maxCount) * 100, count > 0 ? 10 : 0) : 0;

                                return (
                                    <div key={rating} className="flex flex-col items-center flex-1 max-w-12">
                                        <div className="text-xs text-white mb-1 font-semibold">{count}</div>
                                        <div
                                            className={`w-full rounded transition-all duration-300 cursor-pointer ${count > 0
                                                    ? filterRating === rating
                                                        ? 'bg-yellow-500 hover:bg-yellow-400'
                                                        : 'bg-blue-600 hover:bg-blue-500'
                                                    : 'bg-gray-600'
                                                }`}
                                            style={{ height: `${height}px`, minHeight: count > 0 ? '20px' : '5px' }}
                                            onClick={() => count > 0 && setFilterRating(filterRating === rating ? null : rating)}
                                            title={`${count} movies rated ${rating}/10`}
                                        />
                                        <div className="text-sm text-gray-300 mt-2 font-medium">{rating}</div>
                                    </div>
                                );
                            })}
                        </div>
                        <p className="text-sm text-gray-400 mt-4 text-center">
                            Click on a bar to filter by that rating • Total: {stats.totalRatings} ratings
                        </p>
                    </div>
                )}

                {/* Controls */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
                    <h2 className="text-2xl font-bold text-white">
                        Your Movie Ratings
                        {filterRating !== null && (
                            <span className="text-yellow-400 ml-2">
                                (Filtered by {filterRating}/10)
                            </span>
                        )}
                    </h2>

                    <div className="flex space-x-4">
                        {filterRating !== null && (
                            <button
                                onClick={() => setFilterRating(null)}
                                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm transition duration-200"
                            >
                                Clear Filter
                            </button>
                        )}

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as 'recent' | 'rating' | 'title')}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="recent">Sort by Recent</option>
                            <option value="rating">Sort by Rating</option>
                            <option value="title">Sort by Title</option>
                        </select>
                    </div>
                </div>

                {/* Ratings Grid */}
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mb-4"></div>
                        <div className="text-white text-xl ml-4">Loading your ratings...</div>
                    </div>
                ) : error ? (
                    <div className="text-center py-16">
                        <div className="text-red-400 text-xl mb-4">{error}</div>
                        <button
                            onClick={loadUserRatings}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200"
                        >
                            Try Again
                        </button>
                    </div>
                ) : sortedRatings.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-6xl text-gray-500 mb-4">🎬</div>
                        <h3 className="text-2xl font-bold text-white mb-4">
                            {filterRating !== null ? 'No ratings found for this filter' : 'No ratings yet'}
                        </h3>
                        <p className="text-gray-400 mb-6">
                            {filterRating !== null
                                ? 'Try selecting a different rating or clear the filter.'
                                : 'Start rating movies to build your personal collection!'}
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200"
                        >
                            Discover Movies
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {sortedRatings.map((rating) => {
                            // Convert rating data to Movie format for MovieCard
                            const movieData = {
                                id: rating.tmdbId,
                                tmdbId: rating.tmdbId,
                                title: rating.mediaTitle,
                                poster_path: rating.mediaPosterUrl?.replace('https://image.tmdb.org/t/p/w500', ''),
                                media_type: rating.mediaType,
                                userRating: rating.rating,
                                vote_average: 0, // We don't have this data in rating response
                                vote_count: 0
                            };

                            return (
                                <div key={rating.id} className="relative">
                                    <MovieCard
                                        movie={movieData}
                                        onClick={() => { }} // TODO: Navigate to movie details
                                        showRating={true}
                                    />

                                    {/* Rating overlay */}
                                    <div className="absolute top-2 left-2 bg-blue-600 text-white text-sm font-bold px-2 py-1 rounded">
                                        {rating.rating}/10
                                    </div>

                                    {/* Date overlay */}
                                    <div className="absolute bottom-20 left-2 right-2 bg-black bg-opacity-75 text-white text-xs p-2 rounded">
                                        <div className="font-semibold mb-1">
                                            Rated {new Date(rating.createdAt).toLocaleDateString()}
                                        </div>
                                        {rating.review && (
                                            <div className="text-gray-300 line-clamp-2">
                                                {rating.isSpoiler && <span className="text-yellow-400">⚠️ </span>}
                                                "{rating.review}"
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Load More Button (for pagination) */}
                {sortedRatings.length > 0 && sortedRatings.length % 20 === 0 && (
                    <div className="text-center mt-8">
                        <button
                            onClick={() => {/* TODO: Load more ratings */ }}
                            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition duration-200"
                        >
                            Load More Ratings
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;