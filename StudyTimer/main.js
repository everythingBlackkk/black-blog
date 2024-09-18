// Constants and Variables
const WEEK_DAYS = 7;
let timer;
let timeLeft;
let totalTime;
let isFocusMode = true;
let isRunning = false;
let todayMinutes = 0;
let startTime;
let lastMinuteChecked = 0;

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
const clearDataButton = document.getElementById('clearData');


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

function clearAllData() {
    if (confirm("هل أنت متأكد أنك تريد مسح جميع البيانات؟ لا يمكن التراجع عن هذا الإجراء.")) {
        localStorage.removeItem('pomodoroHistory');
        localStorage.removeItem('pomodoroState');
        todayMinutes = 0;
        lastMinuteChecked = 0;
        notesInput.value = '';
        setInitialTime();
        updateHistoryTable();
        saveState();
        alert('تم مسح جميع البيانات بنجاح.');
    }
}

function resetTimer() {
    clearInterval(timer);
    isRunning = false;
    startStopButton.textContent = 'START';
    setInitialTime();
    lastMinuteChecked = 0;
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

    if (isFocusMode) {
        const currentMinute = Math.floor((totalTime - timeLeft) / 60);
        if (currentMinute > lastMinuteChecked) {
            todayMinutes += currentMinute - lastMinuteChecked;
            lastMinuteChecked = currentMinute;
            saveState();
            updateHistoryTable();
        }
    }

    if (timeLeft === 0) {
        clearInterval(timer);
        if (isFocusMode) {
            // Add any remaining seconds
            todayMinutes += (totalTime % 60) / 60;
            saveState();
            updateHistoryTable();
        }
        isFocusMode = !isFocusMode;
        setInitialTime();
        isRunning = false;
        startStopButton.textContent = 'START';
        lastMinuteChecked = 0;
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
        lastUpdate: Date.now(),
        lastMinuteChecked
    };
    localStorage.setItem('pomodoroState', JSON.stringify(state));
}

function loadState() {
    const savedState = JSON.parse(localStorage.getItem('pomodoroState'));
    if (savedState) {
        ({timeLeft, totalTime, isFocusMode, isRunning, todayMinutes, startTime, lastMinuteChecked} = savedState);
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
    historyTable.innerHTML = '<tr><th>Date</th><th>Minute Completed</th><th>Note</th></tr>';
    
    history.forEach(entry => {
        const row = historyTable.insertRow(-1);
        row.insertCell(0).textContent = entry.date;
        row.insertCell(1).textContent = entry.minutes.toFixed(2);
        row.insertCell(2).textContent = entry.notes;
    });

    // Update today's minutes in the first row
    if (history.length > 0) {
        history[0].minutes = todayMinutes;
        localStorage.setItem('pomodoroHistory', JSON.stringify(history));
        historyTable.rows[1].cells[1].textContent = todayMinutes.toFixed(2);
    }
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
        lastMinuteChecked = 0;
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
clearDataButton.addEventListener('click', clearAllData); 

// Check for new day every minute
setInterval(checkAndAddNewDay, 60000);
