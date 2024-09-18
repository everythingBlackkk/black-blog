// Constants and Variables
const WEEK_DAYS = 7;
let timer;
let timeLeft;
let totalTime;
let isFocusMode = true;
let isRunning = false;
let todayMinutes = 0;
let startTime;

// DOM Elements
const timerDisplay = document.querySelector('.timer');
const modeDisplay = document.querySelector('.mode');
const startStopButton = document.getElementById('startStop');
const resetButton = document.getElementById('reset');
const focusTimeInput = document.getElementById('focusTime');
const breakTimeInput = document.getElementById('breakTime');
const historyTable = document.getElementById('history');
const notesInput = document.getElementById('notes');
const saveNotesButton = document.getElementById('saveNotes');

// Initialize
document.addEventListener('DOMContentLoaded', initialize);

function initialize() {
    loadState();
    updateTimerDisplay();
    updateHistoryTable();
    checkAndAddNewDay();
}

// Timer Functions
function startTimer() {
    if (!isRunning) {
        isRunning = true;
        startStopButton.textContent = 'PAUSE';
        startTime = Date.now() - (totalTime - timeLeft) * 1000;
        timer = setInterval(updateTimer, 1000);
    } else {
        isRunning = false;
        startStopButton.textContent = 'RESUME';
        clearInterval(timer);
    }
    saveState();
}

function resetTimer() {
    clearInterval(timer);
    isRunning = false;
    startStopButton.textContent = 'START';
    setInitialTime();
    saveState();
}

function setInitialTime() {
    timeLeft = (isFocusMode ? focusTimeInput.value : breakTimeInput.value) * 60;
    totalTime = timeLeft;
    modeDisplay.textContent = isFocusMode ? 'FOCUS' : 'BREAK';
    updateTimerDisplay();
}

function updateTimer() {
    const now = Date.now();
    const elapsed = Math.floor((now - startTime) / 1000);
    timeLeft = Math.max(totalTime - elapsed, 0);

    if (timeLeft === 0) {
        clearInterval(timer);
        if (isFocusMode) {
            todayMinutes += totalTime / 60;
            saveState();
            updateHistoryTable();
        }
        isFocusMode = !isFocusMode;
        setInitialTime();
        isRunning = false;
        startStopButton.textContent = 'START';
    }

    updateTimerDisplay();
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// State Management
function saveState() {
    const state = {
        timeLeft,
        totalTime,
        isFocusMode,
        isRunning,
        todayMinutes,
        focusTime: focusTimeInput.value,
        breakTime: breakTimeInput.value,
        startTime: startTime,
        lastUpdate: Date.now()
    };
    localStorage.setItem('pomodoroState', JSON.stringify(state));
}

function loadState() {
    const savedState = JSON.parse(localStorage.getItem('pomodoroState'));
    if (savedState) {
        ({timeLeft, totalTime, isFocusMode, isRunning, todayMinutes, startTime} = savedState);
        focusTimeInput.value = savedState.focusTime;
        breakTimeInput.value = savedState.breakTime;
        
        if (isRunning) {
            const now = Date.now();
            const elapsed = Math.floor((now - startTime) / 1000);
            timeLeft = Math.max(totalTime - elapsed, 0);
            if (timeLeft > 0) {
                timer = setInterval(updateTimer, 1000);
            } else {
                isRunning = false;
            }
        }
        
        modeDisplay.textContent = isFocusMode ? 'FOCUS' : 'BREAK';
        startStopButton.textContent = isRunning ? 'PAUSE' : 'START';
    } else {
        setInitialTime();
    }
}

// History Management
function updateHistoryTable() {
    let history = JSON.parse(localStorage.getItem('pomodoroHistory')) || [];
    historyTable.innerHTML = '<tr><th>Date</th><th>Minutessa Completed</th><th>Notes</th></tr>';
    
    history.forEach(entry => {
        const row = historyTable.insertRow(-1);
        row.insertCell(0).textContent = entry.date;
        row.insertCell(1).textContent = entry.minutes.toFixed(2);
        row.insertCell(2).textContent = entry.notes;
    });
}

function checkAndAddNewDay() {
    const today = new Date().toLocaleDateString('en-CA');
    let history = JSON.parse(localStorage.getItem('pomodoroHistory')) || [];
    
    if (history.length === 0 || history[0].date !== today) {
        history.unshift({date: today, minutes: 0, notes: ''});
        if (history.length > WEEK_DAYS) {
            history = history.slice(0, WEEK_DAYS);
        }
        localStorage.setItem('pomodoroHistory', JSON.stringify(history));
        todayMinutes = 0;
        saveState();
        updateHistoryTable();
    }
}

function saveNotes() {
    const notes = notesInput.value;
    let history = JSON.parse(localStorage.getItem('pomodoroHistory')) || [];
    if (history.length > 0) {
        history[0].notes = notes;
        history[0].minutes = todayMinutes;
        localStorage.setItem('pomodoroHistory', JSON.stringify(history));
        updateHistoryTable();
    }
    alert('Notes saved successfully!');
}

// Event Listeners
startStopButton.addEventListener('click', startTimer);
resetButton.addEventListener('click', resetTimer);
focusTimeInput.addEventListener('change', setInitialTime);
breakTimeInput.addEventListener('change', setInitialTime);
saveNotesButton.addEventListener('click', saveNotes);

// Check for new day every minute
setInterval(checkAndAddNewDay, 60000);
