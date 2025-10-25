// Advanced features for the Taekwondo championship website

// Add new athlete functionality
function setupAddAthleteFeature() {
    // Add button to athletes section
    const athletesSection = document.getElementById('athletes');
    const addButton = document.createElement('button');
    addButton.className = 'add-athlete-btn';
    addButton.innerHTML = '+ Adicionar Atleta';
    addButton.onclick = openAddAthleteModal;
    
    const sectionTitle = athletesSection.querySelector('.section-title');
    sectionTitle.insertAdjacentElement('afterend', addButton);
}

// Open add athlete modal
function openAddAthleteModal() {
    currentEditingIndex = -1; // Indicate we're adding, not editing
    const modal = document.getElementById('edit-modal');
    
    // Clear form fields
    document.getElementById('athlete-name').value = '';
    document.getElementById('athlete-name').readOnly = false;
    document.getElementById('opponent-name').value = 'A Definir';
    document.getElementById('opponent-team').value = 'N/A';
    document.getElementById('stage').value = 'A Definir';
    document.getElementById('coach').value = '';
    
    // Add category and weight class fields for new athletes
    addCategoryAndWeightFields();
    
    // Clear rounds
    document.getElementById('rounds-container').innerHTML = '';
    addRound();
    
    // Change modal title
    modal.querySelector('h2').textContent = 'Adicionar Novo Atleta';
    
    modal.style.display = 'block';
}

// Add category and weight class fields to the form
function addCategoryAndWeightFields() {
    const form = document.getElementById('edit-form');
    const athleteNameGroup = form.querySelector('.form-group');
    
    // Check if fields already exist
    if (document.getElementById('athlete-category')) return;
    
    // Category field
    const categoryGroup = document.createElement('div');
    categoryGroup.className = 'form-group';
    categoryGroup.innerHTML = `
        <label for="athlete-category">Categoria:</label>
        <select id="athlete-category">
            <option value="INFANTIL">Infantil</option>
            <option value="JUVENIL">Juvenil</option>
        </select>
    `;
    
    // Weight class field
    const weightGroup = document.createElement('div');
    weightGroup.className = 'form-group';
    weightGroup.innerHTML = `
        <label for="athlete-weight">Classe de Peso:</label>
        <input type="text" id="athlete-weight" placeholder="Ex: -35, +45">
    `;
    
    athleteNameGroup.insertAdjacentElement('afterend', weightGroup);
    athleteNameGroup.insertAdjacentElement('afterend', categoryGroup);
}

// Enhanced save function to handle new athletes
function enhancedSaveEdit(event) {
    event.preventDefault();
    
    const isNewAthlete = currentEditingIndex === -1;
    let athlete;
    
    if (isNewAthlete) {
        // Create new athlete
        athlete = {
            category: document.getElementById('athlete-category').value,
            weight_class: document.getElementById('athlete-weight').value,
            athlete_name: document.getElementById('athlete-name').value,
            opponent_name: document.getElementById('opponent-name').value,
            opponent_team: document.getElementById('opponent-team').value,
            stage: document.getElementById('stage').value,
            rounds: [],
            coach: document.getElementById('coach').value,
            fight_result: 'A Definir'
        };
        
        // Validate required fields
        if (!athlete.athlete_name || !athlete.weight_class) {
            alert('Por favor, preencha o nome do atleta e a classe de peso.');
            return;
        }
        
        athletesData.push(athlete);
        currentEditingIndex = athletesData.length - 1;
    } else {
        athlete = athletesData[currentEditingIndex];
        
        // Update basic info
        athlete.opponent_name = document.getElementById('opponent-name').value;
        athlete.opponent_team = document.getElementById('opponent-team').value;
        athlete.stage = document.getElementById('stage').value;
        athlete.coach = document.getElementById('coach').value;
    }
    
    // Update rounds (same as before)
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
        athlete.fight_result = 'A Definir';
    }
    
    // Save to localStorage
    saveData();
    
    // Update UI
    updateDashboard();
    populateAthletes();
    populateResults();
    createCharts();
    
    // Close modal and reset
    closeModal();
    resetModalForEdit();
}

// Reset modal for editing mode
function resetModalForEdit() {
    const modal = document.getElementById('edit-modal');
    modal.querySelector('h2').textContent = 'Editar Resultado';
    document.getElementById('athlete-name').readOnly = true;
    
    // Remove category and weight fields if they exist
    const categoryField = document.getElementById('athlete-category');
    const weightField = document.getElementById('athlete-weight');
    if (categoryField) categoryField.parentElement.remove();
    if (weightField) weightField.parentElement.remove();
}

// Delete athlete functionality
function deleteAthlete(index) {
    if (confirm('Tem certeza que deseja excluir este atleta?')) {
        athletesData.splice(index, 1);
        saveData();
        updateDashboard();
        populateAthletes();
        populateResults();
        createCharts();
    }
}

// Enhanced populate results with delete button
function enhancedPopulateResults() {
    const tbody = document.querySelector('#results-table tbody');
    const grid = document.getElementById('fights-grid');
    const tableWrap = document.querySelector('#fights .results-table-container');
    if (tbody) tbody.innerHTML = '';
    if (grid) grid.innerHTML = '';

    const select = document.getElementById('fight-view');
    const selectView = (select && select.value) || 'table';
    const isMobile = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 1279px)').matches;
    const useCards = isMobile || selectView === 'cards';

    const data = (typeof window.getFilteredFights === 'function') ? window.getFilteredFights() : (Array.isArray(athletesData) ? athletesData : []);

    if (useCards) {
        if (tableWrap) {
            try { tableWrap.style.setProperty('display','none','important'); } catch(_) { tableWrap.style.display = 'none'; }
            tableWrap.hidden = true;
        }
        const FT = (window.__appModules && window.__appModules.fights) || null;
        if (grid) {
            if (FT && typeof FT.renderFightCards === 'function') {
                grid.appendChild(FT.renderFightCards(data));
            } else {
                // Fallback simple cards
                data.forEach((fight) => {
                    const card = document.createElement('div');
                    card.className = `athlete-card ${getResultClass(fight?.fight_result)}`;
                    card.innerHTML = `
                        <div class="athlete-name">${fight?.athlete_name || '—'}</div>
                        <div class="athlete-info">
                            <div><strong>Categoria:</strong> ${fight?.category || '—'}</div>
                            <div><strong>Peso:</strong> ${fight?.weight_class || '—'}</div>
                            <div><strong>Oponente:</strong> ${fight?.opponent_name || '—'}</div>
                            <div><strong>Fase:</strong> ${fight?.stage || '—'}</div>
                            <div><strong>Técnico:</strong> ${fight?.coach || '—'}</div>
                            <div><strong>Equipe Oponente:</strong> ${fight?.opponent_team || '—'}</div>
                        </div>
                        <div class="fight-result ${getResultClass(fight?.fight_result)}">${fight?.fight_result || 'A Definir'}</div>
                    `;
                    grid.appendChild(card);
                });
            }
        }
        return;
    }

    // Desktop table
    if (tableWrap) {
        try { tableWrap.style.setProperty('display','block','important'); } catch(_) { tableWrap.style.display = ''; }
        tableWrap.hidden = false;
    }
    data.forEach((athlete, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${athlete.athlete_name}</td>
            <td>${athlete.category}</td>
            <td>${athlete.weight_class}</td>
            <td>${athlete.opponent_name}</td>
            <td>${athlete.stage}</td>
            <td><span class="result-badge ${getResultClass(athlete.fight_result)}">${athlete.fight_result}</span></td>
            <td>
                <button class="edit-btn" onclick="openEditModal(${index})">Editar</button>
                <button class="delete-btn" onclick="deleteAthlete(${index})" style="background-color: #dc3545; margin-left: 5px;">Excluir</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Export data functionality
function setupExportFeature() {
    const dashboardSection = document.getElementById('dashboard');
    const exportContainer = document.createElement('div');
    exportContainer.className = 'export-container';
    exportContainer.innerHTML = `
        <h3>Exportar Dados</h3>
        <div class="export-buttons">
            <button onclick="exportToJSON()" class="export-btn">Exportar JSON</button>
            <button onclick="exportToCSV()" class="export-btn">Exportar CSV</button>
            <button onclick="printReport()" class="export-btn">Imprimir Relatório</button>
        </div>
    `;
    
    dashboardSection.appendChild(exportContainer);
}

// Export to JSON
function exportToJSON() {
    const dataStr = JSON.stringify(athletesData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'brazil_open_liga_vale.json';
    link.click();
    URL.revokeObjectURL(url);
}

// Export to CSV
function exportToCSV() {
    const headers = ['Nome', 'Categoria', 'Peso', 'Oponente', 'Equipe Oponente', 'Fase', 'Técnico', 'Resultado', 'Rounds Vencidos', 'Rounds Perdidos'];
    const csvContent = [
        headers.join(','),
        ...athletesData.map(athlete => {
            const wonRounds = athlete.rounds.filter(r => r.round_outcome === 'VITÓRIA').length;
            const lostRounds = athlete.rounds.filter(r => r.round_outcome === 'DERROTA').length;
            
            return [
                `"${athlete.athlete_name}"`,
                athlete.category,
                athlete.weight_class,
                `"${athlete.opponent_name}"`,
                `"${athlete.opponent_team}"`,
                `"${athlete.stage}"`,
                `"${athlete.coach}"`,
                athlete.fight_result,
                wonRounds,
                lostRounds
            ].join(',');
        })
    ].join('\n');
    
    const dataBlob = new Blob([csvContent], {type: 'text/csv'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'brazil_open_liga_vale.csv';
    link.click();
    URL.revokeObjectURL(url);
}

// Print report
function printReport() {
    const printWindow = window.open('', '_blank');
    const printContent = generatePrintReport();
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Brazil Open - Liga Vale - Relatório</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .stats { display: flex; justify-content: space-around; margin-bottom: 30px; }
                .stat-item { text-align: center; }
                .stat-number { font-size: 2em; font-weight: bold; }
                .victory { color: #28a745; }
                .defeat { color: #dc3545; }
                .pending { color: #ffc107; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                .result-victory { background-color: #d4edda; }
                .result-defeat { background-color: #f8d7da; }
                .result-pending { background-color: #fff3cd; }
                @media print { body { margin: 0; } }
            </style>
        </head>
        <body>
            ${printContent}
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
}

// Generate print report content
function generatePrintReport() {
    const totalAthletes = athletesData.length;
    const victories = athletesData.filter(athlete => athlete.fight_result === 'VITÓRIA').length;
    const defeats = athletesData.filter(athlete => athlete.fight_result === 'DERROTA').length;
    const pending = athletesData.filter(athlete => athlete.fight_result === 'A Definir').length;
    
    const infantilAthletes = athletesData.filter(a => a.category === 'INFANTIL');
    const juvenilAthletes = athletesData.filter(a => a.category === 'JUVENIL');
    
    return `
        <div class="header">
            <h1>Brazil Open - PR</h1>
            <h2>Liga Vale</h2>
            <p>Relatório do Campeonato de Taekwondo</p>
            <p>Data: ${new Date().toLocaleDateString('pt-BR')}</p>
        </div>
        
        <div class="stats">
            <div class="stat-item">
                <div class="stat-number">${totalAthletes}</div>
                <div>Total de Atletas</div>
            </div>
            <div class="stat-item">
                <div class="stat-number victory">${victories}</div>
                <div>Vitórias</div>
            </div>
            <div class="stat-item">
                <div class="stat-number defeat">${defeats}</div>
                <div>Derrotas</div>
            </div>
            <div class="stat-item">
                <div class="stat-number pending">${pending}</div>
                <div>A Definir</div>
            </div>
        </div>
        
        <h3>Categoria Infantil (${infantilAthletes.length} atletas)</h3>
        <table>
            <thead>
                <tr>
                    <th>Atleta</th>
                    <th>Peso</th>
                    <th>Oponente</th>
                    <th>Fase</th>
                    <th>Resultado</th>
                    <th>Técnico</th>
                </tr>
            </thead>
            <tbody>
                ${infantilAthletes.map(athlete => `
                    <tr class="result-${getResultClass(athlete.fight_result)}">
                        <td>${athlete.athlete_name}</td>
                        <td>${athlete.weight_class}</td>
                        <td>${athlete.opponent_name}</td>
                        <td>${athlete.stage}</td>
                        <td>${athlete.fight_result}</td>
                        <td>${athlete.coach}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        
        <h3>Categoria Juvenil (${juvenilAthletes.length} atletas)</h3>
        <table>
            <thead>
                <tr>
                    <th>Atleta</th>
                    <th>Peso</th>
                    <th>Oponente</th>
                    <th>Fase</th>
                    <th>Resultado</th>
                    <th>Técnico</th>
                </tr>
            </thead>
            <tbody>
                ${juvenilAthletes.map(athlete => `
                    <tr class="result-${getResultClass(athlete.fight_result)}">
                        <td>${athlete.athlete_name}</td>
                        <td>${athlete.weight_class}</td>
                        <td>${athlete.opponent_name}</td>
                        <td>${athlete.stage}</td>
                        <td>${athlete.fight_result}</td>
                        <td>${athlete.coach}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Import data functionality
function setupImportFeature() {
    const dashboardSection = document.getElementById('dashboard');
    const importContainer = document.createElement('div');
    importContainer.className = 'import-container';
    importContainer.innerHTML = `
        <h3>Importar Dados</h3>
        <input type="file" id="import-file" accept=".json" style="display: none;">
        <button onclick="document.getElementById('import-file').click()" class="import-btn">Importar JSON</button>
        <button onclick="resetData()" class="reset-btn" style="background-color: #dc3545; margin-left: 10px;">Resetar Dados</button>
    `;
    
    dashboardSection.appendChild(importContainer);
    
    document.getElementById('import-file').addEventListener('change', handleFileImport);
}

// Handle file import
function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            const applyImportedState = (fightsArray, fullState) => {
                if (typeof window.hydrateFromTournamentState === 'function' && fullState) {
                    window.hydrateFromTournamentState(fullState);
                } else {
                    window.athletesData = fightsArray;
                }
                saveData();
                updateDashboard();
                populateAthletes();
                populateResults();
                createCharts();
                alert('Dados importados com sucesso!');
            };

            if (Array.isArray(importedData)) {
                if (confirm('Isso irá substituir todos os dados atuais. Continuar?')) {
                    applyImportedState(importedData);
                }
            } else if (importedData && typeof importedData === 'object' && Array.isArray(importedData.fights)) {
                if (confirm('Isso irá substituir todos os dados atuais. Continuar?')) {
                    applyImportedState(importedData.fights, importedData);
                }
            } else {
                alert('Formato de arquivo inválido.');
            }
        } catch (error) {
            alert('Erro ao importar arquivo: ' + error.message);
        }
    };
    reader.readAsText(file);
}

// Reset data
function resetData() {
    if (!confirm('Isso irá apagar todos os dados. Esta ação não pode ser desfeita. Continuar?')) {
        return;
    }

    if (typeof window.resetTournamentData === 'function') {
        window.resetTournamentData();
    } else {
        window.athletesData = [];
        try {
            localStorage.removeItem('tournamentState');
        } catch (error) {
            console.warn('Falha ao limpar storage:', error);
        }
        saveData();
        updateDashboard();
        populateAthletes();
        populateResults();
        createCharts();
    }

    alert('Dados resetados com sucesso!');
}

// Search functionality
function setupSearchFeature() {
    const athletesSection = document.getElementById('athletes');
    const filterControls = athletesSection.querySelector('.filter-controls');
    
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.id = 'search-input';
    searchInput.placeholder = 'Buscar atleta...';
    searchInput.style.cssText = `
        padding: 0.75rem 1rem;
        border: 2px solid #ddd;
        border-radius: 25px;
        font-size: 1rem;
        min-width: 250px;
        margin-right: 1rem;
    `;
    
    filterControls.insertBefore(searchInput, filterControls.firstChild);
    
    searchInput.addEventListener('input', function() {
        populateAthletes();
    });
}

// Enhanced get filtered athletes with search
function getFilteredAthletesWithSearch() {
    const categoryFilter = document.getElementById('category-filter').value;
    const resultFilter = document.getElementById('result-filter').value;
    const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
    
    return athletesData.filter(athlete => {
        const categoryMatch = !categoryFilter || athlete.category === categoryFilter;
        const resultMatch = !resultFilter || athlete.fight_result === resultFilter;
        const searchMatch = !searchTerm || 
            athlete.athlete_name.toLowerCase().includes(searchTerm) ||
            athlete.opponent_name.toLowerCase().includes(searchTerm) ||
            athlete.coach.toLowerCase().includes(searchTerm);
        
        return categoryMatch && resultMatch && searchMatch;
    });
}

// Initialize advanced features
function initializeAdvancedFeatures() {
    setupAddAthleteFeature();
    setupExportFeature();
    setupImportFeature();
    setupSearchFeature();
    
    // Replace original functions with enhanced versions
    window.saveEdit = enhancedSaveEdit;
    window.populateResults = enhancedPopulateResults;
    window.getFilteredAthletes = getFilteredAthletesWithSearch;
}

// Auto-save functionality
function setupAutoSave() {
    setInterval(() => {
        if (athletesData.length > 0) {
            saveData();
        }
    }, 30000); // Auto-save every 30 seconds
}

// Initialize all advanced features when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Wait for main script to load
    setTimeout(() => {
        initializeAdvancedFeatures();
        setupAutoSave();
        if (typeof setupQuickEntryModals === 'function') setupQuickEntryModals();
    }, 100);
});

(function(){
const r=new Map();
function registerModal(id,cfg={}){r.set(id,cfg);return true}
function open(id){
  const cfg=r.get(id);
  const modal=document.getElementById(id);
  if(!modal)return false;
  const prev=document.activeElement; if(prev){try{prev.setAttribute('data-prev-focus','true')}catch(_e){}}
  modal.style.display='block';
  if(cfg&&typeof cfg.onOpen==='function'){try{cfg.onOpen(modal)}catch(e){}}
  // Focus management & trap
  const focusables=modal.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])');
  const first=focusables[0];
  const last=focusables[focusables.length-1];
  if(first){first.focus()} else {modal.querySelector('.modal-content')?.focus?.()}
  const trap=(e)=>{
    if(e.key==='Escape'){ close(id); }
    if(e.key==='Tab'){
      if(focusables.length===0){e.preventDefault(); return}
      if(e.shiftKey && document.activeElement===first){ e.preventDefault(); last.focus(); }
      else if(!e.shiftKey && document.activeElement===last){ e.preventDefault(); first.focus(); }
    }
  };
  modal.__trapListener=trap; modal.addEventListener('keydown', trap);
  const form=modal.querySelector('form');
  if(form&&!form.__bound){
    form.addEventListener('submit',(e)=>{
      e.preventDefault();
      if(cfg&&typeof cfg.validate==='function'){
        const ok=cfg.validate(modal);
        if(ok===false)return;
      }
      if(cfg&&typeof cfg.submit==='function'){
        cfg.submit(modal);
      }else if(typeof window.saveEdit==='function'){
        window.saveEdit(e);
      }
      close(id);
    });
    form.__bound=true;
  }
  return true;
}
function close(id){
  const modal=document.getElementById(id);
  if(!modal)return false;
  modal.style.display='none';
  const cfg=r.get(id);
  if(cfg&&typeof cfg.onClose==='function'){try{cfg.onClose(modal)}catch(e){}}
  return true;
}
function createRepeater(container,addSelector){
  const root=typeof container==='string'?document.querySelector(container):container;
  const addBtn=typeof addSelector==='string'?document.querySelector(addSelector):addSelector;
  if(!root)return{add(){},remove(){},count(){return 0},setTemplate(){return this}};
  const add=(el)=>{root.appendChild(el);return el};
  const remove=(idx)=>{const nodes=root.querySelectorAll(':scope > *');if(nodes[idx])nodes[idx].remove()};
  const count=()=>root.querySelectorAll(':scope > *').length;
  if(addBtn){addBtn.addEventListener('click',()=>{const t=root.__template;if(typeof t==='function'){add(t(count()))}})}
  return{add,remove,count,setTemplate(fn){root.__template=fn;return this}};
}
window.modalRegistry={register:registerModal,open,close,get(id){return r.get(id)},dump(){return Array.from(r.keys())}};
window.modalDebug={dump(){const list=Array.from(r.keys());try{console.log('Registered modals:',list)}catch(_e){}return list}};
window.createFieldRepeater=createRepeater;
})();

try { window.openAddFightModal = openAddAthleteModal; } catch(_e) {}

function setupQuickEntryModals(){
  const ensureModal=(id, title, bodyHTML)=>{
    let modal=document.getElementById(id);
    if(!modal){
      modal=document.createElement('div');
      modal.id=id;
      modal.className='modal';
      const titleId=`${id}-title`;
      modal.setAttribute('role','dialog');
      modal.setAttribute('aria-modal','true');
      modal.setAttribute('aria-labelledby', titleId);
      modal.innerHTML=`<div class="modal-content" role="document" tabindex="-1"><span class="close" aria-label="Fechar">&times;</span><h2 id="${titleId}">${title}</h2><form>${bodyHTML}<div class="form-actions"><button type="submit">Salvar</button><button type="button" data-action="cancel" aria-label="Cancelar">Cancelar</button></div></form></div>`;
      document.body.appendChild(modal);
      const closeBtn=modal.querySelector('.close');
      const cancelBtn=modal.querySelector('[data-action="cancel"]');
      const hide=()=>{modal.style.display='none'; const prev=document.querySelector('[data-prev-focus="true"]'); if(prev){prev.removeAttribute('data-prev-focus'); prev.focus?.()} modal.removeEventListener('keydown', modal.__trapListener || (()=>{}));};
      if(closeBtn) closeBtn.addEventListener('click', hide);
      if(cancelBtn) cancelBtn.addEventListener('click', hide);
    }
    return modal;
  };
  const coachModal=ensureModal('coach-modal','Adicionar Técnico',
    `<div class="form-group"><label for="coach-name">Nome do técnico</label><input id="coach-name" type="text" required></div>`
  );
  window.modalRegistry.register('coach-modal',{
    validate:(m)=>{const v=m.querySelector('#coach-name')?.value.trim(); if(!v){alert('Informe o nome do técnico'); return false} return true},
    submit:(m)=>{const name=m.querySelector('#coach-name')?.value.trim(); if(typeof window.us4OnCoachSubmit==='function') window.us4OnCoachSubmit(name)}
  });
  const locationModal=ensureModal('location-modal','Adicionar Local de Treino',
    `<div class="form-group"><label for="location-name">Nome do local</label><input id="location-name" type="text" required></div><div class="form-group" id="location-coaches"></div>`
  );
  window.modalRegistry.register('location-modal',{
    onOpen:(m)=>{
      const box=m.querySelector('#location-coaches');
      if(!box) return;
      box.innerHTML='';
      const list=document.createElement('div');
      const src=(window.tournamentState&&Array.isArray(window.tournamentState.coaches))?window.tournamentState.coaches:[];
      src.forEach(c=>{
        const lbl=document.createElement('label');
        lbl.style.display='flex';lbl.style.alignItems='center';lbl.style.gap='6px';
        const cb=document.createElement('input'); cb.type='checkbox'; cb.value=c.id||'';
        lbl.appendChild(cb);
        lbl.appendChild(document.createTextNode(c.fullName||'—'));
        list.appendChild(lbl);
      });
      const title=document.createElement('div'); title.textContent='Técnicos responsáveis'; title.style.fontWeight='600'; title.style.marginBottom='0.25rem';
      box.appendChild(title); box.appendChild(list);
    },
    validate:(m)=>{const name=m.querySelector('#location-name')?.value.trim(); if(!name){alert('Informe o nome do local'); return false} return true},
    submit:(m)=>{const name=m.querySelector('#location-name')?.value.trim(); const ids=[...m.querySelectorAll('#location-coaches input[type="checkbox"]:checked')].map(x=>x.value); if(typeof window.us4OnLocationSubmit==='function') window.us4OnLocationSubmit(name, ids)}
  });

  const penaltyModal=ensureModal('penalty-modal','Adicionar Penalidade',
    `<div class="form-group"><label for="penalty-name">Nome</label><input id="penalty-name" type="text" required></div>
     <div class="form-group"><label for="penalty-severity">Severidade</label>
       <select id="penalty-severity">
         <option value="MINOR">MINOR</option>
         <option value="MAJOR">MAJOR</option>
         <option value="DISQUALIFYING">DISQUALIFYING</option>
       </select>
     </div>
     <div class="form-group"><label for="penalty-desc">Descrição (opcional)</label><input id="penalty-desc" type="text"></div>`
  );
  window.modalRegistry.register('penalty-modal',{
    validate:(m)=>{const n=m.querySelector('#penalty-name')?.value.trim(); if(!n){alert('Informe o nome da penalidade'); return false} return true},
    submit:(m)=>{const n=m.querySelector('#penalty-name')?.value.trim(); const s=m.querySelector('#penalty-severity')?.value; const d=m.querySelector('#penalty-desc')?.value.trim(); if(typeof window.us5OnPenaltySubmit==='function') window.us5OnPenaltySubmit({name:n, severity:s, description:d})}
  });
}
