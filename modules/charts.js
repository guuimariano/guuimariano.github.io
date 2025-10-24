import {
    computeWinsByCategory,
    computeWinsByPhase,
    computePerformanceByAthlete,
    computeAveragePointsPerRound,
    computePenaltiesByCoach,
    computePenaltiesByAthlete,
} from './data-store.js';

const chartRegistry = new Map();
const individualCharts = [];
let defaultsApplied = false;

const COLORS = {
    primary: '#6366F1',
    secondary: '#8B5CF6',
    accent: '#06B6D4',
    danger: '#DF3F40',
    surface: '#EEF2FF',
    neutral: '#94A3B8',
};

const INDIVIDUAL_LIMIT = 6;

function getChartLib() {
    if (typeof window === 'undefined' || !window.Chart) {
        console.warn('Chart.js is not available on window.Chart yet.');
        return null;
    }
    return window.Chart;
}

function applyDefaults() {
    if (defaultsApplied) return;
    const Chart = getChartLib();
    if (!Chart) return;

    Chart.defaults.color = '#0F172A';
    Chart.defaults.font.family = 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    Chart.defaults.font.size = 13;
    Chart.defaults.plugins.legend.labels.usePointStyle = true;
    Chart.defaults.elements.bar.borderRadius = 6;
    defaultsApplied = true;
}

function destroyChart(id) {
    const existing = chartRegistry.get(id);
    if (existing) {
        existing.destroy();
        chartRegistry.delete(id);
    }
}

function instantiateChart(id, config) {
    const Chart = getChartLib();
    if (!Chart) return null;

    const canvas = document.getElementById(id);
    if (!canvas) {
        destroyChart(id);
        return null;
    }

    destroyChart(id);

    const context = canvas.getContext('2d');
    const chart = new Chart(context, config);
    chartRegistry.set(id, chart);
    return chart;
}

function renderWinsByCategory(state) {
    const summary = computeWinsByCategory(state).filter(item => (item.wins + item.losses + item.pending) > 0);
    if (!summary.length) {
        destroyChart('categoryChart');
        return;
    }

    const labels = summary.map(item => item.category ?? 'Desconhecido');
    const wins = summary.map(item => item.wins);
    const losses = summary.map(item => item.losses);
    const pending = summary.map(item => item.pending);

    instantiateChart('categoryChart', {
        type: 'bar',
        data: {
            labels,
            datasets: [
                {
                    label: 'Vitórias',
                    data: wins,
                    backgroundColor: COLORS.accent,
                    borderColor: COLORS.accent,
                    borderWidth: 1.5,
                },
                {
                    label: 'Derrotas',
                    data: losses,
                    backgroundColor: COLORS.danger,
                    borderColor: COLORS.danger,
                    borderWidth: 1.5,
                },
                {
                    label: 'Pendentes',
                    data: pending,
                    backgroundColor: COLORS.secondary,
                    borderColor: COLORS.secondary,
                    borderWidth: 1.5,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 },
                    grid: { color: COLORS.surface },
                },
                x: {
                    grid: { display: false },
                },
            },
            plugins: {
                legend: { position: 'top' },
                tooltip: { enabled: true },
            },
        },
    });
}

function renderWinsByPhase(state) {
    const summary = computeWinsByPhase(state).filter(item => (item.wins + item.losses + item.pending) > 0);
    if (!summary.length) {
        destroyChart('stageChart');
        return;
    }

    const labels = summary.map(item => item.phase ?? 'Desconhecida');
    const wins = summary.map(item => item.wins);
    const losses = summary.map(item => item.losses);
    const colorPalette = [COLORS.primary, COLORS.accent, COLORS.secondary, COLORS.surface, COLORS.neutral];

    instantiateChart('stageChart', {
        type: 'doughnut',
        data: {
            labels,
            datasets: [
                {
                    label: 'Vitórias',
                    data: wins,
                    backgroundColor: labels.map((_, index) => colorPalette[index % colorPalette.length]),
                    borderWidth: 1.5,
                },
                {
                    label: 'Derrotas',
                    data: losses,
                    backgroundColor: labels.map(() => COLORS.danger),
                    borderWidth: 1.5,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '55%',
            plugins: {
                legend: { position: 'bottom' },
                tooltip: { enabled: true },
            },
        },
    });
}

function renderPerformanceByAthlete(state) {
    const performance = computePerformanceByAthlete(state)
        .filter(item => item.fights > 0)
        .sort((a, b) => b.winRate - a.winRate)
        .slice(0, 12);

    if (!performance.length) {
        destroyChart('athletePerformanceChart');
        return;
    }

    const labels = performance.map(item => item.athlete);
    const winRates = performance.map(item => Math.round(item.winRate * 100));

    instantiateChart('athletePerformanceChart', {
        type: 'bar',
        data: {
            labels,
            datasets: [
                {
                    label: 'Aproveitamento (%)',
                    data: winRates,
                    backgroundColor: winRates.map(rate => (rate >= 50 ? COLORS.accent : COLORS.danger)),
                    borderColor: winRates.map(rate => (rate >= 50 ? COLORS.accent : COLORS.danger)),
                    borderWidth: 1.5,
                },
            ],
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: value => `${value}%`,
                    },
                    grid: { color: COLORS.surface },
                },
                y: {
                    grid: { display: false },
                },
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: context => `${context.parsed.x}%`,
                    },
                },
            },
        },
    });
}

function renderAveragePoints(state) {
    const series = computeAveragePointsPerRound(state)
        .sort((a, b) => a.roundNumber - b.roundNumber);

    if (!series.length) {
        destroyChart('roundPerformanceChart');
        return;
    }

    const labels = series.map(item => `${item.roundNumber}º Round`);
    const ourAverages = series.map(item => Number(item.ourAvg?.toFixed(2) ?? 0));
    const opponentAverages = series.map(item => Number(item.opponentAvg?.toFixed(2) ?? 0));

    instantiateChart('roundPerformanceChart', {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'Nossa média',
                    data: ourAverages,
                    borderColor: COLORS.accent,
                    backgroundColor: 'rgba(6, 182, 212, 0.15)',
                    tension: 0.35,
                    fill: true,
                    pointRadius: 4,
                },
                {
                    label: 'Média adversária',
                    data: opponentAverages,
                    borderColor: COLORS.danger,
                    backgroundColor: 'rgba(223, 63, 64, 0.15)',
                    tension: 0.35,
                    fill: true,
                    pointRadius: 4,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: COLORS.surface },
                },
                x: {
                    grid: { display: false },
                },
            },
            plugins: {
                legend: { position: 'top' },
            },
        },
    });
}

function renderPenaltiesByCoach(state) {
    const series = computePenaltiesByCoach(state)
        .filter(item => (item.accepted + item.overturned) > 0)
        .slice(0, 12);
    if (!series.length) {
        destroyChart('penaltiesByCoachChart');
        return;
    }
    const labels = series.map(i => i.coach || '—');
    const accepted = series.map(i => i.accepted || 0);
    const overturned = series.map(i => i.overturned || 0);
    instantiateChart('penaltiesByCoachChart', {
        type: 'bar',
        data: {
            labels,
            datasets: [
                { label: 'Aceitas', data: accepted, backgroundColor: COLORS.danger, borderColor: COLORS.danger, borderWidth: 1.5 },
                { label: 'Revertidas', data: overturned, backgroundColor: COLORS.secondary, borderColor: COLORS.secondary, borderWidth: 1.5 },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            scales: { x: { grid: { display: false } }, y: { beginAtZero: true, grid: { color: COLORS.surface } } },
            plugins: { legend: { position: 'top' } },
        },
    });
}

function renderPenaltiesByAthlete(state) {
    const series = computePenaltiesByAthlete(state)
        .filter(item => (item.penalties) > 0)
        .slice(0, 12);
    if (!series.length) {
        destroyChart('penaltiesByAthleteChart');
        return;
    }
    const labels = series.map(i => i.athlete || '—');
    const penalties = series.map(i => i.penalties || 0);
    instantiateChart('penaltiesByAthleteChart', {
        type: 'bar',
        data: { labels, datasets: [{ label: 'Penalidades', data: penalties, backgroundColor: COLORS.primary, borderColor: COLORS.primary, borderWidth: 1.5 }] },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            scales: { x: { beginAtZero: true, grid: { color: COLORS.surface } }, y: { grid: { display: false } } },
            plugins: { legend: { display: false } },
        },
    });
}

function destroyIndividualCharts() {
    while (individualCharts.length) {
        const chart = individualCharts.pop();
        chart.destroy();
    }
}

function renderIndividualFightCharts(state) {
    const container = document.getElementById('individual-charts');
    if (!container) return;

    destroyIndividualCharts();
    container.innerHTML = '';

    const fights = (state.fights || [])
        .filter(fight => Array.isArray(fight.rounds) && fight.rounds.length > 0)
        .slice(0, INDIVIDUAL_LIMIT);

    const Chart = getChartLib();
    if (!Chart) return;

    fights.forEach((fight, index) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'chart-container';
        wrapper.innerHTML = `
            <h3>${fight.athlete_name} — Desempenho por Round</h3>
            <canvas id="individualChart${index}"></canvas>
        `;
        container.appendChild(wrapper);

        const canvas = document.getElementById(`individualChart${index}`);
        if (!canvas) return;

        const roundLabels = fight.rounds.map(round => `Round ${round.round_number}`);
        const pointTotals = fight.rounds.map(round => round.score_our_athlete ?? 0);

        const chart = new Chart(canvas.getContext('2d'), {
            type: 'radar',
            data: {
                labels: roundLabels,
                datasets: [
                    {
                        label: 'Pontuação',
                        data: pointTotals,
                        borderColor: fight.fight_result === 'VITÓRIA' ? COLORS.accent : COLORS.danger,
                        backgroundColor: fight.fight_result === 'VITÓRIA'
                            ? 'rgba(6, 182, 212, 0.25)'
                            : 'rgba(223, 63, 64, 0.25)',
                        pointBackgroundColor: pointTotals.map(() => COLORS.primary),
                        pointBorderColor: '#fff',
                        borderWidth: 1.5,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    r: {
                        beginAtZero: true,
                        grid: { color: 'rgba(99, 102, 241, 0.15)' },
                        angleLines: { color: 'rgba(99, 102, 241, 0.15)' },
                    },
                },
            },
        });

        individualCharts.push(chart);
    });
}

function renderAllCharts(state) {
    renderWinsByCategory(state);
    renderWinsByPhase(state);
    renderPerformanceByAthlete(state);
    renderAveragePoints(state);
    renderPenaltiesByCoach(state);
    renderPenaltiesByAthlete(state);
    renderIndividualFightCharts(state);
}

export function initializeCharts(state) {
    applyDefaults();
        renderAllCharts(state);
    return true;
}

export function refreshCharts(state) {
        renderAllCharts(state);
    return true;
}

export function disposeCharts() {
    chartRegistry.forEach(chart => chart.destroy());
    chartRegistry.clear();
    destroyIndividualCharts();
}
