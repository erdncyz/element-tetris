import React, { useEffect, useRef } from 'react';
import { useGameLogic } from './game/useGameLogic';
import { GameBoard } from './components/GameBoard';
import { soundManager } from './game/SoundManager';
import './index.css';

function App() {
  const { gameState, move, rotate, drop, hardDrop, pause, restart } = useGameLogic();
  const { grid, currentPiece, score, level, lines, gameOver, isPaused } = gameState;

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Auto-start music on first interaction
      soundManager.playMusic();

      if (gameOver) return;

      switch (e.key) {
        case 'ArrowLeft':
          move({ row: 0, col: -1 });
          break;
        case 'ArrowRight':
          move({ row: 0, col: 1 });
          break;
        case 'ArrowDown':
          drop();
          break;
        case 'ArrowUp':
          rotate();
          break;
        case ' ':
          hardDrop();
          break;
        case 'p':
        case 'P':
          pause();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move, rotate, drop, hardDrop, pause, gameOver]);

  // Touch handling
  const touchRef = useRef<{ x: number, y: number, time: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    // Auto-start music on first touch
    soundManager.playMusic();

    touchRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now()
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchRef.current) return;

    const startX = touchRef.current.x;
    const startY = touchRef.current.y;
    const startTime = touchRef.current.time;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const endTime = Date.now();

    const diffX = endX - startX;
    const diffY = endY - startY;
    const dist = Math.sqrt(diffX * diffX + diffY * diffY);
    const duration = endTime - startTime;

    // Tap detection (short duration, small movement)
    if (duration < 300 && dist < 10) {
      rotate();
      return;
    }

    // Swipe detection
    if (dist > 30) { // Minimum swipe distance
      if (Math.abs(diffX) > Math.abs(diffY)) {
        // Horizontal
        if (diffX > 0) {
          move({ row: 0, col: 1 });
        } else {
          move({ row: 0, col: -1 });
        }
      } else {
        // Vertical
        if (diffY > 0) {
          hardDrop(); // Swipe Down -> Hard Drop (User request)
        } else {
          drop(); // Swipe Up -> Soft Drop
        }
      }
    }

    touchRef.current = null;
  };

  return (
    <div>
      <h1>Element Tetris</h1>

      <div className="game-container">
        <div className="sidebar">
          <div className="stat-box">
            <div className="stat-label">SCORE</div>
            <div className="stat-value">{score}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">LEVEL</div>
            <div className="stat-value">{level}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">LINES</div>
            <div className="stat-value">{lines}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button onClick={pause}>{isPaused ? 'RESUME' : 'PAUSE'}</button>
            <button onClick={restart} style={{ backgroundColor: '#d32f2f' }}>RESTART</button>
          </div>
        </div>

        <div
          style={{ position: 'relative', touchAction: 'none' }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <GameBoard grid={grid} currentPiece={currentPiece} />

          {gameOver && (
            <div style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.85)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              zIndex: 10,
              borderRadius: 8,
            }}>
              <h2 style={{ fontSize: '3rem', margin: 0, color: '#ff4444' }}>GAME OVER</h2>
              <p style={{ fontSize: '1.5rem' }}>Final Score: {score}</p>
              <button onClick={restart} style={{ fontSize: '1.2rem', padding: '10px 20px' }}>Try Again</button>
            </div>
          )}

          {isPaused && !gameOver && (
            <div style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              zIndex: 10,
              borderRadius: 8,
            }}>
              <h2>PAUSED</h2>
            </div>
          )}
          <div style={{
            textAlign: 'center',
            padding: '20px',
            marginTop: '20px',
          }}>
            <a
              href="https://erdincyilmaz.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'rgba(255, 255, 255, 0.3)',
                fontSize: '0.8rem',
                fontFamily: 'monospace',
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'color 0.3s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'}
              onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.3)'}
            >
              Developed by Mercury Software
            </a>
          </div>
        </div>

        <div className="sidebar">
          {/* This sidebar is currently empty after removing the music control button. */}
        </div>
      </div>
    </div>
  );
}

export default App;
