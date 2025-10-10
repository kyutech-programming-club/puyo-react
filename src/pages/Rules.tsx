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
            <li>ぷよは2個1組で落ちてくる。</li>
            <li>同じ色を4つ以上つなげると消える。</li>
            <li>消えたぷよの上にあるぷよは落下する。</li>
            <li>連鎖を作ると相手におじゃまぷよを送れる。</li>
            <li>ボードの上までぷよが積まれるとゲームオーバー。</li>
          </ul>
        </section>

        <section>
          <h2>スキル</h2>
          <ul>
            <li>スキル1 (S1 / Q / P): 灰色ぷよを全消しできる。</li>
            <li>スキル2 (S2 / E / L): ランダムで同じ色を消せる。</li>
            <li>一度使用すると再度は使えない。</li>
          </ul>
        </section>

        <section>
          <h2>勝利条件</h2>
          <ul>
            <li>相手より長く耐えてぷよを消し続ける。</li>
            <li>相手が上まで積んでしまったら勝利。</li>
          </ul>
        </section>
      </div>

      <Link to="/" className="back-button">ホームに戻る</Link>
    </div>
  );
};
