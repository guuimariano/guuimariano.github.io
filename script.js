import * as TabsModule from './modules/tabs.js';
import * as ChartsModule from './modules/charts.js';
import * as DataStoreModule from './modules/data-store.js';
import * as ExportsModule from './modules/exports.js';

window.__appModules = {
    tabs: TabsModule,
    charts: ChartsModule,
    dataStore: DataStoreModule,
    exports: ExportsModule,
};

// Global state managed via the data-store module
let tournamentState = DataStoreModule.withAnalytics(DataStoreModule.getDefaultTournamentState());
let athletesData = tournamentState.fights || [];
let currentEditingIndex = -1;

function hydrateFromTournamentState(state) {
    const baseState = DataStoreModule.getDefaultTournamentState();
    tournamentState = DataStoreModule.withAnalytics({ ...baseState, ...state });
    athletesData = tournamentState.fights || [];
    window.athletesData = athletesData;
    return athletesData;
}

function setGlobalAccessor(key, { get, set }) {
    Object.defineProperty(window, key, {
        configurable: true,
        enumerable: false,
        get,
        set,
    });
}

setGlobalAccessor('athletesData', {
    get: () => athletesData,
    set: (value) => {
        athletesData = Array.isArray(value) ? value : [];
    },
});

setGlobalAccessor('currentEditingIndex', {
    get: () => currentEditingIndex,
    set: (value) => {
        currentEditingIndex = typeof value === 'number' ? value : -1;
    },
});

setGlobalAccessor('tournamentState', {
    get: () => tournamentState,
    set: (value) => {
        if (value && typeof value === 'object') {
            hydrateFromTournamentState(value);
        }
    },
});

window.athletesData = athletesData;
window.currentEditingIndex = currentEditingIndex;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    TabsModule.initTabs({
        defaultTab: 'dashboard',
        storageKey: 'spa:last-active-tab',
        onChange: () => {
            if (chartsInitialized) {
                createCharts();
            }
        },
    });
    setupModal();
    setupFilters();
});

function loadData() {
    try {
        const loadedState = DataStoreModule.loadTournamentState();
        hydrateFromTournamentState(loadedState);
    } catch (error) {
        console.error('Error loading data:', error);
        hydrateFromTournamentState(DataStoreModule.resetTournamentState());
    }

    updateDashboard();
    populateAthletes();
    populateResults();
    createCharts();
}

// Persist tournament state
function saveData() {
    tournamentState = {
        ...tournamentState,
        fights: athletesData,
    };
    const persisted = DataStoreModule.saveTournamentState(tournamentState);
    hydrateFromTournamentState(persisted);
    return persisted;
}

function resetTournamentData() {
    const resetState = DataStoreModule.resetTournamentState();
    hydrateFromTournamentState(resetState);
    updateDashboard();
    populateAthletes();
    populateResults();
    createCharts();
    return resetState;
}
// Navigation setup
// Update dashboard statistics
function updateDashboard() {
    const totals = DataStoreModule.computeTotals(tournamentState);
    document.getElementById('total-athletes').textContent = totals.athletes ?? totals.fights ?? 0;
    document.getElementById('total-victories').textContent = totals.wins ?? 0;
    document.getElementById('total-defeats').textContent = totals.losses ?? 0;
    document.getElementById('total-pending').textContent = totals.pending ?? 0;
}

// Populate athletes grid
function populateAthletes() {
    const athletesGrid = document.getElementById('athletes-grid');
    athletesGrid.innerHTML = '';
    
    const filteredAthletes = getFilteredAthletes();
    
    filteredAthletes.forEach((athlete, index) => {
        const athleteCard = createAthleteCard(athlete, index);
        athletesGrid.appendChild(athleteCard);
    });
}

// Create athlete card
function createAthleteCard(athlete, index) {
    const card = document.createElement('div');
    card.className = `athlete-card ${getResultClass(athlete.fight_result)}`;
    
    const roundsInfo = athlete.rounds.length > 0 ? 
        athlete.rounds.map(round => 
            `R${round.round_number}: ${round.score_our_athlete || '?'}x${round.score_opponent || '?'} (${round.round_outcome})`
        ).join('<br>') : 
        'Sem rounds registrados';
    
    card.innerHTML = `
        <div class="athlete-name">${athlete.athlete_name}</div>
        <div class="athlete-info">
            <div><strong>Categoria:</strong> ${athlete.category}</div>
            <div><strong>Peso:</strong> ${athlete.weight_class}</div>
            <div><strong>Oponente:</strong> ${athlete.opponent_name}</div>
            <div><strong>Fase:</strong> ${athlete.stage}</div>
            <div><strong>Técnico:</strong> ${athlete.coach || 'N/A'}</div>
            <div><strong>Equipe Oponente:</strong> ${athlete.opponent_team}</div>
        </div>
        <div class="rounds-info" style="font-size: 0.8rem; margin-bottom: 1rem; color: #666;">
            ${roundsInfo}
        </div>
        <div class="fight-result ${getResultClass(athlete.fight_result)}">
            ${athlete.fight_result}
        </div>
    `;
    
    return card;
}

// Get result class for styling
function getResultClass(result) {
    switch(result) {
        case 'VITÓRIA': return 'victory';
        case 'DERROTA': return 'defeat';
        default: return 'pending';
    }
}

// Populate results table
function populateResults() {
    const tbody = document.querySelector('#results-table tbody');
    tbody.innerHTML = '';
    
    athletesData.forEach((athlete, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${athlete.athlete_name}</td>
            <td>${athlete.category}</td>
            <td>${athlete.weight_class}</td>
            <td>${athlete.opponent_name}</td>
            <td>${athlete.stage}</td>
            <td><span class="result-badge ${getResultClass(athlete.fight_result)}">${athlete.fight_result}</span></td>
            <td><button class="edit-btn" onclick="openEditModal(${index})">Editar</button></td>
        `;
        tbody.appendChild(row);
    });
}

// Filter setup
function setupFilters() {
    const categoryFilter = document.getElementById('category-filter');
    const resultFilter = document.getElementById('result-filter');
    
    categoryFilter.addEventListener('change', populateAthletes);
    resultFilter.addEventListener('change', populateAthletes);
}

// Get filtered athletes
function getFilteredAthletes() {
    const categoryFilter = document.getElementById('category-filter').value;
    const resultFilter = document.getElementById('result-filter').value;
    
    return athletesData.filter(athlete => {
        const categoryMatch = !categoryFilter || athlete.category === categoryFilter;
        const resultMatch = !resultFilter || athlete.fight_result === resultFilter;
        return categoryMatch && resultMatch;
    });
}

let chartsInitialized = false;

function createCharts() {
    if (!chartsInitialized) {
        ChartsModule.initializeCharts(tournamentState);
        chartsInitialized = true;
    } else {
        ChartsModule.refreshCharts(tournamentState);
    }
}

// Modal setup
function setupModal() {
    const modal = document.getElementById('edit-modal');
    const closeBtn = document.querySelector('.close');
    const cancelBtn = document.getElementById('cancel-edit');
    const form = document.getElementById('edit-form');
    const addRoundBtn = document.getElementById('add-round');
    
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    form.addEventListener('submit', saveEdit);
    addRoundBtn.addEventListener('click', addRound);
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });
}

// Open edit modal
function openEditModal(index) {
    currentEditingIndex = index;
    window.currentEditingIndex = currentEditingIndex;
    const athlete = athletesData[index];
    const modal = document.getElementById('edit-modal');
    
    // Populate form fields
    document.getElementById('athlete-name').value = athlete.athlete_name;
    document.getElementById('opponent-name').value = athlete.opponent_name;
    document.getElementById('opponent-team').value = athlete.opponent_team;
    document.getElementById('stage').value = athlete.stage;
    document.getElementById('coach').value = athlete.coach;
    
    // Populate rounds
    populateRounds(athlete.rounds);
    
    modal.style.display = 'block';
}

// Close modal
function closeModal() {
    document.getElementById('edit-modal').style.display = 'none';
    currentEditingIndex = -1;
    window.currentEditingIndex = currentEditingIndex;
}

// Populate rounds in modal
function populateRounds(rounds) {
    const container = document.getElementById('rounds-container');
    container.innerHTML = '';
    
    rounds.forEach((round, index) => {
        addRoundToModal(round, index);
    });
    
    // Add empty round if no rounds exist
    if (rounds.length === 0) {
        addRoundToModal({
            round_number: 1,
            score_our_athlete: null,
            score_opponent: null,
            round_outcome: 'A Definir'
        }, 0);
    }
}

// Add round to modal
function addRoundToModal(round, index) {
    const container = document.getElementById('rounds-container');
    const roundDiv = document.createElement('div');
    roundDiv.className = 'round-item';
    roundDiv.innerHTML = `
        <label>Round ${round.round_number}:</label>
        <input type="number" placeholder="Nossa pontuação" value="${round.score_our_athlete || ''}" data-field="score_our_athlete" data-index="${index}">
        <input type="number" placeholder="Pontuação oponente" value="${round.score_opponent || ''}" data-field="score_opponent" data-index="${index}">
        <button type="button" class="remove-round" onclick="removeRound(${index})">Remover</button>
    `;
    container.appendChild(roundDiv);
}

// Add new round
function addRound() {
    const container = document.getElementById('rounds-container');
    const roundCount = container.children.length;
    const newRound = {
        round_number: roundCount + 1,
        score_our_athlete: null,
        score_opponent: null,
        round_outcome: 'A Definir'
    };
    addRoundToModal(newRound, roundCount);
}

// Remove round
function removeRound(index) {
    const container = document.getElementById('rounds-container');
    const roundItems = container.querySelectorAll('.round-item');
    if (roundItems.length > 1) {
        roundItems[index].remove();
        // Update indices
        updateRoundIndices();
    }
}

// Update round indices after removal
function updateRoundIndices() {
    const container = document.getElementById('rounds-container');
    const roundItems = container.querySelectorAll('.round-item');
    roundItems.forEach((item, index) => {
        const label = item.querySelector('label');
        label.textContent = `Round ${index + 1}:`;
        const inputs = item.querySelectorAll('input');
        inputs.forEach(input => {
            input.setAttribute('data-index', index);
        });
        const removeBtn = item.querySelector('.remove-round');
        removeBtn.setAttribute('onclick', `removeRound(${index})`);
    });
}

// Save edit
function saveEdit(event) {
    event.preventDefault();
    
    if (currentEditingIndex === -1) return;
    
    const athlete = athletesData[currentEditingIndex];
    
    // Update basic info
    athlete.opponent_name = document.getElementById('opponent-name').value;
    athlete.opponent_team = document.getElementById('opponent-team').value;
    athlete.stage = document.getElementById('stage').value;
    athlete.coach = document.getElementById('coach').value;
    
    // Update rounds
    const roundItems = document.querySelectorAll('.round-item');
    athlete.rounds = [];
    
    roundItems.forEach((item, index) => {
        const scoreOur = item.querySelector('[data-field="score_our_athlete"]').value;
        const scoreOpp = item.querySelector('[data-field="score_opponent"]').value;
        
        const round = {
            round_number: index + 1,
            score_our_athlete: scoreOur ? parseInt(scoreOur) : null,
            score_opponent: scoreOpp ? parseInt(scoreOpp) : null,
            gap_info: '',
            round_outcome: 'A Definir'
        };
        
        // Determine round outcome
        if (round.score_our_athlete !== null && round.score_opponent !== null) {
            if (round.score_our_athlete > round.score_opponent) {
                round.round_outcome = 'VITÓRIA';
            } else if (round.score_opponent > round.score_our_athlete) {
                round.round_outcome = 'DERROTA';
            } else {
                round.round_outcome = 'EMPATE';
            }
        }
        
        athlete.rounds.push(round);
    });
    
    // Determine fight result
    const wins = athlete.rounds.filter(r => r.round_outcome === 'VITÓRIA').length;
    const losses = athlete.rounds.filter(r => r.round_outcome === 'DERROTA').length;
    
    if (wins > losses) {
        athlete.fight_result = 'VITÓRIA';
    } else if (losses > wins) {
        athlete.fight_result = 'DERROTA';
    } else if (wins === 0 && losses === 0) {
        athlete.fight_result = 'A Definir';
    } else {
        athlete.fight_result = 'A Definir'; // Tie case
    }
    
    // Persist latest data snapshot
    saveData();
    
    // Update UI
    updateDashboard();
    populateAthletes();
    populateResults();
    createCharts();
    
    // Close modal
    closeModal();
}

Object.assign(window, {
    loadData,
    saveData,
    resetTournamentData,
    hydrateFromTournamentState,
    updateDashboard,
    populateAthletes,
    createAthleteCard,
    getResultClass,
    populateResults,
    setupFilters,
    getFilteredAthletes,
    createCharts,
    setActiveTab: TabsModule.setActiveTab,
    getActiveTabId: TabsModule.getActiveTabId,
    setupModal,
    openEditModal,
    closeModal,
    populateRounds,
    addRoundToModal,
    addRound,
    removeRound,
    updateRoundIndices,
    saveEdit
});
