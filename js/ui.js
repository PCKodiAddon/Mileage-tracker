export class UI {
    constructor(mileageTracker, maintenanceTracker, settings, chart) {
        this.mileageTracker = mileageTracker;
        this.maintenanceTracker = maintenanceTracker;
        this.settings = settings;
        this.chart = chart;
    }

    initializeUI() {
        this.chart.initializeChart();
        this.loadSettingsForm();
        this.updateMaintenanceHistory();
        this.checkDueReminders();
    }

    switchPage(pageId) {
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        document.getElementById(pageId).classList.add('active');
        document.querySelector(`[data-page="${pageId}"]`).classList.add('active');

        if (pageId === 'dashboard') {
            this.updateDashboard();
        }
    }

    updateDashboard() {
        const stats = this.mileageTracker.getStats();
        document.getElementById('avgMpg').textContent = this.settings.formatEfficiency(stats.avgMpg);
        document.getElementById('totalMiles').textContent = this.settings.formatDistance(stats.totalMiles);
        document.getElementById('totalCost').textContent = this.settings.formatCost(stats.totalCost);

        this.chart.updateChart(this.mileageTracker.getChartData());
        this.updateDashboardMaintenance();
    }

    handleMileageFormSubmit() {
        const date = document.getElementById('date').value;
        const odometer = document.getElementById('odometer').value;
        const gallons = document.getElementById('gallons').value;
        const fuelCost = document.getElementById('fuelCost').value;

        this.mileageTracker.addEntry(date, odometer, gallons, fuelCost);
        this.updateDashboard();
        document.getElementById('mileageForm').reset();
        this.switchPage('dashboard');
    }

    handleMaintenanceFormSubmit() {
        const date = document.getElementById('maintenanceDate').value;
        const type = document.getElementById('maintenanceType').value;
        const notes = document.getElementById('maintenanceNotes').value;

        this.maintenanceTracker.addRecord(date, type, notes);
        this.updateMaintenanceHistory();
        document.getElementById('maintenanceForm').reset();
    }

    handleSettingsFormSubmit() {
        const newSettings = {
            distanceUnit: document.getElementById('units').value,
            fuelUnit: document.getElementById('fuelUnits').value,
            efficiencyGoal: parseFloat(document.getElementById('efficiencyGoal').value)
        };

        this.settings.updateSettings(newSettings);
        this.updateDashboard();
        this.switchPage('dashboard');
    }

    loadSettingsForm() {
        const currentSettings = this.settings.getSettings();
        document.getElementById('units').value = currentSettings.distanceUnit;
        document.getElementById('fuelUnits').value = currentSettings.fuelUnit;
        document.getElementById('efficiencyGoal').value = currentSettings.efficiencyGoal;
    }

    updateMaintenanceHistory() {
        const records = this.maintenanceTracker.getRecords();
        const maintenanceList = document.getElementById('maintenanceList');
        maintenanceList.innerHTML = '';

        records.forEach(record => {
            const recordElement = document.createElement('div');
            recordElement.className = 'maintenance-record';
            recordElement.innerHTML = `
                <div class="record-header">
                    <h3>${record.type}</h3>
                    <button class="delete-btn" data-id="${record.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="record-content">
                    <p class="record-date">Date: ${new Date(record.date).toLocaleDateString()}</p>
                    ${record.notes ? `<p class="record-notes">Notes: ${record.notes}</p>` : ''}
                </div>
            `;

            const deleteBtn = recordElement.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => {
                this.maintenanceTracker.deleteRecord(record.id);
                this.updateMaintenanceHistory();
            });

            maintenanceList.appendChild(recordElement);
        });
    }

    checkDueReminders() {
        const dueReminders = this.maintenanceTracker.getDueReminders();
        if (dueReminders.length > 0) {
            const message = dueReminders.map(reminder => 
                `${reminder.type} maintenance is due`
            ).join('\n');
            alert('Maintenance Reminders:\n' + message);
        }
    }

    updateDashboardMaintenance() {
        const maintenanceList = document.getElementById('dashboardMaintenanceList');
        const remindersList = document.getElementById('dashboardReminders');
        
        // Update recent maintenance
        const recentRecords = this.maintenanceTracker.getRecords().slice(0, 3);
        maintenanceList.innerHTML = recentRecords.map(record => `
            <div class="dashboard-maintenance-item">
                <span class="maintenance-type">${record.type}</span>
                <span class="maintenance-date">${new Date(record.date).toLocaleDateString()}</span>
            </div>
        `).join('');

        // Update upcoming maintenance
        const upcomingReminders = this.maintenanceTracker.getReminders().slice(0, 3);
        remindersList.innerHTML = upcomingReminders.map(reminder => `
            <div class="dashboard-reminder-item">
                <span class="reminder-type">${reminder.type}</span>
                <span class="reminder-date">${new Date(reminder.dueDate).toLocaleDateString()}</span>
            </div>
        `).join('');
    }

    toggleTheme() {
        this.settings.toggleTheme();
        const themeIcon = document.querySelector('#themeToggle i');
        themeIcon.className = this.settings.getSettings().theme === 'light' 
            ? 'fas fa-moon'
            : 'fas fa-sun';
    }

    exportData() {
        this.mileageTracker.exportData();
        this.maintenanceTracker.exportData();
    }
}