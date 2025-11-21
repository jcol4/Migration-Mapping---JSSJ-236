export function initMap() {
    const map = L.map('map', { zoomControl: false })
                 .setView([35, 35], 4);

    if (!document.getElementById('map')) {
        console.error("Map container #map not found");
    }

L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { 
        attribution: '&copy; OpenStreetMap & CARTO', subdomains: 'abcd', maxZoom: 19 
    }).addTo(map);

    L.control.zoom({ position: 'bottomleft' }).addTo(map);

    return map;
}
