(function(){
  const TAB_SELECTOR = '[role="tab"]';
  const PANEL_SELECTOR = '[role="tabpanel"]';

  function qs(s,root=document){return root.querySelector(s)}
  function qsa(s,root=document){return Array.from(root.querySelectorAll(s))}

  function ensureDataSchema(){
    const versionKey = 'dataVersion';
    if(!localStorage.getItem(versionKey)){
      localStorage.setItem('athletes', JSON.stringify([]));
      localStorage.setItem('coaches', JSON.stringify([]));
      localStorage.setItem('trainingLocations', JSON.stringify([]));
      localStorage.setItem('fights', JSON.stringify([]));
      localStorage.setItem('penalties', JSON.stringify([]));
      localStorage.setItem(versionKey, '1');
    }
  }

  async function bootstrapSeedIfEmpty(){
    const versionKey = 'dataVersion';
    if(localStorage.getItem('athletes') && JSON.parse(localStorage.getItem('athletes')).length>0) return;
    try{
      const res = await fetch('./seed.json', { cache: 'no-store' });
      if(res.ok){ const json = await res.json(); if(window.DataIO){ window.DataIO.writeAll(json); } }
    }catch(_){ /* ignore seed errors */ }
  }

  function getData(){
    return {
      athletes: JSON.parse(localStorage.getItem('athletes')||'[]'),
      fights: JSON.parse(localStorage.getItem('fights')||'[]')
    };
  }

  function getAthletes(){
    return JSON.parse(localStorage.getItem('athletes')||'[]');
  }
  function setAthletes(list){
    localStorage.setItem('athletes', JSON.stringify(list));
  }
  // T045: Throttled dashboard refresh to avoid repeated re-renders
  let refreshScheduled = false;
  function scheduleDashboardRefresh(){
    if(refreshScheduled) return;
    refreshScheduled = true;
    requestAnimationFrame(()=>{
      refreshScheduled = false;
      updateKpis();
      initCharts();
      if(window.AnalysisUI) window.AnalysisUI.refresh();
    });
  }
  function makeId(){ return 'a_'+Date.now().toString(36)+Math.random().toString(36).slice(2,6); }
  function createAthlete(data){
    const list = getAthletes();
    const id = makeId();
    list.push({ id, name:data.name, category:data.category, graduation:data.graduation, locations: Array.isArray(data.locations)? data.locations : [], trainingSchedule: Array.isArray(data.trainingSchedule)? data.trainingSchedule : [] });
    setAthletes(list);
    scheduleDashboardRefresh();
    if(window.AthletesUI) window.AthletesUI.refresh();
  }
  function updateAthlete(data){
    const list = getAthletes();
    const idx = list.findIndex(a=> String(a.id)===String(data.id));
    if(idx>=0){ list[idx] = { ...list[idx], name:data.name, category:data.category, graduation:data.graduation, locations: Array.isArray(data.locations)? data.locations : (list[idx].locations||[]), trainingSchedule: Array.isArray(data.trainingSchedule)? data.trainingSchedule : (list[idx].trainingSchedule||[]) }; }
    setAthletes(list);
    scheduleDashboardRefresh();
    if(window.AthletesUI) window.AthletesUI.refresh();
  }
  function deleteAthlete(id){
    const list = getAthletes().filter(a=> String(a.id)!==String(id));
    setAthletes(list);
    scheduleDashboardRefresh();
    if(window.AthletesUI) window.AthletesUI.refresh();
  }

  function getFights(){ return JSON.parse(localStorage.getItem('fights')||'[]'); }
  function setFights(list){ localStorage.setItem('fights', JSON.stringify(list)); }
  function makeFightId(){ return 'f_'+Date.now().toString(36)+Math.random().toString(36).slice(2,6); }
  function createFight(data){
    const list = getFights();
    const id = makeFightId();
    list.push({ id, date:data.date, athleteId:data.athleteId, coachId:data.coachId||'', opponent:data.opponent||'', category:data.category, phase:data.phase, result:data.result, isWO: !!data.isWO, rounds:data.rounds||[] });
    setFights(list); scheduleDashboardRefresh(); if(window.FightsUI) window.FightsUI.refresh();
  }
  function updateFight(data){
    const list = getFights();
    const idx = list.findIndex(f=> String(f.id)===String(data.id));
    if(idx>=0){ list[idx] = { ...list[idx], date:data.date, athleteId:data.athleteId, coachId:data.coachId||list[idx].coachId||'', opponent:data.opponent||'', category:data.category, phase:data.phase, result:data.result, isWO: !!data.isWO, rounds:data.rounds||[] }; }
    setFights(list); scheduleDashboardRefresh(); if(window.FightsUI) window.FightsUI.refresh();
  }
  function deleteFight(id){
    const list = getFights().filter(f=> String(f.id)!==String(id));
    setFights(list); scheduleDashboardRefresh(); if(window.FightsUI) window.FightsUI.refresh();
  }

  // Locations CRUD
  function getLocations(){ return JSON.parse(localStorage.getItem('trainingLocations')||'[]'); }
  function setLocations(list){ localStorage.setItem('trainingLocations', JSON.stringify(list)); if(window.AthletesUI) window.AthletesUI.refresh(); window.dispatchEvent(new Event('locations:updated')); }
  function makeLocationId(){ return 'l_'+Date.now().toString(36)+Math.random().toString(36).slice(2,6); }
  function createLocation(data){ const list=getLocations(); const id=makeLocationId(); list.push({id, name:data.name, responsible: data.responsible||''}); setLocations(list); }
  function updateLocation(data){ const list=getLocations(); const idx=list.findIndex(x=> String(x.id)===String(data.id)); if(idx>=0){ list[idx]={...list[idx], name:data.name, responsible: data.responsible||list[idx].responsible||''}; } setLocations(list); }
  function deleteLocation(id){ const list=getLocations().filter(x=> String(x.id)!==String(id)); setLocations(list); }

  // Coaches CRUD
  function getCoaches(){ return JSON.parse(localStorage.getItem('coaches')||'[]'); }
  function setCoaches(list){ localStorage.setItem('coaches', JSON.stringify(list)); if(window.FightsUI) window.FightsUI.refresh(); if(window.AnalysisUI) window.AnalysisUI.refresh(); }
  function makeCoachId(){ return 'c_'+Date.now().toString(36)+Math.random().toString(36).slice(2,6); }
  function createCoach(data){ const list=getCoaches(); const id=makeCoachId(); list.push({id, name:data.name}); setCoaches(list); }
  function updateCoach(data){ const list=getCoaches(); const idx=list.findIndex(x=> String(x.id)===String(data.id)); if(idx>=0){ list[idx]={...list[idx], name:data.name}; } setCoaches(list); }
  function deleteCoach(id){ const list=getCoaches().filter(x=> String(x.id)!==String(id)); setCoaches(list); }

  // Penalties CRUD
  function getPenalties(){ return JSON.parse(localStorage.getItem('penalties')||'[]'); }
  function setPenalties(list){ localStorage.setItem('penalties', JSON.stringify(list)); }
  function makePenaltyId(){ return 'p_'+Date.now().toString(36)+Math.random().toString(36).slice(2,6); }
  function createPenalty(data){ const list=getPenalties(); const id=makePenaltyId(); list.push({id, name:data.name}); setPenalties(list); }
  function updatePenalty(data){ const list=getPenalties(); const idx=list.findIndex(x=> String(x.id)===String(data.id)); if(idx>=0){ list[idx]={...list[idx], name:data.name}; } setPenalties(list); }
  function deletePenalty(id){ const list=getPenalties().filter(x=> String(x.id)!==String(id)); setPenalties(list); }

  function setActiveTab(tab){
    const tabs = qsa(TAB_SELECTOR);
    const panels = qsa(PANEL_SELECTOR);
    tabs.forEach(t=>{
      const selected = (t===tab);
      t.setAttribute('aria-selected', selected? 'true':'false');
      t.classList.toggle('is-active', selected);
    });
    const targetId = tab.getAttribute('data-target');
    panels.forEach(p=>{
      const vis = (p.id===targetId);
      p.classList.toggle('is-hidden', !vis);
    });
  }

  function handleTabClick(e){
    const tab = e.currentTarget;
    setActiveTab(tab);
  }

  function focusTab(tabs, index){
    if(index<0) index = tabs.length-1;
    if(index>=tabs.length) index = 0;
    tabs[index].focus();
    setActiveTab(tabs[index]);
  }

  function onTabKeyDown(e){
    const tabs = qsa(TAB_SELECTOR);
    const currentIndex = tabs.indexOf(document.activeElement);
    switch(e.key){
      case 'ArrowRight': e.preventDefault(); focusTab(tabs, currentIndex+1); break;
      case 'ArrowLeft': e.preventDefault(); focusTab(tabs, currentIndex-1); break;
      case 'Home': e.preventDefault(); focusTab(tabs, 0); break;
      case 'End': e.preventDefault(); focusTab(tabs, tabs.length-1); break;
    }
  }

  function updateKpis(){
    const { athletes, fights } = getData();
    const totalAthletes = athletes.length;
    const wins = fights.filter(f=>f.result==='Vitória').length;
    const losses = fights.filter(f=>f.result==='Derrota').length;
    const pending = fights.filter(f=>!f.result).length;
    const byId = id => document.getElementById(id);
    byId('kpi-total-athletes').textContent = totalAthletes;
    byId('kpi-wins').textContent = wins;
    byId('kpi-losses').textContent = losses;
    byId('kpi-pending').textContent = pending;
  }

  function refreshAllUIs(){
    if(window.AthletesUI) window.AthletesUI.refresh();
    if(window.FightsUI) window.FightsUI.refresh();
    if(window.LocationsUI) window.LocationsUI.refresh();
    if(window.CoachesUI) window.CoachesUI.refresh();
    if(window.PenaltiesUI) window.PenaltiesUI.refresh();
    if(window.AnalysisUI) window.AnalysisUI.refresh();
  }

  function computeCategoryWinLoss(athletes, fights){
    const byId = new Map(athletes.map(a=>[a.id, a]));
    const acc = new Map(); // category -> {wins, losses}
    for(const f of fights){
      if(!f || !f.athleteId) continue;
      const a = byId.get(f.athleteId);
      const cat = (a && a.category) ? a.category : 'Unknown';
      if(!acc.has(cat)) acc.set(cat, {wins:0, losses:0});
      if(f.result==='Vitória') acc.get(cat).wins++;
      else if(f.result==='Derrota') acc.get(cat).losses++;
    }
    const labels = Array.from(acc.keys());
    const wins = labels.map(l=>acc.get(l).wins);
    const losses = labels.map(l=>acc.get(l).losses);
    return { labels, wins, losses };
  }

  function computeWinLossTotals(fights){
    let wins = 0, losses = 0;
    for(const f of fights){
      if(f.result==='Vitória') wins++;
      else if(f.result==='Derrota') losses++;
    }
    return { wins, losses };
  }

  function computePhaseWinLoss(fights){
    const phases = ['Classificatória', 'Quartas', 'Semifinal', 'Final'];
    const acc = {};
    phases.forEach(p=> acc[p] = {wins:0, losses:0});
    
    for(const f of fights){
      const phase = f.phase || 'Classificatória';
      if(!acc[phase]) acc[phase] = {wins:0, losses:0};
      if(f.result==='Vitória') acc[phase].wins++;
      else if(f.result==='Derrota') acc[phase].losses++;
    }
    
    const labels = phases;
    const wins = phases.map(p=> acc[p].wins);
    const losses = phases.map(p=> acc[p].losses);
    return { labels, wins, losses };
  }

  let chartCategory, chartPhase;
  function destroyCharts(){
    try{ if(chartCategory){ chartCategory.destroy(); } }catch(_){}
    try{ if(chartPhase){ chartPhase.destroy(); } }catch(_){}
    chartCategory = null; chartPhase = null;
    // Clear canvases to avoid residual state
    const catCanvas = document.getElementById('chart-category');
    const phaseCanvas = document.getElementById('chart-phase');
    if(catCanvas){ const ctx = catCanvas.getContext('2d'); if(ctx){ ctx.clearRect(0,0,catCanvas.width,catCanvas.height); } }
    if(phaseCanvas){ const ctx = phaseCanvas.getContext('2d'); if(ctx){ ctx.clearRect(0,0,phaseCanvas.width,phaseCanvas.height); } }
  }
  function initCharts(){
    destroyCharts();
    if(!window.Chart) return;
    const { athletes, fights } = getData();
    // Replace canvases to avoid Chart.js binding conflicts
    function freshCanvas(id){
      const old = document.getElementById(id);
      if(!old) return null;
      try{ const ex = window.Chart.getChart ? window.Chart.getChart(old) : null; if(ex){ ex.destroy(); } }catch(_){ }
      const clone = old.cloneNode(true);
      old.parentNode.replaceChild(clone, old);
      return clone;
    }
    const catCanvas = freshCanvas('chart-category');
    const phaseCanvas = freshCanvas('chart-phase');
    if(catCanvas){
      try{ const existing = window.Chart.getChart ? window.Chart.getChart(catCanvas) : null; if(existing){ existing.destroy(); } }catch(_){}
      const { labels, wins, losses } = computeCategoryWinLoss(athletes, fights);
      const data = {
        labels,
        datasets: [
          { label: 'Vitórias', data: wins, backgroundColor: '#4f46e5' },
          { label: 'Derrotas', data: losses, backgroundColor: '#ef4444' }
        ]
      };
      try{ chartCategory = Charts.renderCategory(catCanvas.getContext('2d'), data); }catch(_){ /* ignore */ }
    }
    if(phaseCanvas){
      try{ const existing2 = window.Chart.getChart ? window.Chart.getChart(phaseCanvas) : null; if(existing2){ existing2.destroy(); } }catch(_){}
      const { labels, wins, losses } = computePhaseWinLoss(fights);
      // Tons de verde para vitórias (um tom por fase) e tons de vermelho para derrotas
      const greenShades = ['#10b981', '#22c55e', '#4ade80', '#86efac']; // Verde escuro ao claro
      const redShades = ['#dc2626', '#ef4444', '#f87171', '#fca5a5']; // Vermelho escuro ao claro
      
      const data = {
        labels,
        datasets: [
          { label: 'Vitória', data: wins, backgroundColor: greenShades, borderWidth: 2, borderColor: '#fff' },
          { label: 'Derrota', data: losses, backgroundColor: redShades, borderWidth: 2, borderColor: '#fff' }
        ]
      };
      try{ chartPhase = Charts.renderPhase(phaseCanvas.getContext('2d'), data); }catch(_){ /* ignore */ }
    }
  }

  function initTabs(){
    const tabs = qsa(TAB_SELECTOR);
    tabs.forEach(t=>{
      t.addEventListener('click', handleTabClick);
      t.addEventListener('keydown', onTabKeyDown);
    });
  }

  function bindDataIOControls(){
    const btnImport = document.getElementById('btn-import-all');
    const btnExport = document.getElementById('btn-export-all');
    const inputFile = document.getElementById('input-import-all');
    if(btnImport && inputFile){ btnImport.addEventListener('click', ()=> inputFile.click()); }
    if(inputFile){ inputFile.addEventListener('change', async (e)=>{
      const file = e.target.files && e.target.files[0]; if(!file) return; 
      try{ if(window.DataIO){ await window.DataIO.importFromFile(file); } }
      catch(err){ console.error('Import JSON failed', err); }
      finally{ inputFile.value=''; }
      scheduleDashboardRefresh();
      refreshAllUIs();
    }); }
    if(btnExport){ btnExport.addEventListener('click', ()=>{ if(window.DataIO){ window.DataIO.exportToFile('dados.json'); } }); }
  }

  async function init(){
    ensureDataSchema();
    await bootstrapSeedIfEmpty();
    initTabs();
    bindDataIOControls();
    updateKpis();
    initCharts();
    if(window.AthletesUI){
      window.AthletesUI.init({
        getAll: getAthletes,
        getLocations: getLocations,
        getFights: getFights,
        onCreate: createAthlete,
        onUpdate: updateAthlete,
        onDelete: deleteAthlete
      });
    }
    if(window.FightsUI){
      window.FightsUI.init({
        getAll: getFights,
        getAthletes: getAthletes,
        getCoaches: getCoaches,
        getPenalties: getPenalties,
        onCreate: createFight,
        onUpdate: updateFight,
        onDelete: deleteFight
      });
    }
    if(window.LocationsUI){
      window.LocationsUI.init({
        getAll: getLocations,
        onCreate: createLocation,
        onUpdate: updateLocation,
        onDelete: deleteLocation
      });
    }
    if(window.CoachesUI){
      window.CoachesUI.init({
        getAll: getCoaches,
        onCreate: createCoach,
        onUpdate: updateCoach,
        onDelete: deleteCoach
      });
    }
    if(window.PenaltiesUI){
      window.PenaltiesUI.init({
        getAll: getPenalties,
        onCreate: createPenalty,
        onUpdate: updatePenalty,
        onDelete: deletePenalty
      });
    }
    if(window.AnalysisUI){
      window.AnalysisUI.init({
        getAthletes: getAthletes,
        getFights: getFights,
        getCoaches: getCoaches
      });
    }
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', ()=>{ init(); });
  } else { init(); }
})();
