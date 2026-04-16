import type L from "leaflet";

// The calibration map currently uses the same geographic window in both modes.
// We keep both keys so the historic/modern image layers can diverge later
// without changing the hook/component API again.
const sharedCalibrationBounds = [
  [57.6029, 18.2799],
  [57.6662, 18.3124],
] as L.LatLngBoundsExpression;

export const calibrationMapBounds = {
  defaultBounds: sharedCalibrationBounds,
  zoomBounds: sharedCalibrationBounds,
};

export const historicMapMotionConfig = {
  default: { scale: 2.5, x: "36.5%", y: "-4%", rotate: 0, opacity: 1 },
  zoom: { scale: 3.6, x: "70%", y: "-8%", rotate: 8, opacity: 1 },
};

export const modernImageMotionConfig = {
  default: { scale: 1.75, x: "-19%", y: "4%", rotate: 5, opacity: 1 },
  zoom: { scale: 2.50, x: "-9%", y: "-2%", rotate: 13, opacity: 1 },
};

export const calibrationOverlayMotionConfig = {
  default: { scale: 4.0, x: "-6%", y: "35%", rotate: 5 },
  zoom: { scale: 5.5, x: "0%", y: "43%", rotate: 13 },
};

export const calibrationWallPath: [number, number][] = [
  [57.64473411843716, 18.301079737331865],
  [57.6425730021583, 18.301025096306354],
  [57.64157328871003, 18.30064678710736],
  [57.63851500464459, 18.298405784767855],
  [57.637725941065966, 18.297528630999846],
  [57.63642949137706, 18.295481776451535],
  [57.63484155761498, 18.291915783022652],
  [57.6349267246908, 18.289235810881415],
  [57.634924645419915, 18.288063480487416],
  [57.635571539684555, 18.286458797948203],
  [57.64219967737428, 18.29174260750647],
  [57.64025982854857, 18.29230585985317],
  [57.64402403766327, 18.29281191063229],
  [57.64465390774558, 18.293560196026306],
  [57.646324142427446, 18.29565641611242],
  [57.64674890873683, 18.29612377778489],
  [57.64666064426155, 18.29644776249356],
  [57.645822153998154, 18.298779695652637],
  [57.64512696214547, 18.300244461366216],
  [57.64473411843716, 18.301079737331865],
];

export const calibrationLandmarkPoints = [] as const;

export const mapModes = ["historic", "modernImage"] as const;
export type MapMode = (typeof mapModes)[number];
