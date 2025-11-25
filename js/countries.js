import { computeStaticPopulations, getFlowsForYear, addCountryGlowLayer } from './utils.js';
import { updateFlows } from './flows.js';

export function loadCountryHighlights(map) {
    Papa.parse('./data/countries.csv', {
        download: true,
        header: true,
        complete: results => {
            const highlightCountries = {};
            results.data.forEach(r => {
                if (r.country && r.color) {
                    highlightCountries[r.country.trim()] = r.color.trim();
                }
            });
            addCountryLayer(map, highlightCountries);
        }
    });
}

export function addCountryLayer(map, highlightCountries) {
    Promise.all([
        fetch('./data/flowdata.json').then(res => res.json()),
        fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json').then(res => res.json()),
        fetch('./data/custom_countries.geo.json').then(res => res.json())
    ])
    .then(([flowData, worldGeo, customGeo]) => {
        const combinedGeo = {
            type: "FeatureCollection",
            features: [...worldGeo.features, ...customGeo.features]
        };

        // Precompute static populations for cumulative glow
        const pre1948Totals = computeStaticPopulations(flowData, "Pre-1948");
        const futureTotals = computeStaticPopulations(flowData, "2025");

        const yearMap = { 0: "Pre-1948", 1: "1948", 2: "1967", 3: "2025" };
        const sliderElem = document.getElementById("yearSlider");
        sliderElem.max = Object.keys(yearMap).length - 1;
        sliderElem.value = 0;

        // Slider event: update glow and flows
        sliderElem.addEventListener("input", () => {
            const sliderValue = parseInt(sliderElem.value);
            const yearKey = yearMap[sliderValue];

            // Compute cumulative totals
            let populationTotals = {};
            if (yearKey === "Pre-1948") {
                populationTotals = pre1948Totals;
            } else if (yearKey === "1948") {
                const totals1948 = computeStaticPopulations(flowData, "1948");
                populationTotals = { ...pre1948Totals };
                for (let c in totals1948) populationTotals[c] = (populationTotals[c] || 0) + totals1948[c];
            } else if (yearKey === "1967") {
                const totals1948 = computeStaticPopulations(flowData, "1948");
                const totals1967 = computeStaticPopulations(flowData, "1967");
                populationTotals = { ...pre1948Totals };
                for (let c in totals1948) populationTotals[c] = (populationTotals[c] || 0) + totals1948[c];
                for (let c in totals1967) populationTotals[c] = (populationTotals[c] || 0) + totals1967[c];
            } else if (yearKey === "2025") {
                populationTotals = futureTotals;
            }

            // Update glow and flows
            addCountryGlowLayer(map, combinedGeo, highlightCountries, sliderValue, yearMap, populationTotals);
            updateFlows(map, sliderValue, flowData, yearMap, highlightCountries);

            // Update year label
            const yearLabel = document.getElementById("yearLabel");
            if (yearLabel) yearLabel.textContent = yearKey;
        });

        // Trigger initial render
        sliderElem.dispatchEvent(new Event("input"));

        // Base map style & interactivity
        const style = feature => {
            const name = feature.properties.ADMIN || feature.properties.name;
            const color = highlightCountries[name];
            return {
                color: color || "#ccc",
                weight: color ? 2 : 0.5,
                fillOpacity: color ? 0.55 : 0.15
            };
        };

        const layer = L.geoJSON(combinedGeo, {
            style,
            onEachFeature: (feature, layer) => {
                const name = feature.properties.ADMIN || feature.properties.name;

                // Hover effect
                layer.on('mouseover', () => layer.setStyle({ weight: 3 }));
                layer.on('mouseout', () => layer.setStyle({ weight: highlightCountries[name] ? 2 : 0.5 }));

                // Click zoom to country
                layer.on('click', () => map.fitBounds(layer.getBounds(), { padding: [40, 40] }));

                // Add labels for highlighted countries
                if (highlightCountries[name]) {
                    const center = layer.getBounds().getCenter();
                    L.marker(center, {
                        icon: L.divIcon({
                            className: 'country-label',
                            html: `<b style="
                                color: ${highlightCountries[name]};
                                text-shadow: 1px 1px 2px #000, -1px -1px 2px #000;
                            ">${name}</b>`,
                            iconSize: [100, 20],
                            iconAnchor: [50, 10]
                        })
                    }).addTo(map);
                }
            }
        }).addTo(map);
    })
    .catch(err => console.error("Failed to load GeoJSON or flow data:", err));
}