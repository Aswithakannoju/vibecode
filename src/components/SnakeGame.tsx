import React, { useEffect, useRef, useState, useCallback } from 'react';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const CANVAS_SIZE = GRID_SIZE * CELL_SIZE;
const INITIAL_SPEED = 150;

type Point = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

interface SnakeGameProps {
  onScoreChange: (score: number) => void;
}

export default function SnakeGame({ onScoreChange }: SnakeGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Point>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  
  const directionRef = useRef<Direction>(direction);
  const lastUpdateRef = useRef<number>(0);
  const requestRef = useRef<number>();

  // Keep ref in sync to avoid closure stale state in game loop
  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  const generateFood = useCallback((currentSnake: Point[]): Point => {
    let newFood: Point;
    let isOccupied = true;
    while (isOccupied) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      // eslint-disable-next-line no-loop-func
      isOccupied = currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
    }
    return newFood!;
  }, []);

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setDirection('RIGHT');
    directionRef.current = 'RIGHT';
    setFood(generateFood([{ x: 10, y: 10 }]));
    setGameOver(false);
    setIsPaused(false);
    setScore(0);
    onScoreChange(0);
  };

  const gameLoop = useCallback((time: number) => {
    if (gameOver || isPaused) {
      requestRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    if (time - lastUpdateRef.current > INITIAL_SPEED - Math.min(score * 2, 100)) {
      lastUpdateRef.current = time;

      setSnake((prevSnake) => {
        const head = prevSnake[0];
        const newHead = { ...head };

        switch (directionRef.current) {
          case 'UP': newHead.y -= 1; break;
          case 'DOWN': newHead.y += 1; break;
          case 'LEFT': newHead.x -= 1; break;
          case 'RIGHT': newHead.x += 1; break;
        }

        // Check collision with walls
        if (
          newHead.x < 0 || newHead.x >= GRID_SIZE ||
          newHead.y < 0 || newHead.y >= GRID_SIZE
        ) {
          setGameOver(true);
          return prevSnake;
        }

        // Check collision with self
        if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          setGameOver(true);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Check food collision
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore(s => {
            const newScore = s + 10;
            onScoreChange(newScore);
            return newScore;
          });
          setFood(generateFood(newSnake));
        } else {
          newSnake.pop(); // Remove tail if no food eaten
        }

        return newSnake;
      });
    }

    requestRef.current = requestAnimationFrame(gameLoop);
  }, [gameOver, isPaused, food, score, generateFood, onScoreChange]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [gameLoop]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default scrolling for arrow keys and space
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === ' ' && !gameOver) {
        setIsPaused(p => !p);
        return;
      }

      if (isPaused || gameOver) return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (directionRef.current !== 'DOWN') setDirection('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (directionRef.current !== 'UP') setDirection('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (directionRef.current !== 'RIGHT') setDirection('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (directionRef.current !== 'LEFT') setDirection('RIGHT');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPaused, gameOver]);

  // Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw grid (optional, for neon effect)
    ctx.strokeStyle = 'rgba(0, 243, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= CANVAS_SIZE; i += CELL_SIZE) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, CANVAS_SIZE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(CANVAS_SIZE, i);
      ctx.stroke();
    }

    // Draw food (Magenta)
    ctx.fillStyle = '#ff00ff';
    ctx.fillRect(food.x * CELL_SIZE, food.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);

    // Draw snake (Cyan)
    snake.forEach((segment, index) => {
      if (index === 0) {
        ctx.fillStyle = '#ffffff';
      } else {
        ctx.fillStyle = '#00ffff';
      }
      ctx.fillRect(segment.x * CELL_SIZE, segment.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    });

    // Reset shadow for text
    ctx.shadowBlur = 0;

    if (gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    } else if (isPaused) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#00f3ff';
      ctx.fillStyle = '#00f3ff';
      ctx.font = '30px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSED', CANVAS_SIZE / 2, CANVAS_SIZE / 2);
    }

  }, [snake, food, gameOver, isPaused]);

  return (
    <div className="flex flex-col items-center justify-center">
      <div 
        className="relative neon-border-cyan rounded-lg overflow-hidden cursor-pointer"
        onClick={() => {
          if (gameOver) resetGame();
        }}
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="block bg-gray-950"
        />
        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none bg-black/80">
            <h2 className="text-5xl font-black text-[#ff00ff] glitch-text mb-4 tracking-widest" data-text="CRITICAL FAILURE">CRITICAL FAILURE</h2>
            <p className="text-[#00ffff] text-xl animate-pulse font-mono">REBOOT_SEQUENCE [SPACE]</p>
          </div>
        )}
      </div>
      <div className="mt-6 text-[#00ffff] text-lg flex gap-6 font-mono">
        <span><kbd className="bg-[#ff00ff] text-black px-2 py-1 font-bold">WASD</kbd> / <kbd className="bg-[#ff00ff] text-black px-2 py-1 font-bold">ARROWS</kbd> : OVERRIDE</span>
        <span><kbd className="bg-[#00ffff] text-black px-2 py-1 font-bold">SPACE</kbd> : HALT</span>
      </div>
    </div>
  );
}
