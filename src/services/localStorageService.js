// localStorage service — mirrors the Firestore service API.
// Data is keyed by user UID so each user's data is isolated.
// To switch to Firestore later: just swap the import in Journal.jsx and Mood.jsx.

const JOURNAL_KEY = (uid) => `mindscape_journal_${uid}`;
const MOOD_KEY = (uid) => `mindscape_mood_${uid}`;

const genId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

const readStore = (key) => {
    try {
        return JSON.parse(localStorage.getItem(key) || '[]');
    } catch {
        return [];
    }
};

const writeStore = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
};

// ─── JOURNAL ──────────────────────────────────────────────────────────────────

/**
 * Subscribe to journal entries for a user.
 * Calls callback immediately with current data, then on every storage event.
 * Returns an unsubscribe function (matching Firestore onSnapshot API).
 */
export function subscribeToJournal(uid, callback) {
    const key = JOURNAL_KEY(uid);

    const emit = () => {
        const entries = readStore(key).sort((a, b) => b.createdAt - a.createdAt);
        callback(entries);
    };

    // Fire immediately
    emit();

    // Listen for changes from other tabs
    const handler = (e) => { if (e.key === key) emit(); };
    window.addEventListener('storage', handler);

    // Return unsubscribe fn
    return () => window.removeEventListener('storage', handler);
}

export async function addJournalEntry(uid, { title, content, tag }) {
    const key = JOURNAL_KEY(uid);
    const entries = readStore(key);
    const newEntry = {
        id: genId(),
        uid,
        title,
        content,
        tag,
        createdAt: Date.now(),
    };
    writeStore(key, [newEntry, ...entries]);
    // Trigger re-render in same tab
    window.dispatchEvent(new StorageEvent('storage', { key }));
    return newEntry;
}

export async function updateJournalEntry(id, uid, { title, content }) {
    const key = JOURNAL_KEY(uid);
    const entries = readStore(key).map(e =>
        e.id === id ? { ...e, title, content, updatedAt: Date.now() } : e
    );
    writeStore(key, entries);
    window.dispatchEvent(new StorageEvent('storage', { key }));
}

export async function deleteJournalEntry(id, uid) {
    const key = JOURNAL_KEY(uid);
    const entries = readStore(key).filter(e => e.id !== id);
    writeStore(key, entries);
    window.dispatchEvent(new StorageEvent('storage', { key }));
}

// ─── MOOD ─────────────────────────────────────────────────────────────────────

export function subscribeToMood(uid, callback) {
    const key = MOOD_KEY(uid);

    const emit = () => {
        const entries = readStore(key).sort((a, b) => b.createdAt - a.createdAt);
        callback(entries);
    };

    emit();

    const handler = (e) => { if (e.key === key) emit(); };
    window.addEventListener('storage', handler);

    return () => window.removeEventListener('storage', handler);
}

export async function addMoodEntry(uid, { moodLabel, moodEmoji, moodColor, moodValue, note }) {
    const key = MOOD_KEY(uid);
    const entries = readStore(key);
    const newEntry = {
        id: genId(),
        uid,
        moodLabel,
        moodEmoji,
        moodColor,
        moodValue,
        note,
        createdAt: Date.now(),
    };
    writeStore(key, [newEntry, ...entries]);
    window.dispatchEvent(new StorageEvent('storage', { key }));
    return newEntry;
}

export async function deleteMoodEntry(id, uid) {
    const key = MOOD_KEY(uid);
    const entries = readStore(key).filter(e => e.id !== id);
    writeStore(key, entries);
    window.dispatchEvent(new StorageEvent('storage', { key }));
}
