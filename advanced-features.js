const ExportUtils = (()=>{
  function toCSV(rows){
    if(!rows || !rows.length) return '';
    const headers = Object.keys(rows[0]);
    const escape = v => '"'+String(v).replaceAll('"','""')+'"';
    const lines = [headers.join(',')].concat(rows.map(r=>headers.map(h=>escape(r[h]??'')).join(',')));
    return lines.join('\n');
  }
  function download(filename, content, mime){
    const blob = new Blob([content], {type: mime});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    setTimeout(()=>URL.revokeObjectURL(url), 0);
  }
  function exportCSV(rows, filename='export.csv'){
    const csv = toCSV(rows);
    // Prepend BOM for UTF-8
    download(filename, '\uFEFF'+csv, 'text/csv;charset=utf-8');
  }
  function exportJSON(rows, filename='export.json'){
    download(filename, JSON.stringify(rows, null, 2), 'application/json');
  }
  return { exportCSV, exportJSON };
})();

// Data I/O: import/export all models to a single JSON file
const DataIO = (()=>{
  const VERSION = '1';
  function nowIso(){ return new Date().toISOString(); }
  function readAll(){
    return {
      schemaVersion: VERSION,
      exportedAt: nowIso(),
      athletes: JSON.parse(localStorage.getItem('athletes')||'[]'),
      coaches: JSON.parse(localStorage.getItem('coaches')||'[]'),
      trainingLocations: JSON.parse(localStorage.getItem('trainingLocations')||'[]'),
      penalties: JSON.parse(localStorage.getItem('penalties')||'[]'),
      fights: JSON.parse(localStorage.getItem('fights')||'[]')
    };
  }
  function writeAll(payload){
    if(!payload || typeof payload!=='object') throw new Error('JSON inválido');
    const arr = (v)=> Array.isArray(v)? v : [];
    localStorage.setItem('athletes', JSON.stringify(arr(payload.athletes)));
    localStorage.setItem('coaches', JSON.stringify(arr(payload.coaches)));
    localStorage.setItem('trainingLocations', JSON.stringify(arr(payload.trainingLocations)));
    localStorage.setItem('penalties', JSON.stringify(arr(payload.penalties)));
    localStorage.setItem('fights', JSON.stringify(arr(payload.fights)));
    localStorage.setItem('dataVersion', VERSION);
  }
  async function importFromFile(file){
    const text = await file.text();
    const json = JSON.parse(text);
    writeAll(json);
  }
  function exportToFile(filename='dados.json'){
    ExportUtils.exportJSON(readAll(), filename);
  }
  return { readAll, writeAll, importFromFile, exportToFile };
})();

window.DataIO = DataIO;

function showConfirm(message){
  return new Promise(resolve=>{
    const modal = document.getElementById('modal-confirm');
    const msg = document.getElementById('confirm-message');
    const ok = document.getElementById('confirm-ok');
    const cancel = document.getElementById('confirm-cancel');
    const close = document.getElementById('confirm-close');
    function cleanup(){
      modal.classList.add('is-hidden');
      ok.removeEventListener('click', onOk);
      cancel.removeEventListener('click', onCancel);
      close.removeEventListener('click', onCancel);
      document.removeEventListener('keydown', onKey);
    }
    function onOk(){ cleanup(); resolve(true); }
    function onCancel(){ cleanup(); resolve(false); }
    function onKey(e){ if(e.key==='Escape'){ onCancel(); } }
    if(msg) msg.textContent = message || '';
    modal.classList.remove('is-hidden');
    ok.addEventListener('click', onOk);
    cancel.addEventListener('click', onCancel);
    close.addEventListener('click', onCancel);
    document.addEventListener('keydown', onKey);
  });
}

// Chart renderers (wired later in US1 implementation)
const Charts = (()=>{
  // Função inteligente para calcular largura de colunas (8-44px)
  function calcBarThickness(ctx, labelsCount, datasetsCount, stacked){
    try{
      const canvas = ctx && ctx.canvas;
      if(!canvas) return 24; // fallback
      
      const w = canvas.clientWidth || canvas.offsetWidth || 320;
      const categories = Math.max(1, labelsCount);
      const bars = Math.max(1, stacked ? 1 : datasetsCount);
      
      // Espaço disponível por barra
      const spacePerBar = (w / categories / bars) * 0.7;
      
      // Aplicar limites: 8px (mobile/muitas colunas) a 44px (desktop/poucas colunas)
      const thickness = Math.round(Math.max(8, Math.min(44, spacePerBar)));
      
      return thickness;
    }catch(_){ 
      return 24; // fallback
    }
  }
  
  // Plugin: desenha os valores numéricos diretamente nos elementos (barras e fatias)
  const valueLabelsPlugin = {
    id: 'valueLabels',
    afterDatasetsDraw(chart, args, opts){
      const { ctx } = chart;
      const color = (opts && opts.color) || '#111827';
      const fontSize = (opts && opts.fontSize) || 11;
      ctx.save();
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `500 ${fontSize}px system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial`;
      chart.data.datasets.forEach((ds, i)=>{
        const meta = chart.getDatasetMeta(i);
        if(meta.hidden) return;
        meta.data.forEach((el, index)=>{
          const value = ds.data[index];
          if(value == null) return;
          if(meta.type === 'bar'){
            const { x, y } = el.getProps(['x','y'], true);
            ctx.fillText(String(value), x, y - 8);
          } else if(meta.type === 'doughnut' || meta.type === 'pie'){
            const { x, y, startAngle, endAngle, innerRadius, outerRadius } = el.getProps(['x','y','startAngle','endAngle','innerRadius','outerRadius'], true);
            const angle = (startAngle + endAngle) / 2;
            const r = (innerRadius + outerRadius) / 2;
            const tx = x + Math.cos(angle) * r;
            const ty = y + Math.sin(angle) * r;
            ctx.fillText(String(value), tx, ty);
          }
        });
      });
      ctx.restore();
    }
  };
  
  function renderCategory(ctx, data){
    if(!window.Chart) return null;
    const labelsCount = (data && data.labels && data.labels.length) ? data.labels.length : 1;
    const datasetsCount = (data && data.datasets && data.datasets.length) ? data.datasets.length : 1;
    const thickness = calcBarThickness(ctx, labelsCount, datasetsCount, false);
    
    return new Chart(ctx, { type: 'bar', data, options: {
      responsive: true,
      animation: { duration: 400 },
      maintainAspectRatio: false,
      plugins: { legend: { position: 'top' } },
      scales: {
        x: { stacked: false, ticks: { maxRotation: 0, autoSkip: true }, grid: { display: false }, offset: true },
        y: { beginAtZero: true, grid: { color: '#e5e7eb' } }
      },
      datasets: { bar: { barThickness: thickness, maxBarThickness: 44, minBarThickness: 8, categoryPercentage: 0.8, barPercentage: 0.85, borderRadius: 0 } }
    } });
  }
  function renderPhase(ctx, data){
    if(!window.Chart) return null;
    return new Chart(ctx, { type: 'doughnut', data, options: {
      responsive: true,
      animation: { duration: 400 },
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          // Apenas dois itens: um por dataset (Vitória/Derrota)
          labels: {
            font: { size: 10 },
            generateLabels(chart){
              const datasets = chart.data.datasets || [];
              return datasets.map((ds, di)=>{
                const color = Array.isArray(ds.backgroundColor) ? ds.backgroundColor[0] : ds.backgroundColor;
                return {
                  text: ds.label || `Dataset ${di+1}`,
                  fillStyle: color,
                  strokeStyle: color,
                  lineWidth: 1,
                  hidden: !chart.isDatasetVisible(di),
                  datasetIndex: di
                };
              });
            }
          },
          onClick(e, legendItem, legend){
            const ci = legend.chart;
            const di = legendItem.datasetIndex;
            const meta = ci.getDatasetMeta(di);
            meta.hidden = meta.hidden === null ? !ci.isDatasetVisible(di) : null;
            ci.update();
          }
        }
      },
      layout: { padding: 8 }
    } });
  }
  return { renderCategory, renderPhase };
})();

const AthletesUI = (()=>{
  let page = 1;
  const pageSize = 8;
  let filters = { search: '', category: '', graduation: '' };
  let currentView = [];
  let callbacks = { onCreate:null, onUpdate:null, onDelete:null, getAll:()=>[], getLocations:()=>[], getFights:()=>[] };

  function qs(id){ return document.getElementById(id); }
  function norm(v){ return String(v||'').toLowerCase(); }
  function escapeHtml(s){ return String(s).replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
  function sanitizeText(s){ return String(s||'').replace(/[\u0000-\u001F\u007F<>]/g,'').trim(); }

  function distinct(list, key){
    const set = new Set();
    for(const item of list){ if(item && item[key]) set.add(item[key]); }
    return Array.from(set).sort();
  }

  function applyFilters(rows){
    let r = rows;
    const s = norm(filters.search);
    if(s) r = r.filter(a=> norm(a.name).includes(s));
    if(filters.category) r = r.filter(a=> a.category===filters.category);
    if(filters.graduation) r = r.filter(a=> a.graduation===filters.graduation);
    return r;
  }

  function paginate(rows){
    const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
    if(page>totalPages) page = totalPages;
    const start = (page-1)*pageSize;
    const view = rows.slice(start, start+pageSize);
    return { view, totalPages };
  }

  function renderOptions(sel, values, placeholder){
    const keep = sel.value;
    sel.innerHTML = '';
    const first = document.createElement('option');
    first.value = '';
    first.textContent = placeholder;
    sel.appendChild(first);
    for(const v of values){
      const opt = document.createElement('option');
      opt.value = v; opt.textContent = v; sel.appendChild(opt);
    }
    if(values.includes(keep)) sel.value = keep;
  }

  function renderMultiOptions(sel, pairs, selected){
    const selectedSet = new Set((selected||[]).map(String));
    sel.innerHTML = '';
    for(const [value,label] of pairs){
      const opt = document.createElement('option');
      opt.value = String(value);
      opt.textContent = label;
      opt.selected = selectedSet.has(String(value));
      sel.appendChild(opt);
    }
  }

  function render(){
    const all = callbacks.getAll();
    const filtered = applyFilters(all);
    const { view, totalPages } = paginate(filtered);
    const tbody = qs('athletes-tbody');
    const fights = callbacks.getFights ? callbacks.getFights() : [];
    
    tbody.innerHTML = view.map(a=>{
      // Calcular estatísticas
      const athleteFights = fights.filter(f=> String(f.athleteId)===String(a.id));
      const wins = athleteFights.filter(f=>f.result==='Vitória').length;
      const losses = athleteFights.filter(f=>f.result==='Derrota').length;
      const total = athleteFights.length;
      const statsHtml = `<span class="stat-wins">${wins}</span> / <span class="stat-losses">${losses}</span> — <span class="stat-total">${total}</span>`;
      
      return `<tr data-athlete-id="${a.id}">`+
      `<td data-label="Nome">${escapeHtml(a.name)}</td>`+
      `<td data-label="Categoria">${escapeHtml(a.category||'')}</td>`+
      `<td data-label="Graduação">${escapeHtml(a.graduation||'')}</td>`+
      `<td data-label="V / D — L"><span>${statsHtml}</span></td>`+
      `<td class="col-actions" data-label="Ações">`+
      `<button class="action" data-action="edit" data-id="${a.id}" aria-label="Editar" title="Editar"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 000-1.42l-2.34-2.34a1.003 1.003 0 00-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z"/></svg></button>`+
      `<button class="action" data-action="delete" data-id="${a.id}" aria-label="Excluir" title="Excluir"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M9 3a1 1 0 00-1 1v1H4v2h16V5h-4V4a1 1 0 00-1-1H9zm-3 7h2v9H6v-9zm5 0h2v9h-2v-9zm5 0h2v9h-2v-9z"/></svg></button>`+
      `</td>`+
      `</tr>`;
    }).join('');
    currentView = view.slice();
    qs('athletes-page').textContent = `${page}/${totalPages}`;
    qs('athletes-prev').disabled = page<=1;
    qs('athletes-next').disabled = page>=totalPages;
    renderOptions(qs('athlete-filter-category'), distinct(all,'category'), 'Todas as Categorias');
    renderOptions(qs('athlete-filter-graduation'), distinct(all,'graduation'), 'Todas as Graduações');
  }

  function openModal(athlete){
    const modal = document.getElementById('modal-athlete');
    modal.classList.remove('is-hidden');
    qs('athlete-id').value = athlete && athlete.id ? athlete.id : '';
    qs('athlete-name').value = athlete ? (athlete.name||'') : '';
    qs('athlete-category').value = athlete ? (athlete.category||'') : '';
    qs('athlete-graduation').value = athlete ? (athlete.graduation||'') : '';
    
    // Build dynamic list of location selects with schedules
    const list = document.getElementById('athlete-locations-list');
    list.innerHTML = '';
    const schedules = Array.isArray(athlete && athlete.trainingSchedule) ? athlete.trainingSchedule : [];
    
    if(schedules.length > 0){
      for(const schedule of schedules){ 
        addLocationRow(schedule);
        // Se não houver dias, adiciona um dia inicial
        const lastSchedule = list.querySelector('.loc-schedule:last-child');
        if(lastSchedule && lastSchedule.querySelectorAll('.day-row').length === 0){
          addDayRow(lastSchedule, null);
        }
      }
    } else {
      // Fallback: dados antigos ou novo atleta - não adiciona nada inicialmente
      // O usuário pode adicionar via botão "Adicionar Local"
    }
    
    refreshLocationOptions();
    qs('athlete-name').focus();
  }
  function closeModal(){
    document.getElementById('modal-athlete').classList.add('is-hidden');
  }

  function collectForm(){
    const id = qs('athlete-id').value.trim();
    const name = qs('athlete-name').value.trim();
    const category = qs('athlete-category').value.trim();
    const graduation = qs('athlete-graduation').value.trim();
    
    // Coletar schedule na nova estrutura
    const trainingSchedule = [];
    const locations = [];
    
    document.querySelectorAll('#athlete-locations-list .loc-schedule').forEach(locEl=>{
      const locationId = locEl.querySelector('.loc-select')?.value;
      if(!locationId) return;
      
      locations.push(locationId);
      const days = [];
      
      locEl.querySelectorAll('.day-row').forEach(dayEl=>{
        const weekday = dayEl.querySelector('.day-select')?.value;
        if(!weekday) return;
        
        const intervals = [];
        dayEl.querySelectorAll('.interval-group').forEach(intEl=>{
          const startPicker = intEl.querySelector('.interval-start');
          const endPicker = intEl.querySelector('.interval-end');
          const start = startPicker ? getTimePickerValue(startPicker) : null;
          const end = endPicker ? getTimePickerValue(endPicker) : null;
          if(start && end) intervals.push({ start, end });
        });
        
        if(intervals.length > 0) days.push({ weekday, intervals });
      });
      
      if(days.length > 0) trainingSchedule.push({ locationId, days });
    });
    
    if(!name) return null;
    return { id: id||null, name, category, graduation, locations, trainingSchedule };
  }

  function bindEvents(){
    qs('athlete-search').addEventListener('input', e=>{ filters.search = e.target.value; page=1; render(); });
    qs('athlete-filter-category').addEventListener('change', e=>{ filters.category = e.target.value; page=1; render(); });
    qs('athlete-filter-graduation').addEventListener('change', e=>{ filters.graduation = e.target.value; page=1; render(); });
    qs('athletes-prev').addEventListener('click', ()=>{ if(page>1){ page--; render(); }});
    qs('athletes-next').addEventListener('click', ()=>{ page++; render(); });
    document.getElementById('btn-new-athlete').addEventListener('click', ()=> openModal(null));
    document.getElementById('athlete-cancel').addEventListener('click', closeModal);
    document.getElementById('athlete-form').addEventListener('submit', e=>{
      e.preventDefault();
      
      // Validar todos os intervalos antes de salvar
      const intervalGroups = document.querySelectorAll('.interval-group');
      const errors = [];
      let firstErrorElement = null;
      
      intervalGroups.forEach(group=>{
        if(group._validate){
          const error = group._validate();
          if(error){
            errors.push(error);
            if(!firstErrorElement) firstErrorElement = group;
          }
        }
      });
      
      if(errors.length > 0){
        // Mostrar primeiro erro
        alert(errors[0]);
        // Scroll até o primeiro elemento com erro
        if(firstErrorElement){
          const intervalsList = firstErrorElement.closest('.intervals-list');
          if(intervalsList){
            firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
          }
        }
        return;
      }
      
      const data = collectForm();
      if(!data) return;
      if(data.id){ if(callbacks.onUpdate) callbacks.onUpdate(data); }
      else { if(callbacks.onCreate) callbacks.onCreate(data); }
      closeModal();
    });
    document.getElementById('athletes-tbody').addEventListener('click', e=>{
      // Verificar se clicou em um botão de ação
      const btn = e.target.closest('button[data-action]');
      if(btn){
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const action = btn.getAttribute('data-action');
        if(action==='edit'){
          const found = callbacks.getAll().find(a=> String(a.id)===String(id));
          if(found) openModal(found);
        } else if(action==='delete'){
          showConfirm('Excluir atleta?').then(ok=>{ if(ok){ if(callbacks.onDelete) callbacks.onDelete(id); render(); } });
        }
        return;
      }
      
      // Verificar se clicou na linha (mas não em botões)
      const row = e.target.closest('tr[data-athlete-id]');
      if(row){
        const id = row.getAttribute('data-athlete-id');
        const athlete = callbacks.getAll().find(a=> String(a.id)===String(id));
        if(athlete) showAthleteDetails(athlete);
      }
    });
    document.getElementById('btn-export-athletes-csv').addEventListener('click', ()=>{
      ExportUtils.exportCSV(currentView, 'athletes.csv');
    });
    document.getElementById('btn-export-athletes-json').addEventListener('click', ()=>{
      ExportUtils.exportJSON(currentView, 'athletes.json');
    });
    const cancelBtn = document.getElementById('athlete-cancel'); if(cancelBtn){ cancelBtn.addEventListener('click', closeModal); }
    // Header close
    const closeBtn = document.getElementById('athlete-close'); if(closeBtn){ closeBtn.addEventListener('click', closeModal); }
    // Dynamic locations list
    const addBtn = document.getElementById('btn-add-athlete-location');
    if(addBtn){ 
      addBtn.addEventListener('click', ()=>{ 
        addLocationRow(null);
        // Add initial day row if location was just created
        const schedules = document.querySelectorAll('#athlete-locations-list .loc-schedule');
        const lastSchedule = schedules[schedules.length - 1];
        if(lastSchedule && lastSchedule.querySelectorAll('.day-row').length === 0){
          addDayRow(lastSchedule, null);
        }
      }); 
    }
    const list = document.getElementById('athlete-locations-list');
    if(list){
      list.addEventListener('change', e=>{ 
        if(e.target && e.target.matches('.loc-select')){ 
          refreshLocationOptions(); 
        } 
      });
    }
    // Quando locais forem atualizados, recarrega opções preservando seleção
    window.addEventListener('locations:updated', ()=>{ refreshLocationOptions(); });
  }

  function fillSelect(sel, pairs, placeholder){
    const keep = sel.value;
    sel.innerHTML = '';
    const first = document.createElement('option'); first.value=''; first.textContent=placeholder; sel.appendChild(first);
    for(const [value,label] of pairs){ const o=document.createElement('option'); o.value=String(value); o.textContent=label; sel.appendChild(o); }
    if(keep && pairs.some(([v])=> String(v)===String(keep))){ sel.value = keep; }
  }

  const WEEKDAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
  
  // Criar time picker customizado 24h
  function createTimePicker(initialValue){
    const [hour, minute] = initialValue ? initialValue.split(':') : ['00', '00'];
    const picker = document.createElement('div');
    picker.className = 'custom-time-picker';
    picker.setAttribute('data-time', initialValue || '00:00');
    
    picker.innerHTML = `
      <svg class="clock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
      </svg>
      <div class="time-display">
        <div class="time-part time-hour">
          <div class="time-part-value">
            <span class="hour-value">${hour}</span>
            <svg class="time-part-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </div>
        </div>
        <span class="time-separator">:</span>
        <div class="time-part time-minute">
          <div class="time-part-value">
            <span class="minute-value">${minute}</span>
            <svg class="time-part-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </div>
        </div>
      </div>
    `;
    
    const hourPart = picker.querySelector('.time-hour');
    const minutePart = picker.querySelector('.time-minute');
    const hourValue = picker.querySelector('.hour-value');
    const minuteValue = picker.querySelector('.minute-value');
    
    // Gerar opções de hora (00-23)
    const hours = Array.from({length: 24}, (_, i)=> String(i).padStart(2, '0'));
    // Gerar opções de minuto (intervalos de 5: 00, 05, 10, ..., 55)
    const minutes = Array.from({length: 12}, (_, i)=> String(i * 5).padStart(2, '0'));
    
    let hourDropdown = null;
    let minuteDropdown = null;
    
    // Função para fechar todos os dropdowns
    const closeAllDropdowns = ()=>{
      if(hourDropdown && hourDropdown.parentNode){
        hourDropdown.remove();
        hourDropdown = null;
      }
      if(minuteDropdown && minuteDropdown.parentNode){
        minuteDropdown.remove();
        minuteDropdown = null;
      }
    };
    
    // Função para atualizar o valor do time picker
    const updateValue = ()=>{
      const h = hourValue.textContent;
      const m = minuteValue.textContent;
      const timeStr = `${h}:${m}`;
      picker.setAttribute('data-time', timeStr);
      // Disparar evento de mudança para validação
      picker.dispatchEvent(new Event('change', { bubbles: true }));
    };
    
    // Toggle hour dropdown
    hourPart.addEventListener('click', (e)=>{
      e.preventDefault();
      e.stopPropagation();
      closeAllDropdowns();
      
      hourDropdown = document.createElement('div');
      hourDropdown.className = 'time-dropdown';
      hours.forEach(h=>{
        const item = document.createElement('div');
        item.className = 'time-dropdown-item';
        if(h === hourValue.textContent) item.classList.add('selected');
        item.textContent = h;
        item.addEventListener('click', (e)=>{
          e.preventDefault();
          e.stopPropagation();
          hourValue.textContent = h;
          updateValue();
          closeAllDropdowns();
        });
        hourDropdown.appendChild(item);
      });
      
      // Adicionar ao body para position:fixed
      document.body.appendChild(hourDropdown);
      
      // Calcular posição
      const rect = hourPart.getBoundingClientRect();
      const dropdownHeight = hours.length * 32; // Aproximadamente 32px por item
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      // Decidir se abre para baixo ou para cima
      let top, maxHeight;
      if(spaceBelow >= Math.min(dropdownHeight, 200) || spaceBelow >= spaceAbove){
        // Abrir para baixo
        top = rect.bottom + 2;
        maxHeight = Math.min(spaceBelow - 10, 200);
      } else {
        // Abrir para cima
        maxHeight = Math.min(spaceAbove - 10, 200);
        top = rect.top - maxHeight - 2;
      }
      
      hourDropdown.style.left = rect.left + 'px';
      hourDropdown.style.top = top + 'px';
      hourDropdown.style.width = rect.width + 'px';
      hourDropdown.style.maxHeight = maxHeight + 'px';
      hourDropdown.style.overflowY = dropdownHeight > maxHeight ? 'auto' : 'visible';
      
      // Scroll para o item selecionado
      setTimeout(()=>{
        const selected = hourDropdown.querySelector('.selected');
        if(selected) selected.scrollIntoView({ block: 'center' });
      }, 10);
    });
    
    // Toggle minute dropdown
    minutePart.addEventListener('click', (e)=>{
      e.preventDefault();
      e.stopPropagation();
      closeAllDropdowns();
      
      minuteDropdown = document.createElement('div');
      minuteDropdown.className = 'time-dropdown';
      minutes.forEach(m=>{
        const item = document.createElement('div');
        item.className = 'time-dropdown-item';
        if(m === minuteValue.textContent) item.classList.add('selected');
        item.textContent = m;
        item.addEventListener('click', (e)=>{
          e.preventDefault();
          e.stopPropagation();
          minuteValue.textContent = m;
          updateValue();
          closeAllDropdowns();
        });
        minuteDropdown.appendChild(item);
      });
      
      // Adicionar ao body para position:fixed
      document.body.appendChild(minuteDropdown);
      
      // Calcular posição
      const rect = minutePart.getBoundingClientRect();
      const dropdownHeight = minutes.length * 32; // Aproximadamente 32px por item
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      // Decidir se abre para baixo ou para cima
      let top, maxHeight;
      if(spaceBelow >= Math.min(dropdownHeight, 200) || spaceBelow >= spaceAbove){
        // Abrir para baixo
        top = rect.bottom + 2;
        maxHeight = Math.min(spaceBelow - 10, 200);
      } else {
        // Abrir para cima
        maxHeight = Math.min(spaceAbove - 10, 200);
        top = rect.top - maxHeight - 2;
      }
      
      minuteDropdown.style.left = rect.left + 'px';
      minuteDropdown.style.top = top + 'px';
      minuteDropdown.style.width = rect.width + 'px';
      minuteDropdown.style.maxHeight = maxHeight + 'px';
      minuteDropdown.style.overflowY = dropdownHeight > maxHeight ? 'auto' : 'visible';
      
      // Scroll para o item selecionado
      setTimeout(()=>{
        const selected = minuteDropdown.querySelector('.selected');
        if(selected) selected.scrollIntoView({ block: 'center' });
      }, 10);
    });
    
    // Fechar dropdowns ao clicar fora
    const globalClickHandler = (e)=>{
      if(!picker.contains(e.target)){
        closeAllDropdowns();
      }
    };
    document.addEventListener('click', globalClickHandler);
    
    // Limpar listener quando o picker for removido
    picker._cleanup = ()=>{
      closeAllDropdowns();
      document.removeEventListener('click', globalClickHandler);
    };
    
    return picker;
  }
  
  // Helper para obter valor do time picker
  function getTimePickerValue(picker){
    return picker.getAttribute('data-time') || '';
  }
  
  function addLocationRow(schedule){
    const list = document.getElementById('athlete-locations-list');
    const locSchedule = document.createElement('div');
    locSchedule.className = 'loc-schedule';
    
    locSchedule.innerHTML = `
      <div class="loc-header">
        <select class="loc-select" aria-label="Local de treino"></select>
        <button type="button" class="action remove-loc" aria-label="Remover local" title="Remover">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M9 3a1 1 0 00-1 1v1H4v2h16V5h-4V4a1 1 0 00-1-1H9zm-3 7h2v9H6v-9zm5 0h2v9h-2v-9zm5 0h2v9h-2v-9z"/></svg>
        </button>
      </div>
      <div class="days-list"></div>
    `;
    
    list.appendChild(locSchedule);
    refreshLocationOptions();
    
    const locSelect = locSchedule.querySelector('.loc-select');
    if(schedule && schedule.locationId){
      locSelect.value = String(schedule.locationId);
      
      if(schedule.days && Array.isArray(schedule.days)){
        schedule.days.forEach(dayData=>{
          addDayRow(locSchedule, dayData);
        });
      }
    }
    
    // Bind remove button
    locSchedule.querySelector('.remove-loc').addEventListener('click', ()=>{
      locSchedule.remove();
      refreshLocationOptions();
    });
  }
  
  function addDayRow(locSchedule, dayData){
    const daysList = locSchedule.querySelector('.days-list');
    const dayRow = document.createElement('div');
    dayRow.className = 'day-row';
    
    // Get already selected weekdays in this location
    const selectedWeekdays = Array.from(daysList.querySelectorAll('.day-select')).map(s=>s.value);
    const availableWeekdays = WEEKDAYS.filter(w=> !selectedWeekdays.includes(w));
    
    dayRow.innerHTML = `
      <div class="day-header">
        <select class="day-select" aria-label="Dia da semana">
          ${availableWeekdays.map(w=> `<option value="${w}">${w}</option>`).join('')}
        </select>
        <button type="button" class="action remove-day" aria-label="Remover dia" title="Remover">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M9 3a1 1 0 00-1 1v1H4v2h16V5h-4V4a1 1 0 00-1-1H9zm-3 7h2v9H6v-9zm5 0h2v9h-2v-9zm5 0h2v9h-2v-9z"/></svg>
        </button>
      </div>
      <div class="intervals-scroll-container">
        <div class="intervals-list"></div>
      </div>
    `;
    
    daysList.appendChild(dayRow);
    
    const daySelect = dayRow.querySelector('.day-select');
    const intervalsList = dayRow.querySelector('.intervals-list');
    
    // Set weekday if provided
    if(dayData && dayData.weekday && availableWeekdays.includes(dayData.weekday)){
      daySelect.value = dayData.weekday;
    }
    
    // Add intervals
    if(dayData && dayData.intervals && Array.isArray(dayData.intervals)){
      dayData.intervals.forEach(int=> addIntervalGroup(intervalsList, int.start, int.end));
    } else {
      addIntervalGroup(intervalsList, '', '');
    }
    
    // Add interval button at the end
    const addIntBtn = document.createElement('button');
    addIntBtn.type = 'button';
    addIntBtn.className = 'btn-add-interval';
    addIntBtn.setAttribute('aria-label', 'Adicionar intervalo');
    addIntBtn.title = 'Adicionar intervalo';
    addIntBtn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>';
    intervalsList.appendChild(addIntBtn);
    
    // Bind events
    dayRow.querySelector('.remove-day').addEventListener('click', ()=>{
      dayRow.remove();
      updateAddDayButton(locSchedule);
    });
    
    addIntBtn.addEventListener('click', ()=>{
      addIntBtn.remove();
      addIntervalGroup(intervalsList, '', '');
      intervalsList.appendChild(addIntBtn);
      // Scroll to new interval
      setTimeout(()=>{ intervalsList.scrollLeft = intervalsList.scrollWidth; }, 50);
      updateScrollBlur(dayRow);
    });
    
    // Setup scroll blur detection
    setupScrollBlur(dayRow);
    updateAddDayButton(locSchedule);
  }
  
  function addIntervalGroup(intervalsList, startVal, endVal){
    const intGroup = document.createElement('div');
    intGroup.className = 'interval-group';
    
    // Criar time pickers customizados
    const startPicker = createTimePicker(startVal || '00:00');
    startPicker.classList.add('interval-start');
    startPicker.setAttribute('aria-label', 'Início');
    
    const endPicker = createTimePicker(endVal || '00:00');
    endPicker.classList.add('interval-end');
    endPicker.setAttribute('aria-label', 'Fim');
    
    // Criar botão de remover
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'action remove-interval';
    removeBtn.setAttribute('aria-label', 'Remover');
    removeBtn.title = 'Remover';
    removeBtn.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M9 3a1 1 0 00-1 1v1H4v2h16V5h-4V4a1 1 0 00-1-1H9zm-3 7h2v9H6v-9zm5 0h2v9h-2v-9zm5 0h2v9h-2v-9z"/></svg>';
    
    intGroup.appendChild(startPicker);
    intGroup.appendChild(endPicker);
    intGroup.appendChild(removeBtn);
    
    // Insert before add button if it exists, otherwise append
    const addBtn = intervalsList.querySelector('.btn-add-interval');
    if(addBtn) intervalsList.insertBefore(intGroup, addBtn);
    else intervalsList.appendChild(intGroup);
    
    // Validação de colisão ao alterar horários (apenas remove erro visual)
    const clearError = ()=>{
      intGroup.classList.remove('has-error');
    };
    
    startPicker.addEventListener('change', clearError);
    endPicker.addEventListener('change', clearError);
    
    // Função para validar interval (usada ao salvar)
    intGroup._validate = ()=>{
      const start = getTimePickerValue(startPicker);
      const end = getTimePickerValue(endPicker);
      
      if(!start || !end) {
        intGroup.classList.add('has-error');
        return 'Horário de início e fim são obrigatórios';
      }
      
      // Validar que fim é depois do início
      if(start >= end){
        intGroup.classList.add('has-error');
        return 'Horário de fim deve ser posterior ao horário de início';
      }
      
      // Verificar colisão com outros intervalos no mesmo dia
      const dayRow = intervalsList.closest('.day-row');
      const allIntervals = Array.from(dayRow.querySelectorAll('.interval-group'))
        .filter(g=> g !== intGroup)
        .map(g=> ({
          start: getTimePickerValue(g.querySelector('.interval-start')),
          end: getTimePickerValue(g.querySelector('.interval-end')),
          group: g
        }))
        .filter(i=> i.start && i.end);
      
      for(const existing of allIntervals){
        // Verificar sobreposição: novo começa antes do existente terminar E novo termina depois do existente começar
        if(start < existing.end && end > existing.start){
          intGroup.classList.add('has-error');
          return `Colisão com intervalo ${existing.start}–${existing.end}`;
        }
      }
      
      intGroup.classList.remove('has-error');
      return null; // Sem erro
    };
    
    // Bind remove
    removeBtn.addEventListener('click', ()=>{
      // Cleanup event listeners dos pickers
      if(startPicker._cleanup) startPicker._cleanup();
      if(endPicker._cleanup) endPicker._cleanup();
      intGroup.remove();
      const dayRow = intervalsList.closest('.day-row');
      if(dayRow) updateScrollBlur(dayRow);
    });
  }
  
  function setupScrollBlur(dayRow){
    const container = dayRow.querySelector('.intervals-scroll-container');
    const list = dayRow.querySelector('.intervals-list');
    
    const updateBlur = ()=> updateScrollBlur(dayRow);
    list.addEventListener('scroll', updateBlur);
    
    // Initial check
    setTimeout(updateBlur, 100);
  }
  
  function updateScrollBlur(dayRow){
    const container = dayRow.querySelector('.intervals-scroll-container');
    const list = dayRow.querySelector('.intervals-list');
    
    const hasScrollLeft = list.scrollLeft > 5;
    const hasScrollRight = list.scrollLeft < (list.scrollWidth - list.clientWidth - 5);
    
    container.classList.toggle('has-scroll-left', hasScrollLeft);
    container.classList.toggle('has-scroll-right', hasScrollRight);
  }
  
  function updateAddDayButton(locSchedule){
    const daysList = locSchedule.querySelector('.days-list');
    
    // Remove existing button
    const existingBtn = daysList.querySelector('.btn-add-day');
    if(existingBtn) existingBtn.remove();
    
    // Check how many days are selected
    const selectedCount = daysList.querySelectorAll('.day-row').length;
    if(selectedCount >= 7) return; // All days used
    
    const addDayBtn = document.createElement('button');
    addDayBtn.type = 'button';
    addDayBtn.className = 'btn-add-day';
    addDayBtn.textContent = '+ Adicionar dia da semana';
    addDayBtn.addEventListener('click', ()=>{
      addDayRow(locSchedule, null);
    });
    
    daysList.appendChild(addDayBtn);
  }

  function showAthleteDetails(athlete){
    const modal = document.getElementById('modal-athlete-details');
    const content = document.getElementById('athlete-details-content');
    const locations = callbacks.getLocations ? callbacks.getLocations() : [];
    const fights = callbacks.getFights ? callbacks.getFights() : [];
    
    // Calcular estatísticas
    const athleteFights = fights.filter(f=> String(f.athleteId)===String(athlete.id));
    const wins = athleteFights.filter(f=>f.result==='Vitória').length;
    const losses = athleteFights.filter(f=>f.result==='Derrota').length;
    
    // Montar HTML de locais e horários com nova estrutura
    let schedulesHtml = '<p><em>Nenhum horário cadastrado</em></p>';
    if(athlete.trainingSchedule && athlete.trainingSchedule.length > 0){
      schedulesHtml = '<ul style="list-style:none;padding:0;margin:0">';
      athlete.trainingSchedule.forEach(schedule=>{
        const loc = locations.find(l=> String(l.id)===String(schedule.locationId));
        const locName = loc ? loc.name : 'Local desconhecido';
        schedulesHtml += `<li style="margin-bottom:1rem"><strong>${escapeHtml(locName)}</strong><br>`;
        
        if(schedule.days && Array.isArray(schedule.days)){
          schedule.days.forEach(dayData=>{
            const weekday = dayData.weekday || '';
            const intervals = dayData.intervals || [];
            const intervalsStr = intervals.map(int=> `${int.start}–${int.end}`).join(', ');
            schedulesHtml += `<span style="margin-left:1rem;display:block;margin-top:0.25rem">• ${escapeHtml(weekday)}: ${escapeHtml(intervalsStr)}</span>`;
          });
        }
        
        schedulesHtml += '</li>';
      });
      schedulesHtml += '</ul>';
    }
    
    content.innerHTML = `
      <div style="display:grid;gap:1rem">
        <div><strong>Nome:</strong> ${escapeHtml(athlete.name)}</div>
        <div><strong>Categoria:</strong> ${escapeHtml(athlete.category||'')}</div>
        <div><strong>Graduação:</strong> ${escapeHtml(athlete.graduation||'')}</div>
        <div><strong>Estatísticas:</strong> <span class="stat-wins">${wins}</span> vitórias / <span class="stat-losses">${losses}</span> derrotas — <span class="stat-total">${athleteFights.length}</span> lutas</div>
        <div><strong>Locais e Horários de Treino:</strong><br>${schedulesHtml}</div>
      </div>
    `;
    
    modal.classList.remove('is-hidden');
    document.getElementById('athlete-details-ok').focus();
  }

  function refreshLocationOptions(){
    const schedules = Array.from(document.querySelectorAll('#athlete-locations-list .loc-schedule'));
    const all = (callbacks.getLocations? callbacks.getLocations() : []);
    const allPairs = all.map(l=>[String(l.id), l.name]);
    const selectedAll = schedules.map(s=> s.querySelector('.loc-select')?.value).filter(Boolean);
    
    schedules.forEach((schedule, idx)=>{
      const sel = schedule.querySelector('.loc-select');
      const current = sel.value;
      const selectedOthers = new Set(selectedAll.filter((_,i)=> i!==idx));
      const pairs = allPairs.filter(([id])=> !selectedOthers.has(id) || id===current);
      fillSelect(sel, pairs, 'Selecionar local');
      if(current && pairs.some(([v])=>v===current)) sel.value = current;
    });
    
    const addBtn = document.getElementById('btn-add-athlete-location');
    if(addBtn){
      const allIds = new Set(allPairs.map(([id])=>id));
      const selSet = new Set(selectedAll);
      const hasAvailable = Array.from(allIds).some(id=> !selSet.has(id));
      addBtn.disabled = !hasAvailable;
    }
  }

  function init(opts){
    callbacks = { ...callbacks, ...opts };
    bindEvents();
    render();
    // Bind modal de detalhes
    const detailsClose = document.getElementById('athlete-details-close');
    const detailsOk = document.getElementById('athlete-details-ok');
    if(detailsClose) detailsClose.addEventListener('click', ()=>{ document.getElementById('modal-athlete-details').classList.add('is-hidden'); });
    if(detailsOk) detailsOk.addEventListener('click', ()=>{ document.getElementById('modal-athlete-details').classList.add('is-hidden'); });
  }
  function refresh(){ render(); }
  function getCurrentView(){ return currentView.slice(); }
  return { init, refresh, openModal, closeModal, getCurrentView };
})();

window.AthletesUI = AthletesUI;

const FightsUI = (function(){
  let page = 1;
  const pageSize = 8;
  const MAX_ROUNDS = 3;
  let filters = { search:'', athlete:'', category:'', phase:'', date:'' };
  let currentView = [];
  let callbacks = { getAll:()=>[], getAthletes:()=>[], getCoaches:()=>[], getPenalties:()=>[], onCreate:null, onUpdate:null, onDelete:null };

  function qs(id){ return document.getElementById(id); }
  function norm(v){ return String(v||'').toLowerCase(); }
  function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c])); }
  function sanitizeText(s){ return String(s||'').replace(/[\u0000-\u001F\u007F<>]/g,'').trim(); }

  function athleteNameById(id){
    const a = callbacks.getAthletes().find(x=> String(x.id)===String(id));
    return a? a.name : '';
  }
  function coachNameById(id){
    const c = (callbacks.getCoaches? callbacks.getCoaches() : []).find(x=> String(x.id)===String(id));
    return c? c.name : '';
  }

  function applyFilters(rows){
    let r = rows;
    const s = norm(filters.search);
    if(s) r = r.filter(f=> norm(athleteNameById(f.athleteId)).includes(s) || norm(f.phase).includes(s) || norm(f.opponent||'').includes(s));
    if(filters.athlete) r = r.filter(f=> String(f.athleteId)===String(filters.athlete));
    if(filters.category) r = r.filter(f=> f.category===filters.category);
    if(filters.phase) r = r.filter(f=> f.phase===filters.phase);
    if(filters.date) r = r.filter(f=> String(f.date)===String(filters.date));
    return r;
  }

  function paginate(rows){
    const totalPages = Math.max(1, Math.ceil(rows.length/pageSize));
    if(page>totalPages) page = totalPages;
    const start = (page-1)*pageSize;
    return { view: rows.slice(start, start+pageSize), totalPages };
  }

  function setOptions(sel, pairs, placeholder){
    const keep = sel.value;
    sel.innerHTML = '';
    const first = document.createElement('option'); first.value=''; first.textContent=placeholder; sel.appendChild(first);
    for(const [value,label] of pairs){ const o=document.createElement('option'); o.value=value; o.textContent=label; sel.appendChild(o); }
    if(pairs.some(([v])=>String(v)===String(keep))) sel.value = keep;
  }

  function distinct(list, key){
    const set = new Set();
    for(const x of list){ if(x && x[key]) set.add(x[key]); }
    return Array.from(set).sort();
  }

  function render(){
    const all = callbacks.getAll();
    const filtered = applyFilters(all);
    const { view, totalPages } = paginate(filtered);
    const tbody = qs('fights-tbody');
    tbody.innerHTML = view.map(f=>{
      const name = athleteNameById(f.athleteId);
      const coach = coachNameById(f.coachId);
      return `<tr data-fight-id="${f.id}">`+
        `<td data-label="Data">${escapeHtml(f.date||'')}</td>`+
        `<td data-label="Atleta">${escapeHtml(name)}</td>`+
        `<td data-label="Técnico">${escapeHtml(coach)}</td>`+
        `<td data-label="Oponente">${escapeHtml(f.opponent||'')}</td>`+
        `<td data-label="Categoria">${escapeHtml(f.category||'')}</td>`+
        `<td data-label="Fase">${escapeHtml(f.phase||'')}</td>`+
        `<td data-label="Resultado">${escapeHtml(f.result||'')}</td>`+
        `<td class="col-actions" data-label="Ações">`+
          `<button class="action" data-action="edit" data-id="${f.id}" aria-label="Editar" title="Editar"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 000-1.42l-2.34-2.34a1.003 1.003 0 00-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z"/></svg></button>`+
          `<button class="action" data-action="delete" data-id="${f.id}" aria-label="Excluir" title="Excluir"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M9 3a1 1 0 00-1 1v1H4v2h16V5h-4V4a1 1 0 00-1-1H9zm-3 7h2v9H6v-9zm5 0h2v9h-2v-9zm5 0h2v9h-2v-9z"/></svg></button>`+
        `</td>`+
      `</tr>`;
    }).join('');
    currentView = view.slice();
    qs('fights-page').textContent = `${page}/${totalPages}`;
    qs('fights-prev').disabled = page<=1;
    qs('fights-next').disabled = page>=totalPages;

    const cards = qs('fights-cards');
    cards.innerHTML = view.map(f=>{
      const name = athleteNameById(f.athleteId);
      const opp = f.opponent || '';
      return `<div class="fight-card">`+
        `<div class="fight-head">${escapeHtml(f.date||'')} • ${escapeHtml(f.phase||'')}</div>`+
        `<div class="fight-body"><div>${escapeHtml(name)} vs ${escapeHtml(opp)}</div><div>${escapeHtml(f.category||'')}</div></div>`+
        `<div class="fight-result ${f.result==='Vitória'?'win':'loss'}">${escapeHtml(f.result||'')}${f.isWO?' W.O.':''}</div>`+
      `</div>`;
    }).join('');

    const athletes = callbacks.getAthletes();
    setOptions(qs('fight-filter-athlete'), athletes.map(a=>[a.id,a.name]), 'Todos os Atletas');
    setOptions(qs('fight-filter-category'), distinct(all,'category').map(v=>[v,v]), 'Todas as Categorias');

    const selAthModal = qs('fight-athlete');
    setOptions(selAthModal, athletes.map(a=>[a.id,a.name]), 'Selecionar atleta');
    const coaches = callbacks.getCoaches? callbacks.getCoaches(): [];
    const selCoach = qs('fight-coach'); if(selCoach){ setOptions(selCoach, coaches.map(c=>[c.id,c.name]), 'Selecionar técnico'); }
  }

  function toggleView(toCards){
    const grid = qs('fights-cards');
    const table = qs('fights-table-wrap');
    const btnT = qs('fight-view-table');
    const btnC = qs('fight-view-cards');
    if(toCards){
      grid.classList.remove('is-hidden');
      table.classList.add('is-hidden');
      btnC.classList.add('is-active'); btnC.setAttribute('aria-pressed','true');
      btnT.classList.remove('is-active'); btnT.setAttribute('aria-pressed','false');
    } else {
      grid.classList.add('is-hidden');
      table.classList.remove('is-hidden');
      btnT.classList.add('is-active'); btnT.setAttribute('aria-pressed','true');
      btnC.classList.remove('is-active'); btnC.setAttribute('aria-pressed','false');
    }
  }

  function openModal(f){
    const m = document.getElementById('modal-fight');
    m.classList.remove('is-hidden');
    qs('fight-id').value = f && f.id ? f.id : '';
    qs('fight-date').value = f? (f.date||'') : '';
    qs('fight-athlete').value = f? (f.athleteId||'') : '';
    const selCoach = qs('fight-coach'); if(selCoach){ selCoach.value = f? (f.coachId||'') : ''; }
    qs('fight-opponent').value = f? (f.opponent||'') : '';
    qs('fight-category').value = f? (f.category||'') : '';
    qs('fight-phase').value = f? (f.phase||'Classificatória') : 'Classificatória';
    qs('fight-result').value = f? (f.result||'Vitória') : 'Vitória';
    qs('fight-wo').checked = f? (!!f.isWO) : false;
    const list = qs('rounds-list');
    list.innerHTML = '';
    const rounds = (f && Array.isArray(f.rounds)) ? f.rounds : [];
    for(const r of rounds){ const rr = addRoundRow(r.points||0, r.against||0); if(r.faults&&Array.isArray(r.faults)){ const listEl = rr.querySelector('.faults-list'); for(const ft of r.faults){ addFaultRow(listEl, ft); } } }
    if(rounds.length===0) addRoundRow(0,0);
    updateRoundControls();
    qs('fight-date').focus();
  }
  function closeModal(){
    document.getElementById('modal-fight').classList.add('is-hidden');
    const trigger = document.getElementById('btn-new-fight');
    if(trigger) trigger.focus();
  }

  function addRoundRow(points, against){
    const container = qs('rounds-list');
    const count = container.children.length;
    if(count>=MAX_ROUNDS) { updateRoundControls(); return; }
    const row = document.createElement('div');
    row.className = 'round-row';
    row.innerHTML = `
      <span class="round-index">R${count+1}</span>
      <input type="number" class="round-points" min="0" value="${Number(points)||0}" aria-label="Pontos">
      <input type="number" class="round-against" min="0" value="${Number(against)||0}" aria-label="Pontos Adversário">
      <button type="button" class="action round-remove" aria-label="Remover" title="Remover"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M9 3a1 1 0 00-1 1v1H4v2h16V5h-4V4a1 1 0 00-1-1H9zm-3 7h2v9H6v-9zm5 0h2v9h-2v-9zm5 0h2v9h-2v-9z"/></svg></button>
      <div class="round-faults" style="grid-column:1 / -1;">
        <div class="faults-list"></div>
        <button type="button" class="secondary add-fault">+ Adicionar Falta</button>
      </div>
    `;
    row.querySelector('.round-remove').addEventListener('click', ()=>{ row.remove(); updateRoundControls(); reindexRounds(); });
    container.appendChild(row);
    updateRoundControls();
    return row;
  }

  function addFaultRow(listEl, fault){
    const row = document.createElement('div');
    row.className = 'fault-row';
    row.innerHTML = `
      <select class="fault-type" aria-label="Tipo de falta"></select>
      <select class="fault-party" aria-label="Quem cometeu">
        <option value="athlete">Atleta</option>
        <option value="opponent">Oponente</option>
      </select>
      <select class="fault-status" aria-label="Status da falta">
        <option value="accepted">Acatada</option>
        <option value="rejected">Rejeitada</option>
      </select>
      <button type="button" class="action fault-remove" aria-label="Remover" title="Remover"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M9 3a1 1 0 00-1 1v1H4v2h16V5h-4V4a1 1 0 00-1-1H9zm-3 7h2v9H6v-9zm5 0h2v9h-2v-9zm5 0h2v9h-2v-9z"/></svg></button>
    `;
    // Populate penalties
    const penalties = (callbacks.getPenalties? callbacks.getPenalties() : []).map(p=>[p.id,p.name]);
    setOptions(row.querySelector('.fault-type'), penalties, 'Selecionar penalidade');
    if(fault){
      if(fault.typeId) row.querySelector('.fault-type').value = String(fault.typeId);
      if(fault.party) row.querySelector('.fault-party').value = fault.party;
      if(fault.status) row.querySelector('.fault-status').value = fault.status;
    }
    listEl.appendChild(row);
    row.querySelector('.fault-remove').addEventListener('click', ()=> row.remove());
  }

  function reindexRounds(){
    const nodes = Array.from(document.querySelectorAll('#rounds-list .round-row .round-index'));
    nodes.forEach((el, i)=>{ el.textContent = `R${i+1}`; });
  }

  function updateRoundControls(){
    const total = document.querySelectorAll('#rounds-list .round-row').length;
    const btn = qs('btn-add-round');
    if(btn){ btn.disabled = total>=MAX_ROUNDS; }
    reindexRounds();
  }

  function collectForm(){
    const id = qs('fight-id').value.trim();
    const date = sanitizeText(qs('fight-date').value);
    const athleteId = sanitizeText(qs('fight-athlete').value);
    const coachId = sanitizeText((qs('fight-coach')||{value:''}).value);
    const category = sanitizeText(qs('fight-category').value);
    const opponent = sanitizeText(qs('fight-opponent').value);
    const phase = sanitizeText(qs('fight-phase').value);
    const result = sanitizeText(qs('fight-result').value);
    const isWO = qs('fight-wo').checked;
    if(!date || !athleteId || !category || !phase || !result) return null;
    const rounds = Array.from(document.querySelectorAll('#rounds-list .round-row')).map(el=>{
      const faults = Array.from(el.querySelectorAll('.faults-list .fault-row')).map(fr=>({
        typeId: fr.querySelector('.fault-type').value,
        party: fr.querySelector('.fault-party').value,
        status: fr.querySelector('.fault-status').value
      })).filter(x=> x.typeId);
      return {
        points: Math.max(0, Number(el.querySelector('.round-points').value||0)|0),
        against: Math.max(0, Number(el.querySelector('.round-against').value||0)|0),
        faults
      };
    });
    return { id: id||null, date, athleteId, coachId, opponent, category, phase, result, isWO, rounds };
  }

  function bind(){
    qs('fight-search').addEventListener('input', e=>{ filters.search=e.target.value; page=1; render(); });
    qs('fight-filter-athlete').addEventListener('change', e=>{ filters.athlete=e.target.value; page=1; render(); });
    qs('fight-filter-category').addEventListener('change', e=>{ filters.category=e.target.value; page=1; render(); });
    qs('fight-filter-phase').addEventListener('change', e=>{ filters.phase=e.target.value; page=1; render(); });
    qs('fight-filter-date').addEventListener('change', e=>{ filters.date=e.target.value; page=1; render(); });
    qs('fights-prev').addEventListener('click', ()=>{ if(page>1){ page--; render(); }});
    qs('fights-next').addEventListener('click', ()=>{ page++; render(); });
    qs('fight-view-table').addEventListener('click', ()=> toggleView(false));
    qs('fight-view-cards').addEventListener('click', ()=> toggleView(true));
    document.getElementById('btn-new-fight').addEventListener('click', ()=> openModal(null));
    document.getElementById('btn-add-round').addEventListener('click', ()=> addRoundRow(0,0));
    const closeBtn = document.getElementById('fight-close'); if(closeBtn){ closeBtn.addEventListener('click', closeModal); }
    // Faults add/remove via delegation
    document.getElementById('rounds-list').addEventListener('click', e=>{
      const addBtn = e.target.closest('.add-fault');
      if(addBtn){ const listEl = addBtn.previousElementSibling; if(listEl && listEl.classList.contains('faults-list')) addFaultRow(listEl); }
      const remBtn = e.target.closest('.fault-remove');
      if(remBtn){ const fr = remBtn.closest('.fault-row'); if(fr) fr.remove(); }
    });
    document.getElementById('fight-cancel').addEventListener('click', closeModal);
    document.getElementById('fight-form').addEventListener('submit', e=>{
      e.preventDefault();
      const data = collectForm();
      if(!data) return;
      if(data.id){ if(callbacks.onUpdate) callbacks.onUpdate(data); }
      else { if(callbacks.onCreate) callbacks.onCreate(data); }
      closeModal();
    });
    // Auto-preencher categoria a partir do atleta selecionado
    qs('fight-athlete').addEventListener('change', ()=>{
      const id = qs('fight-athlete').value;
      const a = callbacks.getAthletes().find(x=> String(x.id)===String(id));
      if(a) qs('fight-category').value = a.category || '';
    });
    document.getElementById('fights-tbody').addEventListener('click', e=>{
      // Verificar se clicou em um botão de ação
      const btn = e.target.closest('button[data-action]');
      if(btn){
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const action = btn.getAttribute('data-action');
        const all = callbacks.getAll();
        if(action==='edit'){
          const f = all.find(x=> String(x.id)===String(id));
          if(f) openModal(f);
        } else if(action==='delete'){
          showConfirm('Excluir luta?').then(ok=>{ if(ok){ if(callbacks.onDelete) callbacks.onDelete(id); render(); } });
        }
        return;
      }
      
      // Ver visualização ao clicar na linha
      const row = e.target.closest('tr[data-fight-id]');
      if(row){
        const id = row.getAttribute('data-fight-id');
        const fight = callbacks.getAll().find(f=> String(f.id)===String(id));
        if(fight){
          const m = document.getElementById('modal-fight-details');
          const c = document.getElementById('fight-details-content');
          const athlete = callbacks.getAthletes().find(a=> String(a.id)===String(fight.athleteId));
          const coach = (callbacks.getCoaches? callbacks.getCoaches():[]).find(co=> String(co.id)===String(fight.coachId));
          const penalties = (callbacks.getPenalties? callbacks.getPenalties():[]);
          const pMap = new Map(penalties.map(p=> [String(p.id), p.name]));
          const rounds = Array.isArray(fight.rounds)? fight.rounds:[];
          const statusLabel = (s)=> s==='accepted' ? 'Acatada' : (s==='rejected' ? 'Rejeitada' : String(s||''));
          
          const roundsHtml = rounds.map((r,i)=>{
            const faults = Array.isArray(r.faults)? r.faults:[];
            const athleteFaults = faults.filter(f=> f.party==='athlete');
            const opponentFaults = faults.filter(f=> f.party==='opponent');
            const chip = (ft)=>`<span class="chip ${ft && ft.status==='accepted' ? 'chip-accepted' : ft && ft.status==='rejected' ? 'chip-rejected' : 'chip-muted'}">${escapeHtml(pMap.get(String(ft?.typeId))||'Falta')}${ft? ` (${escapeHtml(statusLabel(ft.status))})` : ''}</span>`;
            const chipsAthlete = athleteFaults.length ? athleteFaults.map(chip).join('') : chip(null);
            const chipsOpponent = opponentFaults.length ? opponentFaults.map(chip).join('') : chip(null);
            return `
              <div class="detail-block">
                <div class="round-title">Round ${i+1}</div>
                <div class="round-subtitle">Pontos</div>
                <div class="round-points">Atleta ${escapeHtml(r.points??0)} x ${escapeHtml(r.against??0)} Adversário</div>
                <div class="round-subtitle">Faltas</div>
                <div class="chips-header">
                  <div class="faults-td-athlete">Atleta</div>
                  <div class="faults-td-opponent">Adversário</div>
                </div>
                <div class="chips-row" role="group" aria-label="Faltas">
                  <div class="chips-col chips-col-athlete">${chipsAthlete}</div>
                  <div class="chips-col chips-col-opponent">${chipsOpponent}</div>
                </div>
              </div>
            `;
          }).join('');
          
          c.innerHTML = `
            <div class="detail-row"><strong>Data:</strong> ${escapeHtml(fight.date||'')}</div>
            <div class="detail-row"><strong>Atleta:</strong> ${escapeHtml(athlete?athlete.name:'')}</div>
            <div class="detail-row"><strong>Técnico:</strong> ${escapeHtml(coach?coach.name:'')}</div>
            <div class="detail-row"><strong>Oponente:</strong> ${escapeHtml(fight.opponent||'')}</div>
            <div class="detail-row"><strong>Categoria:</strong> ${escapeHtml(fight.category||'')}</div>
            <div class="detail-row"><strong>Fase:</strong> ${escapeHtml(fight.phase||'')}</div>
            <div class="detail-row"><strong>Resultado:</strong> ${escapeHtml(fight.result||'')}${fight.isWO? ' (W.O.)' : ''}</div>
            ${roundsHtml}
          `;
          m.classList.remove('is-hidden');
          document.getElementById('fight-details-ok').focus();
        }
      }
    });
    // Bind modal de detalhes da luta
    const fightDetailsClose = document.getElementById('fight-details-close');
    const fightDetailsOk = document.getElementById('fight-details-ok');
    if(fightDetailsClose) fightDetailsClose.addEventListener('click', ()=>{ document.getElementById('modal-fight-details').classList.add('is-hidden'); });
    if(fightDetailsOk) fightDetailsOk.addEventListener('click', ()=>{ document.getElementById('modal-fight-details').classList.add('is-hidden'); });
    document.getElementById('btn-export-fights-csv').addEventListener('click', ()=>{
      const rows = currentView.map(f=>({ date:f.date, athlete: athleteNameById(f.athleteId), coach: coachNameById(f.coachId), opponent: f.opponent||'', category:f.category, phase:f.phase, result:f.result }));
      ExportUtils.exportCSV(rows, 'fights.csv');
    });
    document.getElementById('btn-export-fights-json').addEventListener('click', ()=>{
      ExportUtils.exportJSON(currentView, 'fights.json');
    });
  }

  function init(opts){ callbacks = { ...callbacks, ...opts }; bind(); render(); }
  function refresh(){ render(); }
  return { init, refresh, openModal, closeModal };
})();

window.FightsUI = FightsUI;

// Simple list UIs for Locations, Coaches, Penalties
function makeSimpleListUI({ ids, modal, form, labelName, fields, closeBtnId }){
  let page = 1; const pageSize = 8; let search=''; let currentView=[];
  let callbacks = { getAll:()=>[], onCreate:null, onUpdate:null, onDelete:null };
  function qs(id){ return document.getElementById(id); }
  function norm(s){ return String(s||'').toLowerCase(); }
  function open(item){
    document.getElementById(modal).classList.remove('is-hidden');
    qs(ids.id).value = item && item.id ? item.id : '';
    if(fields && Array.isArray(fields)){
      for(const f of fields){ const el = document.getElementById(f.inputId); if(el) el.value = item? (item[f.key]||'') : ''; }
      const first = document.getElementById(fields[0].inputId); if(first) first.focus();
    } else {
      qs(ids.name).value = item ? (item.name||'') : '';
      qs(ids.name).focus();
    }
  }
  function close(){ document.getElementById(modal).classList.add('is-hidden'); }
  function collect(){
    const id = qs(ids.id).value.trim(); const name = qs(ids.name).value.trim();
    if(fields && Array.isArray(fields)){
      const data = { id: id||null };
      for(const f of fields){ const el = document.getElementById(f.inputId); data[f.key] = el ? el.value.trim() : ''; }
      if(!data.name) return null; return data;
    } else {
      if(!name) return null; return { id: id||null, name };
    }
  }
  function render(){
    const all = callbacks.getAll();
    const filtered = search? all.filter(x=> norm(x.name).includes(norm(search))) : all;
    const totalPages = Math.max(1, Math.ceil(filtered.length/pageSize));
    if(page>totalPages) page=totalPages; const start=(page-1)*pageSize;
    const view = filtered.slice(start, start+pageSize); currentView=view.slice();
    const tbody = qs(ids.tbody); tbody.innerHTML = view.map(x=>{
      const cells = (fields && Array.isArray(fields))
        ? fields.map(f=> ({ label: f.label || f.key, value: x[f.key]||'' }))
        : [{ label: 'Nome', value: x.name||'' }];
      return `<tr>`+ cells.map(c=>`<td data-label="${c.label}">${c.value||''}</td>`).join('') + `<td class="col-actions" data-label="Ações">`+
      `<button class="action" data-action="edit" data-id="${x.id}" aria-label="Editar" title="Editar"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 000-1.42l-2.34-2.34a1.003 1.003 0 00-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z"/></svg></button>`+
      `<button class="action" data-action="delete" data-id="${x.id}" aria-label="Excluir" title="Excluir"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M9 3a1 1 0 00-1 1v1H4v2h16V5h-4V4a1 1 0 00-1-1H9zm-3 7h2v9H6v-9zm5 0h2v9h-2v-9zm5 0h2v9h-2v-9z"/></svg></button>`+
      `</td></tr>`;
    }).join('');
    qs(ids.page).textContent = `${page}/${totalPages}`;
    qs(ids.prev).disabled = page<=1; qs(ids.next).disabled = page>=totalPages;
  }
  function bind(){
    if(ids.search){ qs(ids.search).addEventListener('input', e=>{ search=e.target.value; page=1; render(); }); }
    qs(ids.prev).addEventListener('click', ()=>{ if(page>1){ page--; render(); }});
    qs(ids.next).addEventListener('click', ()=>{ page++; render(); });
    qs(ids.newBtn).addEventListener('click', ()=> open(null));
    qs(ids.cancelBtn).addEventListener('click', close);
    if(closeBtnId){ const cb = document.getElementById(closeBtnId); if(cb){ cb.addEventListener('click', close); } }
    document.getElementById(form).addEventListener('submit', e=>{
      e.preventDefault(); const data = collect(); if(!data) return;
      if(data.id){ callbacks.onUpdate && callbacks.onUpdate(data); }
      else { callbacks.onCreate && callbacks.onCreate(data); }
      close();
      render();
    });
    qs(ids.tbody).addEventListener('click', e=>{
      const btn = e.target.closest('button[data-action]'); if(!btn) return;
      const id = btn.getAttribute('data-id'); const action = btn.getAttribute('data-action');
      const all = callbacks.getAll(); if(action==='edit'){ const item = all.find(x=> String(x.id)===String(id)); if(item) open(item); }
      else if(action==='delete'){ showConfirm(`Excluir ${labelName}?`).then(ok=>{ if(ok){ callbacks.onDelete && callbacks.onDelete(id); render(); } }); }
    });
    if(ids.exportCsv){ qs(ids.exportCsv).addEventListener('click', ()=> ExportUtils.exportCSV(currentView, `${labelName.toLowerCase()}s.csv`) ); }
    if(ids.exportJson){ qs(ids.exportJson).addEventListener('click', ()=> ExportUtils.exportJSON(currentView, `${labelName.toLowerCase()}s.json`) ); }
  }
  function init(opts){ callbacks = { ...callbacks, ...opts }; bind(); render(); }
  function refresh(){ render(); }
  return { init, refresh };
}

const LocationsUI = makeSimpleListUI({
  ids: { id:'location-id', name:'location-name', tbody:'locations-tbody', prev:'locations-prev', next:'locations-next', page:'locations-page', newBtn:'btn-new-location', cancelBtn:'location-cancel', search:'location-search', exportCsv:'btn-export-locations-csv', exportJson:'btn-export-locations-json' },
  modal: 'modal-location', form:'location-form', labelName:'Local', closeBtnId:'location-close',
  fields: [ { key:'name', inputId:'location-name', label:'Nome' }, { key:'responsible', inputId:'location-responsible', label:'Responsável' } ]
});
const CoachesUI = makeSimpleListUI({
  ids: { id:'coach-id', name:'coach-name', tbody:'coaches-tbody', prev:'coaches-prev', next:'coaches-next', page:'coaches-page', newBtn:'btn-new-coach', cancelBtn:'coach-cancel', search:'coach-search', exportCsv:'btn-export-coaches-csv', exportJson:'btn-export-coaches-json' },
  modal: 'modal-coach', form:'coach-form', labelName:'Técnico', closeBtnId:'coach-close'
});
const PenaltiesUI = makeSimpleListUI({
  ids: { id:'penalty-id', name:'penalty-name', tbody:'penalties-tbody', prev:'penalties-prev', next:'penalties-next', page:'penalties-page', newBtn:'btn-new-penalty', cancelBtn:'penalty-cancel', search:'penalty-search', exportCsv:'btn-export-penalties-csv', exportJson:'btn-export-penalties-json' },
  modal: 'modal-penalty', form:'penalty-form', labelName:'Penalidade', closeBtnId:'penalty-close'
});

window.LocationsUI = LocationsUI;
window.CoachesUI = CoachesUI;
window.PenaltiesUI = PenaltiesUI;

const AnalysisUI = (function(){
    let callbacks = { getAthletes:()=>[], getFights:()=>[], getCoaches:()=>[] };
    let filters = { athlete:'', category:'', graduation:'', coach:'', from:'', to:'' };
    let charts = { total:null, phase:null, awl:null, aavg:null, atrend:null, afaults:null, cround:null };

    function qs(id){ return document.getElementById(id); }
    
    // Função inteligente para calcular largura de colunas (8-44px) - mesma do Charts
    function calcBarThickness(ctx, labelsCount, datasetsCount, stacked){
      try{
        const canvas = ctx && ctx.canvas;
        if(!canvas) return 24; // fallback
        
        const w = canvas.clientWidth || canvas.offsetWidth || 320;
        const categories = Math.max(1, labelsCount);
        const bars = Math.max(1, stacked ? 1 : datasetsCount);
        
        // Espaço disponível por barra
        const spacePerBar = (w / categories / bars) * 0.7;
        
        // Aplicar limites: 8px (mobile/muitas colunas) a 44px (desktop/poucas colunas)
        const thickness = Math.round(Math.max(8, Math.min(44, spacePerBar)));
        
        return thickness;
      }catch(_){ 
        return 24; // fallback
      }
    }
    function distinct(list, key){ const s=new Set(); for(const x of list){ if(x && x[key]) s.add(x[key]); } return Array.from(s).sort(); }
    function parseDate(s){ return s? new Date(s+'T00:00:00Z').getTime() : NaN; }
    function inRange(dateMs, fromMs, toMs){ if(!isFinite(dateMs)) return true; if(isFinite(fromMs) && dateMs<fromMs) return false; if(isFinite(toMs) && dateMs>toMs) return false; return true; }
    function freshCtx(id){ const old = document.getElementById(id); if(!old) return null; const clone = old.cloneNode(true); old.parentNode.replaceChild(clone, old); return clone.getContext('2d'); }
    function destroyAll(){ for(const k of Object.keys(charts)){ try{ charts[k] && charts[k].destroy(); }catch(_){} charts[k]=null; } }
    function setOptions(sel, pairs, placeholder){ const keep = sel.value; sel.innerHTML=''; const first=document.createElement('option'); first.value=''; first.textContent=placeholder; sel.appendChild(first); for(const [v,l] of pairs){ const o=document.createElement('option'); o.value=String(v); o.textContent=l; sel.appendChild(o);} if(pairs.some(([v])=>String(v)===String(keep))) sel.value=keep; }

    function getFiltered(){
      const athletes = callbacks.getAthletes();
      const fights = callbacks.getFights();
      const byId = new Map(athletes.map(a=>[a.id,a]));
      const fromMs = parseDate(filters.from);
      const toMs = parseDate(filters.to);
      const rows = fights.filter(f=>{
        if(filters.athlete && String(f.athleteId)!==String(filters.athlete)) return false;
        if(filters.coach && String(f.coachId)!==String(filters.coach)) return false;
        const a = byId.get(f.athleteId)||{};
        if(filters.category && a.category!==filters.category) return false;
        if(filters.graduation && a.graduation!==filters.graduation) return false;
        const ms = parseDate(f.date);
        if(!inRange(ms, fromMs, toMs)) return false;
        return true;
      });
      return { athletes, fights: rows };
    }

    function renderGeneral(ctxTotal, ctxPhase, data){
      const wins = data.fights.filter(f=>f.result==='Vitória').length;
      const losses = data.fights.filter(f=>f.result==='Derrota').length;
      if(ctxTotal && window.Chart){ charts.total = new Chart(ctxTotal, { type:'pie', data:{ labels:['Vitórias','Derrotas'], datasets:[{ data:[wins,losses], backgroundColor:['#22c55e','#ef4444'] }] }, options:{ animation:{duration:400}, responsive:true, maintainAspectRatio:false, plugins:{ legend:{ position:'top' } } } }); }
      const phases = ['Classificatória','Quartas','Semifinal','Final'];
      const byA = new Map();
      for(const f of data.fights){ if(!byA.has(f.phase)) byA.set(f.phase, new Map()); const m = byA.get(f.phase); const s = m.get(f.athleteId)||{ total:false, win:false }; s.total=true; if(f.result==='Vitória') s.win=true; m.set(f.athleteId, s); }
      const adv = phases.map(ph=>{ const m=byA.get(ph)||new Map(); const arr=Array.from(m.values()); const tot=arr.filter(x=>x.total).length; const w=arr.filter(x=>x.win).length; return tot? Math.round((w/tot)*100):0; });
      if(ctxPhase && window.Chart){
        const thickness = calcBarThickness(ctxPhase, phases.length, 1, false);
        charts.phase = new Chart(ctxPhase, { type:'bar', data:{ labels:phases, datasets:[{ label:'% Avanço', data:adv, backgroundColor:'#4f46e5', maxBarThickness:44, minBarThickness:8, barThickness:thickness, borderRadius:0 }] }, options:{
          responsive:true, maintainAspectRatio:false,
          scales:{ x:{ grid:{ display:false }, offset:true }, y:{ beginAtZero:true, max:100, ticks:{ callback:(v)=>v+'%' } } },
          animation:{duration:400}, plugins:{ legend:{ position:'top' } }
        } });
      }
    }

    function renderAthlete(ctxWL, ctxAvg, ctxTrend, ctxFaults, data){
      const id = filters.athlete; if(!id) return;
      const fights = data.fights.filter(f=> String(f.athleteId)===String(id)).slice();
      const wins = fights.filter(f=>f.result==='Vitória').length;
      const losses = fights.filter(f=>f.result==='Derrota').length;
      if(ctxWL && window.Chart){ charts.awl = new Chart(ctxWL, { type:'pie', data:{ labels:['Vitórias','Derrotas'], datasets:[{ data:[wins,losses], backgroundColor:['#22c55e','#ef4444'] }] }, options:{ animation:{duration:400}, responsive:true, maintainAspectRatio:false, plugins:{ legend:{ position:'top' } } } }); }
      const rAvg=[0,0,0]; const rCnt=[0,0,0];
      for(const f of fights){ const rs=Array.isArray(f.rounds)?f.rounds:[]; for(let i=0;i<3;i++){ if(rs[i]&&typeof rs[i].points==='number'){ rAvg[i]+=rs[i].points; rCnt[i]++; } } }
      const avg = rAvg.map((s,i)=> rCnt[i]? (s/rCnt[i]):0);
      if(ctxAvg && window.Chart){
        const thickness = calcBarThickness(ctxAvg, 3, 1, false);
        charts.aavg = new Chart(ctxAvg, { type:'bar', data:{ labels:['R1','R2','R3'], datasets:[{ label:'Pontos médios', data:avg, backgroundColor:'#06b6d4', maxBarThickness:44, minBarThickness:8, barThickness:thickness, borderRadius:0 }] }, options:{
          responsive:true, maintainAspectRatio:false,
          scales:{ x:{ grid:{ display:false }, offset:true }, y:{ beginAtZero:true } }, animation:{duration:400}, plugins:{ legend:{ position:'top' } }
        } });
      }
      const sorted = fights.slice().sort((a,b)=> String(a.date).localeCompare(String(b.date)));
      const labels = sorted.map((_,i)=>`L${i+1}`);
      const r1=sorted.map(f=> (f.rounds&&f.rounds[0]&&typeof f.rounds[0].points==='number')? f.rounds[0].points:0);
      const r2=sorted.map(f=> (f.rounds&&f.rounds[1]&&typeof f.rounds[1].points==='number')? f.rounds[1].points:0);
      const r3=sorted.map(f=> (f.rounds&&f.rounds[2]&&typeof f.rounds[2].points==='number')? f.rounds[2].points:0);
      if(ctxTrend && window.Chart){ charts.atrend = new Chart(ctxTrend, { type:'line', data:{ labels, datasets:[ { label:'R1', data:r1, borderColor:'#2563eb', backgroundColor:'rgba(37,99,235,.2)', tension:0.3 }, { label:'R2', data:r2, borderColor:'#10b981', backgroundColor:'rgba(16,185,129,.2)', tension:0.3 }, { label:'R3', data:r3, borderColor:'#f59e0b', backgroundColor:'rgba(245,158,11,.2)', tension:0.3 } ] }, options:{ scales:{ y:{ beginAtZero:true } }, animation:{duration:400}, responsive:true, maintainAspectRatio:false, plugins:{ legend:{ position:'top' } } } }); }
      const faultsPerFight = sorted.map(f=>{ let c=0; const rs=Array.isArray(f.rounds)?f.rounds:[]; for(const r of rs){ const fs=Array.isArray(r.faults)?r.faults:[]; for(const ft of fs){ if(ft.party==='athlete') c++; } } return c; });
      if(ctxFaults && window.Chart){
        const thickness = calcBarThickness(ctxFaults, labels.length, 1, false);
        charts.afaults = new Chart(ctxFaults, { type:'bar', data:{ labels, datasets:[{ label:'Faltas do atleta', data:faultsPerFight, backgroundColor:'#ef4444', maxBarThickness:44, minBarThickness:8, barThickness:thickness, borderRadius:0 }] }, options:{
          scales:{ x:{ grid:{ display:false }, offset:true }, y:{ beginAtZero:true } }, animation:{duration:400}, responsive:true, maintainAspectRatio:false, plugins:{ legend:{ position:'top' } }
        } });
      }
    }

    function renderCoach(ctx, data){
      const id = filters.coach; if(!id) return;
      const fights = data.fights.filter(f=> String(f.coachId)===String(id));
      const byRound = [ {acc:0, rej:0}, {acc:0, rej:0}, {acc:0, rej:0} ];
      for(const f of fights){ const rs=Array.isArray(f.rounds)?f.rounds:[]; for(let i=0;i<3;i++){ const r=rs[i]; if(!r) continue; const fs=Array.isArray(r.faults)?r.faults:[]; for(const ft of fs){ if(ft.party==='opponent'){ if(ft.status==='accepted') byRound[i].acc++; else if(ft.status==='rejected') byRound[i].rej++; } } } }
      const labels=['R1','R2','R3'];
      const acc = byRound.map(x=>x.acc);
      const rej = byRound.map(x=>x.rej);
      if(ctx && window.Chart){
        const thickness = calcBarThickness(ctx, labels.length, 2, true);
        charts.cround = new Chart(ctx, { type:'bar', data:{ labels, datasets:[ { label:'Acatadas', data:acc, backgroundColor:'#22c55e', maxBarThickness:44, minBarThickness:8, barThickness:thickness, borderRadius:0 }, { label:'Rejeitadas', data:rej, backgroundColor:'#ef4444', maxBarThickness:44, minBarThickness:8, barThickness:thickness, borderRadius:0 } ] }, options:{
          scales:{ x:{ stacked:true, grid:{ display:false }, offset:true }, y:{ beginAtZero:true, stacked:true } }, animation:{duration:400}, responsive:true, maintainAspectRatio:false, plugins:{ legend:{ position:'top' } }
        } });
      }
    }

    function render(){
      destroyAll();
      const data = getFiltered();
      const ctxTotal = freshCtx('analysis-winloss-total');
      const ctxPhase = freshCtx('analysis-phase-adv');
      renderGeneral(ctxTotal, ctxPhase, data);
      const hasAth = !!filters.athlete;
      const hasCoach = !!filters.coach;
      const athWrap = qs('analysis-athlete-charts'); if(athWrap){ athWrap.classList.toggle('is-hidden', !hasAth); }
      const coachWrap = qs('analysis-coach-charts'); if(coachWrap){ coachWrap.classList.toggle('is-hidden', !hasCoach); }
      if(hasAth){
        const ctxWL = freshCtx('analysis-athlete-winloss');
        const ctxAvg = freshCtx('analysis-athlete-avg-round');
        const ctxTrend = freshCtx('analysis-athlete-trend-round');
        const ctxFaults = freshCtx('analysis-athlete-faults');
        renderAthlete(ctxWL, ctxAvg, ctxTrend, ctxFaults, data);
      }
      if(hasCoach){
        const ctxCoach = freshCtx('analysis-coach-opponent-faults');
        renderCoach(ctxCoach, data);
      }
    }

    function bind(){
      const selAth = qs('analysis-filter-athlete');
      const selCat = qs('analysis-filter-category');
      const selGrad = qs('analysis-filter-graduation');
      const selCoach = qs('analysis-filter-coach');
      const from = qs('analysis-filter-from');
      const to = qs('analysis-filter-to');
      const clr = qs('analysis-clear');
      selAth.addEventListener('change', e=>{ filters.athlete=e.target.value; render(); });
      selCat.addEventListener('change', e=>{ filters.category=e.target.value; render(); });
      selGrad.addEventListener('change', e=>{ filters.graduation=e.target.value; render(); });
      selCoach.addEventListener('change', e=>{ filters.coach=e.target.value; render(); });
      from.addEventListener('change', e=>{ filters.from=e.target.value; render(); });
      to.addEventListener('change', e=>{ filters.to=e.target.value; render(); });
      clr.addEventListener('click', ()=>{ filters={ athlete:'', category:'', graduation:'', coach:'', from:'', to:'' }; selAth.value=''; selCat.value=''; selGrad.value=''; selCoach.value=''; from.value=''; to.value=''; render(); });
    }

    function populate(){
      const athletes = callbacks.getAthletes();
      const coaches = callbacks.getCoaches? callbacks.getCoaches(): [];
      const selAth = qs('analysis-filter-athlete');
      const selCoach = qs('analysis-filter-coach');
      const selCat = qs('analysis-filter-category');
      const selGrad = qs('analysis-filter-graduation');
      setOptions(selAth, athletes.map(a=>[a.id,a.name]), 'Todos os Atletas');
      setOptions(selCoach, coaches.map(c=>[c.id,c.name]), 'Todos os Técnicos');
      setOptions(selCat, distinct(athletes,'category').map(v=>[v,v]), 'Todas as Categorias');
      setOptions(selGrad, distinct(athletes,'graduation').map(v=>[v,v]), 'Todas as Graduações');
    }

    function init(opts){ callbacks={ ...callbacks, ...opts }; bind(); populate(); render(); }
    function refresh(){ populate(); render(); }
    return { init, refresh };
  })();

  window.AnalysisUI = AnalysisUI;
