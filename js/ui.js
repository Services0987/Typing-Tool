// js/ui.js

// This file assumes DOMElements object is available globally or passed as an argument.
// For simplicity here, we'll assume it's populated by main.js and accessible.

function updateCountdownDisplay(text) {
    if (DOMElements.countdownDisplay) {
        DOMElements.countdownDisplay.textContent = text;
        if (text.toLowerCase() === 'go!') {
            DOMElements.countdownDisplay.classList.add('fade-out');
            setTimeout(() => {
                DOMElements.countdownDisplay.style.display = 'none';
                DOMElements.countdownDisplay.classList.remove('fade-out'); // Reset for next time
            }, 300); // Match CSS animation
        } else {
            DOMElements.countdownDisplay.style.display = 'flex';
            DOMElements.countdownDisplay.classList.remove('fade-out');
        }
    }
}

function updateTextDisplayUI(textCharsSpansArray, currentCharIndex) {
    if (DOMElements.textDisplay) {
        // Efficiently update classes without rebuilding innerHTML
        textCharsSpansArray.forEach((span, index) => {
            span.classList.remove('current'); // Remove current from all first
            if (index === currentCharIndex) {
                span.classList.add('current');
            }
        });
    }
    updateCursorPositionUI(textCharsSpansArray, currentCharIndex);
}

function markCharacterUI(spanElement, isCorrect) {
    if (spanElement) {
        spanElement.classList.remove('current', 'correct', 'incorrect'); // Clear previous states
        spanElement.classList.add(isCorrect ? 'correct' : 'incorrect');
    }
}

function updateStatsUI(wpm, accuracy, time, errors) {
    if (DOMElements.wpmDisplay) DOMElements.wpmDisplay.textContent = wpm;
    if (DOMElements.accuracyDisplay) DOMElements.accuracyDisplay.textContent = `${accuracy}%`;
    if (DOMElements.timeDisplay) DOMElements.timeDisplay.textContent = time;
    if (DOMElements.errorsStatDisplay) DOMElements.errorsStatDisplay.textContent = errors;
}

function updatePersonalBestUI(pbWpm) {
    if (DOMElements.personalBestWPMDisplay) {
        DOMElements.personalBestWPMDisplay.textContent = `PB: ${pbWpm}`;
    }
}

function notifyNewPersonalBestUI(newPbWpm) {
    if (DOMElements.personalBestWPMDisplay) {
        DOMElements.personalBestWPMDisplay.textContent = `NEW PB: ${newPbWpm}!`;
        DOMElements.personalBestWPMDisplay.style.color = 'var(--success)';
        DOMElements.personalBestWPMDisplay.style.fontWeight = 'bold';
        setTimeout(() => {
            DOMElements.personalBestWPMDisplay.style.color = 'var(--accent)'; // Revert to accent color
            DOMElements.personalBestWPMDisplay.style.fontWeight = '500';
            DOMElements.personalBestWPMDisplay.textContent = `PB: ${newPbWpm}`;
        }, 3500);
    }
}


function updateCursorPositionUI(textCharsSpansArray, currentCharIndex) {
    if (!DOMElements.cursorElement || !DOMElements.textDisplay) return;

    const textDisplayScrollTop = DOMElements.textDisplay.scrollTop;
    let cursorTop = 0, cursorLeft = 0, cursorHeight = parseFloat(getComputedStyle(DOMElements.textDisplay).fontSize) * 1.7; // Default height

    if (currentCharIndex < textCharsSpansArray.length && textCharsSpansArray[currentCharIndex]) {
        const currentCharSpan = textCharsSpansArray[currentCharIndex];
        cursorTop = currentCharSpan.offsetTop - textDisplayScrollTop;
        cursorLeft = currentCharSpan.offsetLeft;
        cursorHeight = currentCharSpan.offsetHeight * 0.95; // Match character height closely

        // --- Auto-scroll logic for text-display ---
        const displayRect = DOMElements.textDisplay.getBoundingClientRect();
        const charRect = currentCharSpan.getBoundingClientRect(); // Relative to viewport

        const buffer = 5; // Small buffer to prevent char being exactly at edge

        if (charRect.bottom > displayRect.bottom - buffer) {
            DOMElements.textDisplay.scrollTop += (charRect.bottom - (displayRect.bottom - buffer) + (currentCharSpan.offsetHeight / 2));
            cursorTop = currentCharSpan.offsetTop - DOMElements.textDisplay.scrollTop; // Recalculate after scroll
        } else if (charRect.top < displayRect.top + buffer) {
            DOMElements.textDisplay.scrollTop -= ((displayRect.top + buffer) - charRect.top + (currentCharSpan.offsetHeight / 2));
            cursorTop = currentCharSpan.offsetTop - DOMElements.textDisplay.scrollTop; // Recalculate
        }
        // --- End auto-scroll logic ---

    } else if (currentCharIndex > 0 && currentCharIndex === textCharsSpansArray.length && textCharsSpansArray[currentCharIndex - 1]) {
        const lastCharSpan = textCharsSpansArray[currentCharIndex - 1];
        cursorTop = lastCharSpan.offsetTop - textDisplayScrollTop;
        cursorLeft = lastCharSpan.offsetLeft + lastCharSpan.offsetWidth;
        cursorHeight = lastCharSpan.offsetHeight * 0.95;
    } else if (textCharsSpansArray.length > 0 && textCharsSpansArray[0]) {
        cursorHeight = textCharsSpansArray[0].offsetHeight * 0.95;
    }


    DOMElements.cursorElement.style.top = `${cursorTop}px`;
    DOMElements.cursorElement.style.left = `${cursorLeft}px`;
    DOMElements.cursorElement.style.height = `${Math.max(16, cursorHeight)}px`; // Min height for visibility
    DOMElements.cursorElement.style.display = (isGameActive && currentCharIndex < currentText.length) ? 'block' : 'none';
}


function highlightVirtualKeyUI(char, isError, isShiftPressed) {
    let keyElement;
    const targetChar = char;

    DOMElements.virtualKeys.forEach(key => {
        const keyDataChar = key.dataset.char;
        const keyDataShiftChar = key.dataset.shiftChar;

        if (isShiftPressed) {
            if (keyDataShiftChar === targetChar) keyElement = key;
            else if (keyDataChar === targetChar.toLowerCase() && targetChar === targetChar.toLowerCase() && !keyDataShiftChar) keyElement = key; // Shift + 'a' -> 'A' key
        } else {
            if (keyDataChar === targetChar) keyElement = key;
        }
    });
    if (targetChar === ' ' && !keyElement) {
        keyElement = document.querySelector('.key.space');
    }
     if (targetChar === '\n' && !keyElement) { // For Enter key when newline is expected
        keyElement = document.querySelector('.key[data-key="13"]');
    }


    if (keyElement) {
        keyElement.classList.add(isError ? 'error-key' : 'active');
        setTimeout(() => {
            keyElement.classList.remove('active', 'error-key');
        }, 120);
    }
}

function highlightNextVirtualKeyUI(textCharsSpansArray, currentCharIndex, isShiftPressedForNext) {
    DOMElements.virtualKeys.forEach(k => k.classList.remove('next-char'));
    if (!isGameActive || currentCharIndex >= textCharsSpansArray.length) return;

    const nextChar = textCharsSpansArray[currentCharIndex].textContent;
    let keyElement;

    DOMElements.virtualKeys.forEach(key => {
        const keyChar = key.dataset.char;
        const keyShiftChar = key.dataset.shiftChar;
        
        if (isShiftPressedForNext && keyShiftChar === nextChar) {
             keyElement = key;
        } else if (!isShiftPressedForNext && keyChar === nextChar.toLowerCase()){
             keyElement = key;
        } else if (keyChar === nextChar) { 
             keyElement = key;
        }
    });
     if (nextChar === ' ' && !keyElement) {
        keyElement = document.querySelector('.key.space');
    }
    if (nextChar === '\n' && !keyElement) {
        keyElement = document.querySelector('.key[data-key="13"]'); // Enter key
    }

    if (keyElement) {
        keyElement.classList.add('next-char');
    }
}

function updateActiveNavLinkUI(targetId) {
    DOMElements.mainNavLinks.forEach(link => {
        link.classList.remove('active-nav');
        if (link.getAttribute('href') === `#${targetId}`) {
            link.classList.add('active-nav');
        }
    });
}

function showSectionUI(sectionIdToShow) {
    document.querySelectorAll('main .page-section, main .typing-app-container').forEach(sec => {
        sec.style.display = (sec.id === sectionIdToShow) ? 'block' : 'none';
    });
     // Special handling for typingAppContainer which might be the same as practice-section
    if (sectionIdToShow === 'practice-section') {
        DOMElements.typingAppContainer.style.display = 'block';
    } else if (sectionIdToShow !== 'hero-section' && DOMElements.typingAppContainer.id !== sectionIdToShow) {
         // Hide typing app if not hero and not practice itself
    }

    const targetElement = document.getElementById(sectionIdToShow);
    if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    updateActiveNavLinkUI(sectionIdToShow);
     // Close mobile nav if open
    if (DOMElements.mainNav.classList.contains('mobile-nav-active')) {
        DOMElements.mainNav.classList.remove('mobile-nav-active');
    }
}


function populateDrillSelectorsUI(drillData, drillTypeSelectElement, drillsGridContainerElement) {
    drillTypeSelectElement.innerHTML = ''; // Clear existing options in dropdown
    drillsGridContainerElement.innerHTML = ''; // Clear existing cards

    Object.keys(drillData).forEach(drillKey => {
        const drill = drillData[drillKey];
        // Populate dropdown
        const option = document.createElement('option');
        option.value = drillKey;
        option.textContent = drill.name;
        drillTypeSelectElement.appendChild(option);

        // Populate grid cards
        const drillCard = document.createElement('div');
        drillCard.className = 'drill-card';
        drillCard.innerHTML = `
            <h4>${drill.name}</h4>
            <p>${drill.description}</p>
            <button class="btn btn-secondary btn-sm start-drill-btn" data-drill="${drillKey}"><i class="fas fa-play"></i> Start Drill</button>
        `;
        drillsGridContainerElement.appendChild(drillCard);
    });
}

function toggleDrillSelectorUI(show) {
    if (DOMElements.drillSelectorWrapper) {
        DOMElements.drillSelectorWrapper.style.display = show ? 'inline-block' : 'none';
    }
    if (DOMElements.difficultySelect) {
        DOMElements.difficultySelect.style.display = show ? 'none' : 'inline-block';
    }
}

function updateExerciseTitleUI(title) {
    if (DOMElements.currentExerciseTitle) {
        DOMElements.currentExerciseTitle.textContent = title;
    }
}

function displayResultsUI(charPerformanceData, problemKeyData) {
    // Character Accuracy List
    DOMElements.characterStatsList.innerHTML = '';
    if (charPerformanceData.length === 0) {
        DOMElements.characterStatsList.innerHTML = `<div class="detail-item">No character data from this session.</div>`;
    } else {
        charPerformanceData.forEach(item => {
            const li = document.createElement('div');
            li.className = 'detail-item';
            const charDisplay = item.char === ' ' ? "'Space'" : item.char === '\n' ? "'Enter'" : `'${item.char}'`;
            li.innerHTML = `<span class="detail-key">${charDisplay}</span> <span class="detail-value">${item.accuracy.toFixed(1)}% (${item.correct}/${item.total})</span>`;
            DOMElements.characterStatsList.appendChild(li);
        });
    }

    // Problem Keys List
    DOMElements.problemKeysList.innerHTML = '';
    if (problemKeyData.length === 0) {
        DOMElements.problemKeysList.innerHTML = `<div class="detail-item">No specific error patterns or 100% accuracy!</div>`;
    } else {
        problemKeyData.forEach(item => {
            const li = document.createElement('div');
            li.className = 'detail-item';
            const expectedKeyDisp = item.expected === ' ' ? 'Space' : item.expected === '\n' ? 'Enter' : item.expected;
            const typedKeyDisp = item.typed === ' ' ? 'Space' : item.typed === '\n' ? 'Enter' : item.typed;
            li.innerHTML = `For <span class="detail-key">'${expectedKeyDisp}'</span> typed <span class="detail-key" style="background-color:var(--error);">'${typedKeyDisp}'</span>: <span class="detail-value">${item.count}x</span>`;
            DOMElements.problemKeysList.appendChild(li);
        });
    }

    if (DOMElements.resultsSection) DOMElements.resultsSection.style.display = 'block';
}


function renderProgressHistoryTableUI(historyData) {
    if (!DOMElements.progressHistoryTableBody) return;
    DOMElements.progressHistoryTableBody.innerHTML = '';
    
    if (historyData.length === 0) {
        DOMElements.progressHistoryTableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No history yet. Complete some typing sessions!</td></tr>';
        return;
    }

    historyData.forEach(item => { // Assuming historyData is already reversed (newest first) if needed
        const row = DOMElements.progressHistoryTableBody.insertRow();
        row.insertCell().textContent = new Date(item.date).toLocaleDateString('en-US', { year: '2-digit', month: 'short', day: 'numeric', hour:'2-digit', minute:'2-digit' });
        row.insertCell().textContent = item.mode ? (item.mode.charAt(0).toUpperCase() + item.mode.slice(1)) : 'N/A';
        row.insertCell().textContent = item.difficulty ? (item.difficulty.charAt(0).toUpperCase() + item.difficulty.slice(1)) : 'N/A';
        row.insertCell().textContent = item.wpm;
        row.insertCell().textContent = `${item.accuracy}%`;
        row.insertCell().textContent = item.errors;
        row.insertCell().textContent = item.textLength || 'N/A';
    });
}

function applyDarkModeStylesUI(isDarkMode) {
    document.body.classList.toggle('dark-mode', isDarkMode);
    if (DOMElements.darkModeToggle) {
        DOMElements.darkModeToggle.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }
}

function toggleMobileNavUI() {
    if (DOMElements.mainNav) {
        DOMElements.mainNav.classList.toggle('mobile-nav-active');
    }
}

// Ensure DOMElements is available when these functions are called.
// This can be done by calling cacheDOMElements() in main.js before using these UI functions.