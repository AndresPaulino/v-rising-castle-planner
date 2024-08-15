import React, { useState } from 'react';
import './SaveDialog.css';

const mapAreas = ['Farbane Woods', 'Dunley Farmlands', 'Hallowed Mountains', 'Silverlight Hills'];

function SaveDialog({ onSave, onClose }) {
  const [plotName, setPlotName] = useState('');
  const [mapArea, setMapArea] = useState(mapAreas[0]);

  const handleSave = () => {
    if (plotName.trim() === '') {
      alert('Please enter a plot name');
      return;
    }
    onSave(plotName, mapArea);
  };

  return (
    <div className='save-dialog-overlay'>
      <div className='save-dialog'>
        <h2>Save Plot</h2>
        <input type='text' placeholder='Enter plot name' value={plotName} onChange={(e) => setPlotName(e.target.value)} />
        <select value={mapArea} onChange={(e) => setMapArea(e.target.value)}>
          {mapAreas.map((area) => (
            <option key={area} value={area}>
              {area}
            </option>
          ))}
        </select>
        <div className='save-dialog-buttons'>
          <button onClick={handleSave}>Save</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default SaveDialog;
