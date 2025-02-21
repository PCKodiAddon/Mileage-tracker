export class Chart {
    constructor() {
        this.chart = null;
    }

    initializeChart() {
        const ctx = document.getElementById('mileageChart').getContext('2d');
        this.chart = new window.Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Miles Per Gallon',
                    data: [],
                    borderColor: '#2196f3',
                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'MPG'
                        },
                        suggestedMin: 0
                    }
                }
            }
        });
    }

    updateChart(data) {
        if (!this.chart) {
            this.initializeChart();
        }

        this.chart.data.labels = data.map(entry => {
            const date = new Date(entry.date);
            return date.toLocaleDateString();
        });
        this.chart.data.datasets[0].data = data.map(entry => entry.mpg);
        this.chart.update();
    }

    destroy() {
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
    }
}