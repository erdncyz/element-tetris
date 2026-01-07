import { useState, useEffect, useCallback, useRef } from 'react';
import type { Cell, Tetromino, GameEffect } from './types';
import { GRID_COLS, GRID_ROWS, ELEMENT_COLORS } from './types';
import { createEmptyGrid, createRandomTetromino, checkCollision, rotateMatrix } from './gameUtils';
import { soundManager } from './SoundManager';
import confetti from 'canvas-confetti';

interface GameState {
    grid: Cell[][];
    currentPiece: Tetromino | null;
    nextPieces: Tetromino[];
    score: number;
    level: number;
    lines: number;
    gameOver: boolean;
    isPaused: boolean;
    effects: GameEffect[];
}

const INITIAL_SPEED = 1000;

export const useGameLogic = () => {
    const [gameState, setGameState] = useState<GameState>({
        grid: createEmptyGrid(),
        currentPiece: null,
        nextPieces: [],
        score: 0,
        level: 1,
        lines: 0,
        gameOver: false,
        isPaused: false,
        effects: [],
    });

    const speedRef = useRef(INITIAL_SPEED);
    const requestRef = useRef<number>(0);
    const lastTimeRef = useRef<number>(0);

    useEffect(() => {
        if (gameState.gameOver) {
            soundManager.playGameOver();
        }
    }, [gameState.gameOver]);

    // Initialize game
    useEffect(() => {
        const p1 = createRandomTetromino(1);
        const p2 = createRandomTetromino(1);
        const p3 = createRandomTetromino(1);
        const current = createRandomTetromino(1);

        setGameState(prev => ({
            ...prev,
            currentPiece: current,
            nextPieces: [p1, p2, p3],
        }));
    }, []);

    const move = useCallback((dir: { row: number; col: number }) => {
        setGameState(prev => {
            if (prev.gameOver || prev.isPaused || !prev.currentPiece) return prev;

            if (!checkCollision(prev.currentPiece, prev.grid, dir)) {
                return {
                    ...prev,
                    currentPiece: {
                        ...prev.currentPiece,
                        position: {
                            row: prev.currentPiece.position.row + dir.row,
                            col: prev.currentPiece.position.col + dir.col,
                        },
                    },
                };
            }
            return prev;
        });
        soundManager.playMove();
    }, []);

    const rotate = useCallback(() => {
        setGameState(prev => {
            if (prev.gameOver || prev.isPaused || !prev.currentPiece) return prev;

            const rotatedShape = rotateMatrix(prev.currentPiece.shape);
            const rotatedPiece = { ...prev.currentPiece, shape: rotatedShape };

            // Wall kicks (basic)
            const kicks = [
                { row: 0, col: 0 },
                { row: 0, col: -1 },
                { row: 0, col: 1 },
                { row: 0, col: -2 },
                { row: 0, col: 2 },
            ];

            for (const kick of kicks) {
                if (!checkCollision(rotatedPiece, prev.grid, kick)) {
                    return {
                        ...prev,
                        currentPiece: {
                            ...rotatedPiece,
                            position: {
                                row: rotatedPiece.position.row + kick.row,
                                col: rotatedPiece.position.col + kick.col,
                            },
                        },
                    };
                }
            }
            return prev;
        });
        soundManager.playRotate();
    }, []);

    const drop = useCallback(() => {
        setGameState(prev => {
            if (prev.gameOver || prev.isPaused || !prev.currentPiece) return prev;

            if (!checkCollision(prev.currentPiece, prev.grid, { row: 1, col: 0 })) {
                return {
                    ...prev,
                    currentPiece: {
                        ...prev.currentPiece,
                        position: {
                            row: prev.currentPiece.position.row + 1,
                            col: prev.currentPiece.position.col,
                        },
                    },
                };
            } else {
                // Lock piece
                return lockPiece(prev);
            }
        });
    }, []);

    const hardDrop = useCallback(() => {
        setGameState(prev => {
            if (prev.gameOver || prev.isPaused || !prev.currentPiece) return prev;

            let dropDist = 0;
            while (!checkCollision(prev.currentPiece, prev.grid, { row: dropDist + 1, col: 0 })) {
                dropDist++;
            }

            const droppedPiece = {
                ...prev.currentPiece,
                position: {
                    ...prev.currentPiece.position,
                    row: prev.currentPiece.position.row + dropDist,
                },
            };

            return lockPiece({ ...prev, currentPiece: droppedPiece });
        });
        soundManager.playDrop();
    }, []);

    const lockPiece = (state: GameState): GameState => {
        const { grid, currentPiece, nextPieces, score, level, lines } = state;
        if (!currentPiece) return state;

        // 1. Write piece to grid
        const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
        const { shape, position } = currentPiece;
        const newCells: { r: number, c: number }[] = [];

        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (shape[r][c] !== 'NONE') {
                    const row = position.row + r;
                    const col = position.col + c;
                    if (row >= 0 && row < GRID_ROWS && col >= 0 && col < GRID_COLS) {
                        newGrid[row][col] = {
                            type: shape[r][c],
                            color: ELEMENT_COLORS[shape[r][c]],
                            isEmpty: false,
                        };
                        newCells.push({ r: row, c: col });
                    } else if (row < 0) {
                        // Game Over if locking above board
                        return { ...state, gameOver: true };
                    }
                }
            }
        }

        // 2. Resolve Interactions & Gravity & Lines
        const { finalGrid, scoreDelta, linesCleared, isGameOver, newEffects } = resolveBoard(newGrid, level, newCells);

        if (isGameOver) {
            return { ...state, grid: finalGrid, gameOver: true };
        }

        // 3. Spawn next
        const [next, ...remaining] = nextPieces;
        const newNext = [...remaining, createRandomTetromino(level)];

        // Check if new piece collides immediately (Game Over)
        if (checkCollision(next, finalGrid)) {
            return { ...state, grid: finalGrid, gameOver: true };
        }

        // Level up logic
        const newLines = lines + linesCleared;
        // Level up directly by lines cleared (User: "her satır patlamada direk 1 level artır")
        const newLevel = level + linesCleared;

        // Speed curve: Starts at 1000ms, decreases by 50ms per level, min 100ms
        speedRef.current = Math.max(100, 1000 - (newLevel - 1) * 50);

        return {
            ...state,
            grid: finalGrid,
            currentPiece: next,
            nextPieces: newNext,
            score: score + scoreDelta,
            lines: newLines,
            level: newLevel,
            effects: newEffects, // Only show new effects for this turn
        };
    };

    const resolveBoard = (startGrid: Cell[][], _level: number, initialActiveCells: { r: number, c: number }[]) => {
        let grid = startGrid.map(row => row.map(c => ({ ...c })));
        let activeCells = [...initialActiveCells];
        const exhaustedCells = new Set<string>();

        let totalScore = 0;
        let totalLines = 0;
        let stable = false;
        let combo = 0;
        const newEffects: GameEffect[] = [];

        while (!stable) {
            stable = true;
            const toRemove: { r: number, c: number, reason: string }[] = [];

            // 1. Interactions
            for (const { r, c } of activeCells) {
                if (r < 0 || r >= GRID_ROWS || c < 0 || c >= GRID_COLS) continue;
                const cell = grid[r][c];
                if (cell.isEmpty) continue;

                if (exhaustedCells.has(`${r},${c}`)) continue;

                const neighbors = [
                    { r: r - 1, c }, { r: r + 1, c }
                ];

                if (cell.type === 'FIRE') {
                    for (const n of neighbors) {
                        if (n.r >= 0 && n.r < GRID_ROWS && n.c >= 0 && n.c < GRID_COLS) {
                            if (grid[n.r][n.c].type === 'WATER') {
                                toRemove.push({ r: n.r, c: n.c, reason: 'FIRE_EXTINGUISHED' });
                                toRemove.push({ r, c, reason: 'FIRE_EXTINGUISHED' });
                                exhaustedCells.add(`${r},${c}`);
                                break;
                            }
                        }
                    }
                }

                if (cell.type === 'WATER') {
                    for (const n of neighbors) {
                        if (n.r >= 0 && n.r < GRID_ROWS && n.c >= 0 && n.c < GRID_COLS) {
                            if (grid[n.r][n.c].type === 'FIRE') {
                                toRemove.push({ r: n.r, c: n.c, reason: 'FIRE_EXTINGUISHED' });
                                toRemove.push({ r, c, reason: 'FIRE_EXTINGUISHED' });
                                exhaustedCells.add(`${r},${c}`);
                                break;
                            }
                        }
                    }
                }

                if (cell.type === 'DYNAMITE') {
                    if (r + 1 < GRID_ROWS) {
                        if (grid[r + 1][c].type === 'ROCK') {
                            toRemove.push({ r: r + 1, c, reason: 'ROCK_DESTROYED' });
                            toRemove.push({ r, c, reason: 'ROCK_DESTROYED' });
                            exhaustedCells.add(`${r},${c}`);
                        } else if (!grid[r + 1][c].isEmpty) {
                            toRemove.push({ r, c, reason: 'DYNAMITE_WASTED' });
                        }
                    } else {
                        toRemove.push({ r, c, reason: 'DYNAMITE_WASTED' });
                    }
                }
            }

            // Apply removals
            if (toRemove.length > 0) {
                stable = false;
                toRemove.forEach(({ r, c, reason }) => {
                    if (grid[r][c].type !== 'NONE') {
                        grid[r][c] = { type: 'NONE', color: ELEMENT_COLORS.NONE, isEmpty: true };

                        if (reason === 'FIRE_EXTINGUISHED') {
                            totalScore += 20;
                            newEffects.push({
                                id: Math.random().toString(36).substr(2, 9),
                                row: r, col: c, type: 'SPLASH', value: '+20', color: '#00BFFF'
                            });
                            soundManager.playSplash();
                        }
                        if (reason === 'ROCK_DESTROYED') {
                            totalScore += 50;
                            newEffects.push({
                                id: Math.random().toString(36).substr(2, 9),
                                row: r, col: c, type: 'EXPLOSION', value: '+50', color: '#FF4500'
                            });
                            soundManager.playRockBreak();
                        }
                        if (reason === 'DYNAMITE_WASTED') {
                            totalScore -= 10;
                            newEffects.push({
                                id: Math.random().toString(36).substr(2, 9),
                                row: r, col: c, type: 'SCORE', value: '-10', color: '#FF0000'
                            });
                        }
                    }
                });
                combo++;
            }

            // 2. Line Clears
            let linesClearedThisPass = 0;
            for (let r = 0; r < GRID_ROWS; r++) {
                if (grid[r].every(cell => !cell.isEmpty)) {
                    const firstType = grid[r][0].type;
                    const allSame = grid[r].every(cell => cell.type === firstType);

                    if (allSame) {
                        linesClearedThisPass++;
                        grid[r] = Array(GRID_COLS).fill(null).map(() => ({ type: 'NONE', color: ELEMENT_COLORS.NONE, isEmpty: true }));
                        stable = false;
                    }
                }
            }

            if (linesClearedThisPass > 0) {
                totalLines += linesClearedThisPass;
                totalScore += linesClearedThisPass * 100 * (combo + 1);
                // Add line clear effect roughly in the middle
                newEffects.push({
                    id: Math.random().toString(36).substr(2, 9),
                    row: GRID_ROWS / 2, col: GRID_COLS / 2, type: 'EXPLOSION', value: 'LEVEL UP!', color: '#FFD700'
                });
                confetti({ particleCount: 50 * linesClearedThisPass, spread: 60, origin: { y: 0.7 } });
                soundManager.playClear();
            }

            // 3. Gravity
            const nextActiveCells: { r: number, c: number }[] = [];
            for (let c = 0; c < GRID_COLS; c++) {
                for (let r = GRID_ROWS - 1; r >= 0; r--) {
                    if (grid[r][c].isEmpty) {
                        for (let k = r - 1; k >= 0; k--) {
                            if (!grid[k][c].isEmpty) {
                                grid[r][c] = grid[k][c];
                                grid[k][c] = { type: 'NONE', color: ELEMENT_COLORS.NONE, isEmpty: true };

                                if (exhaustedCells.has(`${k},${c}`)) {
                                    exhaustedCells.delete(`${k},${c}`);
                                    exhaustedCells.add(`${r},${c}`);
                                }

                                nextActiveCells.push({ r, c });
                                stable = false;
                                break;
                            }
                        }
                    }
                }
            }
            activeCells = nextActiveCells;
        }

        return { finalGrid: grid, scoreDelta: totalScore, linesCleared: totalLines, isGameOver: false, newEffects };
    };

    // Game Loop
    const gameLoop = (time: number) => {
        if (!lastTimeRef.current) lastTimeRef.current = time;
        const deltaTime = time - lastTimeRef.current;

        if (deltaTime > speedRef.current) {
            drop();
            lastTimeRef.current = time;
        }
        requestRef.current = requestAnimationFrame(gameLoop);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(gameLoop);
        return () => cancelAnimationFrame(requestRef.current!);
    }, [drop, gameState.gameOver, gameState.isPaused]);

    const restart = useCallback(() => {
        const p1 = createRandomTetromino(1);
        const p2 = createRandomTetromino(1);
        const p3 = createRandomTetromino(1);
        const current = createRandomTetromino(1);

        setGameState({
            grid: createEmptyGrid(),
            currentPiece: current,
            nextPieces: [p1, p2, p3],
            score: 0,
            level: 1,
            lines: 0,
            gameOver: false,
            isPaused: false,
            effects: [],
        });
        speedRef.current = INITIAL_SPEED;
    }, []);

    return {
        gameState,
        move,
        rotate,
        drop,
        hardDrop,
        pause: () => setGameState(prev => ({ ...prev, isPaused: !prev.isPaused })),
        restart,
    };
};
