import { useState, useEffect, useCallback, useRef } from 'react';
import type { Cell, Tetromino } from './types';
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
        const { finalGrid, scoreDelta, linesCleared, isGameOver } = resolveBoard(newGrid, level, newCells);

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
        // Level up every 2 lines
        const newLevel = Math.floor(newLines / 2) + 1;

        // Speed curve: Starts at 400ms (Fast!), decreases by 30ms per level, min 40ms
        speedRef.current = Math.max(40, 400 - (newLevel - 1) * 30);

        return {
            ...state,
            grid: finalGrid,
            currentPiece: next,
            nextPieces: newNext,
            score: score + scoreDelta,
            lines: newLines,
            level: newLevel,
        };
    };

    const resolveBoard = (startGrid: Cell[][], _level: number, initialActiveCells: { r: number, c: number }[]) => {
        let grid = startGrid.map(row => row.map(c => ({ ...c })));
        let activeCells = [...initialActiveCells];
        // Track cells that have already interacted this turn to prevent "drilling"
        const exhaustedCells = new Set<string>();

        let totalScore = 0;
        let totalLines = 0;
        let stable = false;
        let combo = 0;

        while (!stable) {
            stable = true;
            const toRemove: { r: number, c: number, reason: string }[] = [];

            // 1. Interactions (Check only active cells)
            for (const { r, c } of activeCells) {
                if (r < 0 || r >= GRID_ROWS || c < 0 || c >= GRID_COLS) continue;
                const cell = grid[r][c];
                if (cell.isEmpty) continue;

                // If this cell has already killed something, it's exhausted for this turn
                if (exhaustedCells.has(`${r},${c}`)) continue;

                const neighbors = [
                    { r: r - 1, c }, { r: r + 1, c }
                ];

                if (cell.type === 'FIRE') {
                    // Fire vs Water: Both disappear
                    for (const n of neighbors) {
                        if (n.r >= 0 && n.r < GRID_ROWS && n.c >= 0 && n.c < GRID_COLS) {
                            if (grid[n.r][n.c].type === 'WATER') {
                                toRemove.push({ r: n.r, c: n.c, reason: 'FIRE_EXTINGUISHED' }); // Remove Water
                                toRemove.push({ r, c, reason: 'FIRE_EXTINGUISHED' }); // Remove Fire (Self)
                                exhaustedCells.add(`${r},${c}`);
                                break;
                            }
                        }
                    }
                }

                if (cell.type === 'WATER') {
                    // Water vs Fire: Both disappear
                    for (const n of neighbors) {
                        if (n.r >= 0 && n.r < GRID_ROWS && n.c >= 0 && n.c < GRID_COLS) {
                            if (grid[n.r][n.c].type === 'FIRE') {
                                toRemove.push({ r: n.r, c: n.c, reason: 'FIRE_EXTINGUISHED' }); // Remove Fire
                                toRemove.push({ r, c, reason: 'FIRE_EXTINGUISHED' }); // Remove Water (Self)
                                exhaustedCells.add(`${r},${c}`);
                                break;
                            }
                        }
                    }
                }

                if (cell.type === 'DYNAMITE') {
                    // Dynamite vs Rock: Both disappear
                    if (r + 1 < GRID_ROWS) {
                        if (grid[r + 1][c].type === 'ROCK') {
                            toRemove.push({ r: r + 1, c, reason: 'ROCK_DESTROYED' }); // Remove Rock
                            toRemove.push({ r, c, reason: 'ROCK_DESTROYED' }); // Remove Dynamite (Self)
                            exhaustedCells.add(`${r},${c}`);
                        } else if (!grid[r + 1][c].isEmpty) {
                            // Dynamite landed on something else (not Rock) -> Wasted
                            toRemove.push({ r, c, reason: 'DYNAMITE_WASTED' });
                        }
                    } else {
                        // Dynamite on floor -> Wasted
                        toRemove.push({ r, c, reason: 'DYNAMITE_WASTED' });
                    }
                }
            }

            // Apply removals
            if (toRemove.length > 0) {
                stable = false; // Removals happened, so we need to check gravity
                toRemove.forEach(({ r, c, reason }) => {
                    if (grid[r][c].type !== 'NONE') {
                        grid[r][c] = { type: 'NONE', color: ELEMENT_COLORS.NONE, isEmpty: true };
                        if (reason === 'FIRE_EXTINGUISHED') {
                            totalScore += 20;
                            soundManager.playSplash();
                        }
                        if (reason === 'ROCK_DESTROYED') {
                            totalScore += 50;
                            soundManager.playRockBreak();
                        }
                        if (reason === 'DYNAMITE_WASTED') {
                            totalScore -= 10;
                            // soundManager.playFizzle(); // Optional
                        }
                    }
                });
                combo++;
            }

            // 2. Line Clears (Mark as empty, let gravity handle shift)
            let linesClearedThisPass = 0;
            for (let r = 0; r < GRID_ROWS; r++) {
                // Check if row is full
                if (grid[r].every(cell => !cell.isEmpty)) {
                    // Check if all elements are the same type
                    const firstType = grid[r][0].type;
                    const allSame = grid[r].every(cell => cell.type === firstType);

                    if (allSame) {
                        linesClearedThisPass++;
                        grid[r] = Array(GRID_COLS).fill(null).map(() => ({ type: 'NONE', color: ELEMENT_COLORS.NONE, isEmpty: true }));
                        stable = false; // Lines cleared, gravity needed
                    }
                }
            }

            if (linesClearedThisPass > 0) {
                totalLines += linesClearedThisPass;
                totalScore += linesClearedThisPass * 100 * (combo + 1);
                confetti({ particleCount: 50 * linesClearedThisPass, spread: 60, origin: { y: 0.7 } });
                soundManager.playClear();
            }

            // 3. Gravity
            const nextActiveCells: { r: number, c: number }[] = [];
            for (let c = 0; c < GRID_COLS; c++) {
                for (let r = GRID_ROWS - 1; r >= 0; r--) {
                    if (grid[r][c].isEmpty) {
                        // Find nearest block above
                        for (let k = r - 1; k >= 0; k--) {
                            if (!grid[k][c].isEmpty) {
                                // Move k to r
                                grid[r][c] = grid[k][c];
                                grid[k][c] = { type: 'NONE', color: ELEMENT_COLORS.NONE, isEmpty: true };

                                // Update exhausted status for moved cell
                                if (exhaustedCells.has(`${k},${c}`)) {
                                    exhaustedCells.delete(`${k},${c}`);
                                    exhaustedCells.add(`${r},${c}`);
                                }

                                nextActiveCells.push({ r, c }); // This block moved, so it's active
                                stable = false;
                                break;
                            }
                        }
                    }
                }
            }

            activeCells = nextActiveCells;
        }

        return { finalGrid: grid, scoreDelta: totalScore, linesCleared: totalLines, isGameOver: false };
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
