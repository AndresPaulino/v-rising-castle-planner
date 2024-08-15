import React, { useState, useEffect } from 'react';
import './LoadOfficialPlotDialog.css';
import officialPlotsConfig from '../../officialPlots/officialPlotsConfig.json';

const regions = Object.keys(officialPlotsConfig);

function LoadOfficialPlotDialog({ onLoad, onClose }) {
  const [selectedRegion, setSelectedRegion] = useState(regions[0]);
  const [selectedPlot, setSelectedPlot] = useState('');

  useEffect(() => {
    if (selectedRegion && officialPlotsConfig[selectedRegion].length > 0) {
      setSelectedPlot(officialPlotsConfig[selectedRegion][0]);
    } else {
      setSelectedPlot('');
    }
  }, [selectedRegion]);

  const handleLoad = () => {
    if (selectedRegion && selectedPlot) {
      onLoad(selectedRegion, selectedPlot);
    } else {
      alert('Please select a region and a plot');
    }
  };

  return (
    <div className='load-dialog-overlay'>
      <div className='load-dialog'>
        <h2>Load Official Plot</h2>
        <select value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)}>
          {regions.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
        <select value={selectedPlot} onChange={(e) => setSelectedPlot(e.target.value)}>
          {officialPlotsConfig[selectedRegion].map((plot) => (
            <option key={plot} value={plot}>
              {plot}
            </option>
          ))}
        </select>
        <div className='load-dialog-buttons'>
          <button onClick={handleLoad}>Load</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default LoadOfficialPlotDialog;
