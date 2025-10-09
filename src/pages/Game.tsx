import React, { useEffect, useState } from "react";
import type { Cell, CurrentPuyo } from "../components/types";
import { FIELD_WIDTH, FIELD_HEIGHT } from "../components/types";
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
} from "../logic/gameLogic";

export const Game: React.FC = () => {
    const [board, setBoard] = useState<Cell[][]>(initBoard());
    const [currentPuyo, setCurrentPuyo] = useState<CurrentPuyo>(initCurrentPuyo());
    const [isChainRunningPlayer1, setIsChainRunningPlayer1] = useState(false);

    const [isChainRunningPlayer2, setIsChainRunningPlayer2] = useState(false); const [isGameOver, setIsGameOver] = useState(false);
    const [isGameOverHandled, setIsGameOverHandled] = useState(false);
    const [timer, setTimer] = useState(0);
    const [poppedCount, setPoppedCount] = useState(0);
    const [nextPuyos, setNextPuyos] = useState<CurrentPuyo[]>([
        initCurrentPuyo(),
        initCurrentPuyo()
    ]);
    const navigate = useNavigate();
    const [player1Board, setPlayer1Board] = useState<Cell[][]>(initBoard());
    const [player1Current, setPlayer1Current] = useState<CurrentPuyo>(initCurrentPuyo());
    const [player1Next, setPlayer1Next] = useState<CurrentPuyo[]>([initCurrentPuyo(), initCurrentPuyo()]);

    const [player2Board, setPlayer2Board] = useState<Cell[][]>(initBoard());
    const [player2Current, setPlayer2Current] = useState<CurrentPuyo>(initCurrentPuyo());
    const [player2Next, setPlayer2Next] = useState<CurrentPuyo[]>([initCurrentPuyo(), initCurrentPuyo()]);
    // 既存の isGameOver, isGameOverHandled の近くに追加
    const [isGameOverPlayer1, setIsGameOverPlayer1] = useState(false);
    const [isGameOverPlayer2, setIsGameOverPlayer2] = useState(false);



    // 左プレイヤー落下
    const moveDownPlayer1 = () => {
        if (isChainRunningPlayer1) return;

        const [dx, dy] = getAdjacentPuyoOffset(player1Current.direction);

        const mainNextY = player1Current.y + 1;
        const subNextY = player1Current.y + dy + 1;
        const subX = player1Current.x + dx;

        const isMainBlocked =
            mainNextY >= FIELD_HEIGHT || player1Board[mainNextY][player1Current.x] !== null;
        const isSubBlocked =
            subNextY >= FIELD_HEIGHT ||
            subX < 0 ||
            subX >= FIELD_WIDTH ||
            player1Board[subNextY][subX] !== null;

        if (isMainBlocked || isSubBlocked) {
            fixPuyoAndCheckPlayer1();
        } else {
            setPlayer1Current((prev) => ({
                ...prev,
                y: prev.y + 1,
            }));
        }
    };

    // 右プレイヤー落下
    const moveDownPlayer2 = () => {
        if (isChainRunningPlayer2) return;

        const [dx, dy] = getAdjacentPuyoOffset(player2Current.direction);

        const mainNextY = player2Current.y + 1;
        const subNextY = player2Current.y + dy + 1;
        const subX = player2Current.x + dx;

        const isMainBlocked =
            mainNextY >= FIELD_HEIGHT || player2Board[mainNextY][player2Current.x] !== null;
        const isSubBlocked =
            subNextY >= FIELD_HEIGHT ||
            subX < 0 ||
            subX >= FIELD_WIDTH ||
            player2Board[subNextY][subX] !== null;

        if (isMainBlocked || isSubBlocked) {
            fixPuyoAndCheckPlayer2();
        } else {
            setPlayer2Current((prev) => ({
                ...prev,
                y: prev.y + 1,
            }));
        }
    };


    // 左プレイヤー用固定＋連鎖処理
    const fixPuyoAndCheckPlayer1 = () => {
        setIsChainRunningPlayer1(true);

        let newBoard = fixPuyo(player1Board, player1Current);
        newBoard = applyGravity(newBoard);
        setPlayer1Board(newBoard);

        const chainLoop = () => {
            const { newBoard: poppedBoard, popped, poppedNum } = checkAndPopPuyos(newBoard);
            if (popped) {
                newBoard = applyGravity(poppedBoard);
                setPlayer1Board(newBoard);
                setPoppedCount((prev) => prev + poppedNum); // スコアは共通にしてもOK
                setTimeout(chainLoop, 300);
            } else {
                setPlayer1Board(newBoard);

                if (checkGameOver(newBoard)) {
                    setIsGameOverPlayer1(true); // 左プレイヤー
                }


                setIsChainRunningPlayer1(false);

                if (!checkGameOver(newBoard)) {
                    // 次のぷよに切り替え
                    setPlayer1Current(player1Next[0]);
                    setPlayer1Next((prev) => [prev[1], initCurrentPuyo()]);
                }
            }
        };

        setTimeout(chainLoop, 300);
    };

    // --- 右プレイヤー ---
    const fixPuyoAndCheckPlayer2 = () => {
        setIsChainRunningPlayer2(true);

        let newBoard = fixPuyo(player2Board, player2Current);
        newBoard = applyGravity(newBoard);
        setPlayer2Board(newBoard);

        const chainLoop = () => {
            const { newBoard: poppedBoard, popped, poppedNum } = checkAndPopPuyos(newBoard);
            if (popped) {
                newBoard = applyGravity(poppedBoard);
                setPlayer2Board(newBoard);
                setPoppedCount((prev) => prev + poppedNum); // スコアは共通にしてもOK
                setTimeout(chainLoop, 300);
            } else {
                setPlayer2Board(newBoard);

                if (checkGameOver(newBoard)) {
                    setIsGameOverPlayer2(true); // 右プレイヤー
                }


                setIsChainRunningPlayer2(false);

                if (!checkGameOver(newBoard)) {
                    // 次のぷよに切り替え
                    setPlayer2Current(player2Next[0]);
                    setPlayer2Next((prev) => [prev[1], initCurrentPuyo()]);
                }
            }
        };

        setTimeout(chainLoop, 300);
    };

    // 回転（右回転）
    const rotatePlayer1 = () => {
        if (isChainRunningPlayer1) return;
        setPlayer1Current(prev => {
            const dirs: CurrentPuyo["direction"][] = ["up", "right", "down", "left"];
            const nextDir = dirs[(dirs.indexOf(prev.direction) + 1) % 4];
            if (canPlacePuyo(player1Board, prev.x, prev.y, nextDir)) return { ...prev, direction: nextDir };
            return prev;
        });
    };

    // 回転（左回転）
    const rotateLeftPlayer1 = () => {
        if (isChainRunningPlayer1) return;
        setPlayer1Current(prev => {
            const dirs: CurrentPuyo["direction"][] = ["up", "right", "down", "left"];
            const nextDir = dirs[(dirs.indexOf(prev.direction) + 3) % 4]; // -1 mod4
            if (canPlacePuyo(player1Board, prev.x, prev.y, nextDir)) return { ...prev, direction: nextDir };
            return prev;
        });
    };

    // 横移動
    const moveHorizontalPlayer1 = (dx: number) => {
        if (isChainRunningPlayer1) return;
        setPlayer1Current(prev => {
            if (canMoveHorizontal(player1Board, prev, dx)) return { ...prev, x: prev.x + dx };
            return prev;
        });
    };

    const rotatePlayer2 = () => {
        if (isChainRunningPlayer2) return;
        setPlayer2Current(prev => {
            const dirs: CurrentPuyo["direction"][] = ["up", "right", "down", "left"];
            const nextDir = dirs[(dirs.indexOf(prev.direction) + 1) % 4];
            if (canPlacePuyo(player2Board, prev.x, prev.y, nextDir)) return { ...prev, direction: nextDir };
            return prev;
        });
    };

    const rotateLeftPlayer2 = () => {
        if (isChainRunningPlayer2) return;
        setPlayer2Current(prev => {
            const dirs: CurrentPuyo["direction"][] = ["up", "right", "down", "left"];
            const nextDir = dirs[(dirs.indexOf(prev.direction) + 3) % 4];
            if (canPlacePuyo(player2Board, prev.x, prev.y, nextDir)) return { ...prev, direction: nextDir };
            return prev;
        });
    };

    const moveHorizontalPlayer2 = (dx: number) => {
        if (isChainRunningPlayer2) return;
        setPlayer2Current(prev => {
            if (canMoveHorizontal(player2Board, prev, dx)) return { ...prev, x: prev.x + dx };
            return prev;
        });
    };



    // キーイベント登録
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // 左プレイヤー操作制限
            if (!isChainRunningPlayer1) {
                switch (e.key.toLowerCase()) {
                    case "w": rotatePlayer1(); break;
                    case "s": rotateLeftPlayer1(); break;
                    case "a": moveHorizontalPlayer1(-1); break;
                    case "d": moveHorizontalPlayer1(1); break;
                }
            }

            // 右プレイヤー操作制限
            if (!isChainRunningPlayer2) {
                switch (e.code) {
                    case "ArrowUp": rotatePlayer2(); break;
                    case "ArrowDown": rotateLeftPlayer2(); break;
                    case "ArrowLeft": moveHorizontalPlayer2(-1); break;
                    case "ArrowRight": moveHorizontalPlayer2(1); break;
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [
        player1Board,
        player1Current,
        player2Board,
        player2Current,
        isChainRunningPlayer1,
        isChainRunningPlayer2
    ]);


    // タイマー処理
    useEffect(() => {
        if (isGameOver) return;

        const interval = setInterval(() => {
            setTimer((prev) => prev + 100);
        }, 100);

        return () => clearInterval(interval);
    }, [isGameOver]);

    // 落下ループ（左プレイヤーのみ）
    useEffect(() => {
        if (isGameOver) return;

        const interval = setInterval(() => {
            const [dx, dy] = getAdjacentPuyoOffset(player1Current.direction);

            const mainNextY = player1Current.y + 1;
            const subNextY = player1Current.y + dy + 1;
            const subX = player1Current.x + dx;

            const isMainBlocked =
                mainNextY >= FIELD_HEIGHT || player1Board[mainNextY][player1Current.x] !== null;
            const isSubBlocked =
                subNextY >= FIELD_HEIGHT ||
                subX < 0 ||
                subX >= FIELD_WIDTH ||
                player1Board[subNextY][subX] !== null;

            if (isMainBlocked || isSubBlocked) {
                fixPuyoAndCheckPlayer1();
            } else {
                setPlayer1Current((prev) => ({
                    ...prev,
                    y: prev.y + 1,
                }));
            }
        }, 500);

        return () => clearInterval(interval);
    }, [player1Board, player1Current, isChainRunningPlayer1, isGameOver]);

    // --- 右プレイヤー落下 ---
    useEffect(() => {
        if (isGameOver) return;

        const interval = setInterval(() => {
            const [dx, dy] = getAdjacentPuyoOffset(player2Current.direction);

            const mainNextY = player2Current.y + 1;
            const subNextY = player2Current.y + dy + 1;
            const subX = player2Current.x + dx;

            const isMainBlocked =
                mainNextY >= FIELD_HEIGHT || player2Board[mainNextY][player2Current.x] !== null;
            const isSubBlocked =
                subNextY >= FIELD_HEIGHT ||
                subX < 0 ||
                subX >= FIELD_WIDTH ||
                player2Board[subNextY][subX] !== null;

            if (isMainBlocked || isSubBlocked) {
                fixPuyoAndCheckPlayer2();
            } else {
                setPlayer2Current((prev) => ({
                    ...prev,
                    y: prev.y + 1,
                }));
            }
        }, 500);

        return () => clearInterval(interval);
    }, [player2Board, player2Current, isChainRunningPlayer2, isGameOver]);


    // スコア計算
    const score = poppedCount * 250 + Math.floor(timer / 100) * 10;

    // ゲームオーバー処理
    useEffect(() => {
        if (isGameOver && !isGameOverHandled) {
            setIsGameOverHandled(true);
            setIsGameOver(false);
            navigate("/score", { state: { score } });
            resetGame();
        }
    }, [isGameOver, isGameOverHandled, poppedCount, timer]);

    // Game.tsx 内の useEffect (ゲームオーバー処理)
    useEffect(() => {
        if ((isGameOverPlayer1 || isGameOverPlayer2) && !isGameOverHandled) {
            setIsGameOverHandled(true);

            let scoreData;
            if (isGameOverPlayer1) {
                scoreData = { score, player: 1 };
            } else if (isGameOverPlayer2) {
                scoreData = { score, player: 2 };
            }

            navigate("/score", { state: scoreData });

            resetGame();
        }
    }, [isGameOverPlayer1, isGameOverPlayer2, isGameOverHandled, poppedCount, timer]);


    // ゲームリセット関数
    const resetGame = () => {
        setIsGameOverHandled(false);
        setBoard(initBoard());
        setCurrentPuyo(initCurrentPuyo());
        setIsChainRunningPlayer1(false);
        setIsChainRunningPlayer2(false);
        setTimer(0);
        setPoppedCount(0);
    };

    return (
        <div
            style={{
                display: "flex",
                justifyContent: "space-around",
                alignItems: "flex-start",
                height: "100vh",
                backgroundColor: "#222",
                padding: 20,
            }}
        >
            {/* プレイヤー1画面 */}
            <div>
                <Board board={player1Board} currentPuyo={player1Current} />
                <NextPuyoDisplay nextPuyos={player1Next} position="left" />
            </div>

            {/* プレイヤー2画面 */}
            <div>
                <Board board={player2Board} currentPuyo={player2Current} />
                <NextPuyoDisplay nextPuyos={player2Next} position="right" />
            </div>
        </div>
    );
}

export default Game;
