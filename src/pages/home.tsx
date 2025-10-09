import React from "react";
import { Link } from "react-router-dom";

export const Home: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800 text-white">
            <h1 className="text-4xl font-bold mb-6">ぷよぷよ</h1>
            <Link
                to="/game"
                className="px-6 py-3 bg-blue-500 rounded-lg hover:bg-blue-600"
            >
                ゲームスタート
            </Link>
        </div>
    );
};
