import * as TabsModule from './modules/tabs.js';
import * as ChartsModule from './modules/charts.js';
import * as DataStoreModule from './modules/data-store.js';
import * as ExportsModule from './modules/exports.js';
import * as AthleteTemplates from './templates/athletes.js';
import * as FightTemplates from './templates/fights.js';
import * as PenaltiesTemplates from './templates/penalties.js';

window.__appModules = {
    tabs: TabsModule,
    charts: ChartsModule,
    dataStore: DataStoreModule,
    exports: ExportsModule,
    athletes: AthleteTemplates,
    fights: FightTemplates,
    penalties: PenaltiesTemplates,
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

function setupPenalties() {
    ensureCollections();
    const addBtn = document.getElementById('add-penalty');
    if (addBtn) addBtn.addEventListener('click', () => {
        if (window.modalRegistry?.open) { window.modalRegistry.open('penalty-modal'); return; }
        const name = (prompt('Nome da penalidade:') || '').trim();
        if (!name) return;
        const severity = (prompt('Severidade (MINOR/MAJOR/DISQUALIFYING):') || 'MINOR').trim().toUpperCase();
        const description = (prompt('Descrição (opcional):') || '').trim();
        us5OnPenaltySubmit({ name, severity, description });
    });
}

function isPenaltyInUse(penaltyId) {
    const fights = tournamentState.fights || [];
    for (const f of fights) {
        const ps = f.penaltySummary || [];
        if (ps.some(p => p.penaltyTypeId === penaltyId || p.penalty_type_id === penaltyId)) return true;
        for (const r of (f.rounds || [])) {
            const rs = r.penalties || [];
            if (rs.some(p => p.penaltyTypeId === penaltyId || p.penalty_type_id === penaltyId)) return true;
        }
    }
    return false;
}

function refreshPenaltiesUI() {
    ensureCollections();
    const mount = document.getElementById('penalties-list');
    if (!mount) return;
    mount.innerHTML = '';
    const handlers = {
        onEdit: (pt) => {
            const name = (prompt('Nome da penalidade:', pt.name || '') || '').trim();
            if (!name) return;
            const severity = (prompt('Severidade (MINOR/MAJOR/DISQUALIFYING):', pt.severity || 'MINOR') || 'MINOR').trim().toUpperCase();
            const description = (prompt('Descrição (opcional):', pt.description || '') || '').trim();
            pt.name = name; pt.severity = severity; pt.description = description; pt.updatedAt = new Date().toISOString();
            saveData();
            refreshPenaltiesUI();
        },
        onDelete: (pt) => {
            if (isPenaltyInUse(pt.id)) { alert('Não é possível excluir penalidade em uso.'); return; }
            if (!confirm('Excluir penalidade?')) return;
            tournamentState.penaltyTypes = tournamentState.penaltyTypes.filter(x => x.id !== pt.id);
            saveData();
            refreshPenaltiesUI();
        }
    };
    mount.appendChild(PenaltiesTemplates.renderPenaltiesList(tournamentState.penaltyTypes, handlers));
}

function us5OnPenaltySubmit(input) {
    ensureCollections();
    const name = String(input?.name || '').trim();
    if (!name) return;
    const severity = ['MINOR','MAJOR','DISQUALIFYING'].includes(String(input?.severity || '').toUpperCase()) ? String(input.severity).toUpperCase() : 'MINOR';
    const description = String(input?.description || '').trim();
    tournamentState.penaltyTypes.push({ id: uuid(), name, severity, description, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    saveData();
    refreshPenaltiesUI();
}

function ensureCollections() {
    tournamentState.coaches = Array.isArray(tournamentState.coaches) ? tournamentState.coaches : [];
    tournamentState.trainingLocations = Array.isArray(tournamentState.trainingLocations) ? tournamentState.trainingLocations : [];
    tournamentState.penaltyTypes = Array.isArray(tournamentState.penaltyTypes) ? tournamentState.penaltyTypes : [];
}

function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function isCoachNameTaken(name, exceptId) {
    const n = String(name || '').trim().toLowerCase();
    return (tournamentState.coaches || []).some(c => c.id !== exceptId && String(c.fullName || '').trim().toLowerCase() === n);
}

function setupCoachesLocations() {
    ensureCollections();
    const addCoachBtn = document.getElementById('add-coach');
    const addLocBtn = document.getElementById('add-location');
    if (addCoachBtn) addCoachBtn.addEventListener('click', () => {
        if (window.modalRegistry?.open) { window.modalRegistry.open('coach-modal'); return; }
        const name = (prompt('Nome do técnico:') || '').trim();
        if (!name) return;
        if (isCoachNameTaken(name)) { alert('Nome de técnico já existe.'); return; }
        tournamentState.coaches.push({ id: uuid(), fullName: name, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
        saveData();
        refreshCoachesUI();
        updateCoachOptions();
    });
    if (addLocBtn) addLocBtn.addEventListener('click', () => {
        if (window.modalRegistry?.open) { window.modalRegistry.open('location-modal'); return; }
        const name = (prompt('Nome do local de treino:') || '').trim();
        if (!name) return;
        tournamentState.trainingLocations.push({ id: uuid(), name, responsibleCoachIds: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
        saveData();
        refreshLocationsUI();
    });
}

function refreshCoachesUI() {
    ensureCollections();
    const mount = document.getElementById('coaches-list');
    if (!mount) return;
    mount.innerHTML = '';
    const handlers = {
        onEdit: (coach) => {
            const newName = (prompt('Novo nome do técnico:', coach.fullName || '') || '').trim();
            if (!newName) return;
            if (isCoachNameTaken(newName, coach.id)) { alert('Nome de técnico já existe.'); return; }
            const oldName = coach.fullName;
            coach.fullName = newName;
            coach.updatedAt = new Date().toISOString();
            // Sync references in fights
            (tournamentState.fights || []).forEach(f => { if (f.coach === oldName) f.coach = newName; });
            saveData();
            refreshCoachesUI();
            updateCoachOptions();
            populateResults();
            createCharts();
        },
        onDelete: (coach) => {
            if (!confirm('Excluir técnico?')) return;
            const oldName = coach.fullName;
            tournamentState.coaches = tournamentState.coaches.filter(c => c.id !== coach.id);
            (tournamentState.fights || []).forEach(f => { if (f.coach === oldName) f.coach = ''; });
            saveData();
            refreshCoachesUI();
            updateCoachOptions();
            populateResults();
            createCharts();
        }
    };
    mount.appendChild(PenaltiesTemplates.renderCoachesList(tournamentState.coaches, handlers));
}

function refreshLocationsUI() {
    ensureCollections();
    const mount = document.getElementById('locations-list');
    if (!mount) return;
    mount.innerHTML = '';
    const handlers = {
        onEdit: (loc) => {
            const newName = (prompt('Novo nome do local:', loc.name || '') || '').trim();
            if (!newName) return;
            loc.name = newName;
            loc.updatedAt = new Date().toISOString();
            saveData();
            refreshLocationsUI();
        },
        onDelete: (loc) => {
            if (!confirm('Excluir local?')) return;
            tournamentState.trainingLocations = tournamentState.trainingLocations.filter(l => l.id !== loc.id);
            saveData();
            refreshLocationsUI();
        }
    };
    mount.appendChild(PenaltiesTemplates.renderTrainingLocationsList(tournamentState.trainingLocations, tournamentState.coaches, handlers));
}

function updateCoachOptions() {
    const dataList = document.getElementById('coach-options');
    if (!dataList) return;
    dataList.innerHTML = '';
    (tournamentState.coaches || []).forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.fullName || '';
        dataList.appendChild(opt);
    });
}

function us4OnCoachSubmit(name) {
    ensureCollections();
    const n = String(name || '').trim();
    if (!n) return;
    if (isCoachNameTaken(n)) { alert('Nome de técnico já existe.'); return; }
    tournamentState.coaches.push({ id: uuid(), fullName: n, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    saveData();
    refreshCoachesUI();
    updateCoachOptions();
}

function us4OnLocationSubmit(name, coachIds) {
    ensureCollections();
    const n = String(name || '').trim();
    if (!n) return;
    const ids = Array.isArray(coachIds) ? coachIds.filter(Boolean) : [];
    tournamentState.trainingLocations.push({ id: uuid(), name: n, responsibleCoachIds: ids, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    saveData();
    refreshLocationsUI();
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
    get() {
        return athletesData;
    },
    set(val) {
        athletesData = Array.isArray(val) ? val : [];
    },
});

setGlobalAccessor('tournamentState', {
    get() {
        return tournamentState;
    },
    set(val) {
        if (val && typeof val === 'object') hydrateFromTournamentState(val);
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
    setupFightFilters();
    mountAnalysisExportBar();
    setupCoachesLocations();
    refreshCoachesUI();
    refreshLocationsUI();
    updateCoachOptions();
    setupPenalties();
    refreshPenaltiesUI();
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
        analyticsCache: null,
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
    refreshCoachesUI();
    refreshLocationsUI();
    updateCoachOptions();
    refreshPenaltiesUI();
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
    if (!filteredAthletes.length) {
        const empty = document.createElement('div');
        empty.style.cssText = 'text-align:center;color:#666;padding:1rem;';
        empty.textContent = 'Nenhum atleta corresponde aos filtros.';
        athletesGrid.appendChild(empty);
        mountAthleteExportBar(filteredAthletes);
        return;
    }
    const frag = AthleteTemplates.renderAthleteCards(filteredAthletes);
    athletesGrid.appendChild(frag);
    mountAthleteExportBar(filteredAthletes);
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
    const view = (document.getElementById('fight-view')?.value || 'table');
    const tbody = document.querySelector('#results-table tbody');
    const grid = document.getElementById('fights-grid');
    if (tbody) tbody.innerHTML = '';
    if (grid) grid.innerHTML = '';
    const data = getFilteredFights();
    const tableWrap = document.querySelector('.results-table-container');
    if (view === 'cards') {
        if (tableWrap) tableWrap.style.display = 'none';
        if (grid) grid.appendChild(FightTemplates.renderFightCards(data));
    } else {
        if (tableWrap) tableWrap.style.display = '';
        data.forEach((athlete, index) => {
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
}

// Filter setup
function setupFilters() {
    const categoryFilter = document.getElementById('category-filter');
    const resultFilter = document.getElementById('result-filter');
    
    categoryFilter.addEventListener('change', populateAthletes);
    resultFilter.addEventListener('change', populateAthletes);
}

function setupFightFilters() {
    const s = document.getElementById('fight-search');
    const c = document.getElementById('fight-category-filter');
    const p = document.getElementById('fight-phase-filter');
    const v = document.getElementById('fight-view');
    const add = document.getElementById('add-fight');
    if (s) s.addEventListener('input', populateResults);
    if (c) c.addEventListener('change', populateResults);
    if (p) p.addEventListener('change', populateResults);
    if (v) v.addEventListener('change', populateResults);
    if (add) add.addEventListener('click', () => {
        if (typeof window.openAddFightModal === 'function') {
            window.openAddFightModal();
        } else if (typeof window.openAddAthleteModal === 'function') {
            window.openAddAthleteModal();
        } else {
            const modal = document.getElementById('edit-modal');
            if (modal) modal.style.display = 'block';
        }
    });
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

function getFilteredFights() {
    const t = (document.getElementById('fight-search')?.value || '').toLowerCase();
    const c = document.getElementById('fight-category-filter')?.value || '';
    const p = document.getElementById('fight-phase-filter')?.value || '';
    return (athletesData || []).filter((f) => {
        const matchText = !t ||
            (f.athlete_name || '').toLowerCase().includes(t) ||
            (f.opponent_name || '').toLowerCase().includes(t) ||
            (f.coach || '').toLowerCase().includes(t);
        const matchCat = !c || f.category === c;
        const matchPhase = !p || f.stage === p;
        return matchText && matchCat && matchPhase;
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

function mountAnalysisExportBar() {
    const wrap = document.getElementById('analysis-export-bar');
    if (!wrap) return;
    wrap.innerHTML = '';
    const row = document.createElement('div');
    row.className = 'export-buttons';
    const b1 = document.createElement('button');
    b1.className = 'export-btn';
    b1.textContent = 'Exportar JSON';
    b1.addEventListener('click', () => {
        const bundle = DataStoreModule.withAnalytics(tournamentState).analyticsCache;
        ExportsModule.exportAnalytics(bundle, 'json');
    });
    const b2 = document.createElement('button');
    b2.className = 'export-btn';
    b2.textContent = 'Exportar CSV';
    b2.addEventListener('click', () => {
        const bundle = DataStoreModule.withAnalytics(tournamentState).analyticsCache;
        ExportsModule.exportAnalytics(bundle, 'csv');
    });
    row.appendChild(b1);
    row.appendChild(b2);
    wrap.appendChild(row);
}

function getFilteredRoster() {
    const list = getFilteredAthletes();
    return AthleteTemplates.toAthleteRoster(list);
}

function mountAthleteExportBar(currentList) {
    const section = document.getElementById('athletes');
    if (!section) return;
    let container = document.getElementById('athletes-export-bar');
    if (!container) {
        container = document.createElement('div');
        container.id = 'athletes-export-bar';
        const grid = document.getElementById('athletes-grid');
        if (grid && grid.parentNode) {
            grid.parentNode.insertBefore(container, grid.nextSibling);
        } else {
            section.appendChild(container);
        }
    }
    container.innerHTML = '';
    const build = AthleteTemplates.buildExportBar(
        () => ExportsModule.exportAthletes(AthleteTemplates.toAthleteRoster(currentList), 'csv'),
        () => ExportsModule.exportAthletes(AthleteTemplates.toAthleteRoster(currentList), 'json')
    );
    container.appendChild(build);
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
        <div class="penalty-controls" style="display:flex;align-items:center;gap:8px;">
            <label style="display:flex;align-items:center;gap:6px;"><input type="checkbox" data-field="has_penalty"> Penalidade?</label>
            <select data-field="penalty_assessed">
                <option value="ATHLETE">Contra Atleta</option>
                <option value="OPPONENT">Contra Oponente</option>
            </select>
            <label style="display:flex;align-items:center;gap:6px;"><input type="checkbox" data-field="penalty_accepted" checked> Aceita</label>
        </div>
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
    const creating = currentEditingIndex === -1;
    const penaltySummary = [];
    let athlete = creating ? {
        category: document.getElementById('athlete-category')?.value || '',
        weight_class: document.getElementById('athlete-weight')?.value || '',
        athlete_name: document.getElementById('athlete-name')?.value || '',
        opponent_name: '',
        opponent_team: '',
        stage: 'A Definir',
        rounds: [],
        coach: '',
        fight_result: 'A Definir'
    } : athletesData[currentEditingIndex];
    
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

        const hasPenalty = item.querySelector('[data-field="has_penalty"]')?.checked;
        if (hasPenalty) {
            const assessed = item.querySelector('[data-field="penalty_assessed"]')?.value || 'ATHLETE';
            const accepted = item.querySelector('[data-field="penalty_accepted"]')?.checked !== false;
            round.penalties = [{ assessedAgainst: assessed, accepted }];
            penaltySummary.push({ assessedAgainst: assessed, accepted });
        }
        
        athlete.rounds.push(round);
    });

    if (penaltySummary.length) {
        athlete.penaltySummary = penaltySummary;
    }
    
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
    
    if (creating) {
        athletesData.push(athlete);
        currentEditingIndex = athletesData.length - 1;
        window.currentEditingIndex = currentEditingIndex;
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
    getFilteredFights,
    mountAnalysisExportBar,
    getFilteredRoster,
    mountAthleteExportBar,
    refreshCoachesUI,
    refreshLocationsUI,
    updateCoachOptions,
    us4OnCoachSubmit,
    us4OnLocationSubmit,
    refreshPenaltiesUI,
    us5OnPenaltySubmit,
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
