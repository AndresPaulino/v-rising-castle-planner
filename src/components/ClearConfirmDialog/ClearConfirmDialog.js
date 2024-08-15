import React from 'react';
import './ClearConfirmDialog.css';

function ClearConfirmDialog({ onConfirm, onCancel }) {
  return (
    <div className='clear-confirm-overlay'>
      <div className='clear-confirm-dialog'>
        <h2>Clear All</h2>
        <p>Are you sure you want to clear the entire grid? This action cannot be undone.</p>
        <div className='clear-confirm-buttons'>
          <button onClick={onConfirm} className='confirm-button'>
            Yes, Clear All
          </button>
          <button onClick={onCancel} className='cancel-button'>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default ClearConfirmDialog;
