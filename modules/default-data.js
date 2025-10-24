// Seed data derived from the legacy dashboard dataset.
const fights = [
    {
        "category": "INFANTIL",
        "weight_class": "-35",
        "athlete_name": "Matheus Nasi",
        "opponent_name": "Luidy Oliveira",
        "opponent_team": "Equipe Fúria",
        "stage": "Semi Final",
        "rounds": [
            {
                "round_number": 1,
                "score_our_athlete": 12,
                "score_opponent": 0,
                "gap_info": "GAP",
                "round_outcome": "VITÓRIA"
            },
            {
                "round_number": 2,
                "score_our_athlete": 22,
                "score_opponent": 9,
                "gap_info": "GAP",
                "round_outcome": "VITÓRIA"
            }
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
            {
                "round_number": 1,
                "score_our_athlete": 20,
                "score_opponent": 16,
                "gap_info": "FALTA",
                "round_outcome": "DERROTA"
            },
            {
                "round_number": 2,
                "score_our_athlete": 5,
                "score_opponent": 3,
                "gap_info": "",
                "round_outcome": "VITÓRIA"
            },
            {
                "round_number": 3,
                "score_our_athlete": 15,
                "score_opponent": 2,
                "gap_info": "GAP",
                "round_outcome": "VITÓRIA"
            }
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
            {
                "round_number": 1,
                "score_our_athlete": 4,
                "score_opponent": 17,
                "gap_info": "",
                "round_outcome": "DERROTA"
            },
            {
                "round_number": 2,
                "score_our_athlete": 24,
                "score_opponent": 28,
                "gap_info": "",
                "round_outcome": "DERROTA"
            }
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
            {
                "round_number": 1,
                "score_our_athlete": 8,
                "score_opponent": 0,
                "gap_info": "",
                "round_outcome": "VITÓRIA"
            },
            {
                "round_number": 2,
                "score_our_athlete": 8,
                "score_opponent": 1,
                "gap_info": "",
                "round_outcome": "VITÓRIA"
            }
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
            {
                "round_number": 1,
                "score_our_athlete": 0,
                "score_opponent": 8,
                "gap_info": "",
                "round_outcome": "DERROTA"
            },
            {
                "round_number": 2,
                "score_our_athlete": 8,
                "score_opponent": 4,
                "gap_info": "",
                "round_outcome": "VITÓRIA"
            },
            {
                "round_number": 3,
                "score_our_athlete": 14,
                "score_opponent": 4,
                "gap_info": "",
                "round_outcome": "VITÓRIA"
            }
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
            {
                "round_number": 1,
                "score_our_athlete": 6,
                "score_opponent": 2,
                "gap_info": "",
                "round_outcome": "VITÓRIA"
            },
            {
                "round_number": 2,
                "score_our_athlete": 12,
                "score_opponent": 0,
                "gap_info": "GAP",
                "round_outcome": "VITÓRIA"
            }
        ],
        "coach": "Ms Júnior Massa",
        "fight_result": "VITÓRIA"
    },
    {
        "category": "JUVENIL",
        "weight_class": "-48",
        "athlete_name": "Andrey Megda",
        "opponent_name": "WO",
        "opponent_team": "N/A",
        "stage": "A Definir",
        "rounds": [
            {
                "round_number": 1,
                "score_our_athlete": null,
                "score_opponent": null,
                "gap_info": "WO",
                "round_outcome": "VITÓRIA"
            },
            {
                "round_number": 2,
                "score_our_athlete": null,
                "score_opponent": null,
                "gap_info": "WO",
                "round_outcome": "VITÓRIA"
            }
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
            {
                "round_number": 1,
                "score_our_athlete": 6,
                "score_opponent": 0,
                "gap_info": "",
                "round_outcome": "VITÓRIA"
            },
            {
                "round_number": 2,
                "score_our_athlete": 9,
                "score_opponent": 1,
                "gap_info": "",
                "round_outcome": "VITÓRIA"
            }
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
            {
                "round_number": 1,
                "score_our_athlete": 11,
                "score_opponent": 6,
                "gap_info": "",
                "round_outcome": "VITÓRIA"
            },
            {
                "round_number": 2,
                "score_our_athlete": 13,
                "score_opponent": 0,
                "gap_info": "",
                "round_outcome": "VITÓRIA"
            }
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
            {
                "round_number": 1,
                "score_our_athlete": 10,
                "score_opponent": 6,
                "gap_info": "",
                "round_outcome": "VITÓRIA"
            },
            {
                "round_number": 2,
                "score_our_athlete": 1,
                "score_opponent": 9,
                "gap_info": "",
                "round_outcome": "DERROTA"
            },
            {
                "round_number": 3,
                "score_our_athlete": 6,
                "score_opponent": 6,
                "gap_info": "HIT",
                "round_outcome": "VITÓRIA"
            }
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
            {
                "round_number": 1,
                "score_our_athlete": 14,
                "score_opponent": 1,
                "gap_info": "GAP",
                "round_outcome": "VITÓRIA"
            },
            {
                "round_number": 2,
                "score_our_athlete": 11,
                "score_opponent": 4,
                "gap_info": "",
                "round_outcome": "VITÓRIA"
            }
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
            {
                "round_number": 1,
                "score_our_athlete": 15,
                "score_opponent": 2,
                "gap_info": "",
                "round_outcome": "VITÓRIA"
            },
            {
                "round_number": 2,
                "score_our_athlete": 13,
                "score_opponent": 3,
                "gap_info": "",
                "round_outcome": "VITÓRIA"
            }
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
            {
                "round_number": 1,
                "score_our_athlete": 8,
                "score_opponent": 19,
                "gap_info": "",
                "round_outcome": "DERROTA"
            },
            {
                "round_number": 2,
                "score_our_athlete": 1,
                "score_opponent": 14,
                "gap_info": "GAP",
                "round_outcome": "DERROTA"
            }
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
            {
                "round_number": 1,
                "score_our_athlete": 7,
                "score_opponent": 0,
                "gap_info": "NOCAUTE",
                "round_outcome": "VITÓRIA"
            }
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
            {
                "round_number": 1,
                "score_our_athlete": 13,
                "score_opponent": 0,
                "gap_info": "GAP; NOCAUTE",
                "round_outcome": "VITÓRIA"
            }
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
            {
                "round_number": 1,
                "score_our_athlete": 9,
                "score_opponent": 0,
                "gap_info": "FALTAS",
                "round_outcome": "VITÓRIA"
            },
            {
                "round_number": 2,
                "score_our_athlete": 5,
                "score_opponent": 0,
                "gap_info": "FALTAS",
                "round_outcome": "VITÓRIA"
            }
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
            {
                "round_number": 1,
                "score_our_athlete": null,
                "score_opponent": null,
                "gap_info": "WO",
                "round_outcome": "VITÓRIA"
            },
            {
                "round_number": 2,
                "score_our_athlete": null,
                "score_opponent": null,
                "gap_info": "WO",
                "round_outcome": "VITÓRIA"
            }
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
            {
                "round_number": 1,
                "score_our_athlete": 7,
                "score_opponent": 1,
                "gap_info": "",
                "round_outcome": "VITÓRIA"
            },
            {
                "round_number": 2,
                "score_our_athlete": 9,
                "score_opponent": 2,
                "gap_info": "",
                "round_outcome": "VITÓRIA"
            }
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
            {
                "round_number": 1,
                "score_our_athlete": 10,
                "score_opponent": 1,
                "gap_info": "",
                "round_outcome": "VITÓRIA"
            },
            {
                "round_number": 2,
                "score_our_athlete": 2,
                "score_opponent": 0,
                "gap_info": "",
                "round_outcome": "VITÓRIA"
            }
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
            {
                "round_number": 1,
                "score_our_athlete": 13,
                "score_opponent": 0,
                "gap_info": "GAP",
                "round_outcome": "VITÓRIA"
            },
            {
                "round_number": 2,
                "score_our_athlete": 12,
                "score_opponent": 0,
                "gap_info": "GAP",
                "round_outcome": "VITÓRIA"
            }
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
            {
                "round_number": 1,
                "score_our_athlete": 4,
                "score_opponent": 6,
                "gap_info": "",
                "round_outcome": "DERROTA"
            },
            {
                "round_number": 2,
                "score_our_athlete": 4,
                "score_opponent": 8,
                "gap_info": "",
                "round_outcome": "DERROTA"
            }
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
            {
                "round_number": 1,
                "score_our_athlete": 13,
                "score_opponent": 0,
                "gap_info": "GAP",
                "round_outcome": "VITÓRIA"
            },
            {
                "round_number": 2,
                "score_our_athlete": 8,
                "score_opponent": 1,
                "gap_info": "",
                "round_outcome": "VITÓRIA"
            }
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
            {
                "round_number": 1,
                "score_our_athlete": 6,
                "score_opponent": 12,
                "gap_info": "",
                "round_outcome": "DERROTA"
            },
            {
                "round_number": 2,
                "score_our_athlete": 1,
                "score_opponent": 7,
                "gap_info": "DESISTÊNCIA (oponente)",
                "round_outcome": "VITÓRIA"
            }
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
            {
                "round_number": 1,
                "score_our_athlete": 0,
                "score_opponent": 13,
                "gap_info": "GAP",
                "round_outcome": "DERROTA"
            },
            {
                "round_number": 2,
                "score_our_athlete": 0,
                "score_opponent": 13,
                "gap_info": "GAP",
                "round_outcome": "DERROTA"
            }
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
            {
                "round_number": 1,
                "score_our_athlete": 9,
                "score_opponent": 5,
                "gap_info": "",
                "round_outcome": "VITÓRIA"
            },
            {
                "round_number": 2,
                "score_our_athlete": 8,
                "score_opponent": 0,
                "gap_info": "",
                "round_outcome": "VITÓRIA"
            }
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
            {
                "round_number": 1,
                "score_our_athlete": 9,
                "score_opponent": 0,
                "gap_info": "",
                "round_outcome": "VITÓRIA"
            },
            {
                "round_number": 2,
                "score_our_athlete": 7,
                "score_opponent": 1,
                "gap_info": "",
                "round_outcome": "VITÓRIA"
            }
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
            {
                "round_number": 1,
                "score_our_athlete": 2,
                "score_opponent": 7,
                "gap_info": "",
                "round_outcome": "DERROTA"
            },
            {
                "round_number": 2,
                "score_our_athlete": 1,
                "score_opponent": 6,
                "gap_info": "",
                "round_outcome": "DERROTA"
            }
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
            {
                "round_number": 1,
                "score_our_athlete": 17,
                "score_opponent": 18,
                "gap_info": "",
                "round_outcome": "DERROTA"
            },
            {
                "round_number": 2,
                "score_our_athlete": 20,
                "score_opponent": 8,
                "gap_info": "",
                "round_outcome": "VITÓRIA"
            },
            {
                "round_number": 3,
                "score_our_athlete": 19,
                "score_opponent": 17,
                "gap_info": "",
                "round_outcome": "VITÓRIA"
            }
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
            {
                "round_number": 1,
                "score_our_athlete": 24,
                "score_opponent": 22,
                "gap_info": "",
                "round_outcome": "VITÓRIA"
            },
            {
                "round_number": 2,
                "score_our_athlete": 17,
                "score_opponent": 22,
                "gap_info": "",
                "round_outcome": "DERROTA"
            },
            {
                "round_number": 3,
                "score_our_athlete": 12,
                "score_opponent": 14,
                "gap_info": "",
                "round_outcome": "DERROTA"
            }
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
            {
                "round_number": 1,
                "score_our_athlete": 4,
                "score_opponent": 0,
                "gap_info": "",
                "round_outcome": "VITÓRIA"
            },
            {
                "round_number": 2,
                "score_our_athlete": 3,
                "score_opponent": 0,
                "gap_info": "",
                "round_outcome": "VITÓRIA"
            }
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
            {
                "round_number": 1,
                "score_our_athlete": 1,
                "score_opponent": 9,
                "gap_info": "",
                "round_outcome": "DERROTA"
            },
            {
                "round_number": 2,
                "score_our_athlete": 6,
                "score_opponent": 8,
                "gap_info": "",
                "round_outcome": "DERROTA"
            }
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
            {
                "round_number": 1,
                "score_our_athlete": 10,
                "score_opponent": 1,
                "gap_info": "",
                "round_outcome": "VITÓRIA"
            },
            {
                "round_number": 2,
                "score_our_athlete": 10,
                "score_opponent": 5,
                "gap_info": "",
                "round_outcome": "VITÓRIA"
            }
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
            {
                "round_number": 1,
                "score_our_athlete": 11,
                "score_opponent": 6,
                "gap_info": "",
                "round_outcome": "VITÓRIA"
            },
            {
                "round_number": 2,
                "score_our_athlete": 5,
                "score_opponent": 3,
                "gap_info": "",
                "round_outcome": "VITÓRIA"
            }
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
            {
                "round_number": 1,
                "score_our_athlete": 2,
                "score_opponent": 7,
                "gap_info": "FALTA",
                "round_outcome": "DERROTA"
            },
            {
                "round_number": 2,
                "score_our_athlete": 1,
                "score_opponent": 10,
                "gap_info": "",
                "round_outcome": "DERROTA"
            }
        ],
        "coach": "Ms Júnior Massa",
        "fight_result": "DERROTA"
    },
    {
        "category": "SUB-21",
        "weight_class": "-63",
        "athlete_name": "Alisson Cauã",
        "opponent_name": "LUÍS OTÁVIO",
        "opponent_team": "Associação Rolandiense",
        "stage": "Semi Final",
        "rounds": [
            {
                "round_number": 1,
                "score_our_athlete": 12,
                "score_opponent": 0,
                "gap_info": "GAP",
                "round_outcome": "VITÓRIA"
            },
            {
                "round_number": 2,
                "score_our_athlete": 14,
                "score_opponent": 5,
                "gap_info": "FALTAS",
                "round_outcome": "VITÓRIA"
            }
        ],
        "coach": "Ms Junio Souza",
        "fight_result": "VITÓRIA"
    },
    {
        "category": "SUB-21",
        "weight_class": "-63",
        "athlete_name": "Alisson Cauã",
        "opponent_name": "Ghabriel Bryan",
        "opponent_team": "Madureira",
        "stage": "Final",
        "rounds": [
            {
                "round_number": 1,
                "score_our_athlete": 7,
                "score_opponent": 0,
                "gap_info": "",
                "round_outcome": "VITÓRIA"
            },
            {
                "round_number": 2,
                "score_our_athlete": 8,
                "score_opponent": 2,
                "gap_info": "",
                "round_outcome": "VITÓRIA"
            }
        ],
        "coach": "Ms Junio Souza",
        "fight_result": "VITÓRIA"
    },
    {
        "category": "SUB-21",
        "weight_class": "-46",
        "athlete_name": "Beatriz Miguel",
        "opponent_name": "Thamily",
        "opponent_team": "Team Morando",
        "stage": "Final",
        "rounds": [
            {
                "round_number": 1,
                "score_our_athlete": 6,
                "score_opponent": 0,
                "gap_info": "",
                "round_outcome": "VITÓRIA"
            },
            {
                "round_number": 2,
                "score_our_athlete": 15,
                "score_opponent": 3,
                "gap_info": "GAP",
                "round_outcome": "VITÓRIA"
            }
        ],
        "coach": "Ms Junio Souza",
        "fight_result": "VITÓRIA"
    },
    {
        "category": "SUB-21",
        "weight_class": "-74",
        "athlete_name": "Pedro Almeida",
        "opponent_name": "Tobias Albieri",
        "opponent_team": "Base e Monsters",
        "stage": "Semi Final",
        "rounds": [
            {
                "round_number": 1,
                "score_our_athlete": 7,
                "score_opponent": 0,
                "gap_info": "",
                "round_outcome": "VITÓRIA"
            },
            {
                "round_number": 2,
                "score_our_athlete": 6,
                "score_opponent": 4,
                "gap_info": "",
                "round_outcome": "VITÓRIA"
            }
        ],
        "coach": "Grão Mestre Daniel",
        "fight_result": "VITÓRIA"
    },
    {
        "category": "SUB-21",
        "weight_class": "-74",
        "athlete_name": "Pedro Almeida",
        "opponent_name": "Matheus",
        "opponent_team": "CT JD DO SOL",
        "stage": "Final",
        "rounds": [
            {
                "round_number": 1,
                "score_our_athlete": 4,
                "score_opponent": 2,
                "gap_info": "",
                "round_outcome": "VITÓRIA"
            },
            {
                "round_number": 2,
                "score_our_athlete": 4,
                "score_opponent": 1,
                "gap_info": "",
                "round_outcome": "VITÓRIA"
            }
        ],
        "coach": "Grão Mestre Daniel",
        "fight_result": "VITÓRIA"
    },
    {
        "category": "SUB-21",
        "weight_class": "-68",
        "athlete_name": "Luis Paulo",
        "opponent_name": "José Luís",
        "opponent_team": "União Lopes",
        "stage": "Semi Final",
        "rounds": [
            {
                "round_number": 1,
                "score_our_athlete": 9,
                "score_opponent": 9,
                "gap_info": "HIT",
                "round_outcome": "VITÓRIA"
            },
            {
                "round_number": 2,
                "score_our_athlete": 4,
                "score_opponent": 0,
                "gap_info": "NOCAUTE",
                "round_outcome": "VITÓRIA"
            }
        ],
        "coach": "Ms Junio Souza",
        "fight_result": "VITÓRIA"
    },
    {
        "category": "SUB-21",
        "weight_class": "-68",
        "athlete_name": "Luis Paulo",
        "opponent_name": "Karlos Henrique",
        "opponent_team": "Equipe Fúria",
        "stage": "Final",
        "rounds": [
            {
                "round_number": 1,
                "score_our_athlete": 15,
                "score_opponent": 1,
                "gap_info": "GAP",
                "round_outcome": "VITÓRIA"
            },
            {
                "round_number": 2,
                "score_our_athlete": 13,
                "score_opponent": 0,
                "gap_info": "GAP",
                "round_outcome": "VITÓRIA"
            }
        ],
        "coach": "Ms Junio Souza",
        "fight_result": "VITÓRIA"
    },
    {
        "category": "SUB-21",
        "weight_class": "-80",
        "athlete_name": "Guilherme Lopes",
        "opponent_name": "Piettro Fuzetto",
        "opponent_team": "ASSOCIAÇÃO POLLI",
        "stage": "Semi Final",
        "rounds": [
            {
                "round_number": 1,
                "score_our_athlete": 16,
                "score_opponent": 1,
                "gap_info": "GAP",
                "round_outcome": "VITÓRIA"
            },
            {
                "round_number": 2,
                "score_our_athlete": 16,
                "score_opponent": 0,
                "gap_info": "",
                "round_outcome": "VITÓRIA"
            }
        ],
        "coach": "Ms Júnior Massa",
        "fight_result": "VITÓRIA"
    },
    {
        "category": "SUB-21",
        "weight_class": "-80",
        "athlete_name": "Guilherme Lopes",
        "opponent_name": "João Marezzi",
        "opponent_team": "Madureira",
        "stage": "Final",
        "rounds": [
            {
                "round_number": 1,
                "score_our_athlete": 12,
                "score_opponent": 0,
                "gap_info": "GAP",
                "round_outcome": "VITÓRIA"
            },
            {
                "round_number": 2,
                "score_our_athlete": 14,
                "score_opponent": 2,
                "gap_info": "GAP",
                "round_outcome": "VITÓRIA"
            }
        ],
        "coach": "Ms Júnior Massa",
        "fight_result": "VITÓRIA"
    },
    {
        "category": "SUB-21",
        "weight_class": "+73",
        "athlete_name": "Elis Vasconcelos",
        "opponent_name": "Maiara Silva",
        "opponent_team": "Liga Vale",
        "stage": "Final",
        "rounds": [
            {
                "round_number": 1,
                "score_our_athlete": 12,
                "score_opponent": 0,
                "gap_info": "GAP",
                "round_outcome": "VITÓRIA"
            },
            {
                "round_number": 2,
                "score_our_athlete": 8,
                "score_opponent": 2,
                "gap_info": "",
                "round_outcome": "VITÓRIA"
            }
        ],
        "coach": "",
        "fight_result": "VITÓRIA"
    },
    {
        "category": "CADETE",
        "weight_class": "-61",
        "athlete_name": "William Kiso",
        "opponent_name": "NATHAN BORTOLAN",
        "opponent_team": "MM TAEKWONDO",
        "stage": "Oitavas de Final",
        "rounds": [
            {
                "round_number": 1,
                "score_our_athlete": 14,
                "score_opponent": 2,
                "gap_info": "",
                "round_outcome": "VITÓRIA"
            },
            {
                "round_number": 2,
                "score_our_athlete": 14,
                "score_opponent": 6,
                "gap_info": "",
                "round_outcome": "VITÓRIA"
            }
        ],
        "coach": "Ms Junio Souza",
        "fight_result": "VITÓRIA"
    },
    {
        "category": "CADETE",
        "weight_class": "-61",
        "athlete_name": "William Kiso",
        "opponent_name": "ARTHUR RODRIGO",
        "opponent_team": "Associação Sales",
        "stage": "Quartas de Final",
        "rounds": [
            {
                "round_number": 1,
                "score_our_athlete": 16,
                "score_opponent": 13,
                "gap_info": "",
                "round_outcome": "VITÓRIA"
            },
            {
                "round_number": 2,
                "score_our_athlete": 12,
                "score_opponent": 9,
                "gap_info": "",
                "round_outcome": "VITÓRIA"
            }
        ],
        "coach": "Pedro Hamasak",
        "fight_result": "VITÓRIA"
    },
    {
        "category": "CADETE",
        "weight_class": "-61",
        "athlete_name": "William Kiso",
        "opponent_name": "Emanuel Davi",
        "opponent_team": "TEAM MORANDO",
        "stage": "Semi Final",
        "rounds": [
            {
                "round_number": 1,
                "score_our_athlete": 22,
                "score_opponent": 20,
                "gap_info": "",
                "round_outcome": "VITÓRIA"
            },
            {
                "round_number": 2,
                "score_our_athlete": 6,
                "score_opponent": 6,
                "gap_info": "ABRIU CONTAGEM",
                "round_outcome": "VITÓRIA"
            }
        ],
        "coach": "Ms Junio Souza",
        "fight_result": "VITÓRIA"
    },
    {
        "category": "CADETE",
        "weight_class": "-61",
        "athlete_name": "William Kiso",
        "opponent_name": "Pedro Henrique",
        "opponent_team": "Sales",
        "stage": "Final",
        "rounds": [
            {
                "round_number": 1,
                "score_our_athlete": 4,
                "score_opponent": 16,
                "gap_info": "GAP",
                "round_outcome": "DERROTA"
            },
            {
                "round_number": 2,
                "score_our_athlete": 23,
                "score_opponent": 29,
                "gap_info": "",
                "round_outcome": "DERROTA"
            }
        ],
        "coach": "Ms Junio Souza",
        "fight_result": "DERROTA"
    },
    {
        "category": "CADETE",
        "weight_class": "-55",
        "athlete_name": "Maria Antônia",
        "opponent_name": "FERNANDA PEREIRA",
        "opponent_team": "TEAM MORANDO",
        "stage": "Semi Final",
        "rounds": [
            {
                "round_number": 1,
                "score_our_athlete": 3,
                "score_opponent": 0,
                "gap_info": "",
                "round_outcome": "VITÓRIA"
            },
            {
                "round_number": 2,
                "score_our_athlete": 4,
                "score_opponent": 7,
                "gap_info": "",
                "round_outcome": "DERROTA"
            },
            {
                "round_number": 3,
                "score_our_athlete": 1,
                "score_opponent": 2,
                "gap_info": "",
                "round_outcome": "DERROTA"
            }
        ],
        "coach": "Ms Junio Souza",
        "fight_result": "DERROTA"
    },
    {
        "category": "CADETE",
        "weight_class": "-45",
        "athlete_name": "Guilherme Nasi",
        "opponent_name": "Arthur Henrique",
        "opponent_team": "TEAM Morando",
        "stage": "Quartas de Final",
        "rounds": [
            {
                "round_number": 1,
                "score_our_athlete": 4,
                "score_opponent": 5,
                "gap_info": "",
                "round_outcome": "DERROTA"
            },
            {
                "round_number": 2,
                "score_our_athlete": 15,
                "score_opponent": 3,
                "gap_info": "GAP",
                "round_outcome": "VITÓRIA"
            },
            {
                "round_number": 3,
                "score_our_athlete": 15,
                "score_opponent": 12,
                "gap_info": "",
                "round_outcome": "VITÓRIA"
            }
        ],
        "coach": "Ms Junio Souza",
        "fight_result": "VITÓRIA"
    },
    {
        "category": "CADETE",
        "weight_class": "-45",
        "athlete_name": "Guilherme Nasi",
        "opponent_name": "Nicolas Lucas",
        "opponent_team": "Madureira",
        "stage": "Semi Final",
        "rounds": [
            {
                "round_number": 1,
                "score_our_athlete": 14,
                "score_opponent": 7,
                "gap_info": "",
                "round_outcome": "VITÓRIA"
            },
            {
                "round_number": 2,
                "score_our_athlete": 7,
                "score_opponent": 6,
                "gap_info": "",
                "round_outcome": "VITÓRIA"
            }
        ],
        "coach": "Ms Junio Souza",
        "fight_result": "VITÓRIA"
    },
    {
        "category": "CADETE",
        "weight_class": "-45",
        "athlete_name": "Guilherme Nasi",
        "opponent_name": "Ruan Augusto",
        "opponent_team": "Madureira",
        "stage": "Final",
        "rounds": [
            {
                "round_number": 1,
                "score_our_athlete": 4,
                "score_opponent": 0,
                "gap_info": "",
                "round_outcome": "VITÓRIA"
            },
            {
                "round_number": 2,
                "score_our_athlete": 10,
                "score_opponent": 2,
                "gap_info": "NOCAUTE",
                "round_outcome": "VITÓRIA"
            }
        ],
        "coach": "Ms Junio Souza",
        "fight_result": "VITÓRIA"
    },
    {
        "category": "CADETE",
        "weight_class": "-44",
        "athlete_name": "Milena Rayssa",
        "opponent_name": "Maria Vitória",
        "opponent_team": "Associação Sales",
        "stage": "Quartas de Final",
        "rounds": [
            {
                "round_number": 1,
                "score_our_athlete": 6,
                "score_opponent": 4,
                "gap_info": "",
                "round_outcome": "VITÓRIA"
            },
            {
                "round_number": 2,
                "score_our_athlete": 2,
                "score_opponent": 8,
                "gap_info": "",
                "round_outcome": "DERROTA"
            },
            {
                "round_number": 3,
                "score_our_athlete": 5,
                "score_opponent": 2,
                "gap_info": "",
                "round_outcome": "VITÓRIA"
            }
        ],
        "coach": "Ms Júnior Massa",
        "fight_result": "VITÓRIA"
    },
    {
        "category": "CADETE",
        "weight_class": "-44",
        "athlete_name": "Milena Rayssa",
        "opponent_name": "Lara Vitória",
        "opponent_team": "União Lopes",
        "stage": "Semi Final",
        "rounds": [
            {
                "round_number": 1,
                "score_our_athlete": 0,
                "score_opponent": 12,
                "gap_info": "GAP",
                "round_outcome": "DERROTA"
            },
            {
                "round_number": 2,
                "score_our_athlete": 0,
                "score_opponent": 12,
                "gap_info": "GAP",
                "round_outcome": "DERROTA"
            }
        ],
        "coach": "Pedro Hamasak",
        "fight_result": "DERROTA"
    },
    {
        "category": "CADETE",
        "weight_class": "+59",
        "athlete_name": "Dara Ayme",
        "opponent_name": "Júlia Fragoso",
        "opponent_team": "TEAM MORANDO",
        "stage": "Final",
        "rounds": [
            {
                "round_number": 1,
                "score_our_athlete": 2,
                "score_opponent": 4,
                "gap_info": "",
                "round_outcome": "DERROTA"
            },
            {
                "round_number": 2,
                "score_our_athlete": 8,
                "score_opponent": 9,
                "gap_info": "",
                "round_outcome": "DERROTA"
            }
        ],
        "coach": "Ms Junio Massa",
        "fight_result": "DERROTA"
    },
    {
        "category": "CADETE",
        "weight_class": "-49",
        "athlete_name": "Marcelo Carvalho",
        "opponent_name": "Rafael Neza",
        "opponent_team": "TEAM MORANDO",
        "stage": "Quartas de Final",
        "rounds": [
            {
                "round_number": 1,
                "score_our_athlete": 1,
                "score_opponent": 7,
                "gap_info": "",
                "round_outcome": "DERROTA"
            },
            {
                "round_number": 2,
                "score_our_athlete": 0,
                "score_opponent": 1,
                "gap_info": "",
                "round_outcome": "DERROTA"
            }
        ],
        "coach": "Ms Júnior Massa",
        "fight_result": "DERROTA"
    },
    {
        "category": "CADETE",
        "weight_class": "-51",
        "athlete_name": "Beatriz Rodrigues",
        "opponent_name": "Maria Luísa",
        "opponent_team": "MADUREIRA",
        "stage": "Quartas de Final",
        "rounds": [
            {
                "round_number": 1,
                "score_our_athlete": 16,
                "score_opponent": 4,
                "gap_info": "",
                "round_outcome": "VITÓRIA"
            },
            {
                "round_number": 2,
                "score_our_athlete": 28,
                "score_opponent": 16,
                "gap_info": "",
                "round_outcome": "VITÓRIA"
            }
        ],
        "coach": "Pedro Hamasak",
        "fight_result": "VITÓRIA"
    },
    {
        "category": "CADETE",
        "weight_class": "-51",
        "athlete_name": "Beatriz Rodrigues",
        "opponent_name": "Ana Clara",
        "opponent_team": "PW Team",
        "stage": "Semi Final",
        "rounds": [
            {
                "round_number": 1,
                "score_our_athlete": 15,
                "score_opponent": 2,
                "gap_info": "GAP",
                "round_outcome": "VITÓRIA"
            },
            {
                "round_number": 2,
                "score_our_athlete": 19,
                "score_opponent": 16,
                "gap_info": "",
                "round_outcome": "VITÓRIA"
            }
        ],
        "coach": "Pedro Hamasak",
        "fight_result": "VITÓRIA"
    },
    {
        "category": "CADETE",
        "weight_class": "-51",
        "athlete_name": "Beatriz Rodrigues",
        "opponent_name": "Larissa Vitória",
        "opponent_team": "Madureira",
        "stage": "Final",
        "rounds": [
            {
                "round_number": 1,
                "score_our_athlete": 8,
                "score_opponent": 7,
                "gap_info": "",
                "round_outcome": "VITÓRIA"
            },
            {
                "round_number": 2,
                "score_our_athlete": 17,
                "score_opponent": 4,
                "gap_info": "",
                "round_outcome": "VITÓRIA"
            }
        ],
        "coach": "Pedro Hamasak",
        "fight_result": "VITÓRIA"
    },
    {
        "category": "CADETE",
        "weight_class": "-59",
        "athlete_name": "Laura Greblo",
        "opponent_name": "Carolina Ribas",
        "opponent_team": "MADUREIRA",
        "stage": "Semi Final",
        "rounds": [
            {
                "round_number": 1,
                "score_our_athlete": 14,
                "score_opponent": 11,
                "gap_info": "",
                "round_outcome": "VITÓRIA"
            },
            {
                "round_number": 2,
                "score_our_athlete": 17,
                "score_opponent": 15,
                "gap_info": "",
                "round_outcome": "VITÓRIA"
            }
        ],
        "coach": "Ms Junio Souza",
        "fight_result": "VITÓRIA"
    },
    {
        "category": "CADETE",
        "weight_class": "-59",
        "athlete_name": "Laura Greblo",
        "opponent_name": "Alice Ortiz",
        "opponent_team": "Formando Campeões",
        "stage": "Final",
        "rounds": [
            {
                "round_number": 1,
                "score_our_athlete": 0,
                "score_opponent": 12,
                "gap_info": "GAP",
                "round_outcome": "DERROTA"
            },
            {
                "round_number": 2,
                "score_our_athlete": 4,
                "score_opponent": 17,
                "gap_info": "GAP",
                "round_outcome": "DERROTA"
            }
        ],
        "coach": "Ms Junio Souza",
        "fight_result": "DERROTA"
    },
    {
        "category": "ADULTO",
        "weight_class": "-80",
        "athlete_name": "Iago Vilela",
        "opponent_name": "Alison Santana",
        "opponent_team": "TEAM MORANDO",
        "stage": "Semi Final",
        "rounds": [
            {
                "round_number": 1,
                "score_our_athlete": 8,
                "score_opponent": 2,
                "gap_info": "",
                "round_outcome": "VITÓRIA"
            },
            {
                "round_number": 2,
                "score_our_athlete": 12,
                "score_opponent": 3,
                "gap_info": "",
                "round_outcome": "VITÓRIA"
            }
        ],
        "coach": "Grão Mestre Daniel",
        "fight_result": "VITÓRIA"
    },
    {
        "category": "ADULTO",
        "weight_class": "-80",
        "athlete_name": "Iago Vilela",
        "opponent_name": "Willian Cézar",
        "opponent_team": "Madureira",
        "stage": "Final",
        "rounds": [
            {
                "round_number": 1,
                "score_our_athlete": 3,
                "score_opponent": 5,
                "gap_info": "",
                "round_outcome": "DERROTA"
            },
            {
                "round_number": 2,
                "score_our_athlete": 7,
                "score_opponent": 1,
                "gap_info": "",
                "round_outcome": "VITÓRIA"
            },
            {
                "round_number": 3,
                "score_our_athlete": 2,
                "score_opponent": 0,
                "gap_info": "NOCAUTE",
                "round_outcome": "VITÓRIA"
            }
        ],
        "coach": "Grão Mestre Daniel",
        "fight_result": "VITÓRIA"
    },
    {
        "category": "ADULTO",
        "weight_class": "+73",
        "athlete_name": "Júlia Gabriela",
        "opponent_name": "Maria Eduarda",
        "opponent_team": "ACADEMIA MARCOS PAULO",
        "stage": "Final",
        "rounds": [
            {
                "round_number": 1,
                "score_our_athlete": 12,
                "score_opponent": 0,
                "gap_info": "GAP",
                "round_outcome": "VITÓRIA"
            },
            {
                "round_number": 2,
                "score_our_athlete": 12,
                "score_opponent": 2,
                "gap_info": "",
                "round_outcome": "VITÓRIA"
            }
        ],
        "coach": "Grão Mestre Daniel",
        "fight_result": "VITÓRIA"
    },
    {
        "category": "ADULTO",
        "weight_class": "-67",
        "athlete_name": "Cleidymara",
        "opponent_name": "Isabela Padilha",
        "opponent_team": "TEAM MORANDO",
        "stage": "Semi Final",
        "rounds": [
            {
                "round_number": 1,
                "score_our_athlete": 29,
                "score_opponent": 18,
                "gap_info": "",
                "round_outcome": "VITÓRIA"
            },
            {
                "round_number": 2,
                "score_our_athlete": 12,
                "score_opponent": 10,
                "gap_info": "",
                "round_outcome": "DERROTA"
            },
            {
                "round_number": 3,
                "score_our_athlete": 10,
                "score_opponent": 6,
                "gap_info": "",
                "round_outcome": "VITÓRIA"
            }
        ],
        "coach": "Pedro Hamasak",
        "fight_result": "VITÓRIA"
    },
    {
        "category": "ADULTO",
        "weight_class": "-67",
        "athlete_name": "Cleidymara",
        "opponent_name": "Beatriz da Silva",
        "opponent_team": "Madureira",
        "stage": "Final",
        "rounds": [
            {
                "round_number": 1,
                "score_our_athlete": 29,
                "score_opponent": 17,
                "gap_info": "GAP",
                "round_outcome": "VITÓRIA"
            },
            {
                "round_number": 2,
                "score_our_athlete": 15,
                "score_opponent": 2,
                "gap_info": "GAP",
                "round_outcome": "VITÓRIA"
            }
        ],
        "coach": "Pedro Hamasak",
        "fight_result": "VITÓRIA"
    },
    {
        "category": "ADULTO",
        "weight_class": "-68",
        "athlete_name": "Luiz Venâncio",
        "opponent_name": "Jorgeman Antonio",
        "opponent_team": "MADUREIRA",
        "stage": "Final",
        "rounds": [
            {
                "round_number": 1,
                "score_our_athlete": 12,
                "score_opponent": 3,
                "gap_info": "",
                "round_outcome": "VITÓRIA"
            },
            {
                "round_number": 2,
                "score_our_athlete": 24,
                "score_opponent": 14,
                "gap_info": "",
                "round_outcome": "VITÓRIA"
            }
        ],
        "coach": "Ms Júnior Massa",
        "fight_result": "VITÓRIA"
    }
];

function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
}

export function createDefaultFights() {
    return deepClone(fights);
}
