import React, { useEffect, useState, useRef } from "react";
import './Game.css';
import type { Cell, CurrentPuyo } from "../components/types";
import { Board } from "../components/GameBoard";
import { useNavigate, useLocation } from "react-router-dom";
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
  const location = useLocation();
  const { p1Skill, p2Skill } = location.state || {};

  // --- ボードとぷよの状態 ---
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

  // --- スコア管理 ---
  const [poppedCount, setPoppedCount] = useState(0);
  const [isGameOverHandled, setIsGameOverHandled] = useState(false);

  // --- スキル状態 ---
  const [player1SkillType] = useState<number>(p1Skill || 1);
  const [player2SkillType] = useState<number>(p2Skill || 1);
  const [player1SkillOjamaUsed, setPlayer1SkillOjamaUsed] = useState(false);
  const [player2SkillOjamaUsed, setPlayer2SkillOjamaUsed] = useState(false);
  const [player1SkillReflectActive, setPlayer1SkillReflectActive] = useState(player1SkillType === 2);
  const [player2SkillReflectActive, setPlayer2SkillReflectActive] = useState(player2SkillType === 2);

  const BOOST_PROB = 0.25; // スキル2: 攻撃2倍

  // --- 最新ぷよ参照用 ---
  const player1CurrentRef = useRef(player1Current);
  const player2CurrentRef = useRef(player2Current);
  useEffect(() => { player1CurrentRef.current = player1Current; }, [player1Current]);
  useEffect(() => { player2CurrentRef.current = player2Current; }, [player2Current]);

  // --- ぷよ固定＆連鎖処理 ---
  const handleFixAndChain = (
    current: CurrentPuyo,
    board: Cell[][],
    setBoard: React.Dispatch<React.SetStateAction<Cell[][]>>,
    setCurrent: React.Dispatch<React.SetStateAction<CurrentPuyo>>,
    next: CurrentPuyo[],
    setNext: React.Dispatch<React.SetStateAction<CurrentPuyo[]>>,
    setIsChainRunning: React.Dispatch<React.SetStateAction<boolean>>,
    sendOjama: () => void,
    setIsGameOver: React.Dispatch<React.SetStateAction<boolean>>,
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
        if (checkGameOver(newBoard)) setIsGameOver(true);
        setIsChainRunning(false);
        if (!checkGameOver(newBoard)) {
          setCurrent(next[0]);
          setNext(prev => [prev[1], initCurrentPuyo()]);
        }
      }
    };

    setTimeout(chainLoop, 300);
  };
  
  // --- スキル1: 灰色ぷよ全消し ---
  const skillRemoveOjama = (player: 1 | 2) => {
    if (player === 1 && !player1SkillOjamaUsed) {
      setPlayer1Board(prev => prev.map(row => row.map(cell => cell === "gray" ? null : cell)));
      setPlayer1SkillOjamaUsed(true);
    } else if (player === 2 && !player2SkillOjamaUsed) {
      setPlayer2Board(prev => prev.map(row => row.map(cell => cell === "gray" ? null : cell)));
      setPlayer2SkillOjamaUsed(true);
    }
  };

  // --- スキル2: 攻撃力アップ ---
  const skillActivateAttackBoost = (player: 1 | 2) => {
    if (player === 1) setPlayer1SkillReflectActive(true);
    if (player === 2) setPlayer2SkillReflectActive(true);
  };

  // --- ぷよ固定時 ---
  const fixPlayer1 = (current: CurrentPuyo) => {
    handleFixAndChain(
      current,
      player1Board,
      setPlayer1Board,
      setPlayer1Current,
      player1Next,
      setPlayer1Next,
      setIsChainRunningPlayer1,
      () => {
        const multiplier = player1SkillReflectActive && Math.random() < BOOST_PROB ? 2 : 1;
        for (let i = 0; i < multiplier; i++) setPlayer2Board(prev => addOjamaLine(prev));
      },
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
      () => {
        const multiplier = player2SkillReflectActive && Math.random() < BOOST_PROB ? 2 : 1;
        for (let i = 0; i < multiplier; i++) setPlayer1Board(prev => addOjamaLine(prev));
      },
      setIsGameOverPlayer2
    );
  };

  // --- 回転・移動 ---
  const rotateWithWallKick = (current: CurrentPuyo, board: Cell[][], clockwise = true): CurrentPuyo => {
    const dirs: CurrentPuyo["direction"][] = ["up","right","down","left"];
    const nextDir = dirs[(dirs.indexOf(current.direction) + (clockwise?1:3)) % 4];
    if (canPlacePuyo(board,current.x,current.y,nextDir)) return {...current,direction:nextDir};
    if (canPlacePuyo(board,current.x-1,current.y,nextDir)) return {...current,direction:nextDir,x:current.x-1};
    if (canPlacePuyo(board,current.x+1,current.y,nextDir)) return {...current,direction:nextDir,x:current.x+1};
    return current;
  };
  const moveHorizontal = (current: CurrentPuyo, board: Cell[][], dx: number) =>
    canMoveHorizontal(board,current,dx)?{...current,x:current.x+dx}:current;

  // --- キー操作 ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if(["arrowup","arrowdown","arrowleft","arrowright","w","a","s","d","z","enter"].includes(key)) e.preventDefault();

      if(!isChainRunningPlayer1){
        switch(key){
          case "s": setPlayer1Current(prev=>rotateWithWallKick(prev,player1Board)); break;
          case "w": setPlayer1Current(prev=>rotateWithWallKick(prev,player1Board,false)); break;
          case "a": setPlayer1Current(prev=>moveHorizontal(prev,player1Board,-1)); break;
          case "d": setPlayer1Current(prev=>moveHorizontal(prev,player1Board,1)); break;
          case " ": fixPlayer1({...player1CurrentRef.current,y:getDropPosition(player1Board,player1CurrentRef.current)}); break;
          case "e": skillActivateAttackBoost(1); break;
        }
      }
      if(!isChainRunningPlayer2){
        switch(key){
          case "arrowdown": setPlayer2Current(prev=>rotateWithWallKick(prev,player2Board)); break;
          case "arrowup": setPlayer2Current(prev=>rotateWithWallKick(prev,player2Board,false)); break;
          case "arrowleft": setPlayer2Current(prev=>moveHorizontal(prev,player2Board,-1)); break;
          case "arrowright": setPlayer2Current(prev=>moveHorizontal(prev,player2Board,1)); break;
          case "enter": fixPlayer2({...player2CurrentRef.current,y:getDropPosition(player2Board,player2CurrentRef.current)}); break;
          case "l": skillActivateAttackBoost(2); break;
        }
      }
    };
    window.addEventListener("keydown",handleKeyDown);
    return ()=>window.removeEventListener("keydown",handleKeyDown);
  },[player1Board,player2Board,isChainRunningPlayer1,isChainRunningPlayer2]);

  // --- 自動落下 (プレイヤーごとに独立) ---
  useEffect(() => {
    if (isGameOverPlayer1) return;
    const interval = setInterval(() => {
      if (isChainRunningPlayer1) return;
      setPlayer1Current(prev => {
        const [dx, dy] = getAdjacentPuyoOffset(prev.direction);
        const mainBlocked = prev.y + 1 >= 12 || player1Board[prev.y + 1][prev.x] !== null;
        const subBlocked = prev.y + dy + 1 >= 12 || prev.x + dx < 0 || prev.x + dx >= 6 || player1Board[prev.y + dy + 1][prev.x + dx] !== null;
        if (mainBlocked || subBlocked) {
          fixPlayer1(prev);
          return prev;
        }
        return { ...prev, y: prev.y + 1 };
      });
    }, 500);
    return () => clearInterval(interval);
  }, [player1Board, isChainRunningPlayer1, isGameOverPlayer1]);

  useEffect(() => {
    if (isGameOverPlayer2) return;
    const interval = setInterval(() => {
      if (isChainRunningPlayer2) return;
      setPlayer2Current(prev => {
        const [dx, dy] = getAdjacentPuyoOffset(prev.direction);
        const mainBlocked = prev.y + 1 >= 12 || player2Board[prev.y + 1][prev.x] !== null;
        const subBlocked = prev.y + dy + 1 >= 12 || prev.x + dx < 0 || prev.x + dx >= 6 || player2Board[prev.y + dy + 1][prev.x + dx] !== null;
        if (mainBlocked || subBlocked) {
          fixPlayer2(prev);
          return prev;
        }
        return { ...prev, y: prev.y + 1 };
      });
    }, 500);
    return () => clearInterval(interval);
  }, [player2Board, isChainRunningPlayer2, isGameOverPlayer2]);

  // --- スコアとゲームオーバー ---
  const score = poppedCount*250;
  useEffect(()=>{
    if((isGameOverPlayer1||isGameOverPlayer2)&&!isGameOverHandled){
      setIsGameOverHandled(true);
      navigate("/score",{state:{score,player:isGameOverPlayer1?2:1}});
    }
  },[isGameOverPlayer1,isGameOverPlayer2,isGameOverHandled,poppedCount]);

// 下から5段目に灰ぷよがあれば発動
const checkAndActivateSkill1 = (player: 1 | 2) => {
  const board = player === 1 ? player1Board : player2Board;
  const skillUsed = player === 1 ? player1SkillOjamaUsed : player2SkillOjamaUsed;
  if (skillUsed) return;

  for (let x = 0; x < 6; x++) {
    if (board[7][x] === "gray") {  // 下から5段目(y=7)だけ
      skillRemoveOjama(player);
      return;
    }
  }
};

useEffect(() => { checkAndActivateSkill1(1); }, [player1Board, player1SkillOjamaUsed]);
useEffect(() => { checkAndActivateSkill1(2); }, [player2Board, player2SkillOjamaUsed]);
  
  // --- 描画 ---
  return (
    <div className="game-container">
      <div className="player-board">
        <Board board={player1Board} currentPuyo={player1Current} />
        <div className="player-side-panel">
          <NextPuyoDisplay nextPuyos={player1Next} />
          {p1Skill===1?(
            <div className={`skill-button ${player1SkillOjamaUsed?"used":""}`} onClick={()=>skillRemoveOjama(1)}>スキル1: 回復</div>
          ):(
            <div className={`skill-button active`} onClick={()=>skillActivateAttackBoost(1)}>スキル2: 攻撃力アップ</div>
          )}
        </div>
      </div>
      <div className="player-board">
        <Board board={player2Board} currentPuyo={player2Current} />
        <div className="player-side-panel">
          <NextPuyoDisplay nextPuyos={player2Next} />
          {p2Skill===1?(
            <div className={`skill-button ${player2SkillOjamaUsed?"used":""}`} onClick={()=>skillRemoveOjama(2)}>スキル1: 回復</div>
          ):(
            <div className={`skill-button active`} onClick={()=>skillActivateAttackBoost(2)}>スキル2: 攻撃力アップ</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Game;
