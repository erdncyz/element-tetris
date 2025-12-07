import React, { useEffect } from 'react';

declare global {
    interface Window {
        adsbygoogle: any[];
    }
}

interface GoogleAdProps {
    slot: string;
    format?: string;
    responsive?: string;
    style?: React.CSSProperties;
}

export const GoogleAd: React.FC<GoogleAdProps> = ({ slot, format = 'auto', responsive = 'true', style }) => {
    useEffect(() => {
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.error('AdSense error:', e);
        }
    }, []);

    return (
        <div style={{ margin: '20px 0', textAlign: 'center', ...style }}>
            <ins className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client="ca-pub-1271900948473545"
                data-ad-slot={slot}
                data-ad-format={format}
                data-full-width-responsive={responsive}></ins>
        </div>
    );
};
