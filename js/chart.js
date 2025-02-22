export class Chart {
    constructor() {
        this.chart = null;
    }

    async initializeChart() {
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
                    pointBackgroundColor: '#2196f3',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#2196f3',
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    fill: true,
                    tension: 0.4,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            font: {
                                size: 14,
                                family: "'Segoe UI', sans-serif"
                            },
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        titleColor: '#333',
                        titleFont: {
                            size: 14,
                            weight: 'bold',
                            family: "'Segoe UI', sans-serif"
                        },
                        bodyColor: '#666',
                        bodyFont: {
                            size: 13,
                            family: "'Segoe UI', sans-serif"
                        },
                        padding: 12,
                        borderColor: '#e0e0e0',
                        borderWidth: 1,
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return `${context.parsed.y.toFixed(1)} MPG`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                size: 12,
                                family: "'Segoe UI', sans-serif"
                            },
                            color: '#666'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)',
                            drawBorder: false
                        },
                        ticks: {
                            font: {
                                size: 12,
                                family: "'Segoe UI', sans-serif"
                            },
                            color: '#666',
                            padding: 10,
                            callback: function(value) {
                                return value.toFixed(1) + ' MPG';
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                elements: {
                    line: {
                        tension: 0.4
                    }
                }
            }
        });
    }

    updateChart(data) {
        if (!this.chart) {
            console.warn('Chart not initialized');
            return;
        }

        if (!data || !data.dates || !data.mpg) {
            this.chart.data.labels = [];
            this.chart.data.datasets[0].data = [];
            this.chart.update('none');
            return;
        }

        // Format dates for x-axis
        const labels = data.dates.map(date => {
            const d = new Date(date);
            return d.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
            });
        });

        this.chart.data.labels = labels;
        this.chart.data.datasets[0].data = data.mpg;

        // Add gradient fill
        const ctx = this.chart.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(33, 150, 243, 0.2)');
        gradient.addColorStop(1, 'rgba(33, 150, 243, 0)');
        this.chart.data.datasets[0].backgroundColor = gradient;

        this.chart.update();
    }

    destroy() {
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
    }
}