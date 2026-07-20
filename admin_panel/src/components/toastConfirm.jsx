// src/components/toastConfirm.jsx
// Usage: toastConfirm('Delete this message?', () => doDelete())
import { toast } from 'react-toastify';

export function toastConfirm(message, onConfirm) {
  const toastId = toast(
    ({ closeToast }) => (
      <div style={{ fontFamily: 'inherit' }}>
        <p style={{ margin: '0 0 12px', fontWeight: 600, fontSize: '14px' }}>{message}</p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => { closeToast(); onConfirm(); }}
            style={{
              flex: 1, padding: '7px 14px', border: 'none', borderRadius: '6px',
              background: '#c0392b', color: '#fff', fontWeight: 700,
              fontSize: '13px', cursor: 'pointer',
            }}
          >
            Yes, Delete
          </button>
          <button
            onClick={closeToast}
            style={{
              flex: 1, padding: '7px 14px', border: '1px solid #ccc', borderRadius: '6px',
              background: '#fff', color: '#333', fontWeight: 600,
              fontSize: '13px', cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    ),
    {
      autoClose: false,
      closeOnClick: false,
      draggable: false,
      closeButton: false,
      icon: '🗑️',
    }
  );
  return toastId;
}