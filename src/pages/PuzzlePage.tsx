import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Award, Share2, Sparkles } from "lucide-react";
import PuzzleGrid from "@/components/PuzzleGrid";
import MascotGuide from "@/components/MascotGuide";
import PuzzleCompletionOverlay from "@/components/PuzzleCompletionOverlay";
import { useGameState } from "@/lib/game-state";
import { t } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import wallTexture from "@/assets/wall-texture.jpg";
import puzzleImage from "@/assets/puzzle-placeholder.jpg";

export default function PuzzlePage() {
  const { language, unlockedPieces, questStartedAt, questCompletedAt } = useGameState();
  const total = 15;
  const isComplete = unlockedPieces.length >= total;
  const isEmpty = unlockedPieces.length === 0;

  const [confettiPieces, setConfettiPieces] = useState<Array<{ id: number; x: number; color: string; delay: number }>>([]);
  const [showCompletionOverlay, setShowCompletionOverlay] = useState(false);
  const confettiShownRef = useRef(false);
  const completionOverlayShownRef = useRef(false);

  const completionDurationMs =
    questStartedAt && questCompletedAt && questCompletedAt >= questStartedAt
      ? questCompletedAt - questStartedAt
      : null;

  useEffect(() => {
    if (isComplete && !confettiShownRef.current) {
      confettiShownRef.current = true;
      const colors = ["#c9a84c", "#e8c25c", "#f5e7c7", "#8b6914", "#d4af37", "#ffd700"];
      setConfettiPieces(
        Array.from({ length: 26 }, (_, i) => ({
          id: i,
          x: Math.random() * 100,
          color: colors[i % colors.length],
          delay: Math.random() * 0.8,
        })),
      );
      window.setTimeout(() => setConfettiPieces([]), 4500);
    }

    if (!isComplete) {
      confettiShownRef.current = false;
    }
  }, [isComplete]);

  useEffect(() => {
    if (isComplete && !completionOverlayShownRef.current) {
      completionOverlayShownRef.current = true;
      window.setTimeout(() => setShowCompletionOverlay(true), 550);
    }

    if (!isComplete) {
      completionOverlayShownRef.current = false;
      setShowCompletionOverlay(false);
    }
  }, [isComplete]);

  return (
    <div
      className="relative flex min-h-screen w-full flex-col items-center justify-start overflow-hidden pb-28"
      style={{
        backgroundImage: `url(${wallTexture})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse at 40% 30%, transparent 30%, rgba(0,0,0,0.25) 100%)" }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)" }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "linear-gradient(180deg, rgba(255,220,160,0.08) 0%, transparent 40%)" }}
      />

      <div className="relative z-10 mx-auto w-full max-w-md px-4 pt-6">
        <div className="relative z-10 mb-2 animate-fade-in px-4 py-2">
          <h1 className="text-center font-display text-[2rem] leading-none text-medieval-gold medieval-shadow drop-shadow-lg">
            {t("puzzleTitle", language)}
          </h1>
          <p className="mt-1 text-center font-body text-sm text-amber-100/82">
            <span className="font-bold text-medieval-gold">{unlockedPieces.length}</span> / {total}{" "}
            {t("piecesCollected", language)}
          </p>
        </div>

        <div className="mb-0 flex flex-col items-center">
          <div
            className="z-20 h-4 w-4 rounded-full"
            style={{
              background: "radial-gradient(circle at 35% 35%, #d4d0c8, #8a8578, #5a554a)",
              boxShadow: "0 2px 6px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.3)",
              border: "1px solid rgba(0,0,0,0.3)",
            }}
          />
          <svg width="140" height="28" viewBox="0 0 140 28" className="-mt-1.5 z-10">
            <path d="M10,2 Q70,28 130,2" fill="none" stroke="#4a3d2e" strokeWidth="1.5" opacity="0.8" />
            <path d="M10,2 Q70,28 130,2" fill="none" stroke="#8a7a60" strokeWidth="0.5" opacity="0.4" />
          </svg>
        </div>

        <div
          className="relative mx-auto -mt-3"
          style={{
            padding: "14px",
            background: `
              linear-gradient(145deg, rgba(255,255,255,0.06) 0%, transparent 50%),
              repeating-linear-gradient(90deg, #5a3518 0px, #6b4226 3px, #4a2c14 6px, #5c3b1e 9px, #3e2210 12px),
              linear-gradient(145deg, #6b4226, #4a2c14)
            `,
            borderRadius: "3px",
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
          <div
            style={{
              padding: "3px",
              background: "linear-gradient(145deg, #c9a84c, #a07830, #c9a84c, #8a6820)",
              borderRadius: "2px",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.3)",
            }}
          >
            <div
              className="relative overflow-hidden"
              style={{
                borderRadius: "1px",
                boxShadow:
                  "inset 0 3px 12px rgba(0,0,0,0.35), inset 0 -2px 8px rgba(0,0,0,0.2), inset 3px 0 8px rgba(0,0,0,0.15), inset -3px 0 8px rgba(0,0,0,0.15)",
                background: "#e8dfc8",
              }}
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-40"
                style={{
                  backgroundImage:
                    'url("data:image/svg+xml,%3Csvg width=\'8\' height=\'8\' viewBox=\'0 0 8 8\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%239C8B75\' fill-opacity=\'0.25\'%3E%3Cpath d=\'M0 0h1v1H0zM4 4h1v1H4zM2 6h1v1H2zM6 2h1v1H6z\'/%3E%3C/g%3E%3C/svg%3E")',
                }}
              />

              <div
                className="pointer-events-none absolute inset-0"
                style={{ background: "linear-gradient(180deg, rgba(255,245,220,0.15) 0%, transparent 30%)" }}
              />

              {unlockedPieces.length < total && (
                <img
                  src={puzzleImage}
                  alt=""
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover"
                  style={{
                    opacity: isEmpty ? 0.18 : 0.07,
                    filter: isEmpty ? "blur(2.5px) brightness(0.78) saturate(0.58)" : "blur(1px) saturate(0.7)",
                    transform: isEmpty ? "scale(1.02)" : "none",
                  }}
                  draggable={false}
                />
              )}

              <PuzzleGrid teaseFirstPiece={isEmpty} />

              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "linear-gradient(125deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.03) 25%, transparent 50%), linear-gradient(305deg, rgba(255,255,255,0.04) 0%, transparent 30%)",
                }}
              />
            </div>
          </div>
        </div>

        {isEmpty && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.4 }}
            className="mt-5"
          >
            <div className="rounded-[28px] border border-[#ead7b2] bg-[rgba(255,248,236,0.95)] px-4 py-3 shadow-[0_18px_50px_rgba(95,66,40,0.08)]">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#e2c58e]/30 bg-[#f4e6c3]/72 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8a6034]">
                <Sparkles className="h-3.5 w-3.5" />
                Första steget
              </div>
              <MascotGuide
                pose="point"
                position="inline"
                text="Skanna din första QR-kod för att väcka tavlan till liv. Den första biten skimrar redan och väntar på dig."
              />
            </div>
          </motion.div>
        )}

        <div
          className="mx-auto mt-5 h-3 w-3/4 overflow-hidden rounded-sm"
          style={{
            background: "linear-gradient(180deg, #3a2a18, #4a3828, #3a2a18)",
            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.05)",
            border: "1px solid rgba(0,0,0,0.4)",
          }}
        >
          <motion.div
            className="h-full"
            style={{
              background: "linear-gradient(180deg, #e8c25c, #c9a84c, #a8882e)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3), 0 0 8px rgba(201,168,76,0.3)",
            }}
            initial={{ width: 0 }}
            animate={{ width: `${(unlockedPieces.length / total) * 100}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
        </div>

        {isComplete && (
          <motion.div
            className="mt-8 rounded-[30px] border border-[#e8cd97]/32 bg-[linear-gradient(135deg,rgba(245,238,220,0.95),rgba(235,225,200,0.95))] p-8 text-center shadow-[0_18px_48px_rgba(0,0,0,0.24)]"
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 170, damping: 18 }}
          >
            <div className="gold-glow animate-glow-pulse mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-medieval-gold/20">
              <Award className="h-10 w-10 text-medieval-gold" />
            </div>
            <h2 className="mb-2 font-heading text-2xl text-[#6f4925]">
              {t("puzzleComplete", language)}
            </h2>
            <p className="mb-6 font-body text-[#5b4330]">{t("rewardText", language)}</p>
            <div className="grid gap-3">
              <Button className="gold-glow bg-medieval-gold font-heading text-medieval-brown hover:bg-medieval-gold/90">
                <Sparkles className="mr-2 h-4 w-4" />
                {t("claimReward", language)}
              </Button>
              <Button
                variant="outline"
                className="border-medieval-gold/40 font-heading text-[#6f4925] hover:bg-medieval-gold/10"
                onClick={() => setShowCompletionOverlay(true)}
              >
                <Share2 className="mr-2 h-4 w-4" />
                {t("shareButton", language)}
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {confettiPieces.length > 0 && (
          <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
            {confettiPieces.map((piece) => (
              <motion.div
                key={piece.id}
                className={`absolute h-2 w-2 ${piece.id % 2 === 0 ? "rounded-sm" : "rounded-full"}`}
                style={{ left: `${piece.x}%`, top: "-10px", backgroundColor: piece.color }}
                initial={{ y: -10, rotate: 0, opacity: 1 }}
                animate={{ y: "110vh", rotate: 540, opacity: [1, 1, 0] }}
                transition={{ duration: 2.5 + piece.delay, delay: piece.delay, ease: "easeIn" }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      <PuzzleCompletionOverlay
        isOpen={showCompletionOverlay}
        language={language}
        completionDurationMs={completionDurationMs}
        completedAt={questCompletedAt}
        onClose={() => setShowCompletionOverlay(false)}
      />
    </div>
  );
}
