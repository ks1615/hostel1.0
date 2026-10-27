// API Helper to connect Frontend React App to Node.js/Express Backend on Render

export const LIVE_RENDER_URL = 'https://hostel1-0.onrender.com/api';

const API_BASE = import.meta.env.VITE_API_URL || LIVE_RENDER_URL;

export function getApiBaseUrl() {
  return API_BASE;
}

export async function fetchFullData() {
  try {
    const controller = new AbortController();
    // Render free tier cold-start can take up to 30-35 seconds
    const timeoutId = setTimeout(() => controller.abort(), 35000);
    const res = await fetch(`${API_BASE}/data`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`API server returned error status ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('Live API unreachable, using local storage cache:', err.message);
    return null;
  }
}

export async function apiSyncData(fullData) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35000);
    const res = await fetch(`${API_BASE}/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fullData),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`Sync error: status ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Live API sync failed, changes saved locally:', err.message);
    return null;
  }
}

export async function apiResetData() {
  try {
    const res = await fetch(`${API_BASE}/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error(`Reset error: status ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Live API reset failed:', err.message);
    return null;
  }
}

export async function apiSaveRoom(room) {
  try {
    const res = await fetch(`${API_BASE}/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(room)
    });
    return await res.json();
  } catch (err) {
    console.error('API save room failed:', err);
    return null;
  }
}

export async function apiDeleteRoom(id) {
  try {
    const res = await fetch(`${API_BASE}/rooms/${id}`, { method: 'DELETE' });
    return await res.json();
  } catch (err) {
    console.error('API delete room failed:', err);
    return null;
  }
}

export async function apiSaveResident(resident) {
  try {
    const res = await fetch(`${API_BASE}/residents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resident)
    });
    return await res.json();
  } catch (err) {
    console.error('API save resident failed:', err);
    return null;
  }
}

export async function apiVacateBed(roomId, bedNo, residentId) {
  try {
    const res = await fetch(`${API_BASE}/residents/vacate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId, bedNo, residentId })
    });
    return await res.json();
  } catch (err) {
    console.error('API vacate bed failed:', err);
    return null;
  }
}

export async function apiSavePayment(payment) {
  try {
    const res = await fetch(`${API_BASE}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payment)
    });
    return await res.json();
  } catch (err) {
    console.error('API save payment failed:', err);
    return null;
  }
}

export async function apiSaveNotice(notice) {
  try {
    const res = await fetch(`${API_BASE}/notices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notice)
    });
    return await res.json();
  } catch (err) {
    console.error('API save notice failed:', err);
    return null;
  }
}

export async function apiDeleteNotice(id) {
  try {
    const res = await fetch(`${API_BASE}/notices/${id}`, { method: 'DELETE' });
    return await res.json();
  } catch (err) {
    console.error('API delete notice failed:', err);
    return null;
  }
}
