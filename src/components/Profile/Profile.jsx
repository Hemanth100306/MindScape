import React, { useState, useEffect } from 'react';
import { updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider, deleteUser } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { useAuth } from '../Auth/AuthProvider';
import { useNavigate } from 'react-router-dom';

const SESSIONS_KEY = (uid) => `mindscape_sessions_${uid}`;
const JOURNAL_KEY = (uid) => `mindscape_journal_${uid}`;
const MOOD_KEY = (uid) => `mindscape_mood_${uid}`;

const EyeIcon = ({ open }) => open
    ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
    : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>;

export default function Profile() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
    const [nameLoading, setNameLoading] = useState(false);
    const [nameMsg, setNameMsg] = useState(null);

    const [currPass, setCurrPass] = useState('');
    const [newPass, setNewPass] = useState('');
    const [showCurr, setShowCurr] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [passLoading, setPassLoading] = useState(false);
    const [passMsg, setPassMsg] = useState(null);

    const [deletePass, setDeletePass] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteErr, setDeleteErr] = useState('');

    const [toast, setToast] = useState(null);

    const showToast = (msg, color = '#10b981') => {
        setToast({ msg, color });
        setTimeout(() => setToast(null), 3200);
    };

    // Stats from localStorage
    const stats = React.useMemo(() => {
        if (!currentUser) return {};
        const journals = JSON.parse(localStorage.getItem(JOURNAL_KEY(currentUser.uid)) || '[]');
        const moods = JSON.parse(localStorage.getItem(MOOD_KEY(currentUser.uid)) || '[]');
        const sessions = JSON.parse(localStorage.getItem(SESSIONS_KEY(currentUser.uid)) || '[]');
        const totalMsgs = sessions.reduce((s, c) => s + c.messages.length, 0);
        return {
            journals: journals.length,
            moods: moods.length,
            chatSessions: sessions.length,
            totalMsgs,
        };
    }, [currentUser]);

    const handleNameSave = async () => {
        if (!displayName.trim()) { setNameMsg({ text: 'Name cannot be empty', ok: false }); return; }
        setNameLoading(true); setNameMsg(null);
        try {
            await updateProfile(auth.currentUser, { displayName: displayName.trim() });
            setNameMsg({ text: '✓ Name updated!', ok: true });
            showToast('✓ Display name updated!');
        } catch { setNameMsg({ text: 'Failed to update name', ok: false }); }
        finally { setNameLoading(false); }
    };

    const handlePasswordChange = async () => {
        if (!currPass || !newPass) { setPassMsg({ text: 'Fill in both fields', ok: false }); return; }
        if (newPass.length < 6) { setPassMsg({ text: 'New password must be at least 6 characters', ok: false }); return; }
        setPassLoading(true); setPassMsg(null);
        try {
            const cred = EmailAuthProvider.credential(currentUser.email, currPass);
            await reauthenticateWithCredential(auth.currentUser, cred);
            await updatePassword(auth.currentUser, newPass);
            setCurrPass(''); setNewPass('');
            setPassMsg({ text: '✓ Password changed!', ok: true });
            showToast('✓ Password updated successfully!');
        } catch (e) {
            if (e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential')
                setPassMsg({ text: 'Current password is incorrect', ok: false });
            else setPassMsg({ text: 'Failed to change password', ok: false });
        } finally { setPassLoading(false); }
    };

    const handleDeleteAccount = async () => {
        if (!deletePass) { setDeleteErr('Enter your password to confirm'); return; }
        setDeleteLoading(true); setDeleteErr('');
        try {
            const cred = EmailAuthProvider.credential(currentUser.email, deletePass);
            await reauthenticateWithCredential(auth.currentUser, cred);
            // Clear all local data
            [JOURNAL_KEY, MOOD_KEY, SESSIONS_KEY].forEach(k => localStorage.removeItem(k(currentUser.uid)));
            await deleteUser(auth.currentUser);
            navigate('/login');
        } catch (e) {
            if (e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential')
                setDeleteErr('Incorrect password');
            else setDeleteErr('Failed to delete account. Please try again.');
        } finally { setDeleteLoading(false); }
    };

    const cardStyle = {
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 20, padding: '28px', marginBottom: 20,
    };
    const labelStyle = { display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#8b93b5', marginBottom: 7, letterSpacing: '0.05em', textTransform: 'uppercase' };
    const inputStyle = { width: '100%', padding: '11px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#f0f2ff', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', transition: 'all 0.2s' };
    const btnPrimary = { padding: '10px 24px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#8b5cf6,#7c3aed)', color: 'white', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(139,92,246,0.3)', transition: 'all 0.2s' };

    return (
        <div style={{ maxWidth: 640, margin: '0 auto', animation: 'fadeInUp 0.5s ease-out' }}>
            {/* Toast */}
            {toast && (
                <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, padding: '12px 20px', borderRadius: 12, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7', fontSize: '0.875rem', fontWeight: 600, boxShadow: '0 8px 32px rgba(0,0,0,0.3)', animation: 'fadeInUp 0.3s ease-out' }}>
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#8b5cf6,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', fontWeight: 800, color: 'white', boxShadow: '0 0 30px rgba(139,92,246,0.5)', flexShrink: 0 }}>
                    {(currentUser?.displayName || currentUser?.email || 'U')[0].toUpperCase()}
                </div>
                <div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f0f2ff', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 4 }}>
                        {currentUser?.displayName || currentUser?.email?.split('@')[0] || 'My Profile'}
                    </h1>
                    <p style={{ color: '#8b93b5', fontSize: '0.85rem' }}>{currentUser?.email}</p>
                </div>
            </div>

            {/* Stats */}
            <div style={{ ...cardStyle, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
                {[
                    { label: 'Journal Entries', val: stats.journals ?? 0, icon: '📓', color: '#06b6d4' },
                    { label: 'Mood Logs', val: stats.moods ?? 0, icon: '🎭', color: '#ec4899' },
                    { label: 'Mia Chats', val: stats.chatSessions ?? 0, icon: '🤖', color: '#8b5cf6' },
                    { label: 'Messages with Mia', val: stats.totalMsgs ?? 0, icon: '💬', color: '#10b981' },
                ].map((s, i) => (
                    <div key={i} style={{ textAlign: 'center', padding: '12px 8px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ fontSize: '1.4rem', marginBottom: 4 }}>{s.icon}</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.val}</div>
                        <div style={{ fontSize: '0.65rem', color: '#4a5378', marginTop: 3, fontWeight: 600 }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Edit name */}
            <div style={cardStyle}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#f0f2ff', marginBottom: 18 }}>Display Name</h2>
                <label style={labelStyle}>Name shown in the app</label>
                <div style={{ display: 'flex', gap: 10 }}>
                    <input value={displayName} onChange={e => setDisplayName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleNameSave(); }} style={{ ...inputStyle, flex: 1 }}
                        onFocus={e => { e.target.style.borderColor = 'rgba(139,92,246,0.6)'; }} onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }} />
                    <button onClick={handleNameSave} disabled={nameLoading} style={btnPrimary}>
                        {nameLoading ? 'Saving…' : 'Save'}
                    </button>
                </div>
                {nameMsg && <p style={{ marginTop: 8, fontSize: '0.8rem', color: nameMsg.ok ? '#10b981' : '#f87171', fontWeight: 600 }}>{nameMsg.text}</p>}
            </div>

            {/* Change password */}
            <div style={cardStyle}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#f0f2ff', marginBottom: 18 }}>Change Password</h2>
                <div style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>Current Password</label>
                    <div style={{ position: 'relative' }}>
                        <input type={showCurr ? 'text' : 'password'} value={currPass} onChange={e => setCurrPass(e.target.value)} placeholder="Current password" style={{ ...inputStyle, paddingRight: 42 }}
                            onFocus={e => { e.target.style.borderColor = 'rgba(139,92,246,0.6)'; }} onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }} />
                        <button type="button" onClick={() => setShowCurr(p => !p)} style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#4a5378', padding: 0, display: 'flex' }}>
                            <EyeIcon open={showCurr} />
                        </button>
                    </div>
                </div>
                <div style={{ marginBottom: 18 }}>
                    <label style={labelStyle}>New Password</label>
                    <div style={{ position: 'relative' }}>
                        <input type={showNew ? 'text' : 'password'} value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="Min 6 characters" style={{ ...inputStyle, paddingRight: 42 }}
                            onFocus={e => { e.target.style.borderColor = 'rgba(139,92,246,0.6)'; }} onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }} />
                        <button type="button" onClick={() => setShowNew(p => !p)} style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#4a5378', padding: 0, display: 'flex' }}>
                            <EyeIcon open={showNew} />
                        </button>
                    </div>
                </div>
                <button onClick={handlePasswordChange} disabled={passLoading} style={btnPrimary}>
                    {passLoading ? 'Updating…' : 'Change Password'}
                </button>
                {passMsg && <p style={{ marginTop: 8, fontSize: '0.8rem', color: passMsg.ok ? '#10b981' : '#f87171', fontWeight: 600 }}>{passMsg.text}</p>}
            </div>

            {/* Danger zone */}
            <div style={{ ...cardStyle, borderColor: 'rgba(239,68,68,0.2)' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#f87171', marginBottom: 6 }}>⚠️ Danger Zone</h2>
                <p style={{ color: '#8b93b5', fontSize: '0.85rem', marginBottom: 18, lineHeight: 1.6 }}>
                    Permanently delete your account and all data. This cannot be undone.
                </p>
                {!showDeleteConfirm ? (
                    <button onClick={() => setShowDeleteConfirm(true)} style={{ padding: '10px 22px', borderRadius: 12, border: '1px solid rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.08)', color: '#f87171', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.18)'; }} onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}>
                        Delete Account
                    </button>
                ) : (
                    <div style={{ background: 'rgba(239,68,68,0.08)', borderRadius: 14, padding: 16, border: '1px solid rgba(239,68,68,0.2)' }}>
                        <p style={{ color: '#fca5a5', fontSize: '0.85rem', marginBottom: 12, fontWeight: 600 }}>Enter your password to confirm deletion:</p>
                        <input type="password" value={deletePass} onChange={e => setDeletePass(e.target.value)} placeholder="Your password" style={{ ...inputStyle, marginBottom: 10, borderColor: 'rgba(239,68,68,0.3)' }} />
                        {deleteErr && <p style={{ color: '#f87171', fontSize: '0.8rem', marginBottom: 10 }}>{deleteErr}</p>}
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button onClick={() => { setShowDeleteConfirm(false); setDeletePass(''); setDeleteErr(''); }} style={{ flex: 1, padding: '10px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#8b93b5', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Cancel</button>
                            <button onClick={handleDeleteAccount} disabled={deleteLoading} style={{ flex: 1, padding: '10px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: 'white', fontWeight: 700, cursor: deleteLoading ? 'wait' : 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(239,68,68,0.4)' }}>
                                {deleteLoading ? 'Deleting…' : 'Delete Forever'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
