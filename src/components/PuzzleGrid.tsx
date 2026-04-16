import { memo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import puzzleImage from "@/assets/puzzle-placeholder.jpg";
import { useGameState } from "@/lib/game-state";
import { PIECE_SIZE, getPuzzleConfig } from "@/lib/puzzle-geometry";

interface PuzzleGridProps {
  highlightPiece?: number;
  interactive?: boolean;
  teaseFirstPiece?: boolean;
  teaseNextLockedPiece?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────
function PuzzleGrid({
  highlightPiece,
  interactive = true,
  teaseFirstPiece = false,
  teaseNextLockedPiece = false,
}: PuzzleGridProps) {
  const { unlockedPieces, activeLocations, routeLength } = useGameState();
  const { cols, rows, total, piecePaths } = getPuzzleConfig(routeLength ?? 10);
  const VW = cols * PIECE_SIZE;
  const VH = rows * PIECE_SIZE;
  const navigate = useNavigate();
  const nextLockedPiece = Array.from({ length: total }, (_, i) => i).find((i) => !unlockedPieces.includes(i)) ?? null;

  const handleClick = (i: number) => {
    if (!interactive || !unlockedPieces.includes(i)) return;
    const loc = activeLocations[i];
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
          {Array.from({ length: total }, (_, i) => (
            <clipPath key={i} id={`pc-${i}`}>
              <path d={piecePaths[i]} />
            </clipPath>
          ))}

          {/* Soft drop-shadow for unlocked pieces */}
          <filter id="ps" x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow dx="1" dy="2" stdDeviation="2.5" floodColor="rgba(0,0,0,0.35)" />
          </filter>
        </defs>

        {/* ── Empty slots ─────────────────────────────────────────────────── */}
        {Array.from({ length: total }, (_, i) => {
          if (unlockedPieces.includes(i)) return null;
          const col = i % cols;
          const row = Math.floor(i / cols);
          const isTeasedPiece = (teaseFirstPiece && i === 0) || (teaseNextLockedPiece && i === nextLockedPiece);
          return (
            <g key={`slot-${i}`}>
              <path
                d={piecePaths[i]}
                fill={isTeasedPiece ? "rgba(201,168,76,0.12)" : "rgba(74,54,36,0.07)"}
                stroke={isTeasedPiece ? "rgba(201,168,76,0.55)" : "rgba(130,110,80,0.3)"}
                strokeWidth="1"
              />
              {isTeasedPiece ? (
                <path
                  d={piecePaths[i]}
                  fill="none"
                  stroke="rgba(245,231,199,0.8)"
                  strokeWidth="0.8"
                  strokeDasharray="4 4"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    from="16"
                    to="0"
                    dur="1.6s"
                    repeatCount="indefinite"
                  />
                </path>
              ) : null}
              <text
                x={col * PIECE_SIZE + PIECE_SIZE / 2}
                y={row * PIECE_SIZE + PIECE_SIZE / 2 + 6}
                textAnchor="middle"
                fontSize="16"
                fill={isTeasedPiece ? "rgba(145,104,34,0.72)" : "rgba(130,110,80,0.28)"}
                fontFamily="'Crimson Text', serif"
                fontWeight={isTeasedPiece ? "700" : "400"}
              >
                {i + 1}
              </text>
              {isTeasedPiece ? (
                <path d={piecePaths[i]} fill="rgba(255,255,255,0.08)">
                  <animate attributeName="opacity" values="0.18;0.42;0.18" dur="2.2s" repeatCount="indefinite" />
                </path>
              ) : null}
            </g>
          );
        })}

        {/* ── Unlocked pieces ──────────────────────────────────────────────── */}
        {Array.from({ length: total }, (_, i) => {
          if (!unlockedPieces.includes(i)) return null;
          const isHighlighted = highlightPiece === i;
          const d = piecePaths[i];

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

export default memo(PuzzleGrid);
