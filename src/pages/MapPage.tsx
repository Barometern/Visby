import { useRef, useState, type MouseEvent } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useCalibrationMaps } from "@/hooks/useCalibrationMaps";
import { useGameState } from "@/lib/game-state";
import { t, type TranslationKey } from "@/lib/i18n";
import {
  calibrationLandmarkPoints,
  calibrationMapBounds,
  calibrationOverlayMotionConfig,
  calibrationWallPath,
  historicMapMotionConfig,
  mapModes,
  type MapMode,
  modernImageMotionConfig,
} from "@/lib/map-page-config";
import { AnimatePresence, motion } from "framer-motion";
import { Layers2, MapPinned, ZoomIn, ZoomOut } from "lucide-react";
import centurymap from "@/assets/18th-century-map-of-visby-sweden-375758-1024.png";
import modernMapScreenshot from "@/assets/visby-modern-screenshot.png";

const MAP_MODE_LABELS: Record<MapMode, TranslationKey> = {
  historic: "historicMapLabel",
  modernImage: "modernAerialLabel",
  calibration: "calibrationMapLabel",
};

const MAP_MODE_BUTTON_LABELS: Record<MapMode, TranslationKey> = {
  historic: "mapModeModern",
  modernImage: "mapModeCalibration",
  calibration: "mapModeHistoric",
};

function getNextMapMode(mapMode: MapMode): MapMode {
  const currentIndex = mapModes.indexOf(mapMode);
  return mapModes[(currentIndex + 1) % mapModes.length];
}

export default function MapPage() {
  const { language, locations, scannedLocations } = useGameState();
  const [mapUnrolled, setMapUnrolled] = useState(false);
  const [zoomedIn, setZoomedIn] = useState(false);
  const [mapMode, setMapMode] = useState<MapMode>("historic");
  const [showCalibrationMarkers, setShowCalibrationMarkers] = useState(true);
  const calibrationMapHostRef = useRef<HTMLDivElement | null>(null);
  const calibrationMarkerHostRef = useRef<HTMLDivElement | null>(null);
  const calibrationMapRef = useRef<L.Map | null>(null);
  const calibrationMarkerMapRef = useRef<L.Map | null>(null);
  const activeHistoricMapMotion = zoomedIn ? historicMapMotionConfig.zoom : historicMapMotionConfig.default;
  const activeModernImageMotion = zoomedIn ? modernImageMotionConfig.zoom : modernImageMotionConfig.default;
  const activeCalibrationOverlayMotion =
    zoomedIn ? calibrationOverlayMotionConfig.zoom : calibrationOverlayMotionConfig.default;
  const showHistoricMap = mapMode === "historic";
  const showModernImageMap = mapMode === "modernImage";
  const showCalibrationMap = mapMode === "calibration";

  useCalibrationMaps({
    mapHostRef: calibrationMapHostRef,
    markerHostRef: calibrationMarkerHostRef,
    mapRef: calibrationMapRef,
    markerMapRef: calibrationMarkerMapRef,
    bounds: calibrationMapBounds,
    wallPath: calibrationWallPath,
    landmarkPoints: calibrationLandmarkPoints,
    zoomedIn,
    mapUnrolled,
    showCalibrationMarkers,
  });

  const handleRollToggle = (event: MouseEvent) => {
    if (!mapUnrolled) return;
    event.stopPropagation();
    setMapUnrolled(false);
    setZoomedIn(false);
  };

  const handleContainerClick = () => {
    if (!mapUnrolled) {
      setMapUnrolled(true);
    }
  };

  const handleMapSurfaceClick = (event: MouseEvent) => {
    if (!mapUnrolled) return;
    event.stopPropagation();
    setZoomedIn((value) => !value);
  };

  const handleMapModeCycle = (event: MouseEvent) => {
    event.stopPropagation();
    setMapMode((value) => getNextMapMode(value));
  };

  const handleCalibrationMarkerToggle = (event: MouseEvent) => {
    event.stopPropagation();
    setShowCalibrationMarkers((value) => !value);
  };

  return (
    <div className="wood-table-bg relative flex min-h-screen flex-col overflow-hidden">
      <div className="relative z-10 px-4 py-2">
        <h1 className="text-center font-heading text-lg text-medieval-gold medieval-shadow drop-shadow-lg">
          {t("map", language)}
        </h1>
        <p className="mt-0.5 text-center text-xs font-body text-amber-200/70">
          {scannedLocations.length} / {locations.length} {t("piecesCollected", language)}
        </p>
      </div>

      <div className="map-perspective relative flex flex-1 items-center justify-center px-4 pb-4 md:px-8 md:pb-6">
        <div
          className="parchment-map-container relative -translate-y-4 flex w-full max-w-[min(92vw,980px)] cursor-pointer flex-col overflow-visible md:-translate-y-6"
          onClick={handleContainerClick}
        >
          <motion.div
            className={`scroll-roll scroll-roll-top ${mapUnrolled ? "cursor-pointer" : ""}`}
            style={{ position: "absolute", left: 0, right: 0, zIndex: 10 }}
            initial={false}
            animate={mapUnrolled ? { top: 0 } : { top: "calc(50% - 14px)" }}
            transition={{ duration: 1.4, ease: [0.25, 1.05, 0.5, 1] }}
            onClick={handleRollToggle}
          />

          <motion.div
            className="parchment-torn relative aspect-[0.82/1] min-h-[420px] overflow-hidden sm:min-h-[520px] lg:min-h-[620px]"
            initial={false}
            animate={mapUnrolled ? { scaleY: 1, opacity: 1 } : { scaleY: 0.03, opacity: 0 }}
            transition={{
              scaleY: { duration: 1.4, ease: [0.25, 1.05, 0.5, 1] },
              opacity: mapUnrolled ? { duration: 0.3, delay: 0 } : { duration: 0.3, delay: 1.0 },
            }}
            style={{ transformOrigin: "center center" }}
            onClick={handleMapSurfaceClick}
          >
            <div
              className="absolute inset-[-2%]"
              style={{
                backgroundImage: `url(${modernMapScreenshot})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: "blur(18px) brightness(0.92)",
                transform: "scale(1.04)",
              }}
            />

            <motion.div
              className="pointer-events-none absolute inset-0 z-[1]"
              initial={false}
              animate={{
                ...activeCalibrationOverlayMotion,
                opacity: showCalibrationMap ? 1 : 0,
              }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: "center center" }}
            >
              <div ref={calibrationMapHostRef} className="h-full w-full" />
            </motion.div>

            <motion.img
              src={centurymap}
              alt={t("historicMapAlt", language)}
              className="absolute inset-0 z-[3] h-full w-full select-none object-contain sepia-[0.08] saturate-[0.95] brightness-[1.03] contrast-[1.01]"
              initial={false}
              animate={{
                ...activeHistoricMapMotion,
                opacity: showHistoricMap ? 1 : 0,
              }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: "center center" }}
              draggable={false}
            />

            <motion.div
              aria-hidden="true"
              className="absolute inset-0 z-[3] overflow-hidden"
              initial={false}
              animate={{ opacity: showModernImageMap ? 0.56 : 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                className="absolute inset-[-10%]"
                initial={false}
                animate={{
                  scale: zoomedIn ? 1.12 : 1.04,
                  x: zoomedIn ? "2%" : "0%",
                  y: zoomedIn ? "2%" : "0%",
                }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  transformOrigin: "center center",
                  backgroundImage: `url(${modernMapScreenshot})`,
                  backgroundPosition: "center center",
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "cover",
                  filter: "blur(26px) brightness(0.84) saturate(1.02)",
                }}
              />
              <motion.div
                className="absolute inset-y-[-6%] left-[-18%] w-[34%]"
                initial={false}
                animate={{
                  scale: zoomedIn ? 1.14 : 1.06,
                  x: zoomedIn ? "-1%" : "0%",
                  y: zoomedIn ? "1%" : "0%",
                }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  transform: "scaleX(-1)",
                  transformOrigin: "center center",
                  backgroundImage: `url(${modernMapScreenshot})`,
                  backgroundPosition: "left center",
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "cover",
                  filter: "blur(28px) brightness(0.8) saturate(0.98)",
                }}
              />
              <motion.div
                className="absolute inset-y-[-6%] right-[-18%] w-[34%]"
                initial={false}
                animate={{
                  scale: zoomedIn ? 1.14 : 1.06,
                  x: zoomedIn ? "1%" : "0%",
                  y: zoomedIn ? "1%" : "0%",
                }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  transformOrigin: "center center",
                  backgroundImage: `url(${modernMapScreenshot})`,
                  backgroundPosition: "right center",
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "cover",
                  filter: "blur(28px) brightness(0.8) saturate(0.98)",
                }}
              />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_34%,rgba(92,63,36,0.14)_100%)]" />
            </motion.div>

            <motion.div
              className="absolute inset-0 z-[4]"
              initial={false}
              animate={{
                ...activeModernImageMotion,
                opacity: showModernImageMap ? 1 : 0,
              }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: "center center" }}
            >
              <div className="absolute inset-x-0 top-1/2 w-full -translate-y-1/2">
                <div className="deckle-map-edge relative aspect-[1550/861] w-full overflow-hidden">
                  <img
                    src={modernMapScreenshot}
                    alt={t("modernMapAlt", language)}
                    className="absolute inset-0 h-full w-full select-none object-cover brightness-[1.01] contrast-[1.02] saturate-[1.02]"
                    draggable={false}
                  />
                </div>
              </div>
            </motion.div>

            <motion.div
              className="pointer-events-none absolute inset-0 z-[5]"
              initial={false}
              animate={{
                ...activeCalibrationOverlayMotion,
                opacity: showCalibrationMarkers ? 1 : 0,
              }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: "center center" }}
            >
              <div ref={calibrationMarkerHostRef} className="h-full w-full bg-transparent" />
            </motion.div>

            <div className="paper-texture-overlay" />
            <div className="scroll-paper-shadow-top" />
            <div className="scroll-paper-shadow-bottom" />
            <div className="map-warm-light" />
            <div className="map-vignette" />

            <div className="pointer-events-none absolute left-4 top-8 rounded-full border border-[#c4a26c]/18 bg-[#f5e7c7]/86 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7b5a37] shadow-[0_6px_18px_rgba(0,0,0,0.08)]">
              {t(MAP_MODE_LABELS[mapMode], language)}
            </div>

            <button
              type="button"
              onClick={handleMapModeCycle}
              className="absolute right-4 top-8 z-20 inline-flex items-center gap-2 rounded-full border border-[#c4a26c]/18 bg-[#f5e7c7]/86 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7b5a37] shadow-[0_6px_18px_rgba(0,0,0,0.08)] transition-colors hover:bg-[#f1dfb8]"
            >
              <Layers2 className="h-3.5 w-3.5" />
              {t(MAP_MODE_BUTTON_LABELS[mapMode], language)}
            </button>

            <button
              type="button"
              onClick={handleCalibrationMarkerToggle}
              className="absolute right-4 top-[4.6rem] z-20 inline-flex items-center gap-2 rounded-full border border-[#c4a26c]/18 bg-[#f5e7c7]/86 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7b5a37] shadow-[0_6px_18px_rgba(0,0,0,0.08)] transition-colors hover:bg-[#f1dfb8]"
            >
              <MapPinned className="h-3.5 w-3.5" />
              {showCalibrationMarkers ? t("mapMarkersOn", language) : t("mapMarkersOff", language)}
            </button>

            <div className="pointer-events-none absolute bottom-4 left-4 rounded-2xl border border-[#c4a26c]/16 bg-[#f5e7c7]/88 px-3 py-2 text-xs text-[#65462b] shadow-[0_6px_18px_rgba(0,0,0,0.08)]">
              <div className="flex items-center gap-2 font-semibold">
                {zoomedIn ? <ZoomOut className="h-3.5 w-3.5" /> : <ZoomIn className="h-3.5 w-3.5" />}
                {zoomedIn ? t("mapZoomOutHint", language) : t("mapZoomInHint", language)}
              </div>
            </div>

            <div className="pointer-events-none absolute bottom-4 right-4 rounded-2xl border border-[#c4a26c]/16 bg-[#f5e7c7]/88 px-3 py-2 text-xs text-[#65462b] shadow-[0_6px_18px_rgba(0,0,0,0.08)]">
              <div className="flex items-center gap-2 font-semibold">
                <MapPinned className="h-3.5 w-3.5" />
                {zoomedIn ? t("mapZoomedInBadge", language) : t("mapZoomedOutBadge", language)}
              </div>
            </div>
          </motion.div>

          <motion.div
            className={`scroll-roll scroll-roll-bottom ${mapUnrolled ? "cursor-pointer" : ""}`}
            style={{ position: "absolute", left: 0, right: 0, zIndex: 10 }}
            initial={false}
            animate={mapUnrolled ? { top: "calc(100% - 22px)" } : { top: "calc(50% - 14px)" }}
            transition={{ duration: 1.4, ease: [0.25, 1.05, 0.5, 1] }}
            onClick={handleRollToggle}
          />

          <AnimatePresence>
            {!mapUnrolled && (
              <motion.p
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center font-heading text-sm tracking-wider text-medieval-gold medieval-shadow"
              >
                <motion.span
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                >
                  {t("tapToOpen", language)}
                </motion.span>
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
