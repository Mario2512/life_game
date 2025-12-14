// Life Game App - Main Application Logic

class LifeGameApp {
    constructor() {
        // Routine data
        this.routine = [
            { hora: "06:50", tarea: "Despertar", esfuerzo: 2 },
            { hora: "07:00", tarea: "Desayuno", esfuerzo: 1 },
            { hora: "10:30", tarea: "Almuerzo", esfuerzo: 1 },
            { hora: "15:00", tarea: "Comida", esfuerzo: 1 },
            { hora: "17:30", tarea: "Merienda", esfuerzo: 1 },
            { hora: "18:00", tarea: "Ejercicio", esfuerzo: 3 },
            { hora: "19:00", tarea: "Ducha", esfuerzo: 1 },
            { hora: "20:00", tarea: "Estudiar", esfuerzo: 3 },
            { hora: "21:30", tarea: "Cena", esfuerzo: 1 },
            { hora: "22:00", tarea: "Leer un libro", esfuerzo: 2 },
            { hora: "23:00", tarea: "Dormir", esfuerzo: 1 }
        ];

        // Store items
        this.store = {
            "Ver un capítulo de serie": 10,
            "Comer un postre": 20,
            "Jugar videojuegos 1 hora": 30
        };

        // Food quality points
        this.foodPoints = {
            sana: 5,
            neutra: 2,
            no_sana: 0
        };

        // Meals that require food quality selection
        this.meals = ["Desayuno", "Almuerzo", "Comida", "Merienda", "Cena"];

        // Current state
        this.currentPage = 'home';
        this.currentTask = null;
        this.currentRedeemItem = null;
        this.selectedFoodQuality = null;

        // Custom tasks state
        this.customTasks = [];
        this.editingTaskIndex = null;
        this.selectedEffort = 1;

        // Level system
        this.level = 1;
        this.xp = 0;
        this.xpForNextLevel = 100;

        // Theme
        this.isDarkMode = false;

        // Initialize
        this.init();
    }

    init() {
        // Load data from localStorage
        this.loadData();

        // Check if new month
        this.checkMonth();

        // Render initial UI
        this.renderTasks();
        this.renderStore();
        this.renderCalendar();
        this.updatePoints();
        this.updateProgress();
        this.updateProfileStats();
        this.updateLevel();

        // Start clock
        this.startClock();

        // Register service worker
        this.registerServiceWorker();
    }

    // Data Management
    loadData() {
        const defaultData = {
            points: 0,
            completedTasks: {},
            currentMonth: new Date().getMonth() + 1,
            history: {},
            customTasks: [],
            level: 1,
            xp: 0
        };

        const savedData = localStorage.getItem('lifeGameData');
        this.data = savedData ? JSON.parse(savedData) : defaultData;

        // Load custom tasks
        this.customTasks = this.data.customTasks || [];

        // Load level and XP
        this.level = this.data.level || 1;
        this.xp = this.data.xp || 0;
        this.xpForNextLevel = this.calculateXPForLevel(this.level);

        // Load theme
        this.isDarkMode = this.data.isDarkMode || false;
        if (this.isDarkMode) {
            document.body.classList.add('dark-mode');
            document.getElementById('themeIcon').textContent = '☀️';
        }
    }

    saveData() {
        localStorage.setItem('lifeGameData', JSON.stringify(this.data));
    }

    checkMonth() {
        const currentMonth = new Date().getMonth() + 1;
        if (this.data.currentMonth !== currentMonth) {
            console.log('New month detected, resetting points...');
            this.data.points = 0;
            this.data.completedTasks = {};
            this.data.currentMonth = currentMonth;
            this.saveData();
            this.showNotification('🔁 Nuevo mes! Puntos reiniciados');
        }
    }

    // Clock
    startClock() {
        const updateClock = () => {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            document.getElementById('clock').textContent = `${hours}:${minutes}:${seconds}`;
        };

        updateClock();
        setInterval(updateClock, 1000);
    }

    // Navigation
    navigateTo(page) {
        // Update pages
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById(`${page}Page`).classList.add('active');

        // Update nav items
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        document.getElementById(`nav${page.charAt(0).toUpperCase() + page.slice(1)}`).classList.add('active');

        this.currentPage = page;

        // Refresh calendar when navigating to it
        if (page === 'calendar') {
            this.renderCalendar();
        }

        // Refresh profile stats
        if (page === 'profile') {
            this.updateProfileStats();
        }

        // Refresh custom tasks
        if (page === 'customTasks') {
            this.renderCustomTasks();
        }
    }

    // Tasks
    renderTasks() {
        const taskList = document.getElementById('taskList');
        const today = this.getToday();
        const completedToday = this.data.completedTasks[today] || [];

        taskList.innerHTML = '';

        // Combine routine and custom tasks
        const allTasks = [...this.routine, ...this.customTasks];

        // Sort by time
        allTasks.sort((a, b) => a.hora.localeCompare(b.hora));

        allTasks.forEach((task, index) => {
            const isCompleted = completedToday.includes(task.tarea);

            const taskItem = document.createElement('div');
            taskItem.className = `task-item ${isCompleted ? 'completed' : ''}`;
            taskItem.onclick = () => this.toggleTask(task);

            // Effort dots
            const effortDots = Array(task.esfuerzo).fill(0).map(() =>
                '<div class="effort-dot"></div>'
            ).join('');

            // Check if it's a custom task
            const isCustom = this.customTasks.some(t => t.tarea === task.tarea && t.hora === task.hora);

            taskItem.innerHTML = `
                <div class="task-checkbox"></div>
                <div class="task-info">
                    <div class="task-time">${task.hora}</div>
                    <div class="task-name">${task.tarea}${isCustom ? ' ⚡' : ''}${task.isMeal ? ' 🍽️' : ''}</div>
                </div>
                <div class="task-effort">${effortDots}</div>
            `;

            taskList.appendChild(taskItem);
        });
    }

    toggleTask(task) {
        const today = this.getToday();
        const completedToday = this.data.completedTasks[today] || [];

        // Check if already completed
        if (completedToday.includes(task.tarea)) {
            this.showNotification('⚠️ Ya completaste esta tarea hoy');
            return;
        }

        // If it's a meal, show food quality modal
        if (this.meals.includes(task.tarea)) {
            this.currentTask = task;
            this.showFoodModal(task.tarea);
        } else {
            this.completeTask(task);
        }
    }

    completeTask(task, foodQuality = null) {
        const today = this.getToday();

        // Initialize arrays if needed
        if (!this.data.completedTasks[today]) {
            this.data.completedTasks[today] = [];
        }
        if (!this.data.history[today]) {
            this.data.history[today] = [];
        }

        // Calculate points
        let points = task.esfuerzo * 3;
        if (foodQuality) {
            points += this.foodPoints[foodQuality];
        }

        // Calculate XP (same as points for simplicity)
        let xpGained = points;

        // Update data
        this.data.completedTasks[today].push(task.tarea);
        this.data.history[today].push(task.tarea);
        this.data.points += points;

        // Add XP
        this.addXP(xpGained);

        // Save and update UI
        this.saveData();
        this.renderTasks();
        this.updatePoints();
        this.updateProgress();

        // Show celebration
        this.showNotification(`✅ ${task.tarea} completada! +${points} puntos, +${xpGained} XP`);
        this.createConfetti();
    }

    // Food Quality Modal
    showFoodModal(mealName) {
        document.getElementById('mealName').textContent = mealName.toLowerCase();
        document.getElementById('foodModal').classList.add('active');
        this.selectedFoodQuality = null;

        // Reset button selection
        document.querySelectorAll('.food-quality-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
    }

    selectFoodQuality(quality) {
        this.selectedFoodQuality = quality;

        // Update button selection
        document.querySelectorAll('.food-quality-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        event.target.closest('.food-quality-btn').classList.add('selected');

        // Complete task with food quality
        setTimeout(() => {
            this.completeTask(this.currentTask, quality);
            this.closeFoodModal();
        }, 300);
    }

    closeFoodModal() {
        document.getElementById('foodModal').classList.remove('active');
        this.currentTask = null;
        this.selectedFoodQuality = null;
    }

    // Store
    renderStore() {
        const storeGrid = document.getElementById('storeGrid');
        storeGrid.innerHTML = '';

        Object.entries(this.store).forEach(([item, cost]) => {
            const storeItem = document.createElement('div');
            storeItem.className = 'store-item';
            storeItem.onclick = () => this.showRedeemModal(item, cost);

            storeItem.innerHTML = `
                <div class="store-item-info">
                    <div class="store-item-name">${item}</div>
                    <div class="store-item-cost">
                        <span class="points">${cost}</span> puntos
                    </div>
                </div>
                <div style="font-size: 2rem;">🎁</div>
            `;

            storeGrid.appendChild(storeItem);
        });
    }

    showRedeemModal(item, cost) {
        if (this.data.points < cost) {
            this.showNotification('❌ No tienes suficientes puntos');
            return;
        }

        this.currentRedeemItem = { name: item, cost: cost };
        document.getElementById('redeemItemName').textContent = item;
        document.getElementById('redeemItemCost').textContent = cost;
        document.getElementById('redeemModal').classList.add('active');
    }

    confirmRedeem() {
        if (!this.currentRedeemItem) return;

        this.data.points -= this.currentRedeemItem.cost;
        this.saveData();
        this.updatePoints();

        this.showNotification(`🎉 ¡Canjeaste "${this.currentRedeemItem.name}"! Disfrútalo`);
        this.createConfetti();
        this.closeRedeemModal();
    }

    closeRedeemModal() {
        document.getElementById('redeemModal').classList.remove('active');
        this.currentRedeemItem = null;
    }

    // Calendar
    renderCalendar() {
        const calendarGrid = document.getElementById('calendarGrid');
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();

        calendarGrid.innerHTML = '';

        // Get all dates from history for current month
        const monthDates = Object.keys(this.data.history)
            .filter(date => {
                const [year, month] = date.split('-');
                return parseInt(month) === currentMonth && parseInt(year) === currentYear;
            })
            .sort()
            .reverse();

        if (monthDates.length === 0) {
            calendarGrid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📅</div>
                    <div class="empty-state-text">Aún no hay historial este mes</div>
                </div>
            `;
            return;
        }

        monthDates.forEach(date => {
            const tasks = this.data.history[date];
            const calendarDay = document.createElement('div');
            calendarDay.className = 'calendar-day';

            // Format date
            const dateObj = new Date(date + 'T00:00:00');
            const formattedDate = dateObj.toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            // Create task tags
            const taskTags = tasks.slice(0, 5).map(task =>
                `<span class="calendar-task-tag">${task}</span>`
            ).join('');

            const moreText = tasks.length > 5 ?
                `<span class="calendar-count">+${tasks.length - 5} más</span>` : '';

            calendarDay.innerHTML = `
                <div class="calendar-date">${formattedDate}</div>
                <div class="calendar-count" style="margin-bottom: 0.5rem;">
                    ${tasks.length} tarea${tasks.length !== 1 ? 's' : ''} completada${tasks.length !== 1 ? 's' : ''}
                </div>
                <div class="calendar-tasks">
                    ${taskTags}
                    ${moreText}
                </div>
            `;

            calendarGrid.appendChild(calendarDay);
        });
    }

    // UI Updates
    updatePoints() {
        document.getElementById('pointsValue').textContent = this.data.points;
    }

    updateProgress() {
        const today = this.getToday();
        const completedToday = this.data.completedTasks[today] || [];
        const total = this.routine.length + this.customTasks.length;
        const completed = completedToday.length;
        const percentage = total > 0 ? (completed / total) * 100 : 0;

        document.getElementById('progressText').textContent = `${completed}/${total}`;
        document.getElementById('progressFill').style.width = `${percentage}%`;
    }

    updateProfileStats() {
        const today = this.getToday();
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();

        let totalTasks = 0;
        Object.keys(this.data.history).forEach(date => {
            const [year, month] = date.split('-');
            if (parseInt(month) === currentMonth && parseInt(year) === currentYear) {
                totalTasks += this.data.history[date].length;
            }
        });

        document.getElementById('totalTasksCompleted').textContent = totalTasks;
    }

    // Utilities
    getToday() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            font-weight: 600;
            z-index: 10000;
            animation: slideDown 0.3s ease;
            max-width: 90%;
            text-align: center;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideUp 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    createConfetti() {
        const colors = [
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
        ];

        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.animationDelay = Math.random() * 0.5 + 's';

                document.body.appendChild(confetti);

                setTimeout(() => confetti.remove(), 3000);
            }, i * 30);
        }
    }

    // Data Management
    resetMonth() {
        if (confirm('¿Estás seguro de que quieres reiniciar el mes? Esto borrará todos los puntos y tareas completadas.')) {
            this.data.points = 0;
            this.data.completedTasks = {};
            this.saveData();

            this.renderTasks();
            this.updatePoints();
            this.updateProgress();
            this.updateProfileStats();

            this.showNotification('🔄 Mes reiniciado correctamente');
        }
    }

    exportData() {
        const dataStr = JSON.stringify(this.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `life-game-backup-${this.getToday()}.json`;
        link.click();

        URL.revokeObjectURL(url);
        this.showNotification('💾 Datos exportados correctamente');
    }

    importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);

                // Validate data structure
                if (importedData.points !== undefined && importedData.completedTasks && importedData.history) {
                    this.data = importedData;
                    this.saveData();

                    // Refresh UI
                    this.renderTasks();
                    this.renderCalendar();
                    this.updatePoints();
                    this.updateProgress();
                    this.updateProfileStats();

                    this.showNotification('📥 Datos importados correctamente');
                } else {
                    this.showNotification('❌ Archivo de datos inválido');
                }
            } catch (error) {
                this.showNotification('❌ Error al importar datos');
                console.error('Import error:', error);
            }
        };
        reader.readAsText(file);

        // Reset input
        event.target.value = '';
    }

    // Custom Tasks Management
    renderCustomTasks() {
        const customTasksList = document.getElementById('customTasksList');
        const emptyState = document.getElementById('emptyCustomTasks');
        const today = this.getToday();
        const completedToday = this.data.completedTasks[today] || [];

        if (this.customTasks.length === 0) {
            customTasksList.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        customTasksList.innerHTML = '';

        // Sort custom tasks by time
        const sortedTasks = [...this.customTasks].sort((a, b) => {
            return a.hora.localeCompare(b.hora);
        });

        sortedTasks.forEach((task, index) => {
            const originalIndex = this.customTasks.findIndex(t =>
                t.hora === task.hora && t.tarea === task.tarea
            );
            const isCompleted = completedToday.includes(task.tarea);

            const taskItem = document.createElement('div');
            taskItem.className = `task-item ${isCompleted ? 'completed' : ''}`;
            taskItem.style.position = 'relative';

            // Effort dots
            const effortDots = Array(task.esfuerzo).fill(0).map(() =>
                '<div class="effort-dot"></div>'
            ).join('');

            taskItem.innerHTML = `
                <div class="task-checkbox" onclick="app.toggleCustomTask(${originalIndex})"></div>
                <div class="task-info" onclick="app.toggleCustomTask(${originalIndex})">
                    <div class="task-time">${task.hora}</div>
                    <div class="task-name">${task.tarea}${task.isMeal ? ' 🍽️' : ''}</div>
                </div>
                <div class="task-effort">${effortDots}</div>
                <div style="display: flex; gap: 0.5rem; margin-left: 0.5rem;">
                    <button onclick="app.editCustomTask(${originalIndex}); event.stopPropagation();" 
                            style="background: var(--primary-gradient); border: none; color: white; padding: 0.5rem; border-radius: 8px; cursor: pointer; font-size: 1rem;">
                        ✏️
                    </button>
                    <button onclick="app.showDeleteTaskModal(${originalIndex}); event.stopPropagation();" 
                            style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border: none; color: white; padding: 0.5rem; border-radius: 8px; cursor: pointer; font-size: 1rem;">
                        🗑️
                    </button>
                </div>
            `;

            customTasksList.appendChild(taskItem);
        });
    }

    toggleCustomTask(index) {
        const task = this.customTasks[index];
        const today = this.getToday();
        const completedToday = this.data.completedTasks[today] || [];

        // Check if already completed
        if (completedToday.includes(task.tarea)) {
            this.showNotification('⚠️ Ya completaste esta tarea hoy');
            return;
        }

        // If it's a meal, show food quality modal
        if (task.isMeal) {
            this.currentTask = task;
            this.showFoodModal(task.tarea);
        } else {
            this.completeTask(task);
        }
    }

    showAddTaskModal() {
        this.editingTaskIndex = null;
        this.selectedEffort = 1;

        document.getElementById('customTaskModalTitle').textContent = '➕ Nuevo Reto';
        document.getElementById('customTaskTime').value = '';
        document.getElementById('customTaskName').value = '';
        document.getElementById('customTaskIsMeal').checked = false;

        // Reset effort buttons
        document.querySelectorAll('.effort-btn').forEach(btn => {
            btn.style.borderColor = 'var(--border-color)';
            btn.style.background = 'var(--bg-card)';
        });
        document.querySelector('.effort-btn[data-effort="1"]').style.borderColor = '#667eea';
        document.querySelector('.effort-btn[data-effort="1"]').style.background = 'rgba(102, 126, 234, 0.1)';

        document.getElementById('customTaskModal').classList.add('active');
    }

    editCustomTask(index) {
        this.editingTaskIndex = index;
        const task = this.customTasks[index];
        this.selectedEffort = task.esfuerzo;

        document.getElementById('customTaskModalTitle').textContent = '✏️ Editar Reto';
        document.getElementById('customTaskTime').value = task.hora;
        document.getElementById('customTaskName').value = task.tarea;
        document.getElementById('customTaskIsMeal').checked = task.isMeal || false;

        // Reset effort buttons
        document.querySelectorAll('.effort-btn').forEach(btn => {
            btn.style.borderColor = 'var(--border-color)';
            btn.style.background = 'var(--bg-card)';
        });
        document.querySelector(`.effort-btn[data-effort="${task.esfuerzo}"]`).style.borderColor = '#667eea';
        document.querySelector(`.effort-btn[data-effort="${task.esfuerzo}"]`).style.background = 'rgba(102, 126, 234, 0.1)';

        document.getElementById('customTaskModal').classList.add('active');
    }

    selectEffort(effort) {
        this.selectedEffort = effort;

        // Update button styles
        document.querySelectorAll('.effort-btn').forEach(btn => {
            btn.style.borderColor = 'var(--border-color)';
            btn.style.background = 'var(--bg-card)';
        });

        const selectedBtn = document.querySelector(`.effort-btn[data-effort="${effort}"]`);
        selectedBtn.style.borderColor = '#667eea';
        selectedBtn.style.background = 'rgba(102, 126, 234, 0.1)';
    }

    saveCustomTask() {
        const time = document.getElementById('customTaskTime').value;
        const name = document.getElementById('customTaskName').value.trim();
        const isMeal = document.getElementById('customTaskIsMeal').checked;

        if (!time || !name) {
            this.showNotification('⚠️ Por favor completa todos los campos');
            return;
        }

        const newTask = {
            hora: time,
            tarea: name,
            esfuerzo: this.selectedEffort,
            isMeal: isMeal
        };

        if (this.editingTaskIndex !== null) {
            // Editing existing task
            const oldTaskName = this.customTasks[this.editingTaskIndex].tarea;
            this.customTasks[this.editingTaskIndex] = newTask;

            // Update completed tasks and history if name changed
            if (oldTaskName !== name) {
                Object.keys(this.data.completedTasks).forEach(date => {
                    const index = this.data.completedTasks[date].indexOf(oldTaskName);
                    if (index !== -1) {
                        this.data.completedTasks[date][index] = name;
                    }
                });

                Object.keys(this.data.history).forEach(date => {
                    const index = this.data.history[date].indexOf(oldTaskName);
                    if (index !== -1) {
                        this.data.history[date][index] = name;
                    }
                });
            }

            this.showNotification('✅ Reto actualizado correctamente');
        } else {
            // Adding new task
            this.customTasks.push(newTask);
            this.showNotification('✅ Reto creado correctamente');
        }

        // Update meals array if it's a meal
        if (isMeal && !this.meals.includes(name)) {
            this.meals.push(name);
        } else if (!isMeal && this.meals.includes(name)) {
            const mealIndex = this.meals.indexOf(name);
            if (mealIndex !== -1) {
                this.meals.splice(mealIndex, 1);
            }
        }

        this.data.customTasks = this.customTasks;
        this.saveData();
        this.renderCustomTasks();
        this.renderTasks(); // Update main task list
        this.updateProgress(); // Update progress bar
        this.closeCustomTaskModal();
    }

    closeCustomTaskModal() {
        document.getElementById('customTaskModal').classList.remove('active');
        this.editingTaskIndex = null;
    }

    showDeleteTaskModal(index) {
        this.editingTaskIndex = index;
        const task = this.customTasks[index];
        document.getElementById('deleteTaskName').textContent = task.tarea;
        document.getElementById('deleteTaskModal').classList.add('active');
    }

    confirmDeleteTask() {
        if (this.editingTaskIndex === null) return;

        const task = this.customTasks[this.editingTaskIndex];
        const taskName = task.tarea;

        // Remove from custom tasks
        this.customTasks.splice(this.editingTaskIndex, 1);

        // Remove from meals if it was a meal
        if (task.isMeal) {
            const mealIndex = this.meals.indexOf(taskName);
            if (mealIndex !== -1) {
                this.meals.splice(mealIndex, 1);
            }
        }

        this.data.customTasks = this.customTasks;
        this.saveData();
        this.renderCustomTasks();
        this.renderTasks(); // Update main task list
        this.updateProgress(); // Update progress bar
        this.closeDeleteTaskModal();
        this.showNotification('🗑️ Reto eliminado correctamente');
    }

    closeDeleteTaskModal() {
        document.getElementById('deleteTaskModal').classList.remove('active');
        this.editingTaskIndex = null;
    }

    // Level System
    calculateXPForLevel(level) {
        // Exponential XP requirement: 100 * (1.5 ^ (level - 1))
        return Math.floor(100 * Math.pow(1.5, level - 1));
    }

    addXP(amount) {
        this.xp += amount;

        // Check for level up
        while (this.xp >= this.xpForNextLevel) {
            this.levelUp();
        }

        // Update data and UI
        this.data.xp = this.xp;
        this.data.level = this.level;
        this.saveData();
        this.updateLevel();
    }

    levelUp() {
        this.xp -= this.xpForNextLevel;
        this.level++;
        this.xpForNextLevel = this.calculateXPForLevel(this.level);

        // Show level up notification
        this.showNotification(`🎉 ¡NIVEL ${this.level}! Sigue así!`);
        this.createConfetti();

        // Bonus points for leveling up
        const bonusPoints = this.level * 10;
        this.data.points += bonusPoints;
        this.updatePoints();

        setTimeout(() => {
            this.showNotification(`💰 Bonus: +${bonusPoints} puntos por subir de nivel!`);
        }, 1500);
    }

    updateLevel() {
        document.getElementById('levelNumber').textContent = this.level;

        const xpPercentage = (this.xp / this.xpForNextLevel) * 100;
        document.getElementById('xpBar').style.width = `${xpPercentage}%`;

        document.getElementById('xpText').textContent = `${this.xp} / ${this.xpForNextLevel} XP`;
    }

    // Service Worker
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('service-worker.js')
                .then(registration => {
                    console.log('Service Worker registered:', registration);
                })
                .catch(error => {
                    console.log('Service Worker registration failed:', error);
                });
        }
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from {
            transform: translateX(-50%) translateY(-100%);
            opacity: 0;
        }
        to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
    }
    
    @keyframes slideUp {
        from {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
        to {
            transform: translateX(-50%) translateY(-100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize app
const app = new LifeGameApp();
