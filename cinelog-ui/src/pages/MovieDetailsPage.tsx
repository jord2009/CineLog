import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { moviesApi, ratingsApi } from '../services/api';
import Navbar from '../components/Navbar';
import RatingModal from '../components/RatingModal';
import { useAuth } from '../context/AuthContext';
import type { Movie, RatingResponse } from '../types/api';

interface MovieDetails extends Movie {
    runtime?: number;
    budget?: number;
    revenue?: number;
    genres?: Array<{ id: number; name: string }>;
    production_countries?: Array<{ iso_3166_1: string; name: string }>;
    credits?: {
        cast: Array<{
            id: number;
            name: string;
            character: string;
            profile_path?: string;
        }>;
        crew: Array<{
            id: number;
            name: string;
            job: string;
        }>;
    };
    similar?: {
        results: Movie[];
    };
}

const MovieDetailsPage: React.FC = () => {
    const { id, type } = useParams<{ id: string; type: 'movie' | 'tv' }>();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();

    const [movie, setMovie] = useState<MovieDetails | null>(null);
    const [userRating, setUserRating] = useState<RatingResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [ratingModalOpen, setRatingModalOpen] = useState(false);

    useEffect(() => {
        if (id && type) {
            loadMovieDetails();
        }
    }, [id, type]);

    const loadMovieDetails = async () => {
        if (!id || !type) return;

        try {
            setIsLoading(true);
            setError(null);

            // Load movie details
            const movieResponse = await moviesApi.getDetails(parseInt(id));
            setMovie(movieResponse.data);

            // Load user rating if authenticated
            if (isAuthenticated) {
                try {
                    const ratingResponse = await ratingsApi.getMyRatingForMedia(parseInt(id), type);
                    setUserRating(ratingResponse.data);
                } catch (error) {
                    // No rating found - that's fine
                    setUserRating(null);
                }
            }
        } catch (error: any) {
            console.error('Error loading movie details:', error);
            setError('Failed to load movie details. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRatingSubmitted = (rating: number) => {
        // Reload user rating after submission
        if (id && type && isAuthenticated) {
            ratingsApi.getMyRatingForMedia(parseInt(id), type)
                .then(response => setUserRating(response.data))
                .catch(() => setUserRating(null));
        }
    };

    const handleRateMovie = () => {
        if (!isAuthenticated) {
            // Redirect to login or show message
            alert('Please log in to rate this movie');
            return;
        }

        if (!user?.isEmailVerified) {
            alert('Please verify your email address before rating movies.');
            return;
        }

        setRatingModalOpen(true);
    };

    const formatCurrency = (amount?: number) => {
        if (!amount) return 'N/A';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatRuntime = (minutes?: number) => {
        if (!minutes) return 'N/A';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    };

    const getPosterUrl = (posterPath?: string) => {
        return posterPath
            ? `https://image.tmdb.org/t/p/w500${posterPath}`
            : '/placeholder-poster.jpg';
    };

    const getProfileUrl = (profilePath?: string) => {
        return profilePath
            ? `https://image.tmdb.org/t/p/w185${profilePath}`
            : '/placeholder-avatar.jpg';
    };

    const getDirector = () => {
        return movie?.credits?.crew.find(person => person.job === 'Director')?.name || 'N/A';
    };

    const getWriters = () => {
        const writers = movie?.credits?.crew.filter(person =>
            person.job === 'Writer' || person.job === 'Screenplay' || person.job === 'Novel'
        ) || [];
        return writers.length > 0 ? writers.map(w => w.name).join(', ') : 'N/A';
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-900">
                <Navbar onLoginClick={() => { }} onRegisterClick={() => { }} />
                <div className="flex justify-center items-center h-96">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
                    <div className="text-white text-xl ml-4">Loading movie details...</div>
                </div>
            </div>
        );
    }

    if (error || !movie) {
        return (
            <div className="min-h-screen bg-gray-900">
                <Navbar onLoginClick={() => { }} onRegisterClick={() => { }} />
                <div className="max-w-4xl mx-auto p-6 text-center">
                    <div className="text-red-400 text-xl mb-4">{error || 'Movie not found'}</div>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition duration-200"
                    >
                        Return to Home
                    </button>
                </div>
            </div>
        );
    }

    const displayTitle = movie.title || movie.name || 'Unknown Title';
    const displayDate = movie.release_date || movie.first_air_date;
    const year = displayDate ? new Date(displayDate).getFullYear() : '';

    return (
        <div className="min-h-screen bg-gray-800">
            <Navbar onLoginClick={() => { }} onRegisterClick={() => { }} />

            <div className="max-w-7xl mx-auto p-6">
                {/* Navigation */}
                <nav className="mb-6">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center text-white hover:text-blue-400 transition-colors"
                    >
                        ← Back to Home
                    </button>
                </nav>

                {/* Top Section */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-8">
                    {/* Poster */}
                    <div className="lg:col-span-1">
                        <img
                            src={getPosterUrl(movie.poster_path)}
                            alt={displayTitle}
                            className="w-full h-80 object-cover rounded-xl shadow-lg"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder-poster.jpg';
                            }}
                        />
                    </div>

                    {/* Main Info */}
                    <div className="lg:col-span-3 space-y-4">
                        <div>
                            <h1 className="text-4xl font-bold mb-2 text-white">{displayTitle}</h1>
                            <p className="text-lg text-gray-400">
                                {year && `${year} • `}
                                {movie.genres?.map(g => g.name).join(', ') || 'Unknown'} •
                                {formatRuntime(movie.runtime)} •
                                {movie.adult ? 'R' : 'PG-13'}
                            </p>
                        </div>

                        <p className="text-gray-300 leading-relaxed">
                            {movie.overview || 'No overview available.'}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-400">Director:</span>
                                <span className="ml-2 text-white">{getDirector()}</span>
                            </div>
                            <div>
                                <span className="text-gray-400">Writers:</span>
                                <span className="ml-2 text-white">{getWriters()}</span>
                            </div>
                            <div>
                                <span className="text-gray-400">Budget:</span>
                                <span className="ml-2 text-white">{formatCurrency(movie.budget)}</span>
                            </div>
                            <div>
                                <span className="text-gray-400">Revenue:</span>
                                <span className="ml-2 text-white">{formatCurrency(movie.revenue)}</span>
                            </div>
                        </div>

                        {/* Genres */}
                        {movie.genres && movie.genres.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-4">
                                {movie.genres.map((genre) => (
                                    <span
                                        key={genre.id}
                                        className="bg-blue-600 px-3 py-1 rounded-full text-sm font-medium text-white"
                                    >
                                        {genre.name}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Ratings & Actions */}
                    <div className="lg:col-span-1 space-y-4">
                        {/* TMDb Rating */}
                        <div className="bg-gray-900 p-4 rounded-xl text-center">
                            <div className="text-2xl font-bold text-yellow-400">
                                {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}
                            </div>
                            <div className="text-sm text-gray-400">TMDb Rating</div>
                            {movie.vote_count && (
                                <div className="text-xs text-gray-500 mt-1">
                                    {movie.vote_count.toLocaleString()} votes
                                </div>
                            )}
                        </div>

                        {/* User Rating */}
                        <div className="bg-gray-900 p-4 rounded-xl text-center">
                            <div className="text-2xl font-bold text-blue-400">
                                {userRating ? userRating.rating.toFixed(1) : 'N/A'}
                            </div>
                            <div className="text-sm text-gray-400">Your Rating</div>
                            {userRating?.review && (
                                <div className="text-xs text-gray-500 mt-1">
                                    {userRating.isSpoiler && '⚠️ '}Review added
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <button
                            onClick={handleRateMovie}
                            className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-semibold text-white transition duration-200"
                        >
                            {userRating ? 'Update Rating' : 'Rate This Movie'}
                        </button>

                        <button className="w-full bg-gray-700 hover:bg-gray-600 py-3 rounded-lg font-semibold text-white transition duration-200">
                            + Watchlist
                        </button>
                    </div>
                </div>

                {/* Bottom Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cast */}
                    <div className="bg-gray-900 p-6 rounded-xl">
                        <h3 className="text-xl font-semibold mb-4 text-white">Top Cast</h3>
                        <div className="space-y-3">
                            {movie.credits?.cast.slice(0, 5).map((person) => (
                                <div key={person.id} className="flex items-center space-x-3">
                                    <img
                                        src={getProfileUrl(person.profile_path)}
                                        alt={person.name}
                                        className="w-12 h-12 rounded-full object-cover bg-gray-700"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = '/placeholder-avatar.jpg';
                                        }}
                                    />
                                    <div>
                                        <div className="font-medium text-white">{person.name}</div>
                                        <div className="text-sm text-gray-400">{person.character}</div>
                                    </div>
                                </div>
                            )) || (
                                    <div className="text-gray-400">Cast information not available</div>
                                )}
                        </div>
                    </div>

                    {/* User Review */}
                    <div className="bg-gray-900 p-6 rounded-xl">
                        <h3 className="text-xl font-semibold mb-4 text-white">Your Review</h3>
                        {userRating ? (
                            <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    <div className="flex text-blue-400">
                                        {'★'.repeat(Math.round(userRating.rating / 2))}
                                        {'☆'.repeat(5 - Math.round(userRating.rating / 2))}
                                    </div>
                                    <span className="text-sm text-gray-400">{userRating.rating}/10</span>
                                </div>
                                {userRating.review && (
                                    <>
                                        {userRating.isSpoiler && (
                                            <div className="text-yellow-400 text-sm">⚠️ Contains spoilers</div>
                                        )}
                                        <p className="text-gray-300 text-sm leading-relaxed">
                                            "{userRating.review}"
                                        </p>
                                    </>
                                )}
                                <button
                                    onClick={handleRateMovie}
                                    className="text-blue-400 text-sm hover:underline"
                                >
                                    Edit Review
                                </button>
                            </div>
                        ) : (
                            <div className="text-gray-400">
                                {isAuthenticated ? (
                                    <div>
                                        <p className="mb-3">You haven't reviewed this movie yet.</p>
                                        <button
                                            onClick={handleRateMovie}
                                            className="text-blue-400 hover:underline"
                                        >
                                            Add a rating and review
                                        </button>
                                    </div>
                                ) : (
                                    <p>Log in to add your review</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Similar Movies */}
                    <div className="bg-gray-900 p-6 rounded-xl">
                        <h3 className="text-xl font-semibold mb-4 text-white">Similar {type === 'tv' ? 'Shows' : 'Movies'}</h3>
                        {movie.similar?.results.length ? (
                            <div className="grid grid-cols-3 gap-2">
                                {movie.similar.results.slice(0, 6).map((similar) => (
                                    <div
                                        key={similar.id}
                                        className="cursor-pointer hover:opacity-75 transition-opacity"
                                        onClick={() => navigate(`/${type}/${similar.id}`)}
                                    >
                                        <img
                                            src={getPosterUrl(similar.poster_path)}
                                            alt={similar.title || similar.name}
                                            className="w-full h-24 object-cover rounded-lg bg-gray-700"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = '/placeholder-poster.jpg';
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-gray-400">Similar movies not available</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Rating Modal */}
            <RatingModal
                isOpen={ratingModalOpen}
                onClose={() => setRatingModalOpen(false)}
                movie={movie}
                onRatingSubmitted={handleRatingSubmitted}
            />
        </div>
    );
};

export default MovieDetailsPage;