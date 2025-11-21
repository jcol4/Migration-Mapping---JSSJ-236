import { getPolygonCenter } from './utils.js';

export function loadCountryHighlights(map) {
    // file is in data/ folder
    Papa.parse('./data/countries.csv', {
        download: true,
        header: true,
        complete: results => {
            const highlightCountries = {};
            results.data.forEach(r => {
                if (r.country && r.color)
                    highlightCountries[r.country.trim()] = r.color.trim();
            });
            addCountryLayer(map, highlightCountries);
        }
    });
}

export function addCountryLayer(map, highlightCountries) {
    // Fetch both the main world GeoJSON and custom countries
    Promise.all([
        fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json').then(res => res.json()),
        fetch('data/custom_countries.geo.json').then(res => res.json())
    ]).then(([worldGeo, customGeo]) => {
        const combinedGeo = {
            type: "FeatureCollection",
            features: [...worldGeo.features, ...customGeo.features]
        };

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

                // hover effect
                layer.on('mouseover', () => layer.setStyle({ weight: 3 }));
                layer.on('mouseout', () => layer.setStyle({ weight: highlightCountries[name] ? 2 : 0.5 }));

                // click zoom
                layer.on('click', () => {
                    const bounds = layer.getBounds();
                    map.fitBounds(bounds, { padding: [40, 40] });
                });

                // add labels for highlighted countries
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
        });

        layer.addTo(map);
    }).catch(err => {
        console.error("Failed to load GeoJSON:", err);
    });
}
