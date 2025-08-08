import type { Cell, CurrentPuyo, CheckResult } from "../components/types";
import { FIELD_WIDTH, FIELD_HEIGHT } from "../components/types";

// 色ランダム取得
export const getRandomColor = (): Cell => {
    const colors: Cell[] = ["red", "green", "blue", "yellow"];
    return colors[Math.floor(Math.random() * colors.length)];
};

// 隣接座標取得
export const getAdjacentPuyoOffset = (direction: CurrentPuyo["direction"]): [number, number] => {
    switch (direction) {
        case "up": return [0, -1];
        case "right": return [1, 0];
        case "down": return [0, 1];
        case "left": return [-1, 0];
    }
};



// ぷよ固定
export function fixPuyo(board: Cell[][], currentPuyo: CurrentPuyo): Cell[][] {
    const [dx, dy] = getAdjacentPuyoOffset(currentPuyo.direction);
    const newBoard = board.map(row => [...row]);
    newBoard[currentPuyo.y][currentPuyo.x] = currentPuyo.color;
    const subX = currentPuyo.x + dx;
    const subY = currentPuyo.y + dy;
    if (subX >= 0 && subX < FIELD_WIDTH && subY >= 0 && subY < FIELD_HEIGHT) {
        newBoard[subY][subX] = currentPuyo.subColor;
    }
    return newBoard;
}

// 重力適用
export function applyGravity(board: Cell[][]): Cell[][] {
    const newBoard = board.map(row => [...row]);
    for (let x = 0; x < FIELD_WIDTH; x++) {
        for (let y = FIELD_HEIGHT - 2; y >= 0; y--) {
            if (newBoard[y][x] !== null && newBoard[y + 1][x] === null) {
                let ny = y;
                while (ny + 1 < FIELD_HEIGHT && newBoard[ny + 1][x] === null) {
                    newBoard[ny + 1][x] = newBoard[ny][x];
                    newBoard[ny][x] = null;
                    ny++;
                }
            }
        }
    }
    return newBoard;
}

// 空セル判定
export function isCellEmpty(board: Cell[][], x: number, y: number): boolean {
    if (x < 0 || x >= FIELD_WIDTH || y < 0 || y >= FIELD_HEIGHT) return false;
    return board[y][x] === null;
}

// BFSで連結ぷよを探索し、4つ以上なら消す
export function checkAndPopPuyos(board: Cell[][]): CheckResult {
    const newBoard = board.map(row => [...row]);
    const visited = Array.from({ length: FIELD_HEIGHT }, () =>
        Array(FIELD_WIDTH).fill(false)
    );

    let popped = false;
    let poppedNum = 0;

    const directions = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
    ];

    for (let y = 0; y < FIELD_HEIGHT; y++) {
        for (let x = 0; x < FIELD_WIDTH; x++) {
            if (!visited[y][x] && newBoard[y][x] !== null) {
                const color = newBoard[y][x];
                const queue: [number, number][] = [[x, y]];
                const connected: [number, number][] = [];

                visited[y][x] = true;

                while (queue.length > 0) {
                    const [cx, cy] = queue.shift()!;
                    connected.push([cx, cy]);

                    for (const [dx, dy] of directions) {
                        const nx = cx + dx;
                        const ny = cy + dy;
                        if (
                            nx >= 0 && nx < FIELD_WIDTH &&
                            ny >= 0 && ny < FIELD_HEIGHT &&
                            !visited[ny][nx] &&
                            newBoard[ny][nx] === color
                        ) {
                            visited[ny][nx] = true;
                            queue.push([nx, ny]);
                        }
                    }
                }

                if (connected.length >= 4) {
                    popped = true;
                    poppedNum += connected.length;
                    // 消す
                    for (const [cx, cy] of connected) {
                        newBoard[cy][cx] = null;
                    }
                }
            }
        }
    }

    return { newBoard, popped, poppedNum };
}

// 回転可能判定
export function canPlacePuyo(board: Cell[][], x: number, y: number, direction: CurrentPuyo["direction"]): boolean {
    if (!isCellEmpty(board, x, y)) return false;
    const [dx, dy] = getAdjacentPuyoOffset(direction);
    if (!isCellEmpty(board, x + dx, y + dy)) return false;
    return true;
}

// 横移動可能判定
export function canMoveHorizontal(board: Cell[][], currentPuyo: CurrentPuyo, dx: number): boolean {
    const nextX = currentPuyo.x + dx;
    const [adx, ady] = getAdjacentPuyoOffset(currentPuyo.direction);
    if (
        nextX < 0 ||
        nextX >= FIELD_WIDTH ||
        board[currentPuyo.y][nextX] !== null ||
        board[currentPuyo.y + ady][nextX + adx] !== null
    ) {
        return false;
    }
    return true;
}

// 高速落下先座標計算
export function getDropPosition(board: Cell[][], currentPuyo: CurrentPuyo): number {
    const [dx, dy] = getAdjacentPuyoOffset(currentPuyo.direction);
    let newY = currentPuyo.y;

    while (true) {
        const mainNextY = newY + 1;
        const subNextY = newY + dy + 1;
        const subX = currentPuyo.x + dx;

        const isMainBlocked =
            mainNextY >= FIELD_HEIGHT || board[mainNextY][currentPuyo.x] !== null;
        const isSubBlocked =
            subNextY >= FIELD_HEIGHT ||
            subX < 0 ||
            subX >= FIELD_WIDTH ||
            board[subNextY][subX] !== null;

        if (isMainBlocked || isSubBlocked) break;
        newY++;
    }
    return newY;
}

// 
export function checkGameOver(board: Cell[][]): boolean {
    return board[0][2] !== null || board[0][3] !== null;
}

// 盤面初期化
export function initBoard(): Cell[][] {
    return Array.from({ length: FIELD_HEIGHT }, () =>
        Array.from({ length: FIELD_WIDTH }, () => null)
    );
}

// 現在ぷよ初期化
export function initCurrentPuyo(): CurrentPuyo {
    return {
        x: 2,
        y: 0,
        color: getRandomColor(),
        direction: "right",
        subColor: getRandomColor(),
    };
}
