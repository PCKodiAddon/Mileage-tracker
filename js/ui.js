export class UI {
    constructor(mileageTracker, maintenanceTracker, settings, chart) {
        this.mileageTracker = mileageTracker;
        this.maintenanceTracker = maintenanceTracker;
        this.settings = settings;
        this.chart = chart;

        // Add event listener for odometer input
        document.getElementById('odometer').addEventListener('input', () => {
            this.handleOdometerInput();
        });
    }

    async initializeUI() {
        this.showLoading();
        try {
            await this.chart.initializeChart();
            this.loadSettingsForm();
            this.updateMaintenanceHistory();
            this.checkDueReminders();
        } finally {
            this.hideLoading();
        }
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
        let notes = document.getElementById('maintenanceNotes').value;

        if (type === 'oil') {
            const currentMileage = parseInt(document.getElementById('oilChangeMileage').value);
            const nextDueMileage = parseInt(document.getElementById('nextOilChangeMileage').value);
            const mileageInterval = nextDueMileage - currentMileage;
            
            notes = `Oil changed at ${currentMileage} miles. Next change due at ${nextDueMileage} miles.\n${notes}`;
            
            // Update or create oil change reminder
            this.maintenanceTracker.addReminder('oil', date, 90, {
                mileageInterval,
                lastMileage: currentMileage,
                nextDueMileage: nextDueMileage
            });
        }

        this.maintenanceTracker.addRecord(date, type, notes);
        this.updateMaintenanceHistory();
        this.updateDashboardMaintenance();
        document.getElementById('maintenanceForm').reset();
        document.getElementById('oilChangeMileageGroup').style.display = 'none';
        document.getElementById('nextOilChangeMileageGroup').style.display = 'none';
    }

    handleReminderTypeChange() {
        const reminderType = document.getElementById('reminderType').value;
        const mileageIntervalGroup = document.getElementById('mileageIntervalGroup');
        
        if (reminderType === 'oil') {
            mileageIntervalGroup.style.display = 'block';
        } else {
            mileageIntervalGroup.style.display = 'none';
        }
    }

    handleReminderFormSubmit() {
        const type = document.getElementById('reminderType').value;
        const dueDate = document.getElementById('reminderDueDate').value;
        const interval = parseInt(document.getElementById('reminderInterval').value);
        
        // Get current mileage from latest entry
        const entries = this.mileageTracker.getEntries();
        if (entries.length === 0) {
            alert('Please add a mileage entry first to set up reminders.');
            return;
        }
        
        const currentMileage = entries[entries.length - 1].odometer;
        
        if (type === 'oil') {
            const mileageInterval = parseInt(document.getElementById('mileageInterval').value);
            const nextDueMileage = currentMileage + mileageInterval;
            
            this.maintenanceTracker.addReminder({
                type,
                dueDate,
                interval,
                mileageData: {
                    currentMileage,
                    mileageInterval,
                    nextDueMileage
                }
            });
            
            alert(`Reminder set for oil change:\n` +
                  `Current mileage: ${currentMileage}\n` +
                  `Next due at: ${nextDueMileage} miles\n` +
                  `Date due: ${new Date(dueDate).toLocaleDateString()}`);
        } else {
            this.maintenanceTracker.addReminder({
                type,
                dueDate,
                interval
            });
        }

        this.updateDashboardMaintenance();
        document.getElementById('reminderForm').reset();
        document.getElementById('mileageIntervalGroup').style.display = 'none';
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
            
            let mileageInfo = '';
            if (record.type === 'oil' && record.notes) {
                const mileageMatch = record.notes.match(/Oil changed at (\d+) miles/);
                if (mileageMatch) {
                    mileageInfo = `<p class="record-mileage">Mileage: ${mileageMatch[1]}</p>`;
                }
            }

            recordElement.innerHTML = `
                <div class="record-header">
                    <h3>${record.type}</h3>
                    <button class="delete-btn" data-id="${record.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="record-content">
                    <p class="record-date">Date: ${new Date(record.date).toLocaleDateString()}</p>
                    ${mileageInfo}
                    ${record.notes ? `<p class="record-notes">${record.notes}</p>` : ''}
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
        const entries = this.mileageTracker.getEntries();
        if (entries.length === 0) return;
        
        const currentMileage = entries[entries.length - 1].odometer;
        const today = new Date();
        const reminders = this.maintenanceTracker.getReminders();
        const dueReminders = [];

        reminders.forEach(reminder => {
            const dueDate = new Date(reminder.dueDate);
            let isDue = false;
            let message = '';

            // Check mileage-based due status for oil changes
            if (reminder.type === 'oil' && reminder.mileageData) {
                if (currentMileage >= reminder.mileageData.nextDueMileage) {
                    isDue = true;
                    message = `Oil change needed! Current: ${currentMileage} miles, Due at: ${reminder.mileageData.nextDueMileage} miles`;
                }
            }

            // Check date-based due status for all types
            if (dueDate <= today) {
                isDue = true;
                message = `${reminder.type} maintenance is due (${dueDate.toLocaleDateString()})`;
            }

            if (isDue) {
                dueReminders.push(message);
            }
        });

        if (dueReminders.length > 0) {
            alert('Maintenance Due:\n\n' + dueReminders.join('\n'));
        }
    }

    updateDashboardMaintenance() {
        const maintenanceList = document.getElementById('dashboardMaintenanceList');
        const remindersList = document.getElementById('dashboardReminders');
        const entries = this.mileageTracker.getEntries();
        const currentMileage = entries.length > 0 ? entries[entries.length - 1].odometer : 0;
        
        // Update recent maintenance
        const recentRecords = this.maintenanceTracker.getRecords().slice(0, 3);
        maintenanceList.innerHTML = recentRecords.map(record => `
            <div class="dashboard-maintenance-item">
                <div class="maintenance-header">
                    <span class="maintenance-type">${record.type}</span>
                    <span class="maintenance-date">${new Date(record.date).toLocaleDateString()}</span>
                </div>
                ${record.notes ? `<div class="maintenance-notes">${record.notes}</div>` : ''}
            </div>
        `).join('');

        // Update upcoming maintenance
        const upcomingReminders = this.maintenanceTracker.getReminders()
            .map(reminder => {
                let status = '';
                if (reminder.type === 'oil' && reminder.mileageData) {
                    const milesLeft = reminder.mileageData.nextDueMileage - currentMileage;
                    status = `${milesLeft} miles remaining`;
                }
                return {
                    ...reminder,
                    status
                };
            })
            .slice(0, 3);

        remindersList.innerHTML = upcomingReminders.map(reminder => `
            <div class="dashboard-reminder-item">
                <div class="reminder-header">
                    <span class="reminder-type">${reminder.type}</span>
                    <span class="reminder-date">${new Date(reminder.dueDate).toLocaleDateString()}</span>
                </div>
                ${reminder.status ? `<div class="reminder-status">${reminder.status}</div>` : ''}
            </div>
        `).join('');

        // Show message if no records
        if (recentRecords.length === 0) {
            maintenanceList.innerHTML = '<div class="no-records">No recent maintenance records</div>';
        }
        if (upcomingReminders.length === 0) {
            remindersList.innerHTML = '<div class="no-records">No upcoming maintenance</div>';
        }
    }

    toggleTheme() {
        this.settings.toggleTheme();
        const themeIcon = document.querySelector('#themeToggle i');
        themeIcon.className = this.settings.getSettings().theme === 'light' 
            ? 'fas fa-moon'
            : 'fas fa-sun';
    }

    exportData() {
        const exportData = {
            mileage: this.mileageTracker.getEntries(),
            maintenance: {
                records: this.maintenanceTracker.getRecords(),
                reminders: this.maintenanceTracker.getReminders()
            }
        };
        
        const data = JSON.stringify(exportData, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'mileage-tracker-data.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    showLoading() {
        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'loading-overlay';
        loadingOverlay.innerHTML = `
            <div class="loading-spinner"></div>
            <p>Loading...</p>
        `;
        document.body.appendChild(loadingOverlay);
    }

    hideLoading() {
        const loadingOverlay = document.querySelector('.loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.remove();
        }
    }

    handleMaintenanceTypeChange() {
        const maintenanceType = document.getElementById('maintenanceType').value;
        const oilChangeMileageGroup = document.getElementById('oilChangeMileageGroup');
        const nextOilChangeMileageGroup = document.getElementById('nextOilChangeMileageGroup');
        
        if (maintenanceType === 'oil') {
            oilChangeMileageGroup.style.display = 'block';
            nextOilChangeMileageGroup.style.display = 'block';
            // Pre-fill with latest odometer reading if available
            const entries = this.mileageTracker.getEntries();
            if (entries.length > 0) {
                const currentMileage = entries[entries.length - 1].odometer;
                document.getElementById('oilChangeMileage').value = currentMileage;
                document.getElementById('nextOilChangeMileage').value = currentMileage + 7500;
            }
        } else {
            oilChangeMileageGroup.style.display = 'none';
            nextOilChangeMileageGroup.style.display = 'none';
        }
    }

    handleOdometerInput() {
        const odometerInput = document.getElementById('odometer');
        const warningDiv = document.getElementById('oilChangeWarning');
        const milesSpan = document.getElementById('milesUntilChange');
        
        const currentMileage = parseInt(odometerInput.value);
        const reminders = this.maintenanceTracker.getReminders();
        const oilReminder = reminders.find(r => 
            r.type === 'oil' && 
            r.mileageData && 
            !r.completed
        );

        if (oilReminder && currentMileage) {
            const milesLeft = oilReminder.mileageData.nextDueMileage - currentMileage;
            if (milesLeft <= 1000) {
                warningDiv.style.display = 'block';
                milesSpan.textContent = milesLeft;
            } else {
                warningDiv.style.display = 'none';
            }
        }
    }
}