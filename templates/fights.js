export function renderFightCards(data) {
    const frag = document.createDocumentFragment();
    (Array.isArray(data) ? data : []).forEach((fight) => {
        const card = document.createElement('div');
        card.className = `athlete-card ${getResultClass(fight?.fight_result)}`;
        const roundsInfo = Array.isArray(fight?.rounds) && fight.rounds.length
            ? fight.rounds.map(r => `R${r.round_number}: ${(r.score_our_athlete ?? '?')}x${(r.score_opponent ?? '?')} (${r.round_outcome || '—'})`).join('<br>')
            : 'Sem rounds registrados';
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
            <div class="rounds-info" style="font-size: 0.8rem; margin-bottom: 1rem; color: #666;">${roundsInfo}</div>
            <div class="fight-result ${getResultClass(fight?.fight_result)}">${fight?.fight_result || 'A Definir'}</div>
        `;
        frag.appendChild(card);
    });
    return frag;
}

function getResultClass(result) {
    if (result === 'VITÓRIA') return 'victory';
    if (result === 'DERROTA') return 'defeat';
    return 'pending';
}
