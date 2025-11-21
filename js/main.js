import { initMap } from './map.js';
import { loadCountryHighlights } from './countries.js';
import { loadFlowData } from './data.js';
import { startAnimation } from './flows.js';

async function init() {
    const map = initMap();

    await loadFlowData(map);
    loadCountryHighlights(map);

    const slider = document.getElementById('yearSlider');
    startAnimation(map, slider);
}

init();
