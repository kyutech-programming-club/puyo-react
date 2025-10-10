import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SkillSelect.css";

export const SkillSelect: React.FC = () => {
  const navigate = useNavigate();

  // 各プレイヤーのスキル選択状態
  const [player1Skill, setPlayer1Skill] = useState<number | null>(null);
  const [player2Skill, setPlayer2Skill] = useState<number | null>(null);

const handleStart = () => {
  if (player1Skill != null && player2Skill != null) {
    navigate("/game", {
      state: { p1Skill: player1Skill, p2Skill: player2Skill },
    });
  } else {
    alert("両プレイヤーのスキルを選択してください！");
  }
};

  return (
    <div className="skill-select-container">
      <h1>スキル選択</h1>
      <div className="players-select">
        {/* --- Player 1 --- */}
        <div className="player-select">
          <h2>Player 1</h2>
          <button
            className={player1Skill === 1 ? "selected" : ""}
            onClick={() => setPlayer1Skill(1)}
          >
            スキル1：回復
          </button>
          <button
            className={player1Skill === 2 ? "selected" : ""}
            onClick={() => setPlayer1Skill(2)}
          >
            スキル2：攻撃力アップ
          </button>
        </div>

        {/* --- Player 2 --- */}
        <div className="player-select">
          <h2>Player 2</h2>
          <button
            className={player2Skill === 1 ? "selected" : ""}
            onClick={() => setPlayer2Skill(1)}
          >
            スキル1：回復
          </button>
          <button
            className={player2Skill === 2 ? "selected" : ""}
            onClick={() => setPlayer2Skill(2)}
          >
            スキル2：攻撃力アップ
          </button>
        </div>
      </div>

      <button className="start-button" onClick={handleStart}>
        ゲーム開始！
      </button>
    </div>
  );
};
