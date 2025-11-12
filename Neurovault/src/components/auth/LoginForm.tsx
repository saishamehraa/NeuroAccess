import React, { useState } from "react";
// Firebase references removed; Supabase handles auth
import { useTheme } from "../../hooks/useTheme";

interface LoginFormProps {
  onLogin: (email: string, password: string) => void;
  onOAuthSignIn?: (provider: 'google' | 'github') => void;
  switchMode: () => void;
  onForgotPassword: () => void;
  isLoading: boolean;
  error?: string | null;
}

export function LoginForm({
  onLogin,
  onOAuthSignIn,
  switchMode,
  onForgotPassword,
  isLoading,
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // google loading removed - Supabase handles OAuth
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const { theme } = useTheme();

  // Client-side email validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError("Email is required");
      return false;
    }
    if (!emailRegex.test(email.trim())) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError("");
    return true;
  };

  // Client-side password validation
  const validatePassword = (password: string): boolean => {
    if (!password.trim()) {
      setPasswordError("Password is required");
      return false;
    }
    if (password.trim().length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (emailError && value.trim()) {
      validateEmail(value);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (passwordError && value.trim()) {
      validatePassword(value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    
    if (!isEmailValid || !isPasswordValid) {
      return;
    }
    
    onLogin(email.trim(), password.trim());
  };

  // Google sign-in handled via Supabase in AuthContainer; removed Firebase-specific logic

  const isFormValid = email.trim() && password.trim() && !emailError && !passwordError;

  return (
    <div className="w-full max-w-md mx-auto transition-colors duration-300">
      {/* Heading */}
      <div className="text-center mb-12 pb-3">
        <h1
          className="text-5xl font-bold text-transparent bg-clip-text leading-relaxed transition-all duration-300"
          style={{
            backgroundImage: theme === "dark" 
              ? "linear-gradient(to right, #22d3ee, #a855f7, #ec4899)"
              : "linear-gradient(to right, #9333ea, #db2777, #dc2626)"
          }}
        >
          Login
        </h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
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
            aria-describedby={emailError ? "email-error" : undefined}
            className={`
              w-full text-lg pb-3 px-3 rounded-md border-2 
              bg-transparent focus:outline-none focus:ring-2 transition-colors duration-300
              ${emailError 
                ? 'border-red-500 focus:border-red-500 focus:ring-red-400 dark:border-red-400 dark:focus:border-red-400 dark:focus:ring-red-500'
                : 'border-purple-300 focus:border-pink-500 focus:ring-pink-400 dark:border-purple-700 dark:focus:border-pink-400 dark:focus:ring-pink-500'
              }
              text-gray-900 placeholder-gray-600 
              dark:text-white dark:placeholder-purple-300
            `}
            required
          />
          {emailError && (
            <p id="email-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
              {emailError}
            </p>
          )}
        </div>

        {/* Password Input */}
        <div>
          <input
            type="password"
            value={password}
            onChange={handlePasswordChange}
            onBlur={() => validatePassword(password)}
            placeholder="Password"
            aria-label="Password"
            aria-invalid={!!passwordError}
            aria-describedby={passwordError ? "password-error" : undefined}
            className={`
              w-full text-lg pb-3 px-3 rounded-md border-2 
              bg-transparent focus:outline-none focus:ring-2 transition-colors duration-300
              ${passwordError 
                ? 'border-red-500 focus:border-red-500 focus:ring-red-400 dark:border-red-400 dark:focus:border-red-400 dark:focus:ring-red-500'
                : 'border-purple-300 focus:border-pink-500 focus:ring-pink-400 dark:border-purple-700 dark:focus:border-pink-400 dark:focus:ring-pink-500'
              }
              text-gray-900 placeholder-gray-600 
              dark:text-white dark:placeholder-purple-300
            `}
            required
          />
          {passwordError && (
            <p id="password-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
              {passwordError}
            </p>
          )}
        </div>

        {/* Normal Login */}
        <button
          type="submit"
          disabled={isLoading || !isFormValid}
          aria-describedby={isLoading ? "login-status" : undefined}
          className={`
            w-full text-white text-lg font-semibold py-4 rounded-full
            transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
            transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2
            ${
              theme === "dark"
                ? "bg-gradient-to-r from-purple-400 to-purple-700 focus:ring-purple-500"
                : "bg-gradient-to-r from-purple-700 to-purple-900 focus:ring-purple-600"
            }
          `}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div 
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"
                aria-hidden="true"
              ></div>
              <span id="login-status">Signing in...</span>
            </div>
          ) : (
            "Login"
          )}
        </button>

        {/* OAuth buttons */}
        <div className="space-y-3 mt-6">
          <button
            type="button"
            onClick={() => onOAuthSignIn && onOAuthSignIn('google')}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border rounded-lg bg-white/10 text-white"
          >
            {/* Google SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48" className="inline-block" aria-hidden>
              <path fill="#EA4335" d="M24 9.5c3.9 0 6.6 1.7 8.1 3.1l6-6C34.1 2.9 29.5 1 24 1 14.9 1 7.3 6 3.4 13.1l7.3 5.7C12.9 13.5 17.9 9.5 24 9.5z"/>
              <path fill="#34A853" d="M46.5 24.5c0-1.5-.1-2.6-.4-3.8H24v7.2h12.8c-.6 3.2-2.8 6.1-6.1 7.8l7.4 5.7C44.8 38.3 46.5 31.9 46.5 24.5z"/>
              <path fill="#4A90E2" d="M10.7 28.8c-.7-2-1.1-4.2-1.1-6.4s.4-4.4 1.1-6.4L3.4 10.3C1.2 13.9 0 18 0 22.4s1.2 8.5 3.4 12.1l7.3-5.7z"/>
              <path fill="#FBBC05" d="M24 46c5.5 0 10.1-1.9 13.5-5.2l-7.4-5.7c-2 1.4-4.5 2.2-6.9 2.2-6 0-11-4-12.9-9.4L3.4 34.9C7.3 42 14.9 47 24 47z"/>
            </svg>
            <span>Continue with Google</span>
          </button>
          <button
            type="button"
            onClick={() => onOAuthSignIn && onOAuthSignIn('github')}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border rounded-lg bg-white/5 text-white"
          >
            {/* GitHub SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" className="inline-block" aria-hidden>
              <path fill="currentColor" d="M12 .5C5.7.5.8 5.4.8 11.6c0 5 3.2 9.2 7.6 10.7.6.1.8-.3.8-.6v-2c-3.1.7-3.7-1.4-3.7-1.4-.5-1.2-1.2-1.6-1.2-1.6-1-.7.1-.7.1-.7 1.1.1 1.7 1.1 1.7 1.1 1 .1 1.6.7 1.8 1.1.2-.9.6-1.5 1-1.9-2.5-.3-5.1-1.3-5.1-5.8 0-1.3.5-2.4 1.2-3.3-.1-.3-.5-1.6.1-3.4 0 0 1-.3 3.3 1.2.9-.3 1.9-.4 2.8-.4s1.9.1 2.8.4c2.2-1.5 3.3-1.2 3.3-1.2.6 1.8.2 3.1.1 3.4.8.9 1.2 2 1.2 3.3 0 4.5-2.6 5.5-5.1 5.8.6.5 1.1 1.4 1.1 2.8v4.1c0 .3.2.7.8.6 4.4-1.5 7.6-5.7 7.6-10.7C23.2 5.4 18.3.5 12 .5z"/>
            </svg>
            <span>Continue with GitHub</span>
          </button>
        </div>

        {/* Google sign-in is handled by Supabase via the parent auth flow */}

        {/* Forgot Password */}
        <div className="text-center mt-6">
          <button
            type="button"
            onClick={onForgotPassword}
            disabled={isLoading}
            className="
              text-purple-700 dark:text-purple-300 
              hover:opacity-80 font-semibold transition-colors duration-300 disabled:opacity-50
              focus:outline-none focus:underline
            "
          >
            Forgot Password?
          </button>
        </div>

        {/* Switch Mode */}
        <div className="text-center mt-6">
          <span className="text-gray-700 dark:text-gray-300">Not a user? </span>
          <button
            type="button"
            onClick={switchMode}
            disabled={isLoading}
            className="
              text-purple-700 dark:text-purple-300 
              hover:opacity-80 font-semibold transition-colors duration-300 disabled:opacity-50
              focus:outline-none focus:underline
            "
          >
            Sign Up
          </button>
        </div>
      </form>
    </div>
  );
}