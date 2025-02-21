// Import modules
import { MileageTracker } from './mileageTracker.js';
import { MaintenanceTracker } from './maintenanceTracker.js';
import { Settings } from './settings.js';
import { UI } from './ui.js';
import { Chart } from './chart.js';

// Initialize app components
const settings = new Settings();
const mileageTracker = new MileageTracker(settings);
const maintenanceTracker = new MaintenanceTracker();
const chart = new Chart();
const ui = new UI(mileageTracker, maintenanceTracker, settings, chart);

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    // Load saved data
    settings.loadSettings();
    mileageTracker.loadEntries();
    maintenanceTracker.loadRecords();

    // Initialize UI
    await ui.initializeUI();
    ui.updateDashboard();
    ui.updateMaintenanceHistory();

    // Set up navigation
    document.querySelector('.main-nav').addEventListener('click', (e) => {
        if (e.target.classList.contains('nav-btn')) {
            ui.switchPage(e.target.dataset.page);
        }
    });

    // Set up form submissions
    document.getElementById('mileageForm').addEventListener('submit', (e) => {
        e.preventDefault();
        ui.handleMileageFormSubmit();
    });

    document.getElementById('maintenanceForm').addEventListener('submit', (e) => {
        e.preventDefault();
        ui.handleMaintenanceFormSubmit();
    });

    document.getElementById('reminderForm').addEventListener('submit', (e) => {
        e.preventDefault();
        ui.handleReminderFormSubmit();
    });

    document.getElementById('settingsForm').addEventListener('submit', (e) => {
        e.preventDefault();
        ui.handleSettingsFormSubmit();
    });

    // Set up theme toggle
    document.getElementById('themeToggle').addEventListener('click', () => {
        ui.toggleTheme();
    });

    // Set up export functionality
    document.getElementById('exportData').addEventListener('click', () => {
        ui.exportData();
    });
});