export const toLatLng = ([lon, lat]) => [lat, lon];

export function getPolygonCenter(coords) {
    let lat = 0, lon = 0;
    coords.forEach(([x,y]) => { lon += x; lat += y; });
    return [lat / coords.length, lon / coords.length];
}
