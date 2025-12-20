import React, { useMemo } from 'react';
import { Cell as CellComponent } from './Cell';
import type { Cell, Tetromino } from '../game/types';
import { GRID_ROWS, GRID_COLS, ELEMENT_COLORS } from '../game/types';

interface GameBoardProps {
    grid: Cell[][];
    currentPiece: Tetromino | null;
}

export const GameBoard: React.FC<GameBoardProps> = ({ grid, currentPiece }) => {
    const displayGrid = useMemo(() => {
        // Clone grid
        const display = grid.map(row => row.map(c => ({ ...c })));

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
                    <CellComponent key={`${r}-${c}`} cell={cell} size={25} />
                ))
            )}
        </div>
    );
};
