export const toLatLng = ([lon, lat]) => [lat, lon];

export function getPolygonCenter(coords) {
    let lat = 0, lon = 0;
    coords.forEach(([x,y]) => { lon += x; lat += y; });
    return [lat / coords.length, lon / coords.length];
}

export function computeRefugeeTotals(data) {
    const totals = {};

    data.forEach(entry => {
        const country = entry.country;

        if (!totals[country]) totals[country] = 0;

        const sum = 
            (entry.pre1948 || 0) +
            (entry.refugees1948 || 0) +
            (entry.refugees1967 || 0) +
            (entry.newRefugees || 0);

        totals[country] += sum;
    });

    return totals;
}

export function getGlowStyle(total, color) {
    const weight = Math.min(4 + total / 200000, 30);       // stronger stroke
    const fillOpacity = Math.min(0.3 + total / 2000000, 0.9); // more opaque
    return {
        color: color || "#fff",
        weight: weight,
        fillColor: color || "#fff",
        fillOpacity: fillOpacity
    };
}


let glowLayer = null;

/**
 * Adds or updates the glowing countries based on current slider value.
 * The glow is persistent for Pre-1948 and 2025.
 * @param {L.Map} map
 * @param {Object} combinedGeo - merged GeoJSON
 * @param {Object} highlightCountries - { countryName: color }
 * @param {number} sliderValue
 * @param {Object} yearMap - mapping slider indices to year keys
 * @param {Object} populationTotals - optional object with population totals per country
 */
export function addCountryGlowLayer(map, combinedGeo, highlightCountries, sliderValue, yearMap, populationTotals = {}) {
    const yearKey = yearMap[sliderValue];

    // Remove existing glow layer if it exists
    if (glowLayer) map.removeLayer(glowLayer);

    // Create new glow layer
    glowLayer = L.geoJSON(combinedGeo, {
        style: feature => getGlowStyle(
            populationTotals[feature.properties.ADMIN || feature.properties.name] || 0,
            highlightCountries[feature.properties.ADMIN || feature.properties.name]
        ),
        className: 'leaflet-glow'
    }).addTo(map);



    glowLayer.bringToFront();
}



// utils.js

// Compute static populations (Pre-1948 or 2025)
export function computeStaticPopulations(flowData, yearKey) {
    const totals = {};
    flowData.features.forEach(f => {
        const country = f.properties.destination;
        totals[country] = totals[country] || 0;
        totals[country] += f.properties.flows[yearKey] || 0;
    });
    return totals;
}

// Extract flows for a specific year (1948 or 1967)
export function getFlowsForYear(flowData, yearKey) {
    return flowData.features.map(f => ({
        origin: f.properties.origin,
        destination: f.properties.destination,
        count: f.properties.flows[yearKey] || 0,
        coords: f.geometry.coordinates
    })).filter(f => f.count > 0);
}
