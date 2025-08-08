import React, { useEffect, useState } from "react";
import type { Cell, CurrentPuyo, CheckResult } from "./components/types";
import { FIELD_WIDTH, FIELD_HEIGHT } from "./components/types";
import { TimerDisplay } from "./components/TimerDisplay";
import { Board } from "./components/GameBoard";

import {
  getRandomColor,
  getAdjacentPuyoOffset,
  fixPuyo,
  applyGravity,
  isCellEmpty,
  checkAndPopPuyos,
  canPlacePuyo,
  canMoveHorizontal,
  getDropPosition,
  checkGameOver,
  initBoard,
  initCurrentPuyo,
} from "./logic/gameLogic";

function App() {
  const [board, setBoard] = useState<Cell[][]>(initBoard());
  const [currentPuyo, setCurrentPuyo] = useState<CurrentPuyo>(initCurrentPuyo());
  const [isChainRunning, setIsChainRunning] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isGameOverHandled, setIsGameOverHandled] = useState(false);
  const [timer, setTimer] = useState(0);
  const [poppedCount, setPoppedCount] = useState(0);

  // 落下判定と移動
  const moveDown = () => {
    if (isChainRunning) return;

    const [dx, dy] = getAdjacentPuyoOffset(currentPuyo.direction);

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

    let newBoard = fixPuyo(board, currentPuyo);
    newBoard = applyGravity(newBoard);
    setBoard(newBoard);

    // 連鎖処理の再帰ループ
    const chainLoop = () => {
      const { newBoard: poppedBoard, popped, poppedNum } = checkAndPopPuyos(newBoard);
      if (popped) {
        newBoard = applyGravity(poppedBoard);
        setBoard(newBoard);
        setPoppedCount((prev) => prev + poppedNum);
        setTimeout(chainLoop, 300);
      } else {
        setBoard(newBoard);

        // 連鎖終了後にゲームオーバー判定
        if (checkGameOver(newBoard)) {
          setIsGameOver(true);
        }

        setIsChainRunning(false);

        if (!checkGameOver(newBoard)) {
          // 新しいぷよ出現（ゲーム続行）
          setCurrentPuyo(initCurrentPuyo());
        }
      }
    };

    setTimeout(chainLoop, 300);
  };

  // 回転処理
  const rotate = () => {
    if (isChainRunning) return;

    setCurrentPuyo((prev) => {
      const directions: CurrentPuyo["direction"][] = ["up", "right", "down", "left"];
      const currentIndex = directions.indexOf(prev.direction);
      const nextDirection = directions[(currentIndex + 1) % directions.length];

      if (canPlacePuyo(board, prev.x, prev.y, nextDirection)) {
        return { ...prev, direction: nextDirection };
      } else {
        return prev;
      }
    });
  };

  // 高速落下処理
  const dropPuyoToBottom = () => {
    if (isChainRunning) return;

    setCurrentPuyo((prev) => ({
      ...prev,
      y: getDropPosition(board, prev),
    }));
  };

  // 横移動処理
  const moveHorizontal = (dx: number) => {
    if (isChainRunning) return;

    setCurrentPuyo((prev) => {
      if (canMoveHorizontal(board, prev, dx)) {
        return { ...prev, x: prev.x + dx };
      }
      return prev;
    });
  };

  // スコア計算
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

  // タイマー処理
  useEffect(() => {
    if (isGameOver) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev + 100);
    }, 100);

    return () => clearInterval(interval);
  }, [isGameOver]);

  // 落下ループ
  useEffect(() => {
    if (isGameOver) return;
    const interval = setInterval(() => {
      moveDown();
    }, 500);
    return () => clearInterval(interval);
  }, [board, currentPuyo, isChainRunning, isGameOver]);

  // ゲームオーバー処理
  useEffect(() => {
    if (isGameOver && !isGameOverHandled) {
      setIsGameOverHandled(true);
      setIsGameOver(false);
      resetGame();
      alert(`ゲームオーバー！ スコア: ${score}`);
    }
  }, [isGameOver, isGameOverHandled, poppedCount, timer]);

  // ゲームリセット関数
  const resetGame = () => {
    setIsGameOverHandled(false);
    setBoard(initBoard());
    setCurrentPuyo(initCurrentPuyo());
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
      <TimerDisplay time={timer} />
      <Board board={board} currentPuyo={currentPuyo} />
    </div>
  );
}

export default App;
