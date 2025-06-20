import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { moviesApi, ratingsApi } from '../services/api';
import Navbar from '../components/Navbar';
import RatingModal from '../components/RatingModal';
import { useAuth } from '../context/AuthContext';
import type { Movie, RatingResponse } from '../types/api';

interface Season {
    id: number;
    name: string;
    overview?: string;
    poster_path?: string;
    season_number: number;
    episode_count: number;
    air_date?: string;
}

interface Network {
    id: number;
    name: string;
    logo_path?: string;
}

interface CreatedBy {
    id: number;
    name: string;
    profile_path?: string;
}

interface TvShowDetails extends Movie {
    // TV Show specific fields
    number_of_episodes?: number;
    number_of_seasons?: number;
    last_air_date?: string;
    next_episode_to_air?: {
        air_date: string;
        episode_number: number;
        season_number: number;
    };
    seasons?: Season[];
    networks?: Network[];
    created_by?: CreatedBy[];
    episode_run_time?: number[];
    in_production?: boolean;
    type?: string;

    // Common fields
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

const TvDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();

    const [tvShow, setTvShow] = useState<TvShowDetails | null>(null);
    const [userRating, setUserRating] = useState<RatingResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [ratingModalOpen, setRatingModalOpen] = useState(false);

    useEffect(() => {
        if (id) {
            loadTvDetails();
        }
    }, [id]);

    const loadTvDetails = async () => {
        if (!id) return;

        try {
            setIsLoading(true);
            setError(null);

            // Load TV show details
            const tvResponse = await moviesApi.getDetails(parseInt(id), 'tv');
            setTvShow(tvResponse.data);

            // Load user rating if authenticated
            if (isAuthenticated) {
                try {
                    const ratingResponse = await ratingsApi.getMyRatingForMedia(parseInt(id), 'tv');
                    setUserRating(ratingResponse.data);
                } catch (error) {
                    // No rating found - that's fine
                    setUserRating(null);
                }
            }
        } catch (error: any) {
            console.error('Error loading TV show details:', error);
            setError('Failed to load TV show details. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRatingSubmitted = (rating: number) => {
        // Reload user rating after submission
        if (id && isAuthenticated) {
            ratingsApi.getMyRatingForMedia(parseInt(id), 'tv')
                .then(response => setUserRating(response.data))
                .catch(() => setUserRating(null));
        }
    };

    const handleRateShow = () => {
        if (!isAuthenticated) {
            alert('Please log in to rate this TV show');
            return;
        }

        if (!user?.isEmailVerified) {
            alert('Please verify your email address before rating TV shows.');
            return;
        }

        setRatingModalOpen(true);
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

    const getNetworkLogoUrl = (logoPath?: string) => {
        return logoPath
            ? `https://image.tmdb.org/t/p/w185${logoPath}`
            : null;
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getShowStatus = () => {
        if (tvShow?.in_production) return 'In Production';
        if (tvShow?.status === 'Ended') return 'Ended';
        if (tvShow?.status === 'Returning Series') return 'Ongoing';
        return tvShow?.status || 'Unknown';
    };

    const getCreators = () => {
        return tvShow?.created_by?.map(creator => creator.name).join(', ') || 'N/A';
    };

    const getAverageRuntime = () => {
        if (!tvShow?.episode_run_time?.length) return 'N/A';
        const avg = tvShow.episode_run_time.reduce((a, b) => a + b, 0) / tvShow.episode_run_time.length;
        return `${Math.round(avg)} min`;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-900">
                <Navbar onLoginClick={() => { }} onRegisterClick={() => { }} />
                <div className="flex justify-center items-center h-96">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
                    <div className="text-white text-xl ml-4">Loading TV show details...</div>
                </div>
            </div>
        );
    }

    if (error || !tvShow) {
        return (
            <div className="min-h-screen bg-gray-900">
                <Navbar onLoginClick={() => { }} onRegisterClick={() => { }} />
                <div className="max-w-4xl mx-auto p-6 text-center">
                    <div className="text-red-400 text-xl mb-4">{error || 'TV show not found'}</div>
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

    const displayTitle = tvShow.name || tvShow.title || 'Unknown Title';
    const firstAirYear = tvShow.first_air_date ? new Date(tvShow.first_air_date).getFullYear() : '';
    const lastAirYear = tvShow.last_air_date ? new Date(tvShow.last_air_date).getFullYear() : '';
    const yearRange = firstAirYear && lastAirYear && firstAirYear !== lastAirYear
        ? `${firstAirYear} - ${lastAirYear}`
        : firstAirYear.toString();

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
                            src={getPosterUrl(tvShow.poster_path)}
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
                                {yearRange && `${yearRange} • `}
                                {tvShow.genres?.map(g => g.name).join(', ') || 'Unknown'} •
                                {getAverageRuntime()} episodes •
                                {getShowStatus()}
                            </p>
                        </div>

                        <p className="text-gray-300 leading-relaxed">
                            {tvShow.overview || 'No overview available.'}
                        </p>

                        {/* TV Show Specific Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-400">Created by:</span>
                                <span className="ml-2 text-white">{getCreators()}</span>
                            </div>
                            <div>
                                <span className="text-gray-400">First Air Date:</span>
                                <span className="ml-2 text-white">{formatDate(tvShow.first_air_date)}</span>
                            </div>
                            <div>
                                <span className="text-gray-400">Seasons:</span>
                                <span className="ml-2 text-white">{tvShow.number_of_seasons || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="text-gray-400">Episodes:</span>
                                <span className="ml-2 text-white">{tvShow.number_of_episodes || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="text-gray-400">Status:</span>
                                <span className="ml-2 text-white">{getShowStatus()}</span>
                            </div>
                            <div>
                                <span className="text-gray-400">Type:</span>
                                <span className="ml-2 text-white">{tvShow.type || 'N/A'}</span>
                            </div>
                        </div>

                        {/* Networks */}
                        {tvShow.networks && tvShow.networks.length > 0 && (
                            <div>
                                <span className="text-gray-400 text-sm">Networks: </span>
                                <div className="flex items-center space-x-3 mt-2">
                                    {tvShow.networks.map((network) => (
                                        <div key={network.id} className="flex items-center space-x-2">
                                            {network.logo_path ? (
                                                <img
                                                    src={getNetworkLogoUrl(network.logo_path)!}
                                                    alt={network.name}
                                                    className="h-8 object-contain bg-white rounded px-2 py-1"
                                                />
                                            ) : (
                                                <span className="text-white text-sm bg-gray-700 px-3 py-1 rounded">
                                                    {network.name}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Genres */}
                        {tvShow.genres && tvShow.genres.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-4">
                                {tvShow.genres.map((genre) => (
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
                                {tvShow.vote_average ? tvShow.vote_average.toFixed(1) : 'N/A'}
                            </div>
                            <div className="text-sm text-gray-400">TMDb Rating</div>
                            {tvShow.vote_count && (
                                <div className="text-xs text-gray-500 mt-1">
                                    {tvShow.vote_count.toLocaleString()} votes
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

                        {/* Next Episode */}
                        {tvShow.next_episode_to_air && (
                            <div className="bg-gray-900 p-4 rounded-xl text-center">
                                <div className="text-lg font-bold text-green-400">
                                    S{tvShow.next_episode_to_air.season_number}E{tvShow.next_episode_to_air.episode_number}
                                </div>
                                <div className="text-sm text-gray-400">Next Episode</div>
                                <div className="text-xs text-gray-500 mt-1">
                                    {formatDate(tvShow.next_episode_to_air.air_date)}
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <button
                            onClick={handleRateShow}
                            className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-semibold text-white transition duration-200"
                        >
                            {userRating ? 'Update Rating' : 'Rate This Show'}
                        </button>

                        <button className="w-full bg-gray-700 hover:bg-gray-600 py-3 rounded-lg font-semibold text-white transition duration-200">
                            + Watchlist
                        </button>
                    </div>
                </div>

                {/* Bottom Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* Cast */}
                    <div className="bg-gray-900 p-6 rounded-xl">
                        <h3 className="text-xl font-semibold mb-4 text-white">Main Cast</h3>
                        <div className="space-y-3">
                            {tvShow.credits?.cast.slice(0, 5).map((person) => (
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
                                    onClick={handleRateShow}
                                    className="text-blue-400 text-sm hover:underline"
                                >
                                    Edit Review
                                </button>
                            </div>
                        ) : (
                            <div className="text-gray-400">
                                {isAuthenticated ? (
                                    <div>
                                        <p className="mb-3">You haven't reviewed this show yet.</p>
                                        <button
                                            onClick={handleRateShow}
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

                    {/* Similar Shows */}
                    <div className="bg-gray-900 p-6 rounded-xl">
                        <h3 className="text-xl font-semibold mb-4 text-white">Similar Shows</h3>
                        {tvShow.similar?.results.length ? (
                            <div className="grid grid-cols-3 gap-2">
                                {tvShow.similar.results.slice(0, 6).map((similar) => (
                                    <div
                                        key={similar.id}
                                        className="cursor-pointer hover:opacity-75 transition-opacity"
                                        onClick={() => navigate(`/tv/${similar.id}`)}
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
                            <div className="text-gray-400">Similar shows not available</div>
                        )}
                    </div>
                </div>

                {/* Seasons Grid */}
                {tvShow.seasons && tvShow.seasons.length > 0 && (
                    <div className="bg-gray-900 p-6 rounded-xl">
                        <h3 className="text-xl font-semibold mb-4 text-white">
                            Seasons ({tvShow.seasons.length})
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {tvShow.seasons
                                .filter(season => season.season_number > 0) // Filter out specials
                                .map((season) => (
                                    <div
                                        key={season.id}
                                        className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors"
                                    >
                                        <div className="flex space-x-4">
                                            <img
                                                src={getPosterUrl(season.poster_path)}
                                                alt={season.name}
                                                className="w-16 h-24 object-cover rounded bg-gray-700 flex-shrink-0"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = '/placeholder-poster.jpg';
                                                }}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-white truncate">{season.name}</h4>
                                                <p className="text-sm text-gray-400 mb-2">
                                                    {season.episode_count} episodes
                                                </p>
                                                {season.air_date && (
                                                    <p className="text-xs text-gray-500">
                                                        Aired {new Date(season.air_date).getFullYear()}
                                                    </p>
                                                )}
                                                {season.overview && (
                                                    <p className="text-xs text-gray-400 mt-2 line-clamp-3">
                                                        {season.overview}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Rating Modal */}
            <RatingModal
                isOpen={ratingModalOpen}
                onClose={() => setRatingModalOpen(false)}
                movie={tvShow}
                onRatingSubmitted={handleRatingSubmitted}
            />
        </div>
    );
};

export default TvDetailsPage;