const trackingSteps = [
    { text: "Preparing your order...", progress: 25 },
    { text: "Order confirmed...", progress: 45 },
    { text: "Driver picked up your order...", progress: 70 },
    { text: "Driver is near your location...", progress: 90 },
    { text: "Delivered successfully.", progress: 100 }
];

function startTracking() {
    const statusEl = document.getElementById("trackingStatus");
    const progressEl = document.getElementById("trackingProgress");
    const markerEl = document.getElementById("mapMarker");

    if (!statusEl || !progressEl || !markerEl) {
        return;
    }

    let step = 0;

    function updateStep() {
        const current = trackingSteps[step];
        statusEl.textContent = current.text;
        progressEl.style.width = `${current.progress}%`;
        markerEl.style.left = `${Math.max(current.progress - 8, 0)}%`;

        if (step < trackingSteps.length - 1) {
            step += 1;
            setTimeout(updateStep, 2000);
        }
    }

    updateStep();
}

document.addEventListener("DOMContentLoaded", startTracking);
