import React, { useState } from "react";
import { useTheme } from "../../hooks/useTheme";

interface SignupFormProps {
  onSignup: (email: string, password: string) => void;
  onOAuthSignIn?: (provider: 'google' | 'github') => void;
  switchMode: () => void;
  isLoading: boolean;
  onSignupSuccess?: () => void;
  onRedirectToDashboard?: () => void;
  error?: string | null;
}

export function SignupForm({ onSignup, switchMode, isLoading, onOAuthSignIn }: SignupFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState<number>(0);
  const [passwordHint, setPasswordHint] = useState<string>("");
  const { theme } = useTheme();

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value.trim()) return "Email is required";
    if (!emailRegex.test(value.trim())) return "Please enter a valid email address";
    return "";
  };

  const validatePassword = (value: string) => {
    if (!value.trim()) return "Password is required";
    if (value.trim().length < 6) return "Password must be at least 6 characters";
    return "";
  };

  // Simple password strength estimator: score 0-4
  const estimatePasswordStrength = (value: string) => {
    // Baseline: password must be at least 6 chars to get any points
    if (!value || value.length < 6) return 0;
    let score = 0;
    // length >= 6 gives 1 point, length >=8 gives an extra point
    if (value.length >= 6) score++;
    if (value.length >= 8) score++;
    if (/[A-Z]/.test(value)) score++;
    if (/[0-9]/.test(value)) score++;
    // cap to 4
    return Math.min(score, 4);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    const cErr = password === confirmPassword ? "" : "Passwords do not match";
    setEmailError(eErr);
    setPasswordError(pErr);
    setConfirmPasswordError(cErr);

    if (eErr || pErr || cErr) return;

    // Delegate signup to parent (AuthContainer will use Supabase)
    onSignup(email.trim(), password.trim());
  };

  return (
    <div className="w-full max-w-md mx-auto transition-colors duration-300">
      <div className="text-center mb-12 pb-3">
        <h1
          className="text-5xl font-bold text-transparent bg-clip-text leading-relaxed transition-all duration-300"
          style={{
            backgroundImage: theme === "dark" ? "linear-gradient(to right, #10b981, #06b6d4, #3b82f6)" : "linear-gradient(to right, #059669, #0891b2, #2563eb)",
          }}
        >
          Sign Up
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full text-lg pb-3 px-3 rounded-md border-2 bg-transparent"
            required
          />
          {emailError && <p className="mt-1 text-sm text-red-600">{emailError}</p>}
        </div>

        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              const val = e.target.value;
              setPassword(val);
              // Update strength
              const s = estimatePasswordStrength(val);
              setPasswordStrength(s);
              if (s <= 1) setPasswordHint('Weak — use at least 8 chars, a number and a symbol');
              else if (s === 2) setPasswordHint('Fair — add uppercase or a symbol to improve');
              else if (s === 3) setPasswordHint('Good — consider adding a symbol');
              else setPasswordHint('Strong password');
            }}
            placeholder="Password (min 6 chars)"
            className="w-full text-lg pb-3 px-3 rounded-md border-2 bg-transparent"
            required
          />
          {passwordError && <p className="mt-1 text-sm text-red-600">{passwordError}</p>}

          {/* Password strength meter: segmented 0-4 (5 segments), color-coded */}
          <div className="mt-2">
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map((i) => {
                // active color depends on overall passwordStrength
                const activeColor =
                  passwordStrength <= 1
                    ? 'bg-red-500'
                    : passwordStrength === 2
                    ? 'bg-yellow-400'
                    : passwordStrength === 3
                    ? 'bg-blue-400'
                    : 'bg-green-400';

                const isActive = passwordStrength > i;
                return (
                  <div
                    key={i}
                    className={`flex-1 h-2 rounded ${isActive ? activeColor : 'bg-gray-300 dark:bg-gray-600'}`}
                    aria-hidden
                  />
                );
              })}
            </div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-600 dark:text-gray-300">{passwordHint}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Strength: {passwordStrength}/4</p>
            </div>
          </div>
        </div>

        <div>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
            className="w-full text-lg pb-3 px-3 rounded-md border-2 bg-transparent"
            required
          />
          {confirmPasswordError && <p className="mt-1 text-sm text-red-600">{confirmPasswordError}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full text-white text-lg font-semibold py-4 rounded-full bg-gradient-to-r from-blue-600 to-indigo-700"
        >
          {isLoading ? "Creating account..." : "Sign Up"}
        </button>

        {/* OAuth buttons */}
        <div className="space-y-3 mt-6">
          <button
            type="button"
            onClick={() => onOAuthSignIn?.('google')}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border rounded-lg bg-white/10 text-white"
            onMouseDown={(e) => e.preventDefault()}
            aria-label="Continue with Google"
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
            onClick={() => onOAuthSignIn?.('github')}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border rounded-lg bg-white/5 text-white"
            onMouseDown={(e) => e.preventDefault()}
            aria-label="Continue with GitHub"
          >
            {/* GitHub SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" className="inline-block" aria-hidden>
              <path fill="currentColor" d="M12 .5C5.7.5.8 5.4.8 11.6c0 5 3.2 9.2 7.6 10.7.6.1.8-.3.8-.6v-2c-3.1.7-3.7-1.4-3.7-1.4-.5-1.2-1.2-1.6-1.2-1.6-1-.7.1-.7.1-.7 1.1.1 1.7 1.1 1.7 1.1 1 .1 1.6.7 1.8 1.1.2-.9.6-1.5 1-1.9-2.5-.3-5.1-1.3-5.1-5.8 0-1.3.5-2.4 1.2-3.3-.1-.3-.5-1.6.1-3.4 0 0 1-.3 3.3 1.2.9-.3 1.9-.4 2.8-.4s1.9.1 2.8.4c2.2-1.5 3.3-1.2 3.3-1.2.6 1.8.2 3.1.1 3.4.8.9 1.2 2 1.2 3.3 0 4.5-2.6 5.5-5.1 5.8.6.5 1.1 1.4 1.1 2.8v4.1c0 .3.2.7.8.6 4.4-1.5 7.6-5.7 7.6-10.7C23.2 5.4 18.3.5 12 .5z"/>
            </svg>
            <span>Continue with GitHub</span>
          </button>
        </div>

        <div className="text-center mt-6">
          <span className="text-gray-700 dark:text-gray-300">Already have an account? </span>
          <button type="button" onClick={switchMode} disabled={isLoading} className="text-blue-700">
            Login
          </button>
        </div>
      </form>
    </div>
  );
}