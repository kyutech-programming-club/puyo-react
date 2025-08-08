import React from "react";
import type { Cell, CurrentPuyo } from "../components/types";
import { FIELD_WIDTH } from "../components/types";
import { getAdjacentPuyoOffset, } from "../logic/gameLogic";


type BoardProps = {
    board: Cell[][];
    currentPuyo: CurrentPuyo;
};

export const Board: React.FC<BoardProps> = ({ board, currentPuyo }) => {
    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: `repeat(${FIELD_WIDTH}, 30px)`,
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

                    return (
                        <div
                            key={`${x}-${y}`}
                            style={{
                                width: "30px",
                                height: "30px",
                                backgroundColor: color || "lightgray",
                                borderRadius: "50%",
                            }}
                        />
                    );
                })
            )}
        </div>
    );
};
