import React from "react";

type TimerDisplayProps = {
    time: number; // ミリ秒
};

export const TimerDisplay: React.FC<TimerDisplayProps> = ({ time }) => {
    return (
        <div
            style={{
                position: "fixed",
                top: 10,
                right: 10,
                color: "white",
                fontSize: "20px",
                fontFamily: "monospace",
                userSelect: "none",
                zIndex: 10,
            }}
        >
            {(time / 1000).toFixed(1)}秒
        </div>
    );
};
