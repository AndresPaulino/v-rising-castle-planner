// src/components/GridCanvas.js
import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Text, Line } from 'react-konva';

const CELL_SIZE = 20;

const GridCanvas = ({ grid, currentLevel, onCellChange, width, height }) => {
  const stageRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [stageScale, setStageScale] = useState(1);
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });

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
      const scale = Math.min(width / (grid[0].length * CELL_SIZE), height / (grid.length * CELL_SIZE));
      const newWidth = grid[0].length * CELL_SIZE * scale;
      const newHeight = grid.length * CELL_SIZE * scale;
      const x = (width - newWidth) / 2;
      const y = (height - newHeight) / 2;
      stage.width(width);
      stage.height(height);
      setStageScale(scale);
      setStagePosition({ x, y });
      stage.batchDraw();
    }
  }, [grid, width, height]);

  const handleCellChange = (rowIndex, colIndex) => {
    onCellChange(currentLevel, rowIndex, colIndex);
  };

  const handleMouseDown = (e) => {
    if (!isPanning) {
      setIsDrawing(true);
      const stage = e.target.getStage();
      const pointerPosition = stage.getPointerPosition();
      const x = Math.floor((pointerPosition.x - stage.x()) / (CELL_SIZE * stage.scaleX()));
      const y = Math.floor((pointerPosition.y - stage.y()) / (CELL_SIZE * stage.scaleY()));
      if (x >= 0 && x < grid[0].length && y >= 0 && y < grid.length) {
        handleCellChange(y, x);
      }
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || isPanning) return;
    const stage = e.target.getStage();
    const pointerPosition = stage.getPointerPosition();
    const x = Math.floor((pointerPosition.x - stage.x()) / (CELL_SIZE * stage.scaleX()));
    const y = Math.floor((pointerPosition.y - stage.y()) / (CELL_SIZE * stage.scaleY()));
    if (x >= 0 && x < grid[0].length && y >= 0 && y < grid.length) {
      handleCellChange(y, x);
    }
  };

  const handleWheel = (e) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const stage = e.target.getStage();
    const oldScale = stage.scaleX();
    const mousePointTo = {
      x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
      y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale,
    };
    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    setStageScale(newScale);
    const newPos = {
      x: -(mousePointTo.x - stage.getPointerPosition().x / newScale) * newScale,
      y: -(mousePointTo.y - stage.getPointerPosition().y / newScale) * newScale,
    };
    setStagePosition(newPos);
  };

  const renderCell = (cell, x, y) => {
    if (!cell) return null;

    const { color, symbol, borderStyle } = cell;

    return (
      <React.Fragment key={`${x}-${y}`}>
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
      </React.Fragment>
    );
  };

  return (
    <Stage
      ref={stageRef}
      width={width}
      height={height}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      onWheel={handleWheel}
      draggable={isPanning}
      scale={{ x: stageScale, y: stageScale }}
      position={stagePosition}
    >
      <Layer>
        {/* Grid lines */}
        {grid[0].map((_, colIndex) => (
          <Line
            key={`vertical-${colIndex}`}
            points={[colIndex * CELL_SIZE, 0, colIndex * CELL_SIZE, grid.length * CELL_SIZE]}
            stroke='#aaa'
            strokeWidth={0.5}
          />
        ))}
        {grid.map((_, rowIndex) => (
          <Line
            key={`horizontal-${rowIndex}`}
            points={[0, rowIndex * CELL_SIZE, grid[0].length * CELL_SIZE, rowIndex * CELL_SIZE]}
            stroke='#aaa'
            strokeWidth={0.5}
          />
        ))}
        {/* Right border */}
        <Line
          points={[grid[0].length * CELL_SIZE, 0, grid[0].length * CELL_SIZE, grid.length * CELL_SIZE]}
          stroke='#aaa'
          strokeWidth={0.5}
        />
        {/* Bottom border */}
        <Line
          points={[0, grid.length * CELL_SIZE, grid[0].length * CELL_SIZE, grid.length * CELL_SIZE]}
          stroke='#aaa'
          strokeWidth={0.5}
        />
      </Layer>
      <Layer>
        {grid.map((row, rowIndex) => row.map((cell, colIndex) => renderCell(cell, colIndex * CELL_SIZE, rowIndex * CELL_SIZE)))}
      </Layer>
    </Stage>
  );
};

export default GridCanvas;
