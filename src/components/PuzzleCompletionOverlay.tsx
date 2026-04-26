import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Award, Download, Share2, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import puzzleImage from "@/assets/puzzle-placeholder.jpg";
import type { Language } from "@/lib/i18n";
import { t } from "@/lib/i18n";

type PuzzleCompletionOverlayProps = {
  isOpen: boolean;
  language: Language;
  completionDurationMs: number | null;
  completedAt: number | null;
  onClose: () => void;
};

function formatDuration(ms: number | null) {
  if (!ms || ms <= 0) return "--:--";

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function formatCompletionDate(timestamp: number | null, language: Language) {
  if (!timestamp) return "";

  const locale = language === "sv" ? "sv-SE" : language === "de" ? "de-DE" : "en-GB";
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(timestamp));
}

function buildShareCardSvg({
  language,
  durationLabel,
  completedDate,
}: {
  language: Language;
  durationLabel: string;
  completedDate: string;
}) {
  const title = t("shareCardTitle", language);
  const subtitle = t("shareCardSubtitle", language);
  const timeLabel = t("completionTimeLabel", language);
  const dateLabel = t("completionDateLabel", language);

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#2a1b12" />
          <stop offset="45%" stop-color="#4e3320" />
          <stop offset="100%" stop-color="#1a120d" />
        </linearGradient>
        <linearGradient id="frame" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#f3d99b" />
          <stop offset="100%" stop-color="#bd8740" />
        </linearGradient>
      </defs>
      <rect width="1080" height="1920" fill="url(#bg)" />
      <circle cx="540" cy="310" r="260" fill="rgba(247,209,119,0.14)" />
      <rect x="110" y="150" width="860" height="1620" rx="54" fill="rgba(17,11,8,0.42)" stroke="rgba(243,217,155,0.22)" />
      <text x="540" y="265" text-anchor="middle" fill="#f6e8c0" font-size="72" font-family="Georgia, serif" font-weight="700">${title}</text>
      <text x="540" y="338" text-anchor="middle" fill="#e7d4ab" font-size="34" font-family="Arial, sans-serif">${subtitle}</text>
      <rect x="180" y="430" width="720" height="720" rx="36" fill="#ead9ba" stroke="url(#frame)" stroke-width="18" />
      <image href="${puzzleImage}" x="198" y="448" width="684" height="684" preserveAspectRatio="xMidYMid slice" />
      <rect x="180" y="1220" width="720" height="210" rx="32" fill="rgba(247,240,224,0.94)" />
      <text x="250" y="1310" fill="#855523" font-size="28" font-family="Arial, sans-serif" letter-spacing="2">${timeLabel.toUpperCase()}</text>
      <text x="250" y="1370" fill="#2f1d11" font-size="72" font-family="Georgia, serif" font-weight="700">${durationLabel}</text>
      <text x="250" y="1495" fill="#855523" font-size="28" font-family="Arial, sans-serif" letter-spacing="2">${dateLabel.toUpperCase()}</text>
      <text x="250" y="1555" fill="#2f1d11" font-size="42" font-family="Georgia, serif">${completedDate}</text>
    </svg>
  `.trim();
}

export default function PuzzleCompletionOverlay({
  isOpen,
  language,
  completionDurationMs,
  completedAt,
  onClose,
}: PuzzleCompletionOverlayProps) {
  const [shareBusy, setShareBusy] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<"idle" | "done">("idle");

  const durationLabel = useMemo(
    () => formatDuration(completionDurationMs),
    [completionDurationMs],
  );
  const completedDate = useMemo(
    () => formatCompletionDate(completedAt, language),
    [completedAt, language],
  );

  useEffect(() => {
    if (!isOpen) return;
    setShareFeedback("idle");
  }, [isOpen]);

  const handleShare = async () => {
    try {
      setShareBusy(true);
      const svg = buildShareCardSvg({ language, durationLabel, completedDate });
      const file = new File([svg], "visby-quest-klar.svg", { type: "image/svg+xml" });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: t("shareCardTitle", language),
          text: t("sharePuzzleText", language),
          files: [file],
        });
      } else {
        const url = URL.createObjectURL(file);
        const link = document.createElement("a");
        link.href = url;
        link.download = "visby-quest-klar.svg";
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
      }

      setShareFeedback("done");
      window.setTimeout(() => setShareFeedback("idle"), 2500);
    } catch {
      // Treat cancelled/native-share failures as a no-op.
    } finally {
      setShareBusy(false);
    }
  };

  const handleDownload = () => {
    const svg = buildShareCardSvg({ language, durationLabel, completedDate });
    const file = new File([svg], "visby-quest-klar.svg", { type: "image/svg+xml" });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = "visby-quest-klar.svg";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setShareFeedback("done");
    window.setTimeout(() => setShareFeedback("idle"), 2500);
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-[130] overflow-y-auto flex items-start justify-center bg-[radial-gradient(circle_at_top,rgba(247,210,132,0.18),transparent_30%),rgba(14,9,7,0.88)] px-3 pb-6 pt-6 backdrop-blur-[10px] sm:px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative my-auto w-full max-w-xl overflow-hidden rounded-[38px] border border-[#ebce94]/18 bg-[linear-gradient(180deg,rgba(33,22,15,0.98),rgba(17,11,8,0.98))] text-[#fff1d4] shadow-[0_30px_90px_rgba(0,0,0,0.42)]"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,226,159,0.16),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.04),transparent_34%)]" />

            <div className="relative px-4 pb-5 pt-4 sm:px-6 sm:pb-6 sm:pt-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-[4px] border border-[#f0c97f]/22 bg-[#f0c97f]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#f7e6bb] [text-shadow:0_1px_2px_rgba(22,12,7,0.45)]">
                    <Sparkles className="h-3.5 w-3.5" />
                    {t("puzzleCompletionEyebrow", language)}
                  </div>
                  <h2 className="mt-3 font-display text-[2rem] leading-none text-[#fff1cf] sm:text-[2.4rem]">
                    {t("puzzleComplete", language)}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-[8px] border border-[#7A5230]/30 bg-white/5 text-[#fff1cf] transition-colors hover:bg-white/10"
                  aria-label={t("close", language)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <motion.div
                className="mt-5 overflow-hidden rounded-[30px] border border-[#ebcf98]/16 bg-[linear-gradient(180deg,rgba(246,238,219,0.96),rgba(232,214,182,0.94))] p-3 text-[#342014]"
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.08, duration: 0.4 }}
              >
                <motion.div
                  className="relative overflow-hidden rounded-[22px] border border-[#b78b54]/16"
                  initial={{ scale: 1.08, rotate: -2 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.16, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  <img
                    src={puzzleImage}
                    alt=""
                    className="aspect-square w-full object-cover"
                    draggable={false}
                  />
                  <motion.div
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,220,150,0.28),transparent_45%)]"
                    initial={{ opacity: 0.75, scale: 0.65 }}
                    animate={{ opacity: 0, scale: 1.45 }}
                    transition={{ delay: 0.28, duration: 0.7, ease: "easeOut" }}
                  />
                </motion.div>
              </motion.div>

              <motion.div
                className="mt-5 rounded-[28px] border border-[#ebcf98]/18 bg-[linear-gradient(180deg,rgba(87,58,35,0.92),rgba(55,35,22,0.94))] px-5 py-4 text-[#fff0d2] shadow-[0_16px_36px_rgba(0,0,0,0.2)]"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.14, duration: 0.35 }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#f0c97f]/24 bg-[#f0c97f]/12 text-[#f7e4b4]">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-body text-[10px] uppercase tracking-[0.22em] text-[#f5ddb0] [text-shadow:0_1px_2px_rgba(22,12,7,0.45)]">
                      {t("completionTimeLabel", language)}
                    </p>
                    <p className="font-heading text-[1.7rem] leading-none text-[#fff2cf]">
                      {durationLabel}
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="mt-5 rounded-[28px] border border-[#d9ba84]/18 bg-[linear-gradient(180deg,rgba(251,243,226,0.97),rgba(236,219,187,0.94))] p-4 text-[#4b3320]"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18, duration: 0.35 }}
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#6f4925]">
                  {t("shareCardTitle", language)}
                </p>
                <div className="mt-3 rounded-[24px] border border-[#d8b77d]/22 bg-[rgba(255,252,245,0.74)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.34)]">
                  <p className="font-display text-[1.7rem] leading-none text-[#352116]">
                    {t("shareCardTitle", language)}
                  </p>
                  <p className="mt-2 font-body text-sm leading-6 text-[#5b4330]">
                    {completedDate}
                  </p>
                  <div className="mt-4 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#855523]">
                        {t("completionTimeLabel", language)}
                      </p>
                      <p className="mt-1 font-heading text-[1.35rem] leading-none text-[#352116]">
                        {durationLabel}
                      </p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#c5a167]/28 bg-[#f3ddb0]/76 text-[#815627]">
                      <Award className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="mt-5 grid grid-cols-1 gap-3"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.24, duration: 0.35 }}
              >
                <Button
                  type="button"
                  onClick={() => void handleShare()}
                  disabled={shareBusy}
                  className="h-12 rounded-[6px] border border-[#d5b06c]/30 bg-[#1C2E4A] text-sm font-semibold text-[#F2E8D5] shadow-[inset_0_-1px_0_rgba(0,0,0,0.2)] hover:bg-[#2A3F5F]"
                >
                  <Share2 className="h-4 w-4" />
                  {shareFeedback === "done" ? t("shareCopied", language) : t("shareButton", language)}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDownload}
                  disabled={shareBusy}
                  className="h-12 rounded-[6px] border-[#7A5230]/30 bg-white/5 text-sm font-semibold text-[#f7ead1] hover:bg-white/10 hover:text-[#fff1d4]"
                >
                  <Download className="h-4 w-4" />
                  {t("shareSaveCard", language)}
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
