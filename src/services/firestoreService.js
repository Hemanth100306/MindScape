import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp,
    getDocs,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

// ─── JOURNAL ──────────────────────────────────────────────────────────────────

/** Subscribe to real-time journal entries for a user. Returns unsubscribe fn. */
export function subscribeToJournal(uid, callback) {
    const q = query(
        collection(db, "journal"),
        where("uid", "==", uid),
        orderBy("createdAt", "desc")
    );
    return onSnapshot(q, (snap) => {
        const entries = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        callback(entries);
    });
}

export async function addJournalEntry(uid, { title, content, tag }) {
    return addDoc(collection(db, "journal"), {
        uid,
        title,
        content,
        tag,
        createdAt: serverTimestamp(),
    });
}

export async function updateJournalEntry(id, { title, content }) {
    return updateDoc(doc(db, "journal", id), { title, content });
}

export async function deleteJournalEntry(id) {
    return deleteDoc(doc(db, "journal", id));
}

// ─── MOOD ─────────────────────────────────────────────────────────────────────

/** Subscribe to real-time mood history for a user. Returns unsubscribe fn. */
export function subscribeToMood(uid, callback) {
    const q = query(
        collection(db, "mood"),
        where("uid", "==", uid),
        orderBy("createdAt", "desc")
    );
    return onSnapshot(q, (snap) => {
        const entries = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        callback(entries);
    });
}

export async function addMoodEntry(uid, { moodLabel, moodEmoji, moodColor, moodValue, note }) {
    return addDoc(collection(db, "mood"), {
        uid,
        moodLabel,
        moodEmoji,
        moodColor,
        moodValue,
        note,
        createdAt: serverTimestamp(),
    });
}

export async function deleteMoodEntry(id) {
    return deleteDoc(doc(db, "mood", id));
}

// ─── USER PROFILE ──────────────────────────────────────────────────────────────

/** One-time fetch of all journal entries for analytics (no listener). */
export async function fetchJournalOnce(uid) {
    const q = query(collection(db, "journal"), where("uid", "==", uid));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/** One-time fetch of all mood entries for analytics. */
export async function fetchMoodOnce(uid) {
    const q = query(collection(db, "mood"), where("uid", "==", uid));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
