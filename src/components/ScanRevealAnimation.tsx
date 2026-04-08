import { motion } from 'framer-motion';
import { useGameState } from '@/lib/game-state';
import { t } from '@/lib/i18n';
import { useEffect, useMemo, useState } from 'react';
import puzzleImage from '@/assets/puzzle-placeholder.jpg';
import { COLS, ROWS, TOTAL, PIECE_SIZE, piecePath } from '@/lib/puzzle-geometry';

interface ScanRevealAnimationProps {
  pieceIndex: number;
  onComplete: () => void;
}

const VW = COLS * PIECE_SIZE;
const VH = ROWS * PIECE_SIZE;

function playImpact() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(110, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(38, ctx.currentTime + 0.22);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
    osc.start();
    osc.stop(ctx.currentTime + 0.22);
  } catch {
    // Optional audio.
  }
}

export default function ScanRevealAnimation({ pieceIndex, onComplete }: ScanRevealAnimationProps) {
  const { language, unlockedPieces } = useGameState();
  const [landed, setLanded] = useState(false);
  const [flash, setFlash] = useState(false);
  const [readyToContinue, setReadyToContinue] = useState(false);

  const activePath = useMemo(
    () => piecePath(pieceIndex % COLS, Math.floor(pieceIndex / COLS)),
    [pieceIndex],
  );

  useEffect(() => {
    const impactTimer = window.setTimeout(() => {
      setLanded(true);
      setFlash(true);
      if (navigator.vibrate) navigator.vibrate([50]);
      playImpact();
    }, 1250);

    const flashTimer = window.setTimeout(() => setFlash(false), 1750);
    const readyTimer = window.setTimeout(() => setReadyToContinue(true), 2050);

    return () => {
      window.clearTimeout(impactTimer);
      window.clearTimeout(flashTimer);
      window.clearTimeout(readyTimer);
    };
  }, []);

  const handleContinue = () => {
    if (!readyToContinue) return;
    onComplete();
  };

  return (
    <motion.div
      className="fixed inset-0 z-[90] flex h-screen w-screen items-center justify-center overflow-hidden bg-[#25180f]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={handleContinue}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,183,95,0.26),rgba(84,54,31,0.92)_42%,rgba(37,24,15,0.96)_74%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(125,87,45,0.18),rgba(67,44,27,0.14),rgba(26,18,12,0.2))]" />

      <div className="relative z-10 flex w-full max-w-4xl flex-col items-center justify-center px-4">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-8 text-center font-heading text-3xl text-medieval-gold drop-shadow-[0_0_16px_rgba(201,168,76,0.2)] sm:text-4xl"
        >
          {t('pieceUnlocked', language)}
        </motion.h2>

        <div className="relative w-full max-w-3xl rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(86,60,38,0.7),rgba(48,34,24,0.76))] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.32)] backdrop-blur-[2px] sm:p-5">
          {flash && (
            <motion.div
              className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full border border-medieval-gold/40"
              initial={{ opacity: 0.8, scale: 0.4 }}
              animate={{ opacity: 0, scale: 3.6 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            />
          )}

          <svg
            viewBox={`0 0 ${VW} ${VH}`}
            className="relative z-10 w-full"
            style={{ display: 'block', overflow: 'visible' }}
            aria-label="Puzzle reveal"
          >
            <defs>
              {Array.from({ length: TOTAL }, (_, index) => (
                <clipPath key={index} id={`fullscreen-piece-${index}`}>
                  <path d={piecePath(index % COLS, Math.floor(index / COLS))} />
                </clipPath>
              ))}

              <filter id="fullscreen-shadow" x="-15%" y="-15%" width="130%" height="130%">
                <feDropShadow dx="1" dy="3" stdDeviation="3" floodColor="rgba(0,0,0,0.4)" />
              </filter>
            </defs>

            {Array.from({ length: TOTAL }, (_, index) => {
              if (index === pieceIndex) return null;

              const d = piecePath(index % COLS, Math.floor(index / COLS));

              if (!unlockedPieces.includes(index)) {
                return (
                  <path
                    key={`slot-${index}`}
                    d={d}
                    fill="rgba(255,255,255,0.02)"
                    stroke="rgba(201,168,76,0.12)"
                    strokeWidth="0.8"
                  />
                );
              }

              return (
                <g key={`piece-${index}`} filter="url(#fullscreen-shadow)">
                  <image
                    href={puzzleImage}
                    x={0}
                    y={0}
                    width={VW}
                    height={VH}
                    clipPath={`url(#fullscreen-piece-${index})`}
                    preserveAspectRatio="xMidYMid slice"
                  />
                  <path d={d} fill="none" stroke="rgba(0,0,0,0.22)" strokeWidth="0.8" />
                </g>
              );
            })}

            <motion.g
              filter="url(#fullscreen-shadow)"
              initial={{ y: -240, scale: 1.1, rotate: -5 }}
              animate={landed ? { y: [0, 14, -6, 0], scale: [1, 0.985, 1.01, 1], rotate: 0 } : { y: 0, scale: 1, rotate: 0 }}
              transition={
                landed
                  ? { duration: 0.65, times: [0, 0.38, 0.68, 1], ease: 'easeOut' }
                  : { type: 'spring', stiffness: 185, damping: 16, mass: 1.7 }
              }
            >
              <image
                href={puzzleImage}
                x={0}
                y={0}
                width={VW}
                height={VH}
                clipPath={`url(#fullscreen-piece-${pieceIndex})`}
                preserveAspectRatio="xMidYMid slice"
              />

              <path d={activePath} fill="none" stroke="rgba(0,0,0,0.24)" strokeWidth="0.8" />

              <path d={activePath} fill="none" stroke="rgba(201,168,76,0.55)" strokeWidth="1.8" />

              {flash && (
                <motion.path
                  d={activePath}
                  fill="rgba(201,168,76,0.24)"
                  stroke="#c9a84c"
                  strokeWidth="2"
                  initial={{ opacity: 0.9 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                />
              )}
            </motion.g>
          </svg>

          {flash && (
            <motion.div
              className="pointer-events-none absolute inset-0 rounded-full bg-medieval-gold/10 blur-3xl"
              initial={{ opacity: 0.8, scale: 0.94 }}
              animate={{ opacity: 0, scale: 1.06 }}
              transition={{ duration: 0.35 }}
            />
          )}
        </div>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: readyToContinue ? 1 : 0, y: readyToContinue ? 0 : 8 }}
          className="mt-6 text-center text-sm uppercase tracking-[0.24em] text-medieval-gold/80"
        >
          {unlockedPieces.length} / {TOTAL}
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: readyToContinue ? 1 : 0 }}
          className="mt-2 text-center text-xs uppercase tracking-[0.3em] text-amber-50/70"
        >
          {t('tapToContinue', language)}
        </motion.p>
      </div>
    </motion.div>
  );
}
