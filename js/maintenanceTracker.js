export class MaintenanceTracker {
    constructor(settings) {
        this.settings = settings;
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

    addReminder(type, dueDate, interval, mileageData = null) {
        const reminder = {
            id: Date.now(),
            type,
            dueDate,
            interval,
            mileageData,
            completed: false
        };
        
        this.reminders.push(reminder);
        this.saveRecords();
    }

    getRecords() {
        return this.records.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    getReminders() {
        return this.reminders
            .filter(reminder => !reminder.completed)
            .sort((a, b) => {
                if (a.type === 'oil' && b.type === 'oil' && a.mileageData && b.mileageData) {
                    return a.mileageData.nextDueMileage - b.mileageData.nextDueMileage;
                }
                return new Date(a.dueDate) - new Date(b.dueDate);
            });
    }

    getDueReminders() {
        const today = new Date();
        return this.reminders.filter(reminder => {
            if (reminder.completed) return false;
            
            const dueDate = new Date(reminder.dueDate);
            if (reminder.type === 'oil' && reminder.mileageData) {
                const currentMileage = this.settings.getCurrentMileage();
                return currentMileage >= reminder.mileageData.nextDueMileage || dueDate <= today;
            }
            return dueDate <= today;
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

    getFormattedReminder(reminder) {
        let text = `${reminder.type} - Due: ${new Date(reminder.dueDate).toLocaleDateString()}`;
        if (reminder.mileageData) {
            text += ` (Next due at ${reminder.mileageData.nextDueMileage} miles)`;
        }
        return text;
    }
}