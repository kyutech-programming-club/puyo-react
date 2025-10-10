import React from "react";
import { Link } from "react-router-dom";
import './Instructions.css';

export const Instructions: React.FC = () => {
  return (
    <div className="instructions-container">
      <h1 className="instructions-title">操作説明</h1>

      <div className="instructions-players">
        <div className="instructions-section">
          <h2>左プレイヤー (1P)</h2>
          <ul>
            <li><span className="key">W</span> : ブロックを回転（反時計回り）</li>
            <li><span className="key">S</span> : ブロックを回転（時計回り）</li>
            <li><span className="key">A</span> : 左に移動</li>
            <li><span className="key">D</span> : 右に移動</li>
            <li><span className="key">Space</span> : 早く落下</li>
          </ul>
        </div>

        <div className="instructions-section">
          <h2>右プレイヤー (2P)</h2>
          <ul>
            <li><span className="key">↑</span> : ブロックを回転（反時計回り）</li>
            <li><span className="key">↓</span> : ブロックを回転（時計回り）</li>
            <li><span className="key">←</span> : 左に移動</li>
            <li><span className="key">→</span> : 右に移動</li>
            <li><span className="key">Enter</span> : 早く落下</li>
          </ul>
        </div>
      </div>

      <Link to="/" className="back-button">ホームに戻る</Link>
    </div>
  );
};
