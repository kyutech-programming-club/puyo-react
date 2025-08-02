import React from "react";
import Puyo from "./Puyo";
import type { Cell, CurrentPuyo } from "../types";

type Props = {
    board: Cell[][];
    currentPuyo: CurrentPuyo;
};

const GameBoard: React.FC<Props> = ({ board, currentPuyo }) => {
    const getAdjacentPuyoOffset = (direction: CurrentPuyo["direction"]) => {
        switch (direction) {
            case "up": return [0, -1];
            case "right": return [1, 0];
            case "down": return [0, 1];
            case "left": return [-1, 0];
            default: return [0, -1];
        }
    };

    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: `repeat(${board[0].length}, 30px)`,
                gap: "2px",
                backgroundColor: "#333",
                padding: "10px",
                borderRadius: "8px",
                boxShadow: "0 0 10px rgba(0,0,0,0.5)",
            }}
        >
            {board.map((row, y) =>
                row.map((cell, x) => {
                    let color = cell;

                    if (x === currentPuyo.x && y === currentPuyo.y) {
                        color = currentPuyo.color;
                    }

                    const [dx, dy] = getAdjacentPuyoOffset(currentPuyo.direction);
                    if (x === currentPuyo.x + dx && y === currentPuyo.y + dy) {
                        color = currentPuyo.subColor;
                    }

                    return <Puyo key={`${x}-${y}`} color={color} />;
                })
            )}
        </div>
    );
};

export default GameBoard;
