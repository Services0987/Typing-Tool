// js/data.js

const DB_NAME = 'TypeCrusherDB';
const DB_VERSION = 1;
const HISTORY_STORE_NAME = 'sessionHistory';
const CHAR_PERF_STORE_NAME = 'charPerformance'; // For cumulative character performance

let db; // Will hold the IndexedDB database instance

// --- IndexedDB Utility Functions ---
function openDB() {
    return new Promise((resolve, reject) => {
        if (db) {
            resolve(db);
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            console.error("IndexedDB error:", event.target.error);
            reject("IndexedDB error: " + event.target.errorCode);
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            console.log("IndexedDB opened successfully.");
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            console.log("IndexedDB upgrade needed.");
            const tempDb = event.target.result;

            if (!tempDb.objectStoreNames.contains(HISTORY_STORE_NAME)) {
                const historyStore = tempDb.createObjectStore(HISTORY_STORE_NAME, { keyPath: 'id', autoIncrement: true });
                historyStore.createIndex('date', 'date', { unique: false });
                historyStore.createIndex('wpm', 'wpm', { unique: false });
                historyStore.createIndex('mode', 'mode', { unique: false });
                console.log(`Object store '${HISTORY_STORE_NAME}' created.`);
            }

            if (!tempDb.objectStoreNames.contains(CHAR_PERF_STORE_NAME)) {
                // Using character itself as keyPath for easy updates
                const charPerfStore = tempDb.createObjectStore(CHAR_PERF_STORE_NAME, { keyPath: 'char' });
                charPerfStore.createIndex('accuracy', 'accuracy', {unique: false }); // Example index
                console.log(`Object store '${CHAR_PERF_STORE_NAME}' created.`);
            }
        };
    });
}

async function addToStore(storeName, data) {
    try {
        const currentDb = await openDB();
        const transaction = currentDb.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.add(data);

        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result); // Returns the key of the new record
            request.onerror = (event) => {
                console.error(`Error adding to ${storeName}:`, event.target.error);
                reject(event.target.error);
            };
        });
    } catch (error) {
        console.error("DB transaction error (add):", error);
        return Promise.reject(error);
    }
}

async function updateInStore(storeName, data) {
    try {
        const currentDb = await openDB();
        const transaction = currentDb.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put(data); // put will add or update

        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = (event) => {
                console.error(`Error updating in ${storeName}:`, event.target.error);
                reject(event.target.error);
            };
        });
    } catch (error) {
        console.error("DB transaction error (update):", error);
        return Promise.reject(error);
    }
}


async function getAllFromStore(storeName) {
    try {
        const currentDb = await openDB();
        const transaction = currentDb.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = (event) => {
                console.error(`Error getting all from ${storeName}:`, event.target.error);
                reject(event.target.error);
            };
        });
    } catch (error) {
        console.error("DB transaction error (getAll):", error);
        return Promise.reject(error);
    }
}

async function getFromStore(storeName, key) {
    try {
        const currentDb = await openDB();
        const transaction = currentDb.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(key);

        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = (event) => {
                console.error(`Error getting from ${storeName} with key ${key}:`, event.target.error);
                reject(event.target.error);
            };
        });
    } catch (error) {
        console.error("DB transaction error (get):", error);
        return Promise.reject(error);
    }
}


async function clearStore(storeName) {
    try {
        const currentDb = await openDB();
        const transaction = currentDb.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();

        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                console.log(`Store '${storeName}' cleared.`);
                resolve();
            };
            request.onerror = (event) => {
                console.error(`Error clearing store ${storeName}:`, event.target.error);
                reject(event.target.error);
            };
        });
    } catch (error) {
        console.error("DB transaction error (clear):", error);
        return Promise.reject(error);
    }
}


// --- localStorage Utility Functions ---
function getFromLocalStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Error getting item ${key} from localStorage:`, error);
        return defaultValue;
    }
}

function saveToLocalStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error saving item ${key} to localStorage:`, error);
        if (error.name === 'QuotaExceededError') {
            alert("Warning: Local storage quota exceeded. Some data might not be saved. Try clearing some history.");
        }
    }
}

// --- Application Specific Data Functions ---

// Load all persistent data on app start
async function loadAllProgressData() {
    // Initialize DB first
    await openDB(); 

    const history = await getAllFromStore(HISTORY_STORE_NAME);
    
    const storedCharPerfArray = await getAllFromStore(CHAR_PERF_STORE_NAME);
    const charPerfObject = {};
    storedCharPerfArray.forEach(item => {
        charPerfObject[item.char] = { // Reconstruct the object from array of {char: 'a', data: {...}}
            correct: item.correct,
            incorrect: item.incorrect,
            total: item.total,
            errorsMade: item.errorsMade
        };
    });

    const pbWPM = getFromLocalStorage(LS_PERSONAL_BEST_WPM_KEY, 0);
    const darkMode = getFromLocalStorage('darkMode', false); // Example for settings

    return {
        progressHistory: history || [],
        charPerformance: charPerfObject || {},
        personalBestWPM: parseInt(pbWPM, 10) || 0,
        settings: { darkMode }
    };
}

async function saveSessionResult(sessionData) {
    // sessionData = { date, mode, difficulty, wpm, accuracy, errors, textLength }
    try {
        await addToStore(HISTORY_STORE_NAME, sessionData);
        console.log("Session result saved to IndexedDB.");
    } catch (error) {
        console.error("Failed to save session result to IndexedDB:", error);
        // Fallback or further error handling could be added here
    }
}

async function saveCharPerformance(charPerfObject) {
    // charPerfObject = { 'a': { correct, incorrect, total, errorsMade: {'s': 1} }, ... }
    try {
        const currentDb = await openDB();
        const transaction = currentDb.transaction(CHAR_PERF_STORE_NAME, 'readwrite');
        const store = transaction.objectStore(CHAR_PERF_STORE_NAME);

        for (const charKey in charPerfObject) {
            if (charPerfObject.hasOwnProperty(charKey)) {
                const charData = charPerfObject[charKey];
                // IndexedDB needs a keyPath, so structure data as { char: 'a', correct: ..., ... }
                store.put({ 
                    char: charKey, 
                    correct: charData.correct,
                    incorrect: charData.incorrect,
                    total: charData.total,
                    errorsMade: charData.errorsMade 
                });
            }
        }
        return new Promise((resolve, reject) => {
            transaction.oncomplete = () => {
                console.log("Character performance updated in IndexedDB.");
                resolve();
            };
            transaction.onerror = (event) => {
                console.error("Error updating character performance in IndexedDB:", event.target.error);
                reject(event.target.error);
            };
        });
    } catch (error) {
        console.error("DB transaction error (saveCharPerformance):", error);
        return Promise.reject(error);
    }
}


async function clearAllPersistentData() {
    try {
        await clearStore(HISTORY_STORE_NAME);
        await clearStore(CHAR_PERF_STORE_NAME);
        localStorage.removeItem(LS_PERSONAL_BEST_WPM_KEY);
        // Potentially other localStorage items related to progress if any
        console.log("All persistent data cleared from IndexedDB and localStorage.");
        return true;
    } catch (error) {
        console.error("Failed to clear all persistent data:", error);
        return false;
    }
}

// Call openDB early to initialize the database connection when the script loads.
// This helps ensure 'db' is ready when other functions need it.
openDB().catch(err => console.error("Initial DB open failed:", err));

// Expose functions if using modules (not strictly necessary for single global scope in this setup, but good practice)
// window.dataStore = {
//     loadAllProgressData,
//     saveSessionResult,
//     saveCharPerformance,
//     clearAllPersistentData,
//     saveToLocalStorage,
//     getFromLocalStorage
// };