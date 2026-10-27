// API Helper to connect Frontend React App to Node.js/Express Backend on Render

export const LIVE_RENDER_URL = 'https://hostel1-0.onrender.com/api';
export const OWNER_SECRET_TOKEN = 'sakhare_owner_admin_secret_v1';

const API_BASE = import.meta.env.VITE_API_URL || LIVE_RENDER_URL;

export function getApiBaseUrl() {
  return API_BASE;
}

// Get authorization headers: Only includes owner secret token if currentUser is logged in as Owner
export function getAuthHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  try {
    const raw = localStorage.getItem('SAKHARE_CURRENT_USER');
    if (raw) {
      const user = JSON.parse(raw);
      if (user && user.role === 'owner') {
        headers['Authorization'] = `Bearer ${OWNER_SECRET_TOKEN}`;
        headers['x-owner-role'] = 'owner';
      }
    }
  } catch {
    // Ignore storage parse errors
  }
  return headers;
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
    const headers = getAuthHeaders();
    // If not owner, do not push mutations to cloud
    if (!headers['x-owner-role']) {
      return { success: false, error: 'Permission denied: Read-only visitor' };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35000);
    const res = await fetch(`${API_BASE}/sync`, {
      method: 'POST',
      headers,
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
    const headers = getAuthHeaders();
    if (!headers['x-owner-role']) {
      return { success: false, error: 'Permission denied: Read-only visitor' };
    }
    const res = await fetch(`${API_BASE}/reset`, {
      method: 'POST',
      headers
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
    const headers = getAuthHeaders();
    if (!headers['x-owner-role']) return null;
    const res = await fetch(`${API_BASE}/rooms`, {
      method: 'POST',
      headers,
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
    const headers = getAuthHeaders();
    if (!headers['x-owner-role']) return null;
    const res = await fetch(`${API_BASE}/rooms/${id}`, { 
      method: 'DELETE',
      headers 
    });
    return await res.json();
  } catch (err) {
    console.error('API delete room failed:', err);
    return null;
  }
}

export async function apiSaveResident(resident) {
  try {
    const headers = getAuthHeaders();
    if (!headers['x-owner-role']) return null;
    const res = await fetch(`${API_BASE}/residents`, {
      method: 'POST',
      headers,
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
    const headers = getAuthHeaders();
    if (!headers['x-owner-role']) return null;
    const res = await fetch(`${API_BASE}/residents/vacate`, {
      method: 'POST',
      headers,
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
    const headers = getAuthHeaders();
    if (!headers['x-owner-role']) return null;
    const res = await fetch(`${API_BASE}/payments`, {
      method: 'POST',
      headers,
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
    const headers = getAuthHeaders();
    if (!headers['x-owner-role']) return null;
    const res = await fetch(`${API_BASE}/notices`, {
      method: 'POST',
      headers,
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
    const headers = getAuthHeaders();
    if (!headers['x-owner-role']) return null;
    const res = await fetch(`${API_BASE}/notices/${id}`, { 
      method: 'DELETE',
      headers 
    });
    return await res.json();
  } catch (err) {
    console.error('API delete notice failed:', err);
    return null;
  }
}
