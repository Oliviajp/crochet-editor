# SimpleVisualization.tsx — Word-by-Word Explanation

Source file: `src/components/Canvas/SimpleVisualization.tsx`

`SimpleVisualization.tsx` is the **simple text view**. Instead of drawing crochet symbols, it renders each row of the pattern as plain, human-readable crochet notation — for example a row with the stitches `SC, CH, SC, SC, CH, SC` becomes `Round 1: (SC, CH, SC) x2`. The interesting logic is `formatStitches`, which compresses a flat list of stitches into compact notation by detecting repeated groups.

---

## Imports

```tsx
import type { Pattern } from "../../types/Pattern";
```

**Word-by-word:** `import type` — import only the TypeScript *type* (erased at compile time, nothing in the JavaScript output). `{ Pattern }` — the `Pattern` type. `from` — from. `"../../types/Pattern"` — relative path: up two folders, then `types/Pattern` (`Pattern.ts`). Used to type the props.

```tsx
import type { Stitch, StitchType } from "../../types/Stitch";
```

**Word-by-word:** `import type` — type-only import again. `{ Stitch, StitchType }` — `Stitch` (one stitch object) and `StitchType` (the union of allowed stitch type strings). `from "../../types/Stitch"` — path to `src/types/Stitch.ts`. Both are used throughout the compression logic.

---

## The abbreviation dictionary

```tsx
const STITCH_ABBREVIATIONS: Record<StitchType, string> = {
```

**Word-by-word:** `const` — declare a constant. `STITCH_ABBREVIATIONS` — its name (uppercase = constant). `: Record<StitchType, string>` — TypeScript type: an object whose keys are all `StitchType` values and whose values are all `string`. `=` — assigned. `{` — start the object.

```tsx
  ch: "CH",
```

**Word-by-word:** `ch` — the key (a stitch type). `:` — separator. `"CH"` — the short abbreviation used in the text output. `,` — end the entry.

```tsx
  slst: "SLST",
  sc: "SC",
  hdc: "HDC",
  dc: "DC",
  tr: "TR",
  puff: "PUFF",
  bobble: "BOB",
  popcorn: "POP",
};
```

**Word-by-word:** The remaining entries — one short abbreviation per stitch type (SLST, SC, HDC, DC, TR, PUFF, BOB, POP). `};` — close the object and end the statement. Because of the `Record` annotation, TypeScript guarantees every stitch type has an abbreviation.

---

## The `sameStitch` helper

```tsx
function sameStitch(a: Stitch, b: Stitch): boolean {
```

**Word-by-word:** `function` — declare a function. `sameStitch` — its name. `(a: Stitch, b: Stitch)` — two stitches as arguments, both typed `Stitch`. `: boolean` — it returns a boolean (true or false). `{` — start body.

```tsx
  return a.type === b.type;
}
```

**Word-by-word:** `return` — give back. `a.type === b.type` — are the two stitches the same *type*? (Strict equality — `===` checks both value and type.) For the purposes of compression, two stitches are "the same" if their type matches; the other fields (`id`, `parentId`, `workedInto`) are ignored. `}` — end the function.

---

## The `repeatCount` helper

```tsx
/** Count how many consecutive repeats of `unit` start at `start`. */
function repeatCount(
  stitches: Stitch[],
  start: number,
  unit: Stitch[]
): number {
```

**Word-by-word:** A JSDoc comment: "Count how many consecutive repeats of `unit` start at `start`." `function repeatCount` — declares the function. Arguments: `stitches` — the full row of stitches (typed `Stitch[]`, an array of stitches); `start` — the index in `stitches` where the repeated block begins (a `number`); `unit` — the block of stitches being repeated (`Stitch[]`). `: number` — returns a count. `{` — start body.

```tsx
  const n = stitches.length;
```

**Word-by-word:** `const n` — a local shorthand. `= stitches.length` — the total number of stitches in the row. Used in the loop bounds below.

```tsx
  let count = 1;
```

**Word-by-word:** `let` — a variable that can change. `count` — how many repeats found so far. `= 1` — starts at 1 because the `unit` itself (the first occurrence) counts as the first repeat.

```tsx
  while (
    start + unit.length * (count + 1) <= n &&
    unit.every((stitch, k) => sameStitch(stitch, stitches[start + unit.length * count + k]))
  ) {
```

**Word-by-word:** `while (` — loop while the condition is true. Two conditions joined by `&&` (both must hold):

1. `start + unit.length * (count + 1) <= n` — is there still room for one more copy of the unit after the ones already counted? (`count + 1` copies would need to fit within the row.)
2. `unit.every((stitch, k) => ...)` — does every stitch of the *next* copy match? `.every` returns true only if the callback is true for each element. `(stitch, k)` — each stitch of `unit` and its index `k`. `sameStitch(stitch, stitches[start + unit.length * count + k])` — compare the unit's stitch `k` against the stitch at position `start + (count copies already counted) + k` — i.e. the same offset `k` inside the next copy of the unit.

If both hold, another full copy of the unit exists right after the current run.

```tsx
    count++;
  }
```

**Word-by-word:** `count++` — increment the repeat count by 1, then loop again to look for yet another copy. `}` — end the while loop. When the loop exits, `count` is the total number of consecutive copies of `unit` starting at `start`.

```tsx
  return count;
}
```

**Word-by-word:** `return count;` — hand back the final repeat count. `}` — end the function.

---

## The `formatStitches` helper

```tsx
/**
 * Compress a row of stitches into crochet-style notation,
 * e.g. [SC, CH, SC, SC, CH, SC] -> "(SC, CH, SC) x2".
 */
function formatStitches(stitches: Stitch[]): string {
```

**Word-by-word:** JSDoc: "Compress a row of stitches into crochet-style notation, e.g. [SC, CH, SC, SC, CH, SC] → '(SC, CH, SC) x2'." `function formatStitches` — declares the main compression function. `(stitches: Stitch[])` — the row, an array of stitches. `: string` — returns the formatted text. `{` — start body.

```tsx
  const parts: string[] = [];
```

**Word-by-word:** `const parts` — an array that will collect the chunks of the final string. `: string[]` — an array of strings. `= []` — starts empty.

```tsx
  let i = 0;
```

**Word-by-word:** `let i` — the current position (index) being processed in the stitches array. `= 0` — start at the beginning.

```tsx
  while (i < stitches.length) {
```

**Word-by-word:** `while (i < stitches.length)` — keep going until we've consumed the whole row. Each iteration consumes at least one stitch, so the loop always ends.

```tsx
    let bestCount = 1;
```

**Word-by-word:** `let bestCount` — the best (largest) repeat count found for the block starting at `i`. `= 1` — the default: at minimum, the block appears once (itself).

```tsx
    let bestUnit: Stitch[] = [stitches[i]];
```

**Word-by-word:** `let bestUnit` — the best repeating block of stitches found. `: Stitch[]` — an array of stitches. `= [stitches[i]]` — starts as just the single stitch at the current position.

```tsx
    // Greedily find the longest repeating unit at this position.
    for (let len = 1; len <= Math.floor((stitches.length - i) / 2); len++) {
```

**Word-by-word:** A comment: "Greedily find the longest repeating unit at this position." `for (let len = 1; ...; len++)` — try every possible unit length, starting at 1. `len <= Math.floor((stitches.length - i) / 2)` — the unit can't be longer than half the remaining stitches, otherwise it couldn't repeat even twice (`.length - i` is how many stitches remain; `/ 2` because a repeat needs two copies; `Math.floor` rounds down). `len++` — try the next length.

```tsx
      const unit = stitches.slice(i, i + len);
```

**Word-by-word:** `const unit` — this candidate block. `stitches.slice(i, i + len)` — copy `len` stitches starting at position `i` (slice's end index is exclusive, so it grabs indices `i` through `i + len - 1`).

```tsx
      const count = repeatCount(stitches, i, unit);
```

**Word-by-word:** `const count` — how many times this candidate block repeats starting at `i`. `repeatCount(stitches, i, unit)` — call the helper from above with the full row, the start position, and the candidate unit.

```tsx
      if (count > bestCount || (count === bestCount && len > bestUnit.length)) {
```

**Word-by-word:** `if (` — check whether this candidate beats the current best. `count > bestCount` — it repeats more times, **or** (`||`). `(count === bestCount && len > bestUnit.length)` — same repeat count but a *longer* unit. The second condition is the tie-breaker: given equal repeats, prefer the longer unit (e.g. for `SC, SC, DC, SC, SC, DC`, prefer `(SC, SC, DC) x2` over `SC x2, DC, SC x2, DC`).

```tsx
        bestCount = count;
        bestUnit = unit;
      }
```

**Word-by-word:** If the condition holds, update the best: `bestCount = count` and `bestUnit = unit`. `}` — close the `if`.

```tsx
    }

    const unitText = bestUnit
      .map((stitch) => STITCH_ABBREVIATIONS[stitch.type])
      .join(", ");
```

**Word-by-word:** `}` — close the `for` loop (all lengths tried). Then `const unitText` — the best unit as readable text: `.map((stitch) => STITCH_ABBREVIATIONS[stitch.type])` — convert each stitch to its abbreviation (e.g. `SC`); `.join(", ")` — join them with a comma and space (e.g. `"SC, CH, SC"`).

```tsx
    if (bestCount > 1) {
```

**Word-by-word:** `if (bestCount > 1)` — does the best unit repeat more than once?

```tsx
      parts.push(
        bestUnit.length === 1
          ? `${unitText} x${bestCount}`
          : `(${unitText}) x${bestCount}`
      );
```

**Word-by-word:** `parts.push(` — append the compressed chunk. Inner ternary: `bestUnit.length === 1` — is the unit a single stitch? `? `${unitText} x${bestCount}`` — if yes, no parentheses: e.g. `SC x3`. `: `(${unitText}) x${bestCount}`` — if no, wrap in parentheses: e.g. `(SC, CH, SC) x2`. Both are template literals producing `unit x count`. `)` — close push.

```tsx
    } else {
      parts.push(unitText);
    }
```

**Word-by-word:** `} else {` — the unit repeats only once (no compression possible). `parts.push(unitText);` — just push the plain text (e.g. `DC`). `}` — close the else.

```tsx
    i += bestUnit.length * bestCount;
```

**Word-by-word:** `i +=` — advance the position by. `bestUnit.length * bestCount` — the total number of stitches this chunk covered (unit size times repeats). This skips past the consumed stitches so the next iteration starts fresh.

```tsx
  }

  return parts.join(", ");
}
```

**Word-by-word:** `}` — close the while loop (whole row consumed). `return parts.join(", ");` — join all chunks with ", " into the final string, e.g. `"(SC, CH, SC) x2, DC"`. `}` — end the function.

---

## The component

```tsx
type SimpleVisualizationProps = {
  pattern: Pattern;
};
```

**Word-by-word:** `type` — declare a type alias. `SimpleVisualizationProps` — the props type. `{ pattern: Pattern }` — one property, `pattern`, of type `Pattern`.

```tsx
export default function SimpleVisualization({ pattern }: SimpleVisualizationProps) {
```

**Word-by-word:** `export default` — the default export. `function SimpleVisualization` — the component function. `({ pattern }` — destructure the `pattern` prop. `: SimpleVisualizationProps` — type the props. `{` — start body.

### Empty state

```tsx
  if (pattern.rows.length === 0) {
    return (
      <p className="simple-empty">
        No stitches yet — pick a stitch, then hit "Add Stitch"
      </p>
    );
  }
```

**Word-by-word:** `if (pattern.rows.length === 0)` — no rows at all? `return (` — render a `<p>` (paragraph) with `className="simple-empty"` (gray styling) containing the hint message, matching the empty state of the chart view. `</p>` / `);` — close. `}` — close the `if`.

### Rendering rows

```tsx
  return (
    <div className="simple-view">
```

**Word-by-word:** `return (` — otherwise render the main content. `<div className="simple-view">` — a container div; the CSS gives it padding and lets it scroll (`overflow: auto`).

```tsx
      {pattern.rows.map((row) => (
```

**Word-by-word:** `{pattern.rows.map((row) => (` — loop over the rows, one paragraph each. `(row) => (` — for each row, with implicit return.

```tsx
        <p key={row.id} className="simple-row">
```

**Word-by-word:** `<p` — a paragraph. `key={row.id}` — React's unique key for list items (the row's id). `className="simple-row"` — monospace styling class.

```tsx
          <span className="simple-row-label">{row.label}:</span>{" "}
```

**Word-by-word:** `<span className="simple-row-label">` — a span with the label styling (bold teal). `{row.label}:` — the row's label text followed by a literal colon (e.g. `Round 1:`). `</span>` — close. `{" "}` — an explicit space character between the label and the stitches (JSX collapses whitespace, so this ensures the space is kept).

```tsx
          <span className="simple-row-text">
            {formatStitches(row.stitches)}
          </span>
```

**Word-by-word:** `<span className="simple-row-text">` — a span with the stitches styling. `{formatStitches(row.stitches)}` — call the compression function on this row's stitches to produce e.g. `(SC, CH, SC) x2`. `</span>` — close.

```tsx
        </p>
      ))}
    </div>
  );
}
```

**Word-by-word:** `</p>` — close the paragraph. `))}` — close the arrow function, `.map()`, and JSX expression. `</div>` — close the container. `);` — end returned JSX. `}` — end the component.

---

## Summary

- The component turns each row into one paragraph: `RowLabel: compressed stitches`.
- `repeatCount` counts consecutive copies of a candidate block at a given position.
- `formatStitches` greedily walks the row: at each position it tries every possible unit length (up to half the remaining stitches), picks the block with the most repeats (longer block on ties), and emits either `UNIT xN`, `(UNIT) xN`, or just `UNIT`.
- Single stitches repeat without parentheses (`SC x3`); multi-stitch groups use parentheses (`(SC, CH, SC) x2`).
- The abbreviations come from `STITCH_ABBREVIATIONS`, keyed by `StitchType` so TypeScript guarantees completeness.
