import React, { useMemo } from 'react';
import { Cell as CellComponent } from './Cell';
import type { Cell, Tetromino, GameEffect } from '../game/types';
import { GRID_ROWS, GRID_COLS, ELEMENT_COLORS } from '../game/types';
import { useEffect, useState } from 'react';

interface GameBoardProps {
    grid: Cell[][];
    currentPiece: Tetromino | null;
    effects?: GameEffect[];
}

export const GameBoard: React.FC<GameBoardProps> = ({ grid, currentPiece, effects = [] }) => {
    // Filter active effects to handle animation durability
    const [activeEffects, setActiveEffects] = useState<GameEffect[]>([]);
    const [cellSize, setCellSize] = useState(36);

    useEffect(() => {
        const calculateCellSize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;

            // Estimate UI overhead (Header: ~60, Stats: ~100, Controls: ~120, Padding: ~40, Footer: ~50)
            // On mobile, the sidebar is at the top.
            const uiOverhead = width <= 768 ? 430 : 100; // More overhead on mobile due to stacked layout

            const maxCellWidth = (width - 40) / GRID_COLS; // 40px horizontal padding/gap
            const maxCellHeight = (height - uiOverhead) / GRID_ROWS;

            // Clamp between 20 and 36
            const size = Math.min(36, Math.max(20, Math.min(maxCellWidth, maxCellHeight)));
            setCellSize(Math.floor(size));
        };

        calculateCellSize();
        window.addEventListener('resize', calculateCellSize);
        return () => window.removeEventListener('resize', calculateCellSize);
    }, []);

    useEffect(() => {
        if (effects.length > 0) {
            // New batch of effects arrived. Add them to active list.
            // Since useGameLogic now sends a fresh array (not accumulated), we treat all as new.
            // However, we should filter out duplicates if re-renders pass same array?
            // React's dependency array [effects] ensures we only run when ref changes (new array).

            const newEffects = effects.filter(e => !activeEffects.some(active => active.id === e.id));
            if (newEffects.length === 0) return;

            setActiveEffects(prev => [...prev, ...newEffects]);

            // Set timeout to remove them
            newEffects.forEach(effect => {
                setTimeout(() => {
                    setActiveEffects(prev => prev.filter(e => e.id !== effect.id));
                }, 1500); // Animation duration
            });
        }
    }, [effects]);

    const displayGrid = useMemo(() => {
        // Clone grid
        const display = grid.map(row => row.map(c => ({ ...c })));
        // ... no changes to grid logic ...
        // Overlay current piece
        if (currentPiece) {
            const { shape, position } = currentPiece;
            for (let r = 0; r < shape.length; r++) {
                for (let c = 0; c < shape[r].length; c++) {
                    if (shape[r][c] !== 'NONE') {
                        const row = position.row + r;
                        const col = position.col + c;
                        if (row >= 0 && row < GRID_ROWS && col >= 0 && col < GRID_COLS) {
                            display[row][col] = {
                                type: shape[r][c],
                                color: ELEMENT_COLORS[shape[r][c]],
                                isEmpty: false,
                            };
                        }
                    }
                }
            }
        }
        return display;
    }, [grid, currentPiece]);

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
                gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
                // ... styles ...
                gap: 2,
                background: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                padding: 8,
                borderRadius: 16,
                border: '2px solid rgba(102, 126, 234, 0.3)',
                width: 'fit-content',
                maxWidth: '100%',
                margin: '0 auto',
                boxShadow: `
                    0 8px 32px 0 rgba(31, 38, 135, 0.37),
                    inset 0 0 60px rgba(102, 126, 234, 0.1),
                    0 0 40px rgba(102, 126, 234, 0.2)
                `,
                position: 'relative',
                animation: 'fadeIn 0.6s ease-out',
            }}
        >
            {displayGrid.map((row, r) =>
                row.map((cell, c) => (
                    <CellComponent key={`${r}-${c}`} cell={cell} size={cellSize} />
                ))
            )}

            {/* Effects Layer */}
            {activeEffects.map((effect) => (
                <div
                    key={effect.id}
                    style={{
                        position: 'absolute',
                        top: effect.row * (cellSize + 2) + 8, // row * (size + gap) + padding
                        left: effect.col * (cellSize + 2) + 8,
                        pointerEvents: 'none',
                        zIndex: 20,
                        width: cellSize,
                        height: cellSize,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {/* Visual Splash/Explosion */}
                    <div style={{
                        position: 'absolute',
                        inset: -10,
                        borderRadius: '50%',
                        background: effect.type === 'EXPLOSION'
                            ? `radial-gradient(circle, ${effect.color}, transparent)`
                            : `radial-gradient(circle, ${effect.color}, transparent)`,
                        opacity: 0.8,
                        animation: 'effectExpand 0.6s ease-out forwards',
                    }} />

                    {/* Floating Text */}
                    <span style={{
                        position: 'absolute',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '1.2rem',
                        textShadow: `0 0 4px ${effect.color}`,
                        animation: 'floatUp 1s ease-out forwards',
                        whiteSpace: 'nowrap',
                    }}>
                        {effect.value}
                    </span>
                </div>
            ))}
        </div>
    );
};
