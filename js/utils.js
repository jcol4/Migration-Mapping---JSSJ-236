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
    const weight = Math.min(2 + total / 500000, 20);        // stroke weight proportional
    const fillOpacity = Math.min(0.1 + total / 5000000, 0.65); // fill opacity proportional

    return {
        color: color || "#fff",                    // border color
        weight: weight,
        fillColor: color || "#fff",               // fill uses same color
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
        style: feature => {
            const name = feature.properties.ADMIN || feature.properties.name;
            const color = highlightCountries[name];
            if (!color) return { weight: 0, fillOpacity: 0 };

            // Determine population for this country
            const pop = populationTotals[name] || 0;

            // Stroke width and fill opacity proportional to population
            const weight = Math.min(3 + pop / 500000, 25);
            const fillOpacity = Math.min(0.1 + pop / 5000000, 0.6);

            return {
                color,       // border color same as CSV
                weight,
                fillColor: color,
                fillOpacity,
                className: 'glow-country' // optional: CSS glow effect
            };
        }
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
