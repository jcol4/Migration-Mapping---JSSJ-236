import {
    bezierCurveCoords, lineWeight, populationRadius,
    interpolateColor, interpolateSliderVal
} from './curves.js';

import { flowData, yearMap } from './data.js';
import { toLatLng } from './utils.js';

let flowsLayer = null;
let markerLayer = null;
let arrowDecorators = [];

export function updateFlows(map, sliderValue) {
    if (!flowData) return;

    const chosenYear = yearMap[Math.round(sliderValue)];

    // Clear previous layers
    if (flowsLayer) map.removeLayer(flowsLayer);
    if (markerLayer) map.removeLayer(markerLayer);
    arrowDecorators.forEach(d => map.removeLayer(d));
    arrowDecorators = [];

    flowsLayer = L.layerGroup().addTo(map);
    markerLayer = L.layerGroup().addTo(map);

    flowData.features.forEach(feature => {
        const coords = feature.geometry.coordinates;
        const props = feature.properties;

        const origin = toLatLng(coords[0]);
        const dest   = toLatLng(coords[1]);

        const value = props.flows[chosenYear];

        // line appearance
        const weight = lineWeight(value);
        const color  = interpolateColor("#888", "#ff0000", sliderValue / (yearMap.length - 1));

        // create curved line
        const curve = bezierCurveCoords(origin, dest);
        const line = L.polyline(curve, {
            color,
            weight,
            opacity: 0.8,
            smoothFactor: 1.0
        }).addTo(flowsLayer);

        // add moving arrow decorator
        const decorator = L.polylineDecorator(line, {
            patterns: [
                {
                    offset: '5%',
                    repeat: '15%',
                    symbol: L.Symbol.arrowHead({
                        pixelSize: 8,
                        polygon: false,
                        pathOptions: {
                            stroke: true,
                            color,
                            weight: Math.max(1, weight - 1)
                        }
                    })
                }
            ]
        }).addTo(map);

        arrowDecorators.push(decorator);

        // destination marker with radius based on population
        const marker = L.circleMarker(dest, {
            radius: populationRadius(value),
            color,
            fillOpacity: 0.6,
            weight: 1
        }).addTo(markerLayer);

        marker.bindTooltip(
            `${props.origin} → ${props.destination}<br>${chosenYear}: ${value.toLocaleString()}`,
            { direction: "top" }
        );
    });
}

export function startAnimation() {
    function animate() {
        // Shift arrow offsets for motion effect
        arrowDecorators.forEach(d => {
            d.options.patterns.forEach(p => {
                let newOffset = parseFloat(p.offset);
                newOffset = (newOffset + 0.5) % 100;
                p.offset = `${newOffset}%`;
            });
            d.setPatterns(d.options.patterns);
        });

        requestAnimationFrame(animate);
    }
    animate();
}