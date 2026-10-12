import React, { useState, useRef } from 'react';
import { Database, Download, Upload, RefreshCw, HardDrive, ShieldCheck, Check, FileCode, FileSpreadsheet } from 'lucide-react';
import { calculateStorageStats, exportDataJSON, exportResidentsCSV } from '../utils/storage';

export default function DataStorageManager({ 
  appData, 
  onRestoreData, 
  onResetData, 
  showToast 
}) {
  const [showJsonPreview, setShowJsonPreview] = useState(false);
  const fileInputRef = useRef(null);
  const stats = calculateStorageStats();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed && (parsed.rooms || parsed.residents)) {
          onRestoreData(parsed);
          showToast('Database successfully restored from JSON backup!', 'success');
        } else {
          alert('Invalid backup file format. Must contain rooms or residents data array.');
        }
      } catch (err) {
        console.error('Error parsing JSON backup:', err);
        alert('Could not parse JSON file. Please check file validity.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetConfirm = () => {
    if (window.confirm('Are you sure you want to reset all data back to original demo state? Current local changes will be replaced.')) {
      onResetData();
      showToast('Database reset to initial demo state.', 'success');
    }
  };

  return (
    <div>
      {/* Storage Header */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(20, 18, 16, 0.08)', color: 'var(--color-black)' }}>
            <HardDrive size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.kb} KB</div>
            <div className="stat-label">Browser LocalStorage Usage</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 126, 89, 0.12)', color: '#107e59' }}>
            <ShieldCheck size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-value">Active & Persistent</div>
            <div className="stat-label">Data Storage Status</div>
          </div>
        </div>
      </div>

      <div style={{ 
        background: 'var(--bg-card)', 
        border: '1px solid var(--border-color)', 
        borderRadius: 'var(--radius-lg)', 
        padding: '1.75rem',
        marginBottom: '1.5rem' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <Database size={24} color="var(--accent-primary)" />
          <div>
            <h3 style={{ fontSize: '1.25rem' }}>Data Backup, Export & Persistence Controls</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              All room allocations, resident profiles, payments, and complaints are saved directly in your browser's persistent storage (`localStorage`).
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
          {/* Export JSON Card */}
          <div style={{ 
            background: 'var(--bg-surface)', 
            border: '1px solid var(--border-color)', 
            borderRadius: 'var(--radius-md)', 
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            justify: 'space-between' 
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                <Download size={18} color="var(--accent-primary)" />
                Download JSON Backup
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Save a complete offline snapshot of all rooms, residents, payments, and maintenance logs to your device.
              </p>
            </div>
            <button 
              className="btn btn-primary"
              onClick={() => {
                exportDataJSON(appData);
                showToast('JSON backup exported!', 'success');
              }}
            >
              <Download size={16} />
              <span>Export JSON File</span>
            </button>
          </div>

          {/* Import JSON Card */}
          <div style={{ 
            background: 'var(--bg-surface)', 
            border: '1px solid var(--border-color)', 
            borderRadius: 'var(--radius-md)', 
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            justify: 'space-between' 
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                <Upload size={18} color="#10b981" />
                Restore / Import Backup
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Upload a previously saved `.json` database file to restore or load external hostel records.
              </p>
            </div>
            <input 
              type="file" 
              accept=".json" 
              ref={fileInputRef} 
              style={{ display: 'none' }}
              onChange={handleFileChange} 
            />
            <button 
              className="btn btn-secondary"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={16} />
              <span>Choose & Import JSON</span>
            </button>
          </div>

          {/* Export CSV Card */}
          <div style={{ 
            background: 'var(--bg-surface)', 
            border: '1px solid var(--border-color)', 
            borderRadius: 'var(--radius-md)', 
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            justify: 'space-between' 
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                <FileSpreadsheet size={18} color="#f59e0b" />
                Export Resident CSV
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Export resident directory and room allocations into Excel / CSV spreadsheet format.
              </p>
            </div>
            <button 
              className="btn btn-secondary"
              onClick={() => {
                exportResidentsCSV(appData.residents);
                showToast('CSV Spreadsheet downloaded!', 'success');
              }}
            >
              <FileSpreadsheet size={16} />
              <span>Download CSV</span>
            </button>
          </div>

          {/* Reset Card */}
          <div style={{ 
            background: 'var(--bg-surface)', 
            border: '1px solid var(--border-color)', 
            borderRadius: 'var(--radius-md)', 
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            justify: 'space-between' 
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-danger)' }}>
                <RefreshCw size={18} />
                Clean Production Reset
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Wipe all mock data and reset the database to clean production state (all beds vacant, 0 demo residents, synchronized with live cloud).
              </p>
            </div>
            <button 
              className="btn btn-danger"
              onClick={handleResetConfirm}
            >
              <RefreshCw size={16} />
              <span>Reset Clean Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Raw JSON Data Preview toggle */}
      <div style={{ 
        background: 'var(--bg-card)', 
        border: '1px solid var(--border-color)', 
        borderRadius: 'var(--radius-lg)', 
        padding: '1.25rem' 
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
            <FileCode size={18} color="var(--accent-primary)" />
            <span>Raw Database JSON Inspector</span>
          </div>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => setShowJsonPreview(!showJsonPreview)}
          >
            {showJsonPreview ? 'Hide Raw JSON' : 'Inspect Raw JSON'}
          </button>
        </div>

        {showJsonPreview && (
          <pre style={{ 
            marginTop: '1rem', 
            padding: '1rem', 
            background: 'var(--bg-main)', 
            borderRadius: 'var(--radius-md)', 
            border: '1px solid var(--border-color)',
            maxHeight: '400px', 
            overflow: 'auto',
            fontSize: '0.8rem',
            fontFamily: 'monospace',
            color: '#c5a059'
          }}>
            {JSON.stringify(appData, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
