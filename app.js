const timeDisplay = document.getElementById('time-display');
const statusText = document.getElementById('status-text');
const startBtn = document.getElementById('start-btn');
const startIcon = document.getElementById('start-icon');
const startText = document.getElementById('start-text');
const resetBtn = document.getElementById('reset-btn');
const progressCircle = document.querySelector('.timer-circle');
const modeBtns = document.querySelectorAll('.mode-btn');

const sidebarLinks = document.querySelectorAll('.sidebar-link');
const viewSections = document.querySelectorAll('.view-section');
const sidebarStartBtn = document.getElementById('sidebar-start-btn');
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const settingsContent = document.getElementById('settings-content');
const closeSettingsBtn = document.getElementById('close-settings');

const tasksContainer = document.getElementById('tasks-container');
const addTaskBtn = document.getElementById('add-task-btn');
const addTaskForm = document.getElementById('add-task-form');
const saveTaskBtn = document.getElementById('save-task-btn');
const cancelTaskBtn = document.getElementById('cancel-task-btn');
const newTaskText = document.getElementById('new-task-text');
const newTaskTag = document.getElementById('new-task-tag');
const searchInput = document.getElementById('search-input');
const activityGraphBars = document.getElementById('activity-graph-bars');

let timeLeft = 1500;
let totalTime = 1500;
let timerId = null;
let isRunning = false;
let currentMode = 'focus';
const circumference = 880;

let tasks = JSON.parse(localStorage.getItem('focusFlowTasks')) || [];
let stats = JSON.parse(localStorage.getItem('focusFlowStats')) || { focusMinutes: 0, completedTasks: 0, streak: 1, lastDate: new Date().toDateString() };

if(progressCircle) progressCircle.style.strokeDasharray = circumference;

function checkStreak() {
    const today = new Date().toDateString();
    if (stats.lastDate !== today) {
        stats.lastDate = today;
        stats.streak++;
        saveStats();
    }
}
checkStreak();

function saveStats() {
    localStorage.setItem('focusFlowStats', JSON.stringify(stats));
    updateDashboard();
}

function updateDashboard() {
    const hours = Math.floor(stats.focusMinutes / 60);
    const mins = stats.focusMinutes % 60;
    
    const dashTime = document.getElementById('dash-focus-time');
    if(dashTime) dashTime.innerHTML = `${hours}<span class="text-headline-md text-on-surface-variant">h</span> ${mins}<span class="text-headline-md text-on-surface-variant">m</span>`;
    
    const dashTasks = document.getElementById('dash-tasks-completed');
    if(dashTasks) dashTasks.textContent = stats.completedTasks;
    
    const dashStreak = document.getElementById('dash-streak');
    if(dashStreak) dashStreak.innerHTML = `${stats.streak} <span class="text-headline-md text-on-surface-variant">Days</span>`;

    const streakTitle = document.getElementById('streak-indicator-title');
    const streakDesc = document.getElementById('streak-indicator-desc');
    if(streakTitle) streakTitle.textContent = `${stats.streak} Day Streak`;
    if(streakDesc) streakDesc.textContent = `${hours > 0 ? hours + 'h ' : ''}${mins}m focused total`;
}

function updateGraph() {
    if (!activityGraphBars) return;
    
    const bars = activityGraphBars.children;
    const today = new Date().getDay();
    const mappedDay = today === 0 ? 6 : today - 1; 

    const heights = ['20%', '40%', '30%', '80%', '50%', '70%', '10%'];

    for(let i = 0; i < bars.length; i++) {
        bars[i].style.height = heights[i];
        if (i === mappedDay) {
            bars[i].className = 'w-full bg-primary rounded-t-lg transition-all duration-500';
        } else {
            bars[i].className = 'w-full bg-primary-fixed rounded-t-lg transition-all duration-500 opacity-80';
        }
    }
}

function setProgress(percent) {
    if(!progressCircle) return;
    const offset = circumference - (percent / 100) * circumference;
    progressCircle.style.strokeDashoffset = offset;
}

function updateDisplay() {
    if(!timeDisplay) return;
    const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const seconds = (timeLeft % 60).toString().padStart(2, '0');
    timeDisplay.textContent = `${minutes}:${seconds}`;
    const percent = (timeLeft / totalTime) * 100;
    setProgress(percent);
}

function toggleTimer() {
    if (isRunning) {
        clearInterval(timerId);
        isRunning = false;
        if(startIcon) startIcon.textContent = 'play_arrow';
        if(startText) startText.textContent = 'Start';
    } else {
        isRunning = true;
        if(startIcon) startIcon.textContent = 'pause';
        if(startText) startText.textContent = 'Pause';
        timerId = setInterval(() => {
            timeLeft--;
            updateDisplay();
            
            if(timeLeft % 60 === 0 && currentMode === 'focus' && totalTime !== timeLeft) {
                stats.focusMinutes++;
                saveStats();
            }

            if (timeLeft <= 0) {
                clearInterval(timerId);
                isRunning = false;
                if(startIcon) startIcon.textContent = 'play_arrow';
                if(startText) startText.textContent = 'Start';
                
                if (currentMode === 'focus') {
                    stats.focusMinutes++; 
                    saveStats();
                }
            }
        }, 1000);
    }
}

function resetTimer() {
    clearInterval(timerId);
    isRunning = false;
    timeLeft = totalTime;
    if(startIcon) startIcon.textContent = 'play_arrow';
    if(startText) startText.textContent = 'Start';
    updateDisplay();
}

modeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        modeBtns.forEach(b => {
            b.className = 'mode-btn px-md py-sm rounded-full text-label-md font-label-md text-on-surface-variant hover:text-on-surface transition-colors';
        });
        e.target.className = 'mode-btn px-md py-sm rounded-full bg-surface-bright text-primary font-bold shadow-sm transition-all';
        
        clearInterval(timerId);
        isRunning = false;
        if(startIcon) startIcon.textContent = 'play_arrow';
        if(startText) startText.textContent = 'Start';
        
        totalTime = parseInt(e.target.dataset.time);
        timeLeft = totalTime;
        if(statusText) statusText.textContent = e.target.dataset.label;
        currentMode = totalTime === 1500 || totalTime === 900 ? 'focus' : 'break';
        
        updateDisplay();
    });
});

if(sidebarStartBtn) {
    sidebarStartBtn.addEventListener('click', () => {
        const timerLink = document.querySelector('[data-target="view-timer"]');
        if(timerLink) timerLink.click();
        if(!isRunning) toggleTimer();
    });
}

sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        sidebarLinks.forEach(l => {
            l.className = 'sidebar-link flex items-center gap-sm px-sm py-sm rounded-lg hover:bg-surface-container-high transition-all text-on-surface-variant';
            const icon = l.querySelector('span');
            if(icon) icon.style.fontVariationSettings = "'FILL' 0";
        });
        
        const target = e.currentTarget;
        target.className = 'sidebar-link active flex items-center gap-sm px-sm py-sm rounded-lg bg-surface-container-high text-primary font-bold translate-x-1 transition-transform';
        const activeIcon = target.querySelector('span');
        if(activeIcon) activeIcon.style.fontVariationSettings = "'FILL' 1";

        const targetId = target.getAttribute('data-target');
        viewSections.forEach(section => {
            if (section.id === targetId) {
                section.classList.remove('hidden');
                section.classList.add('flex');
                if (targetId === 'view-timer') section.classList.add('grid');
            } else {
                section.classList.add('hidden');
                section.classList.remove('flex', 'grid');
            }
        });
        
        if(targetId === 'view-tasks') renderKanban();
        if(targetId === 'view-archive') renderArchive();
        if(targetId === 'view-calendar') renderCalendar();
        if(targetId === 'view-dashboard') updateGraph();
    });
});

if(settingsBtn) {
    settingsBtn.addEventListener('click', () => {
        if(!settingsModal) return;
        settingsModal.classList.remove('hidden');
        requestAnimationFrame(() => {
            settingsModal.classList.remove('opacity-0');
            if(settingsContent) {
                settingsContent.classList.remove('scale-95');
                settingsContent.classList.add('scale-100');
            }
        });
    });
}

if(closeSettingsBtn) {
    closeSettingsBtn.addEventListener('click', () => {
        if(!settingsModal) return;
        settingsModal.classList.add('opacity-0');
        if(settingsContent) {
            settingsContent.classList.remove('scale-100');
            settingsContent.classList.add('scale-95');
        }
        setTimeout(() => {
            settingsModal.classList.add('hidden');
        }, 300);
    });
}

function renderTasks(searchTerm = '') {
    if(!tasksContainer) return;
    tasksContainer.innerHTML = '';
    const activeTasks = tasks.filter(t => !t.completed && t.text.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if(activeTasks.length === 0) {
        tasksContainer.innerHTML = '<p class="text-on-surface-variant text-label-md text-center py-4">No matching intentions.</p>';
        return;
    }

    activeTasks.forEach(task => {
        const div = document.createElement('div');
        div.className = 'flex items-center gap-2 group';
        
        div.innerHTML = `
            <label class="flex-1 flex items-start gap-md p-sm rounded-xl hover:bg-surface-container-low transition-all cursor-pointer border border-transparent hover:border-surface-variant/50">
                <div class="mt-1 relative flex items-center justify-center shrink-0">
                    <input class="appearance-none w-5 h-5 border-2 border-outline-variant rounded-full checked:border-secondary checked:bg-secondary transition-colors" type="checkbox" onchange="toggleTask(${task.id})"/>
                    <span class="material-symbols-outlined absolute text-[16px] text-white opacity-0 pointer-events-none transition-opacity">check</span>
                </div>
                <div class="flex-1 overflow-hidden">
                    <p class="text-body-md font-body-md text-on-surface transition-all truncate group-hover:text-primary">${task.text}</p>
                    <p class="text-label-sm font-label-sm text-on-surface-variant mt-0.5 truncate transition-opacity">${task.tag}</p>
                </div>
            </label>
            <button onclick="deleteTask(${task.id})" class="opacity-0 group-hover:opacity-100 p-2 text-error hover:bg-error-container rounded-lg transition-all shrink-0 active:scale-95">
                <span class="material-symbols-outlined text-[20px]">delete</span>
            </button>
        `;
        tasksContainer.appendChild(div);
    });
}

function renderKanban(searchTerm = '') {
    const todoContainer = document.getElementById('kanban-todo');
    const progressContainer = document.getElementById('kanban-progress');
    const completedContainer = document.getElementById('kanban-completed');
    
    if(!todoContainer) return;
    
    todoContainer.innerHTML = ''; progressContainer.innerHTML = ''; completedContainer.innerHTML = '';
    
    const filteredTasks = tasks.filter(t => t.text.toLowerCase().includes(searchTerm.toLowerCase()));
    const completedTasks = filteredTasks.filter(t => t.completed);
    const pendingTasks = filteredTasks.filter(t => !t.completed);
    
    const inProgressTask = pendingTasks.length > 0 ? pendingTasks[0] : null;
    const todoTasks = pendingTasks.length > 1 ? pendingTasks.slice(1) : [];

    const todoCount = document.getElementById('kanban-todo-count');
    const progCount = document.getElementById('kanban-progress-count');
    const compCount = document.getElementById('kanban-completed-count');
    
    if(todoCount) todoCount.textContent = todoTasks.length;
    if(progCount) progCount.textContent = inProgressTask ? 1 : 0;
    if(compCount) compCount.textContent = completedTasks.length;

    todoTasks.forEach(task => {
        todoContainer.innerHTML += `
            <div class="bg-surface-container-low p-4 rounded-xl border border-surface-variant/50 cursor-pointer hover:border-primary/50 transition-colors flex justify-between items-start group">
                <div>
                    <h4 class="font-bold text-on-surface group-hover:text-primary transition-colors">${task.text}</h4>
                    <p class="text-label-sm text-on-surface-variant mt-1">${task.tag}</p>
                </div>
                <button onclick="toggleTask(${task.id})" class="text-outline hover:text-secondary"><span class="material-symbols-outlined">radio_button_unchecked</span></button>
            </div>
        `;
    });

    if (inProgressTask) {
        progressContainer.innerHTML = `
            <div class="bg-primary-fixed/20 p-4 rounded-xl border border-primary/30 flex justify-between items-start">
                <div>
                    <h4 class="font-bold text-primary">${inProgressTask.text}</h4>
                    <p class="text-label-sm text-primary/80 mt-1">In Focus Session</p>
                </div>
                <button onclick="toggleTask(${inProgressTask.id})" class="text-primary hover:text-secondary"><span class="material-symbols-outlined">radio_button_unchecked</span></button>
            </div>
        `;
    }

    completedTasks.forEach(task => {
        completedContainer.innerHTML += `
            <div class="bg-surface-container-low p-4 rounded-xl border border-surface-variant/50 flex justify-between items-start">
                <div>
                    <h4 class="font-bold text-on-surface line-through">${task.text}</h4>
                    <p class="text-label-sm text-on-surface-variant mt-1">Completed</p>
                </div>
                <button onclick="toggleTask(${task.id})" class="text-secondary"><span class="material-symbols-outlined">check_circle</span></button>
            </div>
        `;
    });
}

function renderArchive() {
    const archiveContainer = document.getElementById('archive-list');
    if(!archiveContainer) return;
    archiveContainer.innerHTML = '';
    
    const completedTasks = tasks.filter(t => t.completed);
    
    if(completedTasks.length === 0) {
        archiveContainer.innerHTML = '<p class="text-on-surface-variant col-span-2">Your archive is empty.</p>';
        return;
    }
    
    completedTasks.forEach(task => {
        archiveContainer.innerHTML += `
            <div class="bg-surface-container-lowest rounded-2xl p-6 ambient-shadow border border-surface-variant/20 flex flex-col gap-4">
                <div class="flex justify-between items-start">
                    <div class="w-12 h-12 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center">
                        <span class="material-symbols-outlined">task_alt</span>
                    </div>
                    <button onclick="deleteTask(${task.id})" class="text-error hover:underline text-label-sm">Delete Forever</button>
                </div>
                <div>
                    <h3 class="text-headline-md text-on-surface line-through">${task.text}</h3>
                    <p class="text-body-md text-on-surface-variant mt-1">Tag: ${task.tag}</p>
                </div>
            </div>
        `;
    });
}

function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    const title = document.getElementById('calendar-month-year');
    if(!grid || !title) return;
    
    const date = new Date();
    title.textContent = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = date.getDate();
    
    grid.innerHTML = '';
    
    for(let i = 0; i < firstDay; i++) {
        grid.innerHTML += `<div class="border-r border-b border-surface-variant p-2 opacity-50 bg-surface-container-lowest"></div>`;
    }
    
    for(let i = 1; i <= daysInMonth; i++) {
        let isToday = i === today;
        let cellClass = isToday ? 'border-b border-surface-variant p-2 bg-surface-container-low' : 'border-r border-b border-surface-variant p-2 bg-surface-container-lowest';
        let numClass = isToday ? 'text-label-sm text-primary font-bold mb-1' : 'text-label-sm text-on-surface-variant mb-1';
        
        let marker = '';
        if(isToday && stats.focusMinutes > 0) {
            marker = `<div class="bg-secondary-container text-on-secondary-container text-xs rounded p-1 truncate">Focused</div>`;
        }
        
        grid.innerHTML += `
            <div class="${cellClass}">
                <div class="${numClass}">${i}</div>
                ${marker}
            </div>
        `;
    }
}

window.toggleTask = function(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        if(task.completed) {
            stats.completedTasks++;
        } else {
            stats.completedTasks = Math.max(0, stats.completedTasks - 1);
        }
        saveStats();
        localStorage.setItem('focusFlowTasks', JSON.stringify(tasks));
        if(searchInput) {
            renderTasks(searchInput.value);
            renderKanban(searchInput.value);
        } else {
            renderTasks();
            renderKanban();
        }
        renderArchive();
    }
};

window.deleteTask = function(id) {
    const task = tasks.find(t => t.id === id);
    if(task && task.completed) {
        stats.completedTasks = Math.max(0, stats.completedTasks - 1);
        saveStats();
    }
    tasks = tasks.filter(t => t.id !== id);
    localStorage.setItem('focusFlowTasks', JSON.stringify(tasks));
    if(searchInput) {
        renderTasks(searchInput.value);
        renderKanban(searchInput.value);
    } else {
        renderTasks();
        renderKanban();
    }
    renderArchive();
};

window.resetData = function() {
    if(confirm('Are you sure you want to reset all data?')) {
        tasks = [];
        stats = { focusMinutes: 0, completedTasks: 0, streak: 1, lastDate: new Date().toDateString() };
        saveStats();
        localStorage.setItem('focusFlowTasks', JSON.stringify(tasks));
        if(closeSettingsBtn) closeSettingsBtn.click();
        location.reload();
    }
}

if(addTaskBtn) {
    addTaskBtn.addEventListener('click', () => {
        if(!addTaskForm || !newTaskText) return;
        addTaskForm.classList.remove('hidden');
        addTaskForm.classList.add('flex');
        newTaskText.focus();
    });
}

if(cancelTaskBtn) {
    cancelTaskBtn.addEventListener('click', () => {
        if(!addTaskForm || !newTaskText || !newTaskTag) return;
        addTaskForm.classList.add('hidden');
        addTaskForm.classList.remove('flex');
        newTaskText.value = '';
        newTaskTag.value = '';
    });
}

if(saveTaskBtn) {
    saveTaskBtn.addEventListener('click', () => {
        if(!newTaskText || !newTaskTag) return;
        const text = newTaskText.value.trim();
        const tag = newTaskTag.value.trim() || 'Focus Task';
        
        if (text) {
            tasks.unshift({
                id: Date.now(),
                text: text,
                tag: tag,
                completed: false
            });
            localStorage.setItem('focusFlowTasks', JSON.stringify(tasks));
            if(searchInput) {
                renderTasks(searchInput.value);
                renderKanban(searchInput.value);
            } else {
                renderTasks();
                renderKanban();
            }
            if(cancelTaskBtn) cancelTaskBtn.click();
        }
    });
}

if(newTaskText) newTaskText.addEventListener('keypress', (e) => { if (e.key === 'Enter' && saveTaskBtn) saveTaskBtn.click(); });
if(newTaskTag) newTaskTag.addEventListener('keypress', (e) => { if (e.key === 'Enter' && saveTaskBtn) saveTaskBtn.click(); });

if(startBtn) startBtn.addEventListener('click', toggleTimer);
if(resetBtn) resetBtn.addEventListener('click', resetTimer);

if(searchInput) {
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value;
        renderTasks(term);
        renderKanban(term);
    });
}

updateDisplay();
updateDashboard();
updateGraph();
renderTasks();