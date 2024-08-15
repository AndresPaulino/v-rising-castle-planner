import React, { useState } from 'react';
import { Stage, Layer, Rect } from 'react-konva';

const CELL_SIZE = 20;
const GRID_WIDTH = 30;
const GRID_HEIGHT = 20;

function App() {
  const [grid, setGrid] = useState(
    Array(GRID_HEIGHT)
      .fill()
      .map(() => Array(GRID_WIDTH).fill('white'))
  );
  const [currentColor, setCurrentColor] = useState('green');

  const handleCellClick = (rowIndex, colIndex) => {
    const newGrid = [...grid];
    newGrid[rowIndex][colIndex] = currentColor;
    setGrid(newGrid);
  };

  return (
    <div>
      <div>
        <button onClick={() => setCurrentColor('green')}>Buildable</button>
        <button onClick={() => setCurrentColor('blue')}>Water</button>
        <button onClick={() => setCurrentColor('red')}>Boundary</button>
        <button onClick={() => setCurrentColor('yellow')}>Slope</button>
      </div>
      <Stage width={GRID_WIDTH * CELL_SIZE} height={GRID_HEIGHT * CELL_SIZE}>
        <Layer>
          {grid.map((row, rowIndex) =>
            row.map((color, colIndex) => (
              <Rect
                key={`${rowIndex}-${colIndex}`}
                x={colIndex * CELL_SIZE}
                y={rowIndex * CELL_SIZE}
                width={CELL_SIZE}
                height={CELL_SIZE}
                fill={color}
                stroke='black'
                strokeWidth={1}
                onClick={() => handleCellClick(rowIndex, colIndex)}
              />
            ))
          )}
        </Layer>
      </Stage>
    </div>
  );
}

export default App;
