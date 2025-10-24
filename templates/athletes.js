export function renderAthleteCards(data) {
    const frag = document.createDocumentFragment();
    const build = typeof window.createAthleteCard === 'function' ? window.createAthleteCard : null;
    (Array.isArray(data) ? data : []).forEach((item, index) => {
        let card;
        if (build) {
            card = build(item, index);
        } else {
            const el = document.createElement('div');
            el.className = 'athlete-card';
            el.textContent = item && item.athlete_name ? item.athlete_name : '—';
            card = el;
        }
        frag.appendChild(card);
    });
    return frag;
}

export function buildExportBar(onCSV, onJSON) {
    const wrap = document.createElement('div');
    wrap.className = 'export-container';
    const title = document.createElement('h3');
    title.textContent = 'Exportar Atletas';
    const row = document.createElement('div');
    row.className = 'export-buttons';
    const btnCSV = document.createElement('button');
    btnCSV.className = 'export-btn';
    btnCSV.textContent = 'CSV';
    btnCSV.addEventListener('click', () => { if (typeof onCSV === 'function') onCSV(); });
    const btnJSON = document.createElement('button');
    btnJSON.className = 'export-btn';
    btnJSON.textContent = 'JSON';
    btnJSON.addEventListener('click', () => { if (typeof onJSON === 'function') onJSON(); });
    row.appendChild(btnCSV);
    row.appendChild(btnJSON);
    wrap.appendChild(title);
    wrap.appendChild(row);
    return wrap;
}

export function toAthleteRoster(rows) {
    const list = Array.isArray(rows) ? rows : [];
    const seen = new Map();
    list.forEach((r) => {
        const name = r && r.athlete_name ? String(r.athlete_name) : '';
        if (!name) return;
        if (!seen.has(name)) {
            seen.set(name, {
                fullName: name,
                category: r.category || '',
                weightClass: r.weight_class || '',
                beltColor: '',
                team: r.team || '',
            });
        }
    });
    return Array.from(seen.values());
}
