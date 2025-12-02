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
                gap: 1,
                backgroundColor: '#111',
                padding: 4,
                borderRadius: 8,
                border: '2px solid #333',
                width: 'fit-content',
                maxWidth: '100%',
                margin: '0 auto',
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
