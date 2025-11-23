export function initMap() {
    const map = L.map('map', { zoomControl: false })
                 .setView([35, 35], 4);

    const baseLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap & CARTO',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);

    L.control.zoom({ position: 'bottomleft' }).addTo(map);

    // MiniMap inset
    const miniMap = new L.Control.MiniMap(
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap',
            maxZoom: 13
        }),
        {
            toggleDisplay: true,
            minimized: false,
            position: 'bottomright',
            width: 150,
            height: 150
        }
    ).addTo(map);

    return map;
}
