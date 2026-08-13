'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useTheme } from './ThemeProvider';

export default function Navigation() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // Dropdown States
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [variablesOpen, setVariablesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const variablesRef = useRef<HTMLDivElement>(null);
  
  // VIP Modal States
  const [showVipModal, setShowVipModal] = useState(false);
  const [vipCode, setVipCode] = useState('');

  // Theme context
  const { themeColor, setThemeColor, desktopMode, setDesktopMode, bgImage, setBgImage } = useTheme();

  const predefinedColors = [
    { name: 'Blurple', value: '#5865F2' },
    { name: 'Crimson', value: '#ED4245' },
    { name: 'Emerald', value: '#57F287' },
    { name: 'Sunset', value: '#FEE75C' },
  ];

  const handleRedeemCode = async () => {
    if (!vipCode) return;
    try {
      const res = await fetch('/api/vip/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: vipCode })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setShowVipModal(false);
        // data.message looks like "Success! You are now VIP+."
        if (data.message.includes('VIP+')) {
          setUser({ ...user, is_vip: true, is_vip_plus: true });
        } else {
          setUser({ ...user, is_vip: true });
        }
      } else {
        alert(data.error || 'Invalid code');
      }
    } catch (e) {
      alert('Failed to redeem code.');
    }
  };

  const handleRemovePhoto = async () => {
    try {
      await fetch('/api/remove-bg', { method: 'POST' });
      setBgImage(null);
    } catch (err) {
      console.error('Failed to remove photo');
    }
  };

  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result;
      
      try {
        const res = await fetch('/api/upload-bg', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64 })
        });
        
        const data = await res.json();
        if (res.ok) {
          alert('Background updated! Please refresh the page to see changes.');
          window.location.reload();
        } else {
          alert(data.error || 'Failed to upload photo');
        }
      } catch (err) {
        alert('Upload failed.');
      }
    };
    reader.readAsDataURL(file);
  };

  const changeThemeColor = (color: string) => {
    setThemeColor(color);
    if (bgImage) {
      handleRemovePhoto(); // Automatically remove background image when selecting a theme color
    }
  };

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          setIsAuthenticated(true);
          setUser(data.user);
          if (data.user.bgImage) {
            setBgImage(data.user.bgImage);
          }
        }
      });
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (variablesRef.current && !variablesRef.current.contains(event.target as Node)) {
        setVariablesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogin = () => {
    window.location.href = '/api/auth/login';
  };

  return (
    <header>
      <div className="logo">
        <Link href="/" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
          sтєℓℓɑ вღт <span className="vip-badge">DASHBOARD</span>
        </Link>
      </div>
      
      {isAuthenticated && (
        <nav className="nav-links">
          <Link href="/">Home</Link>
          <Link href="/embed">Embed Generator</Link>
          <Link href="/rank-customizer">Rank Customizer</Link>
        </nav>
      )}

      <div className="header-controls">
        {!isAuthenticated ? (
          <button className="btn btn-discord" onClick={handleLogin}>
            Login with Discord
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {/* Variables Dropdown */}
            <div className="variables-dropdown-container" ref={variablesRef} style={{ position: 'relative' }}>
              <div 
                className="user-profile interactive" 
                onClick={() => setVariablesOpen(!variablesOpen)}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', padding: '8px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px' }}
              >
                <span style={{ fontSize: '1.2rem' }}>✨</span>
                <span style={{ 
                  fontWeight: 'bold', 
                  display: 'inline-block',
                  transition: 'transform 0.3s ease',
                  transform: variablesOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                }}>▾</span>
              </div>
              
              {variablesOpen && (
                <div className="profile-dropdown" style={{ width: '320px', right: 0 }}>
                  <div className="dropdown-section-title">✨ Available Variables</div>
                  <div style={{ padding: '10px', fontSize: '0.9rem', lineHeight: '1.6' }}>
                    <div style={{ marginBottom: '8px' }}><code style={{ color: '#c9cdfb', background: 'rgba(0,0,0,0.3)', padding: '2px 5px', borderRadius: '4px' }}>{'{user}'}</code> - Pings the user</div>
                    <div style={{ marginBottom: '8px' }}><code style={{ color: '#c9cdfb', background: 'rgba(0,0,0,0.3)', padding: '2px 5px', borderRadius: '4px' }}>{'{username}'}</code> - User's name</div>
                    <div style={{ marginBottom: '8px' }}><code style={{ color: '#c9cdfb', background: 'rgba(0,0,0,0.3)', padding: '2px 5px', borderRadius: '4px' }}>{'{server}'}</code> - Server name</div>
                    <div style={{ marginBottom: '8px' }}><code style={{ color: '#c9cdfb', background: 'rgba(0,0,0,0.3)', padding: '2px 5px', borderRadius: '4px' }}>{'{embed:Name}'}</code> - Attach custom embed</div>
                    <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <strong>Pro tip:</strong> To ping a specific user, use their Discord ID like this: <code style={{ color: '#c9cdfb', background: 'rgba(0,0,0,0.3)', padding: '2px', borderRadius: '4px' }}>&lt;@123456789&gt;</code>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="user-profile-container" ref={dropdownRef} style={{ position: 'relative' }}>
              <div 
                className="user-profile interactive" 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{ display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer' }}
              >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`} alt="Avatar" className="user-avatar" />
                <span>{user.username}</span>
                {user.is_vip_plus ? (
                  <span className="vip-badge" style={{ background: 'linear-gradient(45deg, #FFD700, #FFA500)' }}>VIP+</span>
                ) : user.is_vip ? (
                  <span className="vip-badge">VIP</span>
                ) : null}
              </div>
            </div>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="profile-dropdown">
                
                {/* Desktop Mode Toggle (Visible only on small screens via CSS, or always via JS) */}
                <div className="dropdown-item mobile-only-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <span>Desktop Mode</span>
                    <label className="switch">
                      <input 
                        type="checkbox" 
                        checked={desktopMode} 
                        onChange={(e) => setDesktopMode(e.target.checked)} 
                      />
                      <span className="slider round"></span>
                    </label>
                  </div>
                </div>

                <div className="dropdown-divider"></div>

                {/* Themes Section (VIP+ only) */}
                <div className="dropdown-section-title">Themes</div>
                <div className="theme-grid">
                  {predefinedColors.map(c => (
                    <div 
                      key={c.name}
                      className={`theme-circle ${themeColor === c.value ? 'active' : ''}`}
                      style={{ backgroundColor: c.value }}
                      onClick={() => {
                        if (user.is_vip_plus) changeThemeColor(c.value);
                        else setShowVipModal(true);
                      }}
                      title={c.name}
                    ></div>
                  ))}
                </div>

                {/* VIP Custom Color Picker */}
                <div className="dropdown-item" style={{ marginTop: '10px', paddingTop: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <span style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                      <span className="pro-lock">PRO</span> Custom Color
                    </span>
                    {user.is_vip_plus ? (
                      <input 
                        type="color" 
                        value={themeColor} 
                        onChange={(e) => changeThemeColor(e.target.value)} 
                        className="vip-color-picker"
                      />
                    ) : (
                      <div className="vip-color-picker locked" title="Unlock VIP+ to use custom colors" onClick={() => setShowVipModal(true)}>🔒</div>
                    )}
                  </div>
                </div>

                {/* VIP Upload Photo */}
                {user.is_vip_plus && (
                  <div className="dropdown-item" style={{ paddingTop: 0 }}>
                    <label className="upload-photo-btn" style={{ 
                      width: '100%', 
                      display: 'block', 
                      textAlign: 'center', 
                      background: 'var(--accent)', 
                      padding: '8px', 
                      borderRadius: '8px', 
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      transition: '0.2s',
                      marginBottom: '8px'
                    }}>
                      Upload your photo
                      <input 
                        type="file" 
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleUploadPhoto}
                      />
                    </label>
                    <div 
                      onClick={handleRemovePhoto}
                      style={{ 
                        textAlign: 'center', 
                        fontSize: '0.8rem', 
                        color: 'var(--text-muted)', 
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      Remove photo
                    </div>
                  </div>
                )}

                {!user.is_vip_plus && (
                  <>
                    <div className="dropdown-divider"></div>
                    <div className="dropdown-item" onClick={() => setShowVipModal(true)} style={{ color: '#f1c40f', fontWeight: 'bold' }}>
                      {user.is_vip ? 'Upgrade to VIP+' : 'Unlock VIP / VIP+'}
                    </div>
                  </>
                )}

                <div className="dropdown-divider"></div>

                {/* Log Out */}
                <a href="/api/auth/logout" className="dropdown-item text-danger">
                  Log Out
                </a>
              </div>
            )}
            </div>
          </div>
        )}
      </div>

      {/* VIP Modal */}
      {showVipModal && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1000, maxWidth: '400px' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>Unlock PRO Features</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Enter your VIP or VIP+ code to unlock custom senders, premium themes, and photo backgrounds.</p>
            <div className="form-group">
              <input type="text" placeholder="VIP-XXXX-XXXX" value={vipCode} onChange={e => setVipCode(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button className="btn btn-discord" style={{ flex: 1 }} onClick={handleRedeemCode}>Redeem</button>
              <button className="btn" style={{ background: '#333', flex: 1 }} onClick={() => setShowVipModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
