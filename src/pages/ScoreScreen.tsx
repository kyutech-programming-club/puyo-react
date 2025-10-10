import { useNavigate, useLocation } from "react-router-dom";

export const ScoreScreen: React.FC = () => {
    const navigate = useNavigate(); 
    const location = useLocation(); 

    const player = location.state?.player ?? 1;

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h1>ゲーム終了！</h1>
            <p>プレイヤー{player}の勝ち</p>
            <button onClick={() => navigate("/game")}>もう一度遊ぶ</button>
        </div>
    );
};
