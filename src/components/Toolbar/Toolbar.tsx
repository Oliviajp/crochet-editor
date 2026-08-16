import "./Toolbar.css";

import { useState } from "react";

import type { StitchType } from "../../types/Stitch";

const STITCH_TOOLS: { type: StitchType; label: string }[] = [
  { type: "ch", label: "CH" },
  { type: "slst", label: "SLST" },
  { type: "sc", label: "SC" },
  { type: "hdc", label: "HDC" },
  { type: "dc", label: "DC" },
  { type: "tr", label: "TR" },
];

type ToolbarProps = {
  selectedTool: StitchType;
  setSelectedTool: (tool: StitchType) => void;
  handleAddStitch: (count?: number) => void;
  handleAddRow: () => void;
};

const MAX_STITCH_COUNT = 999;

export default function Toolbar({
  selectedTool,
  setSelectedTool,
  handleAddStitch,
  handleAddRow,
}: ToolbarProps) {
  const [count, setCount] = useState("1");

  /** Parse the count box: empty/invalid/0 all fall back to 1. */
  function stitchCount(): number {
    const parsed = Math.floor(Number(count));
    if (Number.isNaN(parsed) || parsed < 1) return 1;
    return Math.min(parsed, MAX_STITCH_COUNT);
  }

  function addStitches() {
    handleAddStitch(stitchCount());
  }

  return (
    <div className="toolbar">
      <span className="toolbar-section-label">Tools</span>
      <button disabled title="Coming soon">
        Select
      </button>
      <button disabled title="Coming soon">
        Move
      </button>
      <button disabled title="Magic ring — coming soon">
        MR
      </button>

      <span className="toolbar-section-label">Stitches</span>
      {STITCH_TOOLS.map((tool) => (
        <button
          key={tool.type}
          className={selectedTool === tool.type ? "active" : undefined}
          onClick={() => setSelectedTool(tool.type)}
        >
          {tool.label}
        </button>
      ))}

      <span className="toolbar-section-label">Edit</span>
      <button onClick={handleAddRow}>New Row</button>
      <div className="toolbar-add">
        <input
          type="number"
          className="toolbar-count"
          min={1}
          max={MAX_STITCH_COUNT}
          step={1}
          value={count}
          onChange={(event) => setCount(event.target.value)}
          title="Number of stitches to add"
          aria-label="Number of stitches to add"
        />
        <button
          onClick={addStitches}
          className="toolbar-add-button"
          title="Add the selected stitch that many times"
        >
          Add Stitch
        </button>
      </div>

      <span className="toolbar-section-label">History</span>
      <button disabled title="Coming soon">
        Undo
      </button>
      <button disabled title="Coming soon">
        Redo
      </button>
    </div>
  );
}
