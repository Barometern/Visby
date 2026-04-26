import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, QrCode, ScrollText, X } from "lucide-react";
import MascotGuide from "@/components/MascotGuide";
import { Button } from "@/components/ui/button";
import type { LocationData } from "@/lib/location-types";
import { t, type Language } from "@/lib/i18n";
import balleBaggeFraga from "@/assets/balleBagge/balleBagge-fraga.png";

export type MapClueOverlayMode = "active" | "completed" | "locked";

type MapClueOverlayProps = {
  location: LocationData | null;
  language: Language;
  mode: MapClueOverlayMode | null;
  isOpen: boolean;
  onClose: () => void;
};

const backdropTransition = { duration: 0.28, ease: [0.22, 1, 0.36, 1] } as const;

export default function MapClueOverlay({
  location,
  language,
  mode,
  isOpen,
  onClose,
}: MapClueOverlayProps) {
  const [confirmMaps, setConfirmMaps] = useState(false);
  const [clueLevel, setClueLevel] = useState(0);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    setConfirmMaps(false);
    setClueLevel(0);
  }, [isOpen, location?.id, mode]);

  if (!location || !mode) return null;

  const isActiveClue = mode === "active";
  const isLocked = mode === "locked";
  const title = isActiveClue
    ? t("mapClueEventTitle", language)
    : isLocked
      ? t("mapLockedHeading", language)
      : t("mapStoryEventTitle", language);
  const eyebrow = isActiveClue
    ? t("mapNextClue", language)
    : isLocked
      ? t("mapLockedSealLabel", language)
      : t("mapDiscoveredPlace", language);
  const clues = location.clue[language] ?? [];
  const currentClue = clues[clueLevel] ?? clues[0] ?? '';
  const clueCount = clues.length;

  const mascotText = isActiveClue
    ? currentClue
    : isLocked
      ? t("mapLockedTeaser", language)
      : location.description[language];
  const secondaryText = isActiveClue
    ? t("mapArrivalHintText", language)
    : isLocked
      ? t("mapLockedSealDescription", language)
      : location.readMore[language];

  const handleMapsIntent = () => {
    const confirmed = window.confirm(t("mapMapsWarningBody", language));
    if (!confirmed) return;

    window.open(location.googleMapsUrl, "_blank", "noreferrer");
  };

  if (isActiveClue) {
    return (
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            className="fixed inset-0 z-[120]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              type="button"
              aria-label={t("close", language)}
              onClick={onClose}
              className="absolute inset-0 h-full w-full cursor-default bg-[rgba(12,8,5,0.68)] backdrop-blur-[5px]"
            />

            <div className="relative flex min-h-screen items-center justify-center px-4 py-6">
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-labelledby="map-clue-title"
                className="relative w-full max-w-[320px]"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="relative overflow-hidden rounded-[18px] border border-[#c9a46b]/50 bg-[linear-gradient(180deg,rgba(248,239,218,0.98),rgba(232,216,182,0.97))] p-5 pb-24 text-[#3f2b1c] shadow-[0_24px_60px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.4)]">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,248,232,0.72),transparent_36%),linear-gradient(135deg,rgba(120,77,36,0.05),transparent_35%)]" />

                  <div className="relative pr-16">
                    <div className="inline-flex rounded-[4px] border border-[#9d7246]/20 bg-[#f9efda]/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#8a6137]">
                      {t("mapClueHeading", language)}
                    </div>

                    <h2
                      id="map-clue-title"
                      className="mt-3 font-display text-[2rem] leading-none text-[#2f1c11]"
                    >
                      {title}
                    </h2>

                    <p className="mt-2 font-heading text-[1.05rem] leading-6 text-[#6b4728]">
                      {location.name[language]}
                    </p>
                  </div>

                  <div className="relative mt-5 rounded-[14px] border border-[#b58854]/24 bg-[rgba(255,251,243,0.44)] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
                    <p className="pr-20 font-body text-[15px] leading-7 text-[#4e3422]">
                      {currentClue}
                    </p>
                  </div>

                  {clueLevel < clueCount - 1 && (
                    <div className="relative mt-3 flex items-center justify-between">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a6137]">
                        {t("clueLevel", language)} {clueLevel + 1}/{clueCount}
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => setClueLevel((l) => l + 1)}
                        className="h-8 rounded-[6px] border border-[#b28547]/30 bg-[#d6a153]/20 px-3 font-heading text-xs font-semibold text-[#6b4728] hover:bg-[#d6a153]/40"
                      >
                        {t("clueNextLevel", language)}
                      </Button>
                    </div>
                  )}

                  <div className="relative mt-5 grid grid-cols-1 gap-3">
                    <Button
                      type="button"
                      onClick={handleMapsIntent}
                      className="h-11 rounded-[8px] border border-[#b28547]/30 bg-[#d6a153] font-heading text-sm font-semibold text-[#2f1d11] shadow-[0_10px_24px_rgba(122,82,48,0.18)] hover:bg-[#dfae66]"
                    >
                      {t("mapMapsIntent", language)}
                      <ExternalLink className="h-4 w-4" />
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                      className="h-11 rounded-[8px] border-[#8d6337]/30 bg-[#fff8ea]/72 font-heading text-sm font-semibold text-[#5a3b23] hover:bg-[#fff2d5] hover:text-[#3f2818]"
                    >
                      {t("close", language)}
                    </Button>
                  </div>

                  <img
                    src={balleBaggeFraga}
                    alt=""
                    aria-hidden="true"
                    draggable={false}
                    loading="lazy"
                    decoding="async"
                    className="pointer-events-none absolute bottom-3 right-3 w-[86px] select-none drop-shadow-[0_12px_20px_rgba(72,44,18,0.22)]"
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    );
  }

  const handleLegacyMapsIntent = () => {
    setConfirmMaps((value) => !value);
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-[120] flex items-stretch justify-center bg-[radial-gradient(circle_at_top,rgba(239,201,127,0.18),transparent_25%),rgba(16,11,8,0.78)] backdrop-blur-[10px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={backdropTransition}
        >
          <motion.div
            className="relative flex h-full w-full flex-col overflow-hidden border-0 bg-[linear-gradient(180deg,rgba(33,22,15,0.98),rgba(16,11,8,0.97))] text-[#fff1d4]"
            initial={{ opacity: 0, y: 42, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,226,159,0.14),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.05),transparent_34%)]" />

            <div className="relative flex min-h-0 flex-1 flex-col px-4 pb-4 pt-4 sm:px-6 sm:pb-6 sm:pt-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-[4px] border border-[#7A5230]/30 bg-[#f0c97f]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#fbebc1] [text-shadow:0_1px_2px_rgba(22,12,7,0.45)]">
                    {eyebrow}
                  </div>
                  <h2 className="mt-3 font-display text-[1.7rem] leading-none text-[#fff1cf] sm:text-[2.3rem]">
                    {title}
                  </h2>
                  <p className="mt-2 font-heading text-[1.02rem] leading-6 text-[#fff4d7] sm:text-[1.25rem] sm:leading-7">
                    {location.name[language]}
                  </p>
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

              <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08, duration: 0.32, ease: "easeOut" }}
                >
                  <div className="flex justify-end">
                    <div className="w-[65%]">
                      <MascotGuide
                        pose={isActiveClue ? "question" : "welcome"}
                        position="center"
                        text={mascotText}
                        variant="parchment"
                        lambSuffix={isActiveClue}
                      />
                    </div>
                  </div>

                  {isActiveClue && clueLevel < clueCount - 1 && (
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#fbebc1]/70">
                        {t("clueLevel", language)} {clueLevel + 1}/{clueCount}
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => setClueLevel((l) => l + 1)}
                        className="h-8 rounded-[6px] border border-[#d5b06c]/30 bg-[#dca54a]/20 px-3 font-heading text-xs font-semibold text-[#fbebc1] hover:bg-[#dca54a]/40"
                      >
                        {t("clueNextLevel", language)}
                      </Button>
                    </div>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.14, duration: 0.34, ease: "easeOut" }}
                  className="mt-4 rounded-[24px] border border-[#7A5230]/30 bg-[linear-gradient(180deg,rgba(251,243,226,0.97),rgba(236,219,187,0.94))] p-4 text-[#4b3320] shadow-[4px_6px_0px_rgba(122,82,48,0.2)] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#94693c]">
                    {isActiveClue
                      ? t("mapClueEventSupportLabel", language)
                      : isLocked
                        ? t("mapLockedHeading", language)
                        : t("readMoreContent", language)}
                  </p>
                  <p className="mt-3 font-display text-[14px] leading-6 text-[#5b4330] sm:text-[15px] sm:leading-7">
                    {secondaryText}
                  </p>
                </motion.div>

                {isActiveClue && confirmMaps ? (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="mt-4 rounded-[22px] border border-[#7A5230]/25 bg-[rgba(255,245,221,0.1)] p-4 text-[#fff2d8]"
                  >
                    <p className="font-heading text-[1rem] leading-6 text-[#fff3dc]">
                      {t("mapMapsWarningTitle", language)}
                    </p>
                    <p className="mt-2 font-body text-sm leading-6 text-[#f2dfb8]">
                      {t("mapMapsWarningBody", language)}
                    </p>
                    <div className="mt-4 grid grid-cols-1 gap-3">
                      <Button
                        asChild
                        className="h-12 rounded-[6px] border border-[#d5b06c]/30 bg-[#dca54a] text-sm font-semibold text-[#2f1d11] shadow-[0_14px_30px_rgba(95,66,40,0.18)] hover:bg-[#e7b35d]"
                      >
                        <a href={location.googleMapsUrl} target="_blank" rel="noreferrer">
                          {t("mapMapsConfirm", language)}
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setConfirmMaps(false)}
                        className="h-11 rounded-[6px] text-sm font-semibold text-[#fff0c9] hover:bg-white/5 hover:text-[#fff8e7]"
                      >
                        {t("close", language)}
                      </Button>
                    </div>
                  </motion.div>
                ) : null}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.32, ease: "easeOut" }}
                className="mt-4 grid grid-cols-1 gap-3 border-t border-white/8 pt-4"
              >
                {isActiveClue ? (
                  <>
                    <Button
                      type="button"
                      onClick={handleLegacyMapsIntent}
                      className="h-12 rounded-[6px] border border-[#d5b06c]/30 bg-[#dca54a] text-sm font-semibold text-[#2f1d11] shadow-[0_14px_30px_rgba(95,66,40,0.18),2px_3px_0px_rgba(122,82,48,0.3)] hover:bg-[#e7b35d]"
                    >
                      <>
                        {t("mapMapsIntent", language)}
                        <ExternalLink className="h-4 w-4" />
                      </>
                    </Button>

                    <Button
                      asChild
                      variant="outline"
                      className="h-12 rounded-[6px] border-[#7A5230]/30 bg-white/5 text-sm font-semibold text-[#f7ead1] hover:bg-white/10 hover:text-[#fff1d4]"
                    >
                      <Link to="/scan">
                        {t("mapScanArrivalCta", language)}
                        <QrCode className="h-4 w-4" />
                      </Link>
                    </Button>
                  </>
                ) : !isLocked ? (
                  <Button
                    asChild
                    variant="outline"
                    className="h-12 rounded-[6px] border-[#7A5230]/30 bg-white/5 text-sm font-semibold text-[#f7ead1] hover:bg-white/10 hover:text-[#fff1d4]"
                  >
                    <Link to={`/location/${location.id}`}>
                      {t("mapViewLocationDetails", language)}
                      <ScrollText className="h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="h-12 rounded-[6px] border-[#7A5230]/30 bg-white/5 text-sm font-semibold text-[#f7ead1] hover:bg-white/10 hover:text-[#fff1d4]"
                  >
                    {t("mapBackToChart", language)}
                    <ScrollText className="h-4 w-4" />
                  </Button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="py-2 text-sm font-semibold text-[#fff0c9] [text-shadow:0_1px_2px_rgba(22,12,7,0.45)] hover:underline transition-all duration-150"
                >
                  {t("mapBackToChart", language)}
                </button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
