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
import { addStitches, createStitch } from "./Logic/Stitch/StitchCrud";
import type { Pattern } from "./types/Pattern";
import type { Row } from "./types/Row";
import type { LoopType, StitchType } from "./types/Stitch";

export default function App() {
  // ===== State =====
  const [pattern, setPattern] = useState<Pattern>(() => createPattern());
  const [selectedTool, setSelectedTool] = useState<StitchType>("sc");
  const [loopOption, setLoopOption] = useState<LoopType>("both");

  /**
   * Add `count` stitches of the selected type to the current (last) row.
   * If the pattern has no rows yet, start it with "Round 1".
   */
  function handleAddStitch(count: number = 1) {
    const stitches = Array.from(
      { length: count },
      () => createStitch(selectedTool, null, loopOption)
    );
    let rows: Row[];

    const lastRow = pattern.rows[pattern.rows.length - 1];
    if (lastRow) {
      const updatedRow: Row = {
        ...lastRow,
        stitches: addStitches(lastRow.stitches, stitches),
      };
      rows = updateRow(pattern.rows, updatedRow);
    } else {
      rows = addRow([], createRow("Round 1", stitches));
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
          loopOption={loopOption}
          setLoopOption={setLoopOption}
          handleAddStitch={handleAddStitch}
          handleAddRow={handleAddRow}
        />
      </main>

      <Properties />
      <State />
    </div>
  );
}
