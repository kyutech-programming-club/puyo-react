import React from "react";
import { Link } from "react-router-dom";
import './Rules.css';

export const Rules: React.FC = () => {
  return (
    <div className="rules-container">
      <h1 className="rules-title">ゲームルール</h1>

      <div className="rules-content">
        <section>
          <h2>基本ルール</h2>
          <ul>
            <li>ブロックは2個1組で落ちてくる。</li>
            <li>同じ色を4つ以上つなげると消える。</li>
            <li>消えたブロックの上にあるブロックは落下する。</li>
            <li>ブロックを消すと相手におじゃまぷよを送れる。</li>
            <li>ボードの上までブロックが積まれるとゲームオーバー。</li>
          </ul>
        </section>

        <section>
          <h2>敗北条件</h2>
          <ul>
            <li>上まで積んでしまったら負け。</li>
          </ul>
        </section>
      </div>

      <Link to="/" className="back-button">ホームに戻る</Link>
    </div>
  );
};
