// src/components/Puyo.tsx
import React from 'react';
import type { PuyoColor } from '../types/GameTypes';

type PuyoProps = {
    color: PuyoColor;
};

const colorMap: Record<Exclude<PuyoColor, null>, string> = {
    red: '#e74c3c',
    green: '#2ecc71',
    blue: '#3498db',
    yellow: '#f1c40f',
};

const Puyo: React.FC<PuyoProps> = ({ color }) => {
    return (
        <div
            className="puyo"
            style={{
                backgroundColor: color ? colorMap[color] : '#eee',
            }}
        />
    );
};

export default Puyo;  