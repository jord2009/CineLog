import React, { useState, useEffect } from 'react';
import type { Movie } from '../types/api';
import { ratingsApi } from '../services/api';

interface RatingModalProps {
    isOpen: boolean;
    onClose: () => void;
    movie: Movie | null;
    onRatingSubmitted?: (rating: number) => void;
}

const RatingModal: React.FC<RatingModalProps> = ({
    isOpen,
    onClose,
    movie,
    onRatingSubmitted
}) => {
    console.log('🎭 RatingModal props:', { isOpen, movie: movie?.title });

    const [rating, setRating] = useState<number>(0);
    const [hoverRating, setHoverRating] = useState<number>(0);
    const [review, setReview] = useState<string>('');
    const [isSpoiler, setIsSpoiler] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [existingRating, setExistingRating] = useState<any>(null);

    // Load existing rating when modal opens
    useEffect(() => {
        if (isOpen && movie) {
            loadExistingRating();
        }
    }, [isOpen, movie]);

    const loadExistingRating = async () => {
        if (!movie) return;

        try {
            const response = await ratingsApi.getMyRatingForMedia(movie.id, movie.media_type);
            if (response.data) {
                setExistingRating(response.data);
                setRating(response.data.rating);
                setReview(response.data.review || '');
                setIsSpoiler(response.data.isSpoiler || false);
            }
        } catch (error) {
            // No existing rating - that's fine
            console.log('No existing rating found');
        }
    };

    const resetForm = () => {
        setRating(0);
        setHoverRating(0);
        setReview('');
        setIsSpoiler(false);
        setError(null);
        setExistingRating(null);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!movie || rating === 0) return;

        setIsSubmitting(true);
        setError(null);

        try {
            await ratingsApi.createOrUpdate(
                movie.id,
                movie.media_type,
                rating,
                review.trim() || undefined,
                isSpoiler
            );

            onRatingSubmitted?.(rating);
            handleClose();
        } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to save rating. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteRating = async () => {
        if (!existingRating) return;

        setIsSubmitting(true);
        setError(null);

        try {
            await ratingsApi.deleteRating(existingRating.id);
            onRatingSubmitted?.(0); // Indicate rating was removed
            handleClose();
        } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to delete rating. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStars = () => {
        const stars = [];
        const maxRating = 10;
        const displayRating = hoverRating || rating;

        for (let i = 1; i <= maxRating; i++) {
            const isHalf = displayRating >= i - 0.5 && displayRating < i;
            const isFull = displayRating >= i;

            stars.push(
                <button
                    key={i}
                    type="button"
                    className={`relative text-4xl transition-all duration-150 hover:scale-110 focus:outline-none ${isFull ? 'text-yellow-400' : isHalf ? 'text-yellow-400' : 'text-gray-600'
                        }`}
                    onMouseEnter={() => setHoverRating(i)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(i)}
                >
                    {isHalf ? '★' : isFull ? '★' : '☆'}
                </button>
            );
        }

        return stars;
    };

    const getRatingText = () => {
        const currentRating = hoverRating || rating;
        if (currentRating === 0) return 'Click to rate';

        const ratingTexts = {
            1: 'Terrible',
            2: 'Very Bad',
            3: 'Bad',
            4: 'Poor',
            5: 'Mediocre',
            6: 'Fair',
            7: 'Good',
            8: 'Very Good',
            9: 'Excellent',
            10: 'Masterpiece'
        };

        return `${currentRating}/10 - ${ratingTexts[currentRating as keyof typeof ratingTexts]}`;
    };

    if (!isOpen || !movie) return null;

    const posterUrl = movie.poster_path
        ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
        : null;

    const year = movie.release_date ? new Date(movie.release_date).getFullYear() :
        movie.first_air_date ? new Date(movie.first_air_date).getFullYear() : '';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

                {/* Header with Movie Info */}
                <div className="relative">
                    {/* Close Button */}
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 z-10 text-gray-400 hover:text-white transition-colors text-2xl font-bold bg-black bg-opacity-50 rounded-full w-8 h-8 flex items-center justify-center"
                    >
                        ×
                    </button>

                    {/* Movie Header */}
                    <div className="flex p-6 pb-4">
                        {posterUrl && (
                            <img
                                src={posterUrl}
                                alt={movie.title}
                                className="w-24 h-36 object-cover rounded-lg mr-6 flex-shrink-0"
                            />
                        )}
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-white mb-2">
                                {movie.title}
                            </h2>
                            {year && (
                                <p className="text-gray-400 text-lg mb-3">{year}</p>
                            )}
                            {movie.overview && (
                                <p className="text-gray-300 text-sm leading-relaxed line-clamp-4">
                                    {movie.overview}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Rating Form */}
                <form onSubmit={handleSubmit} className="px-6 pb-6">

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg">
                            <p className="text-red-200 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Existing Rating Notice */}
                    {existingRating && (
                        <div className="mb-4 p-3 bg-blue-900/50 border border-blue-500 rounded-lg">
                            <p className="text-blue-200 text-sm">
                                ✏️ You previously rated this movie {existingRating.rating}/10
                                {existingRating.review && ' with a review'}. You can update or delete your rating below.
                            </p>
                        </div>
                    )}

                    {/* Star Rating */}
                    <div className="mb-6">
                        <label className="block text-lg font-semibold text-white mb-4">
                            Your Rating
                        </label>
                        <div className="flex justify-center space-x-1 mb-3">
                            {renderStars()}
                        </div>
                        <p className="text-center text-lg font-medium text-yellow-400">
                            {getRatingText()}
                        </p>
                    </div>

                    {/* Review Text */}
                    <div className="mb-6">
                        <label className="block text-lg font-semibold text-white mb-3">
                            Review (Optional)
                        </label>
                        <textarea
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                            placeholder="Share your thoughts about this movie..."
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                            rows={4}
                            maxLength={1000}
                        />
                        <p className="text-right text-sm text-gray-400 mt-1">
                            {review.length}/1000 characters
                        </p>
                    </div>

                    {/* Spoiler Warning */}
                    <div className="mb-6">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={isSpoiler}
                                onChange={(e) => setIsSpoiler(e.target.checked)}
                                className="w-4 h-4 text-yellow-600 bg-gray-700 border-gray-600 rounded focus:ring-yellow-500 focus:ring-2"
                            />
                            <span className="ml-2 text-white">
                                This review contains spoilers
                            </span>
                        </label>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center">
                        <div>
                            {existingRating && (
                                <button
                                    type="button"
                                    onClick={handleDeleteRating}
                                    disabled={isSubmitting}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:opacity-50 text-white font-semibold rounded-lg transition duration-200"
                                >
                                    Delete Rating
                                </button>
                            )}
                        </div>

                        <div className="flex space-x-3">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={rating === 0 || isSubmitting}
                                className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-800 disabled:opacity-50 text-black font-semibold rounded-lg transition duration-200 flex items-center"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                                        {existingRating ? 'Updating...' : 'Saving...'}
                                    </>
                                ) : (
                                    existingRating ? 'Update Rating' : 'Save Rating'
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RatingModal;