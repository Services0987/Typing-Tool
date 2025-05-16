// js/charts.js

// Assumes Chart.js is loaded globally.
// DOMElements will be accessed globally (from main.js)

let sessionChartInstance = null;
let overallProgressChartInstance = null;

function getChartFontColor() {
    return getComputedStyle(document.body).getPropertyValue('--dark-text').trim();
}
function getChartGridColor() {
    return getComputedStyle(document.body).getPropertyValue('--border-light').trim();
}


function displaySessionChart(sessionData) {
    if (!DOMElements.sessionSpeedChartCtx || !sessionData) {
        console.warn("Session chart canvas or data not available.");
        return;
    }

    if (sessionChartInstance) {
        sessionChartInstance.destroy();
    }

    const fontColor = getChartFontColor();

    sessionChartInstance = new Chart(DOMElements.sessionSpeedChartCtx, {
        type: 'bar',
        data: {
            labels: ['WPM', 'Accuracy (%)', 'Errors'],
            datasets: [{
                label: 'Current Session',
                data: [sessionData.wpm, sessionData.accuracy, sessionData.errors],
                backgroundColor: [
                    'rgba(58, 134, 255, 0.7)',  // Primary for WPM
                    'rgba(40, 167, 69, 0.7)',   // Success for Accuracy
                    'rgba(220, 53, 69, 0.7)'    // Error for Errors
                ],
                borderColor: [
                    'rgba(58, 134, 255, 1)',
                    'rgba(40, 167, 69, 1)',
                    'rgba(220, 53, 69, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y', // Horizontal bar chart
            scales: {
                x: {
                    beginAtZero: true,
                    max: Math.max(100, sessionData.wpm + 20, sessionData.accuracy + 5, sessionData.errors + 10), // Dynamic max
                    ticks: { color: fontColor, font: { family: "'Poppins', sans-serif" } },
                    grid: { color: getChartGridColor() }
                },
                y: {
                    ticks: { color: fontColor, font: { family: "'Poppins', sans-serif", size: 13 } },
                    grid: { display: false }
                }
            },
            plugins: {
                legend: {
                    display: false // Single dataset, legend not very useful
                },
                tooltip: {
                    enabled: true,
                    titleFont: { family: "'Poppins', sans-serif" },
                    bodyFont: { family: "'Poppins', sans-serif" }
                },
                title: {
                    display: true,
                    text: 'Session Performance Summary',
                    color: fontColor,
                    font: { size: 16, family: "'Poppins', sans-serif", weight: '500' },
                    padding: { top: 0, bottom: 20 }
                }
            }
        }
    });
}

function displayOverallProgressChart(fullHistoryData) {
    if (!DOMElements.overallProgressChartCtx) {
        console.warn("Overall progress chart canvas not available.");
        return;
    }
    if (overallProgressChartInstance) {
        overallProgressChartInstance.destroy();
    }

    // Use only the last MAX_HISTORY_ITEMS for chart performance
    const displayHistory = fullHistoryData.slice(-MAX_HISTORY_ITEMS);

    if (displayHistory.length === 0) {
        DOMElements.overallProgressChartCtx.style.display = 'none';
        const parentContainer = DOMElements.overallProgressChartCtx.parentElement;
        if (!parentContainer.querySelector('.no-data-message')) {
            const noDataMsg = document.createElement('p');
            noDataMsg.textContent = "No progress data yet to display. Complete some sessions!";
            noDataMsg.className = 'no-data-message';
            noDataMsg.style.textAlign = 'center';
            noDataMsg.style.padding = '20px';
            parentContainer.insertBefore(noDataMsg, DOMElements.overallProgressChartCtx);
        }
        return;
    } else {
        DOMElements.overallProgressChartCtx.style.display = 'block';
        const existingMsg = DOMElements.overallProgressChartCtx.parentElement.querySelector('.no-data-message');
        if (existingMsg) existingMsg.remove();
    }
    

    const chartLabels = displayHistory.map(entry => new Date(entry.date));
    const wpmData = displayHistory.map(entry => entry.wpm);
    const accuracyData = displayHistory.map(entry => entry.accuracy);
    const fontColor = getChartFontColor();
    const gridColor = getChartGridColor();

    overallProgressChartInstance = new Chart(DOMElements.overallProgressChartCtx, {
        type: 'line',
        data: {
            labels: chartLabels,
            datasets: [
                {
                    label: 'WPM',
                    data: wpmData,
                    borderColor: 'var(--primary)',
                    backgroundColor: 'rgba(58, 134, 255, 0.15)',
                    tension: 0.3,
                    yAxisID: 'yWPM',
                    fill: true,
                    pointRadius: 3,
                    pointHoverRadius: 5,
                    pointBackgroundColor: 'var(--primary)'
                },
                {
                    label: 'Accuracy (%)',
                    data: accuracyData,
                    borderColor: 'var(--success)',
                    backgroundColor: 'rgba(40, 167, 69, 0.15)',
                    tension: 0.3,
                    yAxisID: 'yAccuracy',
                    fill: true,
                    pointRadius: 3,
                    pointHoverRadius: 5,
                    pointBackgroundColor: 'var(--success)'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { // For better tooltips
                mode: 'index',
                intersect: false,
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: chartLabels.length > 30 ? 'week' : 'day', // Adjust unit based on data density
                        tooltipFormat: 'MMM dd, yyyy HH:mm',
                        displayFormats: {
                            millisecond: 'HH:mm:ss.SSS',
                            second: 'HH:mm:ss',
                            minute: 'HH:mm',
                            hour: 'HH:mm',
                            day: 'MMM dd',
                            week: 'MMM dd',
                            month: 'MMM yyyy',
                            quarter: 'qqq yyyy',
                            year: 'yyyy'
                        }
                    },
                    ticks: { color: fontColor, font: { family: "'Poppins', sans-serif" }, source: 'auto', maxRotation: 0, autoSkip: true, autoSkipPadding: 15 },
                    grid: { color: gridColor }
                },
                yWPM: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: { display: true, text: 'WPM', color: fontColor, font: { family: "'Poppins', sans-serif", weight: '500' } },
                    min: 0,
                    ticks: { color: fontColor, font: { family: "'Poppins', sans-serif" } },
                    grid: { color: gridColor }
                },
                yAccuracy: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: { display: true, text: 'Accuracy (%)', color: fontColor, font: { family: "'Poppins', sans-serif", weight: '500' } },
                    min: 0,
                    max: 100,
                    grid: { drawOnChartArea: false }, // Only show grid for WPM axis
                    ticks: { color: fontColor, font: { family: "'Poppins', sans-serif" } }
                }
            },
            plugins: {
                legend: {
                    labels: { 
                        color: fontColor, 
                        font: { family: "'Poppins', sans-serif", size: 13 },
                        usePointStyle: true // Use point style in legend
                    },
                    position: 'top',
                    align: 'end'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    titleFont: { family: "'Poppins', sans-serif", weight: '600' },
                    bodyFont: { family: "'Poppins', sans-serif" },
                    footerFont: { family: "'Poppins', sans-serif" },
                    padding: 10,
                    boxPadding: 4, // Add padding within the tooltip box
                    callbacks: {
                        // You can customize tooltips further if needed
                    }
                },
                 title: {
                    display: true,
                    text: 'Typing Performance Over Time',
                    color: fontColor,
                    font: { size: 16, family: "'Poppins', sans-serif", weight: '500' },
                    padding: { top: 0, bottom: 20 }
                }
            }
        }
    });
}

// Function to update chart colors on dark mode toggle
function updateChartTheme() {
    if (sessionChartInstance) {
        const fontColor = getChartFontColor();
        const gridColor = getChartGridColor();
        sessionChartInstance.options.scales.x.ticks.color = fontColor;
        sessionChartInstance.options.scales.y.ticks.color = fontColor;
        sessionChartInstance.options.scales.x.grid.color = gridColor;
        sessionChartInstance.options.plugins.title.color = fontColor;
        sessionChartInstance.update();
    }
    if (overallProgressChartInstance) {
        const fontColor = getChartFontColor();
        const gridColor = getChartGridColor();
        overallProgressChartInstance.options.scales.x.ticks.color = fontColor;
        overallProgressChartInstance.options.scales.yWPM.ticks.color = fontColor;
        overallProgressChartInstance.options.scales.yAccuracy.ticks.color = fontColor;
        overallProgressChartInstance.options.scales.yWPM.title.color = fontColor;
        overallProgressChartInstance.options.scales.yAccuracy.title.color = fontColor;
        overallProgressChartInstance.options.scales.x.grid.color = gridColor;
        overallProgressChartInstance.options.scales.yWPM.grid.color = gridColor;
        overallProgressChartInstance.options.plugins.legend.labels.color = fontColor;
        overallProgressChartInstance.options.plugins.title.color = fontColor;
        overallProgressChartInstance.update();
    }
}

// Make functions available (if not using ES modules, they are global by default)
// window.chartManager = { displaySessionChart, displayOverallProgressChart, updateChartTheme };