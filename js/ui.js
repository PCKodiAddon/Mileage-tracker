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
            this.updateDashboard();
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
        try {
            const stats = this.mileageTracker.getStats();
            document.getElementById('avgMpg').textContent = this.settings.formatEfficiency(stats.avgMpg || 0);
            document.getElementById('totalMiles').textContent = this.settings.formatDistance(stats.totalMiles || 0);
            document.getElementById('totalCost').textContent = this.settings.formatCost(stats.totalCost || 0);

            const chartData = this.mileageTracker.getChartData();
            if (this.chart) {
                this.chart.updateChart(chartData);
            }
            this.updateDashboardMaintenance();
        } catch (error) {
            console.error('Error updating dashboard:', error);
        }
    }

    handleMileageFormSubmit() {
        const date = document.getElementById('date').value;
        const odometer = parseFloat(document.getElementById('odometer').value);
        const gallons = parseFloat(document.getElementById('gallons').value);
        const fuelCost = parseFloat(document.getElementById('fuelCost').value);

        this.mileageTracker.addEntry(date, odometer, gallons, fuelCost);
        
        // Update current odometer in settings
        this.settings.updateSettings({
            ...this.settings.getSettings(),
            currentOdometer: odometer
        });
        
        this.updateDashboard();
        document.getElementById('mileageForm').reset();
        this.switchPage('dashboard');
    }

    handleMaintenanceFormSubmit() {
        const date = document.getElementById('maintenanceDate').value;
        const type = document.getElementById('maintenanceType').value;
        let notes = document.getElementById('maintenanceNotes').value;

        if (type === 'oil') {
            const currentMileage = this.settings.getCurrentMileage();
            const interval = this.settings.getOilChangeInterval();
            const nextDueMileage = currentMileage + interval;
            
            notes = `Oil changed at ${currentMileage} miles. Next change due at ${nextDueMileage} miles.\n${notes}`;
            
            // Add reminder for next oil change
            this.maintenanceTracker.addReminder(
                type,
                date,
                90, // Default interval in days
                {
                    currentMileage,
                    mileageInterval: interval,
                    nextDueMileage
                }
            );
        }

        this.maintenanceTracker.addRecord(date, type, notes);
        this.updateMaintenanceHistory();
        this.updateDashboardMaintenance();
        document.getElementById('maintenanceForm').reset();
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
        
        if (type === 'oil') {
            const currentMileage = this.settings.getCurrentMileage();
            const mileageInterval = this.settings.getOilChangeInterval();
            
            if (currentMileage === 0) {
                alert('Please update your current mileage in Settings first.');
                this.switchPage('settings');
                return;
            }
            
            const nextDueMileage = currentMileage + mileageInterval;
            
            this.maintenanceTracker.addReminder(
                type,
                dueDate,
                interval,
                {
                    currentMileage,
                    mileageInterval,
                    nextDueMileage
                }
            );
            
            alert(`Oil Change Reminder Set:\n` +
                  `Current Mileage: ${currentMileage}\n` +
                  `Next Due: ${nextDueMileage} miles\n` +
                  `Date Due: ${new Date(dueDate).toLocaleDateString()}`);
        } else {
            this.maintenanceTracker.addReminder(type, dueDate, interval);
        }

        this.updateDashboardMaintenance();
        document.getElementById('reminderForm').reset();
    }

    handleSettingsFormSubmit() {
        const newSettings = {
            distanceUnit: document.getElementById('units').value,
            fuelUnit: document.getElementById('fuelUnits').value,
            efficiencyGoal: parseFloat(document.getElementById('efficiencyGoal').value),
            currentOdometer: parseInt(document.getElementById('currentOdometer').value),
            oilChangeInterval: parseInt(document.getElementById('oilChangeInterval').value)
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
        document.getElementById('currentOdometer').value = currentSettings.currentOdometer;
        document.getElementById('oilChangeInterval').value = currentSettings.oilChangeInterval;
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
        const currentMileage = this.settings.getCurrentMileage();
        if (currentMileage === 0) return;
        
        const dueReminders = this.maintenanceTracker.getDueReminders();
        const messages = [];

        dueReminders.forEach(reminder => {
            if (reminder.type === 'oil' && reminder.mileageData) {
                const milesLeft = reminder.mileageData.nextDueMileage - currentMileage;
                if (milesLeft <= 0) {
                    messages.push(`Oil change overdue! Current: ${currentMileage} miles\n` +
                                `Due at: ${reminder.mileageData.nextDueMileage} miles`);
                } else if (milesLeft <= 500) {
                    messages.push(`Oil change due soon! ${milesLeft} miles remaining`);
                }
            } else {
                messages.push(`${reminder.type} maintenance is due (${new Date(reminder.dueDate).toLocaleDateString()})`);
            }
        });

        if (messages.length > 0) {
            alert('Maintenance Reminders:\n\n' + messages.join('\n\n'));
        }
    }

    updateDashboardMaintenance() {
        const maintenanceList = document.getElementById('dashboardMaintenanceList');
        const remindersList = document.getElementById('dashboardReminders');
        const currentMileage = this.settings.getCurrentMileage();
        
        // Update recent maintenance
        const recentRecords = this.maintenanceTracker.getRecords()
            .slice(0, 3);
        
        maintenanceList.innerHTML = recentRecords.length > 0 
            ? recentRecords.map(record => `
                <div class="dashboard-maintenance-item">
                    <div class="maintenance-header">
                        <span class="maintenance-type">${record.type}</span>
                        <span class="maintenance-date">${new Date(record.date).toLocaleDateString()}</span>
                    </div>
                    ${record.notes ? `<div class="maintenance-notes">${record.notes}</div>` : ''}
                </div>
            `).join('')
            : '<div class="no-records">No recent maintenance records</div>';

        // Update upcoming reminders
        const upcomingReminders = this.maintenanceTracker.getReminders()
            .map(reminder => {
                let status = '';
                if (reminder.type === 'oil' && reminder.mileageData) {
                    const milesLeft = reminder.mileageData.nextDueMileage - currentMileage;
                    status = milesLeft <= 0 
                        ? 'OVERDUE!'
                        : `${milesLeft} miles remaining`;
                }
                return {
                    ...reminder,
                    status,
                    dueDate: new Date(reminder.dueDate).toLocaleDateString()
                };
            })
            .slice(0, 3);

        remindersList.innerHTML = upcomingReminders.length > 0
            ? upcomingReminders.map(reminder => `
                <div class="dashboard-reminder-item ${reminder.status === 'OVERDUE!' ? 'overdue' : ''}">
                    <div class="reminder-header">
                        <span class="reminder-type">${reminder.type}</span>
                        <span class="reminder-date">${reminder.dueDate}</span>
                        <button class="delete-btn" onclick="ui.handleReminderDelete(${reminder.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    ${reminder.status ? `
                        <div class="reminder-status ${reminder.status === 'OVERDUE!' ? 'overdue' : ''}">
                            ${reminder.status}
                        </div>
                    ` : ''}
                </div>
            `).join('')
            : '<div class="no-records">No upcoming maintenance</div>';
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
        // No longer need to show/hide mileage fields
        // since they're now in settings
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

    handleReminderDelete(reminderId) {
        if (confirm('Are you sure you want to delete this reminder?')) {
            this.maintenanceTracker.deleteReminder(reminderId);
            this.updateDashboardMaintenance();
        }
    }
}