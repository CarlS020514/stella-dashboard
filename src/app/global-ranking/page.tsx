'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function GlobalRanking() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/global-ranking')
      .then(res => res.json())
      .then(data => {
        if (data.leaderboard) {
          setLeaderboard(data.leaderboard);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleCopyId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click from triggering
    navigator.clipboard.writeText(id);
    
    // Quick visual feedback on the button
    const btn = e.currentTarget as HTMLButtonElement;
    const originalText = btn.innerText;
    btn.innerText = 'Copied!';
    btn.style.background = '#43b581';
    setTimeout(() => {
      btn.innerText = originalText;
      btn.style.background = '#5865F2';
    }, 1500);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.1)', borderTop: '4px solid #5865F2', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <h2 style={{ color: '#b5bac1', fontWeight: 500 }}>Loading Leaderboard...</h2>
        </div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ padding: '60px 20px', maxWidth: 900, margin: '0 auto', color: '#fff', fontFamily: "'Inter', 'Roboto', sans-serif" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
        <div>
          <h1 style={{ fontSize: '2.8rem', fontWeight: 900, margin: '0 0 10px 0', background: 'linear-gradient(135deg, #5865F2, #00f2fe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-1px' }}>
            Global Leaderboard
          </h1>
          <p style={{ margin: 0, color: '#b5bac1', fontSize: '1.1rem' }}>Top 50 most active users across all servers.</p>
        </div>
        <Link 
          href="/" 
          style={{ 
            padding: '12px 24px', 
            background: 'rgba(255,255,255,0.05)', 
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12, 
            color: 'white', 
            textDecoration: 'none', 
            fontWeight: '600',
            transition: 'all 0.2s ease',
            backdropFilter: 'blur(10px)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Back to Dashboard
        </Link>
      </div>

      <div style={{ 
        background: 'rgba(30, 31, 34, 0.7)', 
        borderRadius: 16, 
        padding: 24, 
        boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
        border: '1px solid rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)'
      }}>
        {leaderboard.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#b5bac1', padding: 60, fontSize: '1.2rem' }}>No users ranked yet. Start chatting!</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {leaderboard.map((user, index) => {
              const isTop3 = index < 3;
              const rankColor = index === 0 ? '#FFD700' : index === 1 ? '#E3E3E3' : index === 2 ? '#CD7F32' : '#b5bac1';
              const rankSize = isTop3 ? '1.5rem' : '1.2rem';
              const bgGradient = index === 0 
                ? 'linear-gradient(90deg, rgba(255,215,0,0.15) 0%, rgba(30,31,34,0) 100%)' 
                : index === 1 
                ? 'linear-gradient(90deg, rgba(227,227,227,0.1) 0%, rgba(30,31,34,0) 100%)'
                : index === 2
                ? 'linear-gradient(90deg, rgba(205,127,50,0.1) 0%, rgba(30,31,34,0) 100%)'
                : 'transparent';

              const isExpanded = selectedUserId === user._id;

              return (
                <div key={user._id} style={{ display: 'flex', flexDirection: 'column' }}>
                  <div 
                    onClick={() => setSelectedUserId(isExpanded ? null : user._id)}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      background: isExpanded ? 'rgba(43, 45, 49, 0.9)' : 'rgba(43, 45, 49, 0.4)',
                      backgroundImage: !isExpanded ? bgGradient : 'none',
                      padding: '16px 24px', 
                      borderRadius: isExpanded ? '12px 12px 0 0' : 12,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      border: '1px solid',
                      borderColor: isExpanded ? 'rgba(255,255,255,0.1)' : (isTop3 ? `${rankColor}40` : 'transparent'),
                    }}
                    onMouseEnter={(e) => {
                      if (!isExpanded) {
                        e.currentTarget.style.transform = 'scale(1.01)';
                        e.currentTarget.style.background = 'rgba(43, 45, 49, 0.8)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isExpanded) {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.background = 'rgba(43, 45, 49, 0.4)';
                        e.currentTarget.style.borderColor = isTop3 ? `${rankColor}40` : 'transparent';
                      }
                    }}
                  >
                    <div style={{ width: 60, fontSize: rankSize, fontWeight: 900, color: rankColor, textShadow: isTop3 ? `0 0 10px ${rankColor}80` : 'none' }}>
                      #{index + 1}
                    </div>
                    
                    <img 
                      src={user.avatar ? `https://cdn.discordapp.com/avatars/${user._id}/${user.avatar}.png` : "https://cdn.discordapp.com/embed/avatars/0.png"} 
                      style={{ 
                        width: 52, 
                        height: 52, 
                        borderRadius: '50%', 
                        border: isTop3 ? `2px solid ${rankColor}` : 'none', 
                        marginRight: 24,
                        boxShadow: isTop3 ? `0 0 15px ${rankColor}40` : 'none'
                      }}
                      alt="Avatar"
                    />
                    
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: 4 }}>
                        {user.username || 'Unknown User'}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#b5bac1', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: 10, fontSize: '0.8rem' }}>
                          Level {user.global_level}
                        </span>
                      </div>
                    </div>
                    
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#5865F2' }}>
                        {user.global_xp.toLocaleString()} XP
                      </div>
                    </div>
                  </div>
                  
                  {/* Expanded Dropdown Content */}
                  <div style={{ 
                    height: isExpanded ? 'auto' : 0,
                    overflow: 'hidden',
                    opacity: isExpanded ? 1 : 0,
                    transition: 'all 0.3s ease'
                  }}>
                    {isExpanded && (
                      <div style={{ 
                        padding: '16px 24px', 
                        background: 'rgba(30, 31, 34, 0.95)', 
                        borderBottomLeftRadius: 12, 
                        borderBottomRightRadius: 12,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        border: `1px solid rgba(255,255,255,0.1)`,
                        borderTop: 'none',
                        boxShadow: 'inset 0 4px 6px rgba(0,0,0,0.1)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{ color: '#949ba4', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Discord ID</span>
                          <span style={{ color: '#fff', fontFamily: 'monospace', fontSize: '1.1rem', background: '#2b2d31', padding: '4px 10px', borderRadius: 6 }}>
                            {user._id}
                          </span>
                        </div>
                        <button 
                          onClick={(e) => handleCopyId(user._id, e)}
                          style={{ 
                            background: '#5865F2', 
                            color: 'white', 
                            border: 'none', 
                            padding: '8px 16px', 
                            borderRadius: 8, 
                            cursor: 'pointer', 
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            transition: 'background 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#4752c4'}
                          onMouseLeave={(e) => e.currentTarget.style.background = '#5865F2'}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                          </svg>
                          Copy ID
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
