function downloadBlob(content, mime, filename) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function escapeCSV(value) {
  if (value === null || value === undefined) return '';
  let s = String(value);
  const needsQuote = /[",\n\r]/.test(s);
  if (s.includes('"')) s = s.replace(/"/g, '""');
  return needsQuote ? `"${s}"` : s;
}

function deriveColumns(data) {
  const keys = new Set();
  for (const row of data) {
    if (row && typeof row === 'object' && !Array.isArray(row)) {
      Object.keys(row).forEach((k) => keys.add(k));
    }
  }
  return Array.from(keys).map((k) => ({ key: k, label: k }));
}

export function exportJSON(data, filename = 'export.json') {
  const payload = Array.isArray(data) || typeof data === 'object' ? data : [];
  const json = JSON.stringify(payload, null, 2);
  downloadBlob(json, 'application/json', filename);
}

export function exportCSV(data, columns, filename = 'export.csv') {
  const rows = Array.isArray(data) ? data : [];
  const cols = Array.isArray(columns) && columns.length ? columns : deriveColumns(rows);
  const header = cols.map((c) => escapeCSV(c.label || c.key)).join(',');
  const body = rows
    .map((row) =>
      cols
        .map((c) => {
          const val = typeof c.transform === 'function' ? c.transform(row) : row[c.key];
          return escapeCSV(val);
        })
        .join(',')
    )
    .join('\n');
  const csv = [header, body].filter(Boolean).join('\n');
  downloadBlob(csv, 'text/csv', filename);
}

export function exportAthletes(athletes, format = 'csv') {
  const data = Array.isArray(athletes) ? athletes : [];
  const columns = [
    { key: 'fullName', label: 'fullName' },
    { key: 'category', label: 'category' },
    { key: 'weightClass', label: 'weightClass' },
    { key: 'beltColor', label: 'beltColor' },
    { key: 'team', label: 'team' }
  ];
  if (format === 'json') {
    exportJSON(data, 'athletes.json');
  } else {
    exportCSV(data, columns, 'athletes.csv');
  }
}

export function exportFights(fights, format = 'csv') {
  const data = Array.isArray(fights) ? fights : [];
  const columns = [
    { key: 'athlete_name', label: 'athlete' },
    { key: 'category', label: 'category' },
    { key: 'weight_class', label: 'weightClass' },
    { key: 'opponent_name', label: 'opponent' },
    { key: 'opponent_team', label: 'opponentTeam' },
    { key: 'stage', label: 'phase' },
    { key: 'coach', label: 'coach' },
    { key: 'fight_result', label: 'result' }
  ];
  if (format === 'json') {
    exportJSON(data, 'fights.json');
  } else {
    exportCSV(data, columns, 'fights.csv');
  }
}

export function exportAnalytics(bundle, format = 'json') {
  const data = bundle || {};
  if (format === 'json') {
    exportJSON(data, 'analytics.json');
  } else {
    const list = Array.isArray(data.performanceByAthlete) ? data.performanceByAthlete : [];
    const columns = [
      { key: 'athlete', label: 'athlete' },
      { key: 'winRate', label: 'winRate' },
      { key: 'fights', label: 'fights' }
    ];
    exportCSV(list, columns, 'analytics-performance.csv');
  }
}
