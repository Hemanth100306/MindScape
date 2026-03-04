import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { useAuth } from '../Auth/AuthProvider';

const navItems = [
  {
    text: 'Home', path: '/',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    color: '#8b5cf6'
  },
  {
    text: 'Journal', path: '/journal',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" /><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
      </svg>
    ),
    color: '#06b6d4'
  },
  {
    text: 'Mood Tracker', path: '/mood',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M8 13s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" />
      </svg>
    ),
    color: '#ec4899'
  },
  {
    text: 'Breathe', path: '/breathe',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22a9 9 0 01-9-9c0-4.97 4.03-9 9-9s9 4.03 9 9a9 9 0 01-9 9z" />
        <path d="M12 8v4l3 3" />
      </svg>
    ),
    color: '#10b981'
  },
  {
    text: 'Assessment', path: '/symptoms',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
      </svg>
    ),
    color: '#f59e0b'
  },
  {
    text: 'AI Companion', path: '/chat',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
    color: '#8b5cf6'
  },
  {
    text: 'Remedies', path: '/remedies',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    color: '#34d399'
  },
  {
    text: 'Resources', path: '/resources',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
      </svg>
    ),
    color: '#f59e0b'
  },
  {
    text: 'Insights', path: '/insights',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    color: '#a78bfa'
  },
];

const JOURNAL_LS = (uid) => `mindscape_journal_${uid}`;
const MOOD_LS = (uid) => `mindscape_mood_${uid}`;

const DAILY_TIPS = [
  'Box breathing can reduce stress in under 2 minutes.',
  'Writing 3 things you\'re grateful for boosts mood by up to 10%.',
  'A 10-minute walk can lift your mood for up to 2 hours.',
  'Drinking water is one of the simplest mental clarity boosters.',
  'Small wins count — celebrate them.',
  'Sleep is the #1 mental health habit. Protect it.',
  'Checking in with a friend once a week reduces loneliness significantly.',
];

const getNotifications = (uid) => {
  if (!uid) return [];
  const notifs = [];
  const today = new Date().toDateString();

  try {
    // 1. Mood: did they log today?
    const moods = JSON.parse(localStorage.getItem(MOOD_LS(uid)) || '[]');
    const loggedMoodToday = moods.some(m => new Date(m.createdAt).toDateString() === today);
    if (!loggedMoodToday) {
      notifs.push({ id: 'mood_today', icon: '🎭', title: 'Daily Mood Check-in', body: "You haven't logged your mood today. How are you feeling?", time: 'Now', color: '#ec4899', unread: true, link: '/mood' });
    }

    // 2. Journal streak milestone
    const journals = JSON.parse(localStorage.getItem(JOURNAL_LS(uid)) || '[]');
    const loggedJournalToday = journals.some(j => new Date(j.createdAt).toDateString() === today);
    if (!loggedJournalToday && journals.length > 0) {
      notifs.push({ id: 'journal_today', icon: '📓', title: 'Journal Prompt', body: 'What are three things you\'re grateful for right now?', time: 'Today', color: '#06b6d4', unread: true, link: '/journal' });
    }

    // 3. Daily rotating tip
    const tip = DAILY_TIPS[new Date().getDate() % DAILY_TIPS.length];
    notifs.push({ id: 'tip', icon: '💡', title: 'Daily Wellness Tip', body: tip, time: 'Today', color: '#8b5cf6', unread: false, link: null });

    // 4. Mia suggestion
    notifs.push({ id: 'mia', icon: '🤖', title: 'Chat with Mia', body: 'Your AI companion is here. How are you doing today?', time: 'Today', color: '#10b981', unread: false, link: '/chat' });
  } catch { /* ignore */ }

  return notifs;
};

const Layout = ({ children, toggleColorMode }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [readNotifs, setReadNotifs] = useState(new Set());
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const notifications = React.useMemo(
    () => getNotifications(currentUser?.uid),
    [currentUser?.uid]
  );

  const unreadCount = notifications.filter(n => n.unread && !readNotifs.has(n.id)).length;
  const markAllRead = () => setReadNotifs(new Set(notifications.map(n => n.id)));

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (e) {
      console.error(e);
    }
  };

  const authPages = ['/login', '/register', '/forgot-password'];
  if (authPages.includes(location.pathname)) return <>{children}</>;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
      {/* Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
          }}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        width: 260,
        zIndex: 300,
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        background: 'linear-gradient(180deg, #0a0e1a 0%, #080b14 100%)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '10px 0 60px rgba(0,0,0,0.6)',
      }}>
        {/* Logo area */}
        <div style={{
          padding: '28px 24px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(139,92,246,0.5)',
              flexShrink: 0,
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
                <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
              </svg>
            </div>
            <div>
              <div style={{
                fontSize: '1.1rem', fontWeight: 800,
                background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-0.02em',
              }}>MindScape</div>
              <div style={{ fontSize: '0.7rem', color: '#4a5378', fontWeight: 500 }}>Mental Health Platform</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', color: '#4a5378', padding: '0 12px', marginBottom: 8, textTransform: 'uppercase' }}>
            Navigation
          </div>
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.text}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 12px',
                  borderRadius: 12,
                  marginBottom: 4,
                  textDecoration: 'none',
                  position: 'relative',
                  transition: 'all 0.2s',
                  background: active ? `${item.color}18` : 'transparent',
                  border: active ? `1px solid ${item.color}33` : '1px solid transparent',
                  color: active ? item.color : '#8b93b5',
                }}
              >
                {active && (
                  <div style={{
                    position: 'absolute',
                    left: 0, top: '50%', transform: 'translateY(-50%)',
                    width: 3, height: '60%',
                    background: item.color,
                    borderRadius: '0 4px 4px 0',
                    boxShadow: `0 0 12px ${item.color}`,
                  }} />
                )}
                <span style={{ color: active ? item.color : '#8b93b5', transition: 'color 0.2s' }}>
                  {item.icon}
                </span>
                <span style={{ fontSize: '0.9rem', fontWeight: active ? 600 : 400, transition: 'all 0.2s' }}>
                  {item.text}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* User area */}
        {currentUser && (
          <div style={{
            padding: '16px 12px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px',
              borderRadius: 12,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
              marginBottom: 8,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.8rem', fontWeight: 700, color: 'white',
                flexShrink: 0,
              }}>
                {(currentUser.displayName || currentUser.email)?.[0]?.toUpperCase() || 'U'}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f0f2ff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {currentUser.displayName || currentUser.email?.split('@')[0] || 'User'}
                </div>
                <div style={{ fontSize: '0.65rem', color: '#4a5378' }}>{currentUser.email}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '9px 12px',
                borderRadius: 10,
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.2)',
                color: '#f87171',
                fontSize: '0.85rem', fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Sign Out
            </button>
          </div>
        )}
      </aside>

      {/* Top Bar */}
      <header style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        height: 64,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        background: 'rgba(8, 11, 20, 0.85)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 1px 30px rgba(0,0,0,0.3)',
      }}>
        <button
          id="sidebar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            width: 40, height: 40,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 10,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            cursor: 'pointer',
            color: '#f0f2ff',
            transition: 'all 0.2s',
            marginRight: 16,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.2)'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.4)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        {/* Current page breadcrumb */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            fontSize: '1rem', fontWeight: 700,
            background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            letterSpacing: '-0.02em',
          }}>
            MindScape
          </div>
          {navItems.find(i => i.path === location.pathname) && (
            <>
              <span style={{ color: '#2a3050', fontSize: '1rem' }}>/</span>
              <span style={{ color: '#8b93b5', fontSize: '0.875rem', fontWeight: 500 }}>
                {navItems.find(i => i.path === location.pathname)?.text}
              </span>
            </>
          )}
        </div>

        {/* Right side actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

          {/* Bell button + dropdown */}
          <div ref={notifRef} style={{ position: 'relative' }}>
            <button
              id="notif-btn"
              onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
              style={{
                width: 36, height: 36,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 10, cursor: 'pointer',
                background: notifOpen ? 'rgba(236,72,153,0.15)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${notifOpen ? 'rgba(236,72,153,0.4)' : 'rgba(255,255,255,0.07)'}`,
                color: notifOpen ? '#ec4899' : '#8b93b5',
                position: 'relative', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { if (!notifOpen) { e.currentTarget.style.background = 'rgba(236,72,153,0.1)'; e.currentTarget.style.color = '#ec4899'; } }}
              onMouseLeave={e => { if (!notifOpen) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#8b93b5'; } }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" />
              </svg>
              {unreadCount > 0 && (
                <div style={{
                  position: 'absolute', top: 6, right: 6,
                  minWidth: 14, height: 14, borderRadius: 7,
                  background: '#ec4899', boxShadow: '0 0 8px #ec4899',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.55rem', fontWeight: 800, color: 'white',
                  border: '1.5px solid #080b14',
                }}>{unreadCount}</div>
              )}
            </button>

            {/* Notification panel */}
            {notifOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                width: 320, zIndex: 500,
                background: '#0f1628',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 18,
                boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(236,72,153,0.1)',
                overflow: 'hidden',
                animation: 'scaleIn 0.2s ease-out',
                transformOrigin: 'top right',
              }}>
                <div style={{
                  padding: '16px 18px 12px',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f0f2ff' }}>Notifications</div>
                    <div style={{ fontSize: '0.72rem', color: '#8b93b5', marginTop: 2 }}>
                      {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                    </div>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      style={{
                        background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)',
                        borderRadius: 8, color: '#a78bfa', fontSize: '0.72rem', fontWeight: 700,
                        padding: '4px 10px', cursor: 'pointer', fontFamily: 'inherit',
                      }}
                    >Mark all read</button>
                  )}
                </div>
                <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                  {notifications.map(n => {
                    const isRead = readNotifs.has(n.id);
                    return (
                      <div
                        key={n.id}
                        onClick={() => setReadNotifs(prev => new Set(prev).add(n.id))}
                        style={{
                          display: 'flex', gap: 12, padding: '12px 18px',
                          borderBottom: '1px solid rgba(255,255,255,0.04)',
                          background: (!n.unread || isRead) ? 'transparent' : 'rgba(236,72,153,0.04)',
                          cursor: 'pointer', transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = (!n.unread || isRead) ? 'transparent' : 'rgba(236,72,153,0.04)'; }}
                      >
                        <div style={{
                          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                          background: `${n.color}18`, border: `1px solid ${n.color}30`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '1rem',
                        }}>{n.icon}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f0f2ff' }}>{n.title}</span>
                            {n.unread && !isRead && (
                              <div style={{ width: 6, height: 6, borderRadius: '50%', background: n.color, flexShrink: 0 }} />
                            )}
                          </div>
                          <div style={{ fontSize: '0.76rem', color: '#8b93b5', lineHeight: 1.4, marginBottom: 4 }}>{n.body}</div>
                          <div style={{ fontSize: '0.68rem', color: '#4a5378' }}>{n.time}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ padding: '10px 18px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <button style={{
                    width: '100%', padding: '8px', borderRadius: 10, border: 'none',
                    background: 'transparent', color: '#8b93b5', fontSize: '0.8rem',
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}>View all notifications</button>
                </div>
              </div>
            )}
          </div>

          {/* User avatar + profile dropdown */}
          {currentUser && (
            <div ref={profileRef} style={{ position: 'relative' }}>
              <button
                id="profile-btn"
                onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                style={{
                  width: 36, height: 36, borderRadius: '50%', border: 'none',
                  background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.8rem', fontWeight: 700, color: 'white',
                  boxShadow: profileOpen ? '0 0 0 3px rgba(139,92,246,0.4), 0 0 20px rgba(139,92,246,0.5)' : '0 0 16px rgba(139,92,246,0.4)',
                  cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s',
                }}
              >
                {currentUser.email?.[0]?.toUpperCase() || 'U'}
              </button>

              {/* Profile dropdown */}
              {profileOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                  width: 240, zIndex: 500,
                  background: '#0f1628',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 18,
                  boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                  overflow: 'hidden',
                  animation: 'scaleIn 0.2s ease-out',
                  transformOrigin: 'top right',
                }}>
                  <div style={{
                    padding: '16px 16px 14px',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                      background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1rem', fontWeight: 700, color: 'white',
                      boxShadow: '0 0 16px rgba(139,92,246,0.4)',
                    }}
                    >{(currentUser.displayName || currentUser.email)?.[0]?.toUpperCase() || 'U'}</div>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f0f2ff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {currentUser.displayName || currentUser.email?.split('@')[0] || 'User'}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#4a5378', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {currentUser.email}
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: '8px' }}>
                    {[
                      { icon: '🏠', label: 'Dashboard', action: () => { navigate('/'); setProfileOpen(false); } },
                      { icon: '👤', label: 'Profile & Settings', action: () => { navigate('/profile'); setProfileOpen(false); } },
                      { icon: '📓', label: 'My Journal', action: () => { navigate('/journal'); setProfileOpen(false); } },
                      { icon: '🎭', label: 'Mood History', action: () => { navigate('/mood'); setProfileOpen(false); } },
                    ].map((item, i) => (
                      <button
                        key={i}
                        onClick={item.action}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                          padding: '9px 10px', borderRadius: 10, border: 'none',
                          background: 'transparent', color: '#8b93b5', cursor: 'pointer',
                          fontFamily: 'inherit', fontSize: '0.85rem', fontWeight: 500,
                          textAlign: 'left', transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#f0f2ff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#8b93b5'; }}
                      >
                        <span style={{ fontSize: '1rem' }}>{item.icon}</span>
                        {item.label}
                      </button>
                    ))}
                    <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '6px 0' }} />
                    <button
                      id="profile-logout-btn"
                      onClick={handleLogout}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                        padding: '9px 10px', borderRadius: 10, border: 'none',
                        background: 'transparent', color: '#f87171', cursor: 'pointer',
                        fontFamily: 'inherit', fontSize: '0.85rem', fontWeight: 600,
                        textAlign: 'left', transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main style={{
        flex: 1,
        marginTop: 64,
        padding: '32px 24px',
        maxWidth: '100%',
        animation: 'fadeInUp 0.4s ease-out',
      }}>
        {children}
      </main>
    </div>
  );
};

export default Layout;