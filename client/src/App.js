import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.min.js";

import Chat from "./pages/Chat";
import Settings from "./pages/Settings";
import Directory from "./pages/Directory";
import Configuration from "./pages/Configuration";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Chat />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/directory" element={<Directory />} />
        <Route path="/configuration" element={<Configuration />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
