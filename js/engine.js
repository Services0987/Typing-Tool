// js/engine.js

// This file assumes DOMElements, ui.js functions, data.js functions, 
// and global state variables like isGameActive, charIndex etc. are accessible (managed by main.js)

// --- Game State Variables (scoped to this module if not needed globally, or managed in main.js) ---
// These are reset for each session by functions in main.js calling engine functions.
// let currentText = ''; // Set by main.js
// let textCharsSpans = []; // Set by main.js
// let startTime = null; // Set by engine.startSession
// let timerInterval = null; // Set by engine.startSession
// let charIndex = 0; // Managed by engine
// let mistakes = 0; // Managed by engine
// let totalTypedChars = 0; // Managed by engine
// let isGameActive = false; // Managed by engine
// let shiftPressed = false; // Managed by main.js (keyboard events)


// --- Core Typing Test Logic ---

function startNewTypingSession(newText, newTextSpans) {
    // Reset session-specific state
    currentText = newText; // This global 'currentText' will be updated from main.js
    textCharsSpans = newTextSpans; // This global 'textCharsSpans' will be updated from main.js
    
    charIndex = 0;
    mistakes = 0;
    totalTypedChars = 0;
    startTime = null;
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = null;
    isGameActive = false; // Will be set to true after countdown

    // UI Resets handled by main.js calling ui.js functions
    // (e.g., resetStateAndElementsUI from main.js, which then calls specific ui.js updates)
    
    console.log("New typing session prepared. Text length:", currentText.length);
}

function beginActiveTyping() {
    isGameActive = true;
    startTime = new Date();
    timerInterval = setInterval(calculateAndDisplayStats, 1000);
    
    if (DOMElements.textInput) {
        DOMElements.textInput.disabled = false;
        DOMElements.textInput.focus({ preventScroll: true });
        // Ensure practice area is visible
        DOMElements.typingAppContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    updateCursorPositionUI(textCharsSpans, charIndex); // From ui.js
    highlightNextKeyBasedOnText(); // From engine.js
    console.log("Active typing started.");
}

function calculateAndDisplayStats() {
    if (!isGameActive || !startTime) return;

    const currentTime = new Date();
    const timeElapsedSeconds = Math.max(0, Math.round((currentTime - startTime) / 1000));
    
    const minutes = Math.floor(timeElapsedSeconds / 60);
    const seconds = timeElapsedSeconds % 60;
    const timeString = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

    // Net WPM: (correct chars / 5) / time_in_minutes
    // A common approach is (All Typed Chars / 5 – Uncorrected Errors) / Time (min)
    // Here, we use (chars_at_cursor_index - mistakes) as a proxy for "correctly progressed chars"
    const correctCharsForWPM = Math.max(0, charIndex - mistakes); 
    const wordsTyped = correctCharsForWPM / 5; 
    const timeElapsedMinutes = timeElapsedSeconds / 60;
    let wpm = 0;
    if (timeElapsedMinutes > 0) {
        wpm = Math.round(wordsTyped / timeElapsedMinutes);
    }
    wpm = Math.max(0, wpm); // Ensure WPM is not negative

    let accuracy = 0;
    if (totalTypedChars > 0) { // totalTypedChars includes all attempts (correct and incorrect)
        accuracy = Math.max(0, Math.round(((totalTypedChars - mistakes) / totalTypedChars) * 100));
    } else if (charIndex === 0 && mistakes === 0) { // If no chars typed yet
        accuracy = 100; // Start with 100%
    }
    
    updateStatsUI(wpm, accuracy, timeString, mistakes); // From ui.js
}

function processCharacterInput(typedCharKey, actualShiftPressed) {
    if (!isGameActive || charIndex >= textCharsSpans.length) return;

    totalTypedChars++;
    const expectedCharSpan = textCharsSpans[charIndex];
    const expectedChar = expectedCharSpan.textContent;
    
    let charToCompare = typedCharKey; // This is e.key from the event

    // Determine the actual character typed based on shift state, more reliably
    // This is tricky because e.key already considers shift for symbols/uppercase.
    // We need to know if shift *was* pressed for the typedCharKey to correctly assess if a shift mistake was made
    // for lowercase letters if Shift was held, or for symbols if Shift was *not* held but was required.

    // If expected is uppercase and shift wasn't pressed, OR expected is symbol requiring shift and shift wasn't pressed
    // OR expected is lowercase and shift WAS pressed. These are types of "shift errors".

    let isCorrectMatch = (typedCharKey === expectedChar);
    
    // Update global charPerformance (will be passed from main.js)
    if (!charPerformance[expectedChar]) {
        charPerformance[expectedChar] = { correct: 0, incorrect: 0, total: 0, errorsMade: {} };
    }
    charPerformance[expectedChar].total++;

    markCharacterUI(expectedCharSpan, isCorrectMatch); // from ui.js

    if (isCorrectMatch) {
        charPerformance[expectedChar].correct++;
    } else {
        mistakes++;
        charPerformance[expectedChar].incorrect++;
        if (!charPerformance[expectedChar].errorsMade[typedCharKey]) {
            charPerformance[expectedChar].errorsMade[typedCharKey] = 0;
        }
        charPerformance[expectedChar].errorsMade[typedCharKey]++;
        
        // UI feedback for error (e.g., shake)
        if (DOMElements.typingAppContainer) {
            DOMElements.typingAppContainer.classList.add('shake-error');
            setTimeout(() => DOMElements.typingAppContainer.classList.remove('shake-error'), 200);
        }
    }
    
    // Visual feedback on virtual keyboard for the key *pressed*
    highlightVirtualKeyUI(typedCharKey, !isCorrectMatch, actualShiftPressed); // from ui.js
            
    charIndex++;

    if (charIndex < textCharsSpans.length) {
        // UI update for next current character is handled in updateTextDisplayUI
        updateTextDisplayUI(textCharsSpans, charIndex); // from ui.js
    } else {
        triggerSessionEnd(); // from engine.js, which will call main.js handler
        return;
    }

    // updateCursorPositionUI is called by updateTextDisplayUI
    highlightNextKeyBasedOnText(); // from engine.js
    calculateAndDisplayStats(); 
}

function highlightNextKeyBasedOnText() {
    if (!isGameActive || charIndex >= textCharsSpans.length) {
        DOMElements.virtualKeys.forEach(k => k.classList.remove('next-char')); // Clear if game over
        return;
    }
    const nextChar = textCharsSpans[charIndex].textContent;
    // Determine if shift is *required* for the *next expected character*
    let shiftRequiredForNext = false;
    DOMElements.virtualKeys.forEach(key => {
        if (key.dataset.shiftChar === nextChar) {
            shiftRequiredForNext = true;
        }
    });
    // If it's an uppercase letter and not a symbol that has a shiftChar defined (e.g. A vs !)
    if (!shiftRequiredForNext && nextChar === nextChar.toUpperCase() && nextChar !== nextChar.toLowerCase()) {
        shiftRequiredForNext = true;
    }
    
    highlightNextVirtualKeyUI(textCharsSpans, charIndex, shiftRequiredForNext); // from ui.js
}


function triggerSessionEnd() {
    isGameActive = false;
    if (DOMElements.textInput) DOMElements.textInput.disabled = true;
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = null; // Clear interval ID
    
    calculateAndDisplayStats(); // Final calculation

    // Call a function in main.js to handle post-session logic (saving data, showing results)
    handleSessionCompletion(); // This function needs to be defined in main.js
    console.log("Typing session ended.");
}


// This module exports functions to be used by main.js
// For a simple script setup, these would be global. 
// If we were using ES modules:
// export { startNewTypingSession, beginActiveTyping, processCharacterInput, calculateAndDisplayStats, highlightNextKeyBasedOnText, triggerSessionEnd }; 