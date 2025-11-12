import React, { useState } from 'react';
import { useTheme } from '../../hooks/useTheme';

interface ForgotPasswordFormProps {
  onForgotPassword: (email: string) => void;
  onBackToLogin: () => void;
  isLoading: boolean;
  error?: string | null;
}

export function ForgotPasswordForm({
  onForgotPassword,
  onBackToLogin,
  isLoading,
  error,
}: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const { theme } = useTheme();

  // Client-side email validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError('Email is required');
      return false;
    }
    if (!emailRegex.test(email.trim())) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (emailError && value.trim()) {
      validateEmail(value);
    }
    // Reset success state when user starts typing again
    if (emailSent) {
      setEmailSent(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const isEmailValid = validateEmail(email);
    if (!isEmailValid) {
      return;
    }
    
    onForgotPassword(email.trim());
  };

  // Handle success from parent component (when no error is present and was loading)
  React.useEffect(() => {
    if (!isLoading && !error && email.trim()) {
      // This indicates success - the form was submitted and no error occurred
      setEmailSent(true);
    }
  }, [isLoading, error, email]);

  // Theme-based gradients
  const headingGradient =
    theme === 'dark'
      ? 'bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400'
      : 'bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500';

  const backBtnGradient =
    theme === 'dark'
      ? 'bg-gradient-to-r from-green-400 via-teal-400 to-cyan-400'
      : 'bg-gradient-to-r from-purple-700 via-pink-600 to-blue-600';

  const isFormValid = email.trim() && !emailError;

  return (
    <div className="w-full max-w-md mx-auto transition-colors duration-300">
      {/* Success Message */}
      {emailSent && !error && (
        <div className="mb-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700">
          <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold">Email sent successfully!</span>
          </div>
          <p className="mt-2 text-sm text-green-700 dark:text-green-300">
            If an account with this email exists, you'll receive password reset instructions shortly. Check your inbox and spam folder.
          </p>
        </div>
      )}

      {/* Heading */}
      <div className="text-center mb-12">
        <h1
          className={`text-5xl font-bold mb-4 text-transparent bg-clip-text ${headingGradient} leading-tight`}
        >
          Reset Password
        </h1>
        <p className="text-lg font-medium text-gray-700 dark:text-purple-200 px-2">
          Enter your email to receive reset instructions
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8" noValidate>
        {/* Email Input */}
        <div>
          <input
            type="email"
            value={email}
            onChange={handleEmailChange}
            onBlur={() => validateEmail(email)}
            placeholder="Email"
            aria-label="Email address"
            aria-invalid={!!emailError}
            aria-describedby={emailError ? "email-error" : "email-help"}
            className={`
              w-full text-lg pb-3 px-3 rounded-md border-2 focus:outline-none focus:ring-2 transition-colors duration-300
              bg-transparent
              ${emailError
                ? 'border-red-500 focus:border-red-500 focus:ring-red-400 dark:border-red-400 dark:focus:border-red-400 dark:focus:ring-red-500'
                : theme === 'dark'
                ? 'text-white placeholder-gray-400 border-purple-700 focus:border-pink-400 focus:ring-pink-500'
                : 'text-gray-900 placeholder-gray-500 border-purple-300 focus:border-pink-500 focus:ring-pink-400'
              }
            `}
            required
          />
          {emailError && (
            <p id="email-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
              {emailError}
            </p>
          )}
          {!emailError && (
            <p id="email-help" className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              We'll send reset instructions if this email is registered
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !isFormValid || emailSent}
          aria-describedby={isLoading ? "submit-status" : undefined}
          className={`
            w-full text-white text-lg font-semibold py-4 rounded-full transition-all duration-300 
            disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105
            focus:outline-none focus:ring-2 focus:ring-offset-2
            ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-purple-400 to-purple-700 focus:ring-purple-500'
                : 'bg-gradient-to-r from-purple-700 to-purple-900 focus:ring-purple-600'
            }
          `}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div 
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"
                aria-hidden="true"
              ></div>
              <span id="submit-status">Sending instructions...</span>
            </div>
          ) : emailSent ? (
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Instructions Sent
            </div>
          ) : (
            'Send Reset Instructions'
          )}
        </button>

        {/* Additional Actions */}
        <div className="space-y-4">
          {/* Back to Login */}
          <div className="text-center">
            <button
              type="button"
              onClick={onBackToLogin}
              disabled={isLoading}
              className={`
                font-semibold text-transparent bg-clip-text hover:opacity-80 transition-all duration-300 
                disabled:opacity-50 focus:outline-none focus:underline ${backBtnGradient}
              `}
            >
              ← Back to Login
            </button>
          </div>

          {/* Resend Option (only show after successful send) */}
          {emailSent && (
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Didn't receive the email?
              </p>
              <button
                type="button"
                onClick={() => {
                  setEmailSent(false);
                  validateEmail(email) && onForgotPassword(email.trim());
                }}
                disabled={isLoading}
                className="text-sm text-gray-700 dark:text-purple-300 hover:opacity-80 font-medium transition-colors duration-300 disabled:opacity-50 focus:outline-none focus:underline"
              >
                Resend Instructions
              </button>
            </div>
          )}

          {/* Helpful Tips */}
          <div className="mt-6 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
              💡 Tips:
            </h3>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Check your spam/junk folder</li>
              <li>• The link expires after 1 hour</li>
              <li>• Make sure you entered the correct email</li>
              <li>• Contact support if you continue having issues</li>
            </ul>
          </div>
        </div>
      </form>
    </div>
  );
}