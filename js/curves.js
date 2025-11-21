export function bezierCurveCoords(start, end, curvature = .3, numpoints = 50) {
    const lat1 = start[0], lon1 = start[1];
    const lat2 = end[0], lon2 = end[1];

    const latMid = (lat1 + lat2) / 2;
    const lonMid = (lon1 + lon2) / 2;

    const dx = lon2 - lon1;
    const dy = lat2 - lat1;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const normX = -dy / dist;
    const normY = -dx / dist;

    const controlLat = latMid + curvature * dist * normY;
    const controlLon = lonMid + curvature * dist * normX;

    const coords = [];
    for (let t = 0; t <= 1; t += 1 / numpoints) {
        const lat = (1 - t) * (1 - t) * lat1 + 2 * (1 - t) * t * controlLat + t * t * lat2;
        const lon = (1 - t) * (1 - t) * lon1 + 2 * (1 - t) * t * controlLon + t * t * lon2;
        coords.push([lat, lon]);
    }
    return coords
}

export function smoothstep(x) { return x * x * (3 - 2 * x); }

export function lineWeight(count) {
    const minWeight = 1, maxWeight = 5;
    const minLog = Math.log(500 + 1);
    const maxLog = Math.log(3300000 + 1);
    const logCount = Math.log(count + 1);
    return 2 * (minWeight + (maxWeight - minWeight) * (logCount - minLog) / (maxLog - minLog));
}

export function populationRadius(count) {
    const minRadius = 2500, maxRadius = 50000;
    const minCount = 500, maxCount = 3300000;
    const safeCount = Math.max(count, minCount);
    const scaled = Math.sqrt(safeCount - minCount + 1) / Math.sqrt(maxCount - minCount + 1);
    return minRadius + scaled * (maxRadius - minRadius);
}

export function interpolateSliderVal(sliderValue, flows) {
    const idx = Math.floor(sliderValue);
    const nextIdx = Math.min(idx + 1, yearMap.length - 1);
    const t = smoothstep(sliderValue - idx);
    const startYear = yearMap[idx];
    const endYear = yearMap[nextIdx];
    const startVal = flows[startYear] || 0;
    const endVal = flows[endYear] || 0;
    return startVal + t * (endVal - startVal);
}

export function interpolateColor(count, maxCount, color) {
    const ratio = smoothstep(Math.min(count / maxCount, 1));
    const r = Math.round(245 + (parseInt(color.slice(1,3),16)-245)*ratio);
    const g = Math.round(245 + (parseInt(color.slice(3,5),16)-245)*ratio);
    const b = Math.round(245 + (parseInt(color.slice(5,7),16)-245)*ratio);
    return `rgb(${r},${g},${b})`;
}