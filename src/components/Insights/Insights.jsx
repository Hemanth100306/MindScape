import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Auth/AuthProvider';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    RadarChart, PolarGrid, PolarAngleAxis, Radar,
} from 'recharts';

const moods = [
    { emoji: '😭', label: 'Very Sad', color: '#ef4444', value: 0 },
    { emoji: '😔', label: 'Sad', color: '#f97316', value: 1 },
    { emoji: '😐', label: 'Neutral', color: '#eab308', value: 2 },
    { emoji: '😊', label: 'Happy', color: '#22c55e', value: 3 },
    { emoji: '😄', label: 'Very Happy', color: '#06b6d4', value: 4 },
];

const WellnessTips = [
    { cond: s => s.journalStreak >= 7, tip: '🔥 7-day journal streak! Your consistency is building resilience.', color: '#f59e0b' },
    { cond: s => s.avgMood >= 3, tip: '😊 Your average mood is positive! Keep nurturing what makes you happy.', color: '#22c55e' },
    { cond: s => s.avgMood !== null && s.avgMood < 2, tip: '💜 Your mood has been low lately. Consider talking to Mia or trying a breathing exercise.', color: '#8b5cf6' },
    { cond: s => s.journalCount === 0, tip: '📓 Start journaling! Even 3 sentences a day can improve emotional clarity.', color: '#06b6d4' },
    { cond: s => s.breatheSessions > 0, tip: '🌬️ Great job completing breathing sessions! Daily breathing lowers cortisol levels.', color: '#10b981' },
    { cond: s => s.moodCount >= 10, tip: '\uD83D\uDCCA You\'ve built a solid mood history. Look for patterns in your best days!', color: '#ec4899' },
    { cond: s => s.chatSessions >= 5, tip: '\uD83E\uDD16 Talking to Mia regularly helps process emotions. You\'re doing great!', color: '#8b5cf6' },
    { cond: () => true, tip: '\uD83D\uDCA1 Small consistent actions compound into powerful mental wellness. Keep going!', color: '#a78bfa' },
];

function StatCard({ icon, value, label, sub, color }) {
    return (
        <div style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 18, padding: '20px', transition: 'all 0.25s',
        }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = `${color}40`; e.currentTarget.style.background = `${color}08`; e.currentTarget.style.transform = 'translateY(-3px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.transform = 'none'; }}
        >
            <div style={{ fontSize: '1.4rem', marginBottom: 8 }}>{icon}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color, lineHeight: 1, marginBottom: 4 }}>{value}</div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#f0f2ff', marginBottom: 2 }}>{label}</div>
            {sub && <div style={{ fontSize: '0.68rem', color: '#4a5378' }}>{sub}</div>}
        </div>
    );
}

const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const v = payload[0].value;
        const mood = v !== null ? moods[Math.round(v)] : null;
        return (
            <div style={{ background: '#0f1628', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '8px 14px' }}>
                <div style={{ fontSize: '0.78rem', color: '#8b93b5', marginBottom: 2 }}>{label}</div>
                {mood
                    ? <div style={{ fontWeight: 700, color: mood.color }}>{mood.emoji} {mood.label}</div>
                    : <div style={{ color: '#4a5378', fontSize: '0.8rem' }}>No data</div>}
            </div>
        );
    }
    return null;
};

export default function Insights() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const data = useMemo(() => {
        if (!currentUser) return null;
        try {
            const uid = currentUser.uid;
            const journals = JSON.parse(localStorage.getItem(`mindscape_journal_${uid}`) || '[]');
            const moodLogs = JSON.parse(localStorage.getItem(`mindscape_mood_${uid}`) || '[]');
            const sessions = JSON.parse(localStorage.getItem(`mindscape_sessions_${uid}`) || '[]');
            const breatheN = parseInt(localStorage.getItem(`mindscape_breathe_${uid}`) || '0', 10);
            const assessN = parseInt(localStorage.getItem(`mindscape_assessments_${uid}`) || '0', 10);

            // Journal streak
            const jDays = [...new Set(journals.map(e => new Date(e.createdAt).toDateString()))];
            let journalStreak = 0;
            for (let i = 0; i < 365; i++) {
                const d = new Date(); d.setDate(d.getDate() - i);
                if (jDays.includes(d.toDateString())) journalStreak++;
                else if (i > 0) break;
            }

            // Mood streak
            const mDays = [...new Set(moodLogs.map(e => new Date(e.createdAt).toDateString()))];
            let moodStreak = 0;
            for (let i = 0; i < 365; i++) {
                const d = new Date(); d.setDate(d.getDate() - i);
                if (mDays.includes(d.toDateString())) moodStreak++;
                else if (i > 0) break;
            }

            // Avg mood
            const avgMood = moodLogs.length > 0
                ? moodLogs.reduce((s, e) => s + (e.moodValue ?? 0), 0) / moodLogs.length
                : null;

            // Mood by day of week
            const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const dayBuckets = Array(7).fill(null).map(() => []);
            moodLogs.forEach(e => {
                const d = new Date(e.createdAt).getDay();
                dayBuckets[d].push(e.moodValue ?? 0);
            });
            const moodByDay = dayLabels.map((label, i) => ({
                label,
                avg: dayBuckets[i].length > 0
                    ? dayBuckets[i].reduce((a, b) => a + b) / dayBuckets[i].length
                    : null,
                count: dayBuckets[i].length,
            }));

            const bestDay = [...moodByDay].sort((a, b) => (b.avg ?? -1) - (a.avg ?? -1)).find(d => d.avg !== null);
            const worstDay = [...moodByDay].sort((a, b) => (a.avg ?? 99) - (b.avg ?? 99)).find(d => d.avg !== null);

            // Journal total words
            const totalWords = journals.reduce((s, e) => s + (e.content || '').split(/\s+/).filter(Boolean).length, 0);
            const avgWords = journals.length > 0 ? Math.round(totalWords / journals.length) : 0;

            // Top mood
            const moodCounts = moodLogs.reduce((acc, e) => { acc[e.moodLabel] = (acc[e.moodLabel] || 0) + 1; return acc; }, {});
            const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

            // Wellness score (0-100)
            let score = 0;
            if (journals.length > 0) score += 15;
            if (journals.length >= 10) score += 10;
            if (journalStreak >= 3) score += 15;
            if (moodLogs.length > 0) score += 10;
            if (moodLogs.length >= 7) score += 10;
            if (avgMood !== null && avgMood >= 2) score += 15;
            if (sessions.length > 0) score += 10;
            if (breatheN > 0) score += 10;
            if (assessN > 0) score += 5;
            score = Math.min(score, 100);

            // Radar chart data
            const radarData = [
                { subject: 'Journaling', value: Math.min(journals.length / 20 * 100, 100) },
                { subject: 'Mood Logs', value: Math.min(moodLogs.length / 30 * 100, 100) },
                { subject: 'AI Chats', value: Math.min(sessions.length / 10 * 100, 100) },
                { subject: 'Breathing', value: breatheN > 0 ? Math.min(breatheN / 5 * 100, 100) : 0 },
                { subject: 'Streak', value: Math.min(journalStreak / 14 * 100, 100) },
                { subject: 'Mood Health', value: avgMood !== null ? (avgMood / 4) * 100 : 0 },
            ];

            const tips = WellnessTips.filter(t => t.cond({ journalStreak, avgMood: avgMood !== null ? Math.round(avgMood) : null, journalCount: journals.length, moodCount: moodLogs.length, breatheSessions: breatheN, chatSessions: sessions.length })).slice(0, 3);

            return {
                journalCount: journals.length, journalStreak, moodCount: moodLogs.length,
                moodStreak, avgMood, topMood, chatSessions: sessions.length,
                breatheN, assessN, moodByDay, bestDay, worstDay, totalWords, avgWords,
                score, radarData, tips,
            };
        } catch { return null; }
    }, [currentUser]);

    if (!data) return (
        <div style={{ textAlign: 'center', padding: 80, color: '#8b93b5' }}>
            <div style={{ fontSize: '2rem', marginBottom: 12 }}>📊</div>
            Could not load insights.
        </div>
    );

    const avgMoodObj = data.avgMood !== null ? moods[Math.round(data.avgMood)] : null;
    const scoreColor = data.score >= 70 ? '#10b981' : data.score >= 40 ? '#f59e0b' : '#ef4444';
    const scoreLabel = data.score >= 70 ? 'Thriving' : data.score >= 40 ? 'Building' : 'Starting Out';

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto', animation: 'fadeInUp 0.5s ease-out' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>📊</div>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f0f2ff', letterSpacing: '-0.03em', lineHeight: 1 }}>Wellness Insights</h1>
                    <p style={{ color: '#8b93b5', fontSize: '0.85rem' }}>Your personal mental health data, visualized</p>
                </div>
            </div>

            {/* Wellness Score + Radar */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16, marginBottom: 20 }}>
                {/* Score card */}
                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '28px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#a78bfa', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Wellness Score</div>
                    {/* Score ring */}
                    <div style={{ position: 'relative', width: 120, height: 120 }}>
                        <svg viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                            <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                            <circle cx="60" cy="60" r="50" fill="none" stroke={scoreColor} strokeWidth="10"
                                strokeDasharray={`${(data.score / 100) * 314} 314`}
                                strokeLinecap="round"
                                style={{ transition: 'stroke-dasharray 1.2s ease', filter: `drop-shadow(0 0 8px ${scoreColor})` }} />
                        </svg>
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: scoreColor, lineHeight: 1 }}>{data.score}</div>
                            <div style={{ fontSize: '0.62rem', color: '#4a5378', fontWeight: 600 }}>/ 100</div>
                        </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: scoreColor }}>{scoreLabel}</div>
                        <div style={{ fontSize: '0.72rem', color: '#4a5378', marginTop: 2 }}>Based on your activity</div>
                    </div>
                    {data.journalCount === 0 && data.moodCount === 0 && (
                        <div style={{ textAlign: 'center' }}>
                            <button onClick={() => navigate('/journal')} style={{ padding: '8px 18px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: 'white', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                                Start Tracking
                            </button>
                        </div>
                    )}
                </div>

                {/* Radar chart */}
                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '24px' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f0f2ff', marginBottom: 4 }}>Activity Radar</h3>
                    <p style={{ fontSize: '0.75rem', color: '#4a5378', marginBottom: 12 }}>How balanced is your wellness practice?</p>
                    <ResponsiveContainer width="100%" height={210}>
                        <RadarChart data={data.radarData}>
                            <PolarGrid stroke="rgba(255,255,255,0.06)" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#8b93b5', fontSize: 11 }} />
                            <Radar dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} strokeWidth={2} dot={{ r: 3, fill: '#8b5cf6' }} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
                <StatCard icon="📓" value={data.journalCount} label="Journal Entries" sub={`${data.avgWords} avg words`} color="#06b6d4" />
                <StatCard icon="🔥" value={`${data.journalStreak}d`} label="Journal Streak" sub={data.journalStreak > 0 ? 'Keep it up!' : 'Start today'} color="#f59e0b" />
                <StatCard icon={avgMoodObj?.emoji || '🎭'} value={avgMoodObj?.label || '—'} label="Avg Mood" sub={`${data.moodCount} total logs`} color={avgMoodObj?.color || '#8b93b5'} />
                <StatCard icon="🤖" value={data.chatSessions} label="AI Sessions" sub={`${data.moodStreak}d mood streak`} color="#8b5cf6" />
            </div>

            {/* Mood by Day of Week */}
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '24px', marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f0f2ff' }}>Mood by Day of Week</h3>
                    <div style={{ display: 'flex', gap: 12 }}>
                        {data.bestDay && <span style={{ fontSize: '0.72rem', color: '#22c55e', fontWeight: 600 }}>Best: {data.bestDay.label} {moods[Math.round(data.bestDay.avg)]?.emoji}</span>}
                        {data.worstDay && data.worstDay.label !== data.bestDay?.label && <span style={{ fontSize: '0.72rem', color: '#ef4444', fontWeight: 600 }}>Tough: {data.worstDay.label} {moods[Math.round(data.worstDay.avg)]?.emoji}</span>}
                    </div>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#4a5378', marginBottom: 16 }}>Average mood score per day (0=Very Sad, 4=Very Happy)</p>
                <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={data.moodByDay} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                        <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#8b93b5' }} axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 4]} ticks={[0, 1, 2, 3, 4]} tick={{ fontSize: 10, fill: '#4a5378' }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                        <Bar dataKey="avg" radius={[6, 6, 0, 0]}
                            fill="#8b5cf6"
                            background={{ fill: 'rgba(255,255,255,0.03)', radius: [6, 6, 0, 0] }}
                        />
                    </BarChart>
                </ResponsiveContainer>
                {data.moodCount === 0 && (
                    <div style={{ textAlign: 'center', color: '#4a5378', fontSize: '0.82rem', marginTop: 8 }}>
                        Log your mood to see day-of-week patterns.
                    </div>
                )}
            </div>

            {/* Top Mood + Words + Tips */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16, marginBottom: 20 }}>
                {/* Top mood breakdown */}
                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '24px' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f0f2ff', marginBottom: 16 }}>Mood Highlights</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {[
                            { label: 'Top Mood', value: data.topMood || '—', icon: data.topMood ? (moods.find(m => m.label === data.topMood)?.emoji || '🎭') : '🎭', color: data.topMood ? (moods.find(m => m.label === data.topMood)?.color || '#8b93b5') : '#8b93b5' },
                            { label: 'Best Day', value: data.bestDay?.label || '—', icon: '✨', color: '#22c55e' },
                            { label: 'Total Words Written', value: data.totalWords.toLocaleString(), icon: '✍️', color: '#06b6d4' },
                            { label: 'Breathing Sessions', value: data.breatheN, icon: '🌬️', color: '#10b981' },
                            { label: 'Assessments Taken', value: data.assessN, icon: '🧠', color: '#f59e0b' },
                        ].map((item, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontSize: '1rem' }}>{item.icon}</span>
                                    <span style={{ fontSize: '0.78rem', color: '#8b93b5' }}>{item.label}</span>
                                </div>
                                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: item.color }}>{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Wellness Tips */}
                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '24px' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f0f2ff', marginBottom: 6 }}>Personalized Insights</h3>
                    <p style={{ fontSize: '0.75rem', color: '#4a5378', marginBottom: 16 }}>Based on your activity patterns</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {data.tips.map((tip, i) => (
                            <div key={i} style={{
                                padding: '14px 16px', borderRadius: 14,
                                background: `${tip.color}10`, border: `1px solid ${tip.color}25`,
                                fontSize: '0.84rem', color: '#d4d8f0', lineHeight: 1.6,
                                animation: `fadeInUp 0.4s ease-out ${i * 0.1}s both`,
                            }}>
                                {tip.tip}
                            </div>
                        ))}
                    </div>

                    {/* Quick actions */}
                    <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {[
                            { label: '📓 Journal', path: '/journal', color: '#06b6d4' },
                            { label: '🎭 Log Mood', path: '/mood', color: '#ec4899' },
                            { label: '🌬️ Breathe', path: '/breathe', color: '#10b981' },
                            { label: '🤖 Talk to Mia', path: '/chat', color: '#8b5cf6' },
                        ].map((a, i) => (
                            <button key={i} onClick={() => navigate(a.path)} style={{
                                padding: '7px 13px', borderRadius: 10, border: `1px solid ${a.color}30`,
                                background: `${a.color}10`, color: a.color, fontSize: '0.75rem', fontWeight: 600,
                                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.background = `${a.color}22`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = `${a.color}10`; e.currentTarget.style.transform = 'none'; }}
                            >
                                {a.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
