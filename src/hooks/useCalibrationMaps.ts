import { useEffect, type RefObject, type MutableRefObject } from "react";
import L from "leaflet";

type Bounds = {
  defaultBounds: L.LatLngBoundsExpression;
  zoomBounds: L.LatLngBoundsExpression;
};

type LandmarkPoint = {
  lat: number;
  lng: number;
};

type UseCalibrationMapsArgs = {
  mapHostRef: RefObject<HTMLDivElement | null>;
  markerHostRef: RefObject<HTMLDivElement | null>;
  mapRef: MutableRefObject<L.Map | null>;
  markerMapRef: MutableRefObject<L.Map | null>;
  bounds: Bounds;
  wallPath: [number, number][];
  landmarkPoints: readonly LandmarkPoint[];
  zoomedIn: boolean;
  mapUnrolled: boolean;
  showCalibrationMarkers: boolean;
};

function syncCalibrationMap(
  map: L.Map | null,
  bounds: L.LatLngBoundsExpression,
) {
  if (!map) return;

  map.invalidateSize();
  map.fitBounds(bounds, { padding: [0, 0], animate: false });
}

export function useCalibrationMaps({
  mapHostRef,
  markerHostRef,
  mapRef,
  markerMapRef,
  bounds,
  wallPath,
  landmarkPoints,
  zoomedIn,
  mapUnrolled,
  showCalibrationMarkers,
}: UseCalibrationMapsArgs) {
  useEffect(() => {
    if (!mapHostRef.current || mapRef.current) return;

    const map = L.map(mapHostRef.current, {
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      touchZoom: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);

    const tilePane = map.getPane("tilePane");
    if (tilePane) {
      tilePane.style.filter = "sepia(0.18) saturate(0.86) brightness(0.98) contrast(1.04)";
    }

    syncCalibrationMap(map, bounds.defaultBounds);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [bounds.defaultBounds, mapHostRef, mapRef]);

  useEffect(() => {
    if (!markerHostRef.current || markerMapRef.current) return;

    const map = L.map(markerHostRef.current, {
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      touchZoom: false,
    });

    map.getContainer().style.background = "transparent";
    const mapPane = map.getPane("mapPane");
    if (mapPane) {
      mapPane.style.background = "transparent";
    }

    L.polyline(wallPath, {
      color: "#f2c66c",
      weight: 2,
      opacity: 0.82,
      lineJoin: "round",
    }).addTo(map);

    if (showCalibrationMarkers) {
      landmarkPoints.forEach((point) => {
        L.circleMarker([point.lat, point.lng], {
          radius: 1.8,
          color: "#6f4421",
          weight: 0.8,
          fillColor: "#f2c66c",
          fillOpacity: 1,
        }).addTo(map);
      });
    }

    syncCalibrationMap(map, bounds.defaultBounds);
    markerMapRef.current = map;

    return () => {
      map.remove();
      markerMapRef.current = null;
    };
  }, [bounds.defaultBounds, landmarkPoints, markerHostRef, markerMapRef, wallPath, showCalibrationMarkers]);

  useEffect(() => {
    if (!mapUnrolled) return;

    const currentBounds = zoomedIn ? bounds.zoomBounds : bounds.defaultBounds;
    syncCalibrationMap(mapRef.current, currentBounds);
    syncCalibrationMap(markerMapRef.current, currentBounds);
  }, [bounds.defaultBounds, bounds.zoomBounds, mapRef, mapUnrolled, markerMapRef, zoomedIn]);

  // Disabled resize observer to lock map size
  // useEffect(() => {
  //   if (!mapUnrolled) return;

  //   const resizeObserver = new ResizeObserver(() => {
  //     const currentBounds = zoomedIn ? bounds.zoomBounds : bounds.defaultBounds;
  //     syncCalibrationMap(mapRef.current, currentBounds);
  //     syncCalibrationMap(markerMapRef.current, currentBounds);
  //   });

  //   if (mapHostRef.current) resizeObserver.observe(mapHostRef.current);
  //   if (markerHostRef.current) resizeObserver.observe(markerHostRef.current);

  //   return () => resizeObserver.disconnect();
  // }, [bounds.defaultBounds, bounds.zoomBounds, mapHostRef, mapRef, mapUnrolled, markerHostRef, markerMapRef, zoomedIn]);
}
