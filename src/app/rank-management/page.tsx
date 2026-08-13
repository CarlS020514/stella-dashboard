'use client';

import { useEffect, useState } from 'react';

const FONTS = [
  "Roboto", "Bebas Neue", "Press Start 2P", "Montserrat", "Pacifico",
  "Oswald", "Playfair Display", "Nunito", "Cinzel", "Anton"
];

const PROGRESS_STYLES = [
  { label: "Classic Green", filled: "🟩", empty: "⬛" },
  { label: "Hearts", filled: "❤️", empty: "🤍" },
  { label: "Stars", filled: "⭐", empty: "🌑" },
  { label: "Lightning", filled: "⚡", empty: "☁️" },
  { label: "Blue Diamonds", filled: "🔷", empty: "💠" }
];

export default function RankManagement() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // XP Management
  const [xpActive, setXpActive] = useState(true);
  const [boostExpires, setBoostExpires] = useState(0);
  const [claimStatus, setClaimStatus] = useState('');

  // Card Customization
  const [borderColor, setBorderColor] = useState("#2b2d31");
  const [bgUrl, setBgUrl] = useState("");
  const [font, setFont] = useState("Roboto");
  const [progressStyle, setProgressStyle] = useState(0);

  // Admin Global Card Customization
  const [globalBorderColor, setGlobalBorderColor] = useState("#2b2d31");
  const [globalBgUrl, setGlobalBgUrl] = useState("");
  const [globalFont, setGlobalFont] = useState("Roboto");
  const [globalProgressStyle, setGlobalProgressStyle] = useState(0);

  // Accordion state
  const [activeTab, setActiveTab] = useState('xp');

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
                setXpActive(config.xp_multiplier_active !== false);
                if (config.vip_boost_expires) setBoostExpires(config.vip_boost_expires);
                
                if (config.rank_embed) {
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
              }
            }).catch(() => {});
            
          // If admin, load global rank
          if (data.user.username === 'scroppy') {
            fetch('/api/admin/global-rank')
              .then(r => r.json())
              .then(globalData => {
                const conf = globalData.global_rank_embed;
                if (conf) {
                  setGlobalBorderColor(conf.color ? '#' + conf.color.toString(16).padStart(6, '0') : "#2b2d31");
                  setGlobalBgUrl(conf.image_url || "");
                  setGlobalFont(conf.author_name || "Roboto");
                  const footer = conf.footer_text || "🟩,⬛";
                  const parts = footer.split(",");
                  if (parts.length >= 2) {
                    const index = PROGRESS_STYLES.findIndex(p => p.filled === parts[0].trim());
                    if (index !== -1) setGlobalProgressStyle(index);
                  }
                }
              }).catch(() => {});
          }
        }
        setLoading(false);
      });
  }, []);

  const handleToggleXp = async () => {
    const newState = !xpActive;
    setXpActive(newState);
    await fetch('/api/vip/toggle-multiplier', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: newState })
    });
  };

  const handleClaimXp = async () => {
    setClaimStatus('Processing...');
    const res = await fetch('/api/vip/claim-xp', {
      method: 'POST'
    });
    
    if (res.ok) {
      setClaimStatus('Request sent to Bot! (Cooldown: 2 Hours)');
      setTimeout(() => setClaimStatus(''), 5000);
    } else {
      setClaimStatus('Error processing request.');
    }
  };

  const handleSaveCard = async () => {
    if (!user?.is_vip_plus) return alert("You must be VIP+ to save Advanced Customizations!");
    
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
  
  const handleSaveBasic = async () => {
    const embed = {
      color: parseInt(borderColor.replace('#', ''), 16),
    };
    
    const res = await fetch('/api/vip/save-rank', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embed })
    });
    
    if (res.ok) {
      alert("Border Color Saved Successfully!");
    } else {
      alert("Error saving border color.");
    }
  };

  const handleSaveGlobal = async () => {
    const embed = {
      color: parseInt(globalBorderColor.replace('#', ''), 16),
      image_url: globalBgUrl,
      author_name: globalFont,
      footer_text: `${PROGRESS_STYLES[globalProgressStyle].filled},${PROGRESS_STYLES[globalProgressStyle].empty}`
    };
    
    const res = await fetch('/api/admin/global-rank', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embed })
    });
    
    if (res.ok) {
      alert("Global Default Rank Card Saved Successfully!");
    } else {
      alert("Error saving global config.");
    }
  };

  if (loading) return <div className="loading-screen">Loading...</div>;
  if (!user) return <div style={{padding: 50, textAlign: 'center'}}>Please login first.</div>;
  if (!user.is_vip) return <div style={{padding: 50, textAlign: 'center', color: '#ff5555'}}>VIP Required to access Rank Management.</div>;

  const hasBoost = Date.now() < boostExpires;
  const currentProgress = PROGRESS_STYLES[progressStyle];
  const barText = currentProgress.filled.repeat(6) + currentProgress.empty.repeat(4);

  return (
    <div className="container">
      <div className="sidebar" style={{ width: '100%', maxWidth: '450px', flex: '0 0 auto' }}>
        <h2 style={{ padding: 20 }}>Rank Management</h2>

        {/* Accordion 1: XP Management */}
        <div 
          className="form-group" 
          style={{ padding: '15px 20px', background: activeTab === 'xp' ? '#202225' : 'transparent', borderBottom: '1px solid #202225', cursor: 'pointer', margin: 0 }}
          onClick={() => setActiveTab('xp')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold' }}>
            <span>XP Management</span>
            <span>{activeTab === 'xp' ? '▼' : '▶'}</span>
          </div>
        </div>
        {activeTab === 'xp' && (
          <div style={{ padding: '20px', background: '#202225' }}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 10 }}>Active Multiplier: {hasBoost ? '3x (Boost)' : '2x (VIP)'}</label>
              <label className="switch">
                <input type="checkbox" checked={xpActive} onChange={handleToggleXp} />
                <span className="slider round"></span>
              </label>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 10 }}>Claim Bonus XP</label>
              <button className="btn btn-discord large-btn" style={{ width: '100%', background: '#43b581' }} onClick={handleClaimXp}>
                Claim XP Now
              </button>
              {claimStatus && <div style={{ marginTop: 10, fontSize: '0.9rem', color: claimStatus.includes('Error') ? '#ED4245' : '#57F287' }}>{claimStatus}</div>}
            </div>
          </div>
        )}

        {/* Accordion 2: Basic Rank Card */}
        <div 
          className="form-group" 
          style={{ padding: '15px 20px', background: activeTab === 'basic' ? '#202225' : 'transparent', borderBottom: '1px solid #202225', cursor: 'pointer', margin: 0 }}
          onClick={() => setActiveTab('basic')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold' }}>
            <span>Basic Rank Card (Free for VIP)</span>
            <span>{activeTab === 'basic' ? '▼' : '▶'}</span>
          </div>
        </div>
        {activeTab === 'basic' && (
          <div style={{ padding: '20px', background: '#202225' }}>
            <div style={{ marginBottom: 20 }}>
              <label>Embed Border Color</label>
              <input 
                type="color" 
                value={borderColor} 
                onChange={e => setBorderColor(e.target.value)}
                style={{ width: '100%', height: 40, cursor: 'pointer', border: 'none', background: 'transparent' }}
              />
            </div>
            <button className="btn btn-primary" onClick={handleSaveBasic} style={{ width: '100%' }}>
              Save Border Color
            </button>
          </div>
        )}

        {/* Accordion 3: Advanced Card Customization */}
        <div 
          className="form-group" 
          style={{ padding: '15px 20px', background: activeTab === 'advanced' ? '#202225' : 'transparent', borderBottom: '1px solid #202225', cursor: 'pointer', margin: 0 }}
          onClick={() => setActiveTab('advanced')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold' }}>
            <span style={{ color: user.is_vip_plus ? 'inherit' : '#ff5555' }}>Advanced Card Customization (VIP+)</span>
            <span>{activeTab === 'advanced' ? '▼' : '▶'}</span>
          </div>
        </div>
        {activeTab === 'advanced' && (
          <div style={{ padding: '20px', background: '#202225' }}>
            {!user.is_vip_plus && (
              <div style={{ color: '#ff5555', marginBottom: 15, fontSize: '0.9rem' }}>
                VIP+ Required to use advanced background and font customization.
              </div>
            )}
            <div style={{ marginBottom: 15 }}>
              <label>Background Image URL</label>
              <input 
                type="text" 
                placeholder="https://example.com/image.png" 
                value={bgUrl} 
                onChange={e => setBgUrl(e.target.value)}
                disabled={!user.is_vip_plus}
                style={{ width: '100%', padding: '8px', borderRadius: 4, border: '1px solid #444', background: '#1e1f22', color: '#fff' }}
              />
            </div>

            <div style={{ marginBottom: 15 }}>
              <label>Select Font</label>
              <select 
                value={font} 
                onChange={e => setFont(e.target.value)} 
                disabled={!user.is_vip_plus}
                style={{ width: '100%', padding: '8px', borderRadius: 4, border: '1px solid #444', background: '#1e1f22', color: '#fff' }}
              >
                {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label>Progress Bar Style</label>
              <select 
                value={progressStyle} 
                onChange={e => setProgressStyle(parseInt(e.target.value))} 
                disabled={!user.is_vip_plus}
                style={{ width: '100%', padding: '8px', borderRadius: 4, border: '1px solid #444', background: '#1e1f22', color: '#fff' }}
              >
                {PROGRESS_STYLES.map((style, i) => (
                  <option key={i} value={i}>{style.label} ({style.filled}{style.empty})</option>
                ))}
              </select>
            </div>

            <button className="btn btn-discord" onClick={handleSaveCard} disabled={!user.is_vip_plus} style={{ width: '100%' }}>
              Save Advanced Customizations
            </button>
          </div>
        )}

        {/* Accordion 4: Global Settings (Admin) */}
        {user.username === 'scroppy' && (
          <>
            <div 
              className="form-group" 
              style={{ padding: '15px 20px', background: activeTab === 'admin' ? '#202225' : 'transparent', borderBottom: '1px solid #202225', cursor: 'pointer', margin: 0, marginTop: 20, borderTop: '2px solid #f1c40f' }}
              onClick={() => setActiveTab('admin')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold' }}>
                <span style={{ color: '#f1c40f' }}>👑 Global Bot Settings (Admin)</span>
                <span>{activeTab === 'admin' ? '▼' : '▶'}</span>
              </div>
            </div>
            {activeTab === 'admin' && (
              <div style={{ padding: '20px', background: '#202225', borderTop: '1px solid #333' }}>
                <div style={{ color: '#f1c40f', marginBottom: 15, fontSize: '0.85rem' }}>
                  This sets the default rank card appearance for everyone who doesn't have VIP+.
                </div>
                
                <div style={{ marginBottom: 15 }}>
                  <label>Global Embed Border Color</label>
                  <input 
                    type="color" 
                    value={globalBorderColor} 
                    onChange={e => setGlobalBorderColor(e.target.value)}
                    style={{ width: '100%', height: 40, cursor: 'pointer', border: 'none', background: 'transparent' }}
                  />
                </div>
                
                <div style={{ marginBottom: 15 }}>
                  <label>Global Background Image URL</label>
                  <input 
                    type="text" 
                    placeholder="https://example.com/image.png" 
                    value={globalBgUrl} 
                    onChange={e => setGlobalBgUrl(e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: 4, border: '1px solid #444', background: '#1e1f22', color: '#fff' }}
                  />
                </div>

                <div style={{ marginBottom: 15 }}>
                  <label>Global Default Font</label>
                  <select 
                    value={globalFont} 
                    onChange={e => setGlobalFont(e.target.value)} 
                    style={{ width: '100%', padding: '8px', borderRadius: 4, border: '1px solid #444', background: '#1e1f22', color: '#fff' }}
                  >
                    {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label>Global Progress Bar Style</label>
                  <select 
                    value={globalProgressStyle} 
                    onChange={e => setGlobalProgressStyle(parseInt(e.target.value))} 
                    style={{ width: '100%', padding: '8px', borderRadius: 4, border: '1px solid #444', background: '#1e1f22', color: '#fff' }}
                  >
                    {PROGRESS_STYLES.map((style, i) => (
                      <option key={i} value={i}>{style.label} ({style.filled}{style.empty})</option>
                    ))}
                  </select>
                </div>

                <button className="btn" onClick={handleSaveGlobal} style={{ width: '100%', background: '#f1c40f', color: '#000' }}>
                  Save Global Defaults
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <div className="preview-area" style={{ background: '#1e1f22', alignItems: 'center' }}>
        {activeTab === 'admin' ? (
          /* ADMIN PREVIEW */
          <div style={{
            width: '100%',
            maxWidth: 520,
            background: '#2b2d31',
            borderLeft: `4px solid ${globalBorderColor}`,
            borderRadius: 4,
            padding: 16,
            boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
            boxSizing: 'border-box'
          }}>
            <h3 style={{ fontSize: '1rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <img src={user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : "https://cdn.discordapp.com/embed/avatars/0.png"} style={{width: 24, height: 24, borderRadius: '50%'}} />
              Level Stats - {user.username || "User"}
            </h3>
            
            <div style={{ display: 'flex', gap: 20, marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#b5bac1', marginBottom: 4, fontWeight: 600 }}>Current Level</div>
                <div style={{ fontSize: '1rem', color: '#dbdee1' }}>15 (Global Preview)</div>
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#b5bac1', marginBottom: 4, fontWeight: 600 }}>XP</div>
                <div style={{ fontSize: '1rem', color: '#dbdee1' }}>1500 / 2500</div>
              </div>
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '0.85rem', color: '#b5bac1', marginBottom: 4, fontWeight: 600 }}>Progress</div>
              <div style={{ fontSize: '1rem', color: '#dbdee1', letterSpacing: 2 }}>{PROGRESS_STYLES[globalProgressStyle].filled.repeat(6) + PROGRESS_STYLES[globalProgressStyle].empty.repeat(4)}</div>
            </div>

            <div style={{
              width: '100%',
              height: 160,
              background: globalBgUrl ? `url(${globalBgUrl}) center/cover no-repeat` : '#1e1f22',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {!globalBgUrl && <span style={{color: '#80848e'}}>Your Image Here</span>}
              {globalBgUrl && <div style={{position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)'}}></div>}
              
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', width: '100%', padding: 20, gap: 15 }}>
                <img src={user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : "https://cdn.discordapp.com/embed/avatars/0.png"} style={{width: 80, height: 80, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.7)'}} />
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#fff', fontSize: '1.2rem', fontFamily: globalFont === 'Roboto' ? 'Roboto, sans-serif' : `"${globalFont}", sans-serif`, fontWeight: 'bold' }}>{user.username}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, color: '#ddd', fontSize: '0.9rem', fontFamily: globalFont === 'Roboto' ? 'Roboto, sans-serif' : `"${globalFont}", sans-serif` }}>
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
        ) : (
          /* USER PREVIEW */
          <div style={{
            width: '100%',
            maxWidth: 520,
            background: '#2b2d31',
            borderLeft: `4px solid ${borderColor}`,
            borderRadius: 4,
            padding: 16,
            boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
            boxSizing: 'border-box'
          }}>
          <h3 style={{ fontSize: '1rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src={user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : "https://cdn.discordapp.com/embed/avatars/0.png"} style={{width: 24, height: 24, borderRadius: '50%'}} />
            Level Stats - {user.username || "User"}
          </h3>
          
          <div style={{ display: 'flex', gap: 20, marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#b5bac1', marginBottom: 4, fontWeight: 600 }}>Current Level</div>
              <div style={{ fontSize: '1rem', color: '#dbdee1' }}>15 {user.is_vip_plus ? "VIP+" : ""}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#b5bac1', marginBottom: 4, fontWeight: 600 }}>XP</div>
              <div style={{ fontSize: '1rem', color: '#dbdee1' }}>1500 / 2500</div>
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
            
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', width: '100%', padding: 20, gap: 15 }}>
              <img src={user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : "https://cdn.discordapp.com/embed/avatars/0.png"} style={{width: 80, height: 80, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.7)'}} />
              <div style={{ flex: 1 }}>
                <div style={{ color: '#fff', fontSize: '1.2rem', fontFamily: font === 'Roboto' ? 'Roboto, sans-serif' : `"${font}", sans-serif`, fontWeight: 'bold' }}>{user.username}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, color: '#ddd', fontSize: '0.9rem', fontFamily: font === 'Roboto' ? 'Roboto, sans-serif' : `"${font}", sans-serif` }}>
                  <span>LEVEL 15</span>
                  <span>1500 / 2500 XP</span>
                </div>
                <div style={{ width: '100%', height: 12, background: 'rgba(0,0,0,0.5)', borderRadius: 6, marginTop: 5 }}>
                  <div style={{ width: '60%', height: '100%', background: '#5865F2', borderRadius: 6 }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
