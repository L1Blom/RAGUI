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


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Chat />} />
        <Route path="/temp" element={<Temperature />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/reload" element={<Reload />} />
        <Route path="/clear" element={<Clear />} />
        <Route path="/model" element={<Models />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
