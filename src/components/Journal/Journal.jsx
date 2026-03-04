import React, { useState, useEffect } from 'react';
import { useAuth } from '../Auth/AuthProvider';
import {
  subscribeToJournal,
  addJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
} from '../../services/localStorageService';

const tags = ['Reflection', 'Gratitude', 'Goals', 'Anxiety', 'Happy', 'Tough Day', 'Growth'];
const tagColors = {
  Reflection: '#8b5cf6', Gratitude: '#10b981', Goals: '#06b6d4',
  Anxiety: '#f59e0b', Happy: '#ec4899', 'Tough Day': '#ef4444', Growth: '#34d399',
};

const formatDate = (ts) => {
  if (!ts) return '—';
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};
const formatTime = (ts) => {
  if (!ts) return '';
  return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

const Journal = () => {
  const { currentUser } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tag, setTag] = useState('Reflection');
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('All');
  const [editEntry, setEditEntry] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!currentUser) return;
    const unsub = subscribeToJournal(currentUser.uid, (data) => {
      setEntries(data);
      setLoading(false);
    });
    return unsub;
  }, [currentUser]);

  const showToast = (msg, color = '#10b981') => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  const exportData = () => {
    if (entries.length === 0) { showToast('No entries to export', '#f59e0b'); return; }
    const data = {
      app: 'MindScape Journal',
      exportedAt: new Date().toISOString(),
      user: currentUser?.email,
      totalEntries: entries.length,
      entries: entries.map(e => ({
        title: e.title,
        content: e.content,
        tag: e.tag,
        date: new Date(e.createdAt).toISOString(),
      })),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mindscape-journal-${new Date().toLocaleDateString('en-CA')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('✓ Journal exported!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    try {
      await addJournalEntry(currentUser.uid, { title, content, tag });
      setTitle(''); setContent(''); setTag('Reflection');
      showToast('✓ Entry saved!');
    } catch {
      showToast('Failed to save entry', '#ef4444');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteJournalEntry(id, currentUser.uid);
      showToast('Entry deleted');
    } catch {
      showToast('Failed to delete', '#ef4444');
    }
  };

  const handleEdit = (entry) => {
    setEditEntry({ id: entry.id, title: entry.title, content: entry.content });
    setShowEdit(true);
  };

  const handleSaveEdit = async () => {
    if (!editEntry.title.trim() || !editEntry.content.trim()) return;
    try {
      await updateJournalEntry(editEntry.id, currentUser.uid, { title: editEntry.title, content: editEntry.content });
      setShowEdit(false);
      showToast('✓ Entry updated!');
    } catch {
      showToast('Failed to update', '#ef4444');
    }
  };

  const TAGS = ['All', 'Reflection', 'Gratitude', 'Anxiety', 'Sleep', 'Work', 'Personal', 'Other'];

  const filtered = entries.filter(e => {
    const matchSearch = !search || e.title?.toLowerCase().includes(search.toLowerCase()) || e.content?.toLowerCase().includes(search.toLowerCase()) || e.tag?.toLowerCase().includes(search.toLowerCase());
    const matchTag = tagFilter === 'All' || e.tag === tagFilter;
    return matchSearch && matchTag;
  });

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', animation: 'fadeInUp 0.5s ease-out', position: 'relative' }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          padding: '12px 20px', borderRadius: 12,
          background: toast.color === '#ef4444' ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
          border: `1px solid ${toast.color}50`,
          color: toast.color === '#ef4444' ? '#fca5a5' : '#6ee7b7',
          fontWeight: 600, fontSize: '0.875rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)', animation: 'scaleIn 0.3s ease-out', backdropFilter: 'blur(12px)',
        }}>{toast.msg}</div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#06b6d4',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" /><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
            </svg>
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f0f2ff', letterSpacing: '-0.03em', lineHeight: 1 }}>My Journal</h1>
            <p style={{ color: '#8b93b5', fontSize: '0.85rem' }}>
              {loading ? 'Loading…' : `${entries.length} ${entries.length === 1 ? 'entry' : 'entries'} · saved on this device`}
            </p>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#4a5378', pointerEvents: 'none' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text" placeholder="Search entries…" value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              padding: '9px 14px 9px 36px', borderRadius: 10,
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
              color: '#f0f2ff', fontSize: '0.85rem', outline: 'none',
              width: 200, fontFamily: 'inherit', transition: 'all 0.2s',
            }}
            onFocus={e => { e.target.style.borderColor = 'rgba(6,182,212,0.5)'; e.target.style.width = '240px'; }}
            onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.width = '200px'; }}
          />
        </div>

        {/* Export */}
        {entries.length > 0 && (
          <button onClick={exportData} title="Export journal as JSON" style={{
            padding: '9px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.04)', color: '#8b93b5', fontSize: '0.82rem',
            fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(6,182,212,0.4)'; e.currentTarget.style.color = '#06b6d4'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#8b93b5'; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export
          </button>
        )}
      </div>

      {/* Tag filter chips */}
      {entries.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {TAGS.map(t => (
            <button key={t} onClick={() => setTagFilter(t)} style={{
              padding: '6px 16px', borderRadius: 20, border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', fontSize: '0.78rem', fontWeight: 600, transition: 'all 0.2s',
              background: tagFilter === t ? 'linear-gradient(135deg,#06b6d4,#0891b2)' : 'rgba(255,255,255,0.05)',
              color: tagFilter === t ? 'white' : '#8b93b5',
              boxShadow: tagFilter === t ? '0 4px 12px rgba(6,182,212,0.35)' : 'none',
            }}>
              {t}{tagFilter === t && t !== 'All' ? ` (${filtered.length})` : ''}
            </button>
          ))}
        </div>
      )}

      {/* New entry form */}
      <div style={{
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 20, padding: '28px', marginBottom: 28,
      }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#f0f2ff', marginBottom: 20 }}>New Entry</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text" placeholder="Give this entry a title…"
            value={title} onChange={e => setTitle(e.target.value)}
            style={{
              width: '100%', padding: '12px 16px', borderRadius: 12,
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
              color: '#f0f2ff', fontSize: '0.95rem', fontWeight: 600,
              marginBottom: 12, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', transition: 'all 0.2s',
            }}
            onFocus={e => { e.target.style.borderColor = 'rgba(6,182,212,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(6,182,212,0.08)'; }}
            onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
          />
          <textarea
            placeholder="What's on your mind today? Write freely — this is your safe space…"
            value={content} onChange={e => setContent(e.target.value)} rows={5}
            style={{
              width: '100%', padding: '14px 16px', borderRadius: 12,
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
              color: '#f0f2ff', fontSize: '0.9rem', lineHeight: 1.7,
              marginBottom: 16, outline: 'none', resize: 'vertical',
              boxSizing: 'border-box', fontFamily: 'inherit', transition: 'all 0.2s',
            }}
            onFocus={e => { e.target.style.borderColor = 'rgba(6,182,212,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(6,182,212,0.08)'; }}
            onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
          />

          {/* Tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {tags.map(t => (
              <button key={t} type="button" onClick={() => setTag(t)} style={{
                padding: '5px 14px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 600,
                cursor: 'pointer', border: '1px solid', transition: 'all 0.2s', fontFamily: 'inherit',
                background: tag === t ? `${tagColors[t]}25` : 'transparent',
                borderColor: tag === t ? tagColors[t] : 'rgba(255,255,255,0.1)',
                color: tag === t ? tagColors[t] : '#8b93b5',
              }}>{t}</button>
            ))}
          </div>

          <button type="submit" disabled={saving || !title.trim() || !content.trim()} style={{
            padding: '11px 24px', borderRadius: 12,
            background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
            border: 'none', color: 'white', fontWeight: 700, fontSize: '0.9rem',
            cursor: (saving || !title.trim() || !content.trim()) ? 'not-allowed' : 'pointer',
            opacity: (!title.trim() || !content.trim()) ? 0.5 : 1,
            boxShadow: '0 4px 16px rgba(6,182,212,0.3)', transition: 'all 0.2s', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            {saving
              ? <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin-slow 0.7s linear infinite' }} />Saving…</>
              : <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>Save Entry</>
            }
          </button>
        </form>
      </div>

      {/* Entries list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#8b93b5' }}>
          <div style={{ width: 36, height: 36, border: '3px solid rgba(6,182,212,0.2)', borderTopColor: '#06b6d4', borderRadius: '50%', animation: 'spin-slow 0.8s linear infinite', margin: '0 auto 16px' }} />
          Loading your journal…
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 20, color: '#4a5378' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📓</div>
          <div style={{ fontSize: '1rem', fontWeight: 600, color: '#8b93b5', marginBottom: 4 }}>
            {search ? 'No entries match your search' : 'No entries yet'}
          </div>
          <div style={{ fontSize: '0.85rem' }}>
            {search ? 'Try a different search term' : 'Start writing your first journal entry above'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((entry) => (
            <div key={entry.id} style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 16, padding: '24px', transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(6,182,212,0.2)'; e.currentTarget.style.background = 'rgba(6,182,212,0.03)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f0f2ff' }}>{entry.title}</h3>
                    {entry.tag && (
                      <span style={{
                        padding: '2px 10px', borderRadius: 10, fontSize: '0.7rem', fontWeight: 600,
                        background: `${tagColors[entry.tag] || '#8b5cf6'}20`,
                        color: tagColors[entry.tag] || '#8b5cf6',
                        border: `1px solid ${tagColors[entry.tag] || '#8b5cf6'}40`,
                      }}>{entry.tag}</span>
                    )}
                  </div>
                  <div style={{ color: '#4a5378', fontSize: '0.75rem' }}>
                    {formatDate(entry.createdAt)} at {formatTime(entry.createdAt)}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => handleEdit(entry)} style={{
                    width: 34, height: 34, borderRadius: 10, border: '1px solid rgba(139,92,246,0.3)',
                    background: 'rgba(139,92,246,0.1)', color: '#a78bfa', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.25)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.1)'; }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button onClick={() => handleDelete(entry.id)} style={{
                    width: 34, height: 34, borderRadius: 10, border: '1px solid rgba(239,68,68,0.3)',
                    background: 'rgba(239,68,68,0.1)', color: '#f87171', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.25)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                    </svg>
                  </button>
                </div>
              </div>
              <p style={{ color: '#8b93b5', fontSize: '0.9rem', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{entry.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Edit modal */}
      {showEdit && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        }} onClick={e => { if (e.target === e.currentTarget) setShowEdit(false); }}>
          <div style={{
            background: '#0f1628', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 24, padding: 32, width: '100%', maxWidth: 560,
            animation: 'scaleIn 0.3s ease-out',
          }}>
            <h3 style={{ color: '#f0f2ff', fontWeight: 700, fontSize: '1.1rem', marginBottom: 20 }}>Edit Entry</h3>
            <input type="text" value={editEntry.title}
              onChange={e => setEditEntry({ ...editEntry, title: e.target.value })}
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 12,
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#f0f2ff', fontSize: '0.95rem', fontWeight: 600,
                marginBottom: 12, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
              }}
              onFocus={e => { e.target.style.borderColor = 'rgba(139,92,246,0.5)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            />
            <textarea value={editEntry.content} rows={6}
              onChange={e => setEditEntry({ ...editEntry, content: e.target.value })}
              style={{
                width: '100%', padding: '14px 16px', borderRadius: 12,
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#f0f2ff', fontSize: '0.9rem', lineHeight: 1.7,
                marginBottom: 20, outline: 'none', resize: 'vertical',
                boxSizing: 'border-box', fontFamily: 'inherit',
              }}
              onFocus={e => { e.target.style.borderColor = 'rgba(139,92,246,0.5)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowEdit(false)} style={{
                padding: '10px 20px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)',
                background: 'transparent', color: '#8b93b5', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600,
              }}>Cancel</button>
              <button onClick={handleSaveEdit} style={{
                padding: '10px 20px', borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: 'white',
                cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700,
                boxShadow: '0 4px 16px rgba(139,92,246,0.4)',
              }}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Journal;