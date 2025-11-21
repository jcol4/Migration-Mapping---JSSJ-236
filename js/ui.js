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

    const initialValue = parseFloat(slider.value);
    label.textContent = yearMap[Math.round(initialValue)];

    slider.addEventListener('input', () => {
        const v = parseFloat(slider.value);
        label.textContent = yearMap[Math.round(v)];
        updateFlows(map, v);
    });

    updateFlows(map, initialValue);
}
