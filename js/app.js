// Import modules
import { MileageTracker } from './mileageTracker.js';
import { MaintenanceTracker } from './maintenanceTracker.js';
import { Settings } from './settings.js';
import { UI } from './ui.js';
import { Chart } from './chart.js';

// Initialize app components
const settings = new Settings();
const mileageTracker = new MileageTracker(settings);
const maintenanceTracker = new MaintenanceTracker(settings);
const chart = new Chart();
const ui = new UI(mileageTracker, maintenanceTracker, settings, chart);
// Make ui instance available globally for the delete button onclick handler
window.ui = ui;

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Load saved data
        settings.loadSettings();
        mileageTracker.loadEntries();
        maintenanceTracker.loadRecords();

        // Initialize UI
        await ui.initializeUI();
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
    } catch (error) {
        console.error('Error initializing app:', error);
    }
});