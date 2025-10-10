import React from "react";
import { Link } from "react-router-dom";
import './Home.css';

export const Home: React.FC = () => {
  return (
    <div className="home-container">
      <h1 className="home-title">Color Bash!</h1>

      <div className="home-buttons">
<Link
  to="/game"
  className="game-start-button"
>
  ゲームスタート
</Link>
        <Link to="/instructions" className="home-button instructions-button">
          操作説明
        </Link>
        <Link to="/rules" className="home-button rules-button">
          ルール説明
        </Link>
      </div>
    </div>
  );
};
