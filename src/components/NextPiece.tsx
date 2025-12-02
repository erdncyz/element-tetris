import React from 'react';
import type { Tetromino } from '../game/types';
import { ELEMENT_COLORS } from '../game/types';
import { Cell as CellComponent } from './Cell';

interface NextPieceProps {
    pieces: Tetromino[];
}

export const NextPiece: React.FC<NextPieceProps> = ({ pieces }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <h3>Next</h3>
            {pieces.slice(0, 3).map((piece, idx) => (
                <div key={idx} style={{
                    display: 'grid',
                    gridTemplateRows: `repeat(${piece.shape.length}, 1fr)`,
                    gridTemplateColumns: `repeat(${piece.shape[0].length}, 1fr)`,
                    gap: 1,
                    marginBottom: 10
                }}>
                    {piece.shape.map((row, r) =>
                        row.map((type, c) => (
                            <CellComponent
                                key={`${r}-${c}`}
                                cell={{
                                    type,
                                    color: type === 'NONE' ? 'transparent' : ELEMENT_COLORS[type],
                                    isEmpty: type === 'NONE'
                                }}
                                size={20}
                            />
                        ))
                    )}
                </div>
            ))}
        </div>
    );
};
