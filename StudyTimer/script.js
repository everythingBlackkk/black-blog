let timer;
let timeLeft;
let totalTime;
let isFocusMode = true;
let isRunning = false;
let todayMinutes = 0;
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

function startTimer() {
    if (!isRunning) {
        isRunning = true;
        startStopButton.textContent = 'PAUSE';
        timer = setInterval(updateTimer, 1000);
    } else {
        isRunning = false;
        startStopButton.textContent = 'RESUME';
        clearInterval(timer);
    }
}

function resetTimer() {
    clearInterval(timer);
    isRunning = false;
    startStopButton.textContent = 'START';
    setInitialTime();
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
}

function updateTimer() {
    if (timeLeft > 0) {
        timeLeft--;
        updateTimerDisplay();
        updateProgressCircle();
        if (isFocusMode && timeLeft % 60 === 0) {
            todayMinutes++;
            updateHistoryTable();
        }
    } else {
        clearInterval(timer);
        if (isFocusMode) {
            addToHistory();
        }
        isFocusMode = !isFocusMode;
        setInitialTime();
        isRunning = false;
        startStopButton.textContent = 'START';
    }
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
    const today = new Date().toISOString().split('T')[0];
    let historyData = JSON.parse(localStorage.getItem('pomodoroHistory')) || [];
    let todayEntry = historyData.find(entry => entry.date === today);
    
    if (todayEntry) {
        todayEntry.minutes = todayMinutes;
        todayEntry.notes = notesInput.value;
    } else {
        historyData.push({ date: today, minutes: todayMinutes, notes: notesInput.value });
    }

    historyData = historyData.slice(-7);

    localStorage.setItem('pomodoroHistory', JSON.stringify(historyData));
    updateHistoryTable();
}

function updateHistoryTable() {
    const historyData = JSON.parse(localStorage.getItem('pomodoroHistory')) || [];
    const today = new Date().toISOString().split('T')[0];
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
    notesInput.value = '';
}

function checkDateChange() {
    const today = new Date().toISOString().split('T')[0];
    const lastDate = localStorage.getItem('lastDate');
    
    if (lastDate && lastDate !== today) {
        addToHistory();
        todayMinutes = 0;
    }
    
    localStorage.setItem('lastDate', today);
}

function clearAllData() {
    if (confirm("Are you sure you want to clear all data? This action cannot be undone.")) {
        localStorage.removeItem('pomodoroHistory');
        localStorage.removeItem('lastDate');
        todayMinutes = 0;
        notesInput.value = '';
        updateHistoryTable();
    }
}

startStopButton.addEventListener('click', startTimer);
resetButton.addEventListener('click', resetTimer);
focusTimeInput.addEventListener('change', setInitialTime);
breakTimeInput.addEventListener('change', setInitialTime);
saveNotesButton.addEventListener('click', saveNotes);
clearDataButton.addEventListener('click', clearAllData);

// Load today's data if exists
const today = new Date().toISOString().split('T')[0];
const historyData = JSON.parse(localStorage.getItem('pomodoroHistory')) || [];
const todayEntry = historyData.find(entry => entry.date === today);
if (todayEntry) {
    todayMinutes = todayEntry.minutes;
    notesInput.value = todayEntry.notes;
}

checkDateChange();
updateHistoryTable();
setInitialTime();

// Add event listeners for nav items
// document.querySelectorAll('.nav-item').forEach(item => {
//     item.addEventListener('click', function(e) {
//         e.preventDefault();
//         document.querySelectorAll('.nav-item').forEach(navItem => navItem.classList.remove('active'));
//         this.classList.add('active');
//         // Here you can add logic to change the content based on the clicked nav item
//         console.log(`Navigating to ${this.textContent}`);
//     });
// });