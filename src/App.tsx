import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./pages/home";
import { Game } from "./pages/Game";
import { ScoreScreen } from "./pages/ScoreScreen";
import { Instructions } from "./pages/Instructions"; 
import { Rules } from "./pages/Rules"; 
import { SkillSelect } from "./pages/SkillSelect";


const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game" element={<Game />} />
        <Route path="/score" element={<ScoreScreen />} />
        <Route path="/instructions" element={<Instructions />} />
        <Route path="/rules" element={<Rules />} />
  <Route path="/skill" element={<SkillSelect />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
