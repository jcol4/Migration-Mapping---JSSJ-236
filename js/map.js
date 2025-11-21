export function initMap() {
    const map = L.map('map', { zoomControl: false })
                 .setView([35, 35], 4);

    const baseLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap & CARTO',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);

    L.control.zoom({ position: 'bottomleft' }).addTo(map);

    // --- MiniMap inset ---
    const miniMapLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 13
    });

    const miniMap = new L.Control.MiniMap(miniMapLayer, {
        toggleDisplay: true,
        minimized: false,
        position: 'bottomright',
        width: 150,
        height: 150
    }).addTo(map);

    // Highlight Middle East region on inset map
    const middleEastBounds = [[12, 25], [40, 60]]; // [southWest, northEast] lat/lon
    const insetRect = L.rectangle(middleEastBounds, {
        color: "#FF0000",
        weight: 1,
        fill: false
    });

    // Add the rectangle to the minimap's internal map
    miniMapLayer.once('add', () => {
        insetRect.addTo(miniMap._miniMap);
    });

    return map;
}
