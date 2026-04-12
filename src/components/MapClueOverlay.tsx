import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, QrCode, ScrollText, X } from "lucide-react";
import MascotGuide from "@/components/MascotGuide";
import { Button } from "@/components/ui/button";
import type { LocationData } from "@/lib/location-types";
import { t, type Language } from "@/lib/i18n";

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
  const mascotText = isActiveClue
    ? location.clue[language]
    : isLocked
      ? t("mapLockedTeaser", language)
      : location.description[language];
  const secondaryText = isActiveClue
    ? t("mapArrivalHintText", language)
    : isLocked
      ? t("mapLockedSealDescription", language)
      : location.readMore[language];
  const [confirmMaps, setConfirmMaps] = useState(false);

  useEffect(() => {
    setConfirmMaps(false);
  }, [isOpen, location?.id, mode]);

  const handleMapsIntent = () => {
    setConfirmMaps((value) => !value);
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-[radial-gradient(circle_at_top,rgba(239,201,127,0.18),transparent_25%),rgba(16,11,8,0.78)] px-3 pb-6 pt-6 backdrop-blur-[10px] sm:px-6 sm:pb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={backdropTransition}
        >
          <motion.div
            className="relative flex h-[72vh] min-h-[32rem] w-full max-w-[26rem] flex-col overflow-hidden rounded-[32px] border border-[#e2c58f]/18 bg-[linear-gradient(180deg,rgba(33,22,15,0.98),rgba(16,11,8,0.97))] text-[#fff1d4] shadow-[0_30px_90px_rgba(0,0,0,0.42)] sm:h-[46rem] sm:max-h-[88vh] sm:max-w-lg sm:rounded-[36px]"
            initial={{ opacity: 0, y: 42, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,226,159,0.14),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.05),transparent_34%)]" />

            <div className="relative flex min-h-0 flex-1 flex-col px-4 pb-4 pt-4 sm:px-6 sm:pb-6 sm:pt-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#f0c97f]/18 bg-[#f0c97f]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#fbebc1] [text-shadow:0_1px_2px_rgba(22,12,7,0.45)]">
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
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#fff1cf] transition-colors hover:bg-white/10"
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
                  <MascotGuide
                    pose={isActiveClue ? "question" : "welcome"}
                    position="center"
                    text={mascotText}
                    variant="parchment"
                    className="mx-auto"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.14, duration: 0.34, ease: "easeOut" }}
                  className="mt-4 rounded-[24px] border border-[#d9ba84]/18 bg-[linear-gradient(180deg,rgba(251,243,226,0.97),rgba(236,219,187,0.94))] p-4 text-[#4b3320] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#94693c]">
                    {isActiveClue
                      ? t("mapClueEventSupportLabel", language)
                      : isLocked
                        ? t("mapLockedHeading", language)
                        : t("readMoreContent", language)}
                  </p>
                  <p className="mt-3 font-body text-[14px] leading-6 text-[#5b4330] sm:text-[15px] sm:leading-7">
                    {secondaryText}
                  </p>
                </motion.div>

                {isActiveClue && confirmMaps ? (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="mt-4 rounded-[22px] border border-[#e2c58f]/16 bg-[rgba(255,245,221,0.1)] p-4 text-[#fff2d8]"
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
                        className="h-12 rounded-full border border-[#d5b06c]/30 bg-[#dca54a] text-sm font-semibold text-[#2f1d11] shadow-[0_14px_30px_rgba(95,66,40,0.18)] hover:bg-[#e7b35d]"
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
                        className="h-11 rounded-full text-sm font-semibold text-[#fff0c9] hover:bg-white/5 hover:text-[#fff8e7]"
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
                      onClick={handleMapsIntent}
                      className="h-12 rounded-full border border-[#d5b06c]/30 bg-[#dca54a] text-sm font-semibold text-[#2f1d11] shadow-[0_14px_30px_rgba(95,66,40,0.18)] hover:bg-[#e7b35d]"
                    >
                      <>
                        {t("mapMapsIntent", language)}
                        <ExternalLink className="h-4 w-4" />
                      </>
                    </Button>

                    <Button
                      asChild
                      variant="outline"
                      className="h-12 rounded-full border-[#d6ba8f]/20 bg-white/5 text-sm font-semibold text-[#f7ead1] hover:bg-white/10 hover:text-[#fff1d4]"
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
                    className="h-12 rounded-full border-[#d6ba8f]/20 bg-white/5 text-sm font-semibold text-[#f7ead1] hover:bg-white/10 hover:text-[#fff1d4]"
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
                    className="h-12 rounded-full border-[#d6ba8f]/20 bg-white/5 text-sm font-semibold text-[#f7ead1] hover:bg-white/10 hover:text-[#fff1d4]"
                  >
                    {t("mapBackToChart", language)}
                    <ScrollText className="h-4 w-4" />
                  </Button>
                )}

                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  className="h-11 rounded-full text-sm font-semibold text-[#fff0c9] [text-shadow:0_1px_2px_rgba(22,12,7,0.45)] hover:bg-white/5 hover:text-[#fff8e7]"
                >
                  {t("mapBackToChart", language)}
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
