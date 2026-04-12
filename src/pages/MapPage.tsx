import { useEffect, useRef, useState, type MouseEvent } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useCalibrationMaps } from "@/hooks/useCalibrationMaps";
import MascotGuide from "@/components/MascotGuide";
import { useGameState } from "@/lib/game-state";
import type { LocationData } from "@/lib/location-types";
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
};

const MAP_MODE_BUTTON_LABELS: Record<MapMode, TranslationKey> = {
  historic: "mapModeModern",
  modernImage: "mapModeHistoric",
};

function getNextMapMode(mapMode: MapMode): MapMode {
  const currentIndex = mapModes.indexOf(mapMode);
  return mapModes[(currentIndex + 1) % mapModes.length];
}

type ProjectedLocationMarker = {
  id: string;
  name: string;
  x: number;
  y: number;
  isScanned: boolean;
};

function buildProjectedLocationMarkers(
  markerMap: L.Map | null,
  locations: LocationData[],
  scannedLocations: string[],
  language: keyof LocationData["name"],
) {
  if (!markerMap) return [];

  return locations.map((location) => {
    const point = markerMap.latLngToContainerPoint([location.coordinates.lat, location.coordinates.lng]);

    return {
      id: location.id,
      name: location.name[language],
      x: point.x,
      y: point.y,
      isScanned: scannedLocations.includes(location.id),
    };
  });
}

export default function MapPage() {
  const { language, locations, scannedLocations } = useGameState();
  const [mapUnrolled, setMapUnrolled] = useState(false);
  const [zoomedIn, setZoomedIn] = useState(false);
  const [mapMode, setMapMode] = useState<MapMode>("historic");
  const [projectedLocationMarkers, setProjectedLocationMarkers] = useState<ProjectedLocationMarker[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [hoveredLocationId, setHoveredLocationId] = useState<string | null>(null);
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
  const selectedLocation = locations.find((location) => location.id === selectedLocationId) ?? null;
  const selectedLocationScanned = selectedLocation ? scannedLocations.includes(selectedLocation.id) : false;

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
    showCalibrationMarkers: false,
  });

  useEffect(() => {
    if (!mapUnrolled) {
      setProjectedLocationMarkers([]);
      return;
    }

    const updateMarkerPositions = () => {
      setProjectedLocationMarkers(
        buildProjectedLocationMarkers(calibrationMarkerMapRef.current, locations, scannedLocations, language),
      );
    };

    const frameId = window.requestAnimationFrame(() => {
      updateMarkerPositions();
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [language, locations, mapUnrolled, scannedLocations]);

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

      <div className={`map-perspective relative flex flex-1 items-center px-4 pb-4 md:px-8 md:pb-6 ${selectedLocation ? "justify-start pt-3" : "justify-center"}`}>
        <div className="flex flex-col items-center gap-5">
          <div
            className="parchment-map-container relative -translate-y-4 flex w-[340px] min-w-[340px] max-w-[340px] cursor-pointer flex-col overflow-visible md:-translate-y-6"
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
              className="parchment-torn relative h-[458px] w-full overflow-hidden"
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

            <div className="pointer-events-none absolute inset-0 z-0 opacity-0">
              <div
                ref={calibrationMapHostRef}
                className="h-full w-full"
                style={{ width: "800px", height: "656px", position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
              />
            </div>

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

            <div className="pointer-events-none absolute inset-0 z-0 opacity-0">
              <div
                ref={calibrationMarkerHostRef}
                className="h-full w-full bg-transparent"
                style={{ width: "800px", height: "656px", position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
              />
            </div>

            <motion.div
              className="pointer-events-none absolute inset-0 z-[6]"
              initial={false}
              animate={activeCalibrationOverlayMotion}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: "center center" }}
            >
              <div
                className="absolute left-1/2 top-1/2 h-[656px] w-[800px] -translate-x-1/2 -translate-y-1/2"
              >
                {mapUnrolled && locations.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="rounded-full bg-[#f5e7c7]/90 px-4 py-2 text-xs font-semibold text-[#7b5a37] shadow-sm">
                      {t('mapNoLocations', language)}
                    </p>
                  </div>
                )}
                {projectedLocationMarkers.map((marker) => (
                  <div
                    key={marker.id}
                    role="button"
                    tabIndex={0}
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedLocationId(marker.id);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.stopPropagation();
                        setSelectedLocationId(marker.id);
                      }
                    }}
                    onMouseEnter={() => setHoveredLocationId(marker.id)}
                    onMouseLeave={() => setHoveredLocationId((current) => (current === marker.id ? null : current))}
                    className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                    style={{ left: `${marker.x}px`, top: `${marker.y}px` }}
                  >
                    {hoveredLocationId === marker.id || selectedLocationId === marker.id ? (
                      <div
                        className={[
                          "absolute bottom-[calc(100%+3px)] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border px-1 py-px text-center text-[5px] font-semibold tracking-[0.03em] shadow-[0_2px_5px_rgba(32,20,12,0.12)]",
                          marker.isScanned
                            ? "border-[#c8a56c]/45 bg-[linear-gradient(180deg,rgba(249,241,221,0.98),rgba(232,210,166,0.94))] text-[#5c4125]"
                            : "border-[#7d5932]/35 bg-[linear-gradient(180deg,rgba(72,47,31,0.96),rgba(45,29,19,0.94))] text-[#f2d38e]",
                        ].join(" ")}
                      >
                        {marker.isScanned ? marker.name : t("mapUnknownLocation", language)}
                      </div>
                    ) : null}

                    <div
                      className={[
                        "relative flex h-2.5 w-2.5 items-center justify-center rounded-full border shadow-[0_2px_5px_rgba(32,20,12,0.16)] transition-transform duration-150 ease-out",
                        marker.isScanned
                          ? "border-[#916938] bg-[radial-gradient(circle_at_35%_30%,#f8eec8_0%,#dfbf79_48%,#9d6f36_100%)]"
                          : "border-[#714823] bg-[radial-gradient(circle_at_35%_30%,#8a5533_0%,#5b351f_52%,#2e1b11_100%)]",
                        hoveredLocationId === marker.id || selectedLocationId === marker.id
                          ? "scale-[1.08] ring-1 ring-[#e8c879]/45"
                          : "",
                      ].join(" ")}
                    >
                      <div
                        className={[
                          "flex h-[6px] w-[6px] items-center justify-center rounded-full border text-[4px] font-bold leading-none",
                          marker.isScanned
                            ? "border-[#f5e2af]/70 bg-[rgba(97,67,31,0.18)] text-[#5c3d19]"
                            : "border-[#cb9850]/55 bg-[rgba(24,11,5,0.22)] text-[#f4d486]",
                        ].join(" ")}
                      >
                        {marker.isScanned ? "✦" : "?"}
                      </div>

                      <div
                        className={[
                          "pointer-events-none absolute inset-px rounded-full",
                          marker.isScanned
                            ? "border border-[#fff1c7]/28"
                            : "border border-[#d8a55a]/18",
                        ].join(" ")}
                      />
                    </div>
                  </div>
                ))}
              </div>
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

          {!selectedLocation && (
            <div className="w-full max-w-[340px]">
              <div className="rounded-[28px] border border-[#ead7b2] bg-[rgba(255,248,236,0.95)] px-4 py-3 shadow-[0_18px_50px_rgba(95,66,40,0.08)]">
                <MascotGuide pose="map" position="inline" text={t("mascotMapHint", language)} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Selected location — fixed bottom sheet, always above the nav bar */}
      <AnimatePresence>
        {selectedLocation && (
          <motion.div
            key={`${selectedLocation.id}-${selectedLocationScanned ? "found" : "hidden"}`}
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-[4.5rem] left-0 right-0 z-50 px-4"
          >
            <div className="relative mx-auto w-full max-w-[400px] overflow-hidden rounded-[32px] border border-[#c6a06a]/50 bg-[linear-gradient(180deg,rgba(248,241,224,0.98),rgba(234,216,182,0.96))] px-5 py-5 text-[#4b3320] shadow-[0_26px_60px_rgba(74,50,29,0.32)]">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.28),transparent_42%),linear-gradient(135deg,rgba(124,88,48,0.1),transparent_35%)]" />
              <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.7),transparent)]" />

              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#9d7340]">
                    {selectedLocationScanned ? t("mapFoundLocation", language) : t("mapNextClue", language)}
                  </div>
                  <h3 className="mt-1 font-heading text-[1.75rem] leading-none text-[#352114]">
                    {selectedLocationScanned ? selectedLocation.name[language] : t("mapUnknownLocation", language)}
                  </h3>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <div
                    className={[
                      "rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
                      selectedLocationScanned
                        ? "border-[#c6a469]/40 bg-[#ecd59d]/75 text-[#6e4b25]"
                        : "border-[#7a5731]/28 bg-[#3a2719]/8 text-[#7a5731]",
                    ].join(" ")}
                  >
                    {selectedLocationScanned ? t("mapFoundBadge", language) : t("mapHiddenBadge", language)}
                  </div>
                  <button
                    type="button"
                    aria-label={t("close", language)}
                    onClick={() => setSelectedLocationId(null)}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#b98f53]/30 bg-[#e8d5a8]/60 text-[#7b5a37] hover:bg-[#e8d5a8]"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="relative mt-4 rounded-[24px] border border-[#b98f53]/28 bg-[linear-gradient(180deg,rgba(255,251,240,0.76),rgba(249,241,221,0.68))] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.32)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9d7340]">
                  {selectedLocationScanned ? t("mapStoryHeading", language) : t("mapClueHeading", language)}
                </p>
                <p className="mt-2 font-body text-[14px] leading-6 text-[#5b4330]">
                  {selectedLocationScanned
                    ? selectedLocation.description[language]
                    : selectedLocation.clue[language]}
                </p>
              </div>

              {selectedLocationScanned && (
                <div className="relative mt-3 rounded-[24px] border border-[#b98f53]/22 bg-[rgba(255,247,230,0.58)] px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9d7340]">
                    {t("readMoreContent", language)}
                  </p>
                  <p className="mt-2 font-body text-[14px] leading-6 text-[#5b4330]">
                    {selectedLocation.readMore[language]}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
