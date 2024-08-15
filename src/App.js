import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Text, Line } from 'react-konva';
import SaveDialog from './SaveDialog';
import './App.css';
import ClearConfirmDialog from './ClearConfirmDialog';

const CELL_SIZE = 20;
const GRID_WIDTH = 25;
const GRID_HEIGHT = 25;

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
  const [grid, setGrid] = useState(
    Array(GRID_HEIGHT)
      .fill()
      .map(() => Array(GRID_WIDTH).fill({ type: null }))
  );
  const [currentTerrain, setCurrentTerrain] = useState(terrainTypes[0]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showClearConfirmDialog, setShowClearConfirmDialog] = useState(false);
  const stageRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        setIsPanning(true);
        document.body.style.cursor = 'grab';
      }
    };
    const handleKeyUp = (e) => {
      if (e.code === 'Space') {
        setIsPanning(false);
        document.body.style.cursor = 'default';
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (stageRef.current) {
      const stage = stageRef.current;
      const scale = stage.scaleX();
      const x = window.innerWidth / 2 - (GRID_WIDTH * CELL_SIZE * scale) / 2;
      const y = window.innerHeight / 2 - (GRID_HEIGHT * CELL_SIZE * scale) / 2;
      stage.position({ x, y });
      stage.batchDraw();
    }
  }, []);

  const handleCellChange = (rowIndex, colIndex) => {
    const newGrid = [...grid];
    if (currentTerrain.name === 'Eraser') {
      newGrid[rowIndex][colIndex] = { type: null };
    } else {
      newGrid[rowIndex][colIndex] = { type: currentTerrain };
    }
    setGrid(newGrid);
  };

  const handleClearAll = () => {
    setShowClearConfirmDialog(true);
  };

  const handleClearConfirm = () => {
    setGrid(
      Array(GRID_HEIGHT)
        .fill()
        .map(() => Array(GRID_WIDTH).fill({ type: null }))
    );
    setShowClearConfirmDialog(false);
  };

  const handleMouseDown = () => {
    setIsDrawing(true);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || isPanning) return;
    const stage = stageRef.current;
    const point = stage.getPointerPosition();
    const x = Math.floor((point.x - stage.x()) / (CELL_SIZE * stage.scaleX()));
    const y = Math.floor((point.y - stage.y()) / (CELL_SIZE * stage.scaleY()));
    if (x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT) {
      handleCellChange(y, x);
    }
  };

  const handleWheel = (e) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const stage = stageRef.current;
    const oldScale = stage.scaleX();
    const mousePointTo = {
      x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
      y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale,
    };
    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    stage.scale({ x: newScale, y: newScale });
    const newPos = {
      x: -(mousePointTo.x - stage.getPointerPosition().x / newScale) * newScale,
      y: -(mousePointTo.y - stage.getPointerPosition().y / newScale) * newScale,
    };
    stage.position(newPos);
    stage.batchDraw();
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
      grid: grid,
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

  const renderCell = (cell, x, y) => {
    if (!cell.type) return null;

    const { color, symbol, borderStyle } = cell.type;

    return (
      <React.Fragment>
        <Rect x={x} y={y} width={CELL_SIZE} height={CELL_SIZE} fill={color} stroke='black' strokeWidth={0.5} />
        {symbol && (
          <Text
            x={x}
            y={y}
            width={CELL_SIZE}
            height={CELL_SIZE}
            text={symbol}
            fontSize={14}
            fontStyle='bold'
            fill='black'
            align='center'
            verticalAlign='middle'
          />
        )}
        {borderStyle === 'dashed' && (
          <Line
            x={x}
            y={y}
            points={[0, 0, CELL_SIZE, 0, CELL_SIZE, CELL_SIZE, 0, CELL_SIZE, 0, 0]}
            stroke='black'
            strokeWidth={1}
            dash={[2, 2]}
          />
        )}
        {cell.type.name === 'Overhang Platform' && (
          <Rect
            x={x + CELL_SIZE * 0.2}
            y={y + CELL_SIZE * 0.2}
            width={CELL_SIZE * 0.6}
            height={CELL_SIZE * 0.6}
            fill='white'
            stroke='black'
            strokeWidth={0.5}
          />
        )}
      </React.Fragment>
    );
  };

  return (
    <div className='app'>
      <div className='toolbar'>
        <div className='title'>V Rising <br />Plotter</div>
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
      <Stage
        width={window.innerWidth}
        height={window.innerHeight - 50}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onWheel={handleWheel}
        draggable={isPanning}
        ref={stageRef}
      >
        <Layer>
          {/* Grid lines */}
          {[...Array(GRID_WIDTH + 1)].map((_, i) => (
            <Line
              key={`vertical-${i}`}
              points={[i * CELL_SIZE, 0, i * CELL_SIZE, GRID_HEIGHT * CELL_SIZE]}
              stroke='#aaa'
              strokeWidth={0.5}
            />
          ))}
          {[...Array(GRID_HEIGHT + 1)].map((_, i) => (
            <Line
              key={`horizontal-${i}`}
              points={[0, i * CELL_SIZE, GRID_WIDTH * CELL_SIZE, i * CELL_SIZE]}
              stroke='#aaa'
              strokeWidth={0.5}
            />
          ))}
        </Layer>
        <Layer>
          {/* Terrain cells */}
          {grid.map((row, rowIndex) => row.map((cell, colIndex) => renderCell(cell, colIndex * CELL_SIZE, rowIndex * CELL_SIZE)))}
        </Layer>
      </Stage>
      {showSaveDialog && <SaveDialog onSave={handleSaveConfirm} onClose={() => setShowSaveDialog(false)} />}
      {showClearConfirmDialog && (
        <ClearConfirmDialog onConfirm={handleClearConfirm} onCancel={() => setShowClearConfirmDialog(false)} />
      )}
    </div>
  );
}

export default App;