import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebaseConfig';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleReset = async (e) => {
        e.preventDefault();
        if (!email) { setError('Please enter your email address'); return; }
        setError('');
        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, email);
            setSent(true);
        } catch (err) {
            if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential')
                setError('No account found with this email');
            else if (err.code === 'auth/invalid-email') setError('Invalid email address');
            else setError('Failed to send reset email. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px', position: 'relative', overflow: 'hidden',
        }}>
            <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(245,158,11,0.12) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 20% 80%, rgba(139,92,246,0.1) 0%, transparent 60%)' }} />

            <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 420, animation: 'scaleIn 0.5s ease-out' }}>
                <div style={{ textAlign: 'center', marginBottom: 36 }}>
                    <div style={{
                        width: 68, height: 68, borderRadius: 20, margin: '0 auto 18px',
                        background: 'linear-gradient(135deg, #f59e0b, #ec4899)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 50px rgba(245,158,11,0.4)',
                        fontSize: '2rem',
                    }}>🔐</div>
                    <h1 style={{
                        fontSize: '1.8rem', fontWeight: 800,
                        background: 'linear-gradient(135deg, #f59e0b, #ec4899)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                        letterSpacing: '-0.04em', marginBottom: 6,
                    }}>Reset Password</h1>
                    <p style={{ color: '#8b93b5', fontSize: '0.9rem' }}>We'll send a reset link to your email</p>
                </div>

                <div style={{
                    background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '36px',
                    boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
                }}>
                    {sent ? (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: 64, height: 64, borderRadius: '50%', margin: '0 auto 20px',
                                background: 'rgba(16,185,129,0.15)', border: '2px solid rgba(16,185,129,0.4)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem',
                            }}>✉️</div>
                            <h2 style={{ color: '#f0f2ff', fontWeight: 700, fontSize: '1.1rem', marginBottom: 10 }}>Check your inbox!</h2>
                            <p style={{ color: '#8b93b5', fontSize: '0.875rem', lineHeight: 1.7, marginBottom: 24 }}>
                                We sent a password reset link to <strong style={{ color: '#f0f2ff' }}>{email}</strong>. Check your spam folder if you don't see it.
                            </p>
                            <Link to="/login" style={{
                                display: 'block', padding: '12px', borderRadius: 12, textAlign: 'center',
                                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: 'white',
                                fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem',
                                boxShadow: '0 4px 20px rgba(139,92,246,0.4)',
                            }}>Back to Sign In</Link>
                        </div>
                    ) : (
                        <>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f0f2ff', marginBottom: 6 }}>Forgot your password?</h2>
                            <p style={{ color: '#8b93b5', fontSize: '0.875rem', marginBottom: 28 }}>Enter the email address linked to your account.</p>

                            {error && (
                                <div style={{
                                    padding: '12px 16px', borderRadius: 12, marginBottom: 20,
                                    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                                    color: '#fca5a5', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 8,
                                }}>
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleReset}>
                                <div style={{ marginBottom: 24 }}>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#8b93b5', marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Email Address</label>
                                    <div style={{ position: 'relative' }}>
                                        <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#4a5378', pointerEvents: 'none' }}>
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                                        </span>
                                        <input type="email" id="reset-email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoFocus style={{
                                            width: '100%', padding: '13px 14px 13px 40px', borderRadius: 12,
                                            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                                            color: '#f0f2ff', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', transition: 'all 0.2s',
                                        }}
                                            onFocus={e => { e.target.style.borderColor = 'rgba(245,158,11,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.08)'; }}
                                            onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                                        />
                                    </div>
                                </div>

                                <button type="submit" id="reset-submit" disabled={loading || !email} style={{
                                    width: '100%', padding: '13px', borderRadius: 12, border: 'none',
                                    background: (!email || loading) ? 'rgba(245,158,11,0.4)' : 'linear-gradient(135deg, #f59e0b, #ec4899)',
                                    color: 'white', fontWeight: 700, fontSize: '0.95rem',
                                    cursor: (!email || loading) ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                                    boxShadow: '0 4px 20px rgba(245,158,11,0.3)', transition: 'all 0.2s',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                }}
                                    onMouseEnter={e => { if (email && !loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(245,158,11,0.5)'; } }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(245,158,11,0.3)'; }}
                                >
                                    {loading ? <><div style={{ width: 17, height: 17, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin-slow 0.8s linear infinite' }} />Sending…</> : 'Send Reset Link →'}
                                </button>
                            </form>

                            <p style={{ textAlign: 'center', marginTop: 20, color: '#8b93b5', fontSize: '0.85rem' }}>
                                Remember it?{' '}
                                <Link to="/login" style={{ color: '#a78bfa', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
