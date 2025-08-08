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
  const [isGameOver, setIsGameOver] = useState(false); // ゲームオーバーフラグ
  const [isGameOverHandled, setIsGameOverHandled] = useState(false);
  const [timer, setTimer] = useState(0);
  const [poppedCount, setPoppedCount] = useState(0);


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
const checkAndPopPuyos = (board: Cell[][]): { newBoard: Cell[][]; popped: boolean; poppedNum: number } => {
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
    let poppedNum = 0;  // 追加：消したぷよの数

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
            poppedNum += connected.length;  // 消した数を加算
            for (const [cx, cy] of connected) {
              newBoard[cy][cx] = null;
            }
          }
        }
      }
    }

    return { newBoard, popped, poppedNum };
  };

    // 重力適用
    let fallingBoard = applyGravity(newBoard);
    setBoard(fallingBoard);

    // 連鎖処理の再帰ループ
 const chainLoop = () => {
    const { newBoard: poppedBoard, popped, poppedNum } = checkAndPopPuyos(fallingBoard);
    if (popped) {
      fallingBoard = applyGravity(poppedBoard);
      setBoard(fallingBoard);
      setPoppedCount((prev) => prev + poppedNum);
      setTimeout(chainLoop, 300);
    } else {
      setBoard(fallingBoard);

      // 連鎖終了後にゲームオーバー判定
      const isGameOverNow = fallingBoard[0][2] !== null || fallingBoard[0][3] !== null;

      if (isGameOverNow) {
      setIsGameOver(true);
      }

      setIsChainRunning(false);

      if (!isGameOverNow) {
        // 新しいぷよ出現（ゲーム続行）
        setCurrentPuyo({
          x: 2,
          y: 0,
          color: getRandomColor(),
          direction: "right",
          subColor: getRandomColor(),
        });
      }
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


const score = poppedCount * 250 + Math.floor(timer / 100) * 10;


// キーイベント登録
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
}, [isChainRunning, board]);

// タイマー処理（ゲームオーバー時は停止）
useEffect(() => {
  if (isGameOver) return;

  const interval = setInterval(() => {
    setTimer((prev) => prev + 100);
  }, 100);

  return () => clearInterval(interval);
}, [isGameOver]);

// 落下ループ
useEffect(() => {
  if (isGameOver) return; // ゲームオーバー中は停止
  const interval = setInterval(() => {
    moveDown();
  }, 500);
  return () => clearInterval(interval);
}, [board, currentPuyo, isChainRunning, isGameOver]);

// ゲームオーバー処理
useEffect(() => {
  if (isGameOver && !isGameOverHandled) {
    setIsGameOverHandled(true);

    // 先にフラグを戻す
    setIsGameOver(false);

    // 盤面などリセット
    resetGame();

    // アラートは最後に出す
    alert(`ゲームオーバー！\nスコア: ${score}`);
  }
}, [isGameOver, isGameOverHandled, poppedCount, timer]);

// resetGame 内では isGameOver を触らない
const resetGame = () => {
  setIsGameOverHandled(false);
  setBoard(
    Array.from({ length: FIELD_HEIGHT }, () =>
      Array.from({ length: FIELD_WIDTH }, () => null)
    )
  );
  setCurrentPuyo({
    x: 2,
    y: 0,
    color: getRandomColor(),
    direction: "right",
    subColor: getRandomColor(),
  });
  setIsChainRunning(false);
  setTimer(0);
  setPoppedCount(0);
};

 return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#222",
      }}
    >
      {/* タイマー表示 */}
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
        {(timer / 1000).toFixed(1)}秒
      </div>

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
