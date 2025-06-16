// src/components/MovieCard.tsx - Clean rewrite to fix syntax issues
import React, { useState } from 'react';
import type { Movie } from '../types/api';

interface MovieCardProps {
    movie: Movie;
    onRate?: (movie: Movie) => void;
    onClick?: (movie: Movie) => void;
    showRating?: boolean;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, onRate, onClick, showRating = true }) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);

    // Use the correct field name from the backend response
    const posterUrl = movie.poster_path
        ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
        : null;

    const year = movie.release_date ? new Date(movie.release_date).getFullYear() :
        movie.first_air_date ? new Date(movie.first_air_date).getFullYear() : '';

    const handleImageLoad = () => {
        setImageLoading(false);
    };

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
        setImageError(true);
        setImageLoading(false);
    };

    return (
        <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="relative group cursor-pointer h-80" onClick={() => onClick?.(movie)}>

                {/* Loading placeholder */}
                {imageLoading && posterUrl && !imageError && (
                    <div className="w-full h-full bg-gray-700 flex items-center justify-center absolute inset-0">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        <span className="ml-2 text-white text-sm">Loading...</span>
                    </div>
                )}

                {posterUrl && (
                    <div className="w-full h-full relative">
                        <img
                            src={posterUrl}
                            alt={movie.title}
                            onLoad={handleImageLoad}
                            onError={handleImageError}
                            className="group-hover:blur-sm transition-all duration-300"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                zIndex: 2
                            }}
                        />
                    </div>
                )}

                {/* Fallback when no poster or error */}
                {(imageError || !posterUrl) && (
                    <div className="w-full h-full bg-gray-700 flex flex-col items-center justify-center p-4">
                        <div className="text-6xl text-gray-500 mb-2">🎬</div>
                        <div className="text-white text-center text-sm font-medium leading-tight">
                            {movie.title}
                        </div>
                        {year && (
                            <div className="text-gray-400 text-xs mt-1">{year}</div>
                        )}
                    </div>
                )}

                {/* Enhanced hover overlay with better text */}
                <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-80 transition-all duration-300 flex items-center justify-center z-20">
                    <div className="opacity-0 group-hover:opacity-100 text-center transition-all duration-300 p-6 transform group-hover:scale-105">
                        <h3 className="text-white text-xl font-bold mb-3 leading-tight drop-shadow-lg">
                            {movie.title}
                        </h3>
                        {year && (
                            <p className="text-yellow-400 text-lg font-semibold mb-4 drop-shadow-md">
                                {year}
                            </p>
                        )}
                        {movie.overview && (
                            <p className="text-gray-200 text-sm leading-relaxed max-h-32 overflow-hidden drop-shadow-md">
                                {movie.overview.length > 150 
                                    ? `${movie.overview.substring(0, 150)}...` 
                                    : movie.overview}
                            </p>
                        )}
                        {movie.vote_average && movie.vote_average > 0 && (
                            <div className="mt-4 inline-flex items-center bg-yellow-500 bg-opacity-90 rounded-full px-3 py-1">
                                <span className="text-yellow-900 text-sm font-bold">
                                    ⭐ {movie.vote_average.toFixed(1)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-4">
                <h3 className="text-white font-semibold text-lg mb-2 truncate" title={movie.title}>
                    {movie.title}
                </h3>

                {showRating && (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            {movie.vote_average && movie.vote_average > 0 && (
                                <div className="flex items-center bg-yellow-600 rounded px-2 py-1">
                                    <span className="text-yellow-100 text-xs font-semibold">TMDb</span>
                                    <span className="text-white text-sm ml-1 font-bold">
                                        {movie.vote_average.toFixed(1)}
                                    </span>
                                </div>
                            )}
                            {movie.userRating && (
                                <div className="flex items-center bg-blue-600 rounded px-2 py-1">
                                    <span className="text-blue-100 text-xs font-semibold">You</span>
                                    <span className="text-white text-sm ml-1 font-bold">
                                        {movie.userRating}
                                    </span>
                                </div>
                            )}
                        </div>

                        {onRate && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRate(movie);
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-1 px-3 rounded transition duration-200"
                            >
                                Rate
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MovieCard;