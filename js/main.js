// js/main.js

// --- Global State Variables & Constants --- //
const APP_LS_SETTINGS_KEY = 'typeCrusherAppSettings';
const MAX_CHART_HISTORY_ITEMS = 50; // For display on charts, actual history can be larger in IndexedDB

// DOM Elements - will be populated by cacheDOMElements()
let DOMElements = {};

// Application State - these are central to the app's operation
let currentText = '';           // The text for the current typing session
let textCharsSpans = [];      // Array of <span> elements for each character in currentText
let currentSessionData = {};  // Holds { wpm, accuracy, errors, textLength, etc. } for the current session
let charPerformance = {};     // Cumulative { 'a': { correct, incorrect, total, errorsMade: {} }, ... }
let progressHistory = [];     // Array of sessionData objects for overall progress
let personalBestWPM = 0;

// Game Engine State (might be better encapsulated in engine.js if it grows more complex)
let startTime = null;
let timerInterval = null;
let charIndex = 0;
let mistakes = 0;
let totalTypedChars = 0; // All key presses that were intended to be characters
let isGameActive = false;
let countdownTimer = null;
let shiftPressed = false;
let currentDrillNameInternal = ''; // To store the name of the currently selected drill

// --- Initialization --- //
document.addEventListener('DOMContentLoaded', async () => {
    cacheDOMElementsInternal(); // Internal function to populate DOMElements
    loadAppSettings(); // Load settings like dark mode preference
    await loadPersistentData(); // Load history and performance from IndexedDB/localStorage
    
    initApplicationUI(); // Setup initial UI elements like drill selectors
    setupAllEventListeners(); // Attach all event listeners

    loadNewTextAndStartCountdown(); // Load initial text and start the first countdown
    updateActiveNavLinkUI('hero-section'); // Set initial active nav link
});

function cacheDOMElementsInternal() {
    DOMElements = {
        // UI elements
        textDisplay: document.getElementById('text-display'),
        textInput: document.getElementById('text-input'),
        wpmDisplay: document.getElementById('wpm'),
        accuracyDisplay: document.getElementById('accuracy'),
        timeDisplay: document.getElementById('time'),
        errorsStatDisplay: document.getElementById('errors-stat'),
        countdownDisplay: document.querySelector('.countdown'),
        cursorElement: document.getElementById('cursor'),
        personalBestWPMDisplay: document.getElementById('personal-best-wpm'),
        currentExerciseTitle: document.getElementById('current-exercise-title'),

        // Controls
        restartBtn: document.getElementById('restart-btn'),
        tryAgainBtn: document.getElementById('try-again-btn'),
        difficultySelect: document.getElementById('difficulty'),
        modeSelect: document.getElementById('mode'),
        drillTypeSelect: document.getElementById('drill-type'),
        drillSelectorWrapper: document.getElementById('drill-selector-wrapper'),
        
        // Sections
        heroSection: document.getElementById('hero-section'),
        practiceSectionContainer: document.getElementById('practice-section'), // The main typing app area
        drillsSection: document.getElementById('drills-section'),
        resultsSection: document.getElementById('results-section'),
        progressSection: document.getElementById('progress-section'),
        
        // Virtual Keyboard
        virtualKeys: document.querySelectorAll('.key'),

        // Charts & Stats Display
        sessionSpeedChartCtx: document.getElementById('sessionSpeedChart')?.getContext('2d'),
        overallProgressChartCtx: document.getElementById('overallProgressChart')?.getContext('2d'),
        characterStatsList: document.getElementById('character-stats'),
        problemKeysList: document.getElementById('problem-keys'),
        progressHistoryTableBody: document.querySelector('#progress-history-table tbody'),
        
        // Navigation & General UI
        darkModeToggle: document.getElementById('darkModeToggle'),
        startTypingHeroBtn: document.getElementById('start-typing-hero-btn'),
        mainNav: document.getElementById('main-nav'),
        mainNavLinks: document.querySelectorAll('#main-nav a'),
        mobileMenuToggle: document.getElementById('mobile-menu-toggle'),
        drillsGridContainer: document.getElementById('drills-grid-container'),
        viewOverallProgressBtn: document.getElementById('view-overall-progress-btn'),
        clearProgressBtn: document.getElementById('clear-progress-btn'),
    };
    document.getElementById('currentYear').textContent = new Date().getFullYear();
}

async function loadPersistentData() {
    try {
        const data = await loadAllProgressData(); // From data.js
        progressHistory = data.progressHistory || [];
        charPerformance = data.charPerformance || {};
        personalBestWPM = data.personalBestWPM || 0;
        
        // Apply settings if any (e.g., dark mode)
        if (data.settings && data.settings.darkMode) {
            applyDarkModeStylesUI(true); // from ui.js
        } else {
            applyDarkModeStylesUI(false);
        }
        updatePersonalBestUI(personalBestWPM); // from ui.js
        console.log("Persistent data loaded.", { progressHistory, charPerformance, personalBestWPM });
    } catch (error) {
        console.error("Error loading persistent data:", error);
        // Initialize with defaults if loading fails
        progressHistory = [];
        charPerformance = {};
        personalBestWPM = 0;
        applyDarkModeStylesUI(false); // Default to light mode
        updatePersonalBestUI(0);
    }
}

function loadAppSettings() {
    const settings = getFromLocalStorage(APP_LS_SETTINGS_KEY, { darkMode: false });
    applyDarkModeStylesUI(settings.darkMode);
}

function saveAppSettings(newSettings) {
    const currentSettings = getFromLocalStorage(APP_LS_SETTINGS_KEY, {});
    saveToLocalStorage(APP_LS_SETTINGS_KEY, { ...currentSettings, ...newSettings });
}


function initApplicationUI() {
    populateDrillSelectorsUI(DRILL_DEFINITIONS, DOMElements.drillTypeSelect, DOMElements.drillsGridContainer); // from ui.js
    // Set initial visibility of sections (e.g., show hero, hide others)
    showSectionUI('hero-section'); // from ui.js
    handleModeChangeInternal(); // To set initial state of drill selector etc.
}

function setupAllEventListeners() {
    DOMElements.restartBtn.addEventListener('click', loadNewTextAndStartCountdown);
    DOMElements.tryAgainBtn.addEventListener('click', () => {
        showSectionUI('practice-section'); // Ensure practice section is visible
        loadNewTextAndStartCountdown();
    });

    DOMElements.difficultySelect.addEventListener('change', loadNewTextAndStartCountdown);
    DOMElements.modeSelect.addEventListener('change', handleModeChangeInternal);
    DOMElements.drillTypeSelect.addEventListener('change', handleDrillSelectionChange);
    
    DOMElements.textInput.addEventListener('input', handleInputEvent); // from engine.js (or could be empty if keydown is sole input)
    DOMElements.textDisplay.addEventListener('click', () => focusTextInput()); // from ui.js via main.js

    document.addEventListener('keydown', mainHandleKeyDown);
    document.addEventListener('keyup', mainHandleKeyUp);
    
    DOMElements.startTypingHeroBtn.addEventListener('click', () => {
        showSectionUI('practice-section');
        // A small delay might be good if showSectionUI has scroll animation
        setTimeout(loadNewTextAndStartCountdown, 50); 
    });

    DOMElements.darkModeToggle.addEventListener('click', mainToggleDarkMode);
    DOMElements.mainNavLinks.forEach(link => link.addEventListener('click', mainHandleNavClick));
    DOMElements.mobileMenuToggle.addEventListener('click', () => toggleMobileNavUI()); // from ui.js

    DOMElements.viewOverallProgressBtn.addEventListener('click', mainShowOverallProgress);
    DOMElements.clearProgressBtn.addEventListener('click', mainConfirmClearProgress);

    // Event delegation for dynamically added drill buttons
    if (DOMElements.drillsGridContainer) {
        DOMElements.drillsGridContainer.addEventListener('click', (event) => {
            if (event.target.classList.contains('start-drill-btn')) {
                const drillKey = event.target.dataset.drill;
                handleDynamicDrillStart(drillKey);
            }
        });
    }
     window.addEventListener('resize', () => updateCursorPositionUI(textCharsSpans, charIndex)); // from ui.js
     document.fonts.ready.then(() => updateCursorPositionUI(textCharsSpans, charIndex));
}

// --- Event Handler Wrappers (main.js orchestrates calls to other modules) --- //
function mainHandleKeyDown(e) {
    // Prevent default for keys that might scroll the page if textInput isn't focused
    if (isGameActive && (e.key === " " || e.key.startsWith("Arrow") || e.key.startsWith("Page") || e.key === "Home" || e.key === "End")) {
        e.preventDefault();
    }

    if (e.key === "Shift") shiftPressed = true;
    // Visual feedback for modifier keys (can be moved to ui.js if purely visual)
    DOMElements.virtualKeys.forEach(key => {
        const keyData = key.dataset.key;
        const side = key.dataset.side;
        if ((e.key === "Shift" && (keyData === "16" && (e.location === KeyboardEvent.DOM_KEY_LOCATION_LEFT || !side || side === "left") || (keyData === "16-R" && (e.location === KeyboardEvent.DOM_KEY_LOCATION_RIGHT || side === "right")))) ||
            (e.key === "Control" && (keyData === "17" && (e.location === KeyboardEvent.DOM_KEY_LOCATION_LEFT || !side || side === "left") || (keyData === "17-R" && (e.location === KeyboardEvent.DOM_KEY_LOCATION_RIGHT || side === "right")))) ||
            (e.key === "Alt" && (keyData === "18" && (e.location === KeyboardEvent.DOM_KEY_LOCATION_LEFT || !side || side === "left") || (keyData === "18-R" && (e.location === KeyboardEvent.DOM_KEY_LOCATION_RIGHT || side === "right")))) ||
            ((e.key === "Meta" || e.key === "OS") && keyData === "91") ) {
            key.classList.add('active');
        }
    });

    if (isGameActive && !DOMElements.textInput.disabled) {
        if (document.activeElement !== DOMElements.textInput) {
            DOMElements.textInput.focus({ preventScroll: true });
        }
        
        if (!e.metaKey && !e.ctrlKey && !e.altKey && 
            (e.key.length === 1 || e.key === "Enter" || e.key === "Backspace")) { 
            
            if (e.key !== "Backspace") { 
                e.preventDefault(); 
                let gameChar = e.key;
                if (e.key === "Enter") {
                    // If expected char is newline, allow it, otherwise treat 'Enter' as a string if user presses it wrongly
                    gameChar = (charIndex < textCharsSpans.length && textCharsSpans[charIndex].textContent === '\n') ? '\n' : "Enter";
                }
                processCharacterInput(gameChar, shiftPressed); // from engine.js
            } else { 
                 e.preventDefault();
                 // Basic backspace visual feedback for now. Full logic is complex.
                 const backspaceKeyEl = document.querySelector('.key[data-key="8"]');
                 if (backspaceKeyEl) {
                     backspaceKeyEl.classList.add('active');
                     setTimeout(() => backspaceKeyEl.classList.remove('active'), 120);
                 }
            }
        }
    }
}

function mainHandleKeyUp(e) {
    if (e.key === "Shift") shiftPressed = false;
    
    DOMElements.virtualKeys.forEach(key => {
        const keyData = key.dataset.key;
        const side = key.dataset.side;
         if ((e.key === "Shift" && (keyData === "16" || keyData === "16-R")) ||
            (e.key === "Control" && (keyData === "17" || keyData === "17-R")) ||
            (e.key === "Alt" && (keyData === "18" || keyData === "18-R")) ||
            ((e.key === "Meta" || e.key === "OS") && keyData === "91") ) {
            key.classList.remove('active');
        }
    });
     // If a non-modifier key was released that was made active by its char match
    const releasedKeyChar = e.key.length === 1 ? (shiftPressed ? e.key : e.key.toLowerCase()) : e.key;
    DOMElements.virtualKeys.forEach(key => {
        if((key.dataset.char === releasedKeyChar || key.dataset.shiftChar === releasedKeyChar) && key.classList.contains('active')){
            // This part is tricky because `active` for non-modifiers is short-lived by processCharacterInput
            // So, this might not be strictly necessary unless active state persists longer.
        }
    });
}

function handleModeChangeInternal() {
    const selectedMode = DOMElements.modeSelect.value;
    const isDrillsMode = selectedMode === 'drills';
    
    toggleDrillSelectorUI(isDrillsMode); // from ui.js
    
    if (isDrillsMode) {
        currentDrillNameInternal = DRILL_DEFINITIONS[DOMElements.drillTypeSelect.value].name;
        updateExerciseTitleUI(`Drill: ${currentDrillNameInternal}`); // from ui.js
    } else {
        currentDrillNameInternal = ''; // Clear drill name if not in drills mode
        updateExerciseTitleUI("Precision Typing Practice"); // Default title
    }
    loadNewTextAndStartCountdown();
}

function handleDrillSelectionChange() {
    const selectedDrillKey = DOMElements.drillTypeSelect.value;
    currentDrillNameInternal = DRILL_DEFINITIONS[selectedDrillKey].name;
    updateExerciseTitleUI(`Drill: ${currentDrillNameInternal}`); // from ui.js
    loadNewTextAndStartCountdown();
}

function handleDynamicDrillStart(drillKey) {
    DOMElements.modeSelect.value = 'drills';
    DOMElements.drillTypeSelect.value = drillKey;
    currentDrillNameInternal = DRILL_DEFINITIONS[drillKey].name;
    
    toggleDrillSelectorUI(true); // Show drill selector, hide difficulty
    updateExerciseTitleUI(`Drill: ${currentDrillNameInternal}`);
    
    loadNewTextAndStartCountdown();
    showSectionUI('practice-section'); // Switch to practice view
}


function mainToggleDarkMode() {
    const isDarkModeNow = document.body.classList.contains('dark-mode');
    applyDarkModeStylesUI(!isDarkModeNow); // from ui.js
    saveAppSettings({ darkMode: !isDarkModeNow }); // Save the new preference
    updateChartTheme(); // from charts.js
}

function mainHandleNavClick(e) {
    e.preventDefault();
    const targetId = e.currentTarget.getAttribute('href').substring(1);
    showSectionUI(targetId); // from ui.js
    // updateActiveNavLinkUI is called within showSectionUI
}

function mainShowOverallProgress() {
    renderProgressHistoryTableUI(progressHistory.slice(-MAX_CHART_HISTORY_ITEMS).reverse()); // from ui.js
    displayOverallProgressChart(progressHistory); // from charts.js
    showSectionUI('progress-section'); // from ui.js
}

async function mainConfirmClearProgress() {
    if (confirm("Are you sure you want to clear ALL your typing progress, performance data, and personal bests? This action cannot be undone.")) {
        const success = await clearAllPersistentData(); // from data.js
        if (success) {
            // Reset in-memory state
            progressHistory = [];
            charPerformance = {};
            personalBestWPM = 0;
            
            // Update UI
            updatePersonalBestUI(0); // from ui.js
            if (DOMElements.resultsSection.style.display === 'block') { // If results were visible, clear them
                DOMElements.characterStatsList.innerHTML = '<div class="detail-item">No data.</div>';
                DOMElements.problemKeysList.innerHTML = '<div class="detail-item">No data.</div>';
                if(sessionChartInstance) sessionChartInstance.destroy(); // Destroy old session chart
            }
            renderProgressHistoryTableUI([]); // from ui.js, clears the table
            displayOverallProgressChart([]); // from charts.js, clears the chart or shows no data message
            alert("All progress data has been cleared successfully.");
        } else {
            alert("Failed to clear all data. Please try again or check console for errors.");
        }
    }
}


// --- Core Game Flow --- //
function loadNewTextAndStartCountdown() {
    const mode = DOMElements.modeSelect.value;
    const difficulty = DOMElements.difficultySelect.value;
    const drillKey = (mode === 'drills') ? DOMElements.drillTypeSelect.value : null;

    const exercise = getExerciseText(mode, difficulty, drillKey, charPerformance); // from adaptive.js (which uses texts.js)
    currentText = exercise.text;
    updateExerciseTitleUI(exercise.title); // from ui.js

    DOMElements.textDisplay.innerHTML = ''; // Clear previous text
    textCharsSpans = [];
    currentText.split('').forEach(char => {
        const span = document.createElement('span');
        span.textContent = char;
        DOMElements.textDisplay.appendChild(span);
        textCharsSpans.push(span);
    });
    DOMElements.textDisplay.scrollTop = 0; // Scroll to top for new text

    startNewTypingSession(currentText, textCharsSpans); // from engine.js
    // Countdown display update is handled by this function now
    updateCountdownDisplayUI("Get Ready..."); // from ui.js
    
    // Actual countdown starts
    let count = 3;
    DOMElements.countdownDisplay.textContent = count;
    DOMElements.countdownDisplay.style.display = 'flex';
    DOMElements.countdownDisplay.classList.remove('fade-out');


    if(countdownTimer) clearInterval(countdownTimer); // Clear any existing countdown
    countdownTimer = setInterval(() => {
        count--;
        if (count > 0) {
            updateCountdownDisplayUI(count.toString());
        } else {
            clearInterval(countdownTimer);
            updateCountdownDisplayUI("Go!"); // This will also handle fade out via ui.js
            // startGame (beginActiveTyping) will be called after the "Go!" message fades
            setTimeout(() => {
                 beginActiveTyping(); // from engine.js
            }, 250 + 50); // Wait for Go! fade + small buffer
        }
    }, 800); // Countdown interval
}


// This function will be called by engine.js when a session ends
function handleSessionCompletion() {
    console.log("Main: Session completion handler called.");
    // Calculate final WPM and Accuracy for this session (stats are already updated by engine)
    const finalWPM = parseInt(DOMElements.wpmDisplay.textContent);
    const finalAccuracy = parseInt(DOMElements.accuracyDisplay.textContent.replace('%', ''));
    const finalErrors = parseInt(DOMElements.errorsStatDisplay.textContent);

    currentSessionData = {
        date: new Date().toISOString(),
        mode: DOMElements.modeSelect.value === 'drills' ? `Drill: ${currentDrillNameInternal}` : DOMElements.modeSelect.value,
        difficulty: DOMElements.modeSelect.value === 'drills' ? 'N/A' : DOMElements.difficultySelect.value,
        wpm: finalWPM,
        accuracy: finalAccuracy,
        errors: finalErrors,
        textLength: currentText.length
    };

    if (!isNaN(finalWPM) && !isNaN(finalAccuracy)) {
        progressHistory.push(currentSessionData);
        if (finalWPM > personalBestWPM) {
            personalBestWPM = finalWPM;
            notifyNewPersonalBestUI(personalBestWPM); // from ui.js
        }
        updatePersonalBestUI(personalBestWPM); // from ui.js - to ensure PB always reflects current best

        // Save data using data.js functions
        saveSessionResult(currentSessionData) // from data.js (saves to IndexedDB)
            .then(() => saveCharPerformance(charPerformance)) // from data.js (updates char perf in IndexedDB)
            .then(() => saveToLocalStorage(LS_PERSONAL_BEST_WPM_KEY, personalBestWPM)) // from data.js
            .then(() => console.log("Session data and performance saved successfully."))
            .catch(err => console.error("Error saving session/performance data:", err));
    }

    // Prepare data for UI display
    const charPerfForDisplay = Object.entries(charPerformance)
        .map(([char, data]) => ({ char, ...data, accuracy: data.total > 0 ? (data.correct / data.total) * 100 : 0 }))
        .filter(item => item.total > 0)
        .sort((a, b) => a.accuracy - b.accuracy || b.total - a.total)
        .slice(0, 15);

    const problemKeysForDisplay = [];
    for (const expectedChar in charPerformance) {
        if (charPerformance[expectedChar].errorsMade) {
            for (const typedMistake in charPerformance[expectedChar].errorsMade) {
                problemKeysForDisplay.push({
                    expected: expectedChar,
                    typed: typedMistake,
                    count: charPerformance[expectedChar].errorsMade[typedMistake]
                });
            }
        }
    }
    problemKeysForDisplay.sort((a,b) => b.count - a.count).slice(0,10);

    displayResultsUI(charPerfForDisplay, problemKeysForDisplay); // from ui.js
    displaySessionChart(currentSessionData); // from charts.js

    showSectionUI('results-section'); // from ui.js
}