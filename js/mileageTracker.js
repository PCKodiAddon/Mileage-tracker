export class MileageTracker {
    constructor(settings) {
        this.settings = settings;
        this.entries = [];
    }

    loadEntries() {
        const savedEntries = localStorage.getItem('mileageEntries');
        this.entries = savedEntries ? JSON.parse(savedEntries) : [];
    }

    saveEntries() {
        localStorage.setItem('mileageEntries', JSON.stringify(this.entries));
    }

    addEntry(date, odometer, gallons, fuelCost) {
        const entry = {
            id: Date.now(),
            date,
            odometer: parseFloat(odometer),
            gallons: parseFloat(gallons),
            fuelCost: parseFloat(fuelCost)
        };

        if (this.entries.length > 0) {
            const lastEntry = this.entries[this.entries.length - 1];
            entry.milesDriven = entry.odometer - lastEntry.odometer;
            entry.mpg = entry.milesDriven / entry.gallons;
        } else {
            entry.milesDriven = 0;
            entry.mpg = 0;
        }

        this.entries.push(entry);
        this.saveEntries();
        return entry;
    }

    getEntries() {
        return this.entries;
    }

    getStats() {
        if (this.entries.length === 0) {
            return {
                avgMpg: 0,
                totalMiles: 0,
                totalCost: 0
            };
        }

        const totalMiles = this.entries.reduce((sum, entry) => sum + entry.milesDriven, 0);
        const totalGallons = this.entries.reduce((sum, entry) => sum + entry.gallons, 0);
        const totalCost = this.entries.reduce((sum, entry) => sum + entry.fuelCost, 0);

        return {
            avgMpg: totalMiles / totalGallons || 0,
            totalMiles,
            totalCost
        };
    }

    getChartData() {
        const sortedEntries = this.getEntries().sort((a, b) => new Date(a.date) - new Date(b.date));
        return {
            dates: sortedEntries.map(entry => entry.date),
            mpg: sortedEntries.map(entry => {
                const prevEntry = this.entries[this.entries.indexOf(entry) - 1];
                if (!prevEntry) return 0;
                const distance = entry.odometer - prevEntry.odometer;
                return distance / entry.gallons;
            })
        };
    }

    exportData() {
        const data = JSON.stringify(this.entries, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'mileage-data.json';
        a.click();
        URL.revokeObjectURL(url);
    }
}