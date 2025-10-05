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
            if (Array.isArray(importedData)) {
                if (confirm('Isso irá substituir todos os dados atuais. Continuar?')) {
                    athletesData = importedData;
                    saveData();
                    updateDashboard();
                    populateAthletes();
                    populateResults();
                    createCharts();
                    alert('Dados importados com sucesso!');
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
    if (confirm('Isso irá apagar todos os dados. Esta ação não pode ser desfeita. Continuar?')) {
        athletesData = [];
        localStorage.removeItem('taekwondoData');
        updateDashboard();
        populateAthletes();
        populateResults();
        createCharts();
        alert('Dados resetados com sucesso!');
    }
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
    }, 100);
});
