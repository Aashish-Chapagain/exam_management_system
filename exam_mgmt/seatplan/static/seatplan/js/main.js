// Smooth print
function printSeatPlan() {
    window.print();
}

// Optional: confirm generation
function confirmSeatGeneration() {
    return confirm("Are you sure you want to generate the seat plan?");
}

// Debug helper: log static URLs and try fetching CSS/JS to surface load errors
function debugStaticAssets() {
    try {
        const origin = window.location.origin || '';
        const cssPath = origin + '/static/seatplan/css/main.css';
        const jsPath = origin + '/static/seatplan/js/main.js';
        console.log('DEBUG: seatplan css ->', cssPath);
        console.log('DEBUG: seatplan js  ->', jsPath);

        fetch(cssPath, { method: 'GET', cache: 'no-store' })
            .then((r) => console.log('DEBUG: fetch CSS status', r.status))
            .catch((e) => console.error('DEBUG: fetch CSS error', e));

        fetch(jsPath, { method: 'GET', cache: 'no-store' })
            .then((r) => console.log('DEBUG: fetch JS status', r.status))
            .catch((e) => console.error('DEBUG: fetch JS error', e));
    } catch (e) {
        console.error('DEBUG: debugStaticAssets error', e);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    debugStaticAssets();
});
