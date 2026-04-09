import { motion } from 'framer-motion';
import { useGameState } from '@/lib/game-state';
import { t } from '@/lib/i18n';
import { useEffect, useState } from 'react';
import puzzleImage from '@/assets/puzzle-placeholder.jpg';
import { COLS, ROWS, TOTAL, PIECE_SIZE, PIECE_PATHS } from '@/lib/puzzle-geometry';

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
  const [sealBroken, setSealBroken] = useState(false);
  const [pieceReleased, setPieceReleased] = useState(false);
  const [landed, setLanded] = useState(false);
  const [flash, setFlash] = useState(false);
  const [readyToContinue, setReadyToContinue] = useState(false);

  const activePath = PIECE_PATHS[pieceIndex];

  useEffect(() => {
    const sealTimer = window.setTimeout(() => {
      setSealBroken(true);
      if (navigator.vibrate) navigator.vibrate([22, 36, 16]);
    }, 580);

    const releaseTimer = window.setTimeout(() => {
      setPieceReleased(true);
    }, 850);

    const impactTimer = window.setTimeout(() => {
      setLanded(true);
      setFlash(true);
      if (navigator.vibrate) navigator.vibrate([55, 30, 30]);
      playImpact();
    }, 1550);

    const flashTimer = window.setTimeout(() => setFlash(false), 2050);
    const readyTimer = window.setTimeout(() => setReadyToContinue(true), 2380);

    return () => {
      window.clearTimeout(sealTimer);
      window.clearTimeout(releaseTimer);
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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,204,121,0.28),rgba(84,54,31,0.92)_40%,rgba(37,24,15,0.98)_74%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(125,87,45,0.2),rgba(67,44,27,0.08),rgba(26,18,12,0.28))]" />
      <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(248,227,176,0.18),transparent_70%)]" />
      <motion.div
        className="pointer-events-none absolute inset-0"
        initial={{ opacity: 0.35 }}
        animate={{ opacity: flash ? 0.9 : 0.35 }}
        transition={{ duration: 0.35 }}
      >
        <div className="absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-medieval-gold/12" />
        <div className="absolute left-1/2 top-1/2 h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-medieval-gold/10" />
      </motion.div>

      <div className="relative z-10 flex w-full max-w-4xl flex-col items-center justify-center px-4">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-2 text-center font-display text-3xl text-medieval-gold drop-shadow-[0_0_16px_rgba(201,168,76,0.2)] sm:text-4xl"
        >
          {t('pieceUnlocked', language)}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.45 }}
          className="mb-7 text-center font-body text-sm uppercase tracking-[0.26em] text-amber-50/72"
        >
          {t('pieceUnlockedSubtitle', language)}
        </motion.p>

        <div className="relative w-full max-w-3xl rounded-[1.9rem] border border-[#efd29a]/16 bg-[linear-gradient(180deg,rgba(91,64,40,0.82),rgba(43,30,22,0.84))] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.38)] backdrop-blur-[2px] sm:p-5">
          <div className="pointer-events-none absolute inset-3 rounded-[1.5rem] border border-[#e7c37a]/10" />

          {!pieceReleased && (
            <motion.div
              className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
              initial={{ opacity: 1 }}
              animate={{ opacity: sealBroken ? 0 : 1 }}
              transition={{ duration: 0.28, delay: sealBroken ? 0.1 : 0 }}
            >
              <motion.div
                className="relative flex h-36 w-36 items-center justify-center rounded-full border border-[#f0d498]/32 bg-[radial-gradient(circle_at_30%_30%,rgba(171,42,31,0.96),rgba(118,22,19,0.98)_56%,rgba(82,11,11,0.98))] shadow-[0_24px_55px_rgba(43,11,10,0.46)]"
                initial={{ scale: 0.86, rotate: -8 }}
                animate={sealBroken ? { scale: 1.18, rotate: 10 } : { scale: [0.86, 1.02, 0.96], rotate: [-8, 2, -4] }}
                transition={
                  sealBroken
                    ? { duration: 0.34, ease: 'easeOut' }
                    : { duration: 0.85, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }
                }
              >
                <div className="absolute inset-3 rounded-full border border-[#f7ddb1]/18" />
                <motion.div
                  className="absolute inset-0 rounded-full"
                  animate={sealBroken ? { opacity: 0 } : { opacity: [0.18, 0.4, 0.18] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ boxShadow: '0 0 0 1px rgba(247,221,177,0.08), 0 0 28px rgba(255,214,122,0.18)' }}
                />
                <span className="font-heading text-[0.72rem] uppercase tracking-[0.42em] text-[#f9e8c6]">
                  Visby
                </span>

                {sealBroken && (
                  <>
                    <motion.div
                      className="absolute h-[2px] w-24 bg-[#ffe3b0]/85"
                      initial={{ scaleX: 0, rotate: -22, opacity: 1 }}
                      animate={{ scaleX: 1, opacity: 0 }}
                      transition={{ duration: 0.36, ease: 'easeOut' }}
                    />
                    <motion.div
                      className="absolute h-[2px] w-20 bg-[#ffe3b0]/82"
                      initial={{ scaleX: 0, rotate: 35, opacity: 1 }}
                      animate={{ scaleX: 1, opacity: 0 }}
                      transition={{ duration: 0.34, delay: 0.04, ease: 'easeOut' }}
                    />
                  </>
                )}
              </motion.div>
            </motion.div>
          )}

          {flash && (
            <motion.div
              className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full border border-medieval-gold/40"
              initial={{ opacity: 0.8, scale: 0.4 }}
              animate={{ opacity: 0, scale: 4.2 }}
              transition={{ duration: 0.82, ease: 'easeOut' }}
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
                  <path d={PIECE_PATHS[index]} />
                </clipPath>
              ))}

              <filter id="fullscreen-shadow" x="-15%" y="-15%" width="130%" height="130%">
                <feDropShadow dx="1" dy="3" stdDeviation="3" floodColor="rgba(0,0,0,0.4)" />
              </filter>
            </defs>

            {Array.from({ length: TOTAL }, (_, index) => {
              if (index === pieceIndex) return null;

              const d = PIECE_PATHS[index];

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
              initial={{ y: -320, scale: 1.22, rotate: -9, opacity: 0 }}
              animate={
                landed
                  ? { y: [0, 18, -7, 0], scale: [1, 0.975, 1.018, 1], rotate: [0, 2, -1, 0], opacity: 1 }
                  : pieceReleased
                    ? { y: 0, scale: 1, rotate: 0, opacity: 1 }
                    : { y: -320, scale: 1.22, rotate: -9, opacity: 0 }
              }
              transition={
                landed
                  ? { duration: 0.72, times: [0, 0.38, 0.7, 1], ease: 'easeOut' }
                  : { type: 'spring', stiffness: 155, damping: 12, mass: 1.55 }
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

              <path d={activePath} fill="none" stroke="rgba(201,168,76,0.72)" strokeWidth="2.1" />

              {flash && (
                <motion.path
                  d={activePath}
                  fill="rgba(201,168,76,0.28)"
                  stroke="#f2cf79"
                  strokeWidth="2.2"
                  initial={{ opacity: 0.9 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 0.45 }}
                />
              )}
            </motion.g>
          </svg>

          {pieceReleased && !landed && (
            <motion.div
              className="pointer-events-none absolute inset-x-10 top-5 z-10 h-20 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,227,161,0.3),rgba(255,227,161,0)_72%)] blur-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.9, 0.2] }}
              transition={{ duration: 0.75, ease: 'easeOut' }}
            />
          )}

          {flash && (
            <motion.div
              className="pointer-events-none absolute inset-0 rounded-full bg-medieval-gold/12 blur-3xl"
              initial={{ opacity: 0.8, scale: 0.94 }}
              animate={{ opacity: 0, scale: 1.08 }}
              transition={{ duration: 0.4 }}
            />
          )}
        </div>

        <div className="mt-6 flex flex-col items-center gap-2">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: readyToContinue ? 1 : 0, y: readyToContinue ? 0 : 8 }}
            className="rounded-full border border-medieval-gold/22 bg-[rgba(76,52,33,0.46)] px-5 py-2 text-center text-sm uppercase tracking-[0.24em] text-medieval-gold/90"
          >
            {unlockedPieces.length} / {TOTAL}
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: readyToContinue ? 1 : 0 }}
            className="text-center text-xs uppercase tracking-[0.3em] text-amber-50/70"
          >
            {t('tapToContinue', language)}
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
}
