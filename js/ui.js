// js/ui.js
import { updateFlows } from './flows.js';
import { yearMap } from './data.js';

export function setupNavbar() {
    const navbar = document.querySelector('.navbar');

    document.addEventListener('mousemove', e => {
        navbar.style.opacity = e.clientY < 100 ? '1' : '0';
    });
}

export function setupYearSlider(map) {
    const slider = document.getElementById('yearSlider');
    const label = document.getElementById('yearLabel');
    const presetMenu = document.getElementById('yearPreset');

    // --- Initialize slider ---
    const initialValue = parseFloat(slider.value);
    label.textContent = yearMap[Math.round(initialValue)];
    updateFlows(map, initialValue);

    // --- Slider updates flows ---
    slider.addEventListener('input', () => {
        const v = parseFloat(slider.value);
        label.textContent = yearMap[Math.round(v)];
        updateFlows(map, v);
    });

    // --- Preset dropdown selects specific time periods ---
    presetMenu.addEventListener('change', () => {
        const selected = presetMenu.value;

        let targetIndex;

        switch (selected) {
            case "pre1948":
                targetIndex = 0;        // earliest index in yearMap
                break;
            case "1948":
                targetIndex = Object.values(yearMap).indexOf(1948);
                break;
            case "1967":
                targetIndex = Object.values(yearMap).indexOf(1967);
                break;
            case "2025":
                targetIndex = Object.values(yearMap).indexOf(2025);
                break;
            default:
                return;
        }

        // Move slider and update flows
        if (targetIndex !== -1) {
            slider.value = targetIndex;
            label.textContent = yearMap[targetIndex];
            updateFlows(map, targetIndex);
        }
    });
}
