import React, { useEffect, useRef, useState } from 'react';
import { useGameLogic } from './game/useGameLogic';
import { GameBoard } from './components/GameBoard';
import { StartScreen } from './components/StartScreen';
import { soundManager } from './game/SoundManager';
import './index.css';

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const { gameState, move, rotate, drop, hardDrop, pause, restart } = useGameLogic();
  const { grid, currentPiece, score, level, lines, gameOver, isPaused } = gameState;

  const handleStartGame = () => {
    setGameStarted(true);
    soundManager.playMusic();
    restart();
  };

  // Keyboard controls
  useEffect(() => {
    if (!gameStarted) return;
    
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
  }, [move, rotate, drop, hardDrop, pause, gameOver, gameStarted]);

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

  // Show start screen if game hasn't started
  if (!gameStarted) {
    return <StartScreen onStartGame={handleStartGame} />;
  }

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
            <button 
              onClick={() => setGameStarted(false)} 
              style={{ backgroundColor: '#555' }}
            >
              ANA MENÜ
            </button>
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
              background: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              zIndex: 10,
              borderRadius: 16,
              animation: 'fadeIn 0.3s ease-out',
            }}>
              <h2 style={{
                fontSize: '3.5rem',
                margin: 0,
                marginBottom: '1rem',
                fontFamily: 'Orbitron, monospace',
                fontWeight: 900,
                background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 40px rgba(250, 112, 154, 0.5)',
                letterSpacing: '3px',
              }}>GAME OVER</h2>
              <p style={{
                fontSize: '1.8rem',
                marginBottom: '2rem',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>Final Score: {score}</p>
              <button onClick={restart} style={{
                fontSize: '1.3rem',
                padding: '15px 40px',
                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 6px 25px rgba(67, 233, 123, 0.4)',
              }}>🎮 Try Again</button>
              <button 
                onClick={() => setGameStarted(false)} 
                style={{
                  fontSize: '1rem',
                  padding: '12px 30px',
                  marginTop: '15px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: 'white',
                  boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
                }}
              >🏠 Ana Menü</button>
            </div>
          )}

          {isPaused && !gameOver && (
            <div style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(15px) saturate(180%)',
              WebkitBackdropFilter: 'blur(15px) saturate(180%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              zIndex: 10,
              borderRadius: 16,
              animation: 'fadeIn 0.2s ease-out',
            }}>
              <h2 style={{
                fontSize: '3rem',
                fontFamily: 'Orbitron, monospace',
                fontWeight: 900,
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 40px rgba(79, 172, 254, 0.5)',
                letterSpacing: '5px',
                animation: 'pulse 2s ease-in-out infinite',
              }}>⏸️ PAUSED</h2>
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


      </div>
    </div>
  );
}

export default App;
