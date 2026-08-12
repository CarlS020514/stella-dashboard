'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [guilds, setGuilds] = useState<any[]>([]);
  const [channels, setChannels] = useState<any[]>([]);
  
  const [selectedGuild, setSelectedGuild] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('');
  
  // Custom Sender
  const [senderName, setSenderName] = useState('');
  const [senderAvatar, setSenderAvatar] = useState('');

  // Embed State
  const [content, setContent] = useState('');
  const [embedColor, setEmbedColor] = useState('#5865F2');
  const [embedTitle, setEmbedTitle] = useState('');
  const [embedUrl, setEmbedUrl] = useState('');
  const [embedDescription, setEmbedDescription] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [authorIcon, setAuthorIcon] = useState('');
  const [authorUrl, setAuthorUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [footerText, setFooterText] = useState('');
  const [footerIcon, setFooterIcon] = useState('');
  
  // UI State
  const [openSections, setOpenSections] = useState({
    sender: true,
    message: true,
    author: false,
    images: false,
    footer: false
  });

  const [showVipModal, setShowVipModal] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [vipCode, setVipCode] = useState('');

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
        setUser({ ...user, is_vip: true });
      } else {
        alert(data.error || 'Invalid code');
      }
    } catch (e) {
      alert('Failed to redeem code.');
    }
  };

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          setIsAuthenticated(true);
          setUser(data.user);
          // Fetch guilds
          fetch('/api/guilds')
            .then(res => res.json())
            .then(g => {
              if (Array.isArray(g)) setGuilds(g);
            });
        }
        setLoading(false);
      });
  }, []);

  const handleLogin = () => {
    window.location.href = '/api/auth/login';
  };

  useEffect(() => {
    if (selectedGuild) {
      fetch(`/api/channels?guild_id=${selectedGuild}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setChannels(data);
          }
        });
    } else {
      setChannels([]);
    }
  }, [selectedGuild]);

  const handleSend = async () => {
    if (!selectedChannel) return alert('Select a channel first!');
    
    const embed: any = {
      color: parseInt(embedColor.replace('#', ''), 16)
    };
    
    if (embedTitle) embed.title = embedTitle;
    if (embedUrl) embed.url = embedUrl;
    if (embedDescription) embed.description = embedDescription;
    
    if (authorName) {
      embed.author = { name: authorName };
      if (authorIcon) embed.author.icon_url = authorIcon;
      if (authorUrl) embed.author.url = authorUrl;
    }
    
    if (thumbnailUrl) embed.thumbnail = { url: thumbnailUrl };
    if (imageUrl) embed.image = { url: imageUrl };
    
    if (footerText) {
      embed.footer = { text: footerText };
      if (footerIcon) embed.footer.icon_url = footerIcon;
    }
    
    const message_data: any = {};
    if (content) message_data.content = content;
    
    if (Object.keys(embed).length > 1 || embedTitle || embedDescription) {
      message_data.embeds = [embed];
    }
    
    if (!message_data.content && !message_data.embeds) {
      return alert('Message cannot be empty!');
    }

    setLoading(true);
    try {
      const res = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel_id: selectedChannel,
          message_data,
          sender_name: senderName,
          sender_avatar: senderAvatar
        })
      });
      
      if (res.ok) {
        alert('Message sent successfully!');
      } else {
        const err = await res.json();
        alert('Error: ' + JSON.stringify(err));
      }
    } catch (e) {
      alert('Failed to send message');
    }
    setLoading(false);
  };

  const handleCopyJSON = () => {
    const embed: any = {};
    if (embedColor) {
      embed.color = parseInt(embedColor.replace('#', ''), 16);
    }
    if (embedTitle) embed.title = embedTitle;
    if (embedUrl) embed.url = embedUrl;
    if (embedDescription) embed.description = embedDescription;
    
    if (authorName) {
      embed.author = { name: authorName };
      if (authorIcon) embed.author.icon_url = authorIcon;
      if (authorUrl) embed.author.url = authorUrl;
    }
    
    if (thumbnailUrl) embed.thumbnail = { url: thumbnailUrl };
    if (imageUrl) embed.image = { url: imageUrl };
    
    if (footerText) {
      embed.footer = { text: footerText };
      if (footerIcon) embed.footer.icon_url = footerIcon;
    }
    
    const message_data: any = {};
    if (content) message_data.content = content;
    
    if (Object.keys(embed).length > 1 || embedTitle || embedDescription) {
      message_data.embeds = [embed];
    }
    
    navigator.clipboard.writeText(JSON.stringify(message_data, null, 2));
    setShowTutorial(true);
  };

  if (loading && !isAuthenticated) {
    return <div className="loading-screen">Initializing Stella Engine...</div>;
  }

  const renderDiscordText = (text: string) => {
    if (!text) return text;
    
    // Convert Mimu / Custom variables into fake discord mentions for the preview
    // Matches {user}, {membercount}, {server}, etc. and standard @Mentions
    const regex = /(\{(?:user|membercount|server|channel|user\.name|user\.mention|server\.memberCount)\}|@[a-zA-Z0-9_.]+)/gi;
    const parts = text.split(regex);
    
    return parts.map((part, i) => {
      const lower = part.toLowerCase();
      if (lower === '{user}' || lower === '{user.mention}') {
        return <span key={i} className="discord-mention">@{user?.username || 'User'}</span>;
      }
      if (lower === '{user.name}') {
        return <span key={i} style={{fontWeight: 'bold'}}>{user?.username || 'User'}</span>;
      }
      if (lower === '{membercount}' || lower === '{server.membercount}') {
        return <span key={i} className="discord-mention" style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#fff'}}>4,206</span>;
      }
      if (lower === '{server}') {
        return <span key={i} className="discord-mention" style={{backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#fff'}}>My Server</span>;
      }
      if (lower === '{channel}') {
        return <span key={i} className="discord-mention">#welcome</span>;
      }
      if (part.startsWith('@')) {
        return <span key={i} className="discord-mention">{part}</span>;
      }
      // Support returning a single space if it's normal text, React handles string arrays well
      return part;
    });
  };

  return (
    <>
      {!isAuthenticated ? (
        <div className="login-container">
          <div className="glass-panel text-center">
            <h1>Welcome to Stella Dashboard</h1>
            <p>Login with your Discord account to manage your servers and send beautiful embeds.</p>
            <button className="btn btn-discord large-btn" onClick={handleLogin}>
              Authenticate via Discord
            </button>
          </div>
        </div>
      ) : (
        <div className="container">
          {/* Sidebar */}
          <div className="sidebar glass-sidebar">
            <div className="section">
              <div className="section-title glow-text">Deployment Target</div>
              <div className="form-group">
                <label>Select Server (Admin Only)</label>
                <select value={selectedGuild} onChange={e => setSelectedGuild(e.target.value)}>
                  <option value="">-- Choose a Server --</option>
                  {guilds.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Select Channel</label>
                <select value={selectedChannel} onChange={e => setSelectedChannel(e.target.value)} disabled={!selectedGuild}>
                  <option value="">-- Choose a Channel --</option>
                  {channels.map(c => <option key={c.id} value={c.id}>#{c.name}</option>)}
                </select>
              </div>
            </div>

            {/* Custom Sender Section */}
            <div className={`collapsible ${!user?.is_vip ? 'vip-locked' : ''}`}>
              <div className="collapsible-header" onClick={() => {
                if (!user?.is_vip) {
                  setShowVipModal(true);
                } else {
                  toggleSection('sender');
                }
              }}>
                <span className="collapsible-title">
                  Custom Sender Profile 
                  {!user?.is_vip && <span className="pro-lock">👑 PRO</span>}
                </span>
                <span>{openSections.sender && user?.is_vip ? '▼' : '▶'}</span>
              </div>
              <div className={`collapsible-content ${(openSections.sender && user?.is_vip) ? 'open' : ''}`}>
                <div className="form-group">
                  <label>Sender Username (Optional)</label>
                  <input type="text" value={senderName} onChange={e => setSenderName(e.target.value)} placeholder="sтєℓℓɑ вღт" />
                </div>
                <div className="form-group">
                  <label>Sender Avatar URL (Optional)</label>
                  <input type="url" value={senderAvatar} onChange={e => setSenderAvatar(e.target.value)} placeholder="https://..." />
                </div>
              </div>
            </div>

            {/* Body Section */}
            <div className="collapsible">
              <div className="collapsible-header" onClick={() => toggleSection('message')}>
                <span className="collapsible-title">Message Body</span>
                <span>{openSections.message ? '▼' : '▶'}</span>
              </div>
              <div className={`collapsible-content ${openSections.message ? 'open' : ''}`}>
                <div className="form-group">
                  <label>Content (Outside Embed)</label>
                  <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Type normal text here..."></textarea>
                </div>
                <div className="form-group">
                  <label>Embed Color</label>
                  <input type="color" value={embedColor} onChange={e => setEmbedColor(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Title</label>
                  <input type="text" value={embedTitle} onChange={e => setEmbedTitle(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Title URL</label>
                  <input type="url" value={embedUrl} onChange={e => setEmbedUrl(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea value={embedDescription} onChange={e => setEmbedDescription(e.target.value)}></textarea>
                </div>
              </div>
            </div>

            {/* Author Section */}
            <div className="collapsible">
              <div className="collapsible-header" onClick={() => toggleSection('author')}>
                <span className="collapsible-title">Embed Author</span>
                <span>{openSections.author ? '▼' : '▶'}</span>
              </div>
              <div className={`collapsible-content ${openSections.author ? 'open' : ''}`}>
                <div className="form-group">
                  <label>Author Name</label>
                  <input type="text" value={authorName} onChange={e => setAuthorName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Author URL</label>
                  <input type="url" value={authorUrl} onChange={e => setAuthorUrl(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Author Icon URL</label>
                  <input type="url" value={authorIcon} onChange={e => setAuthorIcon(e.target.value)} />
                </div>
              </div>
            </div>

            {/* Images Section */}
            <div className="collapsible">
              <div className="collapsible-header" onClick={() => toggleSection('images')}>
                <span className="collapsible-title">Images</span>
                <span>{openSections.images ? '▼' : '▶'}</span>
              </div>
              <div className={`collapsible-content ${openSections.images ? 'open' : ''}`}>
                <div className="form-group">
                  <label>Main Image URL</label>
                  <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Thumbnail URL (Top Right)</label>
                  <input type="url" value={thumbnailUrl} onChange={e => setThumbnailUrl(e.target.value)} />
                </div>
              </div>
            </div>

            {/* Footer Section */}
            <div className="collapsible">
              <div className="collapsible-header" onClick={() => toggleSection('footer')}>
                <span className="collapsible-title">Footer</span>
                <span>{openSections.footer ? '▼' : '▶'}</span>
              </div>
              <div className={`collapsible-content ${openSections.footer ? 'open' : ''}`}>
                <div className="form-group">
                  <label>Footer Text</label>
                  <input type="text" value={footerText} onChange={e => setFooterText(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Footer Icon URL</label>
                  <input type="url" value={footerIcon} onChange={e => setFooterIcon(e.target.value)} />
                </div>
              </div>
            </div>
            
            {/* Send Button */}
            <div className="section" style={{ borderBottom: 'none', marginTop: '10px', display: 'flex', gap: '10px' }}>
              <button 
                className="btn btn-discord large-btn" 
                onClick={handleSend} 
                disabled={loading || !selectedChannel}
                style={{ flex: 1, padding: '15px', fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', justifyContent: 'center', gap: '10px', alignItems: 'center' }}
              >
                {loading ? 'Sending...' : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    SEND MESSAGE
                  </>
                )}
              </button>
              
              <button 
                className="btn" 
                onClick={handleCopyJSON} 
                title="Copy JSON Code to clipboard"
                style={{ background: 'var(--bg-darker)', border: '1px solid var(--border)', padding: '0 20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', fontSize: '1rem', fontWeight: 'bold', flex: 1 }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                COPY JSON CODE
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="preview-area">
            <div className="discord-message">
              <div className="discord-avatar" style={(user?.is_vip && senderAvatar) ? {backgroundImage: `url(${senderAvatar})`} : {}}></div>
              <div className="discord-content">
                <div className="discord-header">
                  <span className="discord-username">{(user?.is_vip && senderName) ? senderName : 'sтєℓℓɑ вღт'}</span>
                  <span className="discord-bot-tag">
                    <svg aria-label="Bot" aria-hidden="false" role="img" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 15.2"><path d="M7.4,11.17,4,8.62,5,7.26l2,1.53L10.64,4l1.36,1.54Z" fill="currentColor"></path></svg>
                    BOT
                  </span>
                  <span className="discord-timestamp">Today at {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                
                {content && <div className="discord-body">{renderDiscordText(content)}</div>}
                
                {(embedTitle || embedDescription || authorName || footerText || imageUrl || thumbnailUrl) && (
                  <div className="discord-embed" style={{ borderLeftColor: embedColor }}>
                    <div className={`embed-inner-container ${thumbnailUrl ? 'has-thumbnail' : ''}`}>
                      {authorName && (
                        <div className="embed-author">
                          {authorIcon && <img src={authorIcon} alt="author" className="embed-author-icon" />}
                          {authorUrl ? <a href={authorUrl} target="_blank" style={{color: 'inherit', textDecoration: 'none'}}>{authorName}</a> : authorName}
                        </div>
                      )}
                      
                      {embedTitle && (
                        <div className={embedUrl ? "embed-title link" : "embed-title"}>
                          {embedUrl ? <a href={embedUrl} target="_blank" style={{color: 'inherit', textDecoration: 'inherit'}}>{renderDiscordText(embedTitle)}</a> : renderDiscordText(embedTitle)}
                        </div>
                      )}
                      
                      {embedDescription && <div className="embed-description">{renderDiscordText(embedDescription)}</div>}
                      
                      {thumbnailUrl && <img src={thumbnailUrl} alt="thumbnail" className="embed-thumbnail" />}
                    </div>
                    
                    {imageUrl && <img src={imageUrl} alt="embed" className="embed-image" />}
                    
                    {footerText && (
                      <div className="embed-footer">
                        {footerIcon && <img src={footerIcon} alt="footer" className="embed-footer-icon" />}
                        {footerText}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIP Modal */}
      {showVipModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel">
            <h2>👑 Unlock PRO Features</h2>
            <p>Customizing the sender's username and avatar is a PRO exclusive feature.</p>
            <p className="contact-text">Contact <strong>@zynex.05</strong> on Discord to purchase a VIP code.</p>
            
            <div className="form-group" style={{marginTop: '20px'}}>
              <input 
                type="text" 
                placeholder="Enter VIP Code..." 
                value={vipCode} 
                onChange={e => setVipCode(e.target.value)} 
                style={{textAlign: 'center', letterSpacing: '2px', fontSize: '1.2rem', textTransform: 'uppercase'}}
              />
            </div>
            
            <div className="modal-buttons" style={{display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px'}}>
              <button className="btn" style={{background: 'var(--bg-darker)'}} onClick={() => setShowVipModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleRedeemCode} disabled={!vipCode}>Redeem Code</button>
            </div>
          </div>
        </div>
      )}

      {/* Tutorial Modal */}
      {showTutorial && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{maxWidth: '600px', textAlign: 'left'}}>
            <h2 style={{textAlign: 'center', marginBottom: '20px'}}>✅ Codul JSON a fost copiat!</h2>
            <p style={{marginBottom: '15px'}}>Acum poți folosi acest cod pentru a crea un mesaj automat în bot-ul tău.</p>
            
            <div style={{background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '8px', marginBottom: '20px'}}>
              <h3 style={{fontSize: '1.1rem', marginBottom: '10px', color: 'var(--accent)'}}>Cum să îl folosești pe Stella Bot:</h3>
              <ol style={{paddingLeft: '20px', lineHeight: '1.6'}}>
                <li>Mergi pe serverul tău de Discord.</li>
                <li>Folosește comanda bot-ului tău dedicată pentru mesaje de bun venit / embed-uri (de ex: <code style={{background: '#333', padding: '2px 5px', borderRadius: '3px'}}>/welcome set</code> sau <code style={{background: '#333', padding: '2px 5px', borderRadius: '3px'}}>/embed</code>).</li>
                <li>Dă paste <strong>(CTRL + V)</strong> sau "Lipește" de pe telefon la codul JSON pe care tocmai l-ai copiat.</li>
                <li>Bot-ul tău va citi codul și va ști exact ce titlu, ce poze și ce culori să folosească atunci când intră un membru!</li>
              </ol>
            </div>
            
            <div className="modal-buttons" style={{display: 'flex', justifyContent: 'center'}}>
              <button className="btn btn-discord large-btn" onClick={() => setShowTutorial(false)}>Am înțeles, închide</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
