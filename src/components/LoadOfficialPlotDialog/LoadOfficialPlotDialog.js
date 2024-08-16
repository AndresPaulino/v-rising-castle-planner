import React, { useState, useEffect } from 'react';
import './LoadOfficialPlotDialog.css';

function LoadOfficialPlotDialog({ onLoad, onClose }) {
  const [officialPlotsConfig, setOfficialPlotsConfig] = useState({});
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedPlot, setSelectedPlot] = useState('');

  useEffect(() => {
    fetch('/officialPlots/officialPlotsConfig.json')
      .then((response) => response.json())
      .then((data) => {
        setOfficialPlotsConfig(data);
        const firstRegion = Object.keys(data)[0];
        setSelectedRegion(firstRegion);
        setSelectedPlot(data[firstRegion][0] || '');
      })
      .catch((error) => console.error('Error loading officialPlotsConfig:', error));
  }, []);

  useEffect(() => {
    if (selectedRegion && officialPlotsConfig[selectedRegion]?.length > 0) {
      setSelectedPlot(officialPlotsConfig[selectedRegion][0]);
    } else {
      setSelectedPlot('');
    }
  }, [selectedRegion, officialPlotsConfig]);

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
        <label htmlFor="region-select">Region:</label>
        <select value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)}>
          {Object.keys(officialPlotsConfig).map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
        <label htmlFor="plot-select">Plot:</label>
        <select value={selectedPlot} onChange={(e) => setSelectedPlot(e.target.value)}>
          {officialPlotsConfig[selectedRegion]?.map((plot) => (
            <option key={plot} value={plot}>
              {plot}
            </option>
          )) || <option value=''>No plots available</option>}
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
