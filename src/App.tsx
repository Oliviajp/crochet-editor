import "./App.css";

import Header from "./components/Header/Header";
import Toolbar from "./components/Toolbar/Toolbar";
import Canvas from "./components/Canvas/Canvas";
import Properties from "./components/Properties/Properties";
import State from "./components/State/State";
import FileExplorer from "./components/FileExplorer/FileExplorer";
import { useState } from "react";

export default function App() {

  // ===== State =====
  const [selectedTool, setSelectedTool] = useState("Select stitch");
  const [selectedStitch, setSelectedStitch] = useState<number | null>(null);
  const [zoom, setZoom] = useState(100);
  return (
    <div className="app">
      <Header />
      

      <main className="main">
        <FileExplorer />
        <Canvas />
        <Toolbar
          selectedTool={selectedTool}
          setSelectedTool={setSelectedTool}
      />
        
      </main>
        <Properties />
        <State />
      <p>Selected Tool: {selectedTool}</p>
    </div>
  );
}