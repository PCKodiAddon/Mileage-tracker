export class Settings {
    constructor() {
        this.settings = {
            distanceUnit: 'miles',
            fuelUnit: 'gallons',
            efficiencyGoal: 25,
            theme: 'light',
            currentOdometer: 0,
            oilChangeInterval: 7500
        };
    }

    loadSettings() {
        const savedSettings = localStorage.getItem('settings');
        if (savedSettings) {
            this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
        }
        document.body.className = this.settings.theme === 'dark' ? 'dark-mode' : 'light-mode';
    }

    saveSettings() {
        localStorage.setItem('settings', JSON.stringify(this.settings));
    }

    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        localStorage.setItem('settings', JSON.stringify(this.settings));
        document.body.className = this.settings.theme === 'dark' ? 'dark-mode' : 'light-mode';
    }

    getSettings() {
        return this.settings;
    }

    toggleTheme() {
        this.settings.theme = this.settings.theme === 'light' ? 'dark' : 'light';
        this.saveSettings();
        document.body.className = this.settings.theme === 'dark' ? 'dark-mode' : 'light-mode';
    }

    applyTheme() {
        document.body.classList.remove('light-mode', 'dark-mode');
        document.body.classList.add(`${this.settings.theme}-mode`);
    }

    convertDistance(value, from, to) {
        if (from === to) return value;
        return from === 'miles' 
            ? value * 1.60934  // miles to km
            : value * 0.621371; // km to miles
    }

    convertVolume(value, from, to) {
        if (from === to) return value;
        return from === 'gallons' 
            ? value * 3.78541  // gallons to liters
            : value * 0.264172; // liters to gallons
    }

    formatEfficiency(value) {
        const unit = this.settings.distanceUnit === 'miles' 
            ? 'MPG'
            : 'L/100km';
        return `${value.toFixed(1)} ${unit}`;
    }

    formatDistance(value) {
        return `${value.toFixed(1)} ${this.settings.distanceUnit}`;
    }

    formatVolume(value) {
        return `${value.toFixed(3)} ${this.settings.fuelUnit}`;
    }

    formatCost(value) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(value);
    }

    getCurrentMileage() {
        return this.settings.currentOdometer || 0;
    }

    getOilChangeInterval() {
        return this.settings.oilChangeInterval || 7500;
    }

    updateMileage(newMileage) {
        this.settings.currentOdometer = newMileage;
        this.saveSettings();
    }
}