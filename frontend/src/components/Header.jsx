import React from 'react';
import { Building2, Search, Download, Upload, Sun, Moon, Plus, LogOut, ShieldCheck, User, Globe, Share2 } from 'lucide-react';

export default function Header({ 
  currentUser,
  searchTerm, 
  setSearchTerm, 
  theme, 
  toggleTheme, 
  onExport, 
  onImportTrigger, 
  onOpenAddRoom,
  onOpenLogin,
  onLogout,
  onNavigateToPublic,
  onOpenShare
}) {
  const isOwner = currentUser?.role === 'owner';
  const isMember = currentUser?.role === 'member';

  return (
    <header className="top-header">
      <div className="header-brand">
        <div className="header-logo">
          <Building2 size={22} />
        </div>
        <div>
          <h1 className="brand-title">Sakhare Plot Hostel</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.15rem' }}>
            <span style={{ 
              fontSize: '0.725rem', 
              fontWeight: 700, 
              color: 'var(--text-primary)', 
              background: 'var(--bg-surface)', 
              padding: '0.12rem 0.55rem', 
              borderRadius: 'var(--radius-full)', 
              border: '1px solid var(--border-color)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-gold)' }}></span>
              {isOwner ? '👑 Owner Admin (Full Edit/Delete)' : isMember ? '🎓 Resident Student Portal' : '🌐 Page 3: Public Shared Link (Paid/Unpaid)'}
            </span>
          </div>
        </div>
      </div>

      <div className="search-box">
        <Search size={16} />
        <input
          type="text"
          placeholder="Search rooms, residents, phones..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="header-actions">
        {isOwner && (
          <>
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={onExport}
              title="Download JSON Backup"
            >
              <Download size={16} />
              <span>Export</span>
            </button>

            <button 
              className="btn btn-secondary btn-sm" 
              onClick={onImportTrigger}
              title="Import JSON Backup"
            >
              <Upload size={16} />
              <span>Import</span>
            </button>

            <button 
              className="btn btn-gold btn-sm"
              onClick={onOpenAddRoom}
            >
              <Plus size={16} />
              <span>Add Room</span>
            </button>
          </>
        )}

        <button 
          className="btn btn-secondary btn-sm" 
          onClick={onOpenShare}
          title="Share Real Data Public Link"
          style={{ 
            borderColor: 'var(--accent-gold)', 
            background: 'rgba(197, 160, 89, 0.08)',
            color: 'var(--color-black)',
            fontWeight: 700 
          }}
        >
          <Share2 size={15} color="var(--accent-gold)" />
          <span>Share Link</span>
        </button>

        <button 
          className="btn btn-secondary btn-sm" 
          onClick={toggleTheme}
          title="Toggle Light / Dark Mode"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {currentUser ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ffffff', padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            <span style={{ 
              background: isOwner ? 'rgba(197, 160, 89, 0.15)' : 'rgba(20, 18, 16, 0.08)', 
              color: isOwner ? '#8c6b2d' : '#141210', 
              padding: '0.15rem 0.5rem', 
              borderRadius: 'var(--radius-full)', 
              fontSize: '0.75rem', 
              fontWeight: 800,
              border: isOwner ? '1px solid rgba(197, 160, 89, 0.4)' : '1px solid rgba(20, 18, 16, 0.15)'
            }}>
              {isOwner ? '👑 Owner' : '🎓 Member'}
            </span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentUser.name.split(' ')[0]}
            </span>
            <button 
              className="btn btn-secondary btn-sm" 
              style={{ padding: '0.2rem 0.4rem', border: 'none', background: 'transparent', color: 'var(--color-danger)' }}
              onClick={onLogout}
              title="Logout / Switch Account"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => onOpenLogin('owner')}
            title="Owner or Member Login"
          >
            <User size={14} />
            <span>Login</span>
          </button>
        )}
      </div>
    </header>
  );
}
