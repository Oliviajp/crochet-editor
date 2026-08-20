import { useState } from "react";
import type { StartType } from "../../types/Pattern";
import "./PatternHome.css";

type PatternHomeProps = {
  onCreate: (startType: StartType) => void;
};

export default function PatternHome({ onCreate }: PatternHomeProps) {
  const [startType, setStartType] = useState<StartType>("magic-circle");

  return (
    <div className="pattern-home">
      <h1 className="pattern-home-title">TEST</h1>
      <p className="pattern-home-subtitle">Crochet Pattern Editor</p>

      <div className="pattern-home-start">
        <span className="pattern-home-start-label">Start with:</span>
        <div className="pattern-home-start-options">
          <button
            className={startType === "magic-circle" ? "active" : undefined}
            onClick={() => setStartType("magic-circle")}
          >
            Magic Circle
          </button>
          <button
            className={startType === "slip-knot" ? "active" : undefined}
            onClick={() => setStartType("slip-knot")}
          >
            Slip Knot
          </button>
        </div>
      </div>

      <button
        className="pattern-home-create"
        onClick={() => onCreate(startType)}
      >
        Create Pattern
      </button>
    </div>
  );
}
