import { useState } from "react";
import "./TopScreen.css";

const TopScreen = () => {
  const [scores] = useState<number[]>([1200, 800, 950, 1500, 700, 1100]); // 仮のスコア
  const [showHowTo, setShowHowTo] = useState(false);
  const topScores = [...scores]
    .sort((a, b) => b - a) 
    .slice(0, 5);

  return (
    <div className="top-screen">
      {/* タイトル */}
      <h1 className="game-title">ぷよぷよ</h1>

      {/* スタートボタン */}
      <button
        className="start-button"
        onClick={() => alert("ゲームスタート！")}
      >
        スタート
      </button>

      {/* 操作説明 */}
      <div className="how-to-container">
        <button
          className="toggle-button"
          onClick={() => setShowHowTo(!showHowTo)}
        >
          {showHowTo ? "✕" : "操作説明"}
        </button>
        {showHowTo && (
          <div className="how-to-box">
            <p>左右矢印キー：回転</p>
            <p>下矢印キー：高速落下</p>
            <p>スペースキー：ストックとブロックを交換</p>
          </div>
        )}
      </div>

      {/* スコア表示 */}
      <div className="score-board">
        <h2>ハイスコア</h2>
        {topScores.length === 0 ? (
          <p>まだスコアがありません。</p>) : ( 
            <ul>{topScores.map((score, index) => (
            <li key={index}>{score} 点</li>
          ))}
        </ul>
          )}
      </div>
    </div>
  );
};

export default TopScreen;