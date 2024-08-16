import React, { useState, useEffect, useCallback } from 'react';
import GridCanvas from './components/GridCanvas';
import SaveDialog from './components/SaveDialog/SaveDialog';
import ClearConfirmDialog from './components/ClearConfirmDialog/ClearConfirmDialog';
import LoadOfficialPlotDialog from './components/LoadOfficialPlotDialog/LoadOfficialPlotDialog';
import './App.css';

const GRID_WIDTH = 30;
const GRID_HEIGHT = 30;
const LEVELS = ['Ground Level', 'Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5', 'Level 6'];

const terrainTypes = [
  { name: 'Road', color: '#808080', symbol: '' },
  { name: 'Higher Unbuildable', color: '#4B3621', symbol: '' },
  { name: 'Unbuildable', color: '#8B4513', symbol: '' },
  { name: 'Water', color: '#ADD8E6', symbol: '' },
  { name: 'Platform', color: '#90EE90', symbol: '' },
  { name: 'Slopes / Stairs', color: '#FFFFFF', symbol: 'S', borderStyle: 'dashed' },
  { name: 'Bridge', color: '#FFFFFF', symbol: 'B', borderStyle: 'dashed' },
  { name: 'Overhang Platform', color: '#FFFFFF', symbol: '□', borderStyle: 'solid' },
  { name: 'Eraser', color: '#FFFFFF', symbol: '⌫' },
];

function App() {
  const [grids, setGrids] = useState(
    LEVELS.reduce((acc, level) => {
      acc[level] = Array(GRID_HEIGHT)
        .fill()
        .map(() => Array(GRID_WIDTH).fill(null));
      return acc;
    }, {})
  );
  const [currentLevel, setCurrentLevel] = useState(LEVELS[0]);
  const [currentTerrain, setCurrentTerrain] = useState(terrainTypes[0]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showClearConfirmDialog, setShowClearConfirmDialog] = useState(false);
  const [showLoadOfficialPlotDialog, setShowLoadOfficialPlotDialog] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [sourceLevelToCopy, setSourceLevelToCopy] = useState(LEVELS[0]);

  useEffect(() => {
    const updateCanvasSize = () => {
      setCanvasSize({
        width: window.innerWidth,
        height: window.innerHeight - 150,
      });
    };

    window.addEventListener('resize', updateCanvasSize);
    updateCanvasSize();

    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  const handleCellChange = (level, rowIndex, colIndex) => {
    setGrids((prevGrids) => {
      const newGrids = { ...prevGrids };
      newGrids[level] = [...newGrids[level]];
      newGrids[level][rowIndex] = [...newGrids[level][rowIndex]];
      newGrids[level][rowIndex][colIndex] = currentTerrain.name === 'Eraser' ? null : currentTerrain;
      return newGrids;
    });
  };

  const handleSave = () => {
    setShowSaveDialog(true);
  };

  const handleSaveConfirm = (plotName, mapArea) => {
    const plotData = {
      name: plotName,
      mapArea: mapArea,
      width: GRID_WIDTH,
      height: GRID_HEIGHT,
      grids: grids,
    };

    const jsonData = JSON.stringify(plotData, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${plotName.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setShowSaveDialog(false);
  };

  const handleClearAll = () => {
    setShowClearConfirmDialog(true);
  };

  const handleClearConfirm = () => {
    setGrids(
      LEVELS.reduce((acc, level) => {
        acc[level] = Array(GRID_HEIGHT)
          .fill()
          .map(() => Array(GRID_WIDTH).fill(null));
        return acc;
      }, {})
    );
    setShowClearConfirmDialog(false);
  };

  const handleCopyLevel = () => {
    setGrids((prevGrids) => ({
      ...prevGrids,
      [currentLevel]: [...prevGrids[sourceLevelToCopy]],
    }));
  };

  const handleLoadPlot = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const content = await file.text();
        const plotData = JSON.parse(content);
        setGrids(plotData.grids);
      } catch (error) {
        console.error('Error loading plot:', error);
        alert("Failed to load the plot. Please make sure it's a valid JSON file.");
      }
    }
  };

  const handleLoadOfficialPlot = () => {
    setShowLoadOfficialPlotDialog(true);
  };

  const loadOfficialPlot = useCallback(async (region, plotName) => {
    try {
      const response = await fetch(`/officialPlots/${region}/${plotName}.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const plotData = await response.json();
      setGrids(plotData.grids);
      setShowLoadOfficialPlotDialog(false);
    } catch (error) {
      console.error('Error loading official plot:', error);
      alert(`Failed to load the official plot: ${error.message}`);
    }
  }, []);

  return (
    <div className='app'>
      <div className='toolbar'>
        <div className='title'>
          V Rising <br />
          Castle Planner
        </div>
        <div className='terrain-buttons'>
          <div className='button-row'>
            {terrainTypes.slice(0, 5).map((terrain, index) => (
              <button
                key={index}
                onClick={() => setCurrentTerrain(terrain)}
                className={`terrain-button ${currentTerrain === terrain ? 'active' : ''}`}
                style={{ backgroundColor: terrain.color, color: terrain.color === '#FFFFFF' ? 'black' : 'white' }}
              >
                {terrain.name}
              </button>
            ))}
          </div>
          <div className='button-row'>
            {terrainTypes.slice(5).map((terrain, index) => (
              <button
                key={index + 5}
                onClick={() => setCurrentTerrain(terrain)}
                className={`terrain-button ${currentTerrain === terrain ? 'active' : ''}`}
                style={{ backgroundColor: terrain.color, color: terrain.color === '#FFFFFF' ? 'black' : 'white' }}
              >
                {terrain.name}
              </button>
            ))}
          </div>
        </div>
        <div className='utility-buttons'>
          <div className='button-row'>
            <button onClick={handleSave} className='save-button'>
              Save Plot
            </button>
            <button onClick={handleClearAll} className='clear-button'>
              Clear All
            </button>
          </div>
          <div className='button-row'>
            <div className='copy-level-container'>
              <select
                value={sourceLevelToCopy}
                onChange={(e) => setSourceLevelToCopy(e.target.value)}
                className='copy-level-select'
              >
                {LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
              <button onClick={handleCopyLevel} className='copy-level-button'>
                Copy Level
              </button>
            </div>
            <input type='file' accept='.json' onChange={handleLoadPlot} style={{ display: 'none' }} id='load-plot-input' />
            <button onClick={() => document.getElementById('load-plot-input').click()} className='load-button'>
              Load Local Plot
            </button>
            <button onClick={handleLoadOfficialPlot} className='load-official-button'>
              Load Official Plot
            </button>
          </div>
        </div>
      </div>
      <div className='level-selector'>
        {LEVELS.map((level) => (
          <button
            key={level}
            onClick={() => setCurrentLevel(level)}
            className={`level-button ${currentLevel === level ? 'active' : ''}`}
          >
            {level}
          </button>
        ))}
      </div>
      <GridCanvas
        grid={grids[currentLevel]}
        currentLevel={currentLevel}
        onCellChange={handleCellChange}
        width={canvasSize.width}
        height={canvasSize.height}
      />
      {showSaveDialog && <SaveDialog onSave={handleSaveConfirm} onClose={() => setShowSaveDialog(false)} />}
      {showClearConfirmDialog && (
        <ClearConfirmDialog onConfirm={handleClearConfirm} onCancel={() => setShowClearConfirmDialog(false)} />
      )}
      {showLoadOfficialPlotDialog && (
        <LoadOfficialPlotDialog onLoad={loadOfficialPlot} onClose={() => setShowLoadOfficialPlotDialog(false)} />
      )}
    </div>
  );
}

export default App;
