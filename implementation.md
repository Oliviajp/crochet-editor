# Inline Expand Grouped Stitches — Implementation

## What

Added a `+` button on grouped stitches (e.g. `SC x7`) in edit mode. Clicking it expands the group inline in the editor, showing each stitch individually (`SC, SC, SC, SC, SC, SC, SC`). Clicking `+` again collapses back.

## Where

`src/components/Canvas/SimpleVisualization.tsx` and `SimpleVisualization.css`.

## How

**State** — a `Set<number>` of expanded group IDs (keyed by the first stitch id in the group):

```ts
const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());
```

`toggleExpand(groupId)` adds/removes from the set.

**Rendering** — when a group is expanded, instead of `SC x7`, each stitch is rendered individually:

```tsx
{isExpanded ? (
  <span className="simple-group-expanded">
    {g.ids.map((id, j) => (
      <span key={id}>
        {j > 0 && <span className="simple-group-sep">{", "}</span>}
        <span className={`simple-stitch ${editMode ? "editable" : ""}`}
              onClick={() => handleGroupClick(g, span)}>
          {STITCH_ABBREVIATIONS[stitch.type]}
        </span>
      </span>
    ))}
  </span>
) : editMode ? (
  <span className="simple-group-edit">
    <span className="simple-group-text" onClick={...}>SC x7</span>
    {g.count > 1 && (
      <button className="simple-expand-btn" onClick={...}>+</button>
    )}
  </span>
) : (
  <span>SC x7</span>
)}
```

The `+` button only appears on groups with 2+ stitches. Clicking an expanded stitch opens the same popover (for the whole group).

## Why

Groups compress repeats for readability, but sometimes you need to see or edit a specific stitch in the middle. The `+` toggle lets you drill in without losing the compressed view as default. The popover still edits the whole group — this is just a visual expand.
