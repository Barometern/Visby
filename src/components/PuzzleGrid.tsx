import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import puzzleImage from "@/assets/puzzle-placeholder.jpg";
import { useGameState } from "@/lib/game-state";

interface PuzzleGridProps {
  highlightPiece?: number;
  interactive?: boolean;
}

// ─── Puzzle geometry ──────────────────────────────────────────────────────────
const COLS = 5;
const ROWS = 3;
const TOTAL = COLS * ROWS;
const B = 100; // SVG units per piece body (square)
const TAB = 26; // how far a tab protrudes
const NECK = 14; // half-width of tab at its base
const VW = COLS * B; // 500 — full viewBox width
const VH = ROWS * B; // 300 — full viewBox height

/**
 * Edge value for piece at (col, row).
 *
 * Rule: right and bottom are "owned" by the piece (value = 1 or -1).
 * The left of (col,row) = -(right of (col-1,row)),
 * the top  of (col,row) = -(bottom of (col,row-1)).
 *
 * Since adjacent pieces differ by 1 in col+row, their edgeVal flips sign →
 * all four shared edges automatically interlock.
 *
 * 1  = tab protrudes outward (into neighbour's space)
 * -1 = notch (accepts neighbour's tab)
 */
function edgeVal(col: number, row: number): 1 | -1 {
  return (col + row) % 2 === 0 ? 1 : -1;
}

/**
 * Build an SVG path for the piece at (col, row) in absolute puzzle coordinates.
 * All four shared edges are consistent with their neighbours.
 */
function piecePath(col: number, row: number): string {
  const top = row === 0 ? 0 : edgeVal(col, row);
  const right = col === COLS - 1 ? 0 : edgeVal(col, row);
  const bottom = row === ROWS - 1 ? 0 : edgeVal(col, row);
  const left = col === 0 ? 0 : edgeVal(col, row);

  const x0 = col * B,
    x1 = x0 + B;
  const y0 = row * B,
    y1 = y0 + B;
  const cx = x0 + B / 2; // horizontal midpoint of piece
  const cy = y0 + B / 2; // vertical   midpoint of piece

  // Each tab is a cubic bezier: the two control points are both pulled to the
  // tab tip, producing a smooth rounded bump (or concave notch when tip is inward).
  let d = `M ${x0} ${y0}`;

  // TOP edge  (left → right)
  if (top) {
    const ty = y0 - top * TAB; // tab tip Y (negative = up = outward)
    d += ` L ${cx - NECK} ${y0}`;
    d += ` C ${cx - NECK} ${ty}  ${cx + NECK} ${ty}  ${cx + NECK} ${y0}`;
  }
  d += ` L ${x1} ${y0}`;

  // RIGHT edge  (top → bottom)
  if (right) {
    const rx = x1 + right * TAB;
    d += ` L ${x1} ${cy - NECK}`;
    d += ` C ${rx} ${cy - NECK}  ${rx} ${cy + NECK}  ${x1} ${cy + NECK}`;
  }
  d += ` L ${x1} ${y1}`;

  // BOTTOM edge  (right → left)
  if (bottom) {
    const by = y1 + bottom * TAB;
    d += ` L ${cx + NECK} ${y1}`;
    d += ` C ${cx + NECK} ${by}  ${cx - NECK} ${by}  ${cx - NECK} ${y1}`;
  }
  d += ` L ${x0} ${y1}`;

  // LEFT edge  (bottom → top)
  if (left) {
    const lx = x0 - left * TAB;
    d += ` L ${x0} ${cy + NECK}`;
    d += ` C ${lx} ${cy + NECK}  ${lx} ${cy - NECK}  ${x0} ${cy - NECK}`;
  }
  d += ` L ${x0} ${y0} Z`;

  return d;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function PuzzleGrid({ highlightPiece, interactive = true }: PuzzleGridProps) {
  const { unlockedPieces, locations } = useGameState();
  const navigate = useNavigate();

  const handleClick = (i: number) => {
    if (!interactive || !unlockedPieces.includes(i)) return;
    const loc = locations[i];
    if (loc) navigate(`/location/${loc.id}`);
  };

  return (
    <div className="w-full">
      {/*
        One SVG for the whole puzzle.
        • viewBox matches piece-body coordinates exactly.
        • overflow: visible lets tabs on the outer edge render without clipping
          (outer edges are always flat, but this keeps things safe).
      */}
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }}
        aria-label="Puzzle"
      >
        <defs>
          {/* One clipPath per piece — shared by the image + stroke layers */}
          {Array.from({ length: TOTAL }, (_, i) => (
            <clipPath key={i} id={`pc-${i}`}>
              <path d={piecePath(i % COLS, Math.floor(i / COLS))} />
            </clipPath>
          ))}

          {/* Soft drop-shadow for unlocked pieces */}
          <filter id="ps" x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow dx="1" dy="2" stdDeviation="2.5" floodColor="rgba(0,0,0,0.35)" />
          </filter>
        </defs>

        {/* ── Empty slots ─────────────────────────────────────────────────── */}
        {Array.from({ length: TOTAL }, (_, i) => {
          if (unlockedPieces.includes(i)) return null;
          const col = i % COLS;
          const row = Math.floor(i / COLS);
          return (
            <g key={`slot-${i}`}>
              <path d={piecePath(col, row)} fill="rgba(0,0,0,0.06)" stroke="rgba(130,110,80,0.22)" strokeWidth="0.8" />
              <text
                x={col * B + B / 2}
                y={row * B + B / 2 + 6}
                textAnchor="middle"
                fontSize="16"
                fill="rgba(130,110,80,0.28)"
                fontFamily="Georgia, 'Times New Roman', serif"
              >
                {i + 1}
              </text>
            </g>
          );
        })}

        {/* ── Unlocked pieces ──────────────────────────────────────────────── */}
        {Array.from({ length: TOTAL }, (_, i) => {
          if (!unlockedPieces.includes(i)) return null;
          const col = i % COLS;
          const row = Math.floor(i / COLS);
          const isHighlighted = highlightPiece === i;
          const d = piecePath(col, row);

          return (
            <motion.g
              key={`piece-${i}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              onClick={() => handleClick(i)}
              style={{ cursor: interactive ? "pointer" : "default", filter: "url(#ps)" }}
            >
              {/*
                The full puzzle image is placed across the entire viewBox every time,
                then clipped to this piece's shape — so each piece shows the correct
                portion of the image automatically, with no background-position math.
              */}
              <image
                href={puzzleImage}
                x={0}
                y={0}
                width={VW}
                height={VH}
                clipPath={`url(#pc-${i})`}
                preserveAspectRatio="xMidYMid slice"
              />

              {/* Piece outline — gives definition between adjacent pieces */}
              <path d={d} fill="none" stroke="rgba(0,0,0,0.22)" strokeWidth="0.8" />

              {/* Gold glow when newly placed */}
              {isHighlighted && (
                <motion.path
                  d={d}
                  fill="rgba(201,168,76,0.18)"
                  stroke="#c9a84c"
                  strokeWidth="2"
                  animate={{ opacity: [1, 0.25, 1] }}
                  transition={{ duration: 1, repeat: 2 }}
                />
              )}
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
}
