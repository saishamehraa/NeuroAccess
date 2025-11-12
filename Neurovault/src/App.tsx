import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import { AuthContainer } from "./components/auth/AuthContainer";
import Dashboard from "./components/dashboard/Dashboard";
import { Sun, Moon } from "lucide-react";
import { ThemeProvider, useTheme } from "./hooks/useTheme";
import "./index.css";

// ------------------ Theme Toggle Button ------------------
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="absolute top-4 right-4 p-3 rounded-full z-50 flex items-center justify-center transition-all duration-300 hover:scale-110"
      style={{
        background:
          theme === "dark"
            ? "linear-gradient(135deg, #6b21a8, #a855f7)"
            : "linear-gradient(135deg, #5b21b6, #E0B0FF)",
      }}
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5 text-yellow-400" />
      ) : (
        <Moon className="w-5 h-5 text-gray-200" />
      )}
    </button>
  );
}

// ------------------ App Content Component ------------------
function AppContent() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    let mounted = true
    // Initialize session from Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, []);

  const backgroundStyle = {
    background:
      theme === "dark"
        ? "linear-gradient(135deg, #1a1a1a 50%, #5b21b6 50%)"
        : "linear-gradient(135deg, #E0B0FF 50%, #5b21b6 50%)",
    minHeight: "100vh",
    transition: "background 0.5s ease",
  };

  return (
    <div style={backgroundStyle} className="relative font-sans">
      <ThemeToggle />
      {loading ? (
        <div className="flex items-center justify-center min-h-screen text-2xl font-bold bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 text-transparent">
          Loading...
        </div>
      ) : (
        <Router basename="/neurovault">
          <Routes>
            <Route
              path="/"
              element={user ? <Navigate to="/dashboard" replace /> : <AuthContainer />}
            />
            <Route
              path="/dashboard"
              element={user ? <Dashboard session={user} /> : <Navigate to="/" replace />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      )}
    </div>
  );
}

// ------------------ Main App Component ------------------
export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
