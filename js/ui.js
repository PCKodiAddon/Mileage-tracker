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
                <h3>${record.type}</h3>
                <p>Date: ${new Date(record.date).toLocaleDateString()}</p>
                ${record.notes ? `<p>Notes: ${record.notes}</p>` : ''}
            `;
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