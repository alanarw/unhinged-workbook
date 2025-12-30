const stateKey = "girlypop-prs-2026-state-v2";

const defaults = {
  meta: { version: 2 },
  profile: { title: "PRs & Personal Growth", subtitle: "A Slightly Unhinged 2026 Workbook", name: "", gym: "", focus: "CrossFit Girly Pop", yearWord: "", why: "" },
  theme: {
    bg:"#0f0a16", paper:"#171024", card:"#201533", text:"#fff7ff",
    muted:"rgba(255,247,255,.72)",
    pink:"#ff4fd8", peach:"#ffb86c", mint:"#2ee59d", lilac:"#9b7cff",
    accent:"#ff4fd8", accent2:"#2ee59d",
    radius:18
  },
  goals: { fitness:{a:"",b:"",c:""}, life:{a:"",b:"",c:""}, antiGoals:"" },
  habits: {
    habits: [
      {name:"Mobility (your hips texted me)", target:5},
      {name:"Protein like a grown-up", target:6},
      {name:"Zone 2 (hot girl walk, but spicy)", target:3},
      {name:"Sleep before midnight (a fantasy)", target:4},
      {name:"Hydrate / electrolytes", target:5}
    ],
    weeks: {}
  },
  prlog: [],
  reflections: {},
  calendar: {
    tz: "America/New_York",
    events: []
  }
};

function structuredClonePoly(obj){ return JSON.parse(JSON.stringify(obj)); }

function mergeDeep(target, source){
  for (const k in source){
    if(source[k] && typeof source[k] === "object" && !Array.isArray(source[k])){
      if(!target[k]) target[k] = {};
      mergeDeep(target[k], source[k]);
    } else {
      target[k] = source[k];
    }
  }
  return target;
}

function loadState(){
  try{
    const raw = localStorage.getItem(stateKey);
    if(!raw) return structuredClonePoly(defaults);
    const parsed = JSON.parse(raw);
    return mergeDeep(structuredClonePoly(defaults), parsed);
  }catch(e){
    console.warn("load fail", e);
    return structuredClonePoly(defaults);
  }
}
function saveState(s){ localStorage.setItem(stateKey, JSON.stringify(s)); }

function $(sel){ return document.querySelector(sel); }
function $all(sel){ return Array.from(document.querySelectorAll(sel)); }
function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

function escapeHtml(str){
  return (str||"").replace(/[&<>"']/g, m=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m]));
}

function nowISO(){ return new Date().toISOString().slice(0,10); }

function download(filename, text, mime="text/plain;charset=utf-8"){
  const blob = new Blob([text], {type:mime});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function setCSSVar(name,val){ document.documentElement.style.setProperty(name,val); }

function applyTheme(t){
  setCSSVar("--bg", t.bg);
  setCSSVar("--paper", t.paper);
  setCSSVar("--card", t.card);
  setCSSVar("--text", t.text);
  setCSSVar("--muted", t.muted);
  setCSSVar("--pink", t.pink);
  setCSSVar("--peach", t.peach);
  setCSSVar("--mint", t.mint);
  setCSSVar("--lilac", t.lilac);
  setCSSVar("--accent", t.accent);
  setCSSVar("--accent2", t.accent2);
  setCSSVar("--radius", (t.radius||18)+"px");
}

function weekIdFromDate(date){
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1)/7);
  const y = d.getUTCFullYear();
  return `${y}-W${String(weekNo).padStart(2,"0")}`;
}
function isoWeekToDate(year, week){
  const simple = new Date(Date.UTC(year,0,1 + (week-1)*7));
  const dow = simple.getUTCDay();
  const ISOweekStart = simple;
  if (dow <= 4) ISOweekStart.setUTCDate(simple.getUTCDate() - simple.getUTCDay() + 1);
  else ISOweekStart.setUTCDate(simple.getUTCDate() + 8 - simple.getUTCDay());
  return new Date(ISOweekStart.getUTCFullYear(), ISOweekStart.getUTCMonth(), ISOweekStart.getUTCDate());
}

function setActiveNav(id){
  $all(".nav button").forEach(b=>b.classList.toggle("active", b.dataset.section===id));
}

/* -------------------- RENDERERS -------------------- */

function renderHome(app, s){
  app.innerHTML = `
    <div class="pad">
      <div class="row" style="align-items:center;justify-content:space-between">
        <div>
          <h2 class="section-title">${escapeHtml(s.profile.title)} <span style="opacity:.85">✨</span></h2>
          <div class="muted small">${escapeHtml(s.profile.subtitle)} — saves automatically in your browser.</div>
        </div>
        <div class="row no-print">
          <button class="btn" id="btnPrint">Print</button>
          <button class="btn" id="btnExport">Export</button>
          <button class="btn danger" id="btnReset">Reset</button>
        </div>
      </div>

      <div class="hr"></div>

      <div class="two">
        <div>
          <div class="label2">Workbook title</div>
          <input id="wbTitle" value="${escapeHtml(s.profile.title)}" />
        </div>
        <div>
          <div class="label2">Subtitle</div>
          <input id="wbSub" value="${escapeHtml(s.profile.subtitle)}" />
        </div>
      </div>

      <div class="two">
        <div>
          <div class="label2">Name</div>
          <input id="name" placeholder="e.g., Alana / Princess of PRs" value="${escapeHtml(s.profile.name)}"/>
        </div>
        <div>
          <div class="label2">Gym / Crew</div>
          <input id="gym" placeholder="e.g., The Glitter Box" value="${escapeHtml(s.profile.gym)}"/>
        </div>
      </div>

      <div class="two">
        <div>
          <div class="label2">2026 focus vibe</div>
          <select id="focus">
            ${["CrossFit Girly Pop","Hyrox Era","Strength Baddie","Endurance Bimbo (affectionate)","Wellness but spicy"].map(v=>`<option ${s.profile.focus===v?"selected":""}>${v}</option>`).join("")}
          </select>
        </div>
        <div>
          <div class="label2">One word for the year</div>
          <input id="yearWord" placeholder="e.g., Consistency / Softness / PRs" value="${escapeHtml(s.profile.yearWord)}"/>
        </div>
      </div>

      <div class="label2">Why this year matters</div>
      <textarea id="why" placeholder="Write it like you’re convincing Future You to do mobility.">${escapeHtml(s.profile.why)}</textarea>

      <div class="hr"></div>

      <div class="row">
        <div class="kpi">
          <div class="label">Current streak</div>
          <div class="value" id="streak">—</div>
        </div>
        <div class="kpi">
          <div class="label">PR entries logged</div>
          <div class="value">${(s.prlog||[]).length}</div>
        </div>
        <div class="kpi">
          <div class="label">Calendar events</div>
          <div class="value">${(s.calendar?.events||[]).length}</div>
        </div>
      </div>

      <p class="p print-note"><strong>Print tip:</strong> In your print dialog, choose “Save as PDF”.</p>
    </div>
  `;

  $("#btnPrint").onclick = () => window.print();
  $("#btnExport").onclick = () => download(`girlypop-2026-export-${nowISO()}.json`, JSON.stringify(s,null,2), "application/json;charset=utf-8");
  $("#btnReset").onclick = () => {
    if(confirm("Reset everything? Your glittery progress will be erased. 😅")){
      localStorage.removeItem(stateKey);
      location.reload();
    }
  };

  const updateProfile = () => {
    s.profile.title = $("#wbTitle").value;
    s.profile.subtitle = $("#wbSub").value;
    s.profile.name = $("#name").value;
    s.profile.gym = $("#gym").value;
    s.profile.focus = $("#focus").value;
    s.profile.yearWord = $("#yearWord").value;
    s.profile.why = $("#why").value;
    saveState(s);
    computeStreak(s);
    const titleEl = document.getElementById("hdrTitle");
    const subEl = document.getElementById("hdrSub");
    if(titleEl) titleEl.textContent = s.profile.title;
    if(subEl) subEl.textContent = s.profile.subtitle;
  };

  ["wbTitle","wbSub","name","gym","focus","yearWord","why"].forEach(id=>{
    $("#"+id).addEventListener("input", updateProfile);
    $("#"+id).addEventListener("change", updateProfile);
  });

  computeStreak(s);
}

function computeStreak(s){
  const today = new Date();
  const activeDays = new Set();

  (s.prlog||[]).forEach(p=>{ if(p.date) activeDays.add(p.date); });
  Object.keys(s.reflections||{}).forEach(k=>{ if(/^\d{4}-\d{2}-\d{2}$/.test(k)) activeDays.add(k); });

  const weeks = s.habits.weeks || {};
  for(const wid in weeks){
    const grid = weeks[wid];
    const [y, w] = wid.split("-W");
    const monday = isoWeekToDate(parseInt(y,10), parseInt(w,10));
    for(let d=0; d<7; d++){
      const dayDate = new Date(monday);
      dayDate.setDate(monday.getDate()+d);
      const iso = dayDate.toISOString().slice(0,10);
      const any = (grid[d]||[]).some(Boolean);
      if(any) activeDays.add(iso);
    }
  }

  (s.calendar?.events||[]).forEach(ev=>{ if(ev.date) activeDays.add(ev.date); });

  let streak=0;
  for(let i=0;i<365;i++){
    const d = new Date(today);
    d.setDate(today.getDate()-i);
    const iso = d.toISOString().slice(0,10);
    if(activeDays.has(iso)) streak++;
    else break;
  }
  const el = $("#streak");
  if(el) el.textContent = streak ? `${streak} day${streak===1?"":"s"} (hot)` : "0 (starting today counts)";
}

function renderTheme(app, s, config){
  const locked = config?.locked;
  app.innerHTML = `
    <div class="pad">
      <div class="row" style="align-items:center;justify-content:space-between">
        <div>
          <h2 class="section-title">Theme studio 🎀</h2>
          <div class="muted small">Customize colors + vibe. ${locked ? "Preview shows settings but doesn’t save." : "Saves instantly."}</div>
        </div>
        <div class="row no-print">
          <button class="btn" id="applyPreset">Random retro preset</button>
          <button class="btn danger" id="resetTheme">Reset theme</button>
        </div>
      </div>

      <div class="hr"></div>

      <div class="two">
        ${colorPicker("Accent (pink energy)", "accent", s.theme.accent, locked)}
        ${colorPicker("Accent 2 (mint pop)", "accent2", s.theme.accent2, locked)}
      </div>

      <div class="two">
        ${colorPicker("Background", "bg", s.theme.bg, locked)}
        ${colorPicker("Card", "card", s.theme.card, locked)}
      </div>

      <div class="two">
        ${colorPicker("Text", "text", s.theme.text, locked)}
        ${textInput("Corner roundness", "radius", s.theme.radius, locked, "number")}
      </div>

      <div class="hr"></div>
      <div class="card"><div class="pad">
        <strong>Preview</strong>
        <p class="p">If your vibes are “Barbie meets 80s aerobics VHS,” you’re doing it right.</p>
        <div class="row">
          <span class="chip">✨ sparkly focus</span>
          <span class="chip">🏋️ PR receipts</span>
          <span class="chip">🧠 emotional deload</span>
        </div>
      </div></div>
    </div>
  `;

  function bind(){
    app.querySelectorAll("[data-theme]").forEach(inp=>{
      inp.addEventListener("input", ()=>{
        const key = inp.dataset.theme;
        const val = (inp.type==="number") ? parseInt(inp.value||"18",10) : inp.value;
        s.theme[key] = val;
        applyTheme(s.theme);
        if(!locked) saveState(s);
      });
    });
  }
  bind();

  $("#resetTheme").onclick = ()=>{
    applyTheme(defaults.theme);
    if(!locked){
      s.theme = structuredClonePoly(defaults.theme);
      saveState(s);
      renderTheme(app,s,config);
    }
  };

  $("#applyPreset").onclick = ()=>{
    const presets = [
      {accent:"#ff4fd8", accent2:"#2ee59d", bg:"#0f0a16", card:"#201533", text:"#fff7ff", radius:18},
      {accent:"#ffb86c", accent2:"#9b7cff", bg:"#0e0a1a", card:"#201233", text:"#fff7ff", radius:20},
      {accent:"#2ee59d", accent2:"#ff4fd8", bg:"#0a1014", card:"#10202a", text:"#ecfeff", radius:16},
      {accent:"#9b7cff", accent2:"#ffb86c", bg:"#120b1b", card:"#251335", text:"#fff7ff", radius:22}
    ];
    const p = pick(presets);
    s.theme = mergeDeep(s.theme, p);
    applyTheme(s.theme);
    if(!locked) saveState(s);
    renderTheme(app,s,config);
  };
}

function colorPicker(label, key, val, locked){
  return `
    <div>
      <div class="label2">${label}</div>
      <input data-theme="${key}" type="color" value="${toHex(val)}" ${locked?"disabled":""}/>
    </div>
  `;
}
function textInput(label, key, val, locked, type="text"){
  return `
    <div>
      <div class="label2">${label}</div>
      <input data-theme="${key}" type="${type}" value="${escapeHtml(String(val ?? ""))}" ${locked?"disabled":""}/>
    </div>
  `;
}
function toHex(v){
  if(!v) return "#ff4fd8";
  if(v.startsWith("#") && (v.length===7 || v.length===4)) return v.length===4 ? "#" + v.slice(1).split("").map(x=>x+x).join("") : v;
  return "#ff4fd8";
}

function renderGoals(app, s){
  app.innerHTML = `
    <div class="pad">
      <h2 class="section-title">Goals (cute but terrifying)</h2>
      <p class="p">Set 3 fitness goals + 3 life goals. Then set <em>anti-goals</em> (things you’re not doing in 2026 because you’re tired).</p>

      <div class="hr"></div>

      <div class="two">
        <div class="card"><div class="pad">
          <div class="row" style="justify-content:space-between;align-items:center">
            <strong>Fitness goals</strong>
            <span class="chip">PRs count, but so does recovery</span>
          </div>
          ${["a","b","c"].map((k,i)=>`
            <div class="label2">${i+1}</div>
            <input data-g="fitness.${k}" placeholder="e.g., Strict pull-up / 5k / 1RM clean" value="${escapeHtml(s.goals.fitness[k]||"")}"/>
          `).join("")}
        </div></div>

        <div class="card"><div class="pad">
          <div class="row" style="justify-content:space-between;align-items:center">
            <strong>Life goals</strong>
            <span class="chip">nervous system glow-up</span>
          </div>
          ${["a","b","c"].map((k,i)=>`
            <div class="label2">${i+1}</div>
            <input data-g="life.${k}" placeholder="e.g., boundaries / save $$ / learn a thing" value="${escapeHtml(s.goals.life[k]||"")}"/>
          `).join("")}
        </div></div>
      </div>

      <div class="hr"></div>

      <div class="label2">Anti-goals (things you are NOT doing)</div>
      <textarea id="antiGoals" placeholder="Examples: doom scrolling at midnight, saying yes to everything, comparing my PRs to 19-year-olds...">${escapeHtml(s.goals.antiGoals||"")}</textarea>

      <div class="hr"></div>
      <div class="row no-print">
        <button class="btn primary" id="btnNudge">Generate a girly-pop pep talk</button>
      </div>
      <p class="p" id="pep" style="margin-top:10px"></p>
    </div>
  `;

  app.querySelectorAll("input[data-g]").forEach(inp=>{
    inp.addEventListener("input", ()=>{
      const [group, key] = inp.dataset.g.split(".");
      s.goals[group][key] = inp.value;
      saveState(s);
    });
  });
  $("#antiGoals").addEventListener("input", ()=>{
    s.goals.antiGoals = $("#antiGoals").value;
    saveState(s);
  });

  $("#btnNudge").onclick = ()=>{
    const pep = pick([
      "Hot girls do mobility. (And then complain about it, but still do it.)",
      "Your plan doesn’t need to be perfect. It needs to be repeatable. Like your fave playlist.",
      "You can’t PR your way out of poor sleep. But you can start tonight. Iconic behavior.",
      "Small steps > chaotic hero weeks. Your future hips send kisses.",
      "If you fall off the plan: get back on. Like a burpee. But emotionally."
    ]);
    $("#pep").textContent = pep;
  };
}

function renderLocked(app, title, shotFile){
  const href = "https://www.etsy.com/";
  app.innerHTML = `
    <div class="pad">
      <div class="row" style="align-items:center;justify-content:space-between">
        <div>
          <h2 class="section-title">${escapeHtml(title)} (preview)</h2>
          <div class="muted small">This section is locked on the preview site — the full download unlocks editing, saving, and exports.</div>
        </div>
        <div class="row no-print">
          <a class="btn primary" href="${href}" target="_blank" rel="noreferrer">Buy on Etsy</a>
        </div>
      </div>

      <div class="hr"></div>

      <div class="blurwrap">
        <img class="blurshot" src="./assets/shots/${shotFile}" alt="Preview screenshot (blurred)" />
        <div class="bluroverlay">
          <h3>Preview only ✨</h3>
          <p>To unlock <strong>${escapeHtml(title)}</strong> (and actually save your spicy little plans), grab the full download on Etsy.</p>
          <div class="row">
            <a class="btn primary" href="${href}" target="_blank" rel="noreferrer">Buy on Etsy</a>
            <button class="btn" onclick="document.querySelector('[data-section=about]')?.click()">What do I get?</button>
          </div>
          <div class="muted small">Seller tip: replace the Etsy link in <code style="font-family:var(--mono)">index.html</code>.</div>
        </div>
      </div>
    </div>
  `;
}

function renderHabits(app, s, config){
  const locked = config?.locked;
  if(locked){ renderLocked(app,"Habits","habits.png"); return; }

  const habits = s.habits.habits || [];
  const today = new Date();
  const wid = weekIdFromDate(today);
  if(!s.habits.weeks[wid]) s.habits.weeks[wid] = Array.from({length:7}, ()=> Array.from({length:habits.length}, ()=>false));

  const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const grid = s.habits.weeks[wid];

  app.innerHTML = `
    <div class="pad">
      <div class="row" style="align-items:center;justify-content:space-between">
        <div>
          <h2 class="section-title">Habit tracker (weekly)</h2>
          <div class="muted small">Week: <span class="chip">${wid}</span> — tap squares to track.</div>
        </div>
        <div class="row no-print">
          <button class="btn" id="prevWeek">←</button>
          <button class="btn" id="nextWeek">→</button>
          <button class="btn danger" id="clearWeek">Clear week</button>
        </div>
      </div>

      <div class="hr"></div>

      <div class="card"><div class="pad">
        <div class="row" style="justify-content:space-between;align-items:center">
          <strong>Habits</strong>
          <span class="badge free">saves locally</span>
        </div>

        <table class="table" style="margin-top:12px">
          <thead>
            <tr>
              <th style="width:35%">Habit</th>
              ${days.map(d=>`<th>${d}</th>`).join("")}
              <th style="width:12%">Target</th>
            </tr>
          </thead>
          <tbody>
            ${habits.map((h, hi)=>`
              <tr>
                <td><strong>${escapeHtml(h.name)}</strong></td>
                ${days.map((d, di)=>`
                  <td><span class="checkbox ${grid[di][hi]?"on":""}" data-di="${di}" data-hi="${hi}"></span></td>
                `).join("")}
                <td><span class="chip">${h.target}/wk</span></td>
              </tr>
            `).join("")}
          </tbody>
        </table>

        <div class="hr"></div>

        <div class="two">
          <div>
            <div class="label2">Add a habit</div>
            <div class="row no-print">
              <input id="newHabit" placeholder="e.g., 'touch grass'"/>
              <input id="newTarget" type="number" min="1" max="7" value="4" style="max-width:110px"/>
              <button class="btn primary" id="addHabit">Add</button>
            </div>
            <div class="muted small">Tip: Keep it simple. 3–6 habits is the sweet spot.</div>
          </div>
          <div>
            <div class="label2">Weekly score</div>
            <div class="kpi">
              <div class="label">Completed checks</div>
              <div class="value" id="weeklyScore">—</div>
            </div>
          </div>
        </div>
      </div></div>
    </div>
  `;

  let currentWid = wid;

  function setScore(){
    const g = s.habits.weeks[currentWid];
    const total = g.flat().filter(Boolean).length;
    $("#weeklyScore").textContent = `${total} checks (we’re counting it)`;
  }
  setScore();

  app.querySelectorAll(".checkbox").forEach(cb=>{
    cb.addEventListener("click", ()=>{
      const di = parseInt(cb.dataset.di,10);
      const hi = parseInt(cb.dataset.hi,10);
      s.habits.weeks[currentWid][di][hi] = !s.habits.weeks[currentWid][di][hi];
      saveState(s);
      cb.classList.toggle("on");
      setScore();
      computeStreak(s);
    });
  });

  $("#addHabit").onclick = ()=>{
    const name = $("#newHabit").value.trim();
    const target = parseInt($("#newTarget").value||"4",10);
    if(!name) return;
    s.habits.habits.push({name, target: Math.min(7, Math.max(1, target))});
    Object.keys(s.habits.weeks).forEach(w=>{
      s.habits.weeks[w].forEach(dayArr=>dayArr.push(false));
    });
    saveState(s);
    renderHabits(app,s,config);
  };

  $("#clearWeek").onclick = ()=>{
    if(confirm("Clear this week?")){
      s.habits.weeks[currentWid] = Array.from({length:7}, ()=> Array.from({length:s.habits.habits.length}, ()=>false));
      saveState(s);
      renderHabits(app,s,config);
    }
  };

  $("#prevWeek").onclick = ()=> shiftWeek(-1);
  $("#nextWeek").onclick = ()=> shiftWeek(1);

  function shiftWeek(delta){
    const [y,w] = currentWid.split("-W");
    let year = parseInt(y,10), week = parseInt(w,10) + delta;
    if(week < 1){ year -= 1; week = 52; }
    if(week > 53){ year += 1; week = 1; }
    currentWid = `${year}-W${String(week).padStart(2,"0")}`;
    if(!s.habits.weeks[currentWid]) s.habits.weeks[currentWid] = Array.from({length:7}, ()=> Array.from({length:s.habits.habits.length}, ()=>false));
    renderHabits(app,s,config);
  }
}

function renderPRLog(app, s, config){
  const locked = config?.locked;
  if(locked){ renderLocked(app,"PR Log","prlog.png"); return; }

  const rows = (s.prlog||[]).slice().reverse();

  app.innerHTML = `
    <div class="pad">
      <div class="row" style="align-items:center;justify-content:space-between">
        <div>
          <h2 class="section-title">PR Log (receipts, babe)</h2>
          <div class="muted small">Track PRs, “almost PRs”, and “I showed up” days. All count.</div>
        </div>
        <div class="row no-print">
          <button class="btn primary" id="addPR">Add</button>
          <button class="btn" id="exportPR">Export PRs</button>
        </div>
      </div>

      <div class="hr"></div>

      <div class="card"><div class="pad">
        <div class="two">
          <div>
            <div class="label2">Movement / Event</div>
            <input id="mv" placeholder="e.g., Clean & Jerk / Fran / 5k / Hyrox"/>
          </div>
          <div>
            <div class="label2">Date</div>
            <input id="dt" type="date" value="${nowISO()}"/>
          </div>
        </div>
        <div class="two">
          <div>
            <div class="label2">Result</div>
            <input id="res" placeholder="e.g., 165 lb / 3:42 / 22:10"/>
          </div>
          <div>
            <div class="label2">Mood (optional)</div>
            <input id="mood" placeholder="e.g., feral, calm, caffeinated"/>
          </div>
        </div>
        <div class="label2">Notes</div>
        <textarea id="note" placeholder="What helped? What didn’t? Any lessons?"></textarea>
      </div></div>

      <div class="hr"></div>

      <div class="card"><div class="pad">
        <div class="row" style="justify-content:space-between;align-items:center">
          <strong>Recent entries</strong>
          <span class="badge free">saved locally</span>
        </div>
        ${rows.length ? `
          <table class="table" style="margin-top:12px">
            <thead><tr><th>Date</th><th>Movement</th><th>Result</th><th>Notes</th><th class="no-print"> </th></tr></thead>
            <tbody>
              ${rows.slice(0,20).map((p, idx)=>`
                <tr>
                  <td>${escapeHtml(p.date||"")}</td>
                  <td><strong>${escapeHtml(p.movement||"")}</strong><div class="muted small">${escapeHtml(p.mood||"")}</div></td>
                  <td>${escapeHtml(p.result||"")}</td>
                  <td class="small">${escapeHtml((p.notes||"").slice(0,160))}${(p.notes||"").length>160?"…":""}</td>
                  <td class="no-print"><button class="btn danger" data-del="${rows.length-1-idx}">Delete</button></td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        ` : `<p class="p muted">No entries yet. Your first PR can be “I opened the workbook.”</p>`}
      </div></div>
    </div>
  `;

  $("#addPR").onclick = ()=>{
    const movement = $("#mv").value.trim();
    const date = $("#dt").value;
    const result = $("#res").value.trim();
    const mood = $("#mood").value.trim();
    const notes = $("#note").value.trim();
    if(!movement || !result){
      alert("Add at least a movement + result. (We’re not mind readers.)");
      return;
    }
    s.prlog.push({movement, date, result, mood, notes});
    saveState(s);
    computeStreak(s);
    renderPRLog(app,s,config);
  };
  $("#exportPR").onclick = ()=> download(`girlypop-2026-prlog-${nowISO()}.json`, JSON.stringify(s.prlog||[], null, 2), "application/json;charset=utf-8");

  app.querySelectorAll("[data-del]").forEach(btn=>{
    btn.onclick = ()=>{
      const i = parseInt(btn.dataset.del,10);
      if(confirm("Delete this entry?")){
        s.prlog.splice(i,1);
        saveState(s);
        renderPRLog(app,s,config);
      }
    };
  });
}

function renderReflection(app, s, config){
  const locked = config?.locked;
  if(locked){ renderLocked(app,"Reflection","reflect.png"); return; }

  const today = nowISO();
  const entry = s.reflections[today] || { wins:"", tough:"", learn:"", gratitude:"", next:"" };

  app.innerHTML = `
    <div class="pad">
      <div class="row" style="align-items:center;justify-content:space-between">
        <div>
          <h2 class="section-title">Daily reflection</h2>
          <div class="muted small">Date: <span class="chip">${today}</span></div>
        </div>
        <div class="row no-print">
          <button class="btn" id="randomPrompt">Random prompt</button>
          <button class="btn" id="exportDay">Export today</button>
        </div>
      </div>

      <div class="hr"></div>

      <div class="card"><div class="pad">
        ${refField("Win (big or tiny)", "wins", entry.wins)}
        ${refField("Hard thing", "tough", entry.tough)}
        ${refField("Lesson / insight", "learn", entry.learn)}
        ${refField("Gratitude", "gratitude", entry.gratitude)}
        ${refField("Tomorrow’s one thing", "next", entry.next)}

        <div class="hr"></div>
        <div class="muted small">Auto-save: on</div>
      </div></div>
    </div>
  `;

  function save(){
    s.reflections[today] = {
      wins: $("#wins").value,
      tough: $("#tough").value,
      learn: $("#learn").value,
      gratitude: $("#gratitude").value,
      next: $("#next").value
    };
    saveState(s);
    computeStreak(s);
  }
  ["wins","tough","learn","gratitude","next"].forEach(id=>{
    $("#"+id).addEventListener("input", save);
  });

  $("#randomPrompt").onclick = ()=>{
    const prompts = [
      "What did you do today that your future self will thank you for?",
      "Where did you choose courage over comfort?",
      "What made training feel fun today?",
      "What’s the kindest explanation for why today was messy?",
      "What boundary did you keep (or want to keep)?"
    ];
    alert(pick(prompts));
  };
  $("#exportDay").onclick = ()=> download(`girlypop-2026-reflection-${today}.json`, JSON.stringify(s.reflections[today], null, 2), "application/json;charset=utf-8");
}
function refField(label, id, val){
  return `
    <div class="label2">${label}</div>
    <textarea id="${id}">${escapeHtml(val||"")}</textarea>
  `;
}

function renderCalendar(app, s, config){
  const locked = config?.locked;
  if(locked){ renderLocked(app,"Calendar","calendar.png"); return; }

  const today = new Date();
  const month = today.getMonth();
  const year = today.getFullYear();

  let viewY = s.calendar._viewY ?? year;
  let viewM = s.calendar._viewM ?? month;

  s.calendar.tz = s.calendar.tz || "America/New_York";
  s.calendar.events = s.calendar.events || [];

  function monthLabel(y,m){
    return new Date(y,m,1).toLocaleString(undefined, {month:"long", year:"numeric"});
  }

  const days = buildMonthGrid(viewY, viewM);

  app.innerHTML = `
    <div class="pad">
      <div class="row" style="align-items:center;justify-content:space-between">
        <div>
          <h2 class="section-title">Calendar (plan your chaos)</h2>
          <div class="muted small">Add workouts, deloads, rest days. Export to iPhone via .ics.</div>
        </div>
        <div class="row no-print">
          <button class="btn" id="prevM">←</button>
          <button class="btn" id="nextM">→</button>
          <button class="btn secondary" id="exportICS">Export .ics</button>
        </div>
      </div>

      <div class="hr"></div>

      <div class="two">
        <div class="card"><div class="pad">
          <div class="row" style="justify-content:space-between;align-items:center">
            <strong>Add event</strong>
            <span class="chip">Timezone: ${escapeHtml(s.calendar.tz)}</span>
          </div>

          <div class="label2">Title</div>
          <input id="evTitle" placeholder="e.g., Lower body + glam, Zone 2 walk, Rest day (hot)" />

          <div class="two">
            <div>
              <div class="label2">Date</div>
              <input id="evDate" type="date" value="${nowISO()}" />
            </div>
            <div>
              <div class="label2">Tag</div>
              <select id="evTag">
                ${["Workout","Rest","Mobility","Race","Life"].map(t=>`<option>${t}</option>`).join("")}
              </select>
            </div>
          </div>

          <div class="two">
            <div>
              <div class="label2">Start</div>
              <input id="evStart" type="time" value="07:00" />
            </div>
            <div>
              <div class="label2">End</div>
              <input id="evEnd" type="time" value="08:00" />
            </div>
          </div>

          <div class="label2">Notes</div>
          <textarea id="evNotes" placeholder="Optional details (WOD, distance, feelings, playlist)"></textarea>

          <div class="hr"></div>
          <div class="row no-print">
            <button class="btn primary" id="addEvent">Add</button>
            <button class="btn danger" id="clearAll">Clear all</button>
          </div>
          <div class="muted small" style="margin-top:10px">Export creates an iPhone-importable .ics file containing all events.</div>
        </div></div>

        <div class="card"><div class="pad">
          <div class="row" style="justify-content:space-between;align-items:center">
            <strong>${escapeHtml(monthLabel(viewY, viewM))}</strong>
            <span class="badge free">saved locally</span>
          </div>

          <div class="hr"></div>

          <div class="cal" style="margin-bottom:12px">
            ${["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d=>`<div class="dow">${d}</div>`).join("")}
            ${days.map(d=>{
              const evs = eventsForDate(s, d.iso);
              const dot = evs.length ? `<span class="dot" title="${evs.length} event(s)"></span>` : `<span style="opacity:.25"> </span>`;
              return `
                <div class="day" data-day="${d.iso}" style="opacity:${d.inMonth?1:.45}">
                  <div class="num"><span>${d.date.getDate()}</span>${dot}</div>
                  ${evs.slice(0,2).map(e=>`<div class="event">${escapeHtml(e.title)}</div>`).join("")}
                  ${evs.length>2?`<div class="muted small" style="margin-top:6px">+${evs.length-2} more</div>`:""}
                </div>
              `;
            }).join("")}
          </div>

          <div class="hr"></div>

          <strong>Upcoming</strong>
          <div class="muted small">Tap a day to see its events.</div>
          <div id="dayEvents" style="margin-top:10px"></div>
        </div></div>
      </div>
    </div>
  `;

  function refresh(){
    saveState(s);
    renderCalendar(app,s,config);
  }

  $("#prevM").onclick = ()=>{
    const d = new Date(viewY, viewM, 1);
    d.setMonth(d.getMonth()-1);
    s.calendar._viewY = d.getFullYear();
    s.calendar._viewM = d.getMonth();
    refresh();
  };
  $("#nextM").onclick = ()=>{
    const d = new Date(viewY, viewM, 1);
    d.setMonth(d.getMonth()+1);
    s.calendar._viewY = d.getFullYear();
    s.calendar._viewM = d.getMonth();
    refresh();
  };

  $("#addEvent").onclick = ()=>{
    const title = $("#evTitle").value.trim();
    const date = $("#evDate").value;
    const start = $("#evStart").value;
    const end = $("#evEnd").value;
    const notes = $("#evNotes").value.trim();
    const tag = $("#evTag").value;

    if(!title || !date){
      alert("Add a title + date, babe.");
      return;
    }
    const id = cryptoId();
    s.calendar.events.push({id,title,date,start,end,notes,tag});
    saveState(s);
    computeStreak(s);
    refresh();
  };

  $("#clearAll").onclick = ()=>{
    if(confirm("Clear ALL calendar events?")){
      s.calendar.events = [];
      saveState(s);
      refresh();
    }
  };

  $("#exportICS").onclick = ()=>{
    const ics = buildICS(s.calendar.events, s.calendar.tz, s.profile.title);
    download(`girlypop-2026-calendar.ics`, ics, "text/calendar;charset=utf-8");
    alert("Downloaded .ics! On iPhone: open the file → Add to Calendar.");
  };

  app.querySelectorAll(".day").forEach(day=>{
    day.onclick = ()=>{
      const iso = day.dataset.day;
      const evs = eventsForDate(s, iso).sort((a,b)=>(a.start||"").localeCompare(b.start||""));
      $("#dayEvents").innerHTML = evs.length ? `
        <div class="card"><div class="pad">
          <div class="row" style="justify-content:space-between;align-items:center">
            <strong>${iso}</strong>
            <span class="chip">${evs.length} event(s)</span>
          </div>
          <div class="hr"></div>
          ${evs.map(e=>`
            <div style="margin-bottom:10px">
              <div class="row" style="justify-content:space-between;align-items:center">
                <div>
                  <strong>${escapeHtml(e.title)}</strong>
                  <div class="muted small">${escapeHtml(e.tag||"")}${e.start?` • ${escapeHtml(e.start)}–${escapeHtml(e.end||"")}`:""}</div>
                </div>
                <button class="btn danger no-print" data-del="${escapeHtml(e.id)}">Delete</button>
              </div>
              ${e.notes?`<div class="p small" style="margin:6px 0 0 0">${escapeHtml(e.notes)}</div>`:""}
            </div>
          `).join("")}
        </div></div>
      ` : `<p class="muted small">No events for ${iso}. Add something cute.</p>`;

      $("#dayEvents").querySelectorAll("[data-del]").forEach(btn=>{
        btn.onclick = ()=>{
          const id = btn.dataset.del;
          if(confirm("Delete this event?")){
            s.calendar.events = s.calendar.events.filter(x=>x.id!==id);
            saveState(s);
            refresh();
          }
        };
      });
    };
  });

  const todayIso = nowISO();
  const todayCell = app.querySelector(`.day[data-day="${todayIso}"]`);
  if(todayCell) todayCell.click();
}

function eventsForDate(s, iso){
  return (s.calendar?.events||[]).filter(e=>e.date===iso);
}

function buildMonthGrid(y, m){
  const first = new Date(y,m,1);
  const startDow = first.getDay();
  const start = new Date(y,m,1 - startDow);
  const out = [];
  for(let i=0;i<42;i++){
    const d = new Date(start);
    d.setDate(start.getDate()+i);
    const iso = d.toISOString().slice(0,10);
    out.push({date:d, iso, inMonth: d.getMonth()===m});
  }
  return out;
}

function cryptoId(){
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let s = "";
  for(let i=0;i<10;i++) s += chars[Math.floor(Math.random()*chars.length)];
  return s;
}

function icsEscape(s){
  return (s||"")
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}
function toICSDateTime(dateISO, timeHHMM){
  const [y,mo,d] = dateISO.split("-");
  const [hh,mm] = (timeHHMM || "00:00").split(":");
  return `${y}${mo}${d}T${hh}${mm}00`;
}
function buildICS(events, tz, calName){
  const dtstamp = new Date().toISOString().replace(/[-:]/g,"").split(".")[0] + "Z";
  const header = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//GirlyPop Fitness Workbook//EN",
    "CALSCALE:GREGORIAN",
    `X-WR-CALNAME:${icsEscape(calName || "GirlyPop 2026")}`,
    `X-WR-TIMEZONE:${tz || "America/New_York"}`
  ];

  const body = (events||[]).map(ev=>{
    const uid = `${ev.id || cryptoId()}@girlypop-workbook`;
    const start = toICSDateTime(ev.date, ev.start || "07:00");
    const end = toICSDateTime(ev.date, ev.end || "08:00");
    const summary = icsEscape(ev.title || "Event");
    const descParts = [];
    if(ev.tag) descParts.push(`Tag: ${ev.tag}`);
    if(ev.notes) descParts.push(ev.notes);
    const desc = icsEscape(descParts.join("\n"));
    return [
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${summary}`,
      desc ? `DESCRIPTION:${desc}` : "",
      "END:VEVENT"
    ].filter(Boolean).join("\r\n");
  });

  const footer = ["END:VCALENDAR"];
  return header.concat(body).concat(footer).join("\r\n") + "\r\n";
}

function renderAbout(app){
  app.innerHTML = `
    <div class="pad">
      <h2 class="section-title">What this is</h2>
      <p class="p">
        A web-based workbook for girly-pop hybrid/CrossFit humans who want PRs <em>and</em> peace.
        Everything saves locally in your browser (no account needed).
      </p>
      <div class="card"><div class="pad">
        <strong>How to use it</strong>
        <ul class="p">
          <li>Edit the vibe in <strong>Theme studio</strong>.</li>
          <li>Set your “top 3” in <strong>Goals</strong>.</li>
          <li>Track habits weekly in <strong>Habits</strong>.</li>
          <li>Log PRs for receipts in <strong>PR Log</strong>.</li>
          <li>Plan your week in <strong>Calendar</strong> and export a <strong>.ics</strong> file to iPhone.</li>
        </ul>
        <div class="hr"></div>
        <div class="muted small">
          Disclaimer: Not medical advice. Also, “girly pop” is a state of mind.
        </div>
      </div></div>
    </div>
  `;
}

function boot(config){
  const s = loadState();
  applyTheme(s.theme);

  const hdrTitle = document.getElementById("hdrTitle");
  const hdrSub = document.getElementById("hdrSub");
  if(hdrTitle) hdrTitle.textContent = s.profile.title;
  if(hdrSub) hdrSub.textContent = s.profile.subtitle;

  const app = document.getElementById("app");
  const sections = config.sections;

  const nav = document.getElementById("nav");
  nav.innerHTML = sections.map(sec=>`
    <button data-section="${sec.id}">
      <div style="min-width:18px;margin-top:1px">${sec.icon||"•"}</div>
      <div style="flex:1">
        <div style="display:flex;gap:8px;align-items:center;justify-content:space-between">
          <div><strong>${sec.title}</strong></div>
          ${sec.badge?`<span class="badge ${sec.badgeClass||""}">${sec.badge}</span>`:""}
        </div>
        <div class="meta">${sec.meta||""}</div>
      </div>
    </button>
  `).join("");

  function show(id){
    const sec = sections.find(x=>x.id===id) || sections[0];
    setActiveNav(sec.id);
    const cfg = { locked: !!sec.locked };

    if(sec.id==="home") renderHome(app,s);
    else if(sec.id==="theme") renderTheme(app,s,cfg);
    else if(sec.id==="goals") renderGoals(app,s);
    else if(sec.id==="calendar") renderCalendar(app,s,cfg);
    else if(sec.id==="habits") renderHabits(app,s,cfg);
    else if(sec.id==="prlog") renderPRLog(app,s,cfg);
    else if(sec.id==="reflect") renderReflection(app,s,cfg);
    else if(sec.id==="about") renderAbout(app);
    else renderHome(app,s);
  }

  nav.querySelectorAll("button").forEach(b=> b.onclick = ()=> show(b.dataset.section));
  show(sections[0].id);

  const importInput = document.getElementById("importFile");
  if(importInput){
    importInput.addEventListener("change", (e)=>{
      const file = e.target.files?.[0];
      if(!file) return;
      const reader = new FileReader();
      reader.onload = ()=>{
        try{
          const data = JSON.parse(reader.result);
          const merged = mergeDeep(structuredClonePoly(defaults), data);
          saveState(merged);
          alert("Imported! Reloading…");
          location.reload();
        }catch(err){
          alert("Couldn’t import that file. Is it valid JSON?");
        }
      };
      reader.readAsText(file);
    });
  }
}

window.GIRLYPOP_BOOT = boot;
