import { initMap } from './map.js';
import { setupNavbar, setupYearSlider } from './ui.js';
import { loadCountryHighlights } from './countries.js';
import { loadFlowData } from './data.js';
import { startAnimation } from './flows.js';

async function init() {
    const map = initMap();

    setupNavbar();
    setupYearSlider(map);

    loadCountryHighlights(map);

    // Wait until flow data is loaded before starting flows
    await loadFlowData(map);

    // Start animation (arrows, markers, etc.)
    startAnimation();
}
init();