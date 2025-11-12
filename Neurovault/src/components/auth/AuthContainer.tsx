import { useState } from "react";
import { LoginForm } from "./LoginForm";
import { SignupForm } from "./SignupForm";
import { ForgotPasswordForm } from "./ForgotPasswordForm";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";

type AuthMode = "login" | "signup" | "forgot";

interface AuthError {
  message: string;
  type: 'error' | 'success' | 'info';
}

export function AuthContainer() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<AuthError | null>(null);
  const navigate = useNavigate();

  // Read optional return_to from query string so external apps can redirect here
  // and then return the user to their original location after sign-in.
  const getReturnTo = () => {
    try {
      const params = new URLSearchParams(window.location.search)
      const rt = params.get('return_to')
      if (!rt) return null
      return decodeURIComponent(rt)
    } catch (e) {
      return null
    }
  }
  const returnTo = getReturnTo()

  // Clear error when switching modes
  const switchMode = (newMode: AuthMode) => {
    setAuthError(null);
    setMode(newMode);
  };

  // Supabase error handling is done inline where used

  // -------------------- LOGIN --------------------
  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: password.trim() });
      if (error) throw error;
  // Redirect back to calling app if provided, otherwise dashboard
  navigate(returnTo || "/dashboard");
    } catch (err: any) {
      setAuthError({ message: err.message || 'Login failed', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------- SIGNUP --------------------
  const handleSignup = async (email: string, password: string) => {
    // Client-side validation
    if (password.trim().length < 6) {
      setAuthError({
        message: "Password must be at least 6 characters long.",
        type: 'error'
      });
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setAuthError({
        message: "Please enter a valid email address.",
        type: 'error'
      });
      return;
    }

    setIsLoading(true);
    setAuthError(null);
    try {
      const { data, error } = await supabase.auth.signUp({ email: email.trim(), password: password.trim() });
      if (error) throw error;

      // When signUp succeeds, supabase may or may not return a session depending on settings
      // If a user object is present, create a profile row in 'profiles' table.
      const user = (data as any)?.user;
      if (user && user.id) {
        const { error: insertErr } = await supabase.from('profiles').insert({ id: user.id, email: email.trim() });
        if (insertErr) {
          // Non-fatal: show a warning but don't block signup flow
          console.warn('[AuthContainer] Failed to create profile row:', insertErr.message || insertErr);
        }
      }

      // Navigate to dashboard if the signup created a session; otherwise wait for confirmation flow
      if ((data as any)?.session) {
        navigate(returnTo || '/dashboard');
      } else {
        // No immediate session (email confirmation required) - show info message and stay on auth page
        setAuthError({ message: 'Check your email for confirmation instructions.', type: 'info' });
      }
    } catch (err: any) {
      setAuthError({ message: err.message || 'Signup failed', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------- FORGOT PASSWORD --------------------
  const handleForgotPassword = async (email: string) => {
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setAuthError({
        message: "Please enter a valid email address.",
        type: 'error'
      });
      return;
    }

    setIsLoading(true);
    setAuthError(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      if (error) throw error;
      setAuthError({ message: "Reset instructions sent! Please check your email.", type: 'success' });
      setTimeout(() => {
        setMode("login");
        setAuthError(null);
      }, 3000);
    } catch (err: any) {
      setAuthError({ message: err.message || 'Failed to send reset email', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------- SIGNUP SUCCESS CALLBACKS --------------------
  const handleSignupSuccess = () => {
    // Don't show success message here - SignupForm handles it
  };

  const handleRedirectToDashboard = () => {
    navigate("/dashboard");
  };

  // -------------------- OAUTH (Google / GitHub) --------------------
  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    setIsLoading(true);
    setAuthError(null);
    try {
      // Use returnTo if provided so external apps can redirect back
      const redirectTo = returnTo || `${window.location.origin}/neurovault/`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
        },
      });
      if (error) throw error;
      // Note: Supabase will redirect the browser to the provider and back.
    } catch (err: any) {
      setAuthError({ message: err.message || 'OAuth sign-in failed', type: 'error' });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      {/* Error/Success Message Display */}
      {authError && (
        <div className={`mb-6 p-4 rounded-lg border max-w-md w-full ${
          authError.type === 'error' 
            ? 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700 text-red-800 dark:text-red-200'
            : authError.type === 'success'
            ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700 text-green-800 dark:text-green-200'
            : 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-200'
        }`}>
          <div className="flex items-center gap-2">
            {authError.type === 'error' ? (
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zM9 14a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            )}
            <span className="text-sm font-medium">{authError.message}</span>
          </div>
        </div>
      )}

      {mode === "login" && (
        <LoginForm
          onLogin={handleLogin}
          onOAuthSignIn={handleOAuthSignIn}
          switchMode={() => switchMode("signup")}
          onForgotPassword={() => switchMode("forgot")}
          isLoading={isLoading}
          error={authError?.type === 'error' ? authError.message : null}
        />
      )}
      {mode === "signup" && (
        <SignupForm
          onSignup={handleSignup}
          onOAuthSignIn={handleOAuthSignIn}
          switchMode={() => switchMode("login")}
          isLoading={isLoading}
          onSignupSuccess={handleSignupSuccess}
          onRedirectToDashboard={handleRedirectToDashboard}
          error={authError?.type === 'error' ? authError.message : null}
        />
      )}
      {mode === "forgot" && (
        <ForgotPasswordForm
          onForgotPassword={handleForgotPassword}
          onBackToLogin={() => switchMode("login")}
          isLoading={isLoading}
          error={authError?.type === 'error' ? authError.message : null}
        />
      )}
    </div>
  );
}