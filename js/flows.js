// js/flows.js
import { flowData, yearMap } from './data.js';
import { bezierCurveCoords } from './curves.js';
import { interpolateSliderVal } from './curves.js';

let arrowLayers = []; // just polylines now

export function updateFlows(map, sliderValue) {
  // clear existing
  arrowLayers.forEach(layer => map.removeLayer(layer));
  arrowLayers = [];

  if (!flowData) return;

  flowData.features.forEach(feature => {
    const coords = feature.geometry.coordinates;
    const origin = coords[0];       // GeoJSON [lon, lat]
    const destination = coords[1];

    const count = interpolateSliderVal(
      sliderValue,
      feature.properties.flows,
      yearMap
    );
    if (count <= 0) return;

    // Bezier curve polyline (array of [lat, lon])
    const path = bezierCurveCoords(origin, destination, 0.28, 50);

    const polyline = L.polyline(path, {
      className: "flow-line",
      color: "#ff3b30",
      weight: 4,        // thicker to stand out
      opacity: 0.95
    }).addTo(map);

    arrowLayers.push(polyline);
    polyline.bringToFront();
  });
}

export async function startAnimation(map, sliderElem) {
  let sliderValue = parseFloat(sliderElem.value);
  updateFlows(map, sliderValue);

  sliderElem.addEventListener("input", e => {
    sliderValue = parseFloat(e.target.value);
    updateFlows(map, sliderValue);
  });
}
