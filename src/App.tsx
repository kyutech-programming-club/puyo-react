import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./pages/home";
import { Game } from "./pages/Game";
import { ScoreScreen } from "./pages/ScoreScreen";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game" element={<Game />} />
        <Route path="/score" element={<ScoreScreen />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
