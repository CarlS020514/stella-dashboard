'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function RankManager() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [xpActive, setXpActive] = useState(true);
  const [boostExpires, setBoostExpires] = useState(0);
  const [claimStatus, setClaimStatus] = useState('');

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          setUser(data.user);
          // Try to load existing config
          fetch('/api/vip/get-rank')
            .then(r => r.json())
            .then(config => {
              if (config) {
                setXpActive(config.xp_multiplier_active !== false); // default true
                if (config.vip_boost_expires) setBoostExpires(config.vip_boost_expires);
              }
            }).catch(() => {});
        }
        setLoading(false);
      });
  }, []);

  const handleToggle = async () => {
    const newState = !xpActive;
    setXpActive(newState);
    await fetch('/api/vip/toggle-multiplier', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: newState })
    });
  };

  const handleClaim = async () => {
    setClaimStatus('Processing...');
    const res = await fetch('/api/vip/claim-xp', {
      method: 'POST'
    });
    
    if (res.ok) {
      setClaimStatus('✅ Request sent to Bot! (Cooldown: 2 Hours)');
      setTimeout(() => setClaimStatus(''), 5000);
    } else {
      setClaimStatus('❌ Error processing request.');
    }
  };

  if (loading) return <div className="loading-screen">Loading...</div>;
  if (!user) return <div style={{padding: 50, textAlign: 'center'}}>Please login first.</div>;
  if (!user.is_vip) return <div style={{padding: 50, textAlign: 'center', color: '#ff5555'}}>⚠️ VIP Required to access Rank Manager.</div>;

  const hasBoost = Date.now() < boostExpires;
  const daysLeft = hasBoost ? Math.ceil((boostExpires - Date.now()) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <div className="container" style={{ justifyContent: 'center', padding: 40 }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: 600, padding: 40, textAlign: 'center' }}>
        <h2 style={{ marginBottom: 30 }}>🌟 VIP Rank Manager</h2>
        
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: 20, borderRadius: 12, marginBottom: 30 }}>
          <h3 style={{ marginBottom: 15, color: '#f1c40f' }}>XP Multiplier Settings</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', background: 'rgba(255,255,255,0.05)', borderRadius: 8 }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Active Multiplier: {hasBoost ? '🔥 3x (Boost)' : '✨ 2x (VIP)'}</span>
            <label className="switch">
              <input type="checkbox" checked={xpActive} onChange={handleToggle} />
              <span className="slider round"></span>
            </label>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#888', marginTop: 10, textAlign: 'left', padding: '0 10px' }}>
            Turn this off if you want to level up at the normal 1x rate. 
            {hasBoost && <span style={{color: '#57F287', display: 'block', marginTop: 5}}>🔥 You have {daysLeft} days left of 3x VIP Boost!</span>}
          </p>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.3)', padding: 20, borderRadius: 12, marginBottom: 30 }}>
          <h3 style={{ marginBottom: 15, color: '#5865F2' }}>Claim Bonus XP</h3>
          <p style={{ fontSize: '0.9rem', color: '#ccc', marginBottom: 20 }}>
            As a VIP, you can claim free bonus XP every 2 hours directly from the dashboard!
          </p>
          <button 
            className="btn btn-discord large-btn" 
            style={{ width: '100%', fontSize: '1.2rem', padding: 15, background: '#43b581' }}
            onClick={handleClaim}
          >
            🎁 CLAIM XP NOW
          </button>
          {claimStatus && <div style={{ marginTop: 15, fontWeight: 'bold', color: claimStatus.includes('✅') ? '#57F287' : '#ED4245' }}>{claimStatus}</div>}
        </div>
        
        <Link href="/rank-customizer">
          <button className="btn" style={{ background: 'rgba(255,255,255,0.1)', width: '100%' }}>
            🎨 Go to Rank Card Customizer
          </button>
        </Link>
      </div>
    </div>
  );
}
