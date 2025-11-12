// src/App.js
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { APP_URLS } from './utils/urls.js';

function WelcomePage() {
  const handleGetStarted = () => {
    window.location.href = APP_URLS.neurovault;
  };
  // Render only the small brand in the corner and a bottom-centered CTA.
  return (
    <div className="welcome-container" style={{ position: 'relative', zIndex: 10 }}>
      <header className="top-left-brand" aria-hidden>
        <div className="welcome-logo small">🧠</div>
        <div className="brand-text">NeuroAccess</div>
      </header>

      <div className="bottom-cta">
        <button className="cta-button" onClick={handleGetStarted}>
          Get Started →
        </button>
      </div>
    </div>
  );
  /* return (
    <div className="welcome-container">
      <div className="welcome-card">
        {/* Header} */
        /*
        <div className="welcome-header">
          <div className="welcome-logo">🧠</div>
          <h1 className="welcome-title">Welcome to NeuroAccess</h1>
          <p className="welcome-subtitle">
            Your All-in-One AI Intelligence Platform
          </p>
        </div>

        {/* Description }*/
        /*
        <p className="welcome-intro">
          Experience the power of three cutting-edge AI applications unified in one seamless platform.
        </p>

        <div className="feature-grid">
          <FeatureCard
            icon="🤖"
            title="NeuroVault"
            color="purple"
            description="Advanced AI chat dashboard with multiple model support, conversation history, and intelligent analytics."
          />
          <FeatureCard
            icon="✨"
            title="Prompt Gallery"
            color="blue"
            description="Discover 20+ curated AI prompts across categories like creative writing, coding, business, and education."
          />
          <FeatureCard
            icon="📊"
            title="AI Comparison Hub"
            color="green"
            description="Compare AI models side-by-side, analyze performance metrics, and find the perfect model for your needs."
          />
        </div>

        {/* CTA }*/
        /*
        <div className="cta-container">
          <button className="cta-button" onClick={handleGetStarted}>
            Get Started →
          </button>
          <p className="cta-note">
            Sign in or create an account to access all features
          </p>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, color, description }) {
  return (
    <div className={`feature-card feature-${color}`}>
      <div className="feature-icon">{icon}</div>
      <h3 className={`feature-title text-${color}`}>{title}</h3>
      <p className="feature-description">{description}</p>
    </div>
  );
*/

}

export default function App() {
  return (
    <>
      <video
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          width: '100%',
          height: '100%',
          zIndex: -1,
          objectFit: 'cover',
          pointerEvents: 'none'
        }}
      >
        <source src="/welcomePage.mp4" type="video/mp4" />
        {/* Fallback message for very old browsers */}
        Your browser does not support the video tag.
      </video>

      <Router>
        <Routes>
          <Route path="/" element={<WelcomePage />} />
        </Routes>
      </Router>
    </>
  );
}
