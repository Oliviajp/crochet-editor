import "./Properties.css";
import type { Pattern } from "../../types/Pattern";

type PropertiesProps = {
  pattern: Pattern;
  onFastenOff: () => void;
};

const START_TYPE_LABELS: Record<Pattern["startType"], string> = {
  "magic-circle": "Magic Circle",
  "slip-knot": "Slip Knot",
};

export default function Properties({ pattern, onFastenOff }: PropertiesProps) {
  const totalStitches = pattern.rows.reduce(
    (sum, row) => sum + row.stitches.length,
    0
  );

  return (
    <div className="properties">
      <h2>Properties</h2>

      <div className="properties-section">
        <span className="properties-label">Start:</span>
        <span>{START_TYPE_LABELS[pattern.startType]}</span>
      </div>

      <div className="properties-section">
        <span className="properties-label">Status:</span>
        <span>{pattern.finished ? "Finished" : "In progress"}</span>
      </div>

      <div className="properties-footer">
        <span>Total stitches: {totalStitches}</span>
        {!pattern.finished && (
          <button className="properties-fasten-off" onClick={onFastenOff}>
            Fasten Off
          </button>
        )}
      </div>
    </div>
  );
}
