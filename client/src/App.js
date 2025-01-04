import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.min.js";

import Chat from "./pages/Chat";
import Settings from "./pages/Settings";
import Directory from "./pages/Directory";


function App() {
  return (
    <BrowserRouter basename="/react">
      <Routes>
        <Route path="/" element={<Chat />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/directory" element={<Directory />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
