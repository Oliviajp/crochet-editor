import { useState } from "react";
import { createPortal } from "react-dom";
import type { Pattern } from "../../types/Pattern";
import type { Stitch, StitchType } from "../../types/Stitch";
import "./SimpleVisualization.css";

const STITCH_ABBREVIATIONS: Record<StitchType, string> = {
  ch: "CH",
  slst: "SLST",
  sc: "SC",
  hdc: "HDC",
  dc: "DC",
  tr: "TR",
  puff: "PUFF",
  bobble: "BOB",
  popcorn: "POP",
};

const STITCH_OPTIONS: StitchType[] = ["ch", "slst", "sc", "hdc", "dc", "tr"];

/** A run of consecutive same-type stitches. */
type StitchGroup = {
  type: StitchType;
  count: number;
  note: string;
  /** IDs of all stitches in this group (for bulk updates). */
  ids: number[];
};

function buildGroups(stitches: Stitch[]): StitchGroup[] {
  const groups: StitchGroup[] = [];
  for (const s of stitches) {
    const last = groups[groups.length - 1];
    if (last && last.type === s.type) {
      last.count++;
      last.ids.push(s.id);
    } else {
      groups.push({ type: s.type, count: 1, note: s.note, ids: [s.id] });
    }
  }
  return groups;
}

/** Render the non-edit grouped text. */
function formatStitches(stitches: Stitch[]): string {
  const groups = buildGroups(stitches);
  return groups
    .map((g) => {
      const base =
        g.count > 1
          ? `${STITCH_ABBREVIATIONS[g.type]} x${g.count}`
          : STITCH_ABBREVIATIONS[g.type];
      return g.note ? `${base} [${g.note}]` : base;
    })
    .join(", ");
}

type SimpleVisualizationProps = {
  pattern: Pattern;
  editMode: boolean;
  onStitchTypeChange: (stitchId: number, newType: StitchType) => void;
  onStitchNoteChange: (stitchId: number, note: string) => void;
};

const START_LABELS: Record<Pattern["startType"], string> = {
  "magic-circle": "Magic Circle",
  "slip-knot": "Slip Knot",
};

export default function SimpleVisualization({
  pattern,
  editMode,
  onStitchTypeChange,
  onStitchNoteChange,
}: SimpleVisualizationProps) {
  const [popover, setPopover] = useState<{
    group: StitchGroup;
    anchor: HTMLSpanElement;
  } | null>(null);

  function handleGroupClick(group: StitchGroup, el: HTMLSpanElement) {
    if (!editMode) return;
    if (popover && popover.group.type === group.type && popover.group.ids[0] === group.ids[0]) {
      setPopover(null);
    } else {
      setPopover({ group, anchor: el });
    }
  }

  function handleTypeChange(newType: StitchType) {
    if (!popover) return;
    // Change every stitch in the group
    for (const id of popover.group.ids) {
      onStitchTypeChange(id, newType);
    }
    setPopover({
      ...popover,
      group: { ...popover.group, type: newType },
    });
  }

  function handleNoteChange(note: string) {
    if (!popover) return;
    // Store note on the first stitch of the group
    onStitchNoteChange(popover.group.ids[0], note);
    setPopover({
      ...popover,
      group: { ...popover.group, note },
    });
  }

  if (pattern.rows.length === 0) {
    return (
      <p className="simple-empty">
        No stitches yet — pick a stitch, then hit "Add Stitch"
      </p>
    );
  }

  return (
    <div className="simple-view" onClick={() => editMode && setPopover(null)}>
      <p className="simple-row simple-start">
        Start: {START_LABELS[pattern.startType]}
      </p>
      {pattern.rows.map((row) => {
        const groups = buildGroups(row.stitches);
        return (
          <p key={row.id} className="simple-row">
            <span className="simple-row-label">{row.label}:</span>{" "}
            <span className="simple-row-text">
              {groups.map((g, i) => {
                const text =
                  g.count > 1
                    ? `${STITCH_ABBREVIATIONS[g.type]} x${g.count}`
                    : STITCH_ABBREVIATIONS[g.type];
                const isHighlighted =
                  popover &&
                  popover.group.type === g.type &&
                  popover.group.ids[0] === g.ids[0];

                return (
                  <span key={g.ids[0]} className="simple-group">
                    {i > 0 && <span className="simple-group-sep">{", "}</span>}
                    {editMode ? (
                      <span
                        className={`simple-group-text ${isHighlighted ? "selected" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGroupClick(g, e.currentTarget);
                        }}
                      >
                        {text}
                      </span>
                    ) : (
                      <span>{text}</span>
                    )}
                    {g.note && (
                      <span className="simple-stitch-note"> [{g.note}]</span>
                    )}
                  </span>
                );
              })}
            </span>
            <span className="simple-row-count">
              ({row.stitches.length})
            </span>
          </p>
        );
      })}
      {pattern.finished && (
        <p className="simple-row simple-finish">Fasten Off</p>
      )}

      {popover &&
        createPortal(
          <div
            className="stitch-popover"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="stitch-popover-row">
              <span className="stitch-popover-label">Type:</span>
              <div className="stitch-popover-types">
                {STITCH_OPTIONS.map((t) => (
                  <button
                    key={t}
                    className={`stitch-popover-btn ${t === popover.group.type ? "active" : ""}`}
                    onClick={() => handleTypeChange(t)}
                  >
                    {STITCH_ABBREVIATIONS[t]}
                  </button>
                ))}
              </div>
            </div>
            <div className="stitch-popover-row">
              <span className="stitch-popover-label">Note:</span>
              <input
                className="stitch-popover-input"
                type="text"
                placeholder="e.g. increase, skip..."
                value={popover.group.note}
                onChange={(e) => handleNoteChange(e.target.value)}
                autoFocus
              />
            </div>
            <button
              className="stitch-popover-close"
              onClick={() => setPopover(null)}
            >
              Done
            </button>
          </div>,
          document.body
        )}
    </div>
  );
}
