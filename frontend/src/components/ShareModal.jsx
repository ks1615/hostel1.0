import React, { useState } from 'react';
import { X, Share2, Copy, Check, ExternalLink, MessageCircle, Cloud, RefreshCw, ShieldCheck } from 'lucide-react';

export default function ShareModal({ 
  onClose, 
  roomCount = 0, 
  residentCount = 0, 
  cloudStatus = 'connected',
  onForceSync,
  showToast 
}) {
  const [copied, setCopied] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Generate clean public link
  const getShareUrl = () => {
    try {
      const base = window.location.origin + window.location.pathname;
      return `${base}?mode=public`;
    } catch {
      return 'https://hostel1-0.onrender.com/?mode=public';
    }
  };

  const shareUrl = getShareUrl();

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      if (showToast) showToast('Public share link copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      if (showToast) showToast('Public share link copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `🏨 *Sakhare Plot Hostel - Live Directory*\n\nView live room vacancies, real resident allocations, and Paid/Unpaid rent status:\n👉 ${shareUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleOpenPreview = () => {
    window.open(shareUrl, '_blank');
  };

  const handleSyncCloud = async () => {
    if (!onForceSync) return;
    setIsSyncing(true);
    try {
      await onForceSync();
      if (showToast) showToast('Live cloud database synchronized successfully!', 'success');
    } catch {
      if (showToast) showToast('Sync completed with local cache.', 'info');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header" style={{ background: 'linear-gradient(135deg, rgba(20, 18, 16, 0.04), rgba(197, 160, 89, 0.14))' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ 
              background: '#141210', 
              color: 'var(--accent-gold)', 
              border: '1.5px solid var(--accent-gold)',
              width: '42px', 
              height: '42px', 
              borderRadius: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(20, 18, 16, 0.15)' 
            }}>
              <Share2 size={20} />
            </div>
            <div>
              <h2 className="modal-title" style={{ fontSize: '1.2rem' }}>Share Live Hostel Link</h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Real data visible to anyone with read-only security
              </span>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Live Data Guarantee Banner */}
          <div style={{ 
            background: 'rgba(16, 126, 89, 0.08)', 
            border: '1px solid rgba(16, 126, 89, 0.25)', 
            borderRadius: 'var(--radius-md)', 
            padding: '0.85rem 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <ShieldCheck size={24} color="#107e59" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#107e59' }}>
                Real Data Enabled (No Demo Data)
              </div>
              <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginTop: '0.15rem', lineHeight: 1.4 }}>
                Anyone who opens this link sees the exact <strong>real data</strong> ({roomCount} rooms, {residentCount} residents, Paid/Unpaid rent) with editing locked to Owner.
              </div>
            </div>
          </div>

          {/* Cloud Sync Status Pill */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            background: 'var(--bg-surface)', 
            padding: '0.6rem 0.9rem', 
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            fontSize: '0.8rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Cloud size={16} color={cloudStatus === 'connected' ? '#107e59' : 'var(--accent-gold)'} />
              <span>Cloud Status: <strong style={{ color: 'var(--color-black)' }}>{cloudStatus === 'connected' ? 'Live Cloud Connected' : 'Cached Local State'}</strong></span>
            </div>
            <button 
              type="button" 
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              onClick={handleSyncCloud}
              disabled={isSyncing}
              title="Force sync database with cloud before sharing"
            >
              <RefreshCw size={12} className={isSyncing ? 'spinning' : ''} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Cloud'}</span>
            </button>
          </div>

          {/* Share Link Input Box */}
          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Public Shareable Link</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', fontWeight: 600 }}>1-Click Share</span>
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.35rem' }}>
              <input 
                type="text" 
                readOnly 
                value={shareUrl} 
                className="form-input" 
                style={{ 
                  fontSize: '0.85rem', 
                  fontFamily: 'monospace', 
                  backgroundColor: 'var(--bg-surface)',
                  cursor: 'text'
                }}
                onClick={(e) => e.target.select()}
              />
              <button 
                type="button" 
                className={`btn ${copied ? 'btn-gold' : 'btn-primary'}`} 
                style={{ flexShrink: 0, minWidth: '100px' }}
                onClick={handleCopyLink}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          {/* Quick Action Share Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.25rem' }}>
            <button 
              type="button" 
              className="btn btn-secondary" 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '0.5rem',
                borderColor: 'rgba(37, 211, 102, 0.4)',
                background: 'rgba(37, 211, 102, 0.08)',
                color: '#128c7e'
              }}
              onClick={handleWhatsAppShare}
            >
              <MessageCircle size={16} color="#25D366" />
              <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Send WhatsApp</span>
            </button>

            <button 
              type="button" 
              className="btn btn-secondary" 
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              onClick={handleOpenPreview}
            >
              <ExternalLink size={16} />
              <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Open Preview</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer" style={{ borderTop: '1px solid var(--border-color)', padding: '0.85rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Recipients can view all rooms & Paid/Unpaid dues without needing a password.
          </span>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
