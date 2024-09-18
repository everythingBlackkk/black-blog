let timer;
let timeLeft;
let totalTime;
let isFocusMode = true;
let isRunning = false;
let todayMinutes = 0;
let alertAudio;
let startTime;
let lastMinuteChecked = 0;

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
        startTime = Date.now() - (totalTime - timeLeft) * 1000;
        timer = setInterval(updateTimer, 1000);
        // حفظ وقت البدء في التخزين المحلي
        localStorage.setItem('timerStartTime', startTime.toString());
    } else {
        isRunning = false;
        startStopButton.textContent = 'RESUME';
        clearInterval(timer);
        // إزالة وقت البدء من التخزين المحلي عند إيقاف المؤقت
        localStorage.removeItem('timerStartTime');
    }
    saveState();
}

function resetTimer() {
    clearInterval(timer);
    isRunning = false;
    startStopButton.textContent = 'START';
    setInitialTime();
    localStorage.removeItem('timerStartTime');
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
        
        // التحقق مما إذا دخلنا دقيقة جديدة
        const currentMinute = Math.floor((totalTime - timeLeft) / 60);
        if (isFocusMode && currentMinute > lastMinuteChecked) {
            const minutesAdded = currentMinute - lastMinuteChecked;
            todayMinutes += minutesAdded;
            lastMinuteChecked = currentMinute;
            updateHistoryTable();
            saveState();
        }
    } else {
        clearInterval(timer);
        if (isFocusMode) {
            // إضافة أي ثوانٍ متبقية كجزء من دقيقة
            const remainingSeconds = totalTime % 60;
            todayMinutes += remainingSeconds / 60;
            updateHistoryTable();
        }
        playAlertSound();
        isFocusMode = !isFocusMode;
        setInitialTime();
        isRunning = false;
        startStopButton.textContent = 'START';
        lastMinuteChecked = 0;  // إعادة تعيين للجلسة التالية
        localStorage.removeItem('timerStartTime');
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

function saveNotes() {
    const today = new Date().toLocaleDateString('en-CA');
    let historyData = JSON.parse(localStorage.getItem('pomodoroHistory')) || [];
    let todayEntry = historyData.find(entry => entry.date === today);
    
    if (todayEntry) {
        todayEntry.minutes = parseFloat(todayMinutes.toFixed(2));
        todayEntry.notes = notesInput.value;
    } else {
        historyData.push({ date: today, minutes: parseFloat(todayMinutes.toFixed(2)), notes: notesInput.value });
    }

    // الاحتفاظ فقط بآخر 7 أيام من البيانات
    historyData = historyData.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 7);

    localStorage.setItem('pomodoroHistory', JSON.stringify(historyData));
    updateHistoryTable();
    
    // مسح محتوى حقل الملاحظات بعد الحفظ
    notesInput.value = '';
    
    alert('تم حفظ الملاحظات بنجاح!');
    saveState();
}

function updateHistoryTable() {
    const historyData = JSON.parse(localStorage.getItem('pomodoroHistory')) || [];
    const today = new Date().toLocaleDateString('en-CA');
    historyTable.innerHTML = '<tr><th>Date</th><th>Total M </th><th>Notes</th></tr>';
    
    // ترتيب بيانات السجل حسب التاريخ بترتيب تنازلي
    historyData.sort((a, b) => new Date(b.date) - new Date(a.date));

    // إضافة سجل اليوم أولاً
    const todayRow = historyTable.insertRow(1);
    todayRow.insertCell(0).textContent = today;
    todayRow.insertCell(1).textContent = todayMinutes.toFixed(2);
    const todayNotesCell = todayRow.insertCell(2);
    todayNotesCell.textContent = historyData.find(entry => entry.date === today)?.notes || '';

    // إضافة الأيام السابقة
    historyData.forEach(entry => {
        if (entry.date !== today) {
            const row = historyTable.insertRow(-1);
            row.insertCell(0).textContent = entry.date;
            row.insertCell(1).textContent = entry.minutes.toFixed(2);
            row.insertCell(2).textContent = entry.notes;
        }
    });
}

function checkDateChange() {
    const today = new Date().toLocaleDateString('en-CA');
    const lastDate = localStorage.getItem('lastDate');
    
    if (lastDate && lastDate !== today) {
        saveNotes(); 
        todayMinutes = 0; 
        timeLeft = 0; 
        isRunning = false; 
        updateTimerDisplay();
        updateProgressCircle();
        startStopButton.textContent = 'START';
    }
    
    localStorage.setItem('lastDate', today);
}

function clearAllData() {
    if (confirm("هل أنت متأكد أنك تريد مسح جميع البيانات؟ لا يمكن التراجع عن هذا الإجراء.")) {
        localStorage.removeItem('pomodoroHistory');
        localStorage.removeItem('lastDate');
        localStorage.removeItem('pomodoroState');
        localStorage.removeItem('timerStartTime');
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

        updateTimerDisplay();
        updateProgressCircle();
        modeDisplay.textContent = isFocusMode ? 'FOCUS' : 'BREAK';
        startStopButton.textContent = isRunning ? 'PAUSE' : 'START';
        
        if (isRunning) {
            const savedStartTime = localStorage.getItem('timerStartTime');
            if (savedStartTime) {
                startTime = parseInt(savedStartTime);
                const currentTime = Date.now();
                const elapsedTime = Math.floor((currentTime - startTime) / 1000);
                timeLeft = Math.max(totalTime - elapsedTime, 0);
                
                if (timeLeft > 0) {
                    timer = setInterval(updateTimer, 1000);
                } else {
                    // إذا انتهى الوقت أثناء إغلاق المتصفح، قم بإعادة تعيين المؤقت
                    clearInterval(timer);
                    isRunning = false;
                    startStopButton.textContent = 'START';
                    isFocusMode = !isFocusMode;
                    setInitialTime();
                }
            } else {
                // إذا لم يتم العثور على وقت البدء، قم بإعادة تعيين الحالة
                isRunning = false;
                startStopButton.textContent = 'START';
            }
        }
    } else {
        todayMinutes = 0;
        setInitialTime();
    }
    updateHistoryTable();
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
