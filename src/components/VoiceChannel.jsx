import { useState, useRef, useEffect } from 'react';

// ── Stranger Things playlist ─────────────────────────────────────
// Using YouTube embed iframes (no API key needed, plays in-browser)
const PLAYLIST = [
  {
    id:       'st-theme',
    title:    'Stranger Things — Main Theme',
    artist:   'Kyle Dixon & Michael Stein',
    youtube:  'https://www.youtube.com/embed/01qStKYB7ts?autoplay=1&start=0',
    duration: '1:30',
    cover:    '🌀',
    color:    '#1a0a2e',
    accent:   '#c84b9e',
  },
  {
    id:       'running-up',
    title:    'Running Up That Hill',
    artist:   'Kate Bush',
    youtube:  'https://www.youtube.com/embed/HYwNM1t9ltI?autoplay=1&start=0',
    duration: '5:01',
    cover:    '🔴',
    color:    '#1a0a0a',
    accent:   '#e85d4a',
  },
  {
    id:       'should-i-stay',
    title:    'Should I Stay or Should I Go',
    artist:   'The Clash',
    youtube:  'https://www.youtube.com/embed/BN1WwnEDWAM?autoplay=1&start=0',
    duration: '3:08',
    cover:    '⚡',
    color:    '#0a1a0a',
    accent:   '#4ae85d',
  },
  {
    id:       'every-breath',
    title:    'Every Breath You Take',
    artist:   'The Police',
    youtube:  'https://www.youtube.com/embed/OMOGaugKpzs?autoplay=1&start=0',
    duration: '4:13',
    cover:    '🌊',
    color:    '#0a1220',
    accent:   '#4a9ee8',
  },
  {
    id:       'master-of-puppets',
    title:    'Master of Puppets',
    artist:   'Metallica',
    youtube:  'https://www.youtube.com/embed/E0ozmU9cJDg?autoplay=1&start=0',
    duration: '8:36',
    cover:    '🔥',
    color:    '#1a0a00',
    accent:   '#e8844a',
  },
];

// Members currently "in voice" — synced via socket
export default function VoiceChannel({
  channel,
  currentUser,
  socket,
  onlineUsers,
  onLeave,
}) {
  const [joined,        setJoined]        = useState(false);
  const [playing,       setPlaying]       = useState(null);   // track id
  const [voiceMembers,  setVoiceMembers]  = useState([]);
  const [volume,        setVolume]        = useState(80);
  const [iframeKey,     setIframeKey]     = useState(0);      // force remount on track change
  const [showPlaylist,  setShowPlaylist]  = useState(false);
  const [muted,         setMuted]         = useState(false);
  const iframeRef = useRef(null);

  const currentTrack = PLAYLIST.find(t => t.id === playing);

  // ── Socket: sync voice members ───────────────────────────────
  useEffect(() => {
    if (!socket) return;
    socket.on('voice:members', ({ channelId, members }) => {
      if (channelId === channel?.id) setVoiceMembers(members);
    });
    socket.on('voice:joined', ({ userId, username, role }) => {
      setVoiceMembers(prev =>
        prev.find(m => m.id === userId) ? prev :
        [...prev, { id: userId, username, role }]
      );
    });
    socket.on('voice:left', ({ userId }) => {
      setVoiceMembers(prev => prev.filter(m => m.id !== userId));
    });
    return () => {
      socket.off('voice:members');
      socket.off('voice:joined');
      socket.off('voice:left');
    };
  }, [socket, channel?.id]);

  // ── Join voice ───────────────────────────────────────────────
  function handleJoin() {
    setJoined(true);
    socket?.emit('voice:join', { channelId: channel?.id, channelName: channel?.name });
  }

  // ── Leave voice ──────────────────────────────────────────────
  function handleLeave() {
    setJoined(false);
    setPlaying(null);
    socket?.emit('voice:leave', { channelId: channel?.id });
  }

  // ── Play a track ─────────────────────────────────────────────
  function playTrack(trackId) {
    setPlaying(trackId);
    setIframeKey(k => k + 1);  // remount iframe to trigger autoplay
  }

  // ── Background gradient based on current track ───────────────
  const bgColor = currentTrack?.color || '#0f1923';
  const accent  = currentTrack?.accent || '#4a9e8e';

  // ─────────────────────────────────────────────────────────────
  //  PRE-JOIN SCREEN (like Discord voice channel lobby)
  // ─────────────────────────────────────────────────────────────
  if (!joined) {
    return (
      <div className="vc-lobby" style={{ background: `radial-gradient(ellipse at center, ${bgColor} 0%, #0a0f14 100%)` }}>
        <div className="vc-lobby-inner">
          <div className="vc-lobby-icon">🎵</div>
          <h2 className="vc-lobby-title">{channel?.name || 'music-lounge'}</h2>
          <p className="vc-lobby-sub">Stranger Things Music Lounge</p>
          <p className="vc-lobby-desc">
            {voiceMembers.length === 0
              ? 'No one is currently listening'
              : `${voiceMembers.length} member${voiceMembers.length > 1 ? 's' : ''} listening`}
          </p>

          {/* Members already in voice */}
          {voiceMembers.length > 0 && (
            <div className="vc-lobby-members">
              {voiceMembers.map(m => (
                <div key={m.id} className="vc-lobby-member">
                  <div className={`vc-lobby-avatar vc-av-${m.role}`}>
                    {m.username[0].toUpperCase()}
                  </div>
                  <span>{m.username}</span>
                </div>
              ))}
            </div>
          )}

          <button className="vc-join-btn" onClick={handleJoin}>
            🎧 Join Lounge
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  //  ACTIVE PLAYER SCREEN
  // ─────────────────────────────────────────────────────────────
  return (
    <div
      className="vc-player"
      style={{ background: `radial-gradient(ellipse at 50% 30%, ${bgColor} 0%, #070b10 80%)` }}
    >
      {/* ── Top bar ── */}
      <div className="vc-topbar">
        <div className="vc-topbar-left">
          <span className="vc-topbar-icon">🎵</span>
          <span className="vc-topbar-name">{channel?.name || 'music-lounge'}</span>
          <span className="vc-topbar-listening">
            {voiceMembers.length} listening
          </span>
        </div>
        <div className="vc-topbar-right">
          <button
            className="vc-topbar-btn"
            onClick={() => setShowPlaylist(v => !v)}
            title="Playlist"
          >📋</button>
          <button
            className="vc-topbar-btn vc-topbar-btn-leave"
            onClick={handleLeave}
            title="Leave lounge"
          >📞 Leave</button>
        </div>
      </div>

      <div className="vc-body">

        {/* ── Left: Now playing ── */}
        <div className="vc-now-playing">
          {currentTrack ? (
            <>
              {/* Album art placeholder */}
              <div
                className="vc-album-art"
                style={{ background: `radial-gradient(circle, ${accent}33, ${bgColor})`, borderColor: accent }}
              >
                <span className="vc-album-emoji">{currentTrack.cover}</span>
                <div className="vc-album-pulse" style={{ borderColor: accent }} />
              </div>

              <div className="vc-track-info">
                <div className="vc-track-title">{currentTrack.title}</div>
                <div className="vc-track-artist">{currentTrack.artist}</div>
                <div className="vc-track-duration">{currentTrack.duration}</div>
              </div>

              {/* YouTube hidden iframe — audio only experience */}
              <div className="vc-iframe-wrap">
                <iframe
                  key={iframeKey}
                  ref={iframeRef}
                  src={muted ? currentTrack.youtube.replace('autoplay=1', 'autoplay=0') : currentTrack.youtube}
                  title={currentTrack.title}
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  className="vc-iframe"
                />
              </div>

              {/* Controls */}
              <div className="vc-controls">
                <button
                  className="vc-ctrl-btn"
                  onClick={() => {
                    const idx = PLAYLIST.findIndex(t => t.id === playing);
                    const prev = PLAYLIST[(idx - 1 + PLAYLIST.length) % PLAYLIST.length];
                    playTrack(prev.id);
                  }}
                  title="Previous"
                >⏮</button>

                <button
                  className="vc-ctrl-btn vc-ctrl-btn-play"
                  style={{ borderColor: accent, boxShadow: `0 0 20px ${accent}55` }}
                  onClick={() => setPlaying(null)}
                  title="Stop"
                >⏹</button>

                <button
                  className="vc-ctrl-btn"
                  onClick={() => {
                    const idx = PLAYLIST.findIndex(t => t.id === playing);
                    const next = PLAYLIST[(idx + 1) % PLAYLIST.length];
                    playTrack(next.id);
                  }}
                  title="Next"
                >⏭</button>
              </div>

              {/* Volume + mute */}
              <div className="vc-volume-row">
                <button
                  className={`vc-mute-btn ${muted ? 'muted' : ''}`}
                  onClick={() => setMuted(v => !v)}
                >
                  {muted ? '🔇' : '🔊'}
                </button>
                <input
                  type="range"
                  className="vc-volume-slider"
                  min="0" max="100"
                  value={volume}
                  onChange={e => setVolume(e.target.value)}
                  style={{ '--accent': accent }}
                />
                <span className="vc-volume-label">{volume}%</span>
              </div>

            </>
          ) : (
            /* No track selected */
            <div className="vc-no-track">
              <div className="vc-no-track-icon">🎵</div>
              <p className="vc-no-track-text">Select a track to start playing</p>
              <p className="vc-no-track-sub">Choose from the Stranger Things playlist →</p>
            </div>
          )}
        </div>

        {/* ── Right: Playlist + Members ── */}
        <div className="vc-right-panel">

          {/* Playlist */}
          <div className="vc-playlist-section">
            <div className="vc-section-label">🎵 Stranger Things Playlist</div>
            {PLAYLIST.map((track, i) => (
              <div
                key={track.id}
                className={`vc-track-row ${playing === track.id ? 'vc-track-active' : ''}`}
                onClick={() => playTrack(track.id)}
                style={playing === track.id ? { borderColor: track.accent, background: `${track.accent}12` } : {}}
              >
                <div
                  className="vc-track-num"
                  style={playing === track.id ? { color: track.accent } : {}}
                >
                  {playing === track.id ? '▶' : i + 1}
                </div>
                <div className="vc-track-cover">{track.cover}</div>
                <div className="vc-track-row-info">
                  <div className="vc-track-row-title">{track.title}</div>
                  <div className="vc-track-row-artist">{track.artist}</div>
                </div>
                <div className="vc-track-row-dur">{track.duration}</div>
              </div>
            ))}
          </div>

          {/* Voice members */}
          <div className="vc-members-section">
            <div className="vc-section-label">🎧 Listening Now — {voiceMembers.length}</div>
            {voiceMembers.map(m => (
              <div key={m.id} className="vc-member-row">
                <div className={`vc-member-av vc-av-${m.role}`}>
                  {m.username[0].toUpperCase()}
                  <span className="vc-member-live" />
                </div>
                <div className="vc-member-name">{m.username}</div>
                <span className={`vc-member-role vc-role-${m.role}`}>{m.role}</span>
                <span className="vc-member-wave">
                  {[1,2,3].map(i => (
                    <span key={i} className="vc-wave-bar" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </span>
              </div>
            ))}
            {/* Current user */}
            <div className="vc-member-row vc-member-you">
              <div className={`vc-member-av vc-av-${currentUser.role}`}>
                {currentUser.username[0].toUpperCase()}
                <span className="vc-member-live" />
              </div>
              <div className="vc-member-name">{currentUser.username} <span className="vc-you-tag">(you)</span></div>
              <span className={`vc-member-role vc-role-${currentUser.role}`}>{currentUser.role}</span>
              <span className="vc-member-wave">
                {[1,2,3].map(i => (
                  <span key={i} className="vc-wave-bar" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
