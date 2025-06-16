import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';

const EmailVerificationBanner: React.FC = () => {
    const { user } = useAuth();
    const [isResending, setIsResending] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [isVisible, setIsVisible] = useState(true);

    // Don't show banner if user is verified or not logged in
    if (!user || user.isEmailVerified || !isVisible) {
        return null;
    }

    const handleResendEmail = async () => {
        setIsResending(true);
        setMessage(null);

        try {
            await authApi.resendVerificationEmail();
            setMessage('Verification email sent! Check your inbox.');
        } catch (error: any) {
            setMessage(error.response?.data?.message || 'Failed to send email. Try again later.');
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="bg-yellow-600 border-l-4 border-yellow-500 text-yellow-100 p-4 relative">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-medium">
                            Please verify your email address to start rating movies.
                        </p>
                        {message && (
                            <p className={`text-xs mt-1 ${message.includes('sent') ? 'text-green-200' : 'text-red-200'}`}>
                                {message}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    <button
                        onClick={handleResendEmail}
                        disabled={isResending}
                        className="bg-yellow-500 hover:bg-yellow-400 disabled:bg-yellow-700 text-yellow-900 font-semibold py-1 px-3 rounded text-sm transition duration-200 flex items-center"
                    >
                        {isResending ? (
                            <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-yellow-900 mr-1"></div>
                                Sending...
                            </>
                        ) : (
                            'Resend Email'
                        )}
                    </button>

                    <button
                        onClick={() => setIsVisible(false)}
                        className="text-yellow-200 hover:text-white transition-colors"
                    >
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EmailVerificationBanner;