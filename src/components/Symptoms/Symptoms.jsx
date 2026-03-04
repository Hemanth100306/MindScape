import React, { useState } from 'react';

const questions = [
  { q: 'Over the past 2 weeks, how often have you felt down, depressed, or hopeless?', category: 'depression' },
  { q: 'How often have you had little interest or pleasure in doing things?', category: 'depression' },
  { q: 'How often have you felt nervous, anxious, or on edge?', category: 'anxiety' },
  { q: 'How often have you been unable to stop or control worrying?', category: 'anxiety' },
  { q: 'How often have you had trouble falling or staying asleep, or sleeping too much?', category: 'sleep' },
  { q: 'How often have you felt tired or had little energy?', category: 'sleep' },
  { q: 'How often have you had trouble concentrating on things?', category: 'cognitive' },
  { q: 'How often have you avoided social situations or felt uncomfortable in them?', category: 'social' },
  { q: 'How often have you felt bad about yourself or felt that you are a failure?', category: 'self' },
  { q: 'How often have you experienced physical symptoms like headaches or muscle tension?', category: 'physical' },
];

const options = [
  { value: 0, label: 'Not at all', color: '#10b981' },
  { value: 1, label: 'Several days', color: '#eab308' },
  { value: 2, label: 'More than half', color: '#f97316' },
  { value: 3, label: 'Nearly every day', color: '#ef4444' },
];

const categoryMeta = {
  depression: { label: 'Mood & Depression', icon: '💜', color: '#8b5cf6' },
  anxiety: { label: 'Anxiety', icon: '🌊', color: '#06b6d4' },
  sleep: { label: 'Sleep Quality', icon: '🌙', color: '#6366f1' },
  cognitive: { label: 'Focus & Cognition', icon: '🧠', color: '#ec4899' },
  social: { label: 'Social Well-being', icon: '🤝', color: '#10b981' },
  self: { label: 'Self-Image', icon: '⭐', color: '#f59e0b' },
  physical: { label: 'Physical Health', icon: '💪', color: '#34d399' },
};

const Symptoms = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [complete, setComplete] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  const handleAnswer = (val) => setSelectedOption(val);

  const handleNext = () => {
    if (selectedOption === null) return;
    const updated = { ...answers, [step]: selectedOption };
    setAnswers(updated);
    setSelectedOption(answers[step + 1] ?? null);
    if (step === questions.length - 1) {
      setComplete(true);
    } else {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
    setSelectedOption(answers[step - 1] ?? null);
  };

  const handleRestart = () => { setStep(0); setAnswers({}); setComplete(false); setSelectedOption(null); };

  const totalScore = Object.values(answers).reduce((s, v) => s + v, 0);
  const maxScore = questions.length * 3;
  const pct = (totalScore / maxScore) * 100;

  const getOverall = () => {
    if (pct <= 20) return { label: 'Minimal Distress', color: '#10b981', emoji: '✨', desc: 'Your responses indicate minimal levels of distress. Keep up your healthy habits!' };
    if (pct <= 40) return { label: 'Mild Distress', color: '#22c55e', emoji: '🌱', desc: 'Mild levels detected. Consider adding some self-care strategies to your routine.' };
    if (pct <= 60) return { label: 'Moderate Distress', color: '#eab308', emoji: '🌤️', desc: 'Moderate distress identified. Targeted coping strategies can help significantly.' };
    if (pct <= 80) return { label: 'Elevated Distress', color: '#f97316', emoji: '⚠️', desc: 'Elevated levels detected. We recommend reaching out to a mental health professional.' };
    return { label: 'High Distress', color: '#ef4444', emoji: '🆘', desc: 'High distress levels. Please seek professional support. You are not alone.' };
  };

  const getCategoryScore = (cat) => {
    const related = questions.reduce((acc, q, i) => { if (q.category === cat) acc.push(i); return acc; }, []);
    const sum = related.reduce((s, i) => s + (answers[i] || 0), 0);
    return (sum / (related.length * 3)) * 100;
  };

  const overall = getOverall();
  const progress = ((step + 1) / questions.length) * 100;

  if (complete) {
    const categories = Object.keys(categoryMeta).map(cat => ({
      ...categoryMeta[cat], key: cat, score: getCategoryScore(cat),
    }));

    return (
      <div style={{ maxWidth: 720, margin: '0 auto', animation: 'fadeInUp 0.5s ease-out' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>{overall.emoji}</div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f0f2ff', letterSpacing: '-0.03em', marginBottom: 8 }}>Assessment Complete</h1>
          <div style={{
            display: 'inline-block', padding: '6px 18px', borderRadius: 20,
            background: `${overall.color}20`, border: `1px solid ${overall.color}50`,
            color: overall.color, fontWeight: 700, fontSize: '0.9rem',
          }}>
            {overall.label}
          </div>
        </div>

        {/* Score */}
        <div style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20, padding: '28px', marginBottom: 20,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ color: '#8b93b5', fontSize: '0.85rem', fontWeight: 600 }}>Overall Score</span>
            <span style={{ color: overall.color, fontWeight: 800, fontSize: '1.1rem' }}>{totalScore}/{maxScore}</span>
          </div>
          <div style={{ height: 10, borderRadius: 5, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', marginBottom: 16 }}>
            <div style={{ height: '100%', borderRadius: 5, background: overall.color, width: `${pct}%`, transition: 'width 1s ease', boxShadow: `0 0 12px ${overall.color}80` }} />
          </div>
          <p style={{ color: '#8b93b5', fontSize: '0.9rem', lineHeight: 1.7 }}>{overall.desc}</p>
        </div>

        {/* Category breakdown */}
        <div style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20, padding: '28px', marginBottom: 20,
        }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#f0f2ff', marginBottom: 20 }}>Category Breakdown</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {categories.map(cat => (
              <div key={cat.key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '1rem' }}>{cat.icon}</span>
                    <span style={{ color: '#f0f2ff', fontSize: '0.875rem', fontWeight: 600 }}>{cat.label}</span>
                  </div>
                  <span style={{
                    fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: 10,
                    background: cat.score < 33 ? 'rgba(16,185,129,0.15)' : cat.score < 66 ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                    color: cat.score < 33 ? '#10b981' : cat.score < 66 ? '#f59e0b' : '#ef4444',
                  }}>
                    {cat.score < 33 ? 'Low' : cat.score < 66 ? 'Moderate' : 'High'}
                  </span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 3,
                    background: cat.score < 33 ? '#10b981' : cat.score < 66 ? '#f59e0b' : '#ef4444',
                    width: `${cat.score}%`, transition: 'width 1.2s ease',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div style={{
          padding: '16px 20px', borderRadius: 14,
          background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
          color: '#fcd34d', fontSize: '0.82rem', lineHeight: 1.6, marginBottom: 20,
        }}>
          ⚠️ This is a screening tool, not a clinical diagnosis. For persistent symptoms, please consult a qualified mental health professional.
        </div>

        <button
          onClick={handleRestart}
          style={{
            width: '100%', padding: '14px', borderRadius: 14, border: 'none',
            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: 'white',
            fontWeight: 700, fontSize: '1rem', cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: '0 4px 20px rgba(139,92,246,0.4)', transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(139,92,246,0.6)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(139,92,246,0.4)'; }}
        >
          Retake Assessment
        </button>
      </div>
    );
  }

  const cur = questions[step];

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', animation: 'fadeInUp 0.5s ease-out' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
        }}>🧠</div>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f0f2ff', letterSpacing: '-0.03em', lineHeight: 1 }}>Mental Health Assessment</h1>
          <p style={{ color: '#8b93b5', fontSize: '0.85rem' }}>Answer honestly to get personalized insights</p>
        </div>
      </div>

      {/* Progress */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ color: '#8b93b5', fontSize: '0.8rem', fontWeight: 600 }}>Question {step + 1} of {questions.length}</span>
          <span style={{ color: '#8b5cf6', fontSize: '0.8rem', fontWeight: 700 }}>{Math.round(progress)}%</span>
        </div>
        <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 3, background: 'linear-gradient(90deg, #8b5cf6, #ec4899)',
            width: `${progress}%`, transition: 'width 0.5s ease',
            boxShadow: '0 0 10px rgba(139,92,246,0.5)',
          }} />
        </div>
        {/* Step dots */}
        <div style={{ display: 'flex', gap: 4, marginTop: 10, justifyContent: 'center' }}>
          {questions.map((_, i) => (
            <div key={i} style={{
              width: i === step ? 20 : 6, height: 6, borderRadius: 3,
              background: i < step ? '#10b981' : i === step ? '#8b5cf6' : 'rgba(255,255,255,0.1)',
              transition: 'all 0.3s ease',
            }} />
          ))}
        </div>
      </div>

      {/* Question card */}
      <div style={{
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 24, padding: '36px', marginBottom: 16,
        boxShadow: '0 8px 40px rgba(0,0,0,0.2)',
        animation: 'scaleIn 0.3s ease-out',
        key: step,
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 12px', borderRadius: 12,
          background: `${categoryMeta[cur.category]?.color}20`,
          border: `1px solid ${categoryMeta[cur.category]?.color}40`,
          marginBottom: 20,
        }}>
          <span style={{ fontSize: '0.85rem' }}>{categoryMeta[cur.category]?.icon}</span>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: categoryMeta[cur.category]?.color, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {categoryMeta[cur.category]?.label}
          </span>
        </div>

        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f0f2ff', lineHeight: 1.6, marginBottom: 28 }}>
          {cur.q}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {options.map(opt => {
            const selected = selectedOption === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => handleAnswer(opt.value)}
                style={{
                  all: 'unset', display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 18px', borderRadius: 14, cursor: 'pointer',
                  background: selected ? `${opt.color}15` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${selected ? opt.color + '60' : 'rgba(255,255,255,0.07)'}`,
                  transition: 'all 0.2s',
                  transform: selected ? 'scale(1.01)' : 'scale(1)',
                }}
                onMouseEnter={e => { if (!selected) { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; } }}
                onMouseLeave={e => { if (!selected) { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; } }}
              >
                <div style={{
                  width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                  border: `2px solid ${selected ? opt.color : 'rgba(255,255,255,0.2)'}`,
                  background: selected ? opt.color : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                }}>
                  {selected && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} />}
                </div>
                <span style={{ color: selected ? opt.color : '#8b93b5', fontWeight: selected ? 600 : 400, fontSize: '0.9rem', transition: 'all 0.2s' }}>
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={handleBack}
          disabled={step === 0}
          style={{
            flex: 1, padding: '13px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)',
            background: 'transparent', color: step === 0 ? '#2a3050' : '#8b93b5',
            cursor: step === 0 ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: '0.9rem',
            transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={selectedOption === null}
          style={{
            flex: 2, padding: '13px', borderRadius: 14, border: 'none',
            background: selectedOption !== null ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : 'rgba(255,255,255,0.06)',
            color: selectedOption !== null ? 'white' : '#4a5378',
            cursor: selectedOption === null ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: '0.95rem',
            transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            boxShadow: selectedOption !== null ? '0 4px 20px rgba(139,92,246,0.3)' : 'none',
          }}
          onMouseEnter={e => { if (selectedOption !== null) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(139,92,246,0.5)'; } }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = selectedOption !== null ? '0 4px 20px rgba(139,92,246,0.3)' : 'none'; }}
        >
          {step === questions.length - 1 ? 'View Results' : 'Next Question'}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Symptoms;