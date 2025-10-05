// Global variables
let athletesData = [];
let currentEditingIndex = -1;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    setupNavigation();
    setupModal();
    setupFilters();
});

// Load data from localStorage or use default data
function loadData() {
    try {
        // Try to load from localStorage first
        const savedData = localStorage.getItem('taekwondoData');
        if (savedData) {
            athletesData = JSON.parse(savedData);
        } else {
            // Use default data from the parsed file
            athletesData = getDefaultData();
            // Save to localStorage
            localStorage.setItem('taekwondoData', JSON.stringify(athletesData));
        }
        
        updateDashboard();
        populateAthletes();
        populateResults();
        createCharts();
    } catch (error) {
        console.error('Error loading data:', error);
        // Fallback data if file doesn't exist
        athletesData = getDefaultData();
        updateDashboard();
        populateAthletes();
        populateResults();
        createCharts();
    }
}

// Default data from the parsed JSON file
function getDefaultData() {
    return [
        {
            "category": "INFANTIL",
            "weight_class": "-35",
            "athlete_name": "Matheus Nasi",
            "opponent_name": "Luidy Oliveira",
            "opponent_team": "Equipe Fúria",
            "stage": "Semi Final",
            "rounds": [
            { "round_number": 1, "score_our_athlete": 12, "score_opponent": 0, "gap_info": "GAP", "round_outcome": "VITÓRIA" },
            { "round_number": 2, "score_our_athlete": 22, "score_opponent": 9, "gap_info": "GAP", "round_outcome": "VITÓRIA" }
            ],
            "coach": "Ms Junio Souza",
            "fight_result": "VITÓRIA"
        },
        {
            "category": "INFANTIL",
            "weight_class": "-35",
            "athlete_name": "Matheus Nasi",
            "opponent_name": "Rafael Weimer",
            "opponent_team": "Base & Monsters TKD",
            "stage": "Final",
            "rounds": [
            { "round_number": 1, "score_our_athlete": 20, "score_opponent": 16, "gap_info": "FALTA", "round_outcome": "DERROTA" },
            { "round_number": 2, "score_our_athlete": 5, "score_opponent": 3, "gap_info": "", "round_outcome": "VITÓRIA" },
            { "round_number": 3, "score_our_athlete": 15, "score_opponent": 2, "gap_info": "GAP", "round_outcome": "VITÓRIA" }
            ],
            "coach": "Ms Junio Souza",
            "fight_result": "VITÓRIA"
        },
        {
            "category": "INFANTIL",
            "weight_class": "-40",
            "athlete_name": "William Alckmin",
            "opponent_name": "Vitor",
            "opponent_team": "Conduta",
            "stage": "A Definir",
            "rounds": [
            { "round_number": 1, "score_our_athlete": 4, "score_opponent": 17, "gap_info": "", "round_outcome": "DERROTA" },
            { "round_number": 2, "score_our_athlete": 24, "score_opponent": 28, "gap_info": "", "round_outcome": "DERROTA" }
            ],
            "coach": "Pedro Hamasak",
            "fight_result": "DERROTA"
        },
        {
            "category": "INFANTIL",
            "weight_class": "+45",
            "athlete_name": "Theo Maia",
            "opponent_name": "Emanuel Velani",
            "opponent_team": "Madureira",
            "stage": "Final",
            "rounds": [
            { "round_number": 1, "score_our_athlete": 8, "score_opponent": 0, "gap_info": "", "round_outcome": "VITÓRIA" },
            { "round_number": 2, "score_our_athlete": 8, "score_opponent": 1, "gap_info": "", "round_outcome": "VITÓRIA" }
            ],
            "coach": "Mestre Junio Souza",
            "fight_result": "VITÓRIA"
        },
        {
            "category": "INFANTIL",
            "weight_class": "-35",
            "athlete_name": "Isaac Xavier",
            "opponent_name": "João Pedro",
            "opponent_team": "Base & Monsters TKD",
            "stage": "Semi Final",
            "rounds": [
            { "round_number": 1, "score_our_athlete": 0, "score_opponent": 8, "gap_info": "", "round_outcome": "DERROTA" },
            { "round_number": 2, "score_our_athlete": 8, "score_opponent": 4, "gap_info": "", "round_outcome": "VITÓRIA" },
            { "round_number": 3, "score_our_athlete": 14, "score_opponent": 4, "gap_info": "", "round_outcome": "VITÓRIA" }
            ],
            "coach": "Ms Júnior Massa",
            "fight_result": "VITÓRIA"
        },
        {
            "category": "INFANTIL",
            "weight_class": "-35",
            "athlete_name": "Isaac Xavier",
            "opponent_name": "Bernardo Rodrigues",
            "opponent_team": "TKD Rodrigues Team",
            "stage": "Final",
            "rounds": [
            { "round_number": 1, "score_our_athlete": 6, "score_opponent": 2, "gap_info": "", "round_outcome": "VITÓRIA" },
            { "round_number": 2, "score_our_athlete": 12, "score_opponent": 0, "gap_info": "GAP", "round_outcome": "VITÓRIA" }
            ],
            "coach": "Ms Júnior Massa",
            "fight_result": "VITÓRIA"
        },

        /* ---------------- JUVENIL ---------------- */

        {
            "category": "JUVENIL",
            "weight_class": "-48",
            "athlete_name": "Andrey Megda",
            "opponent_name": "WO",
            "opponent_team": "N/A",
            "stage": "A Definir",
            "rounds": [
            { "round_number": 1, "score_our_athlete": null, "score_opponent": null, "gap_info": "WO", "round_outcome": "VITÓRIA" },
            { "round_number": 2, "score_our_athlete": null, "score_opponent": null, "gap_info": "WO", "round_outcome": "VITÓRIA" }
            ],
            "coach": "",
            "fight_result": "VITÓRIA"
        },
        {
            "category": "JUVENIL",
            "weight_class": "-51",
            "athlete_name": "João Arnaldo",
            "opponent_name": "Yago Cunha",
            "opponent_team": "Madureira",
            "stage": "Semi Final",
            "rounds": [
            { "round_number": 1, "score_our_athlete": 6, "score_opponent": 0, "gap_info": "", "round_outcome": "VITÓRIA" },
            { "round_number": 2, "score_our_athlete": 9, "score_opponent": 1, "gap_info": "", "round_outcome": "VITÓRIA" }
            ],
            "coach": "Ms Junio Massa",
            "fight_result": "VITÓRIA"
        },
        {
            "category": "JUVENIL",
            "weight_class": "-51",
            "athlete_name": "João Arnaldo",
            "opponent_name": "Gabriel Felipe",
            "opponent_team": "Madureira",
            "stage": "Final",
            "rounds": [
            { "round_number": 1, "score_our_athlete": 11, "score_opponent": 6, "gap_info": "", "round_outcome": "VITÓRIA" },
            { "round_number": 2, "score_our_athlete": 13, "score_opponent": 0, "gap_info": "", "round_outcome": "VITÓRIA" }
            ],
            "coach": "Ms Junio Massa",
            "fight_result": "VITÓRIA"
        },
        {
            "category": "JUVENIL",
            "weight_class": "-59",
            "athlete_name": "Enzo Ribeiro",
            "opponent_name": "Erick Rosa",
            "opponent_team": "Team Morando",
            "stage": "Quartas de Final",
            "rounds": [
            { "round_number": 1, "score_our_athlete": 10, "score_opponent": 6, "gap_info": "", "round_outcome": "VITÓRIA" },
            { "round_number": 2, "score_our_athlete": 1, "score_opponent": 9, "gap_info": "", "round_outcome": "DERROTA" },
            { "round_number": 3, "score_our_athlete": 6, "score_opponent": 6, "gap_info": "HIT", "round_outcome": "VITÓRIA" }
            ],
            "coach": "Ms Junio Souza",
            "fight_result": "VITÓRIA"
        },
        {
            "category": "JUVENIL",
            "weight_class": "-59",
            "athlete_name": "Enzo Ribeiro",
            "opponent_name": "Miguel Molina",
            "opponent_team": "Equipe Madureira",
            "stage": "Semi Final",
            "rounds": [
            { "round_number": 1, "score_our_athlete": 14, "score_opponent": 1, "gap_info": "GAP", "round_outcome": "VITÓRIA" },
            { "round_number": 2, "score_our_athlete": 11, "score_opponent": 4, "gap_info": "", "round_outcome": "VITÓRIA" }
            ],
            "coach": "Ms Junio Souza",
            "fight_result": "VITÓRIA"
        },
        {
            "category": "JUVENIL",
            "weight_class": "-59",
            "athlete_name": "Enzo Ribeiro",
            "opponent_name": "Lucas Langer",
            "opponent_team": "Madureira",
            "stage": "Final",
            "rounds": [
            { "round_number": 1, "score_our_athlete": 15, "score_opponent": 2, "gap_info": "", "round_outcome": "VITÓRIA" },
            { "round_number": 2, "score_our_athlete": 13, "score_opponent": 3, "gap_info": "", "round_outcome": "VITÓRIA" }
            ],
            "coach": "Ms Junio Souza",
            "fight_result": "VITÓRIA"
        },
        {
            "category": "JUVENIL",
            "weight_class": "-59",
            "athlete_name": "Danilo Brasilino",
            "opponent_name": "Lucas Langer",
            "opponent_team": "Madureira",
            "stage": "Quartas de Final",
            "rounds": [
            { "round_number": 1, "score_our_athlete": 8, "score_opponent": 19, "gap_info": "", "round_outcome": "DERROTA" },
            { "round_number": 2, "score_our_athlete": 1, "score_opponent": 14, "gap_info": "GAP", "round_outcome": "DERROTA" }
            ],
            "coach": "Ms Junio Souza",
            "fight_result": "DERROTA"
        },
        {
            "category": "JUVENIL",
            "weight_class": "-63",
            "athlete_name": "Pedro Rigotti",
            "opponent_name": "Miguel Moreira",
            "opponent_team": "Delfine Team",
            "stage": "Quartas de Final",
            "rounds": [
            { "round_number": 1, "score_our_athlete": 7, "score_opponent": 0, "gap_info": "NOCAUTE", "round_outcome": "VITÓRIA" }
            ],
            "coach": "Ms Junio Souza",
            "fight_result": "VITÓRIA"
        },
        {
            "category": "JUVENIL",
            "weight_class": "-63",
            "athlete_name": "Pedro Rigotti",
            "opponent_name": "João Vitor",
            "opponent_team": "Equipe Ferla",
            "stage": "Semi Final",
            "rounds": [
            { "round_number": 1, "score_our_athlete": 13, "score_opponent": 0, "gap_info": "GAP; NOCAUTE", "round_outcome": "VITÓRIA" }
            ],
            "coach": "Ms Junio Souza",
            "fight_result": "VITÓRIA"
        },
        {
            "category": "JUVENIL",
            "weight_class": "-63",
            "athlete_name": "Pedro Rigotti",
            "opponent_name": "Matheus Langer",
            "opponent_team": "Madureira",
            "stage": "Final",
            "rounds": [
            { "round_number": 1, "score_our_athlete": 9, "score_opponent": 0, "gap_info": "FALTAS", "round_outcome": "VITÓRIA" },
            { "round_number": 2, "score_our_athlete": 5, "score_opponent": 0, "gap_info": "FALTAS", "round_outcome": "VITÓRIA" }
            ],
            "coach": "Ms Junio Souza",
            "fight_result": "VITÓRIA"
        },
        {
            "category": "JUVENIL",
            "weight_class": "-73",
            "athlete_name": "Nicolas Rodrigues",
            "opponent_name": "Arthur Zorzato",
            "opponent_team": "Madureira",
            "stage": "Semi Final",
            "rounds": [
            { "round_number": 1, "score_our_athlete": null, "score_opponent": null, "gap_info": "WO", "round_outcome": "VITÓRIA" },
            { "round_number": 2, "score_our_athlete": null, "score_opponent": null, "gap_info": "WO", "round_outcome": "VITÓRIA" }
            ],
            "coach": "",
            "fight_result": "VITÓRIA"
        },
        {
            "category": "JUVENIL",
            "weight_class": "-73",
            "athlete_name": "Nicolas Rodrigues",
            "opponent_name": "Nicolas Alexandre",
            "opponent_team": "SEMELP",
            "stage": "Final",
            "rounds": [
            { "round_number": 1, "score_our_athlete": 7, "score_opponent": 1, "gap_info": "", "round_outcome": "VITÓRIA" },
            { "round_number": 2, "score_our_athlete": 9, "score_opponent": 2, "gap_info": "", "round_outcome": "VITÓRIA" }
            ],
            "coach": "Ms Junio Souza",
            "fight_result": "VITÓRIA"
        },
        {
            "category": "JUVENIL",
            "weight_class": "-78",
            "athlete_name": "Allan Machado",
            "opponent_name": "João Vinicius",
            "opponent_team": "Madureira",
            "stage": "Semi Final",
            "rounds": [
            { "round_number": 1, "score_our_athlete": 10, "score_opponent": 1, "gap_info": "", "round_outcome": "VITÓRIA" },
            { "round_number": 2, "score_our_athlete": 2, "score_opponent": 0, "gap_info": "", "round_outcome": "VITÓRIA" }
            ],
            "coach": "Ms Junio Souza",
            "fight_result": "VITÓRIA"
        },
        {
            "category": "JUVENIL",
            "weight_class": "-78",
            "athlete_name": "Allan Machado",
            "opponent_name": "Higor Gabriel",
            "opponent_team": "Madureira",
            "stage": "Final",
            "rounds": [
            { "round_number": 1, "score_our_athlete": 13, "score_opponent": 0, "gap_info": "GAP", "round_outcome": "VITÓRIA" },
            { "round_number": 2, "score_our_athlete": 12, "score_opponent": 0, "gap_info": "GAP", "round_outcome": "VITÓRIA" }
            ],
            "coach": "Ms Junio Souza",
            "fight_result": "VITÓRIA"
        },
        {
            "category": "JUVENIL",
            "weight_class": "+78",
            "athlete_name": "Gustavo Rodrigues",
            "opponent_name": "Pedro",
            "opponent_team": "Associação Quedas",
            "stage": "Semi Final",
            "rounds": [
            { "round_number": 1, "score_our_athlete": 4, "score_opponent": 6, "gap_info": "", "round_outcome": "DERROTA" },
            { "round_number": 2, "score_our_athlete": 4, "score_opponent": 8, "gap_info": "", "round_outcome": "DERROTA" }
            ],
            "coach": "Ms Junio Souza",
            "fight_result": "DERROTA"
        },
        {
            "category": "JUVENIL",
            "weight_class": "-49",
            "athlete_name": "Isadora Conceição",
            "opponent_name": "Mellany Eloise",
            "opponent_team": "Team Morando",
            "stage": "Semi Final",
            "rounds": [
            { "round_number": 1, "score_our_athlete": 13, "score_opponent": 0, "gap_info": "GAP", "round_outcome": "VITÓRIA" },
            { "round_number": 2, "score_our_athlete": 8, "score_opponent": 1, "gap_info": "", "round_outcome": "VITÓRIA" }
            ],
            "coach": "Ms Júnio Souza",
            "fight_result": "VITÓRIA"
        },
        {
            "category": "JUVENIL",
            "weight_class": "-49",
            "athlete_name": "Isadora Conceição",
            "opponent_name": "Beatriz Souza",
            "opponent_team": "Madureira",
            "stage": "Final",
            "rounds": [
            { "round_number": 1, "score_our_athlete": 6, "score_opponent": 12, "gap_info": "", "round_outcome": "DERROTA" },
            { "round_number": 2, "score_our_athlete": 1, "score_opponent": 7, "gap_info": "DESISTÊNCIA (oponente)", "round_outcome": "VITÓRIA" }
            ],
            "coach": "Ms Júnio Souza",
            "fight_result": "VITÓRIA"
        },
        {
            "category": "JUVENIL",
            "weight_class": "-52",
            "athlete_name": "Julia Rogo",
            "opponent_name": "Rafaela Lare",
            "opponent_team": "Madureira",
            "stage": "Semi Final",
            "rounds": [
            { "round_number": 1, "score_our_athlete": 0, "score_opponent": 13, "gap_info": "GAP", "round_outcome": "DERROTA" },
            { "round_number": 2, "score_our_athlete": 0, "score_opponent": 13, "gap_info": "GAP", "round_outcome": "DERROTA" }
            ],
            "coach": "Ms Júnior Massa",
            "fight_result": "DERROTA"
        },
        {
            "category": "JUVENIL",
            "weight_class": "-68",
            "athlete_name": "Stephani Valente",
            "opponent_name": "Sabrina Paglioto",
            "opponent_team": "Madureira",
            "stage": "Semi Final",
            "rounds": [
            { "round_number": 1, "score_our_athlete": 9, "score_opponent": 5, "gap_info": "", "round_outcome": "VITÓRIA" },
            { "round_number": 2, "score_our_athlete": 8, "score_opponent": 0, "gap_info": "", "round_outcome": "VITÓRIA" }
            ],
            "coach": "Ms Junio Souza",
            "fight_result": "VITÓRIA"
        },
        {
            "category": "JUVENIL",
            "weight_class": "-68",
            "athlete_name": "Stephani Valente",
            "opponent_name": "Luna Oliveira",
            "opponent_team": "Base e Monsters TKD",
            "stage": "Final",
            "rounds": [
            { "round_number": 1, "score_our_athlete": 9, "score_opponent": 0, "gap_info": "", "round_outcome": "VITÓRIA" },
            { "round_number": 2, "score_our_athlete": 7, "score_opponent": 1, "gap_info": "", "round_outcome": "VITÓRIA" }
            ],
            "coach": "Ms Junio Souza",
            "fight_result": "VITÓRIA"
        },
        {
            "category": "JUVENIL",
            "weight_class": "+68",
            "athlete_name": "Ana Clara",
            "opponent_name": "Vitória Sassaki",
            "opponent_team": "Base e Monsters TKD",
            "stage": "Final",
            "rounds": [
            { "round_number": 1, "score_our_athlete": 2, "score_opponent": 7, "gap_info": "", "round_outcome": "DERROTA" },
            { "round_number": 2, "score_our_athlete": 1, "score_opponent": 6, "gap_info": "", "round_outcome": "DERROTA" }
            ],
            "coach": "Ms Junio Souza",
            "fight_result": "DERROTA"
        },
        {
            "category": "JUVENIL",
            "weight_class": "-55",
            "athlete_name": "Marcos Alves",
            "opponent_name": "Victor Leonardo",
            "opponent_team": "Team Morando",
            "stage": "Quartas de Final",
            "rounds": [
            { "round_number": 1, "score_our_athlete": 17, "score_opponent": 18, "gap_info": "", "round_outcome": "DERROTA" },
            { "round_number": 2, "score_our_athlete": 20, "score_opponent": 8, "gap_info": "", "round_outcome": "VITÓRIA" },
            { "round_number": 3, "score_our_athlete": 19, "score_opponent": 17, "gap_info": "", "round_outcome": "VITÓRIA" }
            ],
            "coach": "Pedro Hamasak",
            "fight_result": "VITÓRIA"
        },
        {
            "category": "JUVENIL",
            "weight_class": "-55",
            "athlete_name": "Marcos Alves",
            "opponent_name": "Matheus Vinicius",
            "opponent_team": "Equipe Madureira",
            "stage": "Semi Final",
            "rounds": [
            { "round_number": 1, "score_our_athlete": 24, "score_opponent": 22, "gap_info": "", "round_outcome": "VITÓRIA" },
            { "round_number": 2, "score_our_athlete": 17, "score_opponent": 22, "gap_info": "", "round_outcome": "DERROTA" },
            { "round_number": 3, "score_our_athlete": 12, "score_opponent": 14, "gap_info": "", "round_outcome": "DERROTA" }
            ],
            "coach": "Pedro Hamasak",
            "fight_result": "DERROTA"
        },
        {
            "category": "JUVENIL",
            "weight_class": "-55",
            "athlete_name": "Caio Kauã",
            "opponent_name": "Victor Miguel",
            "opponent_team": "Team Morando",
            "stage": "Oitavas de Final",
            "rounds": [
            { "round_number": 1, "score_our_athlete": 4, "score_opponent": 0, "gap_info": "", "round_outcome": "VITÓRIA" },
            { "round_number": 2, "score_our_athlete": 3, "score_opponent": 0, "gap_info": "", "round_outcome": "VITÓRIA" }
            ],
            "coach": "Ms Júnior Massa",
            "fight_result": "VITÓRIA"
        },
        {
            "category": "JUVENIL",
            "weight_class": "-55",
            "athlete_name": "Caio Kauã",
            "opponent_name": "Arthur Gabriel",
            "opponent_team": "Equipe Madureira",
            "stage": "Quartas de Final",
            "rounds": [
            { "round_number": 1, "score_our_athlete": 1, "score_opponent": 9, "gap_info": "", "round_outcome": "DERROTA" },
            { "round_number": 2, "score_our_athlete": 6, "score_opponent": 8, "gap_info": "", "round_outcome": "DERROTA" }
            ],
            "coach": "Ms Júnior Massa",
            "fight_result": "DERROTA"
        },
        {
            "category": "JUVENIL",
            "weight_class": "-55",
            "athlete_name": "Pedro Gabriel",
            "opponent_name": "Miguel José",
            "opponent_team": "Academia Marcos Paulo",
            "stage": "Oitavas de Final",
            "rounds": [
            { "round_number": 1, "score_our_athlete": 10, "score_opponent": 1, "gap_info": "", "round_outcome": "VITÓRIA" },
            { "round_number": 2, "score_our_athlete": 10, "score_opponent": 5, "gap_info": "", "round_outcome": "VITÓRIA" }
            ],
            "coach": "Ms Júnior Massa",
            "fight_result": "VITÓRIA"
        },
        {
            "category": "JUVENIL",
            "weight_class": "-55",
            "athlete_name": "Pedro Gabriel",
            "opponent_name": "Lucas Gaspar",
            "opponent_team": "Equipe Madureira",
            "stage": "Quartas de Final",
            "rounds": [
            { "round_number": 1, "score_our_athlete": 11, "score_opponent": 6, "gap_info": "", "round_outcome": "VITÓRIA" },
            { "round_number": 2, "score_our_athlete": 5, "score_opponent": 3, "gap_info": "", "round_outcome": "VITÓRIA" }
            ],
            "coach": "Ms Júnior Massa",
            "fight_result": "VITÓRIA"
        },
        {
            "category": "JUVENIL",
            "weight_class": "-55",
            "athlete_name": "Pedro Gabriel",
            "opponent_name": "João Miguel",
            "opponent_team": "União Lopes",
            "stage": "Semi Final",
            "rounds": [
            { "round_number": 1, "score_our_athlete": 2, "score_opponent": 7, "gap_info": "FALTA", "round_outcome": "DERROTA" },
            { "round_number": 2, "score_our_athlete": 1, "score_opponent": 10, "gap_info": "", "round_outcome": "DERROTA" }
            ],
            "coach": "Ms Júnior Massa",
            "fight_result": "DERROTA"
        }
    ];
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('taekwondoData', JSON.stringify(athletesData));
}

// Navigation setup
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links and sections
            navLinks.forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Show corresponding section
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });
}

// Update dashboard statistics
function updateDashboard() {
    const totalAthletes = athletesData.length;
    const victories = athletesData.filter(athlete => athlete.fight_result === 'VITÓRIA').length;
    const defeats = athletesData.filter(athlete => athlete.fight_result === 'DERROTA').length;
    const pending = athletesData.filter(athlete => athlete.fight_result === 'A Definir').length;
    
    document.getElementById('total-athletes').textContent = totalAthletes;
    document.getElementById('total-victories').textContent = victories;
    document.getElementById('total-defeats').textContent = defeats;
    document.getElementById('total-pending').textContent = pending;
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

// Create charts
function createCharts() {
    createCategoryChart();
    createStageChart();
    createAthletePerformanceChart();
    createRoundPerformanceChart();
    createIndividualCharts();
}

// Category chart
function createCategoryChart() {
    const ctx = document.getElementById('categoryChart').getContext('2d');
    
    const infantilAthletes = athletesData.filter(a => a.category === 'INFANTIL');
    const juvenilAthletes = athletesData.filter(a => a.category === 'JUVENIL');
    
    const infantilVictories = infantilAthletes.filter(a => a.fight_result === 'VITÓRIA').length;
    const infantilDefeats = infantilAthletes.filter(a => a.fight_result === 'DERROTA').length;
    const juvenilVictories = juvenilAthletes.filter(a => a.fight_result === 'VITÓRIA').length;
    const juvenilDefeats = juvenilAthletes.filter(a => a.fight_result === 'DERROTA').length;
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Infantil', 'Juvenil'],
            datasets: [{
                label: 'Vitórias',
                data: [infantilVictories, juvenilVictories],
                backgroundColor: '#28a745',
                borderColor: '#1e7e34',
                borderWidth: 2
            }, {
                label: 'Derrotas',
                data: [infantilDefeats, juvenilDefeats],
                backgroundColor: '#dc3545',
                borderColor: '#c82333',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Stage chart
function createStageChart() {
    const ctx = document.getElementById('stageChart').getContext('2d');
    
    const stages = ['Oitavas de Final', 'Quartas de Final', 'Semi Final', 'Final'];
    const stageData = stages.map(stage => {
        const stageAthletes = athletesData.filter(a => a.stage === stage);
        const victories = stageAthletes.filter(a => a.fight_result === 'VITÓRIA').length;
        const defeats = stageAthletes.filter(a => a.fight_result === 'DERROTA').length;
        const pending = stageAthletes.filter(a => a.fight_result === 'A Definir').length;
        return { stage, victories, defeats, pending };
    });
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: stages,
            datasets: [{
                data: stageData.map(s => s.victories + s.defeats + s.pending),
                backgroundColor: ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0'],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                }
            }
        }
    });
}

// Athlete performance chart
function createAthletePerformanceChart() {
    const ctx = document.getElementById('athletePerformanceChart').getContext('2d');
    
    const athletesWithRounds = athletesData.filter(a => a.rounds.length > 0);
    const athleteNames = athletesWithRounds.map(a => a.athlete_name);
    const winRates = athletesWithRounds.map(athlete => {
        const totalRounds = athlete.rounds.length;
        const wonRounds = athlete.rounds.filter(r => r.round_outcome === 'VITÓRIA').length;
        return totalRounds > 0 ? (wonRounds / totalRounds) * 100 : 0;
    });
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: athleteNames,
            datasets: [{
                label: 'Aproveitamento (%)',
                data: winRates,
                backgroundColor: winRates.map(rate => rate >= 50 ? '#28a745' : '#dc3545'),
                borderColor: winRates.map(rate => rate >= 50 ? '#1e7e34' : '#c82333'),
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            indexAxis: 'y',
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
}

// Round performance chart
function createRoundPerformanceChart() {
    const ctx = document.getElementById('roundPerformanceChart').getContext('2d');
    
    const allRounds = athletesData.flatMap(a => a.rounds);
    const roundNumbers = [1, 2, 3];
    const roundData = roundNumbers.map(roundNum => {
        const roundsOfNumber = allRounds.filter(r => r.round_number === roundNum);
        const victories = roundsOfNumber.filter(r => r.round_outcome === 'VITÓRIA').length;
        const defeats = roundsOfNumber.filter(r => r.round_outcome === 'DERROTA').length;
        return { roundNum, victories, defeats };
    });
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['1º Round', '2º Round', '3º Round'],
            datasets: [{
                label: 'Vitórias',
                data: roundData.map(r => r.victories),
                borderColor: '#28a745',
                backgroundColor: 'rgba(40, 167, 69, 0.1)',
                tension: 0.4,
                fill: true
            }, {
                label: 'Derrotas',
                data: roundData.map(r => r.defeats),
                borderColor: '#dc3545',
                backgroundColor: 'rgba(220, 53, 69, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Create individual athlete charts
function createIndividualCharts() {
    const individualChartsContainer = document.getElementById('individual-charts');
    individualChartsContainer.innerHTML = '';
    
    const athletesWithRounds = athletesData.filter(a => a.rounds.length > 0);
    
    athletesWithRounds.forEach((athlete, index) => {
        const chartContainer = document.createElement('div');
        chartContainer.className = 'chart-container';
        chartContainer.innerHTML = `
            <h3>${athlete.athlete_name} - Desempenho por Round</h3>
            <canvas id="individualChart${index}"></canvas>
        `;
        individualChartsContainer.appendChild(chartContainer);
        
        const ctx = document.getElementById(`individualChart${index}`).getContext('2d');
        
        new Chart(ctx, {
            type: 'radar',
            data: {
                labels: athlete.rounds.map(r => `Round ${r.round_number}`),
                datasets: [{
                    label: 'Pontuação',
                    data: athlete.rounds.map(r => r.score_our_athlete || 0),
                    borderColor: athlete.fight_result === 'VITÓRIA' ? '#28a745' : '#dc3545',
                    backgroundColor: athlete.fight_result === 'VITÓRIA' ? 'rgba(40, 167, 69, 0.2)' : 'rgba(220, 53, 69, 0.2)',
                    pointBackgroundColor: athlete.rounds.map(r => r.round_outcome === 'VITÓRIA' ? '#28a745' : '#dc3545'),
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: athlete.fight_result === 'VITÓRIA' ? '#28a745' : '#dc3545'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        max: Math.max(...athlete.rounds.map(r => Math.max(r.score_our_athlete || 0, r.score_opponent || 0))) + 5
                    }
                }
            }
        });
    });
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
    
    // Save to localStorage
    saveData();
    
    // Update UI
    updateDashboard();
    populateAthletes();
    populateResults();
    createCharts();
    
    // Close modal
    closeModal();
}
