import React, { useMemo } from 'react';
import { useAuth } from '../Auth/AuthProvider';

const JOURNAL_KEY = (uid) => `mindscape_journal_${uid}`;
const MOOD_KEY = (uid) => `mindscape_mood_${uid}`;
const SESSIONS_KEY = (uid) => `mindscape_sessions_${uid}`;
const BREATHE_KEY = (uid) => `mindscape_breathe_${uid}`;
const ASSESS_KEY = (uid) => `mindscape_assessments_${uid}`;

const calcStreak = (entries) => {
    if (!entries.length) return 0;
    const days = [...new Set(entries.map(e => new Date(e.createdAt).toDateString()))].sort((a, b) => new Date(b) - new Date(a));
    let streak = 0;
    for (let i = 0; i < days.length; i++) {
        const expected = new Date(Date.now() - i * 86400000).toDateString();
        if (days[i] === expected) streak++;
        else break;
    }
    return streak;
};

const ACHIEVEMENTS = [
    { id: 'first_step', icon: '🌱', name: 'First Step', desc: 'Write your first journal entry', color: '#10b981', check: s => s.journals >= 1, prog: s => Math.min(s.journals, 1) / 1 },
    { id: 'writer_5', icon: '✍️', name: 'Getting Started', desc: 'Write 5 journal entries', color: '#06b6d4', check: s => s.journals >= 5, prog: s => Math.min(s.journals, 5) / 5 },
    { id: 'writer_25', icon: '📚', name: 'Dedicated Writer', desc: 'Write 25 journal entries', color: '#8b5cf6', check: s => s.journals >= 25, prog: s => Math.min(s.journals, 25) / 25 },
    { id: 'streak_3', icon: '🔥', name: 'On a Roll', desc: '3-day journal streak', color: '#f59e0b', check: s => s.streak >= 3, prog: s => Math.min(s.streak, 3) / 3 },
    { id: 'streak_7', icon: '⚡', name: 'Week Warrior', desc: 'Maintain a 7-day streak', color: '#ec4899', check: s => s.streak >= 7, prog: s => Math.min(s.streak, 7) / 7 },
    { id: 'mood_first', icon: '🎭', name: 'Mood Aware', desc: 'Log your first mood', color: '#ec4899', check: s => s.moods >= 1, prog: s => Math.min(s.moods, 1) / 1 },
    { id: 'mood_7', icon: '📊', name: 'Mood Tracker', desc: 'Log your mood 7 times', color: '#8b5cf6', check: s => s.moods >= 7, prog: s => Math.min(s.moods, 7) / 7 },
    { id: 'mood_30', icon: '🌈', name: 'Consistent', desc: '30 mood entries', color: '#10b981', check: s => s.moods >= 30, prog: s => Math.min(s.moods, 30) / 30 },
    { id: 'mia_first', icon: '🤖', name: 'Met Mia', desc: 'Start your first chat with Mia', color: '#8b5cf6', check: s => s.chats >= 1, prog: s => Math.min(s.chats, 1) / 1 },
    { id: 'mia_5', icon: '💬', name: 'Open Up', desc: 'Have 5 conversations with Mia', color: '#ec4899', check: s => s.chats >= 5, prog: s => Math.min(s.chats, 5) / 5 },
    { id: 'breathe', icon: '🌬️', name: 'First Breath', desc: 'Complete a breathing session', color: '#06b6d4', check: s => s.breathe >= 1, prog: s => Math.min(s.breathe, 1) / 1 },
    { id: 'assess', icon: '🧠', name: 'Self Aware', desc: 'Complete a wellness assessment', color: '#f59e0b', check: s => s.assess >= 1, prog: s => Math.min(s.assess, 1) / 1 },
];

export default function Achievements() {
    const { currentUser } = useAuth();

    const { stats, achievements } = useMemo(() => {
        if (!currentUser) return { stats: {}, achievements: [] };
        try {
            const journals = JSON.parse(localStorage.getItem(JOURNAL_KEY(currentUser.uid)) || '[]');
            const moods = JSON.parse(localStorage.getItem(MOOD_KEY(currentUser.uid)) || '[]');
            const sessions = JSON.parse(localStorage.getItem(SESSIONS_KEY(currentUser.uid)) || '[]');
            const breatheN = parseInt(localStorage.getItem(BREATHE_KEY(currentUser.uid)) || '0', 10);
            const assessN = parseInt(localStorage.getItem(ASSESS_KEY(currentUser.uid)) || '0', 10);
            const streak = calcStreak(journals);

            const stats = { journals: journals.length, moods: moods.length, chats: sessions.length, streak, breathe: breatheN, assess: assessN };
            const achievements = ACHIEVEMENTS.map(a => ({ ...a, unlocked: a.check(stats), progress: a.prog(stats) }));
            return { stats, achievements };
        } catch { return { stats: {}, achievements: ACHIEVEMENTS.map(a => ({ ...a, unlocked: false, progress: 0 })) }; }
    }, [currentUser]);

    const unlocked = achievements.filter(a => a.unlocked).length;

    return (
        <section style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f0f2ff', letterSpacing: '-0.02em', marginBottom: 2 }}>
                        🏅 Achievements
                    </h2>
                    <p style={{ fontSize: '0.78rem', color: '#4a5378' }}>{unlocked} / {achievements.length} unlocked</p>
                </div>
                {/* Progress ring */}
                <div style={{ position: 'relative', width: 44, height: 44 }}>
                    <svg viewBox="0 0 44 44" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                        <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
                        <circle cx="22" cy="22" r="18" fill="none" stroke="#8b5cf6" strokeWidth="4"
                            strokeDasharray={`${(unlocked / achievements.length) * 113} 113`}
                            strokeLinecap="round" style={{ transition: 'stroke-dasharray 0.8s ease' }} />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 700, color: '#a78bfa' }}>
                        {Math.round((unlocked / achievements.length) * 100)}%
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10 }}>
                {achievements.map(a => (
                    <div key={a.id} title={a.desc} style={{
                        padding: '14px 10px', borderRadius: 14, textAlign: 'center',
                        background: a.unlocked ? `${a.color}18` : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${a.unlocked ? a.color + '40' : 'rgba(255,255,255,0.06)'}`,
                        transition: 'all 0.3s', cursor: 'default', position: 'relative', overflow: 'hidden',
                        opacity: a.unlocked ? 1 : 0.5,
                        boxShadow: a.unlocked ? `0 4px 20px ${a.color}25` : 'none',
                    }}>
                        {a.unlocked && (
                            <div style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: '50%', background: a.color, boxShadow: `0 0 8px ${a.color}` }} />
                        )}
                        <div style={{ fontSize: '1.6rem', marginBottom: 6, filter: a.unlocked ? 'none' : 'grayscale(1)' }}>
                            {a.unlocked ? a.icon : '🔒'}
                        </div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: a.unlocked ? '#f0f2ff' : '#4a5378', lineHeight: 1.3, marginBottom: 6 }}>
                            {a.name}
                        </div>
                        {/* Progress bar */}
                        {!a.unlocked && a.progress > 0 && (
                            <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                                <div style={{ height: '100%', borderRadius: 2, background: a.color, width: `${a.progress * 100}%`, transition: 'width 0.8s ease' }} />
                            </div>
                        )}
                        {a.unlocked && (
                            <div style={{ fontSize: '0.6rem', color: a.color, fontWeight: 700 }}>✓ Unlocked</div>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}
