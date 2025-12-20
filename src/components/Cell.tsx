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
                backgroundColor: cell.isEmpty
                    ? 'rgba(15, 15, 25, 0.6)'
                    : 'rgba(0, 0, 0, 0.3)',
                border: cell.isEmpty
                    ? '1px solid rgba(102, 126, 234, 0.1)'
                    : '1px solid rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 6,
                boxShadow: cell.isEmpty
                    ? 'inset 0 0 10px rgba(0, 0, 0, 0.5)'
                    : `
                        0 0 20px ${cell.color}60,
                        0 0 40px ${cell.color}30,
                        inset 0 0 15px rgba(255, 255, 255, 0.1)
                    `,
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {imageSrc && (
                <>
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            background: `radial-gradient(circle at center, ${cell.color}20 0%, transparent 70%)`,
                            pointerEvents: 'none',
                        }}
                    />
                    <img
                        src={imageSrc}
                        alt={cell.type}
                        style={{
                            width: '90%',
                            height: '90%',
                            objectFit: 'contain',
                            filter: `
                                drop-shadow(0 0 8px ${cell.color}80)
                                drop-shadow(0 2px 4px rgba(0,0,0,0.6))
                                brightness(1.1)
                                contrast(1.1)
                            `,
                            position: 'relative',
                            zIndex: 1,
                            animation: 'cellPop 0.3s ease-out',
                        }}
                    />
                </>
            )}
        </div>
    );
};
