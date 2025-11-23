// js/flows.js
import { bezierCurveCoords, interpolateSliderVal } from './curves.js';

let arrowLayers = []; // store polylines

/**
 * Update flow arrows on the map based on the slider value.
 * Arrows are only for 1948 and 1967. Glows are handled in countries.js.
 * 
 * @param {L.Map} map 
 * @param {number} sliderValue 
 * @param {Object} flowData - GeoJSON FeatureCollection
 * @param {Object} yearMap - mapping slider indices to year keys
 * @param {Object} highlightCountries - mapping country names to CSV colors
 */
export function updateFlows(map, sliderValue, flowData, yearMap, highlightCountries = {}) {
  // Clear existing arrows
  arrowLayers.forEach(layer => map.removeLayer(layer));
  arrowLayers = [];

  if (!flowData) return;

  const yearKey = yearMap[sliderValue];
  if (!yearKey) return;

  // Only draw arrows for 1948 and 1967
  if (yearKey === "1948" || yearKey === "1967") {
    flowData.features.forEach(feature => {
      const origin = feature.geometry.coordinates[0];      // [lon, lat]
      const destination = feature.geometry.coordinates[1];

      // Interpolate count for current slider (optional if smooth animation desired)
      const count = interpolateSliderVal(sliderValue, feature.properties.flows, yearMap);
      if (count <= 0) return;

      // Use CSV color if available
      const destName = feature.properties.destination;

      // Compute curved path
      const path = bezierCurveCoords(origin, destination, 0.28, 50);

      const polyline = L.polyline(path, {
        className: "flow-line",
        color: "#ff3b30",
        weight: 4,
        opacity: 0.95
      }).addTo(map);

      arrowLayers.push(polyline);
      polyline.bringToFront();
    });
  }
}

/**
 * Attach slider event to animate flows
 * 
 * @param {L.Map} map 
 * @param {HTMLInputElement} sliderElem 
 * @param {Object} flowData - GeoJSON FeatureCollection
 * @param {Object} yearMap - mapping slider values to year keys
 * @param {Object} highlightCountries - mapping of countries to CSV colors
 */
export function startAnimation(map, sliderElem, flowData, yearMap, highlightCountries = {}) {
  // Initialize
  let sliderValue = parseFloat(sliderElem.value);
  updateFlows(map, sliderValue, flowData, yearMap, highlightCountries);

  sliderElem.addEventListener("input", e => {
    sliderValue = parseFloat(e.target.value);
    updateFlows(map, sliderValue, flowData, yearMap, highlightCountries);
  });
}
