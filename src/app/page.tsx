'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        setIsAuthenticated(data.authenticated);
        setLoading(false);
      });
  }, []);

  const handleLogin = () => {
    window.location.href = '/api/auth/login';
  };

  if (loading) {
    return <div className="loading-screen">Loading Stella Hub...</div>;
  }

  return (
    <div className="home-container">
      <div className="glass-panel text-center hero-panel">
        <h1 className="hero-title">Stella Dashboard</h1>
        <p className="hero-subtitle">The ultimate command center for your Discord servers.</p>
        
        <div className="feature-grid">
          <div className="feature-card">
            <h3>🎨 Embed Generator</h3>
            <p>Create beautiful, customized embed messages with live previews.</p>
          </div>
          <div className="feature-card">
            <h3>👑 PRO Features</h3>
            <p>Customize sender profiles, unlock advanced webhooks, and more.</p>
          </div>
          <div className="feature-card">
            <h3>⚡ Lightning Fast</h3>
            <p>Zero latency delivery directly to your Discord channels.</p>
          </div>
        </div>

        <div className="cta-section">
          {!isAuthenticated ? (
            <button className="btn btn-discord large-btn" onClick={handleLogin}>
              Login with Discord
            </button>
          ) : (
            <div className="cta-buttons">
              <Link href="/embed" className="btn btn-primary large-btn">
                Open Embed Generator
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
