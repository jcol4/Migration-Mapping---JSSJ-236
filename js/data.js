export let flowData = null;

export const yearMap = ["Pre-1948", "1948", "1967", "2025"];

export async function loadFlowData(map) {
    // file is in data/ folder
    const response = await fetch('./data/flowdata.json');  
    if (!response.ok) {
        console.error("Failed to load flow data:", response.statusText);
        return;
    }
    flowData = await response.json();
}