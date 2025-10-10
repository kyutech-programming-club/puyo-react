import type { Cell, CurrentPuyo } from "./types";

type Props = {
    board: Cell[][];
    currentPuyo: CurrentPuyo;
};

export const Board: React.FC<Props> = ({ board, currentPuyo }) => {
    const FIELD_WIDTH = board[0].length;

    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: `repeat(${FIELD_WIDTH}, 30px)`,
                gap: 2,
            }}
        >
            {board.map((row, y) =>
                row.map((cell, x) => {
                    let color = cell;

                    const [dx, dy] = (() => {
                        switch (currentPuyo.direction) {
                            case "up": return [0, -1];
                            case "right": return [1, 0];
                            case "down": return [0, 1];
                            case "left": return [-1, 0];
                        }
                    })();

                    if (
                        (x === currentPuyo.x && y === currentPuyo.y) ||
                        (x === currentPuyo.x + dx && y === currentPuyo.y + dy)
                    ) {
                        color = x === currentPuyo.x && y === currentPuyo.y
                            ? currentPuyo.color
                            : currentPuyo.subColor;
                    }

                    let backgroundColor: string;
                    switch (color) {
                        case "red": backgroundColor = "#f55"; break;
                        case "blue": backgroundColor = "#55f"; break;
                        case "green": backgroundColor = "#5f5"; break;
                        case "yellow": backgroundColor = "#ff5"; break;
                        case "gray": backgroundColor = "#777"; break; 
                        default: backgroundColor = "transparent"; break;
                    }

                    return (
                        <div
                            key={`${x}-${y}`}
                            style={{
                                width: 30,
                                height: 30,
                                backgroundColor,
                                border: "1px solid #555",
                                borderRadius: 4,
                            }}
                        />
                    );
                })
            )}
        </div>
    );
};
