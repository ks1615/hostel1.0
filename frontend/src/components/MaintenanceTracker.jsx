import React, { useState } from 'react';
import { Wrench, Plus, CheckCircle, AlertCircle, Clock, X } from 'lucide-react';

export default function MaintenanceTracker({ 
  maintenance, 
  rooms, 
  onSaveTicket, 
  onUpdateTicketStatus,
  isOwner = false 
}) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    roomId: rooms.length > 0 ? rooms[0].id : '',
    issue: '',
    category: 'Plumbing',
    priority: 'Medium'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isOwner) {
      alert('Permission Denied: Only the hostel owner can log maintenance tickets.');
      return;
    }
    if (!form.issue.trim()) {
      alert('Please enter issue description');
      return;
    }
    const targetRoom = rooms.find(r => r.id === form.roomId);
    const newTicket = {
      id: `maint_${Date.now()}`,
      roomId: form.roomId,
      roomNumber: targetRoom ? targetRoom.number : 'N/A',
      issue: form.issue.trim(),
      category: form.category,
      priority: form.priority,
      status: 'Open',
      reportedDate: new Date().toISOString().slice(0, 10)
    };

    onSaveTicket(newTicket);
    setShowModal(false);
    setForm({
      roomId: rooms.length > 0 ? rooms[0].id : '',
      issue: '',
      category: 'Plumbing',
      priority: 'Medium'
    });
  };

  const openTickets = maintenance.filter(m => m.status !== 'Resolved');

  return (
    <div>
      {/* Header & Button */}
      <div className="filter-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Wrench size={20} style={{ color: 'var(--color-maintenance)' }} />
          <h3 style={{ fontSize: '1.1rem' }}>Maintenance & Repair Board</h3>
        </div>

        {isOwner && (
          <button 
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            <Plus size={16} />
            <span>Report Maintenance Issue</span>
          </button>
        )}
      </div>

      {/* Tickets List */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Ticket ID</th>
              <th>Room #</th>
              <th>Category</th>
              <th>Issue Description</th>
              <th>Priority</th>
              <th>Reported Date</th>
              <th>Status</th>
              <th>Update Status</th>
            </tr>
          </thead>
          <tbody>
            {maintenance.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No maintenance requests reported. Hostel is running smoothly!
                </td>
              </tr>
            ) : (
              maintenance.map(ticket => {
                let prioColor = 'var(--text-secondary)';
                if (ticket.priority === 'High' || ticket.priority === 'Emergency') prioColor = 'var(--color-danger)';
                else if (ticket.priority === 'Medium') prioColor = 'var(--color-maintenance)';

                return (
                  <tr key={ticket.id}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-muted)' }}>
                        {ticket.id}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700 }}>Room {ticket.roomNumber}</td>
                    <td>
                      <span style={{ 
                        background: 'var(--bg-surface)', 
                        padding: '0.2rem 0.5rem', 
                        borderRadius: 'var(--radius-sm)', 
                        fontSize: '0.75rem',
                        border: '1px solid var(--border-color)' 
                      }}>
                        {ticket.category}
                      </span>
                    </td>
                    <td style={{ maxWidth: '300px' }}>{ticket.issue}</td>
                    <td>
                      <span style={{ color: prioColor, fontWeight: 700, fontSize: '0.8rem' }}>
                        ● {ticket.priority}
                      </span>
                    </td>
                    <td>{ticket.reportedDate}</td>
                    <td>
                      <span className={`badge ${ticket.status === 'Resolved' ? 'badge-available' : ticket.status === 'In Progress' ? 'badge-maintenance' : 'badge-full'}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td>
                      {isOwner ? (
                        <select 
                          className="select-custom" 
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                          value={ticket.status}
                          onChange={(e) => onUpdateTicketStatus(ticket.id, e.target.value)}
                        >
                          <option value="Open">Open</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Managed</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* New Ticket Modal (Owner Only) */}
      {showModal && isOwner && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">New Maintenance Complaint Ticket</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Select Room</label>
                  <select 
                    className="form-select"
                    value={form.roomId}
                    onChange={(e) => setForm({ ...form, roomId: e.target.value })}
                  >
                    {rooms.map(r => (
                      <option key={r.id} value={r.id}>
                        Room {r.number} ({r.block})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Category</label>
                    <select 
                      className="form-select"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                    >
                      <option value="Plumbing">Plumbing (Pipes, Taps, Flush)</option>
                      <option value="Electrical">Electrical (Lights, Fan, Switch)</option>
                      <option value="AC / Appliance">AC / Appliance / Geyser</option>
                      <option value="Furniture">Furniture (Bed, Study Chair, Door)</option>
                      <option value="Cleaning">Deep Cleaning / Pest</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Priority Level</label>
                    <select 
                      className="form-select"
                      value={form.priority}
                      onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Emergency">Emergency Urgent</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Detailed Issue Description</label>
                  <textarea 
                    className="form-textarea"
                    rows="3"
                    placeholder="Describe the issue reported by resident..."
                    value={form.issue}
                    onChange={(e) => setForm({ ...form, issue: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Wrench size={16} />
                  <span>Submit Ticket</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
