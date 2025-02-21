export class Settings {
    constructor() {
        this.settings = {
            distanceUnit: 'miles',
            fuelUnit: 'gallons',
            efficiencyGoal: 30.0,
            theme: 'light'
        };
    }

    loadSettings() {
        const savedSettings = localStorage.getItem('appSettings');
        if (savedSettings) {
            this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
        }
        this.applyTheme();
    }

    saveSettings() {
        localStorage.setItem('appSettings', JSON.stringify(this.settings));
    }

    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.saveSettings();
        this.applyTheme();
    }

    getSettings() {
        return this.settings;
    }

    toggleTheme() {
        this.settings.theme = this.settings.theme === 'light' ? 'dark' : 'light';
        this.saveSettings();
        this.applyTheme();
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
}