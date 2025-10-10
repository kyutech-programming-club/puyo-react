import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import './ScoreScreen.css';

export const ScoreScreen: React.FC = () => {
    const navigate = useNavigate(); 
    const location = useLocation(); 

    const player = location.state?.player ?? 1;
    const score = location.state?.score ?? 0;

    // 星を背景に表示
    useEffect(() => {
        const body = document.body;
        const stars: HTMLDivElement[] = [];
        for(let i = 0; i < 50; i++){
            const star = document.createElement('div');
            star.className = 'star';
            const size = Math.random()*3 + 1;
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;
            star.style.top = `${Math.random()*window.innerHeight}px`;
            star.style.left = `${Math.random()*window.innerWidth}px`;
            star.style.animationDuration = `${Math.random()*5 + 3}s`;
            body.appendChild(star);
            stars.push(star);
        }
        return () => stars.forEach(s => s.remove());
    }, []);

    return (
        <div className="score-container">
            <h1>ゲーム終了！</h1>
            <p>プレイヤー{player}の勝利</p>
            <p>スコア: {score}</p>
            <button onClick={() => navigate("/")}>ホームに戻る</button>
        </div>
    );
};
