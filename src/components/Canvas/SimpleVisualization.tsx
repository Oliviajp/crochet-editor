import { useEffect, useState } from "react";
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

type SimpleVisualizationProps = {
  pattern: Pattern;
  editMode: boolean;
  onStitchTypeChange: (stitchId: number, newType: StitchType) => void;
  onStitchNoteChange: (stitchId: number, note: string) => void;
  onStitchDelete: (stitchId: number) => void;
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
  onStitchDelete,
}: SimpleVisualizationProps) {
  const [popover, setPopover] = useState<{
    group: StitchGroup;
    anchor: HTMLSpanElement;
  } | null>(null);

  // Track which groups are expanded inline (key = first stitch id of the group)
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());

  // Collapse all expanded groups when edit mode is turned off
  useEffect(() => {
    if (!editMode) setExpandedGroups(new Set());
  }, [editMode]);

  function toggleExpand(groupId: number) {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  }

  function handleGroupClick(group: StitchGroup, el: HTMLSpanElement) {
    if (!editMode) return;
    if (popover && popover.group.ids[0] === group.ids[0]) {
      setPopover(null);
    } else {
      setPopover({ group, anchor: el });
    }
  }

  function handleTypeChange(newType: StitchType) {
    if (!popover) return;
    for (const id of popover.group.ids) {
      onStitchTypeChange(id, newType);
    }
    setPopover({ ...popover, group: { ...popover.group, type: newType } });
  }

  function handleNoteChange(note: string) {
    if (!popover) return;
    onStitchNoteChange(popover.group.ids[0], note);
    setPopover({ ...popover, group: { ...popover.group, note } });
  }

  function handleDelete() {
    if (!popover) return;
    for (const id of popover.group.ids) {
      onStitchDelete(id);
    }
    setPopover(null);
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
                const isExpanded = expandedGroups.has(g.ids[0]);
                const isHighlighted =
                  popover && popover.group.ids[0] === g.ids[0];

                return (
                  <span key={g.ids[0]} className="simple-group">
                    {i > 0 && <span className="simple-group-sep">{", "}</span>}

                    {isExpanded ? (
                      /* Expanded: show each stitch individually */
                      <span className="simple-group-expanded">
                        {g.ids.map((id, j) => {
                          const stitch = pattern.rows
                            .flatMap((r) => r.stitches)
                            .find((s) => s.id === id);
                          if (!stitch) return null;
                          return (
                            <span key={id}>
                              {j > 0 && <span className="simple-group-sep">{", "}</span>}
                              <span
                                className={`simple-stitch ${editMode ? "editable" : ""}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (editMode) {
                                    /* clicking an individual stitch opens popover for the whole group */
                                    const span = e.currentTarget;
                                    handleGroupClick(g, span);
                                  }
                                }}
                              >
                                {STITCH_ABBREVIATIONS[stitch.type]}
                              </span>
                            </span>
                          );
                        })}
                      </span>
                    ) : editMode ? (
                      /* Collapsed in edit mode: clickable group + expand toggle */
                      <span className="simple-group-edit">
                        <span
                          className={`simple-group-text ${isHighlighted ? "selected" : ""}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGroupClick(g, e.currentTarget);
                          }}
                        >
                          {g.count > 1
                            ? `${STITCH_ABBREVIATIONS[g.type]} x${g.count}`
                            : STITCH_ABBREVIATIONS[g.type]}
                        </span>
                        {g.count > 1 && (
                          <button
                            className="simple-expand-btn"
                            title="Expand group"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(g.ids[0]);
                            }}
                          >
                            +
                          </button>
                        )}
                      </span>
                    ) : (
                      /* Read-only */
                      <span>
                        {g.count > 1
                          ? `${STITCH_ABBREVIATIONS[g.type]} x${g.count}`
                          : STITCH_ABBREVIATIONS[g.type]}
                      </span>
                    )}

                    {g.note && !isExpanded && (
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
            <div className="stitch-popover-actions">
              <button className="stitch-popover-delete" onClick={handleDelete}>
                Delete
              </button>
              <button className="stitch-popover-close" onClick={() => setPopover(null)}>
                Done
              </button>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
