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
                    // currentPuyo と重なっている場合は currentPuyo の色を優先
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
                        color = x === currentPuyo.x && y === currentPuyo.y ? currentPuyo.color : currentPuyo.subColor;
                    }

                    return (
                        <div
                            key={`${x}-${y}`}
                            style={{
                                width: 30,
                                height: 30,
                                backgroundColor: color ?? "transparent", // null の場合は透明
                                border: "1px solid #555", // マス目
                                borderRadius: 4,           // 角を丸めたい場合
                            }}
                        />
                    );
                })
            )}
        </div>
    );
};
