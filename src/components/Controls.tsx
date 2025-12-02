import React from 'react';
import { ArrowLeft, ArrowRight, ArrowDownToLine } from 'lucide-react';

interface ControlsProps {
    onMoveLeft: () => void;
    onMoveRight: () => void;
    onHardDrop: () => void;
    // Keep others optional if needed for interface compatibility, or remove
    onRotate?: () => void;
    onDrop?: () => void;
}

export const Controls: React.FC<ControlsProps> = ({ onMoveLeft, onMoveRight, onHardDrop }) => {
    const btnStyle: React.CSSProperties = {
        width: 60,
        height: 60,
        borderRadius: '50%',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        cursor: 'pointer',
        userSelect: 'none',
        touchAction: 'manipulation', // Prevent zoom on double tap
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 20, paddingBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 40, width: '100%', maxWidth: 400, margin: '0 auto' }}>
                <div style={btnStyle} onClick={onMoveLeft}><ArrowLeft /></div>
                <div style={{ ...btnStyle, backgroundColor: 'rgba(255, 50, 50, 0.2)', width: 80, borderRadius: 40 }} onClick={onHardDrop}>
                    <ArrowDownToLine />
                </div>
                <div style={btnStyle} onClick={onMoveRight}><ArrowRight /></div>
            </div>
        </div>
    );
};
