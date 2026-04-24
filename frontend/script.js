// ── AUTH GUARD ──
const _user = JSON.parse(localStorage.getItem('tp_user') || 'null');
if (!_user) window.location.href = 'login.html';

// ── POPULATE USER INFO ──
const roleLabels = { admin: 'Tournament Manager', referee: 'Referee', captain: 'Team Captain' };
document.getElementById('user-avatar').textContent = _user.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase();
document.getElementById('user-name').textContent = _user.name;
document.getElementById('user-role').textContent = roleLabels[_user.role] || _user.role;

const teams = [
  { id:1, name:'FC Karachi',    group:'A', color:'#22a050', emoji:'🟢', w:5,d:1,l:0,gf:14,ga:5 },
  { id:2, name:'Lahore Lions',  group:'A', color:'#e8b84b', emoji:'🟡', w:3,d:2,l:1,gf:10,ga:6 },
  { id:3, name:'Islamabad FC',  group:'A', color:'#3b8bd4', emoji:'🔵', w:2,d:1,l:3,gf:7,ga:9 },
  { id:4, name:'Quetta United', group:'A', color:'#e84b4b', emoji:'🔴', w:0,d:2,l:4,gf:4,ga:15 },
  { id:5, name:'Peshawar XI',   group:'B', color:'#a78bfa', emoji:'🟣', w:4,d:1,l:1,gf:11,ga:7 },
  { id:6, name:'Multan City',   group:'B', color:'#f97316', emoji:'🟠', w:3,d:2,l:1,gf:9,ga:6 },
  { id:7, name:'Faisalabad FC', group:'B', color:'#22a050', emoji:'🟢', w:2,d:0,l:4,gf:6,ga:12 },
  { id:8, name:'Sialkot Stars', group:'B', color:'#e84b4b', emoji:'🔴', w:1,d:1,l:4,gf:5,ga:10 },
];

const players = [
  { id:1,name:'Ahmed Khan',    jersey:9,  team:1, pos:'FW', goals:9,  assists:3, matches:6 },
  { id:2,name:'Saad Raza',     jersey:10, team:2, pos:'FW', goals:7,  assists:2, matches:6 },
  { id:3,name:'Usman Butt',    jersey:7,  team:3, pos:'MF', goals:5,  assists:4, matches:6 },
  { id:4,name:'Faisal Malik',  jersey:11, team:4, pos:'FW', goals:4,  assists:1, matches:5 },
  { id:5,name:'Hamza Tariq',   jersey:8,  team:5, pos:'MF', goals:6,  assists:5, matches:6 },
  { id:6,name:'Bilal Nawaz',   jersey:5,  team:6, pos:'DF', goals:1,  assists:2, matches:6 },
  { id:7,name:'Shahid Afridi', jersey:1,  team:7, pos:'GK', goals:0,  assists:0, matches:6 },
  { id:8,name:'Rizwan Haider', jersey:6,  team:8, pos:'DF', goals:2,  assists:1, matches:5 },
  { id:9,name:'Omar Sheikh',   jersey:4,  team:1, pos:'DF', goals:1,  assists:3, matches:6 },
  { id:10,name:'Zain Abbas',   jersey:3,  team:2, pos:'MF', goals:3,  assists:4, matches:6 },
];

const venues = [
  { id:1, name:'National Stadium',  city:'Karachi',   capacity:34228, grass:'Natural',  emoji:'🏟️', color:'#1a3a2a' },
  { id:2, name:'Gaddafi Stadium',   city:'Lahore',    capacity:27000, grass:'Natural',  emoji:'⚽', color:'#2a2a1a' },
  { id:3, name:'Rawalpindi Bowl',   city:'Rawalpindi',capacity:15000, grass:'Hybrid',   emoji:'🟢', color:'#1a2a3a' },
  { id:4, name:'Arbab Niaz Stadium',city:'Peshawar',  capacity:15000, grass:'Artificial',emoji:'🏆',color:'#2a1a3a' },
];

const fixtures = [
  { id:1,  home:1, away:4, hg:3, ag:1, venue:1, date:'Mar 15', status:'played' },
  { id:2,  home:2, away:3, hg:2, ag:2, venue:2, date:'Mar 16', status:'played' },
  { id:3,  home:5, away:8, hg:2, ag:0, venue:4, date:'Mar 16', status:'played' },
  { id:4,  home:6, away:7, hg:1, ag:1, venue:3, date:'Mar 17', status:'played' },
  { id:5,  home:1, away:3, hg:2, ag:0, venue:1, date:'Mar 18', status:'played' },
  { id:6,  home:2, away:4, hg:3, ag:1, venue:2, date:'Mar 18', status:'played' },
  { id:7,  home:5, away:7, hg:3, ag:1, venue:4, date:'Mar 19', status:'played' },
  { id:8,  home:6, away:8, hg:2, ag:1, venue:3, date:'Mar 19', status:'played' },
  { id:9,  home:3, away:4, hg:1, ag:2, venue:1, date:'Mar 19', status:'played' },
  { id:10, home:1, away:2, hg:1, ag:1, venue:1, date:'Mar 19', status:'played' },
  { id:11, home:5, away:6, hg:null, ag:null, venue:4, date:'Mar 19', status:'live', min:67 },
  { id:12, home:1, away:2, hg:null, ag:null, venue:1, date:'Mar 20', status:'upcoming' },
  { id:13, home:3, away:4, hg:null, ag:null, venue:3, date:'Mar 22', status:'upcoming' },
  { id:14, home:5, away:8, hg:null, ag:null, venue:4, date:'Mar 24', status:'upcoming' },
  { id:15, home:6, away:7, hg:null, ag:null, venue:2, date:'Mar 24', status:'upcoming' },
];

// ── HELPERS ──
function getTeam(id) { return teams.find(t => t.id === id); }
function getVenue(id) { return venues.find(v => v.id === id); }

function standingsForGroup(group) {
  return teams
    .filter(t => t.group === group)
    .map(t => ({
      ...t,
      gd: t.gf - t.ga,
      pts: t.w*3 + t.d,
      played: t.w + t.d + t.l,
      form: buildForm(t.id)
    }))
    .sort((a,b) => b.pts - a.pts || b.gd - a.gd);
}

function buildForm(teamId) {
  return fixtures
    .filter(f => (f.home === teamId || f.away === teamId) && f.status === 'played')
    .slice(-5)
    .map(f => {
      if (f.home === teamId) return f.hg > f.ag ? 'w' : f.hg < f.ag ? 'l' : 'd';
      return f.ag > f.hg ? 'w' : f.ag < f.hg ? 'l' : 'd';
    });
}

function topScorers(n=5) {
  return [...players].sort((a,b) => b.goals - a.goals).slice(0,n);
}

function recalcTeamStats() {
  // reset
  teams.forEach(t => { t.w=0; t.d=0; t.l=0; t.gf=0; t.ga=0; });
  fixtures.filter(f=>f.status==='played').forEach(f => {
    const h = getTeam(f.home), a = getTeam(f.away);
    h.gf += f.hg; h.ga += f.ag;
    a.gf += f.ag; a.ga += f.hg;
    if(f.hg > f.ag){ h.w++; a.l++; }
    else if(f.hg < f.ag){ a.w++; h.l++; }
    else { h.d++; a.d++; }
  });
}

// ── RENDER HELPERS ──
function standingsTableHTML(group, limit) {
  const rows = standingsForGroup(group);
  const limited = limit ? rows.slice(0, limit) : rows;
  const rankClass = ['gold','silver','bronze',''];
  let html = `<thead><tr>
    <th>#</th><th style="text-align:left">Team</th>
    <th>P</th><th>W</th><th>D</th><th>L</th><th>GD</th><th>Pts</th><th>Form</th>
  </tr></thead><tbody>`;
  limited.forEach((t,i) => {
    const form = t.form.map(r=>`<div class="form-dot ${r}"></div>`).join('');
    html += `<tr>
      <td><span class="rank ${rankClass[i]||''}">${i+1}</span></td>
      <td><div class="team-cell"><div class="team-dot" style="background:${t.color}"></div><span>${t.name}</span></div></td>
      <td>${t.played}</td><td>${t.w}</td><td>${t.d}</td><td>${t.l}</td>
      <td style="color:${t.gd>=0?'var(--green-light)':'var(--red)'}">${t.gd>=0?'+':''}${t.gd}</td>
      <td class="pts">${t.pts}</td>
      <td><div class="form-dots">${form}</div></td>
    </tr>`;
  });
  return html + '</tbody>';
}

function fixtureRowHTML(f) {
  const h = getTeam(f.home), a = getTeam(f.away), v = getVenue(f.venue);
  let scoreHTML, dateHTML, venueHTML;
  if(f.status === 'played') {
    scoreHTML = `<div class="fixture-score">${f.hg} – ${f.ag}</div>`;
    dateHTML = `<div class="fixture-date">${f.date}</div>`;
    venueHTML = `<div class="fixture-venue">${v.name}</div>`;
  } else if(f.status === 'live') {
    scoreHTML = `<div class="fixture-score live">${f.hg??0} – ${f.ag??0}</div>`;
    dateHTML = `<div class="fixture-date" style="color:var(--red)">LIVE</div>`;
    venueHTML = `<div class="fixture-venue"><span class="live-badge">LIVE ${f.min}'</span></div>`;
  } else {
    scoreHTML = `<div class="fixture-score upcoming">vs</div>`;
    dateHTML = `<div class="fixture-date">${f.date}</div>`;
    venueHTML = `<div class="fixture-venue">${v.name}</div>`;
  }
  return `<div class="fixture">
    ${dateHTML}
    <div class="fixture-teams">
      <div class="fixture-team home">${h.name}</div>
      ${scoreHTML}
      <div class="fixture-team">${a.name}</div>
    </div>
    ${venueHTML}
  </div>`;
}

function scorerHTML(p, rank) {
  const t = getTeam(p.team);
  const colors = ['rgba(232,184,75,0.15)','rgba(168,181,200,0.15)','rgba(205,127,50,0.15)'];
  const tcolors = ['var(--gold)','#a8b5c8','#cd7f32'];
  const bg = colors[rank] || 'rgba(255,255,255,0.06)';
  const tc = tcolors[rank] || 'var(--muted)';
  const initials = p.name.split(' ').map(n=>n[0]).join('');
  return `<div class="scorer">
    <div class="scorer-rank">${rank+1}</div>
    <div class="scorer-avatar" style="background:${bg};color:${tc}">${initials}</div>
    <div class="scorer-info">
      <div class="scorer-name">${p.name}</div>
      <div class="scorer-team">${t.name}</div>
    </div>
    <div><div class="scorer-goals">${p.goals}</div><div class="scorer-label">goals</div></div>
  </div>`;
}

// ── NAVIGATE ──
let currentGroup = 'A';

function navigate(page, el) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  if(el) el.classList.add('active');

  const titles = {
    dashboard: 'Dashboard <span>/ Spring Cup 2026</span>',
    fixtures: 'Fixtures <span>/ Spring Cup 2026</span>',
    standings: 'Standings <span>/ Spring Cup 2026</span>',
    bracket: 'Bracket <span>/ Spring Cup 2026</span>',
    teams: 'Teams <span>/ Spring Cup 2026</span>',
    players: 'Players <span>/ Spring Cup 2026</span>',
    venues: 'Venues <span>/ Spring Cup 2026</span>',
  };
  document.getElementById('topbar-title').innerHTML = titles[page] || page;

  if(page === 'dashboard')  renderDashboard();
  if(page === 'fixtures')   renderFixturesPage();
  if(page === 'standings')  renderStandingsPage();
  if(page === 'bracket')    renderBracket();
  if(page === 'teams')      renderTeamsPage();
  if(page === 'players')    renderPlayersPage();
  if(page === 'venues')     renderVenuesPage();
}

// ── DASHBOARD ──
function renderDashboard() {
  recalcTeamStats();
  // stats
  const played = fixtures.filter(f=>f.status==='played').length;
  const totalGoals = fixtures.filter(f=>f.status==='played').reduce((s,f)=>s+f.hg+f.ag,0);
  document.getElementById('stat-teams').textContent = teams.length;
  document.getElementById('stat-played').textContent = played;
  document.getElementById('stat-played-sub').textContent = `of ${fixtures.length} total`;
  document.getElementById('stat-goals').textContent = totalGoals;
  document.getElementById('stat-goals-sub').textContent = played>0 ? `${(totalGoals/played).toFixed(1)} per match avg` : '—';

  document.getElementById('dash-standings').innerHTML = standingsTableHTML('A', 4);
  document.getElementById('dash-scorers').innerHTML = topScorers(4).map((p,i)=>scorerHTML(p,i)).join('');
  const recent = [...fixtures].reverse().slice(0,5);
  document.getElementById('dash-fixtures').innerHTML = recent.map(fixtureRowHTML).join('');
}

// ── FIXTURES PAGE ──
function renderFixturesPage() {
  const q = document.getElementById('fixture-search').value.toLowerCase();
  const filter = document.getElementById('fixture-filter').value;
  let list = [...fixtures].reverse();
  if(filter !== 'all') list = list.filter(f => f.status === filter);
  if(q) list = list.filter(f => {
    const h = getTeam(f.home), a = getTeam(f.away), v = getVenue(f.venue);
    return h.name.toLowerCase().includes(q) || a.name.toLowerCase().includes(q) || v.name.toLowerCase().includes(q);
  });
  document.getElementById('fixtures-list').innerHTML = list.length
    ? list.map(fixtureRowHTML).join('')
    : `<div class="empty"><div class="empty-icon">📭</div><div class="empty-text">No fixtures found</div></div>`;
}

// ── STANDINGS PAGE ──
function renderStandingsPage() {
  recalcTeamStats();
  document.getElementById('full-standings').innerHTML = standingsTableHTML(currentGroup);
  document.getElementById('standings-group-title').textContent = `Group ${currentGroup} Standings`;
}

function selectGroup(g, el) {
  currentGroup = g;
  document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  renderStandingsPage();
}

// ── BRACKET PAGE ──
function renderBracket() {
  const sfA = standingsForGroup('A');
  const sfB = standingsForGroup('B');
  const sf1h = sfA[0], sf1a = sfB[1], sf2h = sfB[0], sf2a = sfA[1];

  function matchEl(t1, t2, s1, s2, tbd) {
    if(tbd) return `<div class="b-match"><div class="b-tbd">TBD</div><div class="b-tbd">TBD</div></div>`;
    const w1 = s1!=null&&s2!=null&&s1>s2;
    const w2 = s1!=null&&s2!=null&&s2>s1;
    const s1t = s1!=null?s1:'—', s2t = s2!=null?s2:'—';
    return `<div class="b-match">
      <div class="b-team ${w1?'winner':''}"><span>${t1.name}</span><span class="b-score">${s1t}</span></div>
      <div class="b-team ${w2?'winner':''}"><span>${t2.name}</span><span class="b-score">${s2t}</span></div>
    </div>`;
  }

  document.getElementById('bracket-view').innerHTML = `
    <div class="bracket-round" style="margin-right:0">
      <div class="b-label">Semi-Final 1</div>
      <div class="b-matches">
        ${matchEl(sf1h,sf1a,null,null,false)}
      </div>
    </div>
    <div style="width:28px;display:flex;align-items:center;"><div style="width:100%;border-top:1px solid var(--border)"></div></div>
    <div class="bracket-round" style="margin:0">
      <div class="b-label">Final</div>
      <div class="b-matches">
        ${matchEl({name:'Winner SF1'},{name:'Winner SF2'},null,null,true)}
      </div>
    </div>
    <div style="width:28px;display:flex;align-items:center;"><div style="width:100%;border-top:1px solid var(--border)"></div></div>
    <div class="bracket-round" style="margin-left:0">
      <div class="b-label">Semi-Final 2</div>
      <div class="b-matches">
        ${matchEl(sf2h,sf2a,null,null,false)}
      </div>
    </div>`;
}

// ── TEAMS PAGE ──
function renderTeamsPage() {
  recalcTeamStats();
  const q = (document.getElementById('team-search')?.value || '').toLowerCase();
  const list = teams.filter(t => !q || t.name.toLowerCase().includes(q));
  document.getElementById('teams-grid').innerHTML = list.map(t => {
    const pts = t.w*3+t.d, gd = t.gf-t.ga;
    return `<div class="team-card">
      <div class="team-card-header">
        <div class="team-logo" style="background:${t.color}22;font-size:22px">${t.emoji}</div>
        <div>
          <div class="team-card-name">${t.name}</div>
          <div class="team-card-group">Group ${t.group}</div>
        </div>
      </div>
      <div class="team-stats-row">
        <div class="team-stat"><div class="team-stat-val" style="color:var(--green-light)">${pts}</div><div class="team-stat-lbl">Pts</div></div>
        <div class="team-divider"></div>
        <div class="team-stat"><div class="team-stat-val">${t.w+t.d+t.l}</div><div class="team-stat-lbl">P</div></div>
        <div class="team-divider"></div>
        <div class="team-stat"><div class="team-stat-val" style="color:var(--green-light)">${t.w}</div><div class="team-stat-lbl">W</div></div>
        <div class="team-divider"></div>
        <div class="team-stat"><div class="team-stat-val" style="color:var(--gold)">${t.d}</div><div class="team-stat-lbl">D</div></div>
        <div class="team-divider"></div>
        <div class="team-stat"><div class="team-stat-val" style="color:var(--red)">${t.l}</div><div class="team-stat-lbl">L</div></div>
        <div class="team-divider"></div>
        <div class="team-stat"><div class="team-stat-val" style="color:${gd>=0?'var(--green-light)':'var(--red)'}">${gd>=0?'+':''}${gd}</div><div class="team-stat-lbl">GD</div></div>
      </div>
    </div>`;
  }).join('') || `<div class="empty" style="grid-column:1/-1"><div class="empty-icon">👥</div><div class="empty-text">No teams found</div></div>`;
  document.getElementById('team-count-badge').textContent = teams.length;
}

// ── PLAYERS PAGE ──
function renderPlayersPage() {
  const q = (document.getElementById('player-search')?.value||'').toLowerCase();
  const tf = document.getElementById('player-team-filter')?.value||'all';
  const pf = document.getElementById('player-pos-filter')?.value||'all';

  // populate team filter
  const sel = document.getElementById('player-team-filter');
  if(sel.options.length <= 1) {
    teams.forEach(t => { const o = document.createElement('option'); o.value=t.id; o.textContent=t.name; sel.appendChild(o); });
  }

  const posColor = { FW:'pos-fw', MF:'pos-mf', DF:'pos-df', GK:'pos-gk' };
  let list = [...players].sort((a,b)=>b.goals-a.goals);
  if(q) list = list.filter(p => p.name.toLowerCase().includes(q) || getTeam(p.team).name.toLowerCase().includes(q));
  if(tf !== 'all') list = list.filter(p => p.team == tf);
  if(pf !== 'all') list = list.filter(p => p.pos === pf);

  document.getElementById('players-tbody').innerHTML = list.map((p,i) => {
    const t = getTeam(p.team);
    const initials = p.name.split(' ').map(n=>n[0]).join('');
    return `<tr>
      <td style="color:var(--muted);font-family:'Barlow Condensed',sans-serif;font-size:15px;font-weight:700">${p.jersey}</td>
      <td><div class="player-cell">
        <div class="player-avatar" style="background:${t.color}22;color:${t.color}">${initials}</div>
        <span style="font-weight:600">${p.name}</span>
      </div></td>
      <td><div style="display:flex;align-items:center;gap:6px"><div class="team-dot" style="background:${t.color}"></div>${t.name}</div></td>
      <td><span class="pos-badge ${posColor[p.pos]}">${p.pos}</span></td>
      <td style="font-family:'Barlow Condensed',sans-serif;font-size:16px;font-weight:800;color:var(--gold)">${p.goals}</td>
      <td style="color:var(--blue)">${p.assists}</td>
      <td style="color:var(--muted)">${p.matches}</td>
    </tr>`;
  }).join('') || `<tr><td colspan="7"><div class="empty"><div class="empty-icon">🏃</div><div class="empty-text">No players found</div></div></td></tr>`;
}

// ── VENUES PAGE ──
function renderVenuesPage() {
  document.getElementById('venues-grid').innerHTML = venues.map(v => `
    <div class="venue-card">
      <div class="venue-banner" style="background:${v.color}55;font-size:40px">${v.emoji}</div>
      <div class="venue-body">
        <div class="venue-name">${v.name}</div>
        <div class="venue-city">📍 ${v.city}</div>
        <div class="venue-info">
          <div class="venue-info-item"><div class="venue-info-label">Capacity</div><div style="font-weight:600">${v.capacity.toLocaleString()}</div></div>
          <div class="venue-info-item"><div class="venue-info-label">Surface</div><div style="font-weight:600">${v.grass}</div></div>
          <div class="venue-info-item">
            <div class="venue-info-label">Upcoming</div>
            <div style="font-weight:600">${fixtures.filter(f=>f.venue===v.id&&f.status==='upcoming').length} matches</div>
          </div>
        </div>
      </div>
    </div>`).join('');
}

// ── MODAL ──
function openModal(id) {
  if(id === 'match-modal') populateMatchModal();
  if(id === 'add-player-modal') populatePlayerModal();
  document.getElementById(id).classList.add('open');
}
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
function closeModalOutside(e, id) { if(e.target.id === id) closeModal(id); }

function populateMatchModal() {
  const sel = document.getElementById('result-fixture-select');
  sel.innerHTML = '';
  const upcoming = fixtures.filter(f => f.status === 'upcoming' || f.status === 'live');
  if(!upcoming.length) {
    sel.innerHTML = '<option>No upcoming fixtures</option>';
  } else {
    upcoming.forEach(f => {
      const h = getTeam(f.home), a = getTeam(f.away);
      const o = document.createElement('option');
      o.value = f.id;
      o.textContent = `${f.date}: ${h.name} vs ${a.name}`;
      sel.appendChild(o);
    });
  }
  // venues
  const vsel = document.getElementById('result-venue-select');
  vsel.innerHTML = venues.map(v=>`<option value="${v.id}">${v.name}</option>`).join('');
  updateResultTeams();
}

function updateResultTeams() {
  const fid = parseInt(document.getElementById('result-fixture-select').value);
  const f = fixtures.find(x=>x.id===fid);
  if(!f) return;
  const h = getTeam(f.home), a = getTeam(f.away);
  document.getElementById('result-home-name').textContent = h.name;
  document.getElementById('result-away-name').textContent = a.name;
  document.getElementById('result-home-score').value = 0;
  document.getElementById('result-away-score').value = 0;
}

function submitResult() {
  const fid = parseInt(document.getElementById('result-fixture-select').value);
  const f = fixtures.find(x=>x.id===fid);
  if(!f) return;
  const hg = parseInt(document.getElementById('result-home-score').value)||0;
  const ag = parseInt(document.getElementById('result-away-score').value)||0;
  const vid = parseInt(document.getElementById('result-venue-select').value);
  f.hg = hg; f.ag = ag; f.status = 'played'; f.venue = vid;
  closeModal('match-modal');
  recalcTeamStats();
  showToast(`✅ Result recorded: ${getTeam(f.home).name} ${hg}–${ag} ${getTeam(f.away).name}`);
  renderDashboard();
}

function populatePlayerModal() {
  const sel = document.getElementById('new-player-team');
  sel.innerHTML = teams.map(t=>`<option value="${t.id}">${t.name}</option>`).join('');
}

function addTeam() {
  const name = document.getElementById('new-team-name').value.trim();
  const group = document.getElementById('new-team-group').value;
  const color = document.getElementById('new-team-color').value;
  if(!name) { showToast('❌ Enter a team name', true); return; }
  const emojis = {'#22a050':'🟢','#e8b84b':'🟡','#3b8bd4':'🔵','#e84b4b':'🔴','#a78bfa':'🟣','#f97316':'🟠'};
  teams.push({ id: teams.length+1, name, group, color, emoji: emojis[color]||'⚽', w:0,d:0,l:0,gf:0,ga:0 });
  document.getElementById('new-team-name').value = '';
  closeModal('add-team-modal');
  showToast(`✅ ${name} added to Group ${group}`);
  renderTeamsPage();
}

function addPlayer() {
  const name = document.getElementById('new-player-name').value.trim();
  const jersey = parseInt(document.getElementById('new-player-jersey').value)||0;
  const team = parseInt(document.getElementById('new-player-team').value);
  const pos = document.getElementById('new-player-pos').value;
  if(!name) { showToast('❌ Enter a player name', true); return; }
  players.push({ id: players.length+1, name, jersey, team, pos, goals:0, assists:0, matches:0 });
  document.getElementById('new-player-name').value = '';
  document.getElementById('new-player-jersey').value = '';
  closeModal('add-player-modal');
  showToast(`✅ ${name} added`);
  renderPlayersPage();
}

// ── TOAST ──
let toastTimer;
function showToast(msg, isError=false) {
  const t = document.getElementById('toast');
  document.getElementById('toast-msg').textContent = msg;
  t.style.background = isError ? 'var(--red)' : 'var(--green)';
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>t.classList.remove('show'), 3000);
}

// ── INIT ──
recalcTeamStats();
renderDashboard();
