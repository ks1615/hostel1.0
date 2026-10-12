import { INITIAL_ROOMS, INITIAL_RESIDENTS, INITIAL_PAYMENTS, INITIAL_MAINTENANCE, INITIAL_UPI_CONFIG, INITIAL_NOTICES } from '../data/initialData';

const STORAGE_KEY = 'SAKHARE_PLOT_HOSTEL_DATA_LIVE_V1';

export function loadData() {
  try {
    // Clear old demo data keys if present
    localStorage.removeItem('SAKHARE_PLOT_HOSTEL_DATA_V2');
    localStorage.removeItem('STARLIGHT_HOSTEL_DATA_V1');

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const defaultState = {
        rooms: INITIAL_ROOMS,
        residents: INITIAL_RESIDENTS,
        payments: INITIAL_PAYMENTS,
        maintenance: INITIAL_MAINTENANCE,
        notices: INITIAL_NOTICES,
        upiConfig: INITIAL_UPI_CONFIG,
        lastUpdated: new Date().toISOString()
      };
      saveData(defaultState);
      return defaultState;
    }
    const parsed = JSON.parse(raw);
    return {
      rooms: parsed.rooms || INITIAL_ROOMS,
      residents: parsed.residents || [],
      payments: parsed.payments || [],
      maintenance: parsed.maintenance || [],
      notices: parsed.notices || INITIAL_NOTICES,
      upiConfig: parsed.upiConfig || INITIAL_UPI_CONFIG,
      lastUpdated: parsed.lastUpdated || new Date().toISOString()
    };
  } catch (err) {
    console.error('Failed to load data from localStorage:', err);
    return {
      rooms: INITIAL_ROOMS,
      residents: INITIAL_RESIDENTS,
      payments: INITIAL_PAYMENTS,
      maintenance: INITIAL_MAINTENANCE,
      notices: INITIAL_NOTICES,
      upiConfig: INITIAL_UPI_CONFIG,
      lastUpdated: new Date().toISOString()
    };
  }
}

export function saveData(data) {
  try {
    const dataToSave = {
      ...data,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    return true;
  } catch (err) {
    console.error('Failed to save data to localStorage:', err);
    return false;
  }
}

export function resetData() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('STARLIGHT_HOSTEL_DATA_V1');
    return loadData();
  } catch (err) {
    console.error('Failed to reset localStorage data:', err);
    return null;
  }
}

export function exportDataJSON(data) {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().slice(0, 10);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sakhare_plot_hostel_backup_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    console.error('Error exporting data JSON:', err);
    return false;
  }
}

export function exportResidentsCSV(residents) {
  try {
    if (!residents || !residents.length) return false;
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Room #', 'Bed #', 'Check-In Date', 'Rent Status', 'Monthly Rent', 'Security Deposit', 'Guardian Name', 'Guardian Phone'];
    const rows = residents.map(r => [
      `"${r.id}"`,
      `"${r.name}"`,
      `"${r.email}"`,
      `"${r.phone}"`,
      `"${r.roomNumber}"`,
      `"${r.bedNo}"`,
      `"${r.checkInDate}"`,
      `"${r.rentStatus}"`,
      `"${r.monthlyRent}"`,
      `"${r.securityDeposit}"`,
      `"${r.guardianName}"`,
      `"${r.guardianPhone}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hostel_residents_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    console.error('Error exporting CSV:', err);
    return false;
  }
}

export function calculateStorageStats() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || '';
    const bytes = new Blob([raw]).size;
    const kb = (bytes / 1024).toFixed(2);
    // Typical browser quota is around 5MB (5242880 bytes)
    const percent = Math.min(100, (bytes / 5242880) * 100).toFixed(2);
    return { bytes, kb, percent };
  } catch {
    return { bytes: 0, kb: '0', percent: '0' };
  }
}
