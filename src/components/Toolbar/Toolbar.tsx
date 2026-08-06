import "./Toolbar.css";

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
  handleAddStitch: () => void;
  handleAddRow: () => void;
};

export default function Toolbar({
  selectedTool,
  setSelectedTool,
  handleAddStitch,
  handleAddRow,
}: ToolbarProps) {
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
      <button onClick={handleAddStitch}>Add Stitch</button>

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
