import { useEffect, useRef, useState, type MouseEvent } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { motion } from "framer-motion";
import { Compass, Layers2, MapPinned, ScrollText, ZoomIn, ZoomOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import MapClueOverlay, { type MapClueOverlayMode } from "@/components/MapClueOverlay";
import { useCalibrationMaps } from "@/hooks/useCalibrationMaps";
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

type MarkerState = "active" | "completed" | "locked";

type ProjectedMarker = {
  id: string;
  x: number;
  y: number;
  state: MarkerState;
};

function getNextMapMode(mapMode: MapMode): MapMode {
  const currentIndex = mapModes.indexOf(mapMode);
  return mapModes[(currentIndex + 1) % mapModes.length];
}

function buildProjectedMarkers(
  markerMap: L.Map | null,
  locations: LocationData[],
  scannedLocations: string[],
  activeLocationId: string | null,
) {
  if (!markerMap) return [];

  return locations
    .filter((location) =>
      scannedLocations.includes(location.id) || location.id === activeLocationId,
    )
    .map((location) => {
      const point = markerMap.latLngToContainerPoint([location.coordinates.lat, location.coordinates.lng]);
      const state: MarkerState = location.id === activeLocationId
        ? "active"
        : scannedLocations.includes(location.id)
          ? "completed"
          : "locked";

      return {
        id: location.id,
        x: point.x,
        y: point.y,
        state,
      } satisfies ProjectedMarker;
    });
}

export default function MapPage() {
  const { language, locations, scannedLocations } = useGameState();
  const navigate = useNavigate();
  const [mapUnrolled, setMapUnrolled] = useState(false);
  const [zoomedIn, setZoomedIn] = useState(false);
  const [mapMode, setMapMode] = useState<MapMode>("historic");
  const [projectedMarkers, setProjectedMarkers] = useState<ProjectedMarker[]>([]);
  const [overlayLocationId, setOverlayLocationId] = useState<string | null>(null);
  const [overlayMode, setOverlayMode] = useState<MapClueOverlayMode | null>(null);
  const [showScrollHintPulse, setShowScrollHintPulse] = useState(true);
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

  const completedCount = scannedLocations.length;
  const activeLocation = locations.find((location) => !scannedLocations.includes(location.id)) ?? null;
  const activeLocationId = activeLocation?.id ?? null;
  const allLocationsCompleted = locations.length > 0 && completedCount === locations.length;
  const overlayLocation = locations.find((location) => location.id === overlayLocationId) ?? null;

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
      setProjectedMarkers([]);
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      setProjectedMarkers(
        buildProjectedMarkers(calibrationMarkerMapRef.current, locations, scannedLocations, activeLocationId),
      );
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [activeLocationId, locations, mapUnrolled, scannedLocations, zoomedIn]);

  useEffect(() => {
    if (mapUnrolled) {
      setShowScrollHintPulse(false);
      return;
    }

    const timer = window.setTimeout(() => setShowScrollHintPulse(false), 4200);
    return () => window.clearTimeout(timer);
  }, [mapUnrolled]);

  const openOverlayForLocation = (locationId: string) => {
    if (scannedLocations.includes(locationId) && locationId !== activeLocationId) {
      navigate(`/location/${locationId}`);
      return;
    }

    const mode: MapClueOverlayMode =
      locationId === activeLocationId ? "active" : scannedLocations.includes(locationId) ? "completed" : "locked";
    setOverlayLocationId(locationId);
    setOverlayMode(mode);
  };

  const closeOverlay = () => {
    setOverlayLocationId(null);
    setOverlayMode(null);
  };

  const handleRollToggle = (event: MouseEvent) => {
    if (!mapUnrolled) return;
    event.stopPropagation();
    setMapUnrolled(false);
    setZoomedIn(false);
  };

  const handleContainerClick = () => {
    if (!mapUnrolled) setMapUnrolled(true);
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
    <>
      <div className="wood-table-bg relative flex min-h-screen flex-col overflow-hidden">
        <div className="relative z-10 mx-auto w-full max-w-md px-4 pt-4">
          <div className="px-1 py-2 text-[#fff3d4]">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[#f7e7bc]">
                  <Compass className="h-4 w-4 shrink-0 text-[#f0d59a] drop-shadow-[0_2px_4px_rgba(12,7,4,0.45)]" />
                  <h1 className="font-display text-[1.9rem] leading-none tracking-[0.01em] text-[#fff2cf] [text-shadow:0_2px_6px_rgba(12,7,4,0.62)]">
                    {t("mapQuestChartLabel", language)}
                  </h1>
                </div>
                <p className="mt-1 pl-6 font-body text-[11px] uppercase tracking-[0.18em] text-[#f0ddae]/88 [text-shadow:0_1px_3px_rgba(12,7,4,0.5)]">
                  {t("mapSealCollectionLabel", language)} {completedCount}/{locations.length}
                </p>
              </div>

              <div className="mt-1 shrink-0 rounded-[4px] border border-[#f0c97f]/24 bg-[#1C2E4A]/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#fff4d7] shadow-[0_6px_18px_rgba(0,0,0,0.14)] [text-shadow:0_1px_2px_rgba(12,7,4,0.55)]">
                {allLocationsCompleted ? t("mapCompletedBadge", language) : t("mapActiveBadge", language)}
              </div>
            </div>

            <div className="mt-3 pl-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#dcb779] [text-shadow:0_1px_3px_rgba(12,7,4,0.45)]">
                {t("mapCurrentObjective", language)}
              </p>
              <p className="mt-1 font-heading text-[1.2rem] leading-6 text-[#fff0d0] [text-shadow:0_2px_5px_rgba(12,7,4,0.58)]">
                {allLocationsCompleted
                  ? t("mapQuestCompleteTitle", language)
                  : activeLocation?.name[language] || t("mapNoObjectiveTitle", language)}
              </p>
            </div>
          </div>
        </div>

        <div className="map-perspective relative flex flex-1 items-start justify-center px-4 pb-4 pt-4 md:px-8 md:pb-6">
          <div className="flex flex-col items-center gap-4">
            <div
              className="parchment-map-container relative -translate-y-1 flex w-[340px] min-w-[340px] max-w-[340px] cursor-pointer flex-col overflow-visible md:-translate-y-3"
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
                    style={{
                      width: "800px",
                      height: "656px",
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                    }}
                  />
                </div>

                <motion.img
                  src={centurymap}
                  alt={t("historicMapAlt", language)}
                  className="absolute inset-0 z-[3] h-full w-full select-none object-contain sepia-[0.08] saturate-[0.95] brightness-[1.03] contrast-[1.01]"
                  initial={false}
                  animate={{ ...activeHistoricMapMotion, opacity: showHistoricMap ? 1 : 0 }}
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
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_34%,rgba(92,63,36,0.14)_100%)]" />
                </motion.div>

                <motion.div
                  className="absolute inset-0 z-[4]"
                  initial={false}
                  animate={{ ...activeModernImageMotion, opacity: showModernImageMap ? 1 : 0 }}
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
                    style={{
                      width: "800px",
                      height: "656px",
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                    }}
                  />
                </div>

                <motion.div
                  className="pointer-events-none absolute inset-0 z-[6]"
                  initial={false}
                  animate={activeCalibrationOverlayMotion}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  style={{ transformOrigin: "center center" }}
                >
                  <div className="absolute left-1/2 top-1/2 h-[656px] w-[800px] -translate-x-1/2 -translate-y-1/2">
                    {projectedMarkers.map((marker) => (
                      <button
                        key={marker.id}
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          openOverlayForLocation(marker.id);
                        }}
                        className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 appearance-none border-0 bg-transparent p-0 leading-none shadow-none"
                        style={{ left: `${marker.x}px`, top: `${marker.y}px` }}
                        aria-label={t(
                          marker.state === "active" ? "mapOpenClue" : marker.state === "completed" ? "mapOpenStory" : "mapLockedStop",
                          language,
                        )}
                      >
                        <div className="relative flex h-2 w-2 items-center justify-center">
                          {marker.state === "active" ? (
                            <>
                              <motion.div
                                className="absolute rounded-full border border-[#1C2E4A]/50"
                                style={{ width: 12, height: 12 }}
                                animate={{ scale: [1, 1.8, 1], opacity: [0.55, 0.06, 0.55] }}
                                transition={{ duration: 2.1, repeat: Infinity, ease: "easeOut" }}
                              />
                              <div className="h-[8px] w-[8px] rounded-full bg-[#1C2E4A]" />
                            </>
                          ) : marker.state === "completed" ? (
                            <div className="h-[6px] w-[6px] rounded-full bg-[#1C2E4A] opacity-70" />
                          ) : (
                            <>
                              <div
                                className="absolute rounded-full border border-dashed border-[#1C2E4A]/30"
                                style={{ width: 13, height: 13 }}
                              />
                              <div className="h-[5px] w-[5px] rounded-full bg-[#1C2E4A] opacity-55" />
                            </>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>

                <div className="paper-texture-overlay" />
                <div className="scroll-paper-shadow-top" />
                <div className="scroll-paper-shadow-bottom" />
                <div className="map-warm-light" />
                <div className="map-vignette" />

                <div className="absolute left-4 top-6 z-20 rounded-[4px] border border-[#7A5230]/30 bg-[#F2E8D5]/90 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#2C1A0E] shadow-[0_4px_10px_rgba(0,0,0,0.14)]">
                  {t(MAP_MODE_LABELS[mapMode], language)}
                </div>

                <button
                  type="button"
                  onClick={handleMapModeCycle}
                  className="absolute right-4 top-6 z-20 inline-flex items-center gap-2 rounded-[4px] border border-[#7A5230]/30 bg-[#F2E8D5]/90 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#2C1A0E] shadow-[0_4px_10px_rgba(0,0,0,0.14)] transition-colors hover:bg-[#F2E8D5]"
                >
                  <Layers2 className="h-3.5 w-3.5" />
                  {t(MAP_MODE_BUTTON_LABELS[mapMode], language)}
                </button>

                <div className="pointer-events-none absolute bottom-4 left-4 rounded-[4px] border border-[#7A5230]/30 bg-[#F2E8D5]/90 px-3 py-2 text-[11px] text-[#2C1A0E] shadow-[0_4px_10px_rgba(0,0,0,0.08)]">
                  <div className="flex items-center gap-2 font-semibold">
                    {zoomedIn ? <ZoomOut className="h-3.5 w-3.5" /> : <ZoomIn className="h-3.5 w-3.5" />}
                    {zoomedIn ? t("mapZoomOutHint", language) : t("mapZoomInHint", language)}
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

              {!mapUnrolled ? (
                <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center font-heading text-sm tracking-wider text-medieval-gold medieval-shadow">
                  <motion.span
                    className="rounded-[4px] bg-[rgba(21,13,9,0.38)] px-4 py-2 text-[#fff0c8] [text-shadow:0_1px_3px_rgba(10,6,4,0.7)]"
                    animate={
                      showScrollHintPulse
                        ? { opacity: [0.72, 1, 0.72], y: [0, -6, 0] }
                        : { opacity: [0.82, 1, 0.82] }
                    }
                    transition={{
                      repeat: Infinity,
                      duration: showScrollHintPulse ? 1.5 : 2.2,
                      ease: "easeInOut",
                    }}
                  >
                    {t("tapToOpen", language)}
                  </motion.span>
                </div>
              ) : null}
            </div>

            <div className="w-full max-w-[340px] rounded-[10px] border border-[#e3c793]/18 bg-[linear-gradient(180deg,rgba(250,244,231,0.96),rgba(235,220,191,0.94))] px-4 py-4 text-[#4b3320] shadow-[0_18px_48px_rgba(74,50,29,0.12)]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] border border-[#c8a46a]/22 bg-[#f3ddb0]/72 text-[#815627]">
                  <MapPinned className="h-4 w-4" />
                </div>
                <p className="text-sm leading-6 text-[#5b4330]">
                  {allLocationsCompleted
                    ? t("mapQuestCompleteDescription", language)
                    : t("mapTapSealHint", language)}
                </p>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3">
                {!allLocationsCompleted && activeLocation ? (
                  <Button
                    type="button"
                    onClick={() => openOverlayForLocation(activeLocation.id)}
                    className="h-12 rounded-[6px] border border-[#d5b06c]/30 bg-[#dca54a] text-sm font-semibold text-[#2f1d11] shadow-[0_14px_30px_rgba(95,66,40,0.18),2px_3px_0px_rgba(122,82,48,0.35)] hover:bg-[#e7b35d]"
                  >
                    <ScrollText className="h-4 w-4" />
                    {t("mapOpenClue", language)}
                  </Button>
                ) : null}

              </div>
            </div>
          </div>
        </div>
      </div>

      <MapClueOverlay
        isOpen={overlayLocation !== null && overlayMode !== null}
        location={overlayLocation}
        language={language}
        mode={overlayMode}
        onClose={closeOverlay}
      />
    </>
  );
}
