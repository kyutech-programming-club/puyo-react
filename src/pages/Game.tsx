import React, { useEffect, useState, useRef } from "react";
import './Game.css';
import type { Cell, CurrentPuyo } from "../components/types";
import { Board } from "../components/GameBoard";
import { useNavigate } from "react-router-dom";
import { NextPuyoDisplay } from "../components/NextPuyoDisplay";
import {
    getAdjacentPuyoOffset,
    fixPuyo,
    applyGravity,
    checkAndPopPuyos,
    canPlacePuyo,
    canMoveHorizontal,
    getDropPosition,
    checkGameOver,
    initBoard,
    initCurrentPuyo,
    addOjamaLine,
} from "../logic/gameLogic";

export const Game: React.FC = () => {
    const navigate = useNavigate();

    const [player1Board, setPlayer1Board] = useState<Cell[][]>(initBoard());
    const [player1Current, setPlayer1Current] = useState<CurrentPuyo>(initCurrentPuyo());
    const [player1Next, setPlayer1Next] = useState<CurrentPuyo[]>([initCurrentPuyo(), initCurrentPuyo()]);
    const [isChainRunningPlayer1, setIsChainRunningPlayer1] = useState(false);
    const [isGameOverPlayer1, setIsGameOverPlayer1] = useState(false);

    const [player2Board, setPlayer2Board] = useState<Cell[][]>(initBoard());
    const [player2Current, setPlayer2Current] = useState<CurrentPuyo>(initCurrentPuyo());
    const [player2Next, setPlayer2Next] = useState<CurrentPuyo[]>([initCurrentPuyo(), initCurrentPuyo()]);
    const [isChainRunningPlayer2, setIsChainRunningPlayer2] = useState(false);
    const [isGameOverPlayer2, setIsGameOverPlayer2] = useState(false);

    const [poppedCount, setPoppedCount] = useState(0);
    const [isGameOverHandled, setIsGameOverHandled] = useState(false);

// 左プレイヤー
const [player1SkillOjamaUsed, setPlayer1SkillOjamaUsed] = useState(false); // Q用
const [player1SkillRandomUsed, setPlayer1SkillRandomUsed] = useState(false); // E用

// 右プレイヤー
const [player2SkillOjamaUsed, setPlayer2SkillOjamaUsed] = useState(false); // P用
const [player2SkillRandomUsed, setPlayer2SkillRandomUsed] = useState(false); // L用

    // --- 最新のぷよを useRef に保持 ---
    const player1CurrentRef = useRef(player1Current);
    const player2CurrentRef = useRef(player2Current);
    useEffect(() => { player1CurrentRef.current = player1Current; }, [player1Current]);
    useEffect(() => { player2CurrentRef.current = player2Current; }, [player2Current]);

    // --- 高速落下後の共通処理 ---
    const handleFixAndChain = (
        current: CurrentPuyo,
        board: Cell[][],
        setBoard: React.Dispatch<React.SetStateAction<Cell[][]>>,
        setCurrent: React.Dispatch<React.SetStateAction<CurrentPuyo>>,
        next: CurrentPuyo[],
        setNext: React.Dispatch<React.SetStateAction<CurrentPuyo[]>>,
        setIsChainRunning: React.Dispatch<React.SetStateAction<boolean>>,
        sendOjama: () => void,
        setIsGameOver: React.Dispatch<React.SetStateAction<boolean>>
    ) => {
        setIsChainRunning(true);
        let newBoard = fixPuyo(board, current);
        newBoard = applyGravity(newBoard);
        setBoard(newBoard);

        const chainLoop = () => {
            const { newBoard: poppedBoard, popped, poppedNum } = checkAndPopPuyos(newBoard);
            if (popped) {
                newBoard = applyGravity(poppedBoard);
                setBoard(newBoard);
                setPoppedCount(prev => prev + poppedNum);
                if (poppedNum >= 2) sendOjama();
                setTimeout(chainLoop, 300);
            } else {
                setBoard(newBoard);
                if (checkGameOver(newBoard)) {
                    setIsGameOver(true);
                }
                setIsChainRunning(false);

                if (!checkGameOver(newBoard)) {
                    setCurrent(next[0]);
                    setNext(prev => [prev[1], initCurrentPuyo()]);
                }
            }
        };

        setTimeout(chainLoop, 300);
    };

const skillRemoveOjama = (player: 1 | 2) => {
    if (player === 1 && !player1SkillOjamaUsed) {
        setPlayer1Board(prev => prev.map(row => row.map(cell => cell === "gray" ? null : cell)));
        setPlayer1SkillOjamaUsed(true);
    } else if (player === 2 && !player2SkillOjamaUsed) {
        setPlayer2Board(prev => prev.map(row => row.map(cell => cell === "gray" ? null : cell)));
        setPlayer2SkillOjamaUsed(true);
    }
};

const skillRemoveRandomColor = (player: 1 | 2) => {
    if (player === 1 && !player1SkillRandomUsed) {
        setPlayer1Board(prev => {
            const colors = Array.from(new Set(prev.flat().filter(c => c && c !== "gray"))) as string[];
            if (!colors.length) return prev;
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            return prev.map(row => row.map(cell => cell === randomColor ? null : cell));
        });
        setPlayer1SkillRandomUsed(true);
    } else if (player === 2 && !player2SkillRandomUsed) {
        setPlayer2Board(prev => {
            const colors = Array.from(new Set(prev.flat().filter(c => c && c !== "gray"))) as string[];
            if (!colors.length) return prev;
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            return prev.map(row => row.map(cell => cell === randomColor ? null : cell));
        });
        setPlayer2SkillRandomUsed(true);
    }
};
    // --- 左右プレイヤー用固定処理 ---
    const fixPlayer1 = (current: CurrentPuyo) => {
        handleFixAndChain(
            current,
            player1Board,
            setPlayer1Board,
            setPlayer1Current,
            player1Next,
            setPlayer1Next,
            setIsChainRunningPlayer1,
            () => setPlayer2Board(prev => addOjamaLine(prev)),
            setIsGameOverPlayer1
        );
    };

    const fixPlayer2 = (current: CurrentPuyo) => {
        handleFixAndChain(
            current,
            player2Board,
            setPlayer2Board,
            setPlayer2Current,
            player2Next,
            setPlayer2Next,
            setIsChainRunningPlayer2,
            () => setPlayer1Board(prev => addOjamaLine(prev)),
            setIsGameOverPlayer2
        );
    };

    // --- 回転・移動 ---
    const rotateWithWallKick = (current: CurrentPuyo, board: Cell[][], clockwise = true): CurrentPuyo => {
        const dirs: CurrentPuyo["direction"][] = ["up", "right", "down", "left"];
        const nextDir = dirs[(dirs.indexOf(current.direction) + (clockwise ? 1 : 3)) % 4];

        if (canPlacePuyo(board, current.x, current.y, nextDir)) return { ...current, direction: nextDir };
        if (canPlacePuyo(board, current.x - 1, current.y, nextDir)) return { ...current, direction: nextDir, x: current.x - 1 };
        if (canPlacePuyo(board, current.x + 1, current.y, nextDir)) return { ...current, direction: nextDir, x: current.x + 1 };
        return current;
    };

    const moveHorizontal = (current: CurrentPuyo, board: Cell[][], dx: number) =>
        canMoveHorizontal(board, current, dx) ? { ...current, x: current.x + dx } : current;

    // --- キー操作 ---
useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        const key = e.key.toLowerCase();

        // 矢印キーとスペース・zなど、ゲームで使うキーはスクロール防止
        if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d", "z", "enter"].includes(key)) {
            e.preventDefault();
        }

        // --- 左プレイヤー ---
        if (!isChainRunningPlayer1) {
            switch (key) {
                case "s":
                    setPlayer1Current(prev => rotateWithWallKick(prev, player1Board));
                    break;
                case "w":
                    setPlayer1Current(prev => rotateWithWallKick(prev, player1Board, false));
                    break;
                case "a":
                    setPlayer1Current(prev => moveHorizontal(prev, player1Board, -1));
                    break;
                case "d":
                    setPlayer1Current(prev => moveHorizontal(prev, player1Board, 1));
                    break;
                case "z": {
                    const current = player1CurrentRef.current;
                    const dropY = getDropPosition(player1Board, current);
                    fixPlayer1({ ...current, y: dropY });
                    break;
                }
                case "q":
                    skillRemoveOjama(1);
                    break;
                case "e":
                    skillRemoveRandomColor(1);
                    break;
            }
        }

        // --- 右プレイヤー ---
        if (!isChainRunningPlayer2) {
            switch (key) {
                case "arrowdown":
                    setPlayer2Current(prev => rotateWithWallKick(prev, player2Board));
                    break;
                case "arrowup":
                    setPlayer2Current(prev => rotateWithWallKick(prev, player2Board, false));
                    break;
                case "arrowleft":
                    setPlayer2Current(prev => moveHorizontal(prev, player2Board, -1));
                    break;
                case "arrowright":
                    setPlayer2Current(prev => moveHorizontal(prev, player2Board, 1));
                    break;
                case "enter": {
                    const current = player2CurrentRef.current;
                    const dropY = getDropPosition(player2Board, current);
                    fixPlayer2({ ...current, y: dropY });
                    break;
                }
                case "p":
                    skillRemoveOjama(2);
                    break;
                case "l":
                    skillRemoveRandomColor(2);
                    break;
            }
        }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
}, [player1Board, player2Board, isChainRunningPlayer1, isChainRunningPlayer2]);
    // --- 自動落下 ---
    useEffect(() => {
        if (isGameOverPlayer1 || isGameOverPlayer2) return;
        const interval = setInterval(() => {
            if (!isChainRunningPlayer1) {
                const current = player1CurrentRef.current;
                const [dx, dy] = getAdjacentPuyoOffset(current.direction);
                const mainNextY = current.y + 1;
                const subNextY = current.y + dy + 1;
                const subX = current.x + dx;
                const mainBlocked = mainNextY >= 12 || player1Board[mainNextY][current.x] !== null;
                const subBlocked = subNextY >= 12 || subX < 0 || subX >= 6 || player1Board[subNextY][subX] !== null;

                if (mainBlocked || subBlocked) fixPlayer1(current);
                else setPlayer1Current(prev => ({ ...prev, y: prev.y + 1 }));
            }
        }, 500);
        return () => clearInterval(interval);
    }, [player1Board, isChainRunningPlayer1, isGameOverPlayer1, isGameOverPlayer2]);

    useEffect(() => {
        if (isGameOverPlayer1 || isGameOverPlayer2) return;
        const interval = setInterval(() => {
            if (!isChainRunningPlayer2) {
                const current = player2CurrentRef.current;
                const [dx, dy] = getAdjacentPuyoOffset(current.direction);
                const mainNextY = current.y + 1;
                const subNextY = current.y + dy + 1;
                const subX = current.x + dx;
                const mainBlocked = mainNextY >= 12 || player2Board[mainNextY][current.x] !== null;
                const subBlocked = subNextY >= 12 || subX < 0 || subX >= 6 || player2Board[subNextY][subX] !== null;

                if (mainBlocked || subBlocked) fixPlayer2(current);
                else setPlayer2Current(prev => ({ ...prev, y: prev.y + 1 }));
            }
        }, 500);
        return () => clearInterval(interval);
    }, [player2Board, isChainRunningPlayer2, isGameOverPlayer1, isGameOverPlayer2]);

    // --- スコアとゲームオーバー ---
    const score = poppedCount * 250;

    useEffect(() => {
        if ((isGameOverPlayer1 || isGameOverPlayer2) && !isGameOverHandled) {
            setIsGameOverHandled(true);
            navigate("/score", { state: { score, player: isGameOverPlayer1 ? 2 : 1 } });
        }
    }, [isGameOverPlayer1, isGameOverPlayer2, isGameOverHandled, poppedCount]);

// Game.tsx の return の前あたりに追加
useEffect(() => {
  const body = document.body;
  const stars: HTMLDivElement[] = [];

  for (let i = 0; i < 50; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    const size = Math.random() * 3 + 1;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.top = `${Math.random() * window.innerHeight}px`;
    star.style.left = `${Math.random() * window.innerWidth}px`;
    star.style.animationDuration = `${Math.random() * 5 + 3}s`;
    body.appendChild(star);
    stars.push(star);
  }

  return () => stars.forEach(s => s.remove());
}, []);


return (
  <div className="game-container">
    {/* 左プレイヤー */}
    <div className="player-board">
      <Board board={player1Board} currentPuyo={player1Current} />
      
      {/* NextPuyo + スキル縦並び */}
      <div className="player-side-panel">
        <NextPuyoDisplay nextPuyos={player1Next} />

        <div
          className={`skill-button ${player1SkillOjamaUsed ? "used" : ""}`}
          onClick={() => skillRemoveOjama(1)}
        >
          スキル1: 灰色全消し (Qキー)
        </div>

        <div
          className={`skill-button ${player1SkillRandomUsed ? "used" : ""}`}
          onClick={() => skillRemoveRandomColor(1)}
        >
          スキル2: ランダム消去 (Eキー)
        </div>
      </div>
    </div>

    {/* 右プレイヤー */}
    <div className="player-board">
      <Board board={player2Board} currentPuyo={player2Current} />

      <div className="player-side-panel">
        <NextPuyoDisplay nextPuyos={player2Next} />

        <div
          className={`skill-button ${player2SkillOjamaUsed ? "used" : ""}`}
          onClick={() => skillRemoveOjama(2)}
        >
          スキル1: 灰色全消し (Pキー)
        </div>

        <div
          className={`skill-button ${player2SkillRandomUsed ? "used" : ""}`}
          onClick={() => skillRemoveRandomColor(2)}
        >
          スキル2: ランダム消去 (Lキー)
        </div>
      </div>
    </div>
  </div>
);
};

export default Game;
