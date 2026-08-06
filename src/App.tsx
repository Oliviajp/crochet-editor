import "./App.css";

import { useState } from "react";

import Canvas from "./components/Canvas/Canvas";
import FileExplorer from "./components/FileExplorer/FileExplorer";
import Header from "./components/Header/Header";
import Properties from "./components/Properties/Properties";
import State from "./components/State/State";
import Toolbar from "./components/Toolbar/Toolbar";
import { createPattern } from "./Logic/Pattern/PatternCrud";
import { addRow, createRow, updateRow } from "./Logic/Row/RowCrud";
import { addStitch, createStitch } from "./Logic/Stitch/StitchCrud";
import type { Pattern } from "./types/Pattern";
import type { Row } from "./types/Row";
import type { StitchType } from "./types/Stitch";

export default function App() {
  // ===== State =====
  const [pattern, setPattern] = useState<Pattern>(() => createPattern());
  const [selectedTool, setSelectedTool] = useState<StitchType>("sc");

  /**
   * Add the selected stitch type to the current (last) row.
   * If the pattern has no rows yet, start it with "Round 1".
   */
  function handleAddStitch() {
    const stitch = createStitch(selectedTool);
    let rows: Row[];

    const lastRow = pattern.rows[pattern.rows.length - 1];
    if (lastRow) {
      const updatedRow: Row = {
        ...lastRow,
        stitches: addStitch(lastRow.stitches, stitch),
      };
      rows = updateRow(pattern.rows, updatedRow);
    } else {
      rows = addRow([], createRow("Round 1", [stitch]));
    }

    setPattern({ ...pattern, rows });
  }

  /**
   * Append an empty row to the pattern.
   */
  function handleAddRow() {
    const rows = addRow(
      pattern.rows,
      createRow(`Round ${pattern.rows.length + 1}`)
    );
    setPattern({ ...pattern, rows });
  }

  return (
    <div className="app">
      <Header />

      <main className="main">
        <FileExplorer />
        <Canvas pattern={pattern} />
        <Toolbar
          selectedTool={selectedTool}
          setSelectedTool={setSelectedTool}
          handleAddStitch={handleAddStitch}
          handleAddRow={handleAddRow}
        />
      </main>

      <Properties />
      <State />
    </div>
  );
}
