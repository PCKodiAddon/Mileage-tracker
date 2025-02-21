export class MaintenanceTracker {
    constructor() {
        this.records = [];
        this.reminders = [];
    }

    loadRecords() {
        const savedRecords = localStorage.getItem('maintenanceRecords');
        this.records = savedRecords ? JSON.parse(savedRecords) : [];

        const savedReminders = localStorage.getItem('maintenanceReminders');
        this.reminders = savedReminders ? JSON.parse(savedReminders) : [];
    }

    saveRecords() {
        localStorage.setItem('maintenanceRecords', JSON.stringify(this.records));
        localStorage.setItem('maintenanceReminders', JSON.stringify(this.reminders));
    }

    addRecord(date, type, notes) {
        const record = {
            id: Date.now(),
            date,
            type,
            notes,
            completed: true
        };

        this.records.push(record);
        this.saveRecords();
        return record;
    }

    addReminder(type, dueDate, interval) {
        const reminder = {
            id: Date.now(),
            type,
            dueDate,
            interval, // in days
            completed: false
        };

        this.reminders.push(reminder);
        this.saveRecords();
        return reminder;
    }

    getRecords() {
        return this.records.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    getReminders() {
        return this.reminders.filter(reminder => !reminder.completed);
    }

    getDueReminders() {
        const today = new Date();
        return this.reminders.filter(reminder => {
            const dueDate = new Date(reminder.dueDate);
            return !reminder.completed && dueDate <= today;
        });
    }

    completeReminder(id) {
        const reminder = this.reminders.find(r => r.id === id);
        if (reminder) {
            reminder.completed = true;
            
            // Create new reminder based on interval
            if (reminder.interval) {
                const nextDueDate = new Date(reminder.dueDate);
                nextDueDate.setDate(nextDueDate.getDate() + reminder.interval);
                
                this.addReminder(
                    reminder.type,
                    nextDueDate.toISOString().split('T')[0],
                    reminder.interval
                );
            }

            this.saveRecords();
        }
    }

    deleteRecord(id) {
        this.records = this.records.filter(record => record.id !== id);
        this.saveRecords();
    }

    deleteReminder(id) {
        this.reminders = this.reminders.filter(reminder => reminder.id !== id);
        this.saveRecords();
    }

    exportData() {
        const data = {
            records: this.records,
            reminders: this.reminders
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'maintenance-data.json';
        a.click();
        URL.revokeObjectURL(url);
    }
}