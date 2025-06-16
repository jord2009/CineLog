import axios from 'axios';
import type { AuthResponse, Movie, RatingResponse } from '../types/api';

const API_BASE_URL = 'http://localhost:5003/api';

const api = axios.create({
    baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('cinelog_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authApi = {
    login: (email: string, password: string) =>
        api.post<AuthResponse>('/auth/login', { email, password }),

    register: (username: string, email: string, password: string, firstName?: string, lastName?: string) =>
        api.post<AuthResponse>('/auth/register', { username, email, password, firstName, lastName }),

    getCurrentUser: () =>
        api.get('/auth/me'),

    // Email verification endpoints
    verifyEmail: (token: string) =>
        api.post('/auth/verify-email', { token }),

    resendVerificationEmail: () =>
        api.post('/auth/resend-verification'),
};

export const moviesApi = {
    search: (query: string, page = 1) =>
        api.get(`/movies/search?query=${encodeURIComponent(query)}&page=${page}`),

    getTrending: (timeWindow = 'week') =>
        api.get(`/movies/trending?timeWindow=${timeWindow}`),

    getDetails: (id: number) =>
        api.get(`/movies/${id}`),
};

export const ratingsApi = {
    createOrUpdate: (tmdbId: number, mediaType: string, rating: number, review?: string, isSpoiler = false) =>
        api.post<RatingResponse>('/ratings', { tmdbId, mediaType, rating, review, isSpoiler }),

    getMyRatings: (page = 1, pageSize = 20) =>
        api.get<RatingResponse[]>(`/ratings/my-ratings?page=${page}&pageSize=${pageSize}`),

    getMediaStats: (tmdbId: number, mediaType: string) =>
        api.get(`/ratings/media/${tmdbId}/${mediaType}`),

    getMyRatingForMedia: (tmdbId: number, mediaType: string) =>
        api.get<RatingResponse>(`/ratings/my-rating/${tmdbId}/${mediaType}`),

    deleteRating: (ratingId: string) =>
        api.delete(`/ratings/${ratingId}`),
};

export default api;