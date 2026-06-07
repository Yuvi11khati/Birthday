import type { Message, Wish } from '../types';

const BASE = '/api';

/**
 * All network calls degrade gracefully: if the Flask backend is offline,
 * data is kept in localStorage so the experience never breaks.
 */
const LS = {
  messages: 'memorybook:messages',
  wishes: 'memorybook:wishes',
};

function readLocal<T>(key: string): T[] {
  try {
    const val = localStorage.getItem(key);
    if (!val) return [];
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function writeLocal<T>(key: string, items: T[]) {
  localStorage.setItem(key, JSON.stringify(items));
}

async function safeFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return (await res.json()) as T;
}

export async function getMessages(): Promise<Message[]> {
  try {
    const data = await safeFetch<Message[]>(`${BASE}/messages`);
    return Array.isArray(data) ? data : [];
  } catch {
    return readLocal<Message>(LS.messages);
  }
}

export async function postMessage(name: string, message: string): Promise<Message> {
  try {
    return await safeFetch<Message>(`${BASE}/messages`, {
      method: 'POST',
      body: JSON.stringify({ name, message }),
    });
  } catch {
    const local = readLocal<Message>(LS.messages);
    const entry: Message = {
      id: Date.now(),
      name,
      message,
      created_at: new Date().toISOString(),
    };
    const next = [entry, ...local];
    writeLocal(LS.messages, next);
    return entry;
  }
}

export async function getWishes(): Promise<Wish[]> {
  try {
    const data = await safeFetch<Wish[]>(`${BASE}/wishes`);
    return Array.isArray(data) ? data : [];
  } catch {
    return readLocal<Wish>(LS.wishes);
  }
}

export async function postWish(name: string, wish: string): Promise<Wish> {
  try {
    return await safeFetch<Wish>(`${BASE}/wishes`, {
      method: 'POST',
      body: JSON.stringify({ name, wish }),
    });
  } catch {
    const local = readLocal<Wish>(LS.wishes);
    const entry: Wish = {
      id: Date.now(),
      name,
      wish,
      created_at: new Date().toISOString(),
    };
    const next = [entry, ...local];
    writeLocal(LS.wishes, next);
    return entry;
  }
}

export async function deleteMessage(id: number): Promise<void> {
  try {
    const res = await fetch(`${BASE}/messages/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
  } catch (err) {
    console.error("Delete message backend error:", err);
  } finally {
    // Sync localStorage
    const local = readLocal<Message>(LS.messages);
    const next = local.filter((msg) => msg.id !== id);
    writeLocal(LS.messages, next);
  }
}

export async function deleteWish(id: number): Promise<void> {
  try {
    const res = await fetch(`${BASE}/wishes/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
  } catch (err) {
    console.error("Delete wish backend error:", err);
  } finally {
    // Sync localStorage
    const local = readLocal<Wish>(LS.wishes);
    const next = local.filter((wish) => wish.id !== id);
    writeLocal(LS.wishes, next);
  }
}
