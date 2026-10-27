import React, { useState } from 'react';
import { CreditCard, Plus, CheckCircle2, Clock, QrCode, FileText, X } from 'lucide-react';
import UpiPaymentModal from './UpiPaymentModal';

export default function PaymentsTracker({ 
  payments, 
  residents, 
  upiConfig,
  onSavePayment,
  showToast,
  isOwner = false 
}) {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [upiModalResident, setUpiModalResident] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const [form, setForm] = useState({
    residentId: residents.length > 0 ? residents[0].id : '',
    amount: residents.length > 0 ? residents[0].monthlyRent : 7500,
    month: 'October 2026',
    paymentMethod: 'UPI',
    upiRefNo: '',
    date: new Date().toISOString().slice(0, 10)
  });

  const handleResidentChange = (resId) => {
    const targetRes = residents.find(r => r.id === resId);
    setForm(prev => ({
      ...prev,
      residentId: resId,
      amount: targetRes ? targetRes.monthlyRent : 7500
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isOwner) {
      alert('Permission Denied: Only the hostel owner can record payment transactions.');
      return;
    }
    const targetRes = residents.find(r => r.id === form.residentId);
    if (!targetRes) {
      alert('Please select a resident');
      return;
    }

    const newPayment = {
      id: `pay_${Date.now()}`,
      residentId: targetRes.id,
      residentName: targetRes.name,
      roomNumber: targetRes.roomNumber,
      amount: Number(form.amount),
      date: form.date,
      month: form.month,
      paymentMethod: form.paymentMethod,
      upiRefNo: form.upiRefNo.trim() || (form.paymentMethod === 'UPI' ? `UTR-${Math.floor(100000000000 + Math.random() * 900000000000)}` : 'N/A'),
      status: 'Completed',
      receiptNo: `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`
    };

    onSavePayment(newPayment);
    setShowPaymentModal(false);
  };

  // Calculations
  const totalCollected = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
  const pendingResidents = residents.filter(r => r.rentStatus !== 'Paid');
  const totalPendingDues = pendingResidents.reduce((acc, r) => acc + r.monthlyRent, 0);

  return (
    <div>
      {/* Top Banner Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-value">₹{totalCollected.toLocaleString()}</div>
            <div className="stat-label">Total Rent Collected</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-value">₹{totalPendingDues.toLocaleString()}</div>
            <div className="stat-label">Pending Dues ({pendingResidents.length} Residents)</div>
          </div>
        </div>
      </div>

      {/* Hostel UPI Scanner Quick Banner */}
      <div style={{ 
        background: 'linear-gradient(135deg, rgba(20, 18, 16, 0.04), rgba(197, 160, 89, 0.12))', 
        border: '1px solid var(--border-highlight)', 
        borderRadius: 'var(--radius-lg)', 
        padding: '1.25rem 1.5rem', 
        display: 'flex', 
        alignItems: 'center', 
        justify: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ 
            background: '#ffffff', 
            padding: '4px', 
            borderRadius: '10px', 
            border: '2px solid #c5a059',
            boxShadow: 'var(--shadow-sm)' 
          }}>
            <img 
              src="/sakhare-upi-qr.jpg" 
              alt="Sakhare Plot PhonePe QR" 
              style={{ width: '60px', height: '60px', borderRadius: '6px', objectFit: 'cover' }} 
            />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
              Sakhare Plot Hostel Official UPI QR Scanner
            </div>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
              UPI ID: <strong style={{ color: 'var(--accent-primary)', fontFamily: 'monospace' }}>{upiConfig?.upiId || 'sakhareplot@upi'}</strong> • PhonePe / GPay / Paytm
            </div>
          </div>
        </div>

        <button 
          className="btn btn-primary"
          onClick={() => setUpiModalResident(pendingResidents.length > 0 ? pendingResidents[0] : { name: 'Hostel Fee', roomNumber: 'Dues', monthlyRent: 7500 })}
        >
          <QrCode size={16} />
          <span>Pay via UPI QR Scanner</span>
        </button>
      </div>

      {/* Official UPI Payment Showcase Card */}
      <div style={{ 
        background: 'var(--bg-card)', 
        border: '1px solid var(--border-color)', 
        borderRadius: 'var(--radius-lg)', 
        padding: '1.5rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ 
            background: '#ffffff', 
            padding: '8px', 
            borderRadius: '12px', 
            border: '2px solid #c5a059',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <img 
              src="/sakhare-upi-qr.jpg" 
              alt="Sakhare Plot Hostel PhonePe Scanner" 
              style={{ width: '130px', height: 'auto', display: 'block', borderRadius: '6px' }}
            />
          </div>
          <div>
            <h4 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.25rem' }}>
              Official PhonePe & UPI Scanner
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.65rem' }}>
              Scan with any UPI app (PhonePe, GPay, Paytm) for hostel rent & deposit.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>UPI ID:</span>
              <strong style={{ fontFamily: 'monospace', color: 'var(--accent-primary)', fontSize: '0.95rem' }}>
                {upiConfig?.upiId || 'sakhareplot@upi'}
              </strong>
            </div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-surface)', padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '380px' }}>
          <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.2rem' }}>Payment Note:</strong>
          <span>Please add your Room # and Name in the payment remarks and share receipt with the warden.</span>
        </div>
      </div>

      {/* Control bar */}
      <div className="filter-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CreditCard size={20} style={{ color: 'var(--accent-primary)' }} />
          <h3 style={{ fontSize: '1.1rem' }}>Payment Transactions Log</h3>
        </div>

        {isOwner && (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              className="btn btn-primary"
              onClick={() => setShowPaymentModal(true)}
            >
              <Plus size={16} />
              <span>Record Rent Payment</span>
            </button>
          </div>
        )}
      </div>

          {/* Payment Records Table */}
          <div className="table-container">
            <table className="custom-table">
              <thead>
            <tr>
              <th>Receipt #</th>
              <th>Resident Name</th>
              <th>Room #</th>
              <th>Month</th>
              <th>Amount</th>
              <th>Method</th>
              <th>UPI UTR / Ref No.</th>
              <th>Payment Date</th>
              <th>Status</th>
              <th>Invoice</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No payment records found. Record a payment to get started.
                </td>
              </tr>
            ) : (
              payments.map(pay => (
                <tr key={pay.id}>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--accent-primary)' }}>
                      {pay.receiptNo}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700 }}>{pay.residentName}</td>
                  <td>Room {pay.roomNumber}</td>
                  <td>{pay.month}</td>
                  <td style={{ fontWeight: 700, color: '#10b981' }}>₹{pay.amount.toLocaleString()}</td>
                  <td>
                    <span style={{ 
                      background: 'var(--bg-surface)', 
                      padding: '0.2rem 0.5rem', 
                      borderRadius: 'var(--radius-sm)', 
                      fontSize: '0.75rem',
                      border: '1px solid var(--border-color)' 
                    }}>
                      {pay.paymentMethod}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {pay.upiRefNo || 'N/A'}
                    </span>
                  </td>
                  <td>{pay.date}</td>
                  <td>
                    <span className="badge badge-available">
                      ✓ {pay.status}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => setSelectedReceipt(pay)}
                    >
                      <FileText size={14} />
                      <span>Receipt</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Manual Payment Record Modal (Owner Only) */}
      {showPaymentModal && isOwner && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Record Rent Payment</h2>
              <button className="modal-close" onClick={() => setShowPaymentModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Select Resident</label>
                  <select 
                    className="form-select"
                    value={form.residentId}
                    onChange={(e) => handleResidentChange(e.target.value)}
                  >
                    {residents.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.name} (Room {r.roomNumber}) - Status: {r.rentStatus}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Amount Paid (₹)</label>
                    <input 
                      type="number" 
                      className="form-input"
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Payment Month</label>
                    <input 
                      type="text" 
                      className="form-input"
                      value={form.month}
                      onChange={(e) => setForm({ ...form, month: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Payment Mode</label>
                    <select 
                      className="form-select"
                      value={form.paymentMethod}
                      onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                    >
                      <option value="UPI">UPI / PhonePe / GPay</option>
                      <option value="Cash">Cash</option>
                      <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
                      <option value="Card">Credit / Debit Card</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>UPI UTR / Ref Number</label>
                    <input 
                      type="text" 
                      className="form-input"
                      placeholder="12-digit UTR No."
                      value={form.upiRefNo}
                      onChange={(e) => setForm({ ...form, upiRefNo: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Payment Date</label>
                    <input 
                      type="date" 
                      className="form-input"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowPaymentModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <CreditCard size={16} />
                  <span>Confirm Payment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPI QR Payment Modal */}
      {upiModalResident && (
        <UpiPaymentModal 
          resident={upiModalResident}
          upiConfig={upiConfig}
          onClose={() => setUpiModalResident(null)}
          onConfirmPayment={onSavePayment}
          showToast={showToast}
        />
      )}

      {/* Digital Receipt Modal */}
      {selectedReceipt && (
        <div className="modal-overlay" onClick={() => setSelectedReceipt(null)}>
          <div className="modal-content" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Payment Receipt</h2>
              <button className="modal-close" onClick={() => setSelectedReceipt(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ background: '#ffffff', color: '#111827', borderRadius: '12px', padding: '1.5rem', margin: '1rem' }}>
              <div style={{ textAlign: 'center', borderBottom: '2px dashed #e5e7eb', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.25rem', color: '#141210', fontWeight: 800 }}>SAKHARE PLOT HOSTEL</h3>
                <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>Official Rent Receipt</p>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: '0.5rem', color: '#111827' }}>
                  {selectedReceipt.receiptNo}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280' }}>Resident Name:</span>
                  <strong style={{ color: '#111827' }}>{selectedReceipt.residentName}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280' }}>Room Number:</span>
                  <strong style={{ color: '#111827' }}>Room {selectedReceipt.roomNumber}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280' }}>Billing Period:</span>
                  <strong style={{ color: '#111827' }}>{selectedReceipt.month}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280' }}>Payment Mode:</span>
                  <strong style={{ color: '#111827' }}>{selectedReceipt.paymentMethod}</strong>
                </div>
                {selectedReceipt.upiRefNo && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>UPI UTR Ref:</span>
                    <strong style={{ color: '#111827', fontFamily: 'monospace' }}>{selectedReceipt.upiRefNo}</strong>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280' }}>Transaction Date:</span>
                  <strong style={{ color: '#111827' }}>{selectedReceipt.date}</strong>
                </div>

                <div style={{ 
                  marginTop: '1rem', 
                  paddingTop: '0.75rem', 
                  borderTop: '2px solid #111827', 
                  display: 'flex', 
                  justify: 'space-between',
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  color: '#10b981'
                }}>
                  <span>TOTAL PAID:</span>
                  <span>₹{selectedReceipt.amount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => window.print()}>
                Print Receipt
              </button>
              <button className="btn btn-primary" onClick={() => setSelectedReceipt(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
