import React from 'react';
import type { Cell as CellType } from '../game/types';
import fireImg from '../assets/fire.png';
import waterImg from '../assets/water.png';
import rockImg from '../assets/rock.png';
import dynamiteImg from '../assets/dynamite.png';


interface CellProps {
    cell: CellType;
    size?: number;
}

export const Cell: React.FC<CellProps> = ({ cell, size = 30 }) => {
    const getImage = () => {
        switch (cell.type) {
            case 'FIRE': return fireImg;
            case 'WATER': return waterImg;
            case 'ROCK': return rockImg;
            case 'DYNAMITE': return dynamiteImg;
            default: return null;
        }
    };

    const imageSrc = getImage();

    return (
        <div
            style={{
                width: size,
                height: size,
                backgroundColor: cell.isEmpty ? 'rgba(20, 20, 30, 0.8)' : 'transparent',
                border: cell.isEmpty ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 4,
                boxShadow: cell.isEmpty ? 'none' : `0 0 10px ${cell.color}40`,
                transition: 'all 0.1s',
            }}
        >
            {imageSrc && (
                <img
                    src={imageSrc}
                    alt={cell.type}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.5))'
                    }}
                />
            )}
        </div>
    );
};
