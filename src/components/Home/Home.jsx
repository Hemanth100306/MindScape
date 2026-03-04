import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Auth/AuthProvider';
import Achievements from '../Achievements/Achievements';

/* ─── Data ─────────────────────────────────────────────────────── */
const QUOTES = [
  { text: "You don't have to be positive all the time.", author: "Lori Deschene", emoji: "🌿" },
  { text: "Mental health is not a destination, but a process.", author: "Noam Shpancer", emoji: "🧘" },
  { text: "Self-care is not self-indulgence, it is self-preservation.", author: "Audre Lorde", emoji: "💜" },
  { text: "There is hope, even when your brain tells you there isn't.", author: "John Green", emoji: "✨" },
  { text: "Healing is not linear. Be patient with yourself.", author: "Unknown", emoji: "🌊" },
  { text: "It's okay to not be okay — as long as you are not giving up.", author: "Karen Salmansohn", emoji: "🔥" },
  { text: "Small acts of self-care add up to great change.", author: "Unknown", emoji: "🌸" },
];

const FEATURES = [
  { name: 'AI Companion', desc: 'Talk to Mia, 24/7', path: '/chat', emoji: '🤖', color: '#8b5cf6', glow: 'rgba(139,92,246,0.35)' },
  { name: 'Journal', desc: 'Write & reflect', path: '/journal', emoji: '📓', color: '#06b6d4', glow: 'rgba(6,182,212,0.35)' },
  { name: 'Mood Tracker', desc: 'Log your emotions', path: '/mood', emoji: '🎭', color: '#ec4899', glow: 'rgba(236,72,153,0.35)' },
  { name: 'Breathing', desc: 'Calm in 2 minutes', path: '/breathe', emoji: '🌬️', color: '#10b981', glow: 'rgba(16,185,129,0.35)' },
  { name: 'Assessment', desc: 'Check your wellness', path: '/symptoms', emoji: '🧠', color: '#f59e0b', glow: 'rgba(245,158,11,0.35)' },
  { name: 'Insights', desc: 'Visualise trends', path: '/insights', emoji: '📊', color: '#a78bfa', glow: 'rgba(167,139,250,0.35)' },
];

const MOODS = ['😭', '😔', '😐', '😊', '😄'];
const MOOD_LABELS = ['Very Sad', 'Sad', 'Neutral', 'Happy', 'Very Happy'];
const MOOD_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4'];

const DAILY_FOCUS = [
  { title: 'Morning mindfulness', desc: 'Take 5 deep breaths before you check your phone.', icon: '🌅', path: '/breathe' },
  { title: 'Gratitude entry', desc: 'Write 3 things you appreciate about today.', icon: '📓', path: '/journal' },
  { title: 'How are you feeling?', desc: 'Log your mood and notice the pattern over time.', icon: '🎭', path: '/mood' },
  { title: 'Talk it out', desc: "Share what's on your mind with Mia.", icon: '🤖', path: '/chat' },
  { title: 'Breathing reset', desc: "5-minute box breathing to reset your nervous system.", icon: '🌬️', path: '/breathe' },
  { title: 'Evening reflection', desc: 'How did today go? A quick journal entry helps.', icon: '🌙', path: '/journal' },
  { title: 'Wellness check-in', desc: 'Complete your weekly mental health assessment.', icon: '🧠', path: '/symptoms' },
];

/* ─── Hooks ─────────────────────────────────────────────────────── */
function useUserStats(uid) {
  const [stats, setStats] = useState({ journalCount: 0, moodCount: 0, journalStreak: 0, avgMood: null, topMood: null, lastMoodValue: null, weeklyMoods: [] });

  useEffect(() => {
    if (!uid) return;
    const compute = () => {
      try {
        const journal = JSON.parse(localStorage.getItem(`mindscape_journal_${uid}`) || '[]');
        const mood = JSON.parse(localStorage.getItem(`mindscape_mood_${uid}`) || '[]');
        const days = [...new Set(journal.map(e => new Date(e.createdAt).toDateString()))];
        let streak = 0;
        const today = new Date();
        for (let i = 0; i < 60; i++) {
          const d = new Date(today); d.setDate(today.getDate() - i);
          if (days.includes(d.toDateString())) streak++;
          else if (i > 0) break;
        }
        let avgMood = null, topMood = null, lastMoodValue = null;
        const weeklyMoods = [];
        if (mood.length > 0) {
          const avg = mood.reduce((s, e) => s + (e.moodValue ?? 0), 0) / mood.length;
          avgMood = Math.round(avg);
          const counts = mood.reduce((acc, e) => { acc[e.moodLabel] = (acc[e.moodLabel] || 0) + 1; return acc; }, {});
          topMood = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
          lastMoodValue = mood[mood.length - 1]?.moodValue ?? null;
          // Last 7 days mood values
          const now = new Date();
          for (let i = 6; i >= 0; i--) {
            const d = new Date(now); d.setDate(now.getDate() - i);
            const dayEntries = mood.filter(e => new Date(e.createdAt).toDateString() === d.toDateString());
            if (dayEntries.length > 0) {
              const dayAvg = dayEntries.reduce((s, e) => s + (e.moodValue ?? 0), 0) / dayEntries.length;
              weeklyMoods.push({ day: d.toLocaleDateString('en-US', { weekday: 'short' }), value: Math.round(dayAvg), has: true });
            } else {
              weeklyMoods.push({ day: d.toLocaleDateString('en-US', { weekday: 'short' }), value: null, has: false });
            }
          }
        }
        setStats({ journalCount: journal.length, moodCount: mood.length, journalStreak: streak, avgMood, topMood, lastMoodValue, weeklyMoods });
      } catch { /* ignore */ }
    };
    compute();
    window.addEventListener('storage', compute);
    return () => window.removeEventListener('storage', compute);
  }, [uid]);

  return stats;
}

/* ─── Mini animated number counter ─────────────────────────────── */
function CountUp({ to, duration = 1000 }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!to) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setVal(Math.floor(progress * to));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [to, duration]);
  return <>{val}</>;
}

/* ─── Streak ring SVG ───────────────────────────────────────────── */
function StreakRing({ streak, max = 30 }) {
  const r = 36, circ = 2 * Math.PI * r;
  const pct = Math.min(streak / max, 1);
  return (
    <svg width="96" height="96" viewBox="0 0 96 96">
      <circle cx="48" cy="48" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
      <circle cx="48" cy="48" r={r} fill="none"
        stroke="url(#streakGrad)" strokeWidth="6"
        strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
        strokeLinecap="round"
        style={{ transform: 'rotate(-90deg)', transformOrigin: '48px 48px', transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
      />
      <defs>
        <linearGradient id="streakGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      <text x="48" y="44" textAnchor="middle" fill="#f0f2ff" fontSize="18" fontWeight="800" dy="4">{streak}</text>
      <text x="48" y="62" textAnchor="middle" fill="#8b93b5" fontSize="9" dy="0">day streak</text>
    </svg>
  );
}

/* ─── Mini mood sparkline ───────────────────────────────────────── */
function MoodSparkline({ weeklyMoods }) {
  if (!weeklyMoods?.length) return null;
  const W = 140, H = 44, pad = 8;
  const vals = weeklyMoods.map(m => m.value);
  const points = weeklyMoods.map((m, i) => {
    const x = pad + (i / (weeklyMoods.length - 1)) * (W - pad * 2);
    const y = m.has ? H - pad - (m.value / 4) * (H - pad * 2) : null;
    return { x, y, ...m };
  });
  const pathD = points.filter(p => p.y !== null).reduce((acc, p, i, arr) => {
    if (i === 0) return `M${p.x},${p.y}`;
    const prev = arr[i - 1];
    const cx = (prev.x + p.x) / 2;
    return `${acc} C${cx},${prev.y} ${cx},${p.y} ${p.x},${p.y}`;
  }, '');

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
      {pathD && (
        <path d={pathD} fill="none" stroke="url(#sparkGrad)" strokeWidth="2" strokeLinecap="round" />
      )}
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      {points.filter(p => p.y !== null).map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3"
          fill={MOOD_COLORS[p.value] || '#8b93b5'}
          stroke="#080b14" strokeWidth="1.5" />
      ))}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
export default function Home() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const stats = useUserStats(currentUser?.uid);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [checkinDismissed, setCheckinDismissed] = useState(false);
  const [quoteVisible, setQuoteVisible] = useState(true);
  const [quoteIdx, setQuoteIdx] = useState(() => new Date().getDate() % QUOTES.length);

  const hour = new Date().getHours();
  const greeting = hour < 5 ? 'Good night' : hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const greetEmoji = hour < 5 ? '🌙' : hour < 12 ? '🌅' : hour < 17 ? '☀️' : '🌆';
  const name = currentUser?.displayName?.split(' ')[0] || currentUser?.email?.split('@')[0] || 'there';

  const dailyFocus = DAILY_FOCUS[new Date().getDay()];

  const checkinStatus = useMemo(() => {
    if (!currentUser) return { mood: true, journal: true };
    const today = new Date().toDateString();
    try {
      const moods = JSON.parse(localStorage.getItem(`mindscape_mood_${currentUser.uid}`) || '[]');
      const journals = JSON.parse(localStorage.getItem(`mindscape_journal_${currentUser.uid}`) || '[]');
      return {
        mood: moods.some(e => new Date(e.createdAt).toDateString() === today),
        journal: journals.some(e => new Date(e.createdAt).toDateString() === today),
      };
    } catch { return { mood: true, journal: true }; }
  }, [currentUser]);

  const needsCheckin = !checkinStatus.mood || !checkinStatus.journal;
  const bothDone = checkinStatus.mood && checkinStatus.journal;

  const quote = QUOTES[quoteIdx];
  const avgMoodEmoji = stats.avgMood !== null ? MOODS[stats.avgMood] : null;
  const avgMoodColor = stats.avgMood !== null ? MOOD_COLORS[stats.avgMood] : '#8b93b5';
  const lastMoodEmoji = stats.lastMoodValue !== null ? MOODS[stats.lastMoodValue] : null;
  const lastMoodColor = stats.lastMoodValue !== null ? MOOD_COLORS[stats.lastMoodValue] : '#8b93b5';

  const isNewUser = stats.journalCount === 0 && stats.moodCount === 0;

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto', animation: 'fadeInUp 0.45s ease-out' }}>

      {/* ── Check-in banner ── */}
      {needsCheckin && !checkinDismissed && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
          padding: '14px 20px', borderRadius: 16, marginBottom: 20,
          background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(236,72,153,0.06))',
          border: '1px solid rgba(245,158,11,0.2)',
          animation: 'fadeInUp 0.3s ease-out',
        }}>
          <span style={{ fontSize: '1.4rem' }}>⏰</span>
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#fcd34d', marginBottom: 2 }}>Today's check-in awaits!</div>
            <div style={{ fontSize: '0.77rem', color: '#8b93b5' }}>
              {!checkinStatus.mood && !checkinStatus.journal ? "No mood or journal entry today — take 2 minutes for yourself." :
                !checkinStatus.mood ? "You haven't logged your mood today." : "You haven't written in your journal today."}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            {!checkinStatus.mood && (
              <button onClick={() => navigate('/mood')} style={{
                padding: '7px 14px', borderRadius: 10, border: 'none',
                background: 'linear-gradient(135deg, #ec4899, #be185d)', color: 'white',
                fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'inherit',
              }}>🎭 Log Mood</button>
            )}
            {!checkinStatus.journal && (
              <button onClick={() => navigate('/journal')} style={{
                padding: '7px 14px', borderRadius: 10, border: 'none',
                background: 'linear-gradient(135deg, #06b6d4, #0891b2)', color: 'white',
                fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'inherit',
              }}>📓 Journal</button>
            )}
            <button onClick={() => setCheckinDismissed(true)} style={{
              padding: '7px 10px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)',
              background: 'transparent', color: '#4a5378', fontSize: '0.8rem', cursor: 'pointer',
            }}>✕</button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════════ */}
      <div style={{
        borderRadius: 28, padding: '36px 40px',
        background: 'linear-gradient(135deg, rgba(139,92,246,0.13) 0%, rgba(236,72,153,0.07) 60%, rgba(6,182,212,0.05) 100%)',
        border: '1px solid rgba(139,92,246,0.18)',
        marginBottom: 20, position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative blobs */}
        <div style={{ position: 'absolute', top: -40, right: -40, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.18), transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -30, left: 100, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.12), transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', gap: 28, flexWrap: 'wrap' }}>
          {/* Text section */}
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px',
              borderRadius: 20, background: 'rgba(139,92,246,0.14)', border: '1px solid rgba(139,92,246,0.28)',
              marginBottom: 16,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981', animation: 'pulse-glow 2s ease infinite' }} />
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#a78bfa', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                YOUR WELLNESS DASHBOARD
              </span>
            </div>

            <h1 style={{
              fontSize: 'clamp(1.7rem, 4vw, 2.4rem)', fontWeight: 800, marginBottom: 10,
              background: 'linear-gradient(135deg, #f0f2ff 20%, #c4b5fd 60%, #ec4899 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              letterSpacing: '-0.04em', lineHeight: 1.1,
            }}>
              {greetEmoji} {greeting}, {name}
            </h1>

            <p style={{ color: '#8b93b5', fontSize: '0.95rem', lineHeight: 1.65, maxWidth: 480, marginBottom: 28 }}>
              {isNewUser
                ? "Welcome to your safe space. Start your journey by logging how you feel or writing your first journal entry."
                : stats.journalStreak > 4
                  ? `🔥 ${stats.journalStreak}-day streak! You're building something powerful. Keep it going.`
                  : bothDone
                    ? "You've done your check-in today. Well done — consistency is everything. 💪"
                    : "How are you feeling today? A quick check-in takes less than a minute."}
            </p>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {[
                { label: '🎭 Track Mood', color: '#ec4899', path: '/mood', glow: 'rgba(236,72,153,0.4)' },
                { label: '📓 Write Journal', color: '#06b6d4', path: '/journal', glow: 'rgba(6,182,212,0.35)' },
                { label: '🤖 Talk to Mia', color: null, path: '/chat', glow: null },
              ].map(b => (
                <button key={b.path} onClick={() => navigate(b.path)} style={{
                  padding: '11px 20px', borderRadius: 12, border: b.color ? 'none' : '1px solid rgba(139,92,246,0.3)',
                  background: b.color
                    ? `linear-gradient(135deg, ${b.color}, ${b.color}cc)`
                    : 'rgba(139,92,246,0.1)',
                  color: b.color ? 'white' : '#a78bfa', fontWeight: 700, fontSize: '0.88rem',
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.22s',
                  boxShadow: b.glow ? `0 4px 18px ${b.glow}` : 'none',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = b.glow ? `0 10px 32px ${b.glow}` : '0 6px 20px rgba(139,92,246,0.25)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = b.glow ? `0 4px 18px ${b.glow}` : 'none'; }}
                >{b.label}</button>
              ))}
            </div>
          </div>

          {/* Streak ring + mood snapshot */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexShrink: 0 }}>
            {/* Streak */}
            <div style={{
              textAlign: 'center', padding: '20px 22px', borderRadius: 20,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(12px)',
            }}>
              <StreakRing streak={stats.journalStreak} />
              <div style={{ fontSize: '0.68rem', color: '#4a5378', marginTop: 6, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Journal</div>
            </div>

            {/* Last mood + sparkline */}
            <div style={{
              padding: '20px 22px', borderRadius: 20, minWidth: 160,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(12px)',
            }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#4a5378', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 10 }}>Weekly mood</div>
              {stats.weeklyMoods.length > 0
                ? <MoodSparkline weeklyMoods={stats.weeklyMoods} />
                : <div style={{ color: '#4a5378', fontSize: '0.75rem', paddingTop: 8 }}>No data yet</div>
              }
              {lastMoodEmoji && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10 }}>
                  <span style={{ fontSize: '1.3rem' }}>{lastMoodEmoji}</span>
                  <span style={{ fontSize: '0.74rem', color: lastMoodColor, fontWeight: 700 }}>Last logged</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          STAT CARDS
      ══════════════════════════════════════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
        {[
          {
            label: 'Journal Entries', icon: '📓', color: '#06b6d4',
            value: stats.journalCount,
            sub: stats.journalCount === 0 ? 'Start today!' : stats.journalCount === 1 ? 'First entry 🎉' : 'entries total',
            numeric: true,
          },
          {
            label: 'Day Streak', icon: '🔥', color: '#f59e0b',
            value: stats.journalStreak,
            sub: stats.journalStreak > 0 ? 'days in a row' : 'Write to start',
            suffix: 'd', numeric: true,
          },
          {
            label: 'Mood Logs', icon: avgMoodEmoji || '🎭', color: avgMoodColor,
            value: stats.moodCount,
            sub: stats.topMood ? `Most: ${stats.topMood}` : 'Log your first',
            numeric: true,
          },
          {
            label: 'Avg Mood', icon: '📊', color: avgMoodColor,
            value: avgMoodEmoji || '—',
            sub: stats.avgMood !== null ? MOOD_LABELS[stats.avgMood] : 'No data yet',
            numeric: false,
          },
        ].map((s, i) => (
          <div key={i} style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 20, padding: '22px 20px',
            transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = `${s.color}45`; e.currentTarget.style.background = `${s.color}0a`; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 12px 36px ${s.color}20`; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <div style={{ fontSize: '1.5rem', marginBottom: 10 }}>{s.icon}</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: s.color, lineHeight: 1, marginBottom: 5, fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}>
              {s.numeric && s.value > 0 ? <><CountUp to={s.value} />{s.suffix || ''}</> : s.value}
            </div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#d4d8f0', marginBottom: 3, letterSpacing: '0.02em' }}>{s.label}</div>
            <div style={{ fontSize: '0.68rem', color: '#4a5378' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ══════════════════════════════════════════════
          TODAY'S FOCUS  +  FEATURE CARDS  (2-col)
      ══════════════════════════════════════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 14, marginBottom: 20 }}>

        {/* Today's Focus card */}
        <div style={{
          borderRadius: 20, padding: '24px',
          background: 'linear-gradient(160deg, rgba(245,158,11,0.1) 0%, rgba(236,72,153,0.07) 100%)',
          border: '1px solid rgba(245,158,11,0.18)',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#fbbf24', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>
            ⭐ Today's Focus
          </div>
          <div style={{ fontSize: '2rem', marginBottom: 12 }}>{dailyFocus.icon}</div>
          <div style={{ fontWeight: 800, color: '#f0f2ff', fontSize: '1rem', marginBottom: 8, lineHeight: 1.3 }}>{dailyFocus.title}</div>
          <div style={{ color: '#8b93b5', fontSize: '0.82rem', lineHeight: 1.55, flex: 1, marginBottom: 18 }}>{dailyFocus.desc}</div>
          <button onClick={() => navigate(dailyFocus.path)} style={{
            padding: '10px 16px', borderRadius: 12, border: 'none',
            background: 'linear-gradient(135deg, #f59e0b, #ec4899)',
            color: 'white', fontWeight: 700, fontSize: '0.82rem',
            cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.22s',
            boxShadow: '0 4px 16px rgba(245,158,11,0.35)',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(245,158,11,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(245,158,11,0.35)'; }}
          >
            Start Now →
          </button>
        </div>

        {/* Feature grid */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f0f2ff' }}>Explore MindScape</h2>
            <span style={{ fontSize: '0.72rem', color: '#4a5378' }}>{FEATURES.length} tools</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {FEATURES.map(f => (
              <button key={f.name} onClick={() => navigate(f.path)}
                onMouseEnter={() => setHoveredFeature(f.name)} onMouseLeave={() => setHoveredFeature(null)}
                style={{
                  all: 'unset', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', gap: 10,
                  padding: '16px', borderRadius: 16, textAlign: 'left',
                  background: hoveredFeature === f.name ? `${f.color}10` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${hoveredFeature === f.name ? f.color + '55' : 'rgba(255,255,255,0.07)'}`,
                  transition: 'all 0.22s cubic-bezier(0.4,0,0.2,1)',
                  transform: hoveredFeature === f.name ? 'translateY(-4px)' : 'none',
                  boxShadow: hoveredFeature === f.name ? `0 10px 32px ${f.glow}` : 'none',
                }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: `${f.color}18`, border: `1px solid ${f.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
                  transition: 'all 0.22s',
                  boxShadow: hoveredFeature === f.name ? `0 0 20px ${f.glow}` : 'none',
                }}>{f.emoji}</div>
                <div>
                  <div style={{ fontWeight: 700, color: '#f0f2ff', fontSize: '0.85rem', marginBottom: 3 }}>{f.name}</div>
                  <div style={{ color: '#6b7280', fontSize: '0.74rem', lineHeight: 1.4 }}>{f.desc}</div>
                </div>
                <div style={{
                  color: hoveredFeature === f.name ? f.color : '#2a3050', transition: 'all 0.2s',
                  transform: hoveredFeature === f.name ? 'translateX(3px)' : 'none',
                  fontSize: '0.78rem', fontWeight: 700,
                }}>Open →</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          DAILY QUOTE  +  CHECKLIST (2-col)
      ══════════════════════════════════════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 14, marginBottom: 20 }}>

        {/* Quote */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(236,72,153,0.05))',
          border: '1px solid rgba(139,92,246,0.14)', borderRadius: 20, padding: '28px 32px',
          position: 'relative', overflow: 'hidden',
        }}>
          <span style={{ position: 'absolute', top: -12, left: 16, fontSize: '6rem', opacity: 0.05, lineHeight: 1, fontFamily: 'Georgia, serif', pointerEvents: 'none' }}>"</span>
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#a78bfa', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>
              {quote.emoji} Daily Inspiration
            </div>
            <blockquote style={{ fontSize: '1.05rem', color: '#d4d8f0', lineHeight: 1.7, fontStyle: 'italic', marginBottom: 14 }}>
              "{quote.text}"
            </blockquote>
            <div style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: 600 }}>— {quote.author}</div>
          </div>
        </div>

        {/* Today's checklist */}
        <div style={{
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 20, padding: '24px',
        }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#8b93b5', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
            ✅ Today's Progress
          </div>
          {[
            { label: 'Mood logged', done: checkinStatus.mood, link: '/mood', color: '#ec4899' },
            { label: 'Journal entry', done: checkinStatus.journal, link: '/journal', color: '#06b6d4' },
            { label: 'Breathe session', done: false, link: '/breathe', color: '#10b981' },
          ].map((item, i) => (
            <div key={i} onClick={() => !item.done && navigate(item.link)} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 12px', borderRadius: 12, marginBottom: 8,
              background: item.done ? `${item.color}0d` : 'rgba(255,255,255,0.02)',
              border: `1px solid ${item.done ? item.color + '30' : 'rgba(255,255,255,0.06)'}`,
              cursor: item.done ? 'default' : 'pointer',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { if (!item.done) { e.currentTarget.style.background = `${item.color}0d`; e.currentTarget.style.borderColor = `${item.color}30`; } }}
              onMouseLeave={e => { if (!item.done) { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; } }}
            >
              <div style={{
                width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                background: item.done ? `linear-gradient(135deg, ${item.color}, ${item.color}cc)` : 'rgba(255,255,255,0.06)',
                border: `1.5px solid ${item.done ? 'transparent' : 'rgba(255,255,255,0.12)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.65rem', color: 'white', fontWeight: 800,
                boxShadow: item.done ? `0 0 10px ${item.color}50` : 'none',
                transition: 'all 0.3s',
              }}>
                {item.done ? '✓' : ''}
              </div>
              <span style={{
                fontSize: '0.84rem', fontWeight: item.done ? 600 : 500,
                color: item.done ? item.color : '#8b93b5',
                textDecoration: item.done ? 'none' : 'none',
                transition: 'color 0.2s',
              }}>{item.label}</span>
              {!item.done && <span style={{ marginLeft: 'auto', color: '#2a3050', fontSize: '0.72rem' }}>Do it →</span>}
            </div>
          ))}
          <div style={{ marginTop: 12, padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.78rem', color: '#4a5378' }}>
              {[checkinStatus.mood, checkinStatus.journal, false].filter(Boolean).length} / 3 done today
            </div>
            <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, marginTop: 8, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 2, transition: 'width 0.8s ease',
                background: 'linear-gradient(90deg, #8b5cf6, #06b6d4)',
                width: `${([checkinStatus.mood, checkinStatus.journal, false].filter(Boolean).length / 3) * 100}%`,
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Achievements ── */}
      <Achievements />
    </div>
  );
}