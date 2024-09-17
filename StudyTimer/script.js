let timer;
let startTime;
let pausedTime = 0;
let totalTime;
let isFocusMode = true;
let isRunning = false;
let todayMinutes = 0;
let alertAudio;
const timerDisplay = document.querySelector('.timer');
const modeDisplay = document.querySelector('.mode');
const startStopButton = document.getElementById('startStop');
const resetButton = document.getElementById('reset');
const focusTimeInput = document.getElementById('focusTime');
const breakTimeInput = document.getElementById('breakTime');
const historyTable = document.getElementById('history');
const progressCircle = document.querySelector('.timer-progress');
const notesInput = document.getElementById('notes');
const saveNotesButton = document.getElementById('saveNotes');
const clearDataButton = document.getElementById('clearData');

document.addEventListener('DOMContentLoaded', () => {
    alertAudio = new Audio('../Media/alert.mp3');
});

function startTimer() {
    if (!isRunning) {
        isRunning = true;
        startStopButton.textContent = 'PAUSE';
        startTime = Date.now() - pausedTime;
        timer = requestAnimationFrame(updateTimer);
    } else {
        isRunning = false;
        startStopButton.textContent = 'RESUME';
        pausedTime = Date.now() - startTime;
        cancelAnimationFrame(timer);
    }
    saveState();
}

function resetTimer() {
    cancelAnimationFrame(timer);
    isRunning = false;
    startStopButton.textContent = 'START';
    pausedTime = 0;
    setInitialTime();
    saveState();
}

function setInitialTime() {
    cancelAnimationFrame(timer);
    isRunning = false;
    startStopButton.textContent = 'START';
    pausedTime = 0;
    
    if (isFocusMode) {
        totalTime = focusTimeInput.value * 60 * 1000;
        modeDisplay.textContent = 'FOCUS';
    } else {
        totalTime = breakTimeInput.value * 60 * 1000;
        modeDisplay.textContent = 'BREAK';
    }
    
    updateTimerDisplay(totalTime);
    updateProgressCircle(totalTime, totalTime);
    saveState();
}

function updateTimer() {
    if (isRunning) {
        const currentTime = Date.now();
        const elapsedTime = currentTime - startTime;
        const remainingTime = Math.max(totalTime - elapsedTime, 0);

        if (remainingTime > 0) {
            updateTimerDisplay(remainingTime);
            updateProgressCircle(remainingTime, totalTime);
            
            if (isFocusMode && Math.floor(elapsedTime / 60000) > Math.floor((elapsedTime - 1000) / 60000)) {
                todayMinutes++;
                updateHistoryTable();
                saveState();
            }
            
            timer = requestAnimationFrame(updateTimer);
        } else {
            if (isFocusMode) {
                addToHistory();
            }
            playAlertSound();
            isFocusMode = !isFocusMode;
            setInitialTime();
        }
    }
}

function playAlertSound() {
    alertAudio.play();
}

function updateTimerDisplay(remainingTime) {
    const minutes = Math.floor(remainingTime / 60000);
    const seconds = Math.floor((remainingTime % 60000) / 1000);
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function updateProgressCircle(remainingTime, totalTime) {
    const progress = ((totalTime - remainingTime) / totalTime) * 100;
    progressCircle.style.setProperty('--progress', `${progress}%`);
}


function addToHistory() {
    const today = new Date().toLocaleDateString('en-CA');
    let historyData = JSON.parse(localStorage.getItem('pomodoroHistory')) || [];
    let todayEntry = historyData.find(entry => entry.date === today);
    
    if (todayEntry) {
        todayEntry.minutes = todayMinutes;
        todayEntry.notes = notesInput.value;
    } else {
        historyData.push({ date: today, minutes: todayMinutes, notes: notesInput.value });
    }

    // Keep only the last 7 days of data
    historyData = historyData.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 7);

    localStorage.setItem('pomodoroHistory', JSON.stringify(historyData));
    updateHistoryTable();
}

function updateHistoryTable() {
    const historyData = JSON.parse(localStorage.getItem('pomodoroHistory')) || [];
    const today = new Date().toLocaleDateString('en-CA');
    historyTable.innerHTML = '<tr><th>Date</th><th>Minutes Completed</th><th>Notes</th></tr>';
    
    // Sort the history data by date in descending order
    historyData.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Add today's entry first
    const todayRow = historyTable.insertRow(1);
    todayRow.insertCell(0).textContent = today;
    todayRow.insertCell(1).textContent = todayMinutes;
    const todayNotesCell = todayRow.insertCell(2);
    todayNotesCell.textContent = notesInput.value;

    // Add previous days
    historyData.forEach(entry => {
        if (entry.date !== today) {
            const row = historyTable.insertRow(-1);
            row.insertCell(0).textContent = entry.date;
            row.insertCell(1).textContent = entry.minutes;
            row.insertCell(2).textContent = entry.notes;
        }
    });
}

function saveNotes() {
    addToHistory();
    alert('Notes saved successfully!');
    saveState();
}

function checkDateChange() {
    const today = new Date().toLocaleDateString('en-CA');
    const lastDate = localStorage.getItem('lastDate');
    
    if (lastDate && lastDate !== today) {
        addToHistory(); 
        todayMinutes = 0; 
        notesInput.value = ''; 
        timeLeft = 0; 
        isRunning = false; 
        updateTimerDisplay();
        updateProgressCircle();
        startStopButton.textContent = 'START';
    }
    
    localStorage.setItem('lastDate', today);
}

function clearAllData() {
    if (confirm("Are you sure you want to clear all data? This action cannot be undone.")) {
        localStorage.removeItem('pomodoroHistory');
        localStorage.removeItem('lastDate');
        localStorage.removeItem('pomodoroState');
        todayMinutes = 0;
        notesInput.value = '';
        updateHistoryTable();
        setInitialTime();
    }
}

function saveState() {
    const state = {
        timeLeft,
        totalTime,
        isFocusMode,
        isRunning,
        todayMinutes,
        focusTime: focusTimeInput.value,
        breakTime: breakTimeInput.value,
        notes: notesInput.value,
        date: new Date().toLocaleDateString('en-CA')
    };
    localStorage.setItem('pomodoroState', JSON.stringify(state));
}

// Modify loadState function to work with the new timing system
function loadState() {
    const savedState = JSON.parse(localStorage.getItem('pomodoroState'));
    const today = new Date().toLocaleDateString('en-CA');
    
    if (savedState && savedState.date === today) {
        totalTime = savedState.totalTime;
        pausedTime = savedState.timeLeft;
        isFocusMode = savedState.isFocusMode;
        isRunning = savedState.isRunning;
        todayMinutes = savedState.todayMinutes;
        focusTimeInput.value = savedState.focusTime;
        breakTimeInput.value = savedState.breakTime;
        notesInput.value = savedState.notes;

        updateTimerDisplay(pausedTime);
        updateProgressCircle(pausedTime, totalTime);
        modeDisplay.textContent = isFocusMode ? 'FOCUS' : 'BREAK';
        startStopButton.textContent = isRunning ? 'PAUSE' : 'START';
        
        if (isRunning) {
            startTime = Date.now() - (totalTime - pausedTime);
            timer = requestAnimationFrame(updateTimer);
        }
    } else {
        todayMinutes = 0;
        notesInput.value = '';
        setInitialTime();
    }
}

startStopButton.addEventListener('click', startTimer);
resetButton.addEventListener('click', resetTimer);
focusTimeInput.addEventListener('change', setInitialTime);
breakTimeInput.addEventListener('change', setInitialTime);
saveNotesButton.addEventListener('click', saveNotes);
clearDataButton.addEventListener('click', clearAllData);

checkDateChange();
loadState();
updateHistoryTable();
