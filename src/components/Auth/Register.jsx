import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import styles from './Login.module.css'; // reuse Login styles for visual consistency
import regStyles from './Register.module.css';

/* ─── Icons ─── */
const IconUser = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
);
const IconMail = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
    </svg>
);
const IconLock = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
);
const IconCheck = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4" />
    </svg>
);
const IconEye = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
);
const IconEyeOff = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
);
const IconAlert = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
);
const IconArrow = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
);
const BrainIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
    </svg>
);
const Spinner = () => <div className={styles.spinner} />;

/* ─── Password strength ─── */
function getStrength(pw) {
    if (!pw) return 0;
    if (pw.length < 6) return 1;
    if (pw.length < 10) return 2;
    return /[A-Z]/.test(pw) && /[0-9]/.test(pw) ? 4 : 3;
}
const STRENGTH_COLORS = ['transparent', '#ef4444', '#f59e0b', '#22c55e', '#06b6d4'];
const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong ✓'];

const PERKS = [
    { icon: '🧠', text: 'AI-powered mood & journal insights' },
    { icon: '📊', text: 'Beautiful heatmap mood calendar' },
    { icon: '🏆', text: 'Achievement badges & streak tracking' },
    { icon: '🔒', text: 'End-to-end private — always' },
];

/* ═══════════════════════════════════════════════════════════════ */
export default function Register() {
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const strength = getStrength(password);

    const validate = () => {
        if (!displayName.trim()) return 'Please enter your name.';
        if (!email.trim()) return 'Please enter an email address.';
        if (password.length < 6) return 'Password must be at least 6 characters.';
        if (password !== confirm) return "Passwords don't match.";
        return null;
    };

    const handleRegister = useCallback(async (e) => {
        e.preventDefault();
        const err = validate();
        if (err) { setError(err); return; }
        setError(''); setLoading(true);
        try {
            const { user } = await createUserWithEmailAndPassword(auth, email.trim(), password);
            await updateProfile(user, { displayName: displayName.trim() });
            navigate('/');
        } catch (err) {
            const map = {
                'auth/email-already-in-use': 'An account with this email already exists.',
                'auth/invalid-email': 'Invalid email address.',
                'auth/weak-password': 'Password is too weak — use at least 6 characters.',
            };
            setError(map[err.code] ?? 'Sign up failed. Please try again.');
        } finally { setLoading(false); }
    }, [displayName, email, password, confirm, navigate]);

    return (
        <div className={styles.page}>

            {/* ═══════ LEFT PANEL ═══════ */}
            <aside className={styles.panel}>
                <div className={`${styles.blob} ${styles.blob1}`} style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.3), transparent 65%)' }} />
                <div className={`${styles.blob} ${styles.blob2}`} style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.25), transparent 65%)' }} />
                <div className={`${styles.blob} ${styles.blob3}`} style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.18), transparent 65%)' }} />
                <div className={styles.dotGrid} />

                <div className={styles.panelInner}>
                    {/* Logo */}
                    <div className={styles.logoWrap}>
                        <div className={styles.logoRing}>
                            <div className={styles.logoIcon} style={{ background: 'linear-gradient(135deg, #8b5cf6, #10b981)' }}>
                                <BrainIcon />
                            </div>
                        </div>
                        <div>
                            <h1 className={styles.logoName}>MindScape</h1>
                            <p className={styles.logoTagline}>Start your wellness journey today.</p>
                        </div>
                    </div>

                    {/* Hero text */}
                    <div className={regStyles.heroText}>
                        <div className={regStyles.heroEmoji}>🌱</div>
                        <h2 className={regStyles.heroHeading}>Your mind deserves the best care.</h2>
                        <p className={regStyles.heroSub}>Join thousands of people building healthier mental habits every day with MindScape.</p>
                    </div>

                    {/* Perks list */}
                    <div className={regStyles.perksList}>
                        {PERKS.map((p, i) => (
                            <div key={i} className={regStyles.perkItem}>
                                <span className={regStyles.perkIcon}>{p.icon}</span>
                                <span className={regStyles.perkText}>{p.text}</span>
                            </div>
                        ))}
                    </div>

                    {/* Free badge */}
                    <div className={regStyles.freeBadge}>
                        <span className={regStyles.freeBadgeDot} />
                        100% Free — No credit card required
                    </div>
                </div>
            </aside>

            {/* ═══════ RIGHT PANEL ═══════ */}
            <main className={styles.formPane}>
                <div className={styles.formGlow} style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.08), transparent 70%)' }} />
                <div className={styles.formGlow2} />

                <div className={styles.formWrap}>
                    {/* Mobile logo */}
                    <div className={styles.mobileLogo}>
                        <div className={styles.mobileLogoIcon} style={{ background: 'linear-gradient(135deg, #8b5cf6, #10b981)' }}><BrainIcon /></div>
                        <span className={styles.mobileLogoName}>MindScape</span>
                    </div>

                    {/* Header */}
                    <header className={styles.formHeader}>
                        <div className={styles.badge}>
                            <span className={styles.badgeDot} />
                            Free Forever
                        </div>
                        <h2 className={styles.heading}>Create your account ✨</h2>
                        <p className={styles.subheading}>Join your mental wellness community today.</p>
                    </header>

                    {/* Error */}
                    {error && (
                        <div className={styles.errorBanner} role="alert">
                            <IconAlert /><span>{error}</span>
                        </div>
                    )}

                    {/* Card */}
                    <div className={regStyles.cardShell}>
                        <div className={styles.card}>
                            <form onSubmit={handleRegister} noValidate>

                                {/* Name */}
                                <div className={`${styles.field} ${styles.delay1}`}>
                                    <label htmlFor="reg-name" className={styles.label}>Your name</label>
                                    <div className={styles.inputWrap}>
                                        <span className={styles.inputIcon}><IconUser /></span>
                                        <input id="reg-name" type="text" className={styles.input}
                                            value={displayName} onChange={e => setDisplayName(e.target.value)}
                                            placeholder="First name" autoFocus autoComplete="name" required />
                                    </div>
                                </div>

                                {/* Email */}
                                <div className={`${styles.field} ${styles.delay2}`}>
                                    <label htmlFor="reg-email" className={styles.label}>Email address</label>
                                    <div className={styles.inputWrap}>
                                        <span className={styles.inputIcon}><IconMail /></span>
                                        <input id="reg-email" type="email" className={styles.input}
                                            value={email} onChange={e => setEmail(e.target.value)}
                                            placeholder="you@example.com" autoComplete="email" required />
                                    </div>
                                </div>

                                {/* Password */}
                                <div className={`${styles.field} ${styles.delay3}`} style={{ marginBottom: password ? 8 : 20 }}>
                                    <label htmlFor="reg-password" className={styles.label}>Password</label>
                                    <div className={styles.inputWrap}>
                                        <span className={styles.inputIcon}><IconLock /></span>
                                        <input id="reg-password" type={showPass ? 'text' : 'password'}
                                            className={styles.input} value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            placeholder="Min 6 characters" autoComplete="new-password" required
                                            style={{ paddingRight: 46 }} />
                                        <button type="button" className={styles.eyeBtn} tabIndex={-1}
                                            onClick={() => setShowPass(v => !v)}>
                                            {showPass ? <IconEyeOff /> : <IconEye />}
                                        </button>
                                    </div>
                                </div>

                                {/* Strength bar */}
                                {password && (
                                    <div className={regStyles.strengthWrap}>
                                        <div className={regStyles.strengthBars}>
                                            {[1, 2, 3, 4].map(i => (
                                                <div key={i} className={regStyles.strengthBar}
                                                    style={{ background: i <= strength ? STRENGTH_COLORS[strength] : 'rgba(255,255,255,0.07)' }} />
                                            ))}
                                        </div>
                                        <span className={regStyles.strengthLabel}
                                            style={{ color: STRENGTH_COLORS[strength] }}>
                                            {STRENGTH_LABELS[strength]}
                                        </span>
                                    </div>
                                )}

                                {/* Confirm */}
                                <div className={`${styles.field} ${styles.delay4}`}>
                                    <label htmlFor="reg-confirm" className={styles.label}>Confirm password</label>
                                    <div className={styles.inputWrap}>
                                        <span className={styles.inputIcon}><IconLock /></span>
                                        <input id="reg-confirm" type="password" className={styles.input}
                                            value={confirm} onChange={e => setConfirm(e.target.value)}
                                            placeholder="Re-enter password" autoComplete="new-password" required
                                            style={{
                                                paddingRight: 46,
                                                borderColor: confirm
                                                    ? confirm === password ? 'rgba(16,185,129,0.6)' : 'rgba(239,68,68,0.5)'
                                                    : undefined,
                                            }} />
                                        {confirm && (
                                            <span className={regStyles.confirmIcon}
                                                style={{ color: confirm === password ? '#10b981' : '#ef4444' }}>
                                                {confirm === password
                                                    ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                                    : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                                }
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Submit */}
                                <button type="submit" id="register-submit" className={styles.submitBtn}
                                    style={{
                                        background: loading ? 'rgba(139,92,246,0.5)' : 'linear-gradient(135deg, #8b5cf6, #10b981)',
                                        boxShadow: '0 4px 24px rgba(16,185,129,0.35), 0 4px 24px rgba(139,92,246,0.2)',
                                        marginTop: 22,
                                    }}
                                    disabled={loading}>
                                    {loading ? <><Spinner /> Creating account…</> : <>Create Account <IconArrow /></>}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Sign in link */}
                    <div className={styles.divider}>
                        <span className={styles.dividerLine} />
                        <span className={styles.dividerText}>Already have an account?</span>
                        <span className={styles.dividerLine} />
                    </div>

                    <Link to="/login" className={styles.registerBtn}>
                        Sign in instead →
                    </Link>

                    <p className={styles.privacyNote}>
                        🔒 Your data is always private &amp; end-to-end encrypted.
                    </p>
                </div>
            </main>
        </div>
    );
}
