import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div style={{
            minHeight: '60vh', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', textAlign: 'center',
            padding: '40px 24px', animation: 'fadeInUp 0.5s ease-out',
        }}>
            {/* Glowing number */}
            <div style={{
                fontSize: '7rem', fontWeight: 900, lineHeight: 1,
                background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                filter: 'drop-shadow(0 0 40px rgba(139,92,246,0.4))',
                marginBottom: 12, letterSpacing: '-0.04em',
            }}>404</div>

            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f0f2ff', marginBottom: 10, letterSpacing: '-0.02em' }}>
                Page not found
            </h1>
            <p style={{ color: '#8b93b5', fontSize: '0.9rem', maxWidth: 360, lineHeight: 1.7, marginBottom: 32 }}>
                This page doesn't exist, or you may have followed a broken link.
                Head back to the app — Mia and your journal are waiting. 💜
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                <button onClick={() => navigate(-1)} style={{
                    padding: '11px 24px', borderRadius: 12,
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#d4d8f0', fontWeight: 600, fontSize: '0.9rem',
                    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
                }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                >← Go Back</button>

                <button onClick={() => navigate('/')} style={{
                    padding: '11px 24px', borderRadius: 12, border: 'none',
                    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                    color: 'white', fontWeight: 700, fontSize: '0.9rem',
                    cursor: 'pointer', fontFamily: 'inherit',
                    boxShadow: '0 4px 20px rgba(139,92,246,0.4)', transition: 'all 0.2s',
                }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(139,92,246,0.5)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(139,92,246,0.4)'; }}
                >🏠 Go Home</button>
            </div>

            {/* Decorative orbs */}
            <div style={{ position: 'fixed', top: '20%', left: '10%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'fixed', bottom: '20%', right: '10%', width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        </div>
    );
}
