export function renderCoachesList(coaches, handlers) {
    const frag = document.createDocumentFragment();
    const list = document.createElement('ul');
    list.style.listStyle = 'none';
    list.style.padding = '0';
    (Array.isArray(coaches) ? coaches : []).forEach((c) => {
        const li = document.createElement('li');
        li.style.display = 'flex';
        li.style.alignItems = 'center';
        li.style.justifyContent = 'space-between';
        li.style.padding = '0.5rem 0';
        const name = document.createElement('span');
        name.textContent = c.fullName || '—';
        const actions = document.createElement('div');
        const be = document.createElement('button');
        be.className = 'edit-btn';
        be.textContent = 'Editar';
        be.addEventListener('click', () => handlers?.onEdit && handlers.onEdit(c));
        const bd = document.createElement('button');
        bd.className = 'delete-btn';
        bd.textContent = 'Excluir';
        bd.addEventListener('click', () => handlers?.onDelete && handlers.onDelete(c));
        actions.appendChild(be);
        actions.appendChild(bd);
        li.appendChild(name);
        li.appendChild(actions);
        list.appendChild(li);
    });
    frag.appendChild(list);
    return frag;
}

export function renderTrainingLocationsList(locations, coaches, handlers) {
    const frag = document.createDocumentFragment();
    const list = document.createElement('ul');
    list.style.listStyle = 'none';
    list.style.padding = '0';
    (Array.isArray(locations) ? locations : []).forEach((loc) => {
        const li = document.createElement('li');
        li.style.display = 'grid';
        li.style.gridTemplateColumns = '1fr auto';
        li.style.alignItems = 'center';
        li.style.padding = '0.5rem 0';
        const left = document.createElement('div');
        const title = document.createElement('div');
        title.style.fontWeight = '600';
        title.textContent = loc.name || '—';
        const subtitle = document.createElement('div');
        const coachNames = (loc.responsibleCoachIds || []).map(id => (coaches || []).find(c => c.id === id)?.fullName || '—').join(', ');
        subtitle.style.fontSize = '0.85rem';
        subtitle.style.color = '#666';
        subtitle.textContent = coachNames || 'Sem técnico';
        left.appendChild(title);
        left.appendChild(subtitle);
        const actions = document.createElement('div');
        const be = document.createElement('button');
        be.className = 'edit-btn';
        be.textContent = 'Editar';
        be.addEventListener('click', () => handlers?.onEdit && handlers.onEdit(loc));
        const bd = document.createElement('button');
        bd.className = 'delete-btn';
        bd.textContent = 'Excluir';
        bd.addEventListener('click', () => handlers?.onDelete && handlers.onDelete(loc));
        actions.appendChild(be);
        actions.appendChild(bd);
        li.appendChild(left);
        li.appendChild(actions);
        list.appendChild(li);
    });
    frag.appendChild(list);
    return frag;
}
