// Lacquer Library: a standalone nail polish library and Instagram caption helper.
// Everything is stored in this browser (localStorage + IndexedDB for pictures).
// The optional AI helper calls the Anthropic API directly with the user's own key.
(() => {
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const safeHex = (h) => /^#[0-9a-fA-F]{6}$/.test(h || "") ? h : "#d9c6cf";
  const norm = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const cap1 = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

  const FINISHES = ["Creme", "Shimmer", "Glitter", "Holo", "Jelly", "Sheer", "Metallic", "Chrome", "Magnetic / cat eye", "Matte", "Flakies", "Thermal", "Neon"];
  const TYPES = ["Nail polish", "Gel polish", "Base coat", "Top coat", "Chrome powder", "Nail art / decals", "Press-ons"];
  const TONES = [
    { id: "trendy", label: "Trendy" }, { id: "cute", label: "Cute" },
    { id: "minimal", label: "Minimal" }, { id: "funny", label: "Funny" }, { id: "detailed", label: "Detailed" }
  ];

  // Brand Instagram handles. Editable in Settings.
  const DEFAULT_HANDLES = {
    "OPI": "opi", "Essie": "essie", "Sally Hansen": "sallyhansen", "Zoya": "zoyanailpolish",
    "China Glaze": "chinaglazeofficial", "Orly": "orlybeauty", "ILNP": "ilnp", "Holo Taco": "holotaco",
    "Olive & June": "oliveandjune", "Mooncat": "mooncat", "Cirque Colors": "cirquecolors", "DND": "dndgel",
    "Kiara Sky": "kiaraskynails", "Lights Lacquer": "lightslacquer", "Deborah Lippmann": "deborahlippmann",
    "Nails Inc": "nailsinc", "CND": "cndworld", "Gelish": "gelish", "Essence": "essencecosmetics",
    "Butter London": "butterlondon", "Dior": "diorbeauty", "Chanel": "chanel.beauty", "Revlon": "revlon",
    "Maybelline": "maybelline", "Rimmel": "rimmellondonuk", "KBShimmer": "kbshimmer", "Emily de Molly": "emilydemolly",
    "Static Nails": "staticnails", "Color Street": "colorstreet", "Glamnetic": "glamnetic", "Apres": "apresnailofficial",
    "Beetles": "beetlesgelpolish", "Barry M": "barrymcosmetics", "Le Mini Macaron": "leminimacaron",
    // Brands added without a confirmed handle: type it in Settings to start tagging them.
    "Modelones": "modelones", "Mia Secret": "", "Gelx": "", "Aimeili": "", "Born Pretty": "", "Xejayi": "", "Vettsy": "vettsynails"
  };
  // Brands that mostly name shades by number, so their shades are added by hand.
  const NUMBERED_BRANDS = { modelones: "Modelones", beetles: "Beetles", dnd: "DND", miasecret: "Mia Secret", aimeili: "Aimeili", bornpretty: "Born Pretty", xejayi: "Xejayi", vettsy: "Vettsy", gelish: "Gelish", kiarasky: "Kiara Sky" };
  const DEFAULT_SETTINGS = {
    handle: "", tags: "#nails #nailsofinstagram #nailart #naildesign #nailinspo #manicure #nailpolish #swatch",
    sign: "", brandTags: true, emoji: true, handles: {}
  };
  const EXAMPLES = [
    { id: "ex1", brand: "OPI", name: "Bubble Bath", finish: "Sheer", type: "Nail polish", hex: "#f3d3cf", coll: "", example: true },
    { id: "ex2", brand: "Essie", name: "Ballet Slippers", finish: "Sheer", type: "Nail polish", hex: "#f6d6d9", coll: "", example: true },
    { id: "ex3", brand: "Holo Taco", name: "One Coat Black", finish: "Creme", type: "Nail polish", hex: "#141414", coll: "", example: true }
  ];
  const CATALOG = window.LL_CATALOG || {};
  const PACKS = window.LL_TRENDS || [];
  const TIPS = window.LL_TIPS || [];

  const state = { polishes: [], settings: { ...DEFAULT_SETTINGS }, selected: new Set(), tone: "trendy", photo: null, inspo: [], editing: null, packId: null, aiPack: null, ai: { on: false, key: "" } };

  // ---------- storage ----------
  const LS = {
    get(k, d) { try { const v = localStorage.getItem("ll_" + k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem("ll_" + k, JSON.stringify(v)); return true; } catch { return false; } },
    del(k) { try { localStorage.removeItem("ll_" + k); } catch {} }
  };
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  // Pictures go in IndexedDB because localStorage is too small for images.
  const IDB = (() => {
    let dbp;
    function open() {
      if (!dbp) dbp = new Promise((res, rej) => {
        try {
          const r = indexedDB.open("lacquer-library", 1);
          r.onupgradeneeded = () => r.result.createObjectStore("images");
          r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
        } catch (e) { rej(e); }
      });
      return dbp;
    }
    async function tx(mode, fn) {
      const db = await open();
      return new Promise((res, rej) => { const t = db.transaction("images", mode); const req = fn(t.objectStore("images")); t.oncomplete = () => res(req?.result); t.onerror = () => rej(t.error); });
    }
    return {
      put: (id, blob) => tx("readwrite", (s) => s.put(blob, id)),
      get: (id) => tx("readonly", (s) => s.get(id)),
      del: (id) => tx("readwrite", (s) => s.delete(id))
    };
  })();
  const imgURLs = new Map();
  async function imgURL(id) {
    if (imgURLs.has(id)) return imgURLs.get(id);
    try { const b = await IDB.get(id); if (!b) return ""; const u = URL.createObjectURL(b); imgURLs.set(id, u); return u; } catch { return ""; }
  }

  function savePolish(p) {
    const { example, ...clean } = p;
    const i = state.polishes.findIndex((x) => x.id === p.id);
    if (i >= 0) state.polishes[i] = clean; else state.polishes.push(clean);
    if (!LS.set("polishes", state.polishes)) throw new Error("storage");
    renderAll();
  }
  function deletePolish(id) {
    state.selected.delete(id);
    state.polishes = state.polishes.filter((p) => p.id !== id); LS.set("polishes", state.polishes); renderAll();
  }
  function saveSettings() { if (!LS.set("settings", state.settings)) throw new Error("storage"); renderAll(); }

  // ---------- colour words ----------
  function hsl(hex) {
    const h = safeHex(hex); const r = parseInt(h.slice(1, 3), 16) / 255, g = parseInt(h.slice(3, 5), 16) / 255, b = parseInt(h.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2; let hue = 0, s = 0;
    if (max !== min) {
      const d = max - min; s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      hue = max === r ? ((g - b) / d + (g < b ? 6 : 0)) : max === g ? (b - r) / d + 2 : (r - g) / d + 4; hue *= 60;
    }
    return { h: hue, s, l };
  }
  // Returns colour words for a polish, most specific first.
  function colourWords(p) {
    const f = norm(p.finish);
    const { h, s, l } = hsl(p.hex); const w = [];
    if (f.includes("chrome") || f.includes("metal")) { if (h >= 30 && h < 60 && s > 0.3) w.push("gold"); else if (s < 0.2) w.push("silver"); }
    if (l < 0.12) w.push("black");
    else if (l > 0.9 && s < 0.5) w.push("white");
    else if (s < 0.12) w.push("grey", "gray");
    else if (h < 15 || h >= 335) {
      if (l < 0.3) w.push("burgundy", "wine", "red");
      else if (l > 0.72) w.push("pink", s < 0.6 ? "nude" : "");
      else w.push("red");
    } else if (h < 38) {
      if (l < 0.5 && s < 0.7) w.push("brown", "chocolate");
      else if (l > 0.65 && s < 0.65) w.push("nude", "beige");
      else w.push("orange", "coral");
    } else if (h < 65) {
      if (l < 0.4) w.push("olive", "brown");
      else if (l < 0.65 && s < 0.65) w.push("gold");
      else if (l > 0.75 && s < 0.65) w.push("nude", "beige");
      else w.push("yellow");
    }
    else if (h < 170) w.push(l > 0.7 ? "mint" : "", "green");
    else if (h < 255) w.push(l > 0.7 ? "baby blue" : l < 0.3 ? "navy" : "", "blue");
    else if (h < 290) w.push(l > 0.65 ? "lilac" : "", "purple");
    else w.push(l < 0.3 ? "plum" : "", l < 0.3 ? "purple" : "pink");
    if (l < 0.3) w.push("dark"); else if (l > 0.75) w.push("light", "pastel");
    return w.filter(Boolean);
  }
  const mainColour = (p) => colourWords(p).find((x) => !["dark", "light", "pastel"].includes(x)) || "";

  // ---------- helpers ----------
  function handleFor(brand) {
    const n = norm(brand);
    // Your own saved tag wins; a blank one falls back to the built-in tag.
    for (const src of [state.settings.handles || {}, DEFAULT_HANDLES])
      for (const k of Object.keys(src)) if (norm(k) === n && String(src[k] || "").replace(/^@/, "")) return "@" + String(src[k]).replace(/^@/, "");
    return "";
  }
  function brandNames() {
    const set = new Map();
    for (const k of [...Object.keys({ ...DEFAULT_HANDLES, ...state.settings.handles }), ...Object.keys(CATALOG)]) set.set(norm(k), k);
    for (const p of state.polishes) if (!set.has(norm(p.brand))) set.set(norm(p.brand), p.brand);
    return [...set.values()].sort((a, b) => a.localeCompare(b));
  }
  const shown = () => state.polishes.length ? state.polishes : EXAMPLES;
  function matches(p, q) {
    if (!q) return true;
    const hay = `${p.brand} ${p.name} ${p.finish} ${p.coll} ${p.type} ${colourWords(p).join(" ")}`.toLowerCase();
    return q.toLowerCase().split(/\s+/).every((w) => hay.includes(w));
  }
  const sorted = (list) => [...list].sort((a, b) => a.brand.localeCompare(b.brand) || a.name.localeCompare(b.name));
  function bottle(p) {
    const f = norm(p.finish);
    const cls = f.includes("glitter") || f.includes("flak") ? "glitter" : f.includes("holo") ? "holo" : f.includes("shimmer") || f.includes("metal") ? "shimmer" : f.includes("chrome") ? "chrome" : f.includes("magnet") ? "magnetic" : "";
    return `<span class="bottle ${cls}" aria-hidden="true"><i style="--c:${safeHex(p.hex)}"></i></span>`;
  }
  let toastT;
  function toast(msg) { const t = $("#toast"); t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => (t.hidden = true), 2400); }
  const owned = () => new Set(state.polishes.map((p) => norm(p.brand) + "|" + norm(p.name)));

  // ---------- render ----------
  function renderLibrary() {
    const q = $("#libSearch").value.trim();
    const list = sorted(shown()).filter((p) => matches(p, q));
    $("#libCount").textContent = state.polishes.length;
    let html = !state.polishes.length ? `<div class="notice">These three are examples so you can see how it works. They disappear once you add your first polish.</div>` : "";
    if (!list.length) html += `<div class="empty">No polishes match "${esc(q)}".</div>`;
    html += list.map((p) => `
      <div class="polish" data-id="${esc(p.id)}">
        ${bottle(p)}
        <div class="pmeta"><div class="pname">${esc(p.name)}</div>
          <div class="pbrand">${esc(p.brand)}${handleFor(p.brand) ? ` · <b>${esc(handleFor(p.brand))}</b>` : ""}${p.finish ? " · " + esc(p.finish) : ""}${p.type && p.type !== "Nail polish" ? " · " + esc(p.type) : ""}</div></div>
        ${p.example ? "" : `<div class="row">
          <button class="btn small ghost" data-edit="${esc(p.id)}" aria-label="Edit ${esc(p.name)}">Edit</button>
          <button class="btn small ghost danger" data-del="${esc(p.id)}" aria-label="Remove ${esc(p.name)}">Remove</button></div>`}
      </div>`).join("");
    $("#libList").innerHTML = html;
  }

  function renderPick() {
    const q = $("#postSearch").value.trim();
    const list = sorted(shown()).filter((p) => matches(p, q));
    list.sort((a, b) => (state.selected.has(b.id) ? 1 : 0) - (state.selected.has(a.id) ? 1 : 0));
    $("#pickList").innerHTML = list.length ? list.map((p) => `
      <div class="polish selectable ${state.selected.has(p.id) ? "sel" : ""}" role="checkbox" tabindex="0" aria-checked="${state.selected.has(p.id)}" data-pick="${esc(p.id)}">
        ${bottle(p)}
        <div class="pmeta"><div class="pname">${esc(p.name)}</div><div class="pbrand">${esc(p.brand)}${p.finish ? " · " + esc(p.finish) : ""}</div></div>
        <span class="tick" aria-hidden="true">✓</span>
      </div>`).join("") : `<div class="empty">Nothing matches. Add polishes in the Library tab.</div>`;
    const n = state.selected.size;
    $("#selBadge").hidden = !n; $("#selBadge").textContent = n;
  }

  function renderSettings() {
    const s = state.settings;
    if (document.activeElement?.closest?.("#setForm") == null) {
      $("#sHandle").value = s.handle || ""; $("#sTags").value = s.tags || ""; $("#sSign").value = s.sign || "";
      $("#sBrandTags").checked = !!s.brandTags; $("#sEmoji").checked = !!s.emoji;
    }
    const all = { ...DEFAULT_HANDLES, ...s.handles };
    const used = new Set(state.polishes.map((p) => norm(p.brand)));
    const names = Object.keys(all).sort((a, b) => (used.has(norm(b)) - used.has(norm(a))) || a.localeCompare(b));
    for (const p of state.polishes) if (!names.some((n) => norm(n) === norm(p.brand))) names.unshift(p.brand);
    $("#handles").innerHTML = names.map((b) => `
      <div class="row"><span>${esc(b)}</span><input type="text" value="${esc(all[b] ? "@" + String(all[b]).replace(/^@/, "") : "")}" placeholder="@handle" data-hbrand="${esc(b)}" aria-label="Instagram handle for ${esc(b)}"></div>`).join("");
    $("#brandList").innerHTML = brandNames().map((b) => `<option value="${esc(b)}"></option>`).join("");
    $("#catalogBrands").innerHTML = [...new Set([...Object.keys(CATALOG), ...Object.values(NUMBERED_BRANDS)])].sort().map((b) => `<option value="${esc(b)}"></option>`).join("");
  }

  function renderAI() {
    const on = state.ai.on && !!state.ai.key;
    $("#aiOn").checked = state.ai.on; $("#aiBox").hidden = !state.ai.on;
    if (document.activeElement !== $("#aiKey")) $("#aiKey").value = state.ai.key ? "••••••••" + state.ai.key.slice(-4) : "";
    $("#aiState").textContent = on ? "On" : state.ai.on ? "Needs a key" : "Off";
    $("#findAI").hidden = !on; $("#refreshTrends").hidden = !on;
    $("#photoNote").textContent = on ? "With the AI helper on, your photo is sent to Anthropic so the caption can describe it." : "Your photo is only shown here as a preview. It never leaves your device.";
  }

  function renderAll() { renderLibrary(); renderPick(); renderSettings(); renderTrends(); renderAI(); }

  // ---------- tabs ----------
  function showTab(name) {
    for (const v of ["library", "post", "trends", "settings"]) $("#view-" + v).hidden = v !== name;
    document.querySelectorAll("nav.tabs button").forEach((b) => { if (b.dataset.tab === name) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current"); });
    try { localStorage.setItem("ll_tab", name); } catch {}
    window.scrollTo(0, 0);
  }
  document.querySelectorAll("nav.tabs button").forEach((b) => b.addEventListener("click", () => showTab(b.dataset.tab)));

  // ---------- library events ----------
  $("#fFinish").innerHTML = FINISHES.map((f) => `<option>${f}</option>`).join("");
  $("#fType").innerHTML = TYPES.map((f) => `<option>${f}</option>`).join("");
  $("#libSearch").addEventListener("input", renderLibrary);
  function resetAddForm() { state.editing = null; $("#addForm").reset(); $("#fColor").value = "#e8b4bc"; $("#addTitle").textContent = "Add a polish"; $("#addSubmit").textContent = "Save to library"; }
  $("#openAdd").onclick = () => { resetAddForm(); $("#addForm").hidden = false; $("#findPanel").hidden = true; $("#fBrand").focus(); };
  $("#closeAdd").onclick = () => ($("#addForm").hidden = true);
  $("#openFind").onclick = () => { $("#findPanel").hidden = false; $("#addForm").hidden = true; $("#qBrand").focus(); };
  $("#closeFind").onclick = () => ($("#findPanel").hidden = true);

  $("#addForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const wasEditing = !!state.editing;
    const p = { id: state.editing || uid(), brand: $("#fBrand").value.trim(), name: $("#fName").value.trim(), finish: $("#fFinish").value, type: $("#fType").value, hex: $("#fColor").value, coll: $("#fColl").value.trim(), added: Date.now() };
    if (!p.brand || !p.name) return;
    try {
      savePolish(p); toast(wasEditing ? "Saved changes" : `Added ${p.name}`);
      resetAddForm();
      if (wasEditing) $("#addForm").hidden = true; else { $("#fBrand").value = p.brand; $("#fName").focus(); }
    } catch { toast("Couldn't save. Your browser storage may be full."); }
  });

  $("#libList").addEventListener("click", (e) => {
    const del = e.target.closest("[data-del]"), edit = e.target.closest("[data-edit]");
    const yes = e.target.closest("[data-yes]"), no = e.target.closest("[data-no]");
    if (del) {
      del.parentElement.innerHTML = `<div class="confirm"><button class="btn small danger" data-yes="${esc(del.dataset.del)}">Yes, remove</button><button class="btn small ghost" data-no>Keep</button></div>`;
    } else if (yes) { deletePolish(yes.dataset.yes); toast("Removed"); }
    else if (no) renderLibrary();
    else if (edit) {
      const p = state.polishes.find((x) => x.id === edit.dataset.edit); if (!p) return;
      state.editing = p.id; $("#fBrand").value = p.brand; $("#fName").value = p.name; $("#fFinish").value = p.finish || FINISHES[0];
      $("#fType").value = p.type || TYPES[0]; $("#fColor").value = safeHex(p.hex); $("#fColl").value = p.coll || "";
      $("#addTitle").textContent = "Edit polish"; $("#addSubmit").textContent = "Save changes";
      $("#addForm").hidden = false; $("#findPanel").hidden = true; window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  // ---------- find by brand (built-in catalog) ----------
  let lastFound = [];
  function catalogBrand(q) {
    const n = norm(q); if (!n) return null;
    const keys = Object.keys(CATALOG);
    return keys.find((k) => norm(k) === n) || keys.find((k) => norm(k).startsWith(n) || n.startsWith(norm(k))) || keys.find((k) => norm(k).includes(n)) || null;
  }
  const toPolish = (brand, s) => ({ id: uid(), brand, name: s[0], hex: safeHex(s[1]), finish: FINISHES.includes(s[2]) ? s[2] : "Creme", type: TYPES.includes(s[4]) ? s[4] : "Nail polish", coll: s[3] || "", added: Date.now() });
  $("#findForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const brandQ = $("#qBrand").value.trim(), hint = $("#qHint").value.trim().toLowerCase();
    const brand = catalogBrand(brandQ);
    if (!brand) {
      lastFound = []; lastBrand = canonicalBrand(brandQ);
      const numbered = NUMBERED_BRANDS[norm(brandQ)];
      const why = numbered ? `${esc(numbered)} mostly names its shades by number (like #2603) or sells them in sets, so there's no ready-made list. Add yours with the name or number on the bottle, and pick the colour.` : `${esc(brandQ)} isn't in the built-in list yet, but you can add its shades yourself.`;
      $("#findOut").innerHTML = `<div class="empty stack" style="gap:10px"><span>${why}</span>${manualBtn(lastBrand, true)}${state.ai.on && state.ai.key ? `<span class="note">Or tap “Ask AI for more”.</span>` : ""}</div>`;
      return;
    }
    lastBrand = brand;
    const all = CATALOG[brand].map((s) => toPolish(brand, s));
    let list = all, note = "";
    if (hint) {
      const words = hint.split(/\s+/).filter(Boolean);
      const hay = (p) => `${p.name} ${p.finish} ${p.coll} ${colourWords(p).join(" ")}`.toLowerCase();
      list = all.filter((p) => words.every((w) => hay(p).includes(w)));
      if (!list.length) list = all.filter((p) => words.some((w) => hay(p).includes(w)));
      if (!list.length) { list = all; note = `No ${esc(brand)} shades in the built-in list match “${esc(hint)}”, so here are all of them.`; }
    }
    lastFound = list;
    renderFound(note);
  });
  let lastBrand = "";
  function canonicalBrand(q) { const n = norm(q); return brandNames().find((b) => norm(b) === n) || q.trim(); }
  const manualBtn = (brand, primary) => `<button type="button" class="btn ${primary ? "primary" : "ghost"} block" data-manual="${esc(brand)}">+ Add your own ${esc(brand)} shade</button>`;
  function renderFound(note = "") {
    if (!lastFound.length) { $("#findOut").innerHTML = `<div class="empty">No shades found. Try a different spelling or colour.</div>` + (lastBrand ? manualBtn(lastBrand) : ""); return; }
    const have = owned();
    const missing = lastFound.filter((p) => !have.has(norm(p.brand) + "|" + norm(p.name))).length;
    $("#findOut").innerHTML = (note ? `<p class="note">${note}</p>` : "") + (missing > 1 ? `<button type="button" class="btn primary block" data-addall>+ Add all ${missing} to my library</button>` : "") + lastFound.map((p, i) => {
      const h = have.has(norm(p.brand) + "|" + norm(p.name));
      return `<div class="polish">${bottle(p)}
        <div class="pmeta"><div class="pname">${esc(p.name)}</div><div class="pbrand">${esc(p.brand)} · ${esc(p.finish)}${p.coll ? " · " + esc(p.coll) : ""}</div></div>
        <button class="btn small ${h ? "ghost" : "primary"}" data-addfound="${i}" ${h ? "disabled" : ""}>${h ? "In library" : "+ Add"}</button></div>`;
    }).join("") + (lastBrand ? `<p class="note">Don't see yours?</p>${manualBtn(lastBrand)}` : "");
  }
  $("#findOut").addEventListener("click", (e) => {
    const m = e.target.closest("[data-manual]");
    if (m) {
      resetAddForm(); $("#fBrand").value = m.dataset.manual;
      $("#findPanel").hidden = true; $("#addForm").hidden = false;
      window.scrollTo({ top: 0, behavior: "smooth" }); $("#fName").focus();
      return;
    }
    if (e.target.closest("[data-addall]")) {
      const have = owned(); let n = 0;
      try { for (const p of lastFound) if (!have.has(norm(p.brand) + "|" + norm(p.name))) { const { example, ...c } = { ...p, id: uid() }; state.polishes.push(c); n++; } if (!LS.set("polishes", state.polishes)) throw 0; renderAll(); renderFound(); toast(`Added ${n} polishes`); }
      catch { toast("Couldn't save. Your browser storage may be full."); }
      return;
    }
    const b = e.target.closest("[data-addfound]"); if (!b) return;
    const p = lastFound[+b.dataset.addfound]; if (!p) return;
    try { savePolish({ ...p, id: uid() }); toast(`Added ${p.name}`); renderFound(); } catch { toast("Couldn't save. Your browser storage may be full."); }
  });

  // ---------- post ----------
  $("#toneChips").innerHTML = TONES.map((t) => `<button class="chip" data-tone="${t.id}" aria-pressed="${t.id === state.tone}">${t.label}</button>`).join("");
  $("#toneChips").addEventListener("click", (e) => {
    const c = e.target.closest("[data-tone]"); if (!c) return;
    state.tone = c.dataset.tone;
    document.querySelectorAll("[data-tone]").forEach((x) => x.setAttribute("aria-pressed", x.dataset.tone === state.tone));
  });
  $("#postSearch").addEventListener("input", renderPick);
  function togglePick(el) { const id = el.dataset.pick; state.selected.has(id) ? state.selected.delete(id) : state.selected.add(id); renderPick(); }
  $("#pickList").addEventListener("click", (e) => { const el = e.target.closest("[data-pick]"); if (el) togglePick(el); });
  $("#pickList").addEventListener("keydown", (e) => { const el = e.target.closest("[data-pick]"); if (el && (e.key === " " || e.key === "Enter")) { e.preventDefault(); togglePick(el); document.querySelector(`[data-pick="${CSS.escape(el.dataset.pick)}"]`)?.focus(); } });
  $("#clearSel").onclick = () => { state.selected.clear(); renderPick(); };

  $("#photoIn").addEventListener("change", () => {
    const f = $("#photoIn").files?.[0];
    if (!f) { state.photo = null; $("#photoPrev").hidden = true; return; }
    state.photo = f; $("#photoPrev").src = URL.createObjectURL(f); $("#photoPrev").hidden = false;
  });

  const selectedPolishes = () => sorted(shown().filter((p) => state.selected.has(p.id)));
  function polishBlock() {
    const e = state.settings.emoji;
    const list = selectedPolishes();
    if (!list.length) return "";
    const lines = list.map((p) => {
      const h = handleFor(p.brand);
      return `${e ? "✨" : "–"} ${p.name} by ${h || p.brand}`;
    });
    return `${e ? "💅 " : ""}Polishes used:\n${lines.join("\n")}`;
  }
  function hashtagBlock() {
    const s = state.settings; const tags = [];
    for (const t of String(state.extraTags || "").split(/\s+/)) if (t.startsWith("#") && !tags.includes(t)) tags.push(t);
    if (s.brandTags) for (const p of selectedPolishes()) { const t = "#" + norm(p.brand); if (!tags.includes(t)) tags.push(t); }
    for (const t of String(s.tags || "").split(/\s+/)) { const c = t.trim(); if (!c) continue; const tag = c.startsWith("#") ? c : "#" + c; if (!tags.includes(tag)) tags.push(tag); }
    return tags.join(" ");
  }
  function assemble(opening) {
    const s = state.settings;
    const parts = [opening, polishBlock(), s.sign, s.handle ? `${s.emoji ? "📸 " : ""}${s.handle.startsWith("@") ? s.handle : "@" + s.handle}` : "", hashtagBlock()].filter((x) => x && x.trim());
    return parts.join("\n\n");
  }

  // Template captions: filled in from the polishes you picked and your description.
  const FINISH_WORD = { creme: "glossy", shimmer: "shimmery", glitter: "glitter", holo: "holo", jelly: "jelly", sheer: "sheer", metallic: "metallic", chrome: "chrome", magneticcateye: "cat eye", matte: "matte", flakies: "flakie", thermal: "colour-changing", neon: "neon" };
  const EMOJI = { red: "❤️", burgundy: "🍷", pink: "🎀", nude: "🤍", beige: "🤍", white: "🤍", black: "🖤", brown: "🤎", orange: "🧡", coral: "🧡", yellow: "💛", gold: "✨", olive: "🫒", green: "💚", mint: "💚", blue: "💙", navy: "💙", purple: "💜", lilac: "💜", plum: "💜", grey: "🩶", silver: "🩶" };
  const TEMPLATES = {
    trendy: ["{color} era, officially", "obsessed is an understatement", "no thoughts, just {color} nails", "the {color} manicure of my dreams", "this set is giving everything", "main character manicure", "{vibe} and i'm obsessed", "new set, who dis", "{vibe}. that's the post", "{color} nails > everything else"],
    cute: ["a little {color} something for the week", "sweet as can be", "soft {color} and happy hands", "my nails said “be cute” so i listened", "{vibe}, because why not", "tiny bit of {color} joy", "{vibe} for a happy week", "fresh mani, fresh mood"],
    minimal: ["{color}.", "today's mani.", "simple. {color}. done.", "{vibe}.", "quiet {color}."],
    funny: ["did my nails instead of my to-do list", "my bank account said no, my nails said {color}", "i'll be tapping on things for attention all week", "productivity: 0. nails: 10/10.", "{vibe}. yes, i will be staring at them all day", "these nails have better plans than me", "warning: will talk with my hands more than usual"],
    detailed: ["{Vibe}. {count} on short nails, finished with lots of top coat. Full list below.", "This week's set: {color} all the way. {count}, all listed below.", "{Color} set, built from {count}. Everything I used is tagged below so you can recreate it."]
  };
  let lastTemplate = "";
  function templateOpening() {
    const list = selectedPolishes();
    const vibe = $("#vibe").value.trim().replace(/[.!\s]+$/, "");
    const cols = [...new Set(list.map(mainColour).filter(Boolean))];
    const color = cols.length > 1 ? `${cols[0]} and ${cols[1]}` : cols[0] || "fresh";
    const f0 = norm(list.find((p) => p.finish && p.finish !== "Creme")?.finish || list[0]?.finish || "creme");
    const finish = FINISH_WORD[f0] || "glossy";
    const count = list.length === 1 ? "One polish" : `${list.length} polishes`;
    let pool = TEMPLATES[state.tone].filter((t) => vibe || !/\{vibe\}/i.test(t));
    if (pool.length > 1) pool = pool.filter((t) => t !== lastTemplate);
    const t = pick(pool); lastTemplate = t;
    let out = t.replace(/\{vibe\}/g, vibe).replace(/\{Vibe\}/g, cap1(vibe)).replace(/\{color\}/g, color).replace(/\{Color\}/g, cap1(color))
      .replace(/\{finish\}/g, finish).replace(/\{count\}/g, count);
    if (state.tone !== "detailed") out = cap1(out);
    if (state.settings.emoji) out += " " + (EMOJI[cols[0]] || "💅") + (state.tone === "minimal" ? "" : " " + pick(["✨", "💅", "🫶"]));
    return out;
  }

  $("#genBasic").onclick = () => {
    if (!state.selected.size) { toast("Pick at least one polish first"); return; }
    const h = $("#hook").value.trim();
    if (h) { $("#captionOut").value = assemble(h); $("#capNote").textContent = ""; return; }
    $("#captionOut").value = assemble(templateOpening());
    $("#capNote").textContent = "No opening line yet, so here's one to start. Tap again for another.";
  };

  let capBusy = false;
  $("#genCap").onclick = async () => {
    if (!state.selected.size) { toast("Pick at least one polish first"); return; }
    if (!(state.ai.on && state.ai.key)) {
      const h = $("#hook").value.trim();
      $("#captionOut").value = assemble(h && Math.random() < 0.5 ? h : templateOpening());
      $("#capNote").textContent = "Tap again for a different one. Add a few words about the set for a more personal caption.";
      return;
    }
    if (capBusy) return; capBusy = true;
    const btn = $("#genCap"); btn.disabled = true; btn.innerHTML = `<span class="spin"></span> Writing…`;
    $("#capNote").textContent = "";
    const list = selectedPolishes().map((p) => `${p.brand} – ${p.name} (colour ${p.hex})`).join("\n");
    const toneHelp = {
      trendy: "current Instagram nail-girl voice: confident, a little playful, uses trending phrasing naturally (not cringe)",
      cute: "sweet and soft, playful", minimal: "very short and aesthetic, 3 to 8 words",
      funny: "witty and self-aware, a light joke", detailed: "describes the technique and look in 2 to 3 sentences"
    }[state.tone];
    const hasPhoto = !!state.photo;
    const prompt = `Write the opening of an Instagram caption for a nail artist's post.
Tone: ${toneHelp}.
${hasPhoto ? "The attached photo shows the nails. Mention what makes this set stand out (colours, finish, design)." : ""}
Her description of the set: "${$("#vibe").value.trim() || "(none)"}"
${$("#hook").value.trim() ? `She likes this opening line, keep it or riff on it: "${$("#hook").value.trim()}"` : ""}
Polishes used:
${list}
Rules: 1 to 3 short lines. ${state.settings.emoji ? "1 to 3 fitting emoji are fine." : "No emoji."} Don't name the finish or type of polish (no "sheer", "cat eye", "gel", "chrome" and so on). No hashtags, no @ tags, no list of polishes (those are added separately). No quotation marks around the caption. Reply with only the caption text.`;
    try {
      const images = hasPhoto ? [await shrink(state.photo)] : [];
      const text = (await callAI(prompt, images)).trim().replace(/^["“]|["”]$/g, "");
      $("#captionOut").value = assemble(text || templateOpening());
      $("#capNote").textContent = hasPhoto ? "Written by AI from your photo. Tap again for a different one." : "Written by AI. Tap again for a different one.";
    } catch (err) {
      $("#captionOut").value = assemble(templateOpening());
      $("#capNote").textContent = aiErrorText(err) + " Here's a template caption instead.";
    } finally { capBusy = false; btn.disabled = false; btn.textContent = "Write a caption"; }
  };
  async function shrink(file, max = 1024) {
    const img = await createImageBitmap(file);
    const scale = Math.min(1, max / Math.max(img.width, img.height));
    const c = document.createElement("canvas"); c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
    c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
    return await new Promise((res) => c.toBlob(res, "image/jpeg", 0.85));
  }

  $("#copyCap").onclick = async () => {
    const t = $("#captionOut").value; if (!t.trim()) { toast("Make a caption first"); return; }
    try { await navigator.clipboard.writeText(t); toast("Caption copied. Paste it in Instagram."); }
    catch { const ta = $("#captionOut"); ta.focus(); ta.select(); toast("Text selected. Tap Copy to copy it."); }
  };

  // ---------- trends ----------
  function currentPack() {
    if (state.packId === "ai" && state.aiPack) return state.aiPack;
    const p = PACKS.find((x) => x.id === state.packId);
    if (p) return p;
    const m = new Date().getMonth() + 1;
    return PACKS.find((x) => x.months.includes(m)) || PACKS[0];
  }
  function renderTrends() {
    const t = currentPack(); if (!t) return;
    const chips = [...PACKS.map((p) => ({ id: p.id, label: p.season })), ...(state.aiPack ? [{ id: "ai", label: "AI ideas" }] : [])];
    $("#seasonChips").innerHTML = chips.map((c) => `<button class="chip" data-pack="${esc(c.id)}" aria-pressed="${c.id === t.id}">${esc(c.label)}</button>`).join("");
    $("#trendSub").textContent = `${t.season}${t.updated ? " · updated " + t.updated : ""}. ${t.intro || ""}`;
    const have = owned();
    $("#trendList").innerHTML = (t.trends || []).map((tr, i) => `
      <article class="trend">
        <div class="trend-head">
          <div class="dots" aria-hidden="true">${(tr.colors || []).slice(0, 4).map((c) => `<i style="--c:${safeHex(c)}"></i>`).join("")}</div>
          <div class="pmeta"><h3>${esc(tr.look)}</h3></div>
        </div>
        <div>${esc(tr.what)}</div>
        ${(tr.polishes || []).length ? `<div class="stack" style="gap:6px"><span class="label">Polishes to try</span><div class="chips">${tr.polishes.map((p, j) => {
          const h = have.has(norm(p.brand) + "|" + norm(p.name));
          return `<button class="pchip ${h ? "have" : ""}" data-tpol="${i}:${j}" ${h ? "disabled" : ""} aria-label="${h ? "In your library" : "Add to library"}: ${esc(p.brand)} ${esc(p.name)}">${h ? "✓" : "+"} ${esc(p.brand)} ${esc(p.name)}</button>`;
        }).join("")}</div></div>` : ""}
        <div class="stack" style="gap:6px"><span class="label">Caption lines</span>
          <div class="hooks">${(tr.hooks || []).map((h, j) => `<div class="hook"><span>${esc(h)}</span><button class="btn small primary" data-usehook="${i}:${j}">Use</button></div>`).join("")}</div>
        </div>
        ${tr.tags ? `<div class="row" style="justify-content:space-between"><span class="tagline grow">${esc(tr.tags)}</span><button class="btn small ghost" data-usetags="${i}">Add tags</button></div>` : ""}
        <div class="stack" style="gap:6px"><span class="label">See examples</span>
          <div class="chips">${exampleLinks(tr).map((l) => `<a class="chip" href="${esc(l.href)}" target="_blank" rel="noopener" style="text-decoration:none">${esc(l.label)} ↗</a>`).join("")}</div>
        </div>
        ${inspoBlock(tr, i)}
      </article>`).join("");
    $("#tipList").innerHTML = (t.tips || TIPS).map((x) => `<li>${esc(x)}</li>`).join("");
    hydrateImages();
  }
  async function hydrateImages() {
    for (const img of document.querySelectorAll("img[data-img]")) { const u = await imgURL(img.dataset.img); if (u) img.src = u; else img.closest("figure")?.setAttribute("hidden", ""); }
  }
  $("#seasonChips").addEventListener("click", (e) => {
    const c = e.target.closest("[data-pack]"); if (!c) return;
    state.packId = c.dataset.pack; $("#trendNote").textContent = ""; renderTrends();
  });

  $("#trendList").addEventListener("click", (e) => {
    const di = e.target.closest("[data-delinspo]");
    if (di) {
      if (di.dataset.sure) { deleteInspo(di.dataset.delinspo); toast("Removed"); }
      else { di.dataset.sure = "1"; di.textContent = di.classList.contains("x") ? "✓" : "Sure?"; setTimeout(() => { if (di.isConnected) { delete di.dataset.sure; di.textContent = di.classList.contains("x") ? "×" : "Remove"; } }, 3000); }
      return;
    }
    const u = e.target.closest("[data-usehook]"), tg = e.target.closest("[data-usetags]"), pc = e.target.closest("[data-tpol]");
    const t = currentPack();
    if (u) {
      const [i, j] = u.dataset.usehook.split(":").map(Number);
      $("#hook").value = t.trends[i].hooks[j];
      showTab("post");
      if (state.selected.size) { $("#captionOut").value = assemble($("#hook").value); toast("Line added to your caption"); }
      else toast("Line added. Now pick your polishes.");
    } else if (tg) {
      const tags = String(t.trends[+tg.dataset.usetags].tags || "");
      const cur = $("#captionOut").value;
      const extra = tags.split(/\s+/).filter((x) => x && !cur.includes(x)).join(" ");
      state.extraTags = tags;
      if (cur.trim()) $("#captionOut").value = cur.trimEnd() + (extra ? " " + extra : "");
      showTab("post"); toast(cur.trim() ? "Hashtags added to your caption" : "Hashtags will be added when you make a caption");
    } else if (pc) {
      const [i, j] = pc.dataset.tpol.split(":").map(Number);
      const p = t.trends[i].polishes[j];
      const fromCat = (CATALOG[p.brand] || []).find((s) => norm(s[0]) === norm(p.name));
      try { savePolish(fromCat ? toPolish(p.brand, fromCat) : { id: uid(), brand: p.brand, name: p.name, hex: safeHex(p.hex), finish: "Creme", type: "Nail polish", coll: "", added: Date.now() }); toast(`Added ${p.name} to your library`); }
      catch { toast("Couldn't save. Your browser storage may be full."); }
    }
  });

  function exampleLinks(tr) {
    const q = `${tr.look} nails`;
    const tag = (String(tr.tags || "").match(/#([a-z0-9_]+)/i) || [])[1] || norm(tr.look) + "nails";
    return [
      { label: "TikTok", href: "https://www.tiktok.com/search?q=" + encodeURIComponent(q) },
      { label: "Instagram", href: "https://www.instagram.com/explore/tags/" + encodeURIComponent(tag) + "/" },
      { label: "Pinterest", href: "https://www.pinterest.com/search/pins/?q=" + encodeURIComponent(q) }
    ];
  }
  const tkey = (tr) => norm(tr.look).slice(0, 60) || "x";
  function linkLabel(u) {
    try { const h = new URL(u).hostname.replace(/^www\./, ""); return h.includes("tiktok") ? "TikTok video" : h.includes("instagram") ? "Instagram post" : h.includes("pinterest") || h.includes("pin.it") ? "Pinterest pin" : h; } catch { return "Link"; }
  }
  function inspoBlock(tr, i) {
    const items = state.inspo.filter((x) => x.trend === tkey(tr)).sort((a, b) => (a.added || 0) - (b.added || 0));
    const imgs = items.filter((x) => x.kind === "image" && /^[a-z0-9]+$/i.test(x.imgId || ""));
    const links = items.filter((x) => x.kind === "link" && /^https:\/\//.test(x.url || ""));
    return `<div class="stack" style="gap:6px"><span class="label">Your saved inspo</span>
      ${imgs.length ? `<div class="inspo">${imgs.map((x) => `<figure><img data-img="${esc(x.imgId)}" alt="Saved inspo for ${esc(tr.look)}"><button class="x" data-delinspo="${esc(x.id)}" aria-label="Remove picture">×</button></figure>`).join("")}</div>` : ""}
      ${links.length ? `<div class="links">${links.map((x) => `<div class="hook"><a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(linkLabel(x.url))} ↗</a><button class="btn small ghost" data-delinspo="${esc(x.id)}" aria-label="Remove link">Remove</button></div>`).join("")}</div>` : ""}
      ${!imgs.length && !links.length ? `<p class="note">Save screenshots, or paste a TikTok, Reel or Pinterest link you like.</p>` : ""}
      <form class="addinspo" data-inspoform="${i}">
        <input type="text" inputmode="url" placeholder="Paste a TikTok / Reel / Pin link" aria-label="Paste a link for ${esc(tr.look)}">
        <button class="btn small" type="submit">Save link</button>
        <label class="btn small ghost filebtn">Add screenshot<input type="file" accept="image/*" data-inspofile="${i}" aria-label="Add a screenshot for ${esc(tr.look)}"></label>
      </form>
    </div>`;
  }
  function saveInspo(item) { state.inspo.push(item); LS.set("inspo", state.inspo); renderTrends(); }
  function deleteInspo(id) {
    const it = state.inspo.find((x) => x.id === id);
    state.inspo = state.inspo.filter((x) => x.id !== id); LS.set("inspo", state.inspo);
    if (it?.imgId) { IDB.del(it.imgId).catch(() => {}); const u = imgURLs.get(it.imgId); if (u) { URL.revokeObjectURL(u); imgURLs.delete(it.imgId); } }
    renderTrends();
  }
  $("#trendList").addEventListener("submit", (e) => {
    const f = e.target.closest("[data-inspoform]"); if (!f) return;
    e.preventDefault();
    const inp = f.querySelector("input[type=text]");
    const m = inp.value.trim().match(/https?:\/\/\S+/); const url = m ? m[0].replace(/^http:/, "https:") : "";
    if (!url) { toast("Paste a link that starts with https://"); return; }
    const tr = currentPack().trends[+f.dataset.inspoform];
    saveInspo({ id: uid(), trend: tkey(tr), kind: "link", url: url.slice(0, 500), added: Date.now() }); toast("Link saved");
  });
  $("#trendList").addEventListener("change", async (e) => {
    const fi = e.target.closest("[data-inspofile]"); if (!fi || !fi.files?.[0]) return;
    const tr = currentPack().trends[+fi.dataset.inspofile];
    toast("Saving picture…");
    try {
      const blob = await shrink(fi.files[0], 1400); const imgId = uid();
      await IDB.put(imgId, blob);
      saveInspo({ id: uid(), trend: tkey(tr), kind: "image", imgId, added: Date.now() }); toast("Picture saved");
    } catch { toast("Couldn't save the picture. Try again."); }
  });

  // ---------- optional AI helper (user's own Anthropic API key) ----------
  async function callAI(prompt, images = []) {
    const content = [];
    for (const b of images) content.push({ type: "image", source: { type: "base64", media_type: "image/jpeg", data: await blobToB64(b) } });
    content.push({ type: "text", text: prompt });
    let res;
    try {
      res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "content-type": "application/json", "x-api-key": state.ai.key, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
        body: JSON.stringify({ model: "claude-opus-5-5", max_tokens: 8000, output_config: { effort: "low" }, messages: [{ role: "user", content }] })
      });
    } catch { throw { code: "network" }; }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw { code: res.status === 401 ? "bad_key" : res.status === 429 ? "rate_limited" : res.status === 400 && /credit/i.test(data?.error?.message || "") ? "credit" : "api", msg: data?.error?.message };
    if (data.stop_reason === "refusal") throw { code: "refusal" };
    return (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
  }
  async function callAIJSON(prompt) {
    const t = await callAI(prompt + "\nReply with JSON only, no other text.");
    const a = t.indexOf("{"), b = t.lastIndexOf("}");
    if (a < 0 || b < a) throw { code: "bad_json" };
    try { return JSON.parse(t.slice(a, b + 1)); } catch { throw { code: "bad_json" }; }
  }
  function blobToB64(blob) { return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(",")[1]); r.onerror = rej; r.readAsDataURL(blob); }); }
  function aiErrorText(err) {
    return { bad_key: "The AI helper's API key wasn't accepted. Check it in Settings.", rate_limited: "Too many AI requests in a row. Try again in a minute.", credit: "Your Anthropic account is out of credit.", network: "Couldn't reach the AI helper. Check your connection.", refusal: "The AI helper declined that one." }[err?.code] || "The AI helper couldn't answer just now.";
  }

  $("#findAI").onclick = async () => {
    const brandQ = $("#qBrand").value.trim(); if (!brandQ) { toast("Type a brand first"); return; }
    const hint = $("#qHint").value.trim();
    const btn = $("#findAI"); btn.disabled = true; btn.innerHTML = `<span class="spin"></span> Asking…`;
    try {
      const out = await callAIJSON(`You help a nail artist build a library of nail polishes she owns.
Brand: "${brandQ}"
What she's looking for: "${hint || "a good spread of this brand's popular and recent shades"}"
List up to 12 real, existing shades from this brand that match. Only real shade names you are confident exist. Include the brand's official Instagram username (without @) if you know it, else empty string.
Shape: {"brand":"Official brand name","instagram":"handle","shades":[{"name":"Shade name","hex":"#RRGGBB approximate bottle colour","finish":"one of: ${FINISHES.join(", ")}","collection":"collection name or empty"}]}`);
      const bName = typeof out?.brand === "string" && out.brand.trim() ? out.brand.trim().slice(0, 60) : brandQ;
      if (typeof out?.instagram === "string" && out.instagram.trim() && !handleFor(bName)) {
        state.settings.handles = { ...state.settings.handles, [bName]: out.instagram.trim().replace(/^@/, "").slice(0, 40) };
        try { saveSettings(); } catch {}
      }
      lastFound = (Array.isArray(out?.shades) ? out.shades.slice(0, 12) : []).map((s) => toPolish(bName, [String(s.name || "").slice(0, 80), s.hex, s.finish, String(s.collection || "").slice(0, 80)])).filter((p) => p.name);
      renderFound("Suggested by AI. Names and colours can be slightly off.");
    } catch (err) { $("#findOut").innerHTML = `<div class="empty">${esc(aiErrorText(err))}</div>`; }
    finally { btn.disabled = false; btn.textContent = "Ask AI for more"; }
  };

  $("#refreshTrends").onclick = async () => {
    const btn = $("#refreshTrends"); btn.disabled = true; btn.innerHTML = `<span class="spin"></span> Thinking up ideas…`;
    $("#trendNote").textContent = "";
    const today = new Date().toISOString().slice(0, 10);
    try {
      const out = await callAIJSON(`Today is ${today}. You help a nail artist plan Instagram posts. List 8 nail looks that are popular on Instagram for the current season and the next few weeks (think about upcoming holidays and the season), mixing colours, finishes and nail art.
For each: a short name, one sentence describing it, 2-3 hex colours for swatches, 0-3 real polishes (brand + exact real shade name) you are confident exist, 3 short trendy caption opening lines (lowercase, playful, no hashtags, no emoji), and 3 relevant hashtags in one string.
Also give: a season label (like "Winter 2026"), a 1-2 sentence intro, and 5 short practical Instagram posting tips for nail posts.
Shape: {"season":"","intro":"","trends":[{"look":"","what":"","colors":["#RRGGBB"],"polishes":[{"brand":"","name":"","hex":"#RRGGBB"}],"hooks":["",""],"tags":"#a #b #c"}],"tips":[""]}`);
      if (!Array.isArray(out?.trends) || !out.trends.length) throw { code: "empty" };
      state.aiPack = {
        id: "ai", updated: today, season: "AI ideas: " + String(out.season || "").slice(0, 40), intro: String(out.intro || "").slice(0, 300),
        trends: out.trends.slice(0, 12).map((t) => ({
          look: String(t.look || "").slice(0, 60), what: String(t.what || "").slice(0, 200),
          colors: (Array.isArray(t.colors) ? t.colors : []).slice(0, 4).map(safeHex),
          polishes: (Array.isArray(t.polishes) ? t.polishes : []).slice(0, 3).map((p) => ({ brand: String(p.brand || "").slice(0, 40), name: String(p.name || "").slice(0, 60), hex: safeHex(p.hex) })).filter((p) => p.brand && p.name),
          hooks: (Array.isArray(t.hooks) ? t.hooks : []).slice(0, 4).map((h) => String(h).slice(0, 120)).filter(Boolean),
          tags: String(t.tags || "").slice(0, 120)
        })).filter((t) => t.look),
        tips: (Array.isArray(out.tips) ? out.tips : []).slice(0, 8).map((x) => String(x).slice(0, 200))
      };
      LS.set("ai_trends", state.aiPack); state.packId = "ai";
      renderTrends();
      $("#trendNote").textContent = "These ideas come from the AI's knowledge of nail trends, not a live Instagram feed.";
    } catch (err) { $("#trendNote").textContent = aiErrorText(err); }
    finally { btn.disabled = false; btn.textContent = "Get fresh ideas with AI"; }
  };

  $("#aiOn").addEventListener("change", () => { state.ai.on = $("#aiOn").checked; LS.set("ai_on", state.ai.on); renderAI(); });
  $("#aiKey").addEventListener("focus", () => { if (state.ai.key) $("#aiKey").value = ""; });
  $("#aiKey").addEventListener("blur", () => { if (!$("#aiKey").value) renderAI(); });
  $("#aiSave").onclick = () => {
    const k = $("#aiKey").value.trim();
    if (!/^sk-ant-/.test(k)) { toast("That doesn't look like an Anthropic key (it starts with sk-ant-)"); return; }
    state.ai.key = k; LS.set("ai_key", k); $("#aiKey").blur(); renderAI(); toast("Key saved on this device");
  };
  $("#aiForget").onclick = () => { state.ai.key = ""; LS.del("ai_key"); renderAI(); toast("Key removed"); };

  // ---------- settings ----------
  $("#setForm").addEventListener("submit", (e) => {
    e.preventDefault();
    Object.assign(state.settings, { handle: $("#sHandle").value.trim(), tags: $("#sTags").value.trim(), sign: $("#sSign").value.trim(), brandTags: $("#sBrandTags").checked, emoji: $("#sEmoji").checked });
    document.activeElement?.blur();
    try { saveSettings(); toast("Settings saved"); } catch { toast("Couldn't save settings."); }
  });
  $("#handles").addEventListener("change", (e) => {
    const i = e.target.closest("[data-hbrand]"); if (!i) return;
    state.settings.handles = { ...state.settings.handles, [i.dataset.hbrand]: i.value.trim().replace(/^@/, "") };
    try { saveSettings(); toast("Tag updated"); } catch { toast("Couldn't save."); }
  });
  $("#handleForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const b = $("#hBrand").value.trim(), h = $("#hHandle").value.trim().replace(/^@/, "");
    if (!b || !h) return;
    state.settings.handles = { ...state.settings.handles, [b]: h };
    $("#handleForm").reset();
    try { saveSettings(); toast("Brand added"); } catch { toast("Couldn't save."); }
  });

  // ---------- backup ----------
  $("#exportBtn").onclick = async () => {
    const images = {};
    for (const it of state.inspo) if (it.imgId) { try { const b = await IDB.get(it.imgId); if (b) images[it.imgId] = "data:image/jpeg;base64," + await blobToB64(b); } catch {} }
    const data = { app: "lacquer-library", version: 1, exported: new Date().toISOString(), polishes: state.polishes, settings: state.settings, inspo: state.inspo, images };
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 1)], { type: "application/json" }));
    a.download = `lacquer-library-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    toast("Backup downloaded");
  };
  $("#importIn").addEventListener("change", async () => {
    const f = $("#importIn").files?.[0]; if (!f) return;
    try {
      const d = JSON.parse(await f.text());
      if (d?.app !== "lacquer-library" || !Array.isArray(d.polishes)) throw 0;
      for (const [id, url] of Object.entries(d.images || {})) { if (/^[a-z0-9]+$/i.test(id) && /^data:image\//.test(url)) await IDB.put(id, await (await fetch(url)).blob()); }
      state.polishes = d.polishes.filter((p) => p && p.brand && p.name).map((p) => ({ ...p, id: String(p.id || uid()), hex: safeHex(p.hex) }));
      state.settings = { ...DEFAULT_SETTINGS, ...(d.settings || {}) };
      state.inspo = Array.isArray(d.inspo) ? d.inspo : [];
      state.selected.clear(); imgURLs.clear();
      LS.set("polishes", state.polishes); LS.set("settings", state.settings); LS.set("inspo", state.inspo);
      renderAll(); toast(`Restored ${state.polishes.length} polishes`);
    } catch { toast("That file isn't a Lacquer Library backup."); }
    $("#importIn").value = "";
  });

  // ---------- boot ----------
  state.polishes = LS.get("polishes", []);
  state.settings = { ...DEFAULT_SETTINGS, ...LS.get("settings", {}) };
  state.inspo = LS.get("inspo", []);
  state.aiPack = LS.get("ai_trends", null);
  state.ai = { on: !!LS.get("ai_on", false), key: LS.get("ai_key", "") || "" };
  try { const t = localStorage.getItem("ll_tab"); if (t && $("#view-" + t)) showTab(t); } catch {}
  renderAll();
})();
