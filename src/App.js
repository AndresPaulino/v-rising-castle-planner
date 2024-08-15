// src/App.js
import React, { useState, useEffect } from 'react';
import GridCanvas from './components/GridCanvas';
import SaveDialog from './components/SaveDialog/SaveDialog';
import ClearConfirmDialog from './components/ClearConfirmDialog/ClearConfirmDialog';
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
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateCanvasSize = () => {
      setCanvasSize({
        width: window.innerWidth,
        height: window.innerHeight - 175, // Adjust this value based on your toolbar and level selector height
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

  return (
    <div className='app'>
      <div className='toolbar'>
        <div className='title'>V Rising Pltr</div>
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
          <button onClick={handleSave} className='save-button'>
            Save Plot
          </button>
          <button onClick={handleClearAll} className='clear-button'>
            Clear All
          </button>
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
    </div>
  );
}

export default App;
