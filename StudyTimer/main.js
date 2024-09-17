let timer;
let timeLeft;
let totalTime;
let isFocusMode = true;
let isRunning = false;
let todayMinutes = 0;
let alertAudio;
let startTime;
let lastMinuteChecked = 0;  // New variable to track the last minute we checked

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
        startTime = Date.now();  
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
    clearInterval(timer);
    isRunning = false;
    startStopButton.textContent = 'START';
    
    if (isFocusMode) {
        timeLeft = focusTimeInput.value * 60;
        totalTime = timeLeft;
        modeDisplay.textContent = 'FOCUS';
    } else {
        timeLeft = breakTimeInput.value * 60;
        totalTime = timeLeft;
        modeDisplay.textContent = 'BREAK';
    }
    
    updateTimerDisplay();
    updateProgressCircle();
    saveState();
}

function updateTimer() {
    const currentTime = Date.now();
    const elapsedTime = Math.floor((currentTime - startTime) / 1000);  
    const newTimeLeft = totalTime - elapsedTime;
    
    if (newTimeLeft > 0) {
        timeLeft = newTimeLeft;
        updateTimerDisplay();
        updateProgressCircle();
        
        // Check if we've entered a new minute
        const currentMinute = Math.floor((totalTime - timeLeft) / 60);
        if (isFocusMode && currentMinute > lastMinuteChecked) {
            todayMinutes += currentMinute - lastMinuteChecked;
            lastMinuteChecked = currentMinute;
            updateHistoryTable();
            saveState();
        }
    } else {
        clearInterval(timer);
        if (isFocusMode) {
            // Add any remaining seconds as a fraction of a minute
            const remainingSeconds = totalTime % 60;
            todayMinutes += remainingSeconds / 60;
            addToHistory();
        }
        playAlertSound();
        isFocusMode = !isFocusMode;
        setInitialTime();
        isRunning = false;
        startStopButton.textContent = 'START';
        lastMinuteChecked = 0;  // Reset for the next session
    }
}

function playAlertSound() {
    alertAudio.play();
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function updateProgressCircle() {
    const progress = ((totalTime - timeLeft) / totalTime) * 100;
    progressCircle.style.setProperty('--progress', `${progress}%`);
}

function addToHistory() {
    const today = new Date().toLocaleDateString('en-CA');
    let historyData = JSON.parse(localStorage.getItem('pomodoroHistory')) || [];
    let todayEntry = historyData.find(entry => entry.date === today);
    
    if (todayEntry) {
        todayEntry.minutes = parseFloat(todayEntry.minutes) + parseFloat(todayMinutes);
        todayEntry.notes = notesInput.value;
    } else {
        historyData.push({ date: today, minutes: parseFloat(todayMinutes), notes: notesInput.value });
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
    todayRow.insertCell(1).textContent = todayMinutes.toFixed(2);  // Display with 2 decimal places
    const todayNotesCell = todayRow.insertCell(2);
    todayNotesCell.textContent = notesInput.value;

    // Add previous days
    historyData.forEach(entry => {
        if (entry.date !== today) {
            const row = historyTable.insertRow(-1);
            row.insertCell(0).textContent = entry.date;
            row.insertCell(1).textContent = parseFloat(entry.minutes).toFixed(2);  // Display with 2 decimal places
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

function loadState() {
    const savedState = JSON.parse(localStorage.getItem('pomodoroState'));
    const today = new Date().toLocaleDateString('en-CA');
    
    if (savedState && savedState.date === today) {
        timeLeft = savedState.timeLeft;
        totalTime = savedState.totalTime;
        isFocusMode = savedState.isFocusMode;
        isRunning = savedState.isRunning;
        todayMinutes = savedState.todayMinutes;
        focusTimeInput.value = savedState.focusTime;
        breakTimeInput.value = savedState.breakTime;
        notesInput.value = savedState.notes;

        updateTimerDisplay();
        updateProgressCircle();
        modeDisplay.textContent = isFocusMode ? 'FOCUS' : 'BREAK';
        startStopButton.textContent = isRunning ? 'PAUSE' : 'START';
        
        if (isRunning) {
            timer = setInterval(updateTimer, 1000);
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
