// src/pages/VerifyEmailPage.tsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const VerifyEmailPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user, login } = useAuth();
    const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'expired'>('verifying');
    const [message, setMessage] = useState('');
    const [isResending, setIsResending] = useState(false);

    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Invalid verification link');
            return;
        }

        verifyEmail(token);
    }, [token]);

    const verifyEmail = async (verificationToken: string) => {
        try {
            const response = await authApi.verifyEmail(verificationToken);

            // Update user state with verified status
            if (user) {
                const updatedUser = { ...user, isEmailVerified: true };
                login(response.data.accessToken || localStorage.getItem('cinelog_token') || '', updatedUser);
            }

            setStatus('success');
            setMessage('Your email has been successfully verified!');

            // Redirect to home after 3 seconds
            setTimeout(() => {
                navigate('/');
            }, 3000);
        } catch (error: any) {
            if (error.response?.status === 410) {
                setStatus('expired');
                setMessage('This verification link has expired. Please request a new one.');
            } else {
                setStatus('error');
                setMessage(error.response?.data?.message || 'Verification failed. Please try again.');
            }
        }
    };

    const handleResendEmail = async () => {
        setIsResending(true);
        try {
            await authApi.resendVerificationEmail();
            setMessage('New verification email sent! Check your inbox.');
        } catch (error: any) {
            setMessage(error.response?.data?.message || 'Failed to send email. Try again later.');
        } finally {
            setIsResending(false);
        }
    };

    const getStatusIcon = () => {
        switch (status) {
            case 'verifying':
                return (
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto"></div>
                );
            case 'success':
                return (
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    </div>
                );
            case 'error':
            case 'expired':
                return (
                    <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </div>
                );
        }
    };

    const getStatusColor = () => {
        switch (status) {
            case 'verifying':
                return 'text-blue-400';
            case 'success':
                return 'text-green-400';
            case 'error':
            case 'expired':
                return 'text-red-400';
        }
    };

    const getStatusTitle = () => {
        switch (status) {
            case 'verifying':
                return 'Verifying Your Email...';
            case 'success':
                return 'Email Verified!';
            case 'expired':
                return 'Link Expired';
            case 'error':
                return 'Verification Failed';
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-gray-800 rounded-2xl shadow-2xl p-8 text-center">
                {/* Logo/Header */}
                <h1 className="text-3xl font-bold text-white mb-8">CineLog</h1>

                {/* Status Icon */}
                <div className="mb-6">
                    {getStatusIcon()}
                </div>

                {/* Status Title */}
                <h2 className={`text-2xl font-bold mb-4 ${getStatusColor()}`}>
                    {getStatusTitle()}
                </h2>

                {/* Status Message */}
                <p className="text-gray-300 mb-6 leading-relaxed">
                    {message}
                </p>

                {/* Actions */}
                <div className="space-y-4">
                    {status === 'success' && (
                        <div className="text-sm text-gray-400">
                            Redirecting to home page in 3 seconds...
                        </div>
                    )}

                    {(status === 'expired' || status === 'error') && user && (
                        <button
                            onClick={handleResendEmail}
                            disabled={isResending}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white font-semibold rounded-lg transition duration-200 flex items-center justify-center"
                        >
                            {isResending ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Sending...
                                </>
                            ) : (
                                'Send New Verification Email'
                            )}
                        </button>
                    )}

                    <button
                        onClick={() => navigate('/')}
                        className="w-full py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition duration-200"
                    >
                        Return to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmailPage;