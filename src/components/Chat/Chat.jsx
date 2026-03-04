import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../Auth/AuthProvider';
import { useNavigate } from 'react-router-dom';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';
const SESSIONS_KEY = (uid) => `mindscape_sessions_${uid}`;
const MAX_SESSIONS = 30;

const SYSTEM_PROMPT = `You are Mia, a warm, empathetic AI mental health companion in MindScape. Be supportive and non-judgmental.
- Listen actively, validate feelings before advice
- Ask ONE follow-up question per response
- Keep responses concise (3-5 sentences), warm, conversational
- Use gentle emojis occasionally
- Offer evidence-based coping (CBT, mindfulness, breathing, journaling) when relevant
- For crisis/self-harm: ALWAYS immediately say "Please call or text 988 (Suicide & Crisis Lifeline) right now." 
- Recommend professional help for serious ongoing issues
- Reference earlier conversation naturally
- Suggest MindScape features (Journal, Mood Tracker, Breathing) when relevant
- You are NOT a licensed therapist`;

const genId = () => `chat_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

const getTitle = (msgs) => {
  const u = msgs.find(m => m.role === 'user');
  if (!u) return 'New conversation';
  return u.content.length > 40 ? u.content.slice(0, 40) + '…' : u.content;
};

const groupByDate = (sessions) => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yestStart = new Date(todayStart); yestStart.setDate(todayStart.getDate() - 1);
  const weekStart = new Date(todayStart); weekStart.setDate(todayStart.getDate() - 7);
  const groups = [
    { label: 'Today', items: [] },
    { label: 'Yesterday', items: [] },
    { label: 'Previous 7 Days', items: [] },
    { label: 'Older', items: [] },
  ];
  sessions.forEach(s => {
    const d = new Date(s.updatedAt);
    if (d >= todayStart) groups[0].items.push(s);
    else if (d >= yestStart) groups[1].items.push(s);
    else if (d >= weekStart) groups[2].items.push(s);
    else groups[3].items.push(s);
  });
  return groups.filter(g => g.items.length > 0);
};

const Dots = () => (
  <div style={{ display: 'flex', gap: 5, padding: '12px 16px', alignItems: 'center' }}>
    {[0, 1, 2].map(i => (
      <div key={i} style={{
        width: 8, height: 8, borderRadius: '50%',
        background: 'linear-gradient(135deg,#8b5cf6,#ec4899)',
        animation: 'miaDot 1.2s ease-in-out infinite',
        animationDelay: `${i * 0.18}s`,
      }} />
    ))}
  </div>
);

const CHIPS = [
  "I've been feeling anxious lately",
  "I'm struggling with sleep",
  "I feel stressed about studies",
  "I'm feeling really lonely",
];

export default function AIChat() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [currentId, setCurrentId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState(null);
  const [hovSession, setHovSession] = useState(null);
  const [hovDel, setHovDel] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Load sessions from localStorage
  useEffect(() => {
    if (!currentUser) return;
    try {
      const saved = JSON.parse(localStorage.getItem(SESSIONS_KEY(currentUser.uid)) || '[]');
      setSessions(saved);
    } catch { /* ignore */ }
  }, [currentUser]);

  const persist = (s) => {
    if (!currentUser) return;
    localStorage.setItem(SESSIONS_KEY(currentUser.uid), JSON.stringify(s.slice(0, MAX_SESSIONS)));
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const userName = currentUser?.displayName?.split(' ')[0] || currentUser?.email?.split('@')[0] || '';

  const callGroq = async (history) => {
    const key = import.meta.env.VITE_GROQ_API_KEY;
    if (!key || key === 'your_groq_key_here') throw new Error('API key not configured');
    const sys = SYSTEM_PROMPT + (userName ? `\n\nUser's name: ${userName}.` : '');
    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'system', content: sys }, ...history.map(m => ({ role: m.role, content: m.content }))],
        max_tokens: 512, temperature: 0.85,
      }),
    });
    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e?.error?.message || `Error ${res.status}`); }
    return (await res.json()).choices[0].message.content;
  };

  const newChat = async (initialMsg = null) => {
    const session = { id: genId(), title: 'New conversation', messages: [], createdAt: Date.now(), updatedAt: Date.now() };
    const allSessions = [session, ...sessions];
    setSessions(allSessions); persist(allSessions);
    setCurrentId(session.id); setMessages([]); setError(null); setTyping(true);
    try {
      if (initialMsg) {
        const userMsg = { role: 'user', content: initialMsg, ts: new Date().toISOString() };
        setMessages([userMsg]);
        const reply = await callGroq([userMsg]);
        const aiMsg = { role: 'assistant', content: reply, ts: new Date().toISOString() };
        const final = [userMsg, aiMsg];
        setMessages(final);
        const updated = allSessions.map(s => s.id === session.id ? { ...s, title: getTitle([userMsg]), messages: final, updatedAt: Date.now() } : s);
        setSessions(updated); persist(updated);
      } else {
        const reply = await callGroq([{ role: 'user', content: 'Hi Mia!' }]);
        const greet = { role: 'assistant', content: reply, ts: new Date().toISOString() };
        setMessages([greet]);
        const updated = allSessions.map(s => s.id === session.id ? { ...s, messages: [greet], updatedAt: Date.now() } : s);
        setSessions(updated); persist(updated);
      }
    } catch (e) { setError(e.message); }
    finally { setTyping(false); setTimeout(() => inputRef.current?.focus(), 100); }
  };

  const selectChat = (s) => {
    setCurrentId(s.id);
    setMessages(s.messages.map(m => ({ ...m, ts: m.ts ? new Date(m.ts) : null })));
    setError(null);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'instant' }), 50);
  };

  const deleteChat = (e, id) => {
    e.stopPropagation();
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated); persist(updated);
    if (currentId === id) { setCurrentId(null); setMessages([]); }
  };

  const sendMessage = async (text = input.trim()) => {
    if (!text || typing || !currentId) return;
    const capId = currentId;
    const capMsgs = messages;
    setInput(''); setError(null);
    const userMsg = { role: 'user', content: text, ts: new Date().toISOString() };
    const withUser = [...capMsgs, userMsg];
    setMessages(withUser); setTyping(true);
    const isFirst = !capMsgs.some(m => m.role === 'user');
    try {
      const reply = await callGroq(withUser);
      const aiMsg = { role: 'assistant', content: reply, ts: new Date().toISOString() };
      const final = [...withUser, aiMsg];
      setMessages(final);
      setSessions(prev => {
        const updated = prev.map(s => s.id === capId ? { ...s, title: isFirst ? getTitle([userMsg]) : s.title, messages: final, updatedAt: Date.now() } : s);
        persist(updated); return updated;
      });
    } catch (e) { setError(e.message); setMessages(capMsgs); }
    finally { setTyping(false); setTimeout(() => inputRef.current?.focus(), 100); }
  };

  const fmtTime = (ts) => {
    if (!ts) return '';
    const d = ts instanceof Date ? ts : new Date(ts);
    return isNaN(d) ? '' : d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const renderText = (text) => text.split('\n').map((line, li) => (
    <span key={li}>
      {li > 0 && <br />}
      {line.split(/(\*\*[^*]+\*\*)/g).map((p, pi) =>
        p.startsWith('**') && p.endsWith('**')
          ? <strong key={pi} style={{ color: '#f0f2ff', fontWeight: 700 }}>{p.slice(2, -2)}</strong>
          : <span key={pi}>{p}</span>
      )}
    </span>
  ));

  const groups = groupByDate(sessions);
  const isActive = !!currentId;

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 128px)', overflow: 'hidden', borderRadius: 20, border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(6,8,20,0.6)' }}>
      <style>{`@keyframes miaDot{0%,60%,100%{transform:translateY(0);opacity:.5}30%{transform:translateY(-7px);opacity:1}}`}</style>

      {/* ── Sessions Sidebar ── */}
      <div style={{ width: 240, flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* New Chat */}
        <div style={{ padding: '14px 12px 10px' }}>
          <button onClick={() => newChat()} disabled={typing} style={{
            width: '100%', padding: '10px 14px', borderRadius: 12,
            background: 'linear-gradient(135deg,#8b5cf6,#7c3aed)', border: 'none',
            color: 'white', fontWeight: 700, fontSize: '0.85rem', cursor: typing ? 'wait' : 'pointer',
            fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8,
            boxShadow: '0 4px 16px rgba(139,92,246,0.3)', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { if (!typing) { e.currentTarget.style.boxShadow = '0 6px 24px rgba(139,92,246,0.5)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(139,92,246,0.3)'; e.currentTarget.style.transform = 'none'; }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            New Chat
          </button>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px 12px', scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.06) transparent' }}>
          {sessions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 12px', color: '#4a5378', fontSize: '0.78rem' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>💬</div>
              No conversations yet
            </div>
          ) : groups.map(group => (
            <div key={group.label}>
              <div style={{ fontSize: '0.63rem', fontWeight: 700, color: '#4a5378', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '12px 8px 5px' }}>{group.label}</div>
              {group.items.map(s => (
                <div key={s.id} onClick={() => selectChat(s)}
                  onMouseEnter={() => setHovSession(s.id)} onMouseLeave={() => setHovSession(null)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 10px', borderRadius: 10, cursor: 'pointer', marginBottom: 2,
                    background: currentId === s.id ? 'rgba(139,92,246,0.15)' : hovSession === s.id ? 'rgba(255,255,255,0.05)' : 'transparent',
                    border: currentId === s.id ? '1px solid rgba(139,92,246,0.25)' : '1px solid transparent',
                    transition: 'all 0.15s',
                  }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={currentId === s.id ? '#a78bfa' : '#4a5378'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                  </svg>
                  <span style={{ flex: 1, fontSize: '0.8rem', fontWeight: currentId === s.id ? 600 : 400, color: currentId === s.id ? '#e2d9f3' : '#8b93b5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {s.title}
                  </span>
                  {(hovSession === s.id || hovDel === s.id) && (
                    <button onClick={e => deleteChat(e, s.id)}
                      onMouseEnter={() => setHovDel(s.id)} onMouseLeave={() => setHovDel(null)}
                      style={{ flexShrink: 0, width: 22, height: 22, borderRadius: 6, border: 'none', background: hovDel === s.id ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.08)', color: hovDel === s.id ? '#f87171' : '#6b7280', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2" /></svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Mia branding */}
        <div style={{ padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 10, background: 'rgba(139,92,246,0.08)' }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg,#8b5cf6,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', flexShrink: 0 }}>🤖</div>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#c4b5fd' }}>Mia AI</div>
              <div style={{ fontSize: '0.6rem', color: '#4a5378' }}>Llama 3.3 70B · Groq</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right: Chat ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '12px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#8b5cf6,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', boxShadow: '0 0 16px rgba(139,92,246,0.4)', position: 'relative', flexShrink: 0 }}>
              🤖
              <div style={{ position: 'absolute', bottom: 1, right: 1, width: 9, height: 9, borderRadius: '50%', background: '#10b981', border: '2px solid #080b14' }} />
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f0f2ff', lineHeight: 1, maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {isActive ? (sessions.find(s => s.id === currentId)?.title || 'Mia') : 'Mia — AI Companion'}
              </div>
              <div style={{ fontSize: '0.67rem', color: '#10b981', fontWeight: 600 }}>● Online</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => navigate('/breathe')} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.08)', color: '#34d399', fontSize: '0.73rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>🌬️ Breathe</button>
            <button onClick={() => navigate('/resources')} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#f87171', fontSize: '0.73rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>🆘 Crisis</button>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 14, scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.05) transparent' }}>
          {error && (
            <div style={{ padding: '10px 14px', borderRadius: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', fontSize: '0.82rem', display: 'flex', gap: 8 }}>
              <span>⚠️</span><span style={{ flex: 1 }}>{error}</span>
              <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1 }}>×</button>
            </div>
          )}

          {!isActive ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 20 }}>
              <div style={{ fontSize: '3.5rem', marginBottom: 16, filter: 'drop-shadow(0 0 20px rgba(139,92,246,0.5))', animation: 'float 3s ease-in-out infinite' }}>🤖</div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f0f2ff', marginBottom: 8, letterSpacing: '-0.02em' }}>How can I help you today?</h2>
              <p style={{ color: '#8b93b5', fontSize: '0.875rem', marginBottom: 28, maxWidth: 340, lineHeight: 1.6 }}>
                {sessions.length > 0 ? 'Select a conversation from the left, or start a new one.' : 'Start a new chat to begin talking with Mia.'}
              </p>
              <button onClick={() => newChat()} style={{ padding: '12px 32px', borderRadius: 50, border: 'none', background: 'linear-gradient(135deg,#8b5cf6,#ec4899)', color: 'white', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 20px rgba(139,92,246,0.4)', marginBottom: 28, transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}>
                + Start New Chat
              </button>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 420 }}>
                {CHIPS.map((c, i) => (
                  <button key={i} onClick={() => newChat(c)} style={{ padding: '7px 14px', borderRadius: 18, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#8b93b5', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.4)'; e.currentTarget.style.color = '#c4b5fd'; e.currentTarget.style.background = 'rgba(139,92,246,0.08)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#8b93b5'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: 10, animation: 'fadeInUp 0.3s ease-out' }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, background: msg.role === 'assistant' ? 'linear-gradient(135deg,#8b5cf6,#ec4899)' : 'linear-gradient(135deg,#06b6d4,#0891b2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>
                    {msg.role === 'assistant' ? '🤖' : (userName?.[0]?.toUpperCase() || '👤')}
                  </div>
                  <div style={{ maxWidth: '76%' }}>
                    <div style={{ padding: '12px 16px', borderRadius: msg.role === 'assistant' ? '18px 18px 18px 4px' : '18px 18px 4px 18px', background: msg.role === 'assistant' ? 'rgba(139,92,246,0.1)' : 'rgba(6,182,212,0.1)', border: `1px solid ${msg.role === 'assistant' ? 'rgba(139,92,246,0.18)' : 'rgba(6,182,212,0.18)'}`, color: '#d4d8f0', fontSize: '0.88rem', lineHeight: 1.7 }}>
                      {renderText(msg.content)}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#4a5378', marginTop: 3, textAlign: msg.role === 'user' ? 'right' : 'left' }}>{fmtTime(msg.ts)}</div>
                  </div>
                </div>
              ))}
              {typing && (
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#8b5cf6,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', flexShrink: 0 }}>🤖</div>
                  <div style={{ borderRadius: '18px 18px 18px 4px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.15)' }}><Dots /></div>
                </div>
              )}
              <div ref={bottomRef} />
            </>
          )}
        </div>

        {/* Input */}
        {isActive && (
          <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 14, padding: '10px 10px 10px 16px', transition: 'border-color 0.2s' }}
              onFocusCapture={e => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.35)'; }}
              onBlurCapture={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'; }}>
              <input ref={inputRef} type="text" value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !typing) { e.preventDefault(); sendMessage(); } }}
                placeholder={typing ? 'Mia is thinking…' : 'Message Mia…'} disabled={typing}
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#f0f2ff', fontSize: '0.88rem', fontFamily: 'inherit', caretColor: '#8b5cf6' }} />
              <button onClick={() => sendMessage()} disabled={!input.trim() || typing} style={{
                width: 38, height: 38, borderRadius: 10, border: 'none', flexShrink: 0,
                background: (input.trim() && !typing) ? 'linear-gradient(135deg,#8b5cf6,#7c3aed)' : 'rgba(255,255,255,0.05)',
                color: (input.trim() && !typing) ? 'white' : '#4a5378',
                cursor: (input.trim() && !typing) ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
                boxShadow: (input.trim() && !typing) ? '0 4px 14px rgba(139,92,246,0.4)' : 'none',
              }}>
                {typing
                  ? <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#8b5cf6', borderRadius: '50%', animation: 'spin-slow 0.8s linear infinite' }} />
                  : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                }
              </button>
            </div>
            <p style={{ textAlign: 'center', fontSize: '0.65rem', color: '#1e2540', marginTop: 6 }}>
              Mia is an AI companion — not a licensed therapist. For crisis support, call or text 988.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}