export interface Movie {
    id: string | number;
    tmdbId?: number;
    title: string;
    name?: string; 
    original_title?: string;
    original_name?: string;
    overview?: string;
    release_date?: string;
    first_air_date?: string;
    poster_path?: string;
    backdrop_path?: string;
    vote_average?: number;
    vote_count?: number;
    popularity?: number;
    genre_ids?: number[];
    adult?: boolean;
    original_language?: string;
    media_type: string;
    userRating?: number;

export interface User {
    id: string;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    isEmailVerified: boolean;
    createdAt: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
    user: User;
}

export interface RatingResponse {
    id: string;
    userId: string;
    mediaId: string;
    rating: number;
    review?: string;
    isSpoiler: boolean;
    createdAt: string;
    updatedAt: string;
    username: string;
    userAvatarUrl?: string;
    mediaTitle: string;
    mediaPosterUrl?: string;
    mediaType: string;
    tmdbId: number;
    starRating: string;
}