import React, { useRef, useEffect, useLayoutEffect, useState, useCallback } from 'react';
import { Stage, Layer, Rect, Text, Line } from 'react-konva';

const CELL_SIZE = 20;
const AXIS_PADDING = 40;

const GridCanvas = ({ grid, currentLevel, onCellChange, width, height }) => {
  const stageRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [stageScale, setStageScale] = useState(1);
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
  const [cursorStyle, setCursorStyle] = useState('default');

  const initializeCanvas = useCallback(() => {
    if (stageRef.current && grid && grid.length > 0 && grid[0].length > 0) {
      const stage = stageRef.current;
      const gridWidth = grid[0].length * CELL_SIZE;
      const gridHeight = grid.length * CELL_SIZE;
      const scaleX = (width - AXIS_PADDING * 2) / gridWidth;
      const scaleY = (height - AXIS_PADDING * 2) / gridHeight;
      const scale = Math.min(scaleX, scaleY, 1);

      setStageScale(scale);

      const scaledGridWidth = gridWidth * scale;
      const scaledGridHeight = gridHeight * scale;

      setStagePosition({
        x: (width - scaledGridWidth) / 2,
        y: (height - scaledGridHeight) / 2,
      });

      stage.batchDraw();
    }
  }, [grid, width, height]);

  useLayoutEffect(() => {
    initializeCanvas();
  }, [initializeCanvas]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleKeyDown = (e) => {
    if (e.code === 'Space') {
      setIsPanning(true);
      setCursorStyle('grab');
    }
  };

  const handleKeyUp = (e) => {
    if (e.code === 'Space') {
      setIsPanning(false);
      setCursorStyle('default');
    }
  };

  const handleCellChange = (rowIndex, colIndex) => {
    onCellChange(currentLevel, rowIndex, colIndex);
  };

  const getGridCoordinates = (pointerPosition) => {
    const stage = stageRef.current;
    if (!stage) return { x: -1, y: -1 };

    const transform = stage.getAbsoluteTransform().copy().invert();
    const pos = transform.point(pointerPosition);

    const x = Math.floor(pos.x / CELL_SIZE);
    const y = grid.length - 1 - Math.floor(pos.y / CELL_SIZE);

    return { x, y };
  };

  const handleMouseDown = (e) => {
    if (isPanning) {
      setCursorStyle('grabbing');
    } else {
      setIsDrawing(true);
      const pos = getGridCoordinates(e.target.getStage().getPointerPosition());
      if (pos.x >= 0 && pos.x < grid[0].length && pos.y >= 0 && pos.y < grid.length) {
        handleCellChange(pos.y, pos.x);
      }
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    if (isPanning) {
      setCursorStyle('grab');
    }
  };

  const handleMouseMove = (e) => {
    const stage = e.target.getStage();
    if (isPanning) {
      const dx = e.evt.movementX;
      const dy = e.evt.movementY;
      setStagePosition({
        x: stage.x() + dx,
        y: stage.y() + dy,
      });
    } else if (isDrawing) {
      const pos = getGridCoordinates(stage.getPointerPosition());
      if (pos.x >= 0 && pos.x < grid[0].length && pos.y >= 0 && pos.y < grid.length) {
        handleCellChange(pos.y, pos.x);
      }
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

  const renderAxisNumbers = () => {
    const numbers = [];
    // X-axis numbers (at the bottom)
    for (let i = 0; i < grid[0].length; i++) {
      numbers.push(
        <Text
          key={`x-${i}`}
          x={i * CELL_SIZE}
          y={grid.length * CELL_SIZE + 10}
          width={CELL_SIZE}
          height={AXIS_PADDING - 5}
          text={i.toString()}
          fontSize={10}
          fill='black'
          align='center'
          verticalAlign='top'
        />
      );
    }
    // Y-axis numbers (starting from bottom)
    for (let i = 0; i < grid.length; i++) {
      numbers.push(
        <Text
          key={`y-${i}`}
          x={-AXIS_PADDING - 10}
          y={(grid.length - 1 - i) * CELL_SIZE}
          width={AXIS_PADDING - 5}
          height={CELL_SIZE}
          text={i.toString()}
          fontSize={10}
          fill='black'
          align='right'
          verticalAlign='middle'
        />
      );
    }
    return numbers;
  };

  const renderCell = (cell, x, y) => {
    if (!cell) return null;

    const { color, symbol, borderStyle } = cell;

    return (
      <React.Fragment key={`${x}-${y}`}>
        <Rect
          x={x * CELL_SIZE}
          y={(grid.length - 1 - y) * CELL_SIZE}
          width={CELL_SIZE}
          height={CELL_SIZE}
          fill={color}
          stroke='black'
          strokeWidth={0.5}
        />
        {symbol && (
          <Text
            x={x * CELL_SIZE}
            y={(grid.length - 1 - y) * CELL_SIZE}
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
            x={x * CELL_SIZE}
            y={(grid.length - 1 - y) * CELL_SIZE}
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
      scale={{ x: stageScale, y: stageScale }}
      x={stagePosition.x}
      y={stagePosition.y}
      style={{ cursor: cursorStyle }}
    >
      <Layer>
        {renderAxisNumbers()}
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
      <Layer>{grid.map((row, rowIndex) => row.map((cell, colIndex) => renderCell(cell, colIndex, rowIndex)))}</Layer>
    </Stage>
  );
};

export default GridCanvas;
