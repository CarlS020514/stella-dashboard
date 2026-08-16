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

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    alert('Discord ID copiat: ' + id);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white' }}>
        <h2>Loading Leaderboard...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: 40, maxWidth: 1000, margin: '0 auto', color: '#fff', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, background: 'linear-gradient(90deg, #5865F2, #00f2fe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Global Leaderboard
        </h1>
        <Link href="/" style={{ padding: '10px 20px', background: '#3ba55c', borderRadius: 8, color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>
          Înapoi la Dashboard
        </Link>
      </div>

      <div style={{ background: '#2b2d31', borderRadius: 12, padding: 20, boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }}>
        {leaderboard.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#b5bac1', padding: 40 }}>Nu există utilizatori încă.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {leaderboard.map((user, index) => {
              const isTop3 = index < 3;
              const rankColor = index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#b5bac1';
              const rankSize = isTop3 ? '1.5rem' : '1.2rem';

              return (
                <div key={user._id} style={{ display: 'flex', flexDirection: 'column' }}>
                  <div 
                    onClick={() => setSelectedUserId(selectedUserId === user._id ? null : user._id)}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      background: selectedUserId === user._id ? '#35373c' : '#1e1f22', 
                      padding: '12px 20px', 
                      borderRadius: 8,
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                      border: isTop3 ? `1px solid ${rankColor}40` : '1px solid transparent'
                    }}
                  >
                    <div style={{ width: 50, fontSize: rankSize, fontWeight: 'bold', color: rankColor }}>
                      #{index + 1}
                    </div>
                    
                    <img 
                      src={user.avatar ? `https://cdn.discordapp.com/avatars/${user._id}/${user.avatar}.png` : "https://cdn.discordapp.com/embed/avatars/0.png"} 
                      style={{ width: 48, height: 48, borderRadius: '50%', border: `2px solid ${rankColor}`, marginRight: 20 }}
                      alt="Avatar"
                    />
                    
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>
                        {user.username || 'Unknown User'}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#b5bac1' }}>
                        Level {user.global_level}
                      </div>
                    </div>
                    
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#5865F2' }}>
                        {user.global_xp} XP
                      </div>
                    </div>
                  </div>
                  
                  {selectedUserId === user._id && (
                    <div style={{ 
                      marginTop: -4, 
                      marginBottom: 10, 
                      padding: '12px 20px', 
                      background: '#18191c', 
                      borderBottomLeftRadius: 8, 
                      borderBottomRightRadius: 8,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      border: `1px solid #35373c`,
                      borderTop: 'none'
                    }}>
                      <span style={{ color: '#b5bac1' }}>Discord ID: <strong style={{ color: '#fff' }}>{user._id}</strong></span>
                      <button 
                        onClick={() => handleCopyId(user._id)}
                        style={{ background: '#5865F2', color: 'white', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontSize: '0.85rem' }}
                      >
                        Copy ID
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
