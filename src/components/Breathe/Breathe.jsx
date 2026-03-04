import React, { useState, useEffect, useCallback, useRef } from 'react';

/* ─── Techniques ─── */
const TECHNIQUES = [
    {
        id: '478', name: '4-7-8 Breathing', emoji: '🌙',
        color: '#8b5cf6', glow: 'rgba(139,92,246,0.4)',
        tagline: 'Sleep & anxiety relief',
        description: 'Used to reduce anxiety and help you fall asleep faster.',
        phases: [
            { label: 'Inhale', duration: 4, scale: 1, instruction: 'Breathe in slowly through your nose…' },
            { label: 'Hold', duration: 7, scale: 1, instruction: 'Hold gently, feel the stillness…' },
            { label: 'Exhale', duration: 8, scale: 0, instruction: 'Release slowly through your mouth…' },
        ],
    },
    {
        id: 'box', name: 'Box Breathing', emoji: '🟦',
        color: '#06b6d4', glow: 'rgba(6,182,212,0.4)',
        tagline: 'Focus & stress control',
        description: 'Used by Navy SEALs to maintain calm and focus under pressure.',
        phases: [
            { label: 'Inhale', duration: 4, scale: 1, instruction: 'Inhale deeply through your nose…' },
            { label: 'Hold', duration: 4, scale: 1, instruction: 'Hold. Feel fully present…' },
            { label: 'Exhale', duration: 4, scale: 0, instruction: 'Exhale completely, let go…' },
            { label: 'Hold', duration: 4, scale: 0, instruction: 'Pause. Empty and at peace…' },
        ],
    },
    {
        id: '555', name: '5-5-5 Calm', emoji: '🌿',
        color: '#10b981', glow: 'rgba(16,185,129,0.4)',
        tagline: 'Daily stress relief',
        description: 'Simple and effective for everyday stress and grounding.',
        phases: [
            { label: 'Inhale', duration: 5, scale: 1, instruction: 'Breathe in, fill your lungs…' },
            { label: 'Hold', duration: 5, scale: 1, instruction: 'Hold. You are safe…' },
            { label: 'Exhale', duration: 5, scale: 0, instruction: 'Breathe out all the tension…' },
        ],
    },
];

const PHASE_COLORS = { Inhale: null, Hold: '#f59e0b', Exhale: '#6366f1' };
const getPhaseColor = (label, techColor) => PHASE_COLORS[label] ?? techColor;

const R = 110; // SVG circle radius
const CX = 140; // SVG center X
const CY = 140; // SVG center Y
const TRACK_R = 125;

/* ─── Ripple ring (purely decorative) ──────────────────────────── */
function RippleRings({ color, active }) {
    return (
        <>
            {[1, 2, 3].map(i => (
                <circle key={i}
                    cx={CX} cy={CY} r={R + i * 18}
                    fill="none" stroke={color} strokeWidth="1"
                    strokeOpacity={active ? 0.12 / i : 0}
                    style={{
                        transition: `stroke-opacity ${0.6 + i * 0.2}s ease`,
                        animation: active ? `ripple${i} ${2 + i * 0.8}s ease-out infinite` : 'none',
                    }}
                />
            ))}
        </>
    );
}

/* ─── Arc progress (draws around the outer track) ─────────────── */
function ArcProgress({ pct, color }) {
    const circ = 2 * Math.PI * TRACK_R;
    return (
        <circle cx={CX} cy={CY} r={TRACK_R}
            fill="none" stroke={color} strokeWidth="3"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - pct)}
            strokeLinecap="round"
            style={{
                transform: 'rotate(-90deg)',
                transformOrigin: `${CX}px ${CY}px`,
                transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease',
                filter: `drop-shadow(0 0 6px ${color}80)`,
            }}
        />
    );
}

/* ═══════════════════════════════════════════════════════════════ */
export default function Breathe() {
    const [selected, setSelected] = useState(TECHNIQUES[0]);
    const [running, setRunning] = useState(false);
    const [phaseIdx, setPhaseIdx] = useState(0);
    const [countdown, setCountdown] = useState(TECHNIQUES[0].phases[0].duration);
    const [sessions, setSessions] = useState(0);
    const [totalSeconds, setTotalSeconds] = useState(0);
    const [circleR, setCircleR] = useState(70);
    const [finished, setFinished] = useState(false);
    const [techHover, setTechHover] = useState(null);
    const timerRef = useRef(null);

    const phase = selected.phases[phaseIdx];
    const phaseColor = getPhaseColor(phase.label, selected.color);
    const totalDuration = selected.phases.reduce((s, p) => s + p.duration, 0);
    const elapsed = selected.phases.slice(0, phaseIdx).reduce((s, p) => s + p.duration, 0) + (phase.duration - countdown);
    const cyclePct = elapsed / totalDuration;

    /* Reset */
    const reset = useCallback((tech = selected) => {
        clearInterval(timerRef.current);
        setRunning(false); setPhaseIdx(0);
        setCountdown(tech.phases[0].duration);
        setCircleR(tech.phases[0].scale === 1 ? 100 : 70);
        setFinished(false);
    }, [selected]);

    const selectTechnique = (tech) => { setSelected(tech); reset(tech); };

    /* Breathing timer */
    useEffect(() => {
        if (!running) return;
        timerRef.current = setInterval(() => {
            setCountdown(c => {
                if (c <= 1) {
                    setPhaseIdx(prev => {
                        const next = (prev + 1) % selected.phases.length;
                        if (next === 0) {
                            setSessions(s => {
                                const ns = s + 1;
                                if (ns >= 3) { setRunning(false); setFinished(true); }
                                return ns;
                            });
                        }
                        const np = selected.phases[next];
                        setCircleR(np.label === 'Inhale' ? 100 : np.label === 'Exhale' ? 70 : null);
                        return np.duration;
                    });
                    return 0;
                }
                return c - 1;
            });
            setTotalSeconds(s => s + 1);
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, [running, selected]);

    /* Circle size update per phase */
    useEffect(() => {
        if (!running) return;
        if (phase.label === 'Inhale') setCircleR(100);
        else if (phase.label === 'Exhale') setCircleR(70);
        // Hold keeps prev
    }, [phaseIdx, running]);

    const handleStart = () => {
        if (running) { reset(); }
        else { setRunning(true); setCircleR(100); setFinished(false); setSessions(0); setTotalSeconds(0); }
    };

    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;

    return (
        <div style={{ maxWidth: 860, margin: '0 auto', animation: 'fadeInUp 0.5s ease-out' }}>

            {/* ─── Header ─── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
                <div style={{
                    width: 48, height: 48, borderRadius: 14,
                    background: `${selected.color}20`, border: `1px solid ${selected.color}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem',
                    transition: 'all 0.3s',
                    boxShadow: running ? `0 0 24px ${selected.glow}` : 'none',
                }}>🌬️</div>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f0f2ff', letterSpacing: '-0.03em', lineHeight: 1, margin: 0 }}>
                        Breathe
                    </h1>
                    <p style={{ color: '#8b93b5', fontSize: '0.85rem', margin: '4px 0 0' }}>
                        Guided breathing for a calmer, clearer mind
                    </p>
                </div>
                {/* Timer pill */}
                {totalSeconds > 0 && (
                    <div style={{
                        marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8,
                        padding: '7px 16px', borderRadius: 99,
                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
                    }}>
                        <span style={{ fontSize: '0.72rem', color: '#4a5378', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Time</span>
                        <span style={{ fontSize: '1rem', fontWeight: 800, color: selected.color, fontVariantNumeric: 'tabular-nums' }}>
                            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
                        </span>
                    </div>
                )}
            </div>

            {/* ─── Technique selector ─── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 28 }}>
                {TECHNIQUES.map(tech => {
                    const isSelected = selected.id === tech.id;
                    return (
                        <button key={tech.id}
                            onClick={() => selectTechnique(tech)}
                            onMouseEnter={() => setTechHover(tech.id)}
                            onMouseLeave={() => setTechHover(null)}
                            style={{
                                all: 'unset', cursor: 'pointer',
                                display: 'flex', flexDirection: 'column', gap: 8,
                                padding: '18px 20px', borderRadius: 18, textAlign: 'left',
                                background: isSelected ? `${tech.color}14` : techHover === tech.id ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.03)',
                                border: `1px solid ${isSelected ? tech.color + '55' : 'rgba(255,255,255,0.07)'}`,
                                transition: 'all 0.22s cubic-bezier(0.4,0,0.2,1)',
                                transform: isSelected ? 'scale(1.02)' : techHover === tech.id ? 'translateY(-2px)' : 'none',
                                boxShadow: isSelected ? `0 8px 32px ${tech.color}25` : 'none',
                            }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: '1.3rem' }}>{tech.emoji}</span>
                                <div style={{ width: 7, height: 7, borderRadius: '50%', background: isSelected ? tech.color : 'rgba(255,255,255,0.14)', transition: 'background 0.3s', boxShadow: isSelected ? `0 0 8px ${tech.color}` : 'none' }} />
                            </div>
                            <div style={{ fontSize: '0.87rem', fontWeight: 700, color: isSelected ? tech.color : '#f0f2ff', transition: 'color 0.2s' }}>{tech.name}</div>
                            <div style={{ fontSize: '0.7rem', color: '#a78bfa', fontWeight: 600 }}>{tech.tagline}</div>
                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
                                {tech.phases.map((p, i) => (
                                    <span key={i} style={{
                                        fontSize: '0.63rem', fontWeight: 700, padding: '2px 7px', borderRadius: 8,
                                        background: `${getPhaseColor(p.label, tech.color)}18`,
                                        color: getPhaseColor(p.label, tech.color),
                                        border: `1px solid ${getPhaseColor(p.label, tech.color)}28`,
                                    }}>{p.label} {p.duration}s</span>
                                ))}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* ─── Main breathing area ─── */}
            {finished ? (
                /* ── Celebration / finish card ── */
                <div style={{
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 28, padding: '60px 24px', textAlign: 'center', marginBottom: 24,
                    animation: 'scaleIn 0.5s cubic-bezier(0.4,0,0.2,1)',
                }}>
                    <div style={{ fontSize: '4rem', marginBottom: 16 }}>🎉</div>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f0f2ff', marginBottom: 8, letterSpacing: '-0.03em' }}>
                        Session Complete
                    </h2>
                    <p style={{ color: '#8b93b5', fontSize: '0.95rem', marginBottom: 28, lineHeight: 1.6 }}>
                        You completed <strong style={{ color: selected.color }}>3 cycles</strong> of {selected.name}. <br />
                        Take a moment to notice how you feel. 🌿
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 36 }}>
                        {[
                            { label: 'Cycles', value: '3', icon: '🔄', color: selected.color },
                            { label: 'Duration', value: `${mins}:${String(secs).padStart(2, '0')}`, icon: '⏱', color: '#06b6d4' },
                            { label: 'Technique', value: selected.name.split(' ')[0], icon: selected.emoji, color: '#10b981' },
                        ].map((s, i) => (
                            <div key={i} style={{
                                padding: '16px 20px', borderRadius: 16, textAlign: 'center',
                                background: `${s.color}0d`, border: `1px solid ${s.color}28`,
                                minWidth: 100,
                            }}>
                                <div style={{ fontSize: '1.3rem', marginBottom: 6 }}>{s.icon}</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                                <div style={{ fontSize: '0.7rem', color: '#8b93b5', marginTop: 2 }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => reset()} style={{
                        padding: '13px 36px', borderRadius: 50, border: 'none',
                        background: `linear-gradient(135deg, ${selected.color}, ${selected.color}bb)`,
                        color: 'white', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
                        fontFamily: 'inherit', boxShadow: `0 6px 28px ${selected.glow}`,
                        transition: 'all 0.22s',
                    }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = `0 10px 40px ${selected.glow}`; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = `0 6px 28px ${selected.glow}`; }}
                    >
                        ✨ Go Again
                    </button>
                </div>
            ) : (
                <div style={{
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 28, padding: '40px 24px', textAlign: 'center', marginBottom: 24,
                    position: 'relative', overflow: 'hidden',
                }}>
                    {/* Ambient glow */}
                    <div style={{
                        position: 'absolute', left: '50%', top: '50%',
                        transform: 'translate(-50%,-50%)',
                        width: 420, height: 420, borderRadius: '50%',
                        background: `radial-gradient(ellipse, ${phaseColor}0a 0%, transparent 65%)`,
                        transition: `background 1s ease`,
                        pointerEvents: 'none',
                    }} />

                    {/* SVG breathing circle */}
                    <div style={{ display: 'inline-block', position: 'relative', marginBottom: 28 }}>
                        <svg width={CX * 2} height={CY * 2} viewBox={`0 0 ${CX * 2} ${CY * 2}`} style={{ overflow: 'visible' }}>
                            {/* Outer track */}
                            <circle cx={CX} cy={CY} r={TRACK_R} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="3" />

                            {/* Ripple rings */}
                            <RippleRings color={phaseColor} active={running} />

                            {/* Arc progress */}
                            {running && <ArcProgress pct={cyclePct} color={phaseColor} />}

                            {/* Outer glow ring */}
                            <circle cx={CX} cy={CY} r={circleR + 14} fill="none"
                                stroke={phaseColor} strokeWidth="1.5"
                                strokeOpacity={running ? 0.22 : 0}
                                style={{ transition: `r ${phase.label === 'Hold' ? 0.4 : phase.duration * 0.85}s ease-in-out, stroke-opacity 0.5s` }}
                            />

                            {/* Main animated breathing circle */}
                            <circle cx={CX} cy={CY} r={circleR}
                                fill={`${phaseColor}14`}
                                stroke={phaseColor}
                                strokeWidth={running ? 2.5 : 1.5}
                                strokeOpacity={running ? 1 : 0.3}
                                style={{
                                    transition: `r ${phase.label === 'Hold' ? 0.4 : phase.duration * 0.85}s ease-in-out, fill 0.5s, stroke 0.5s`,
                                    filter: running ? `drop-shadow(0 0 12px ${phaseColor}70)` : 'none',
                                }}
                            />
                        </svg>

                        {/* Center text */}
                        <div style={{
                            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                            textAlign: 'center', pointerEvents: 'none', width: 140,
                        }}>
                            {running ? (
                                <>
                                    <div style={{
                                        fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.16em',
                                        textTransform: 'uppercase', color: phaseColor,
                                        marginBottom: 4, transition: 'color 0.5s',
                                    }}>{phase.label}</div>
                                    <div style={{
                                        fontSize: '3.2rem', fontWeight: 800, color: '#f0f2ff',
                                        lineHeight: 1, fontVariantNumeric: 'tabular-nums',
                                    }}>{countdown}</div>
                                    <div style={{ fontSize: '0.65rem', color: '#8b93b5', marginTop: 2 }}>seconds</div>
                                </>
                            ) : (
                                <>
                                    <div style={{ fontSize: '2.2rem', marginBottom: 6 }}>{selected.emoji}</div>
                                    <div style={{ fontSize: '0.82rem', color: '#8b93b5', fontWeight: 500 }}>{selected.name}</div>
                                    <div style={{ fontSize: '0.7rem', color: '#4a5378', marginTop: 4 }}>tap to begin</div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Instruction ribbon */}
                    {running && (
                        <div style={{
                            fontSize: '0.88rem', color: '#8b93b5', fontStyle: 'italic',
                            marginBottom: 24, minHeight: 22, transition: 'opacity 0.4s',
                            letterSpacing: '0.01em',
                        }}>
                            {phase.instruction}
                        </div>
                    )}

                    {/* Phase indicators when running */}
                    {running && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 28 }}>
                            {selected.phases.map((p, i) => {
                                const pc = getPhaseColor(p.label, selected.color);
                                return (
                                    <div key={i} style={{
                                        display: 'flex', alignItems: 'center', gap: 6,
                                        padding: '6px 14px', borderRadius: 20,
                                        background: i === phaseIdx ? `${pc}18` : 'rgba(255,255,255,0.03)',
                                        border: `1px solid ${i === phaseIdx ? pc + '55' : 'rgba(255,255,255,0.07)'}`,
                                        transition: 'all 0.4s',
                                    }}>
                                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: pc, opacity: i === phaseIdx ? 1 : 0.25, boxShadow: i === phaseIdx ? `0 0 6px ${pc}` : 'none', transition: 'all 0.4s' }} />
                                        <span style={{ fontSize: '0.74rem', fontWeight: 600, color: i === phaseIdx ? pc : '#4a5378', transition: 'color 0.4s' }}>
                                            {p.label} {p.duration}s
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Cycles progress */}
                    {running && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
                            {[1, 2, 3].map(i => (
                                <div key={i} style={{
                                    width: 10, height: 10, borderRadius: '50%',
                                    background: sessions >= i ? selected.color : 'rgba(255,255,255,0.12)',
                                    boxShadow: sessions >= i ? `0 0 8px ${selected.glow}` : 'none',
                                    transition: 'all 0.4s',
                                }} />
                            ))}
                            <span style={{ fontSize: '0.72rem', color: '#4a5378', marginLeft: 4 }}>
                                {sessions} / 3 cycles
                            </span>
                        </div>
                    )}

                    {/* Start/Stop button */}
                    <button onClick={handleStart} style={{
                        padding: '14px 52px', borderRadius: 50, border: running ? '1px solid rgba(239,68,68,0.3)' : 'none',
                        background: running
                            ? 'rgba(239,68,68,0.12)'
                            : `linear-gradient(135deg, ${selected.color}, ${selected.color}bb)`,
                        color: running ? '#f87171' : 'white',
                        fontWeight: 700, fontSize: '1rem', cursor: 'pointer', fontFamily: 'inherit',
                        boxShadow: running ? 'none' : `0 6px 28px ${selected.glow}`,
                        transition: 'all 0.3s',
                    }}
                        onMouseEnter={e => { if (!running) { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = `0 10px 40px ${selected.glow}`; } }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = running ? 'none' : `0 6px 28px ${selected.glow}`; }}
                    >
                        {running ? '⏹ Stop' : '▶ Start Session'}
                    </button>
                </div>
            )}

            {/* ─── Bottom stats + tip ─── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 14 }}>
                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {[
                        { label: 'Cycles done', value: sessions, icon: '🔄', color: selected.color },
                        { label: 'Time', value: `${mins}:${String(secs).padStart(2, '0')}`, icon: '⏱', color: '#06b6d4' },
                    ].map((s, i) => (
                        <div key={i} style={{
                            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                            borderRadius: 16, padding: '16px', textAlign: 'center',
                        }}>
                            <div style={{ fontSize: '1.2rem', marginBottom: 6 }}>{s.icon}</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: s.color, fontVariantNumeric: 'tabular-nums' }}>{s.value}</div>
                            <div style={{ fontSize: '0.7rem', color: '#8b93b5', marginTop: 2 }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Tip card */}
                <div style={{
                    padding: '20px 22px', borderRadius: 18,
                    background: `${selected.color}08`, border: `1px solid ${selected.color}20`,
                    display: 'flex', gap: 14, alignItems: 'flex-start',
                    transition: 'all 0.3s',
                }}>
                    <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>💡</span>
                    <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#c4b5fd', marginBottom: 6 }}>
                            {selected.name} — How to get the most
                        </div>
                        <p style={{ color: '#8b93b5', fontSize: '0.8rem', lineHeight: 1.65, margin: 0 }}>
                            {selected.description} Find a comfortable position, breathe through your nose, and aim for
                            at least 3 full cycles. Practice daily for lasting benefits.
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes ripple1 { 0%,100%{ r: ${R + 18}; stroke-opacity: 0.12; } 50%{ r: ${R + 30}; stroke-opacity: 0; } }
        @keyframes ripple2 { 0%,100%{ r: ${R + 36}; stroke-opacity: 0.07; } 50%{ r: ${R + 52}; stroke-opacity: 0; } }
        @keyframes ripple3 { 0%,100%{ r: ${R + 54}; stroke-opacity: 0.04; } 50%{ r: ${R + 72}; stroke-opacity: 0; } }
      `}</style>
        </div>
    );
}
