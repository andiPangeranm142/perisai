/**
 * Check history: Firestore (per-user, anonymous auth) with a localStorage
 * fallback. Firestore is best-effort — rules may still be deny-all until
 * `firestore.rules` is deployed, and the app must never break because of it.
 *
 * Storage layout (Firestore): `checks/{uid}/items/{itemId}` (see
 * firestore.rules). Local mirror: `perisai-history-v1` in localStorage, or
 * an in-memory map when localStorage is unavailable (e.g. Node tests).
 */

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
} from 'firebase/firestore';
import { getAnonymousUid, getDb, isFirebaseConfigured } from './firebase';
import type { CheckRecord } from './types';

const LOCAL_KEY = 'perisai-history-v1';
const MAX_ITEMS = 50;

const memoryStore = new Map<string, CheckRecord>();

function getLocalStorage(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

function readLocal(): CheckRecord[] {
  const store = getLocalStorage();
  if (!store) return [...memoryStore.values()];
  try {
    const raw = store.getItem(LOCAL_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CheckRecord[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(records: CheckRecord[]): void {
  const store = getLocalStorage();
  const capped = records.slice(0, MAX_ITEMS);
  if (!store) {
    memoryStore.clear();
    for (const r of capped) memoryStore.set(r.id, r);
    return;
  }
  try {
    store.setItem(LOCAL_KEY, JSON.stringify(capped));
  } catch {
    // Storage full / blocked — history stays in memory only.
  }
}

function sortDesc(records: CheckRecord[]): CheckRecord[] {
  return [...records].sort((a, b) => b.createdAt - a.createdAt);
}

export type StoredWhere = 'firestore' | 'local';

/**
 * Saves a check. Always writes locally first (instant, offline-safe), then
 * tries Firestore. Returns where the record ended up.
 */
export async function saveCheck(record: CheckRecord): Promise<StoredWhere> {
  const local = readLocal().filter((r) => r.id !== record.id);
  writeLocal(sortDesc([record, ...local]));

  if (!isFirebaseConfigured) return 'local';
  try {
    const uid = await getAnonymousUid();
    if (!uid) return 'local';
    await setDoc(doc(getDb(), 'checks', uid, 'items', record.id), record);
    return 'firestore';
  } catch (err) {
    console.warn('[Perisai] Firestore save failed; kept locally.', err);
    return 'local';
  }
}

/** Lists checks: Firestore merged over the local mirror, newest first. */
export async function listChecks(): Promise<CheckRecord[]> {
  const local = readLocal();
  if (!isFirebaseConfigured) return sortDesc(local);

  try {
    const uid = await getAnonymousUid();
    if (!uid) return sortDesc(local);
    const snap = await getDocs(collection(getDb(), 'checks', uid, 'items'));
    const remote: CheckRecord[] = [];
    snap.forEach((d) => {
      const data = d.data() as Partial<CheckRecord>;
      if (
        typeof data.id === 'string' &&
        typeof data.createdAt === 'number' &&
        typeof data.snippet === 'string'
      ) {
        remote.push(data as CheckRecord);
      }
    });
    const merged = new Map<string, CheckRecord>();
    for (const r of local) merged.set(r.id, r);
    for (const r of remote) merged.set(r.id, r);
    return sortDesc([...merged.values()]).slice(0, MAX_ITEMS);
  } catch (err) {
    console.warn('[Perisai] Firestore read failed; using local history.', err);
    return sortDesc(local);
  }
}

export async function deleteCheck(id: string): Promise<void> {
  writeLocal(readLocal().filter((r) => r.id !== id));
  if (!isFirebaseConfigured) return;
  try {
    const uid = await getAnonymousUid();
    if (!uid) return;
    await deleteDoc(doc(getDb(), 'checks', uid, 'items', id));
  } catch (err) {
    console.warn('[Perisai] Firestore delete failed.', err);
  }
}

export async function clearChecks(): Promise<void> {
  const ids = readLocal().map((r) => r.id);
  writeLocal([]);
  if (!isFirebaseConfigured) return;
  try {
    const uid = await getAnonymousUid();
    if (!uid) return;
    await Promise.all(
      ids.map((id) =>
        deleteDoc(doc(getDb(), 'checks', uid, 'items', id)).catch(() => undefined),
      ),
    );
  } catch {
    // Local copy is already cleared; remote cleanup is best-effort.
  }
}

/** Builds a history record from a completed check. */
export function makeRecord(
  message: string,
  risk: CheckRecord['risk'],
  route: CheckRecord['route'],
  summary: string,
): CheckRecord {
  const snippet =
    message.trim().length > 120
      ? `${message.trim().slice(0, 117)}…`
      : message.trim();
  return {
    id:
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    createdAt: Date.now(),
    snippet,
    risk,
    route,
    summary,
  };
}
