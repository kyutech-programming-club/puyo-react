// src/components/GameBoard.tsx
import React from 'react';
import Puyo from './Puyo';
import type { Cell } from '../types/GameTypes';

type GameBoardProps = {
    board: Cell[][];
};

const GameBoard: React.FC<GameBoardProps> = ({ board }) => {
    return (
        <div className="game-board">
            {board.map((row, rowIndex) => (
                <div key={rowIndex} className="row">
                    {row.map((cell, colIndex) => (
                        <Puyo key={colIndex} color={cell.color} />
                    ))}
                </div>
            ))}
        </div>
    );
};

export default GameBoard;