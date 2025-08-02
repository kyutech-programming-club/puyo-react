import { useEffect, useState } from "react";
import "./App.css";

type Cell = "red" | "green" | "blue" | "yellow" | null;

type CurrentPuyo = {
  x: number;
  y: number;
  color: Cell;
  direction: "up" | "right" | "down" | "left";
  subColor: Cell;
};

const FIELD_WIDTH = 6;
const FIELD_HEIGHT = 12;

const getRandomColor = (): Cell => {
  const colors: Cell[] = ["red", "green", "blue", "yellow"];
  return colors[Math.floor(Math.random() * colors.length)];
};

const getAdjacentPuyoOffset = (direction: string): [number, number] => {
  switch (direction) {
    case "up":
      return [0, -1];
    case "right":
      return [1, 0];
    case "down":
      return [0, 1];
    case "left":
      return [-1, 0];
    default:
      return [0, -1];
  }
};

function App() {
  const [board, setBoard] = useState<Cell[][]>(
    Array.from({ length: FIELD_HEIGHT }, () =>
      Array.from({ length: FIELD_WIDTH }, () => null)
    )
  );

  const [currentPuyo, setCurrentPuyo] = useState<CurrentPuyo>({
    x: 2,
    y: 0,
    color: getRandomColor(),
    direction: "right",
    subColor: getRandomColor(),
  });

  const [isChainRunning, setIsChainRunning] = useState(false);

  // 盤面の指定セルが空かどうか
  const isCellEmpty = (x: number, y: number): boolean => {
    if (x < 0 || x >= FIELD_WIDTH || y < 0 || y >= FIELD_HEIGHT) return false;
    return board[y][x] === null;
  };

  // ぷよの隣接位置を得る
  const getAdjacent = (direction: CurrentPuyo["direction"]): [number, number] => {
    return getAdjacentPuyoOffset(direction);
  };

  // 落下判定と移動
  const moveDown = () => {
    if (isChainRunning) return;

    const [dx, dy] = getAdjacent(currentPuyo.direction);

    const mainNextY = currentPuyo.y + 1;
    const subNextY = currentPuyo.y + dy + 1;
    const subX = currentPuyo.x + dx;

    const isMainBlocked =
      mainNextY >= FIELD_HEIGHT || board[mainNextY][currentPuyo.x] !== null;
    const isSubBlocked =
      subNextY >= FIELD_HEIGHT ||
      subX < 0 ||
      subX >= FIELD_WIDTH ||
      board[subNextY][subX] !== null;

    if (isMainBlocked || isSubBlocked) {
      fixPuyoAndCheck();
    } else {
      setCurrentPuyo((prev) => ({
        ...prev,
        y: prev.y + 1,
      }));
    }
  };

  // ぷよ固定→重力→連鎖処理の一連の流れ
  const fixPuyoAndCheck = () => {
    setIsChainRunning(true);

    const [dx, dy] = getAdjacent(currentPuyo.direction);

    // ぷよを固定
    let newBoard = board.map((row) => [...row]);
    newBoard[currentPuyo.y][currentPuyo.x] = currentPuyo.color;
    const subX = currentPuyo.x + dx;
    const subY = currentPuyo.y + dy;
    if (
      subX >= 0 &&
      subX < FIELD_WIDTH &&
      subY >= 0 &&
      subY < FIELD_HEIGHT
    ) {
      newBoard[subY][subX] = currentPuyo.subColor;
    }

    // 重力適用関数
    const applyGravity = (board: Cell[][]): Cell[][] => {
      const newBoard = board.map((row) => [...row]);
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
    };

    // 消去判定関数（4つ以上繋がっているぷよを消す）
    const checkAndPopPuyos = (board: Cell[][]): { newBoard: Cell[][]; popped: boolean } => {
      const directions = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ];
      const visited = Array.from({ length: FIELD_HEIGHT }, () =>
        Array(FIELD_WIDTH).fill(false)
      );
      const newBoard = board.map((row) => [...row]);
      let popped = false;

      for (let y = 0; y < FIELD_HEIGHT; y++) {
        for (let x = 0; x < FIELD_WIDTH; x++) {
          if (newBoard[y][x] !== null && !visited[y][x]) {
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
                  nx >= 0 &&
                  nx < FIELD_WIDTH &&
                  ny >= 0 &&
                  ny < FIELD_HEIGHT &&
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
              for (const [cx, cy] of connected) {
                newBoard[cy][cx] = null;
              }
            }
          }
        }
      }

      return { newBoard, popped };
    };

    // 重力適用
    let fallingBoard = applyGravity(newBoard);
    setBoard(fallingBoard);

    // 連鎖処理の再帰ループ
    const chainLoop = () => {
      const { newBoard: poppedBoard, popped } = checkAndPopPuyos(fallingBoard);
      if (popped) {
        fallingBoard = applyGravity(poppedBoard);
        setBoard(fallingBoard);
        setTimeout(chainLoop, 300);
      } else {
        // 連鎖終了
        setIsChainRunning(false);
        // 新しいぷよ出現（右向きスタート）
        setCurrentPuyo({
          x: 2,
          y: 0,
          color: getRandomColor(),
          direction: "right",
          subColor: getRandomColor(),
        });
      }
    };

    setTimeout(chainLoop, 300);
  };

  // 回転処理（回転できるなら向きを変更）
  const canPlacePuyo = (x: number, y: number, direction: CurrentPuyo["direction"]): boolean => {
    if (!isCellEmpty(x, y)) return false;
    const [dx, dy] = getAdjacent(direction);
    if (!isCellEmpty(x + dx, y + dy)) return false;
    return true;
  };

  const rotate = () => {
    if (isChainRunning) return;

    setCurrentPuyo((prev) => {
      const directions: CurrentPuyo["direction"][] = ["up", "right", "down", "left"];
      const currentIndex = directions.indexOf(prev.direction);
      const nextDirection = directions[(currentIndex + 1) % directions.length];

      if (canPlacePuyo(prev.x, prev.y, nextDirection)) {
        return { ...prev, direction: nextDirection };
      } else {
        return prev;
      }
    });
  };

  // 高速落下処理
  const dropPuyoToBottom = () => {
    if (isChainRunning) return;

    setCurrentPuyo((prev) => {
      let { x, y, direction, color, subColor } = prev;
      const [dx, dy] = getAdjacent(direction);
      let newY = y;

      while (true) {
        const mainNextY = newY + 1;
        const subNextY = newY + dy + 1;
        const subX = x + dx;

        const isMainBlocked =
          mainNextY >= FIELD_HEIGHT || board[mainNextY][x] !== null;
        const isSubBlocked =
          subNextY >= FIELD_HEIGHT ||
          subX < 0 ||
          subX >= FIELD_WIDTH ||
          board[subNextY][subX] !== null;

        if (isMainBlocked || isSubBlocked) break;
        newY++;
      }

      return { x, y: newY, direction, color, subColor };
    });
  };

  // 横移動処理
  const moveHorizontal = (dx: number) => {
    if (isChainRunning) return;

    setCurrentPuyo((prev) => {
      const nextX = prev.x + dx;
      const [adx, ady] = getAdjacent(prev.direction);
      // 移動先が盤外か空いていなければ移動不可
      if (
        nextX < 0 ||
        nextX >= FIELD_WIDTH ||
        board[prev.y][nextX] !== null ||
        board[prev.y + ady][nextX + adx] !== null
      ) {
        return prev;
      }
      return { ...prev, x: nextX };
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      moveDown();
    }, 500);
    return () => clearInterval(interval);
  }, [board, currentPuyo, isChainRunning]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isChainRunning) return;

      if (e.code === "Space") {
        rotate();
      } else if (e.key === "ArrowLeft") {
        moveHorizontal(-1);
      } else if (e.key === "ArrowRight") {
        moveHorizontal(1);
      } else if (e.key === "ArrowDown") {
        dropPuyoToBottom();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [board, isChainRunning]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",    // 画面全体の高さを確保
        backgroundColor: "#222", // 背景色はお好みで
      }}
    >
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
    </div>
  );
}
export default App;
