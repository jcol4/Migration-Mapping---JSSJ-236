// js/curves.js

// js/curves.js

export function bezierCurveCoords(start, end, curvature = 0.25, numpoints = 40) {
    // convert to simple XY with x=lon, y=lat for arithmetic
    const p0 = { x: start[0], y: start[1] };
    const p2 = { x: end[0], y: end[1] };

    // midpoint
    const mx = (p0.x + p2.x) / 2;
    const my = (p0.y + p2.y) / 2;

    // vector from start to end
    const vx = p2.x - p0.x;
    const vy = p2.y - p0.y;


    // perpendicular (normalized) for control point direction
    let px = -vy;
    let py = vx;
    const plen = Math.hypot(px, py) || 1;
    px /= plen; py /= plen;

    // distance between start and end (approx in degrees)
    const dist = Math.hypot(vx, vy);

    // magnitude of displacement for control point
    const mag = dist * curvature;

    // control point (quadratic bezier has single control point)
    const cx = mx + px * mag;
    const cy = my + py * mag;

    // sample
    const pts = [];
    for (let i = 0; i <= Math.max(2, numpoints); i++) {
        const t = i / numpoints;
        const oneMinusT = 1 - t;
        // Quadratic Bezier: B(t) = (1-t)^2 P0 + 2(1-t)t C + t^2 P2
        const x = oneMinusT * oneMinusT * p0.x + 2 * oneMinusT * t * cx + t * t * p2.x;
        const y = oneMinusT * oneMinusT * p0.y + 2 * oneMinusT * t * cy + t * t * p2.y;
        // convert to Leaflet lat-lng [lat, lon]
        pts.push([y, x]);
    }
    return pts;
}

export function bezierPointAndTangent(start, end, curvature = 0.25, t = 0.5) {
    const p0 = { x: start[0], y: start[1] };
    const p2 = { x: end[0], y: end[1] };

    const mx = (p0.x + p2.x) / 2;
    const my = (p0.y + p2.y) / 2;
    const vx = p2.x - p0.x;
    const vy = p2.y - p0.y;
    let px = -vy;
    let py = vx;
    const plen = Math.hypot(px, py) || 1;
    px /= plen; py /= plen;
    const dist = Math.hypot(vx, vy);
    const mag = dist * curvature;
    const c = { x: mx + px * mag, y: my + py * mag };

    const oneMinusT = 1 - t;
    const x = oneMinusT * oneMinusT * p0.x + 2 * oneMinusT * t * c.x + t * t * p2.x;
    const y = oneMinusT * oneMinusT * p0.y + 2 * oneMinusT * t * c.y + t * t * p2.y;

    // derivative: B'(t) = 2(1-t)(C - P0) + 2t(P2 - C)
    const dx = 2 * oneMinusT * (c.x - p0.x) + 2 * t * (p2.x - c.x);
    const dy = 2 * oneMinusT * (c.y - p0.y) + 2 * t * (p2.y - c.y);

    return { lat: y, lng: x, dx, dy };
}

export function smoothstep(x) { return x * x * (3 - 2 * x); }

export function lineWeight(count) {
    const minWeight = 1, maxWeight = 5;
    const minLog = Math.log(500 + 1);
    const maxLog = Math.log(3300000 + 1);
    const logCount = Math.log(count + 1);
    return minWeight + (maxWeight - minWeight) * (logCount - minLog) / (maxLog - minLog);
}

// --- Modified interpolateSliderVal to accept yearMap ---
export function interpolateSliderVal(sliderValue, flows, yearMap) {
    const idx = Math.floor(sliderValue);
    const nextIdx = Math.min(idx + 1, yearMap.length - 1);
    const t = smoothstep(sliderValue - idx);
    const startYear = yearMap[idx];
    const endYear = yearMap[nextIdx];
    const startVal = flows[startYear] || 0;
    const endVal = flows[endYear] || 0;
    return startVal + t * (endVal - startVal);
}
