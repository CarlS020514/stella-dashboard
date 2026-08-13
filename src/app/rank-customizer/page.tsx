'use client';

import { useEffect, useState } from 'react';

const FONTS = ["Roboto", "Bebas Neue", "Press Start 2P", "Montserrat", "Pacifico"];

const PROGRESS_STYLES = [
  { label: "Classic Green", filled: "🟩", empty: "⬛" },
  { label: "Hearts", filled: "❤️", empty: "🤍" },
  { label: "Stars", filled: "⭐", empty: "🌑" },
  { label: "Lightning", filled: "⚡", empty: "☁️" },
  { label: "Blue Diamonds", filled: "🔷", empty: "💠" }
];

export default function RankCustomizer() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Customization state
  const [borderColor, setBorderColor] = useState("#2b2d31");
  const [bgUrl, setBgUrl] = useState("");
  const [font, setFont] = useState("Roboto");
  const [progressStyle, setProgressStyle] = useState(0);

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
              if (config && config.rank_embed) {
                setBorderColor(config.rank_embed.color ? '#' + config.rank_embed.color.toString(16).padStart(6, '0') : "#2b2d31");
                setBgUrl(config.rank_embed.image_url || "");
                setFont(config.rank_embed.author_name || "Roboto");
                
                const footer = config.rank_embed.footer_text || "🟩,⬛";
                const parts = footer.split(",");
                if (parts.length >= 2) {
                  const index = PROGRESS_STYLES.findIndex(p => p.filled === parts[0].trim());
                  if (index !== -1) setProgressStyle(index);
                }
              }
            }).catch(() => {});
        }
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    if (!user?.is_vip_plus) return alert("You must be VIP+ to save this!");
    
    // We hack the embed structure to pass our custom rank card data
    const embed = {
      color: parseInt(borderColor.replace('#', ''), 16),
      image_url: bgUrl,
      author_name: font,
      footer_text: `${PROGRESS_STYLES[progressStyle].filled},${PROGRESS_STYLES[progressStyle].empty}`
    };
    
    const res = await fetch('/api/vip/save-rank', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embed })
    });
    
    if (res.ok) {
      alert("Rank Card Saved Successfully!");
    } else {
      alert("Error saving rank card.");
    }
  };

  if (loading) return <div className="loading-screen">Loading...</div>;
  
  if (!user) return <div style={{padding: 50, textAlign: 'center'}}>Please login first.</div>;

  const currentProgress = PROGRESS_STYLES[progressStyle];
  const barText = currentProgress.filled.repeat(6) + currentProgress.empty.repeat(4);

  return (
    <div className="container">
      <div className="sidebar" style={{ width: '400px' }}>
        <h2 style={{ padding: 20 }}>🎨 Customize Rank Card</h2>
        
        {!user.is_vip_plus && (
          <div style={{ padding: '0 20px', color: '#ff5555', marginBottom: 15 }}>
            ⚠️ <strong>VIP+ Required:</strong> You need VIP+ to use custom backgrounds and fonts. 
            Free users can only change the border color!
          </div>
        )}

        <div className="form-group" style={{ padding: '0 20px' }}>
          <label>Embed Border Color (Free)</label>
          <input 
            type="color" 
            value={borderColor} 
            onChange={e => setBorderColor(e.target.value)}
            style={{ width: '100%', height: 40, cursor: 'pointer', border: 'none', background: 'transparent' }}
          />
        </div>

        <div className="form-group" style={{ padding: '10px 20px' }}>
          <label>Background Image URL (VIP+)</label>
          <input 
            type="text" 
            placeholder="https://example.com/image.png" 
            value={bgUrl} 
            onChange={e => setBgUrl(e.target.value)}
            disabled={!user.is_vip_plus}
          />
        </div>

        <div className="form-group" style={{ padding: '10px 20px' }}>
          <label>Select Font (VIP+)</label>
          <select value={font} onChange={e => setFont(e.target.value)} disabled={!user.is_vip_plus}>
            {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>

        <div className="form-group" style={{ padding: '10px 20px' }}>
          <label>Progress Bar Style (VIP+)</label>
          <select value={progressStyle} onChange={e => setProgressStyle(parseInt(e.target.value))} disabled={!user.is_vip_plus}>
            {PROGRESS_STYLES.map((style, i) => (
              <option key={i} value={i}>{style.label} ({style.filled}{style.empty})</option>
            ))}
          </select>
        </div>

        <div style={{ padding: 20 }}>
          <button className="btn btn-discord large-btn" onClick={handleSave}>
            💾 Save Rank Card
          </button>
        </div>
      </div>

      <div className="preview-area" style={{ background: '#1e1f22', alignItems: 'center' }}>
        <div style={{
          width: 520,
          background: '#2b2d31',
          borderLeft: `4px solid ${borderColor}`,
          borderRadius: 4,
          padding: 16,
          boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
        }}>
          <h3 style={{ fontSize: '1rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src={user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : "https://cdn.discordapp.com/embed/avatars/0.png"} style={{width: 24, height: 24, borderRadius: '50%'}} />
            Level Stats - {user.username || "User"}
          </h3>
          
          <div style={{ display: 'flex', gap: 20, marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#b5bac1', marginBottom: 4, fontWeight: 600 }}>Current Level</div>
              <div style={{ fontSize: '1rem', color: '#dbdee1' }}>**15** {user.is_vip_plus ? "👑 **VIP+**" : ""}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#b5bac1', marginBottom: 4, fontWeight: 600 }}>XP</div>
              <div style={{ fontSize: '1rem', color: '#dbdee1' }}>**1500 / 2500**</div>
            </div>
          </div>
          
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: '0.85rem', color: '#b5bac1', marginBottom: 4, fontWeight: 600 }}>Progress</div>
            <div style={{ fontSize: '1rem', color: '#dbdee1', letterSpacing: 2 }}>{barText}</div>
          </div>

          <div style={{
            width: '100%',
            height: 160,
            background: bgUrl ? `url(${bgUrl}) center/cover no-repeat` : '#1e1f22',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {!bgUrl && <span style={{color: '#80848e'}}>Your Image Here</span>}
            {bgUrl && <div style={{position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)'}}></div>}
            
            {/* Mockup of generated image elements over background */}
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', width: '100%', padding: 20, gap: 15 }}>
              <img src={user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : "https://cdn.discordapp.com/embed/avatars/0.png"} style={{width: 80, height: 80, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.7)'}} />
              <div style={{ flex: 1 }}>
                <div style={{ color: '#fff', fontSize: '1.2rem', fontFamily: font === 'Roboto' ? 'sans-serif' : font, fontWeight: 'bold' }}>{user.username}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, color: '#ddd', fontSize: '0.9rem' }}>
                  <span>LEVEL 15</span>
                  <span>1500 / 2500 XP</span>
                </div>
                <div style={{ width: '100%', height: 12, background: 'rgba(0,0,0,0.5)', borderRadius: 6, marginTop: 5 }}>
                  <div style={{ width: '60%', height: '100%', background: '#5865F2', borderRadius: 6 }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
