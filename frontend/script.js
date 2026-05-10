// ── AUTH GUARD ──
const _user = JSON.parse(localStorage.getItem('tp_user') || 'null');
if (!_user) window.location.href = 'login.html';

// ── POPULATE USER INFO ──
const roleLabels = { admin: 'Tournament Manager', referee: 'Referee', captain: 'Team Captain' };
document.getElementById('user-avatar').textContent = _user.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase();
document.getElementById('user-name').textContent = _user.name;
document.getElementById('user-role').textContent = roleLabels[_user.role] || _user.role;


// ── ROLE-BASED ACCESS ──
function applyRoleAccess() {
  const role = _user.role;

  // Define which nav items each role can see
  const navAccess = {
    admin:   ['dashboard', 'fixtures', 'standings', 'bracket', 'teams', 'players', 'venues'],
    referee: ['fixtures'],
    captain: ['standings', 'teams', 'players'],
  };

  // Hide nav items the role can't access
  document.querySelectorAll('.nav-item[onclick]').forEach(item => {
    const page = item.getAttribute('onclick').match(/'(\w+)'/)?.[1];
    if (page && !navAccess[role].includes(page)) {
      item.style.display = 'none';
    }
  });
    // Hide/show topbar buttons
  const recordBtn = document.querySelector('.btn-gold[onclick*="match-modal"]');
  const exportBtn = document.querySelector('.btn-ghost[onclick*="Export"]');

  if (role === 'referee') {
    // Referee: only sees the Record Result button, no export
    if (exportBtn) exportBtn.style.display = 'none';
  }

  if (role === 'captain') {
    // Captain: no record result, no export
    if (recordBtn) recordBtn.style.display = 'none';
    if (exportBtn) exportBtn.style.display = 'none';
  }

  // Redirect to the correct landing page based on role
  const landingPage = {
    admin:   'dashboard',
    referee: 'fixtures',
    captain: 'standings',
  };

  navigate(landingPage[role], document.querySelector(`[onclick*="${landingPage[role]}"]`));
}

// ── DATA (populated from Flask API) ──
let teams    = [];
let players  = [];
let venues   = [];
let fixtures = [];

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
  // Stats now come from DB via /api/standings/ — this is a no-op kept for compatibility.
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

  const actions = {
    dashboard: `<button class="btn btn-ghost" onclick="showToast('📤 Export coming soon')">📤 Export</button>
                <button class="btn btn-gold" onclick="openModal('match-modal')">+ Record Result</button>`,
    fixtures:  `<button class="btn btn-ghost" onclick="openModal('add-fixture-modal')">+ Schedule Fixture</button>
                <button class="btn btn-gold" onclick="openModal('match-modal')">+ Record Result</button>`,
    teams:     _user.role === 'admin'
                 ? `<button class="btn btn-gold" onclick="openModal('add-team-modal')">+ Add Team</button>`
                 : ``,
    players:   (_user.role === 'admin' || _user.role === 'captain')
                 ? `<button class="btn btn-gold" onclick="openModal('add-player-modal')">+ Add Player</button>`
                 : ``,
    standings: ``,
    bracket:   ``,
    venues:    _user.role === 'admin'
                 ? `<button class="btn btn-gold" onclick="openModal('add-venue-modal')">+ Add Venue</button>`
                 : ``,
  };
  document.getElementById('topbar-actions').innerHTML = actions[page] || '';

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
  document.querySelector('#page-fixtures .btn-gold').style.display =
    (_user.role === 'admin' || _user.role === 'referee') ? '' : 'none';
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
        <div class="team-stat"><div class="team-stat-val" style="color:${gd>=0?'var(--green-light)':'var(--red)'}">
          ${gd>=0?'+':''}${gd}</div><div class="team-stat-lbl">GD</div></div>
      </div>
    </div>`;
  }).join('') || `<div class="empty" style="grid-column:1/-1"><div class="empty-icon">👥</div><div class="empty-text">No teams found</div></div>`;

  document.getElementById('team-count-badge').textContent = teams.length;

  // Hide Add Team button everywhere for non-admins
  document.querySelectorAll('[onclick*="add-team-modal"]').forEach(btn => {
    btn.style.display = _user.role === 'admin' ? '' : 'none';
  });
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
  document.querySelector('[onclick*="add-player-modal"]').style.display =
    _user.role === 'admin' ? '' : 'none';
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
  if (id === 'match-modal')       populateMatchModal();
  if (id === 'add-player-modal')  populatePlayerModal();
  if (id === 'add-fixture-modal') populateFixtureModal();
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

async function submitResult() {
  const fid = parseInt(document.getElementById('result-fixture-select').value);
  const f = fixtures.find(x => x.id === fid);
  if (!f) return;
  const hg = parseInt(document.getElementById('result-home-score').value) || 0;
  const ag = parseInt(document.getElementById('result-away-score').value) || 0;

  try {
    const res = await fetch(`/api/fixtures/${fid}/result`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        home_goals:  hg,
        away_goals:  ag,
        referee_id:  _user.user_id || 1
      })
    });
    if (!res.ok) throw new Error(await res.text());

    closeModal('match-modal');
    showToast(`✅ Result recorded: ${getTeam(f.home).name} ${hg}–${ag} ${getTeam(f.away).name}`);
    await loadAllData();   // refresh everything from DB
  } catch (err) {
    showToast('❌ Failed to save result', true);
    console.error(err);
  }
}

function populatePlayerModal() {
  const sel = document.getElementById('new-player-team');
  sel.innerHTML = teams.map(t=>`<option value="${t.id}">${t.name}</option>`).join('');
  if (_user.role === 'captain') {
        // Lock the Add Player modal's team selector to their own team
        const teamSel = document.getElementById('new-player-team');
        [...teamSel.options].forEach(opt => {
            if (parseInt(opt.value) !== _user.team_id) opt.disabled = true;
        });
        teamSel.value = _user.team_id;
  }
}

async function addTeam() {
  const name  = document.getElementById('new-team-name').value.trim();
  const group = document.getElementById('new-team-group').value;
  const color = document.getElementById('new-team-color').value;
  if (!name) { showToast('❌ Enter a team name', true); return; }

  try {
    const res = await fetch('/api/teams/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, group_name: group, color })
    });
    if (!res.ok) throw new Error(await res.text());

    document.getElementById('new-team-name').value = '';
    closeModal('add-team-modal');
    showToast(`✅ ${name} added to Group ${group}`);
    await loadAllData();
  } catch (err) {
    showToast('❌ Failed to add team', true);
    console.error(err);
  }
}

async function addPlayer() {
  
  const name   = document.getElementById('new-player-name').value.trim();
  const jersey = parseInt(document.getElementById('new-player-jersey').value) || 0;
  const team   = parseInt(document.getElementById('new-player-team').value);
  const pos    = document.getElementById('new-player-pos').value;
  if (!name) { showToast('❌ Enter a player name', true); return; }

  try {
    const res = await fetch('/api/players/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
          name,
          jersey_no: jersey,
          team_id:   team,
          position:  pos,
          caller_role:    _user.role,       
          caller_team_id: _user.team_id
      })    });
    if (!res.ok) throw new Error(await res.text());

    document.getElementById('new-player-name').value = '';
    document.getElementById('new-player-jersey').value = '';
    closeModal('add-player-modal');
    showToast(`✅ ${name} added`);
    await loadAllData();
  } catch (err) {
    showToast('❌ Failed to add player', true);
    console.error(err);
  }
}

// ── ADD VENUE ──
async function addVenue() {
  const name     = document.getElementById('new-venue-name').value.trim();
  const city     = document.getElementById('new-venue-city').value.trim();
  const capacity = parseInt(document.getElementById('new-venue-capacity').value) || 0;
  const surface  = document.getElementById('new-venue-surface').value;
  if (!name || !city) { showToast('❌ Enter venue name and city', true); return; }

  try {
    const res = await fetch('/api/venues/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, city, capacity, surface })
    });
    if (!res.ok) throw new Error(await res.text());
    document.getElementById('new-venue-name').value = '';
    document.getElementById('new-venue-city').value = '';
    document.getElementById('new-venue-capacity').value = '';
    closeModal('add-venue-modal');
    showToast(`✅ ${name} added`);
    await loadAllData();
  } catch (err) {
    showToast('❌ Failed to add venue', true);
    console.error(err);
  }
}

// ── ADD FIXTURE ──
async function addFixture() {
  const home_team_id  = parseInt(document.getElementById('new-fixture-home').value);
  const away_team_id  = parseInt(document.getElementById('new-fixture-away').value);
  const venue_id      = parseInt(document.getElementById('new-fixture-venue').value);
  const match_date    = document.getElementById('new-fixture-date').value;
  const match_time    = document.getElementById('new-fixture-time').value || null;
  const tournament_id = 1;   // single tournament for now

  if (home_team_id === away_team_id) { showToast('❌ Home and away cannot be same team', true); return; }
  if (!match_date) { showToast('❌ Select a match date', true); return; }

  try {
    const res = await fetch('/api/fixtures/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tournament_id, home_team_id, away_team_id, venue_id, match_date, match_time })
    });
    if (!res.ok) throw new Error(await res.text());
    closeModal('add-fixture-modal');
    showToast('✅ Fixture scheduled');
    await loadAllData();
  } catch (err) {
    showToast('❌ Failed to add fixture', true);
    console.error(err);
  }
}

function populateFixtureModal() {
  const homeEl  = document.getElementById('new-fixture-home');
  const awayEl  = document.getElementById('new-fixture-away');
  const venueEl = document.getElementById('new-fixture-venue');
  homeEl.innerHTML  = teams.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
  awayEl.innerHTML  = teams.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
  venueEl.innerHTML = venues.map(v => `<option value="${v.id}">${v.name}</option>`).join('');
  if (teams.length > 1) awayEl.selectedIndex = 1;
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

// ── LOGOUT ──
function logout() {
  localStorage.removeItem('tp_user');
  window.location.href = 'index.html';
}

// ── API HELPERS ──
async function apiFetch(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`API error: ${path} → ${res.status}`);
  return res.json();
}

// ── MAP API RESPONSES TO FRONTEND SHAPE ──
function mapTeam(t) {
  const colorEmojiMap = {
    '#22a050':'🟢','#e8b84b':'🟡','#3b8bd4':'🔵',
    '#e84b4b':'🔴','#a78bfa':'🟣','#f97316':'🟠'
  };
  return {
    id:    t.team_id,
    name:  t.name,
    group: t.group_name,
    color: t.color,
    emoji: colorEmojiMap[t.color] || '⚽',
    w:0, d:0, l:0, gf:0, ga:0   // recalcTeamStats() fills these
  };
}

function mapPlayer(p) {
  return {
    id:      p.player_id,
    name:    p.player_name,      // view returns player_name not name
    jersey:  p.jersey_no,
    team:    p.team_id,          // now present after view fix
    pos:     p.position,
    goals:   p.goals        ?? 0,
    assists: p.assists       ?? 0,
    matches: p.matches_played ?? 0
  };
}

function mapVenue(v) {
  const emojiMap = { Natural:'🏟️', Hybrid:'🟢', Artificial:'🏆' };
  const colorMap = { Karachi:'#1a3a2a', Lahore:'#2a2a1a', Rawalpindi:'#1a2a3a', Peshawar:'#2a1a3a' };
  return {
    id:       v.venue_id,
    name:     v.name,
    city:     v.city,
    capacity: v.capacity,
    grass:    v.surface,
    emoji:    emojiMap[v.surface] || '🏟️',
    color:    colorMap[v.city]    || '#1a2a1a'
  };
}

function mapFixture(m) {
  return {
    id:        m.match_id,
    home:      m.home_team_id,   // now present after view fix
    away:      m.away_team_id,
    home_name: m.home_team,      // keep names too for display fallback
    away_name: m.away_team,
    hg:        m.home_goals  ?? null,
    ag:        m.away_goals  ?? null,
    venue:     m.venue_id,
    venue_name: m.venue_name,
    date:      m.match_date  ? String(m.match_date).slice(5).replace('-', ' ') : '—',
    status:    m.status,
    min:       null
  };
}

// ── INIT ──
async function loadAllData() {
  try {
    const [rawTeams, rawPlayers, rawVenues, rawFixtures, rawStandings] = await Promise.all([
      apiFetch('/api/teams/'),
      apiFetch('/api/players/'),
      apiFetch('/api/venues/'),
      apiFetch('/api/fixtures/'),
      apiFetch('/api/standings/')
    ]);

    teams    = rawTeams.map(mapTeam);
    players  = rawPlayers.map(mapPlayer);
    venues   = rawVenues.map(mapVenue);
    fixtures = rawFixtures.map(mapFixture);

    // Merge standings (W/D/L/GF/GA) into teams array from DB instead of recalculating locally
    rawStandings.forEach(s => {
      const t = teams.find(t => t.id === s.team_id);
      if (t) {
        t.w  = s.won;
        t.d  = s.drawn;
        t.l  = s.lost;
        t.gf = s.goals_for;
        t.ga = s.goals_against;
      }
    });

  } catch (err) {
    console.error('Failed to load data:', err);
    showToast('❌ Could not connect to server', true);
  }
}

// Called once on first load only — navigates to landing page
async function initApp() {
  await loadAllData();
  applyRoleAccess();
}

initApp();