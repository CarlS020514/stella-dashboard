'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userConfig, setUserConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        setIsAuthenticated(data.authenticated);
        if (data.authenticated) {
          setUser(data.user);
          fetch('/api/vip/get-rank')
            .then(r => r.json())
            .then(config => setUserConfig(config))
            .catch(() => {});
        }
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
            <h3>Embed Generator</h3>
            <p>Create beautiful, customized embed messages with live previews.</p>
          </div>
          <div className="feature-card">
            <h3>PRO Features</h3>
            <p>Customize sender profiles, unlock advanced webhooks, and more.</p>
          </div>
          <div className="feature-card">
            <h3>Lightning Fast</h3>
            <p>Zero latency delivery directly to your Discord channels.</p>
          </div>
          <div className="feature-card">
            <h3>Level Count</h3>
            <p>Earn XP globally, level up, and unlock VIP multipliers across all servers.</p>
          </div>
        </div>

        <div className="cta-section">
          {!isAuthenticated ? (
            <button className="btn btn-discord large-btn" onClick={handleLogin}>
              Login with Discord
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px' }}>
              {/* Profile Card */}
              {user && (
                <div className="home-profile-card">
                  <img src={user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : "https://cdn.discordapp.com/embed/avatars/0.png"} className="home-avatar" />
                  <div className="home-profile-info">
                    <div style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{user.username}</div>
                    <div style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '8px' }}>Discord ID: {user.id}</div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <span style={{ background: '#5865F2', padding: '3px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                        Global Level {userConfig?.global_level || userConfig?.level || 1}
                      </span>
                      {user.is_vip_plus ? (
                        <span style={{ background: '#f1c40f', color: '#000', padding: '3px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>VIP+</span>
                      ) : user.is_vip ? (
                        <span style={{ background: '#57F287', color: '#000', padding: '3px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>VIP</span>
                      ) : (
                        <span style={{ background: '#333', padding: '3px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>Standard</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="home-cta-buttons" style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <Link href="/embed" className="btn btn-primary large-btn">
                  Open Embed Generator
                </Link>
                <Link href="/rank-management" className="btn btn-discord large-btn">
                  Open Rank Management
                </Link>
                <Link href="/global-ranking" className="btn large-btn" style={{ background: '#3ba55c', color: 'white' }}>
                  Global Leaderboard
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
