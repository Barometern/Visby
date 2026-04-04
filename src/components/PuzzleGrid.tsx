import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import puzzleImage from "@/assets/puzzle-placeholder.jpg";
import { useGameState } from "@/lib/game-state";
import { COLS, PIECE_SIZE, ROWS, TOTAL, piecePath } from "@/lib/puzzle-geometry";

interface PuzzleGridProps {
  highlightPiece?: number;
  interactive?: boolean;
}

const VW = COLS * PIECE_SIZE;
const VH = ROWS * PIECE_SIZE;

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
              <path
                d={piecePath(col, row)}
                fill="rgba(74,54,36,0.07)"
                stroke="rgba(130,110,80,0.3)"
                strokeWidth="1"
              />
              <text
                x={col * PIECE_SIZE + PIECE_SIZE / 2}
                y={row * PIECE_SIZE + PIECE_SIZE / 2 + 6}
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
              <path d={d} fill="none" stroke="rgba(48,28,16,0.34)" strokeWidth="1.2" />
              <path d={d} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.45" />

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
