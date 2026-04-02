import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useGameState } from "@/lib/game-state";
import { t } from "@/lib/i18n";
import { AnimatePresence, motion } from "framer-motion";
import { X, Map as MapIcon, Navigation, Eye, Lock } from "lucide-react";

const VISBY_CENTER: [number, number] = [57.6395, 18.291];
const DEFAULT_ZOOM = 15;
const VISBY_BOUNDS: L.LatLngBoundsExpression = [
  [57.632, 18.278],
  [57.649, 18.305],
];

function getLocationBounds(locations: ReturnType<typeof useGameState.getState>["locations"]) {
  const points = locations
    .filter((location) => Number.isFinite(location.coordinates?.lat) && Number.isFinite(location.coordinates?.lng))
    .map((location) => [location.coordinates.lat, location.coordinates.lng] as [number, number]);

  if (points.length === 0) {
    return L.latLngBounds(VISBY_BOUNDS);
  }

  return L.latLngBounds(points);
}

function createWaxSealIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="
      width: 40px; height: 40px; position: relative;
      transform: translateY(-4px);
      filter: drop-shadow(0 3px 4px rgba(0,0,0,0.5));
    ">
      <svg viewBox="0 0 40 40" width="40" height="40">
        <!-- Wax drips -->
        <ellipse cx="12" cy="38" rx="4" ry="3" fill="hsl(0, 55%, 35%)" opacity="0.7"/>
        <ellipse cx="30" cy="37" rx="3" ry="2.5" fill="hsl(0, 55%, 35%)" opacity="0.6"/>
        <!-- Main seal -->
        <circle cx="20" cy="18" r="16" fill="url(#waxGrad)" stroke="hsl(0, 45%, 25%)" stroke-width="1.5"/>
        <!-- Inner ring -->
        <circle cx="20" cy="18" r="11" fill="none" stroke="hsl(0, 40%, 30%)" stroke-width="1" opacity="0.6"/>
        <!-- Question mark -->
        <text x="20" y="23" text-anchor="middle" font-size="16" font-weight="bold" fill="hsl(0, 30%, 20%)" font-family="'MedievalSharp', cursive">?</text>
        <defs>
          <radialGradient id="waxGrad" cx="40%" cy="35%">
            <stop offset="0%" stop-color="hsl(0, 60%, 48%)"/>
            <stop offset="70%" stop-color="hsl(0, 55%, 38%)"/>
            <stop offset="100%" stop-color="hsl(0, 50%, 28%)"/>
          </radialGradient>
        </defs>
      </svg>
    </div>`,
    iconSize: [40, 44],
    iconAnchor: [20, 40],
    popupAnchor: [0, -36],
  });
}

function createShieldIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="
      width: 40px; height: 44px; position: relative;
      transform: translateY(-4px);
      filter: drop-shadow(0 0 10px hsla(42, 80%, 55%, 0.6)) drop-shadow(0 3px 4px rgba(0,0,0,0.5));
    ">
      <svg viewBox="0 0 40 48" width="40" height="48">
        <!-- Shield shape -->
        <path d="M20 2 L36 10 L36 24 C36 36 20 46 20 46 C20 46 4 36 4 24 L4 10 Z"
          fill="url(#shieldGrad)" stroke="hsl(36, 60%, 35%)" stroke-width="1.5"/>
        <!-- Inner shield -->
        <path d="M20 7 L31 13 L31 23 C31 32 20 40 20 40 C20 40 9 32 9 23 L9 13 Z"
          fill="none" stroke="hsl(45, 80%, 65%)" stroke-width="0.8" opacity="0.5"/>
        <!-- Cross emblem -->
        <line x1="20" y1="14" x2="20" y2="30" stroke="hsl(25, 40%, 15%)" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="13" y1="20" x2="27" y2="20" stroke="hsl(25, 40%, 15%)" stroke-width="2.5" stroke-linecap="round"/>
        <defs>
          <linearGradient id="shieldGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="hsl(42, 75%, 60%)"/>
            <stop offset="50%" stop-color="hsl(45, 80%, 55%)"/>
            <stop offset="100%" stop-color="hsl(36, 65%, 40%)"/>
          </linearGradient>
        </defs>
      </svg>
    </div>`,
    iconSize: [40, 48],
    iconAnchor: [20, 46],
    popupAnchor: [0, -42],
  });
}

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const navigate = useNavigate();
  const { language, locations, scannedLocations } = useGameState();
  const [journalOpen, setJournalOpen] = useState(false);
  const [mapUnrolled, setMapUnrolled] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setMapUnrolled(true), 180);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    const map = L.map(mapRef.current, {
      center: VISBY_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: false,
      minZoom: 12,
      maxZoom: 18,
    });

    // Add zoom control top-right
    L.control.zoom({ position: "topright" }).addTo(map);

    // OpenStreetMap tiles with sepia CSS filter for vintage look
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map);

    // Apply sepia/vintage filter to tile pane
    const tilePane = map.getPane("tilePane");
    if (tilePane) {
      tilePane.style.filter = "sepia(0.6) saturate(0.7) brightness(0.95) contrast(1.05)";
    }

    leafletMap.current = map;

    return () => {
      map.remove();
      leafletMap.current = null;
    };
  }, []);

  useEffect(() => {
    const map = leafletMap.current;
    if (!map || !mapUnrolled) return;

    const timer = window.setTimeout(() => {
      map.invalidateSize();
      const bounds = getLocationBounds(locations);
      map.setMaxBounds(bounds.pad(0.35));
      map.fitBounds(bounds.pad(0.1), { padding: [20, 20] });
    }, 700);

    return () => window.clearTimeout(timer);
  }, [mapUnrolled, locations]);

  // Update markers
  useEffect(() => {
    const map = leafletMap.current;
    if (!map) return;

    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) map.removeLayer(layer);
    });

    const sealIcon = createWaxSealIcon();
    const shieldIcon = createShieldIcon();

    locations.forEach((loc) => {
      if (!loc.coordinates?.lat || !loc.coordinates?.lng || !loc.name || !loc.clue) return;
      const isUnlocked = scannedLocations.includes(loc.id);
      const marker = L.marker([loc.coordinates.lat, loc.coordinates.lng], {
        icon: isUnlocked ? shieldIcon : sealIcon,
      }).addTo(map);

      if (isUnlocked) {
        marker.bindPopup(`
          <div style="font-family: 'MedievalSharp', cursive; text-align: center; min-width: 160px;">
            <strong style="font-size: 14px; color: hsl(36, 60%, 42%);">${loc.name[language]}</strong>
            <br/><br/>
            <div style="display: flex; gap: 6px; justify-content: center; flex-wrap: wrap;">
              <a href="/location/${loc.id}" style="
                display: inline-block; padding: 4px 10px; font-size: 12px;
                background: linear-gradient(135deg, hsl(42, 75%, 55%), hsl(45, 80%, 65%));
                color: hsl(25, 40%, 12%); border-radius: 4px; text-decoration: none;
                font-family: 'Crimson Text', serif;
              ">${t("viewDetails", language)}</a>
              <a href="${loc.googleMapsUrl}" target="_blank" rel="noopener" style="
                display: inline-block; padding: 4px 10px; font-size: 12px;
                background: hsl(30, 10%, 55%); color: hsl(38, 30%, 95%);
                border-radius: 4px; text-decoration: none;
                font-family: 'Crimson Text', serif;
              ">${t("navigateHere", language)}</a>
            </div>
          </div>
        `);
      } else {
        marker.bindPopup(`
          <div style="font-family: 'MedievalSharp', cursive; text-align: center; min-width: 160px;">
            <strong style="font-size: 13px; color: hsl(30, 10%, 45%);">🔒 ${t("lockedClue", language)}</strong>
            <br/><br/>
            <p style="font-family: 'Crimson Text', serif; font-style: italic; font-size: 13px; color: hsl(25, 40%, 25%); margin: 0;">
              "${loc.clue[language]}"
            </p>
            <br/>
            <a href="${loc.googleMapsUrl}" target="_blank" rel="noopener" style="
              display: inline-block; padding: 4px 10px; font-size: 12px;
              background: hsl(30, 10%, 55%); color: hsl(38, 30%, 95%);
              border-radius: 4px; text-decoration: none;
              font-family: 'Crimson Text', serif;
            ">${t("navigateHere", language)}</a>
          </div>
        `);
      }
    });

    // SPA navigation for popup links
    map.on("popupopen", () => {
      const container = map.getContainer();
      const links = container.querySelectorAll('.leaflet-popup a[href^="/"]');
      links.forEach((link) => {
        link.addEventListener("click", (e) => {
          e.preventDefault();
          const href = (e.currentTarget as HTMLAnchorElement).getAttribute("href");
          if (href) navigate(href);
        });
      });
    });
  }, [locations, scannedLocations, language, navigate]);

  return (
    <div className="wood-table-bg flex flex-col min-h-screen relative overflow-hidden">
      {/* Header strip */}
      <div className="px-4 py-2 z-10 relative">
        <h1 className="font-heading text-lg text-medieval-gold medieval-shadow text-center drop-shadow-lg">
          {t("map", language)}
        </h1>
        <p className="text-center text-xs font-body text-amber-200/70 mt-0.5">
          {scannedLocations.length} / {locations.length} {t("piecesCollected", language)}
        </p>
      </div>

      {/* 3D perspective map container with unroll animation */}
      <div className="flex-1 map-perspective relative px-4 pb-4 md:px-8 md:pb-6 flex items-center justify-center">
        <div
          className="parchment-map-container w-full h-full min-h-[420px] md:min-h-[560px] max-w-2xl relative flex flex-col cursor-pointer overflow-visible"
          onClick={() => !mapUnrolled && setMapUnrolled(true)}
        >
          {/* Top scroll roll */}
          <motion.div
            className={`scroll-roll scroll-roll-top ${mapUnrolled ? "cursor-pointer" : ""}`}
            style={{ position: "absolute", left: 0, right: 0, zIndex: 10 }}
            initial={false}
            animate={mapUnrolled ? { top: 0 } : { top: "calc(50% - 14px)" }}
            transition={{ duration: 1.4, ease: [0.25, 1.05, 0.5, 1] }}
            onClick={(e) => {
              if (mapUnrolled) {
                e.stopPropagation();
                setMapUnrolled(false);
              }
            }}
          />

          {/* Paper area */}
          <motion.div
            className="parchment-torn flex-1 relative overflow-hidden"
            initial={false}
            animate={mapUnrolled ? { scaleY: 1, opacity: 1 } : { scaleY: 0.03, opacity: 0 }}
            transition={{
              scaleY: { duration: 1.4, ease: [0.25, 1.05, 0.5, 1] },
              opacity: mapUnrolled ? { duration: 0.3, delay: 0 } : { duration: 0.3, delay: 1.0 },
            }}
            style={{ transformOrigin: "center center" }}
          >
            <div ref={mapRef} className="w-full h-full min-h-[360px] md:min-h-[500px]" />
            <div className="paper-texture-overlay" />
            <div className="scroll-paper-shadow-top" />
            <div className="scroll-paper-shadow-bottom" />
            <div className="map-warm-light" />
            <div className="map-vignette" />
          </motion.div>

          {/* Bottom scroll roll */}
          <motion.div
            className={`scroll-roll scroll-roll-bottom ${mapUnrolled ? "cursor-pointer" : ""}`}
            style={{ position: "absolute", left: 0, right: 0, zIndex: 10 }}
            initial={false}
            animate={mapUnrolled ? { top: "calc(100% - 22px)" } : { top: "calc(50% - 14px)" }}
            transition={{ duration: 1.4, ease: [0.25, 1.05, 0.5, 1] }}
            onClick={(e) => {
              if (mapUnrolled) {
                e.stopPropagation();
                setMapUnrolled(false);
              }
            }}
          />

          {/* Tap to open text */}
          <AnimatePresence>
            {!mapUnrolled && (
              <motion.p
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 z-20 flex items-center justify-center font-heading text-sm text-medieval-gold medieval-shadow tracking-wider pointer-events-none"
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

      {/* Quest Journal floating button */}

      {/* Quest Journal Overlay */}
      <AnimatePresence>
        {journalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
            onClick={() => setJournalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, rotateX: 15 }}
              animate={{ scale: 1, opacity: 1, rotateX: 0 }}
              exit={{ scale: 0.85, opacity: 0, rotateX: -10 }}
              transition={{ type: "spring", damping: 20, stiffness: 250 }}
              className="w-full max-w-md max-h-[80vh] overflow-hidden rounded-lg relative"
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "linear-gradient(145deg, hsl(38, 40%, 88%), hsl(35, 35%, 82%), hsl(38, 40%, 86%))",
                boxShadow: "inset 0 0 60px hsl(30 20% 70% / 0.4), 0 10px 40px rgba(0,0,0,0.5)",
              }}
            >
              {/* Close button */}
              <button
                onClick={() => setJournalOpen(false)}
                className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full 
                  bg-medieval-brown/20 flex items-center justify-center
                  hover:bg-medieval-brown/40 transition-colors"
              >
                <X className="w-4 h-4 text-medieval-brown" />
              </button>

              {/* Header */}
              <div className="px-5 pt-5 pb-3 border-b border-medieval-stone/30">
                <h2 className="font-heading text-xl text-medieval-gold medieval-shadow text-center">
                  📜 {t("questJournal", language)}
                </h2>
              </div>

              {/* Riddle list */}
              <div className="overflow-y-auto max-h-[calc(80vh-5rem)] p-4 space-y-3">
                {locations.map((loc, idx) => {
                  if (!loc.name || !loc.clue) return null;
                  const isUnlocked = scannedLocations.includes(loc.id);
                  return (
                    <div
                      key={loc.id}
                      className="p-3 rounded-md transition-colors"
                      style={{
                        background: isUnlocked
                          ? "linear-gradient(135deg, hsla(42,60%,55%,0.15), hsla(45,70%,60%,0.1))"
                          : "hsla(30,10%,50%,0.08)",
                        border: `1px solid ${isUnlocked ? "hsla(42,60%,45%,0.3)" : "hsla(30,10%,50%,0.15)"}`,
                      }}
                    >
                      <div className="flex items-start gap-3">
                        {/* Number badge */}
                        <div
                          className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{
                            background: isUnlocked
                              ? "linear-gradient(135deg, hsl(42,75%,55%), hsl(45,80%,65%))"
                              : "hsl(30,10%,55%)",
                            color: isUnlocked ? "hsl(25,40%,12%)" : "hsl(38,30%,90%)",
                          }}
                        >
                          {idx + 1}
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Name or locked */}
                          <div className="flex items-center gap-1.5 mb-1">
                            {isUnlocked ? (
                              <Eye className="w-3.5 h-3.5 text-medieval-gold flex-shrink-0" />
                            ) : (
                              <Lock className="w-3.5 h-3.5 text-medieval-stone flex-shrink-0" />
                            )}
                            <span
                              className="font-heading text-sm truncate"
                              style={{
                                color: isUnlocked ? "hsl(36,60%,42%)" : "hsl(30,10%,45%)",
                              }}
                            >
                              {isUnlocked ? loc.name[language] : "???"}
                            </span>
                          </div>

                          {/* Clue */}
                          <p className="font-body text-xs italic text-medieval-brown/70 leading-relaxed">
                            "{loc.clue[language]}"
                          </p>

                          {/* Action links */}
                          <div className="flex gap-2 mt-2">
                            {isUnlocked && (
                              <button
                                onClick={() => {
                                  setJournalOpen(false);
                                  navigate(`/location/${loc.id}`);
                                }}
                                className="flex items-center gap-1 text-[11px] font-body px-2 py-1 rounded
                                  bg-medieval-gold/20 text-medieval-brown hover:bg-medieval-gold/30 transition-colors"
                              >
                                <Eye className="w-3 h-3" />
                                {t("viewDetails", language)}
                              </button>
                            )}
                            <a
                              href={loc.googleMapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-[11px] font-body px-2 py-1 rounded
                                bg-medieval-stone/15 text-medieval-brown/80 hover:bg-medieval-stone/25 transition-colors"
                            >
                              <Navigation className="w-3 h-3" />
                              {t("checkGoogleMaps", language)}
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
