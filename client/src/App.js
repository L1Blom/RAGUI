import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.min.js";

import Chat from "./pages/Chat";
import Upload from "./pages/Upload";
import Reload from "./pages/Reload";
import Clear from "./pages/Clear";
import Models from "./pages/Models";
import Temperature from "./pages/Temperature";
import Settings from "./pages/Settings";


function App() {
  return (
    <BrowserRouter basename="/react">
      <Routes>
        <Route path="/" element={<Chat />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/temp" element={<Temperature />} />
        <Route path="/tupload" element={<Upload />} />
        <Route path="/reload" element={<Reload />} />
        <Route path="/clear" element={<Clear />} />
        <Route path="/model" element={<Models />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
