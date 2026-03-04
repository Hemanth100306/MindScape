import React, { useState, useMemo, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, isWithinInterval, subDays, eachDayOfInterval, getDay } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../Auth/AuthProvider';
import { subscribeToMood, addMoodEntry, deleteMoodEntry } from '../../services/localStorageService';

const moods = [
  { emoji: '😭', label: 'Very Sad', color: '#ef4444', value: 0 },
  { emoji: '😔', label: 'Sad', color: '#f97316', value: 1 },
  { emoji: '😐', label: 'Neutral', color: '#eab308', value: 2 },
  { emoji: '😊', label: 'Happy', color: '#22c55e', value: 3 },
  { emoji: '😄', label: 'Very Happy', color: '#06b6d4', value: 4 },
];

// ── Mood Heatmap Calendar ──────────────────────────────────────────────────
const WEEKS = 17;
const moodBg = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4'];
const moodBgDim = ['rgba(239,68,68,0.15)', 'rgba(249,115,22,0.15)', 'rgba(234,179,8,0.15)', 'rgba(34,197,94,0.15)', 'rgba(6,182,212,0.15)'];

function MoodHeatmap({ moodHistory }) {
  const today = new Date();
  const startDay = subDays(today, WEEKS * 7 - 1);

  // Build day map: dateString → avgMoodValue
  const dayMap = useMemo(() => {
    const map = {};
    moodHistory.forEach(e => {
      const key = new Date(e.createdAt).toDateString();
      if (!map[key]) map[key] = [];
      map[key].push(e.moodValue ?? 0);
    });
    const avg = {};
    Object.keys(map).forEach(k => {
      avg[k] = Math.round(map[k].reduce((a, b) => a + b, 0) / map[k].length);
    });
    return avg;
  }, [moodHistory]);

  const allDays = eachDayOfInterval({ start: startDay, end: today });

  // Group into columns of 7 (weeks), starting on Sunday
  const firstSunday = new Date(startDay);
  firstSunday.setDate(firstSunday.getDate() - getDay(firstSunday));
  const weeks = [];
  let week = [];
  // pad first week
  const padDays = getDay(startDay);
  for (let i = 0; i < padDays; i++) week.push(null);
  allDays.forEach(d => {
    week.push(d);
    if (week.length === 7) { weeks.push(week); week = []; }
  });
  if (week.length > 0) weeks.push(week);

  const monthLabels = useMemo(() => {
    const labels = [];
    let lastMonth = -1;
    weeks.forEach((w, wi) => {
      const first = w.find(d => d !== null);
      if (first) {
        const m = first.getMonth();
        if (m !== lastMonth) { labels.push({ wi, label: format(first, 'MMM') }); lastMonth = m; }
      }
    });
    return labels;
  }, [weeks]);

  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const [hov, setHov] = useState(null);

  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 20, padding: '24px', marginBottom: 24,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f0f2ff' }}>Mood Calendar</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: '0.7rem', color: '#4a5378' }}>Less</span>
          {[...moodBg].reverse().map((c, i) => (
            <div key={i} style={{ width: 12, height: 12, borderRadius: 3, background: c, opacity: 0.8 }} />
          ))}
          <div style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(255,255,255,0.06)' }} />
          <span style={{ fontSize: '0.7rem', color: '#4a5378' }}>More</span>
        </div>
      </div>

      <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
        <div style={{ display: 'flex', gap: 2, minWidth: 'fit-content' }}>
          {/* Day labels */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginRight: 4, paddingTop: 20 }}>
            {dayNames.map((d, i) => (
              <div key={i} style={{ height: 12, fontSize: '0.6rem', color: i % 2 === 1 ? '#4a5378' : 'transparent', lineHeight: '12px', userSelect: 'none' }}>{d}</div>
            ))}
          </div>
          {/* Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {/* Month labels */}
            <div style={{ display: 'flex', gap: 2, height: 18, position: 'relative', marginBottom: 2 }}>
              {weeks.map((_, wi) => {
                const lbl = monthLabels.find(m => m.wi === wi);
                return (
                  <div key={wi} style={{ width: 12, fontSize: '0.6rem', color: '#6b7280', whiteSpace: 'nowrap', overflow: 'visible', userSelect: 'none' }}>
                    {lbl ? lbl.label : ''}
                  </div>
                );
              })}
            </div>
            {/* Cells */}
            <div style={{ display: 'flex', gap: 2 }}>
              {weeks.map((week, wi) => (
                <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {week.map((day, di) => {
                    if (!day) return <div key={di} style={{ width: 12, height: 12 }} />;
                    const key = day.toDateString();
                    const val = dayMap[key];
                    const isToday = key === today.toDateString();
                    const isFuture = day > today;
                    const isHov = hov === key;
                    return (
                      <div
                        key={di}
                        onMouseEnter={() => setHov(key)}
                        onMouseLeave={() => setHov(null)}
                        title={val !== undefined
                          ? `${format(day, 'MMM d, yyyy')} — ${moods[val].label} ${moods[val].emoji}`
                          : format(day, 'MMM d, yyyy')}
                        style={{
                          width: 12, height: 12, borderRadius: 3, cursor: val !== undefined ? 'pointer' : 'default',
                          background: isFuture ? 'transparent'
                            : val !== undefined ? moodBg[val] : 'rgba(255,255,255,0.06)',
                          opacity: isFuture ? 0 : isHov ? 1 : 0.85,
                          border: isToday ? '1px solid rgba(255,255,255,0.4)' : isHov && val !== undefined ? `1px solid ${moodBg[val]}` : '1px solid transparent',
                          transition: 'all 0.15s',
                          transform: isHov ? 'scale(1.3)' : 'scale(1)',
                          boxShadow: isHov && val !== undefined ? `0 0 6px ${moodBg[val]}80` : 'none',
                        }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip info */}
      {hov && dayMap[hov] !== undefined && (
        <div style={{ marginTop: 10, fontSize: '0.78rem', color: moodBg[dayMap[hov]], fontWeight: 600, textAlign: 'center' }}>
          {hov} — {moods[dayMap[hov]].emoji} {moods[dayMap[hov]].label}
        </div>
      )}
    </div>
  );
}
// ────────────────────────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const mood = moods[payload[0].value];
    return (
      <div style={{ background: '#0f1628', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '10px 14px' }}>
        <div style={{ fontSize: '0.8rem', color: '#8b93b5', marginBottom: 4 }}>{label}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
          <span style={{ fontSize: '1.2rem' }}>{mood?.emoji}</span>
          <span style={{ color: mood?.color }}>{mood?.label}</span>
        </div>
      </div>
    );
  }
  return null;
};

const Mood = () => {
  const { currentUser } = useAuth();
  const [moodHistory, setMoodHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMood, setSelectedMood] = useState(null);
  const [timeFilter, setTimeFilter] = useState('all');
  const [hovered, setHovered] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!currentUser) return;
    const unsub = subscribeToMood(currentUser.uid, (data) => {
      setMoodHistory(data);
      setLoading(false);
    });
    return unsub;
  }, [currentUser]);

  const showToast = (msg, color = '#10b981') => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  const exportData = () => {
    if (moodHistory.length === 0) { showToast('No mood logs to export', '#f59e0b'); return; }
    const data = {
      app: 'MindScape Mood Tracker',
      exportedAt: new Date().toISOString(),
      user: currentUser?.email,
      totalEntries: moodHistory.length,
      entries: moodHistory.map(e => ({
        mood: e.moodLabel,
        emoji: e.moodEmoji,
        value: e.moodValue,
        note: e.note,
        date: new Date(e.createdAt).toISOString(),
      })),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mindscape-mood-${new Date().toLocaleDateString('en-CA')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('✓ Mood data exported!');
  };

  const handleMoodSelect = (mood) => { setSelectedMood(mood); setOpenDialog(true); };

  const handleSaveMood = async () => {
    if (!selectedMood) return;
    setSaving(true);
    try {
      await addMoodEntry(currentUser.uid, {
        moodLabel: selectedMood.label,
        moodEmoji: selectedMood.emoji,
        moodColor: selectedMood.color,
        moodValue: selectedMood.value,
        note: noteText,
      });
      setNoteText('');
      setOpenDialog(false);
      showToast(`${selectedMood.emoji} Mood logged!`);
    } catch {
      showToast('Failed to save mood', '#ef4444');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteMoodEntry(id, currentUser.uid);
      showToast('Entry removed');
    } catch {
      showToast('Failed to delete', '#ef4444');
    }
  };

  const filteredHistory = useMemo(() => {
    if (timeFilter !== 'week') return moodHistory;
    const now = new Date();
    return moodHistory.filter(e =>
      isWithinInterval(new Date(e.createdAt), { start: startOfWeek(now), end: endOfWeek(now) })
    );
  }, [moodHistory, timeFilter]);

  const chartData = useMemo(() =>
    [...filteredHistory].reverse().map(e => ({
      timestamp: format(new Date(e.createdAt), 'MMM d HH:mm'),
      value: e.moodValue,
    })), [filteredHistory]);

  const stats = useMemo(() => {
    if (filteredHistory.length === 0) return null;
    const avg = filteredHistory.reduce((s, e) => s + (e.moodValue ?? 0), 0) / filteredHistory.length;
    const counts = filteredHistory.reduce((acc, e) => { acc[e.moodLabel] = (acc[e.moodLabel] || 0) + 1; return acc; }, {});
    const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return { avg: avg.toFixed(1), dominant: dominant?.[0], counts, total: filteredHistory.length };
  }, [filteredHistory]);

  const avgMood = stats ? moods[Math.round(parseFloat(stats.avg))] : null;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', animation: 'fadeInUp 0.5s ease-out' }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          padding: '12px 20px', borderRadius: 12,
          background: toast.color === '#ef4444' ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
          border: `1px solid ${toast.color}50`,
          color: toast.color === '#ef4444' ? '#fca5a5' : '#6ee7b7',
          fontWeight: 600, fontSize: '0.875rem', boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          animation: 'scaleIn 0.3s ease-out', backdropFilter: 'blur(12px)',
        }}>{toast.msg}</div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'rgba(236,72,153,0.15)', border: '1px solid rgba(236,72,153,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
          }}>🎭</div>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f0f2ff', letterSpacing: '-0.03em', lineHeight: 1 }}>Mood Tracker</h1>
            <p style={{ color: '#8b93b5', fontSize: '0.85rem' }}>
              {loading ? 'Loading…' : `${moodHistory.length} logs · saved on this device`}
            </p>
          </div>
        </div>
        {moodHistory.length > 0 && (
          <button onClick={exportData} title="Export mood data as JSON" style={{
            padding: '9px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.04)', color: '#8b93b5', fontSize: '0.82rem',
            fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(236,72,153,0.4)'; e.currentTarget.style.color = '#ec4899'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#8b93b5'; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export
          </button>
        )}
      </div>

      {/* Mood selector */}
      <div style={{
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 20, padding: '28px', marginBottom: 24,
      }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#f0f2ff', marginBottom: 6 }}>How are you feeling right now?</h2>
        <p style={{ color: '#8b93b5', fontSize: '0.85rem', marginBottom: 24 }}>Tap a mood to log it</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          {moods.map((mood) => (
            <button key={mood.label} onClick={() => handleMoodSelect(mood)}
              onMouseEnter={() => setHovered(mood.label)} onMouseLeave={() => setHovered(null)}
              style={{
                all: 'unset', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                padding: '16px 20px', borderRadius: 16,
                background: hovered === mood.label ? `${mood.color}15` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${hovered === mood.label ? mood.color + '60' : 'rgba(255,255,255,0.08)'}`,
                transition: 'all 0.2s',
                transform: hovered === mood.label ? 'translateY(-4px) scale(1.05)' : 'none',
              }}>
              <span style={{ fontSize: '2.5rem', lineHeight: 1 }}>{mood.emoji}</span>
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: hovered === mood.label ? mood.color : '#8b93b5', letterSpacing: '0.04em' }}>{mood.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mood Heatmap */}
      {!loading && <MoodHeatmap moodHistory={moodHistory} />}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#8b93b5' }}>
          <div style={{ width: 36, height: 36, border: '3px solid rgba(236,72,153,0.2)', borderTopColor: '#ec4899', borderRadius: '50%', animation: 'spin-slow 0.8s linear infinite', margin: '0 auto 16px' }} />
          Loading mood history…
        </div>
      ) : (
        <>
          {stats && (
            <div style={{ display: 'grid', gridTemplateColumns: chartData.length > 1 ? '1fr 2fr' : '1fr', gap: 16, marginBottom: 24 }}>
              {/* Stats card */}
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f0f2ff' }}>Summary</h3>
                  <select value={timeFilter} onChange={e => setTimeFilter(e.target.value)} style={{
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8, color: '#8b93b5', fontSize: '0.75rem', padding: '4px 8px', cursor: 'pointer', outline: 'none',
                  }}>
                    <option value="all">All Time</option>
                    <option value="week">This Week</option>
                  </select>
                </div>
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                  <div style={{ fontSize: '3rem', marginBottom: 4 }}>{avgMood?.emoji}</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: avgMood?.color }}>{avgMood?.label}</div>
                  <div style={{ fontSize: '0.75rem', color: '#4a5378', marginTop: 2 }}>Average · {stats.total} logs</div>
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16 }}>
                  {Object.entries(stats.counts).map(([label, count]) => {
                    const m = moods.find(m => m.label === label);
                    const pct = (count / stats.total * 100).toFixed(0);
                    return (
                      <div key={label} style={{ marginBottom: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: '0.78rem', color: '#8b93b5', display: 'flex', alignItems: 'center', gap: 4 }}><span>{m?.emoji}</span>{label}</span>
                          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: m?.color }}>{pct}%</span>
                        </div>
                        <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.05)' }}>
                          <div style={{ height: '100%', borderRadius: 2, background: m?.color, width: `${pct}%`, transition: 'width 0.5s ease' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Chart */}
              {chartData.length > 1 && (
                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '24px' }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f0f2ff', marginBottom: 20 }}>Mood Trend</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                      <defs>
                        <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="timestamp" tick={{ fontSize: 10, fill: '#4a5378' }} />
                      <YAxis domain={[0, 4]} ticks={[0, 1, 2, 3, 4]} tick={{ fontSize: 10, fill: '#4a5378' }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="value" stroke="#ec4899" strokeWidth={2} fill="url(#moodGrad)" dot={{ r: 5, fill: '#ec4899', stroke: '#0f1628', strokeWidth: 2 }} activeDot={{ r: 7 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {/* History */}
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '24px' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f0f2ff', marginBottom: 16 }}>Mood History</h3>
            {filteredHistory.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#4a5378', fontSize: '0.85rem' }}>
                No entries yet. Click a mood above to log how you're feeling.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {filteredHistory.map((entry) => (
                  <div key={entry.id} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 16px', borderRadius: 12,
                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                    transition: 'all 0.2s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = `${entry.moodColor}30`; e.currentTarget.style.background = `${entry.moodColor}08`; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                  >
                    <div style={{ fontSize: '1.8rem', flexShrink: 0 }}>{entry.moodEmoji}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, color: entry.moodColor, fontSize: '0.9rem' }}>{entry.moodLabel}</div>
                      {entry.note && <div style={{ color: '#8b93b5', fontSize: '0.82rem', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>"{entry.note}"</div>}
                    </div>
                    <div style={{ color: '#4a5378', fontSize: '0.75rem', flexShrink: 0 }}>
                      {entry.createdAt ? format(new Date(entry.createdAt), 'MMM d, HH:mm') : '—'}
                    </div>
                    <button onClick={() => handleDelete(entry.id)} style={{
                      width: 28, height: 28, borderRadius: 8, border: '1px solid rgba(239,68,68,0.2)',
                      background: 'rgba(239,68,68,0.08)', color: '#f87171', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', flexShrink: 0,
                    }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Log mood modal */}
      {openDialog && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        }} onClick={e => { if (e.target === e.currentTarget) setOpenDialog(false); }}>
          <div style={{
            background: '#0f1628', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 24, padding: 32, width: '100%', maxWidth: 440,
            animation: 'scaleIn 0.3s ease-out',
          }}>
            <h3 style={{ color: '#f0f2ff', fontWeight: 700, fontSize: '1.1rem', marginBottom: 4 }}>Log Mood</h3>
            <p style={{ color: '#8b93b5', fontSize: '0.85rem', marginBottom: 24 }}>Add a note about how you're feeling</p>
            {selectedMood && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
                borderRadius: 12, background: `${selectedMood.color}15`, border: `1px solid ${selectedMood.color}40`, marginBottom: 20,
              }}>
                <span style={{ fontSize: '2rem' }}>{selectedMood.emoji}</span>
                <div>
                  <div style={{ fontWeight: 700, color: selectedMood.color }}>{selectedMood.label}</div>
                  <div style={{ fontSize: '0.75rem', color: '#8b93b5' }}>Selected mood</div>
                </div>
              </div>
            )}
            <textarea placeholder="What's going on? (optional)" value={noteText}
              onChange={e => setNoteText(e.target.value)} rows={3}
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 12,
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#f0f2ff', fontSize: '0.9rem', lineHeight: 1.6,
                marginBottom: 20, outline: 'none', resize: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
              }}
              onFocus={e => { e.target.style.borderColor = selectedMood ? selectedMood.color + '80' : 'rgba(139,92,246,0.5)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setOpenDialog(false)} style={{
                padding: '10px 20px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)',
                background: 'transparent', color: '#8b93b5', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: '0.9rem',
              }}>Cancel</button>
              <button onClick={handleSaveMood} disabled={saving} style={{
                padding: '10px 20px', borderRadius: 12, border: 'none',
                background: selectedMood ? `linear-gradient(135deg, ${selectedMood.color}, ${selectedMood.color}cc)` : 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                color: 'white', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: '0.9rem',
                display: 'flex', alignItems: 'center', gap: 8,
                boxShadow: selectedMood ? `0 4px 16px ${selectedMood.color}50` : '0 4px 16px rgba(139,92,246,0.4)',
              }}>
                {saving
                  ? <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin-slow 0.7s linear infinite' }} />Saving…</>
                  : 'Save Entry'
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mood;