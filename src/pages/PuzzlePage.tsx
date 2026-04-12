import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Award, Share2 } from 'lucide-react';
import PuzzleGrid from '@/components/PuzzleGrid';
import { useGameState } from '@/lib/game-state';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import wallTexture from '@/assets/wall-texture.jpg';
import puzzleImage from '@/assets/puzzle-placeholder.jpg';
import { TOTAL } from '@/lib/puzzle-geometry';

export default function PuzzlePage() {
  const { language, unlockedPieces } = useGameState();
  const navigate = useNavigate();
  const isComplete = unlockedPieces.length >= TOTAL;

  const [confettiPieces, setConfettiPieces] = useState<Array<{ id: number; x: number; color: string; delay: number }>>([]);
  const [copied, setCopied] = useState(false);
  const confettiShownRef = useRef(false);

  useEffect(() => {
    if (isComplete && !confettiShownRef.current) {
      confettiShownRef.current = true;
      const colors = ['#c9a84c', '#e8c25c', '#f5e7c7', '#8b6914', '#d4af37', '#ffd700'];
      setConfettiPieces(
        Array.from({ length: 26 }, (_, i) => ({
          id: i,
          x: Math.random() * 100,
          color: colors[i % colors.length],
          delay: Math.random() * 0.8,
        }))
      );
      window.setTimeout(() => setConfettiPieces([]), 4500);
    }
  }, [isComplete]);

  const handleShare = async () => {
    const text = t('sharePuzzleText', language);
    if (navigator.share) {
      try { await navigator.share({ text }); } catch { /* user cancelled */ }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2500);
      } catch { /* clipboard denied */ }
    }
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-start relative overflow-hidden pb-24"
      style={{
        backgroundImage: `url(${wallTexture})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Wall overlay – slight blur feel + darkening */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at 40% 30%, transparent 30%, rgba(0,0,0,0.25) 100%)',
      }} />
      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)',
      }} />
      {/* Warm top light */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'linear-gradient(180deg, rgba(255,220,160,0.08) 0%, transparent 40%)',
      }} />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md mx-auto px-4 pt-6">

        {/* Title – matching map page style */}
        <div className="px-4 py-2 z-10 relative mb-1 animate-fade-in">
          <h1 className="font-heading text-lg text-medieval-gold medieval-shadow text-center drop-shadow-lg">
            {t('puzzleTitle', language)}
          </h1>
          <p className="text-center text-xs font-body text-amber-200/70 mt-0.5">
            <span className="text-medieval-gold font-bold">{unlockedPieces.length}</span>{' '}
            / {TOTAL} {t('piecesCollected', language)}
          </p>
        </div>

        {/* Nail */}
        <div className="flex flex-col items-center mb-0">
          <div
            className="w-4 h-4 rounded-full z-20"
            style={{
              background: 'radial-gradient(circle at 35% 35%, #d4d0c8, #8a8578, #5a554a)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.3)',
              border: '1px solid rgba(0,0,0,0.3)',
            }}
          />
          {/* Wire */}
          <svg width="140" height="28" viewBox="0 0 140 28" className="z-10 -mt-1.5">
            <path
              d="M10,2 Q70,28 130,2"
              fill="none"
              stroke="#4a3d2e"
              strokeWidth="1.5"
              opacity="0.8"
            />
            <path
              d="M10,2 Q70,28 130,2"
              fill="none"
              stroke="#8a7a60"
              strokeWidth="0.5"
              opacity="0.4"
            />
          </svg>
        </div>

        {/* The framed painting */}
        <div
          className="relative mx-auto -mt-3"
          style={{
            // Outer frame – wood texture via multi-gradient
            padding: '14px',
            background: `
              linear-gradient(145deg, rgba(255,255,255,0.06) 0%, transparent 50%),
              repeating-linear-gradient(90deg, #5a3518 0px, #6b4226 3px, #4a2c14 6px, #5c3b1e 9px, #3e2210 12px),
              linear-gradient(145deg, #6b4226, #4a2c14)
            `,
            borderRadius: '3px',
            boxShadow: `
              0 20px 50px rgba(0,0,0,0.5),
              0 8px 20px rgba(0,0,0,0.35),
              0 2px 6px rgba(0,0,0,0.25),
              inset 0 1px 0 rgba(255,255,255,0.12),
              inset 0 -1px 0 rgba(0,0,0,0.4),
              inset 1px 0 0 rgba(255,255,255,0.05),
              inset -1px 0 0 rgba(0,0,0,0.2)
            `,
          }}
        >
          {/* Inner frame lip / gold trim */}
          <div style={{
            padding: '3px',
            background: 'linear-gradient(145deg, #c9a84c, #a07830, #c9a84c, #8a6820)',
            borderRadius: '2px',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.3)',
          }}>
            {/* Canvas area */}
            <div
              className="relative overflow-hidden"
              style={{
                borderRadius: '1px',
                boxShadow: 'inset 0 3px 12px rgba(0,0,0,0.35), inset 0 -2px 8px rgba(0,0,0,0.2), inset 3px 0 8px rgba(0,0,0,0.15), inset -3px 0 8px rgba(0,0,0,0.15)',
                background: '#e8dfc8',
              }}
            >
              {/* Canvas linen texture */}
              <div className="absolute inset-0 opacity-40 pointer-events-none" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='8' height='8' viewBox='0 0 8 8' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239C8B75' fill-opacity='0.25'%3E%3Cpath d='M0 0h1v1H0zM4 4h1v1H4zM2 6h1v1H2zM6 2h1v1H6z'/%3E%3C/g%3E%3C/svg%3E")`,
              }} />

              {/* Top light highlight */}
              <div className="absolute inset-0 pointer-events-none" style={{
                background: 'linear-gradient(180deg, rgba(255,245,220,0.15) 0%, transparent 30%)',
              }} />

              {/* Faint preview of complete puzzle – hints at destination */}
              {unlockedPieces.length < TOTAL && (
                <img
                  src={puzzleImage}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 h-full w-full select-none object-cover pointer-events-none"
                  style={{ opacity: 0.07, filter: 'blur(1px) saturate(0.7)' }}
                  draggable={false}
                />
              )}

              {/* Puzzle grid */}
              <PuzzleGrid />

              {/* Glass reflection */}
              <div className="absolute inset-0 pointer-events-none" style={{
                background: `
                  linear-gradient(125deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.03) 25%, transparent 50%),
                  linear-gradient(305deg, rgba(255,255,255,0.04) 0%, transparent 30%)
                `,
              }} />
            </div>
          </div>
        </div>

        {/* Progress – carved/engraved bar */}
        <div className="mt-5 w-3/4 mx-auto h-3 rounded-sm overflow-hidden" style={{
          background: 'linear-gradient(180deg, #3a2a18, #4a3828, #3a2a18)',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.05)',
          border: '1px solid rgba(0,0,0,0.4)',
        }}>
          <motion.div
            className="h-full"
            style={{
              background: 'linear-gradient(180deg, #e8c25c, #c9a84c, #a8882e)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), 0 0 8px rgba(201,168,76,0.3)',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${(unlockedPieces.length / TOTAL) * 100}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          />
        </div>

        {/* Empty state hint */}
        {unlockedPieces.length === 0 && (
          <p className="mt-4 text-center font-body text-sm text-amber-200/60">
            {t('puzzleStartHint', language)}
          </p>
        )}

        {/* Completion */}
        <AnimatePresence>
          {isComplete && (
            <motion.div
              className="mt-8 rounded-lg p-8 text-center"
              style={{
                background: 'linear-gradient(135deg, rgba(245,238,220,0.95), rgba(235,225,200,0.95))',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                border: '2px solid rgba(201,168,76,0.4)',
              }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <div className="w-20 h-20 rounded-full bg-medieval-gold/20 flex items-center justify-center mx-auto mb-4 gold-glow animate-glow-pulse">
                <Award className="w-10 h-10 text-medieval-gold" />
              </div>
              <h2 className="font-heading text-2xl text-medieval-gold medieval-shadow mb-2">
                {t('puzzleComplete', language)}
              </h2>
              <p className="font-heading text-lg text-foreground mb-2">
                {t('congratulations', language)}
              </p>
              <p className="font-body text-muted-foreground mb-6">
                {t('rewardText', language)}
              </p>
              <Button
                className="bg-medieval-gold text-medieval-brown hover:bg-medieval-gold/90 font-heading gold-glow"
                onClick={() => navigate('/claim-reward')}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {t('claimReward', language)}
              </Button>
              <Button
                variant="outline"
                className="mt-3 font-heading border-medieval-gold/40 text-medieval-gold hover:bg-medieval-gold/10"
                onClick={() => void handleShare()}
              >
                <Share2 className="w-4 h-4 mr-2" />
                {copied ? t('shareCopied', language) : t('shareButton', language)}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Confetti celebration */}
      <AnimatePresence>
        {confettiPieces.length > 0 && (
          <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
            {confettiPieces.map((piece) => (
              <motion.div
                key={piece.id}
                className={`absolute w-2 h-2 ${piece.id % 2 === 0 ? 'rounded-sm' : 'rounded-full'}`}
                style={{ left: `${piece.x}%`, top: '-10px', backgroundColor: piece.color }}
                initial={{ y: -10, rotate: 0, opacity: 1 }}
                animate={{ y: '110vh', rotate: 540, opacity: [1, 1, 0] }}
                transition={{ duration: 2.5 + piece.delay, delay: piece.delay, ease: 'easeIn' }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
