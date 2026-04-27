/* Videbimus AI — Interactive ML demos
   All values illustrative; not real production model output. */

(function () {
  // -----------------------------------------------------------------------
  // tiny helpers
  // -----------------------------------------------------------------------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const fmt = (v, d = 0) => v.toLocaleString("en-GB", { minimumFractionDigits: d, maximumFractionDigits: d });
  const pad2 = n => String(n).padStart(2, "0");

  // seedable PRNG so demos look "alive" but stable
  function mulberry32(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  // ===========================================================================
  // 01  FINANCE — fraud detection (XGBoost-like score gauge)
  // ===========================================================================
  function initFraud(root) {
    const amount = $("#fr-amount", root);
    const hour = $("#fr-hour", root);
    const country = $("#fr-country", root);
    const newDevice = $("#fr-newdev", root);
    const merchant = $("#fr-merch", root);
    const gauge = $("#fr-gauge", root);
    const scoreEl = $("#fr-score", root);
    const verdict = $("#fr-verdict", root);
    const factors = $("#fr-factors", root);

    function score() {
      const a = +amount.value;
      const h = +hour.value;
      const dev = newDevice.classList.contains("on") ? 1 : 0;
      const intl = country.value === "intl" ? 1 : 0;
      const m = merchant.value;
      const merchRisk = { grocery: 0.05, electronics: 0.35, crypto: 0.7, gambling: 0.85, travel: 0.4 }[m] ?? 0.2;

      // synthetic risk blend
      let r = 0;
      r += clamp((a - 50) / 4000, 0, 1) * 0.32;
      r += (h < 6 || h > 22 ? 0.18 : 0.02);
      r += dev * 0.22;
      r += intl * 0.15;
      r += merchRisk * 0.34;
      r = clamp(r, 0.02, 0.98);

      // gauge arc
      const angle = -120 + r * 240;
      const needle = $(".gauge-needle", gauge);
      if (needle) needle.style.transform = `rotate(${angle}deg)`;

      const arc = $(".gauge-arc-fill", gauge);
      if (arc) {
        const len = 240; // in viewBox units approx
        arc.style.strokeDasharray = `${r * len} ${len}`;
      }

      scoreEl.textContent = (r * 100).toFixed(1);

      let v, cls;
      if (r < 0.3) { v = "APPROVE"; cls = "good"; }
      else if (r < 0.65) { v = "STEP-UP AUTH"; cls = ""; }
      else { v = "BLOCK"; cls = "bad"; }
      verdict.textContent = v;
      verdict.className = "chip " + cls + " on-" + cls;
      verdict.style.background = cls === "good" ? "var(--good)" : cls === "bad" ? "var(--bad)" : "var(--signal)";
      verdict.style.color = "var(--ink)";
      verdict.style.borderColor = "transparent";

      // top contributing factors
      const items = [
        ["amount",   clamp((a - 50) / 4000, 0, 1) * 0.32],
        ["off-hours", (h < 6 || h > 22 ? 0.18 : 0.02)],
        ["new device", dev * 0.22],
        ["intl card", intl * 0.15],
        [m,           merchRisk * 0.34]
      ].sort((x, y) => y[1] - x[1]).slice(0, 3);
      factors.innerHTML = items.map(([k, v]) =>
        `<span class="chip">${k} <b style="color:var(--signal); margin-left:6px">+${(v*100).toFixed(0)}</b></span>`
      ).join("");
    }

    [amount, hour].forEach(el => el.addEventListener("input", () => {
      $(`label[for=${el.id}] .val`, root).textContent =
        el.id === "fr-amount" ? "£" + fmt(+el.value)
        : `${pad2(+el.value)}:00`;
      score();
    }));
    country.addEventListener("change", score);
    merchant.addEventListener("change", score);
    newDevice.addEventListener("click", () => {
      newDevice.classList.toggle("on"); score();
    });
    score();
  }

  // ===========================================================================
  // 02  HEALTHCARE — chest X-ray attention (CNN heatmap)
  // ===========================================================================
  function initXray(root) {
    const canvas = $("#xr-canvas", root);
    const ctx = canvas.getContext("2d");
    const conf = $("#xr-conf", root);
    const findEl = $("#xr-finding", root);
    const probEl = $("#xr-prob", root);
    const conditionSeg = $$(".seg button", $("#xr-cond", root));
    let condition = "pneumonia";

    const W = canvas.width = 360, H = canvas.height = 260;

    function drawLungs() {
      ctx.fillStyle = "#0c1a2e"; ctx.fillRect(0, 0, W, H);
      // ribs / silhouette suggestion (placeholder, not medical)
      ctx.strokeStyle = "rgba(244,236,223,0.18)"; ctx.lineWidth = 1;
      for (let i = 0; i < 7; i++) {
        ctx.beginPath();
        ctx.ellipse(W/2, 30 + i*22, 110 - i*4, 14, 0, Math.PI, 0);
        ctx.stroke();
      }
      // lung outlines
      ctx.strokeStyle = "rgba(244,236,223,0.55)"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.ellipse(W/2 - 60, H/2 + 8, 50, 90, 0, 0, Math.PI*2); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(W/2 + 60, H/2 + 8, 50, 90, 0, 0, Math.PI*2); ctx.stroke();
      // spine
      ctx.strokeStyle = "rgba(244,236,223,0.3)";
      ctx.beginPath(); ctx.moveTo(W/2, 20); ctx.lineTo(W/2, H-20); ctx.stroke();
    }

    function drawHeatmap() {
      drawLungs();
      const seed = condition === "pneumonia" ? 11 : condition === "cardiomegaly" ? 33 : 71;
      const rng = mulberry32(seed + Math.floor(+conf.value));
      const intensity = +conf.value / 100;

      const hotspots = condition === "pneumonia"
        ? [{ x: W/2 - 70, y: H/2 + 20, r: 38 }, { x: W/2 - 50, y: H/2 + 50, r: 22 }]
        : condition === "cardiomegaly"
        ? [{ x: W/2 - 8, y: H/2 + 30, r: 60 }]
        : [{ x: W/2 + 60, y: H/2 - 10, r: 18 }, { x: W/2 + 40, y: H/2 - 40, r: 12 }];

      hotspots.forEach(h => {
        const grd = ctx.createRadialGradient(h.x, h.y, 1, h.x, h.y, h.r);
        grd.addColorStop(0, `rgba(255, 170, 80, ${0.85 * intensity})`);
        grd.addColorStop(0.45, `rgba(220, 90, 60, ${0.55 * intensity})`);
        grd.addColorStop(1, `rgba(220, 90, 60, 0)`);
        ctx.fillStyle = grd;
        ctx.beginPath(); ctx.arc(h.x, h.y, h.r, 0, Math.PI*2); ctx.fill();
      });

      // crosshair
      const main = hotspots[0];
      ctx.strokeStyle = "var(--signal)"; ctx.strokeStyle = "#f0a35a";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(main.x - main.r - 6, main.y); ctx.lineTo(main.x + main.r + 6, main.y);
      ctx.moveTo(main.x, main.y - main.r - 6); ctx.lineTo(main.x, main.y + main.r + 6);
      ctx.stroke();

      // labels
      const labels = {
        pneumonia: "Pneumonia",
        cardiomegaly: "Cardiomegaly",
        nodule: "Pulmonary nodule"
      };
      findEl.textContent = labels[condition];
      probEl.textContent = (intensity * (condition === "cardiomegaly" ? 0.92 : 0.86) * 100).toFixed(1) + "%";
    }

    conditionSeg.forEach(b => b.addEventListener("click", () => {
      conditionSeg.forEach(x => x.classList.remove("on"));
      b.classList.add("on");
      condition = b.dataset.cond;
      drawHeatmap();
    }));
    conf.addEventListener("input", drawHeatmap);
    drawHeatmap();
  }

  // ===========================================================================
  // 03  RETAIL — recommender (collaborative filtering vibe)
  // ===========================================================================
  function initRecs(root) {
    const items = [
      { id: "wool-coat",  name: "Wool overcoat",      tag: "outerwear", price: 289 },
      { id: "linen-shirt",name: "Linen shirt",        tag: "tops",      price: 78 },
      { id: "loafers",    name: "Suede loafers",      tag: "shoes",     price: 195 },
      { id: "denim",      name: "Selvedge denim",     tag: "bottoms",   price: 142 },
      { id: "knit",       name: "Cashmere knit",      tag: "tops",      price: 240 },
      { id: "tote",       name: "Leather tote",       tag: "bags",      price: 320 },
      { id: "scarf",      name: "Silk scarf",         tag: "accessories", price: 95 },
      { id: "boots",      name: "Chelsea boots",      tag: "shoes",     price: 245 },
      { id: "trench",     name: "Belted trench",      tag: "outerwear", price: 410 },
      { id: "blazer",     name: "Wool blazer",        tag: "tops",      price: 295 },
      { id: "trouser",    name: "Pleated trouser",    tag: "bottoms",   price: 168 },
      { id: "cap",        name: "Baker boy cap",      tag: "accessories", price: 64 }
    ];
    // affinity matrix (handcrafted)
    const sim = {
      "wool-coat":   { "knit": .8, "loafers": .5, "scarf": .7, "trench": .6, "trouser": .6, "boots": .5 },
      "linen-shirt": { "denim": .8, "loafers": .6, "blazer": .7, "trouser": .7 },
      "loafers":     { "trouser": .8, "blazer": .7, "linen-shirt": .6, "wool-coat": .6 },
      "denim":       { "linen-shirt": .8, "boots": .7, "knit": .6, "tote": .5 },
      "knit":        { "trouser": .7, "wool-coat": .8, "trench": .6, "scarf": .5 },
      "tote":        { "scarf": .6, "trench": .6, "blazer": .5 },
      "scarf":       { "wool-coat": .7, "trench": .8, "knit": .5 },
      "boots":       { "denim": .7, "trench": .6, "trouser": .5 },
      "trench":      { "scarf": .8, "boots": .7, "trouser": .6, "knit": .6 },
      "blazer":      { "trouser": .9, "loafers": .7, "linen-shirt": .7 },
      "trouser":     { "blazer": .9, "loafers": .8, "knit": .6, "boots": .5 },
      "cap":         { "trench": .5, "denim": .5, "wool-coat": .5 }
    };

    const cart = $("#rec-cart", root);
    const out  = $("#rec-out", root);
    const grid = $("#rec-grid", root);
    const liftEl = $("#rec-lift", root);
    const cartItems = new Set();

    function renderGrid() {
      grid.innerHTML = items.map(it =>
        `<button class="chip ${cartItems.has(it.id) ? "on" : ""}" data-id="${it.id}">${it.name}</button>`
      ).join("");
      $$("[data-id]", grid).forEach(b => b.addEventListener("click", () => {
        const id = b.dataset.id;
        if (cartItems.has(id)) cartItems.delete(id); else cartItems.add(id);
        renderGrid(); rerank();
      }));
    }

    function rerank() {
      const scores = {};
      items.forEach(it => {
        if (cartItems.has(it.id)) return;
        let s = 0;
        cartItems.forEach(c => { if (sim[c] && sim[c][it.id]) s += sim[c][it.id]; });
        scores[it.id] = s;
      });
      const sorted = items
        .filter(it => !cartItems.has(it.id))
        .map(it => ({ ...it, score: scores[it.id] || 0 }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 4);

      cart.innerHTML = cartItems.size === 0
        ? `<span style="color:var(--muted-2); font-family:var(--mono); font-size:10px; letter-spacing:0.18em; text-transform:uppercase">— add items above —</span>`
        : Array.from(cartItems).map(id => {
            const it = items.find(x => x.id === id);
            return `<span class="chip on">${it.name}</span>`;
          }).join("");

      out.innerHTML = sorted.map(it => `
        <div class="rec-row">
          <div class="rec-bar"><div class="rec-fill" style="width:${(it.score / 2.4 * 100).toFixed(0)}%"></div></div>
          <div class="rec-name">${it.name}</div>
          <div class="rec-score">${it.score.toFixed(2)}</div>
        </div>`).join("");

      const lift = clamp(cartItems.size * 14 + 8, 0, 78);
      liftEl.textContent = "+" + lift + "%";
    }
    renderGrid(); rerank();
  }

  // ===========================================================================
  // 04  MANUFACTURING — predictive maintenance (RUL forecast)
  // ===========================================================================
  function initRUL(root) {
    const svg = $("#rul-svg", root);
    const vibSlider = $("#rul-vib", root);
    const tempSlider = $("#rul-temp", root);
    const rulOut = $("#rul-out", root);
    const status = $("#rul-status", root);

    const W = 360, H = 160, PAD = 20;

    function render() {
      const v = +vibSlider.value, t = +tempSlider.value;
      // synthetic degradation curve
      const baseRUL = 240; // hrs
      const rul = clamp(baseRUL - v * 1.4 - (t - 60) * 1.6, 4, baseRUL);
      const rng = mulberry32(7);
      const points = [];
      for (let i = 0; i <= 60; i++) {
        const x = PAD + (i / 60) * (W - PAD * 2);
        // historical → forecast
        const noise = (rng() - 0.5) * 2;
        const trend = i < 30
          ? 0.85 + Math.sin(i / 4) * 0.04 + noise * 0.02
          : 0.85 - ((i - 30) / 30) * (1.4 - rul / baseRUL) + noise * 0.015;
        const yval = clamp(trend, 0.05, 1);
        const y = H - PAD - yval * (H - PAD * 2);
        points.push([x, y, i, yval]);
      }
      const past = points.slice(0, 31);
      const fut  = points.slice(30);
      const lineP = past.map(p => p.join(",")).join(" ");
      const lineF = fut.map(p => p.join(",")).join(" ");

      // confidence band
      const upper = fut.map(p => `${p[0]},${p[1] - 8 - (p[2]-30) * 0.5}`).join(" ");
      const lower = fut.map(p => `${p[0]},${p[1] + 8 + (p[2]-30) * 0.5}`).reverse().join(" ");

      // failure threshold
      const thY = H - PAD - 0.25 * (H - PAD * 2);

      svg.innerHTML = `
        <line x1="${PAD}" y1="${thY}" x2="${W - PAD}" y2="${thY}"
              stroke="var(--bad)" stroke-dasharray="3 4" stroke-width="1" opacity="0.6"/>
        <text x="${W - PAD - 4}" y="${thY - 4}" text-anchor="end"
              font-family="var(--mono)" font-size="9" fill="var(--bad)" letter-spacing="2"
              style="text-transform:uppercase">FAILURE</text>

        <polygon points="${upper} ${lower}" fill="var(--signal)" opacity="0.13"/>
        <polyline points="${lineP}" fill="none" stroke="var(--paper)" stroke-width="1.5"/>
        <polyline points="${lineF}" fill="none" stroke="var(--signal)" stroke-width="1.5" stroke-dasharray="4 3"/>

        <line x1="${past[past.length-1][0]}" y1="${PAD}" x2="${past[past.length-1][0]}" y2="${H-PAD}"
              stroke="var(--rule-strong)" stroke-dasharray="2 3"/>
        <text x="${past[past.length-1][0] + 4}" y="${PAD + 9}"
              font-family="var(--mono)" font-size="9" fill="var(--muted)"
              letter-spacing="2" style="text-transform:uppercase">NOW</text>

        <circle cx="${fut[fut.length-1][0]}" cy="${fut[fut.length-1][1]}" r="3" fill="var(--signal)"/>
      `;

      rulOut.textContent = Math.round(rul);
      const s = rul < 24 ? ["CRITICAL", "bad"] : rul < 96 ? ["SCHEDULE SERVICE", ""] : ["HEALTHY", "good"];
      status.textContent = s[0];
      status.className = "chip " + s[1];
      status.style.background = s[1] === "good" ? "var(--good)" : s[1] === "bad" ? "var(--bad)" : "var(--signal)";
      status.style.color = "var(--ink)";
      status.style.borderColor = "transparent";
    }

    [vibSlider, tempSlider].forEach(el => el.addEventListener("input", () => {
      const lab = $(`label[for=${el.id}] .val`, root);
      if (el.id === "rul-vib") lab.textContent = (+el.value).toFixed(1) + " mm/s";
      if (el.id === "rul-temp") lab.textContent = (+el.value).toFixed(0) + " °C";
      render();
    }));
    render();
  }

  // ===========================================================================
  // 05  ENERGY — load forecasting (LSTM-style)
  // ===========================================================================
  function initLoad(root) {
    const svg = $("#en-svg", root);
    const tempSl = $("#en-temp", root);
    const dayBtns = $$(".seg button", $("#en-day", root));
    const peakOut = $("#en-peak", root);
    const totOut  = $("#en-tot", root);
    let day = "weekday";

    const W = 360, H = 160, PAD = 20;

    function render() {
      const t = +tempSl.value;
      const heatPenalty = t > 22 ? (t - 22) * 0.04 : 0;
      const coldPenalty = t < 8 ? (8 - t) * 0.05 : 0;
      const isWk = day === "weekday";

      const pts = [];
      for (let h = 0; h < 24; h++) {
        let base = 0.5
          + Math.sin(((h - 8) / 24) * Math.PI * 2) * 0.18
          + (h >= 17 && h <= 21 ? 0.22 : 0)
          + (h >= 6 && h <= 9 && isWk ? 0.12 : 0)
          + heatPenalty + coldPenalty;
        base = clamp(base, 0.15, 1.05);
        pts.push(base);
      }
      const peak = Math.max(...pts);
      const total = pts.reduce((a, b) => a + b, 0);

      const xs = h => PAD + (h / 23) * (W - PAD * 2);
      const ys = v => H - PAD - clamp(v / 1.1, 0, 1) * (H - PAD * 2);
      const linePts = pts.map((v, h) => `${xs(h)},${ys(v)}`).join(" ");
      // confidence band
      const upPts = pts.map((v, h) => `${xs(h)},${ys(v + 0.06 + h*0.0005)}`).join(" ");
      const dnPts = pts.map((v, h) => `${xs(h)},${ys(v - 0.06 - h*0.0005)}`).reverse().join(" ");

      // bars below
      const bars = pts.map((v, h) => {
        const x = xs(h) - 4;
        const y = ys(v);
        return `<rect x="${x}" y="${y}" width="2" height="${H - PAD - y}" fill="var(--paper)" opacity="0.25"/>`;
      }).join("");

      svg.innerHTML = `
        ${bars}
        <polygon points="${upPts} ${dnPts}" fill="var(--signal)" opacity="0.16"/>
        <polyline points="${linePts}" fill="none" stroke="var(--signal)" stroke-width="1.6"/>
        ${[0,6,12,18,23].map(h => `
          <text x="${xs(h)}" y="${H - 4}" text-anchor="middle"
                font-family="var(--mono)" font-size="8" fill="var(--muted-2)" letter-spacing="1.5">${pad2(h)}</text>
        `).join("")}
      `;
      peakOut.textContent = (peak * 1450).toFixed(0) + " MW";
      totOut.textContent = (total * 1450 / 1000).toFixed(1) + " GWh";
    }

    dayBtns.forEach(b => b.addEventListener("click", () => {
      dayBtns.forEach(x => x.classList.remove("on"));
      b.classList.add("on"); day = b.dataset.day; render();
    }));
    tempSl.addEventListener("input", () => {
      $(`label[for=en-temp] .val`, root).textContent = (+tempSl.value).toFixed(0) + " °C";
      render();
    });
    render();
  }

  // ===========================================================================
  // 06  LOGISTICS — route optimization (TSP-ish)
  // ===========================================================================
  function initRoute(root) {
    const svg = $("#log-svg", root);
    const stopsSl = $("#log-stops", root);
    const optBtn = $("#log-opt", root);
    const distOut = $("#log-dist", root);
    const timeOut = $("#log-time", root);
    const savedOut = $("#log-saved", root);

    const W = 360, H = 220;
    let stops = [], order = [], optimized = false;

    function gen() {
      const n = +stopsSl.value;
      const rng = mulberry32(n * 7 + 13);
      stops = []; order = [];
      // depot
      stops.push({ x: W/2, y: H/2, depot: true });
      for (let i = 0; i < n; i++) {
        stops.push({
          x: 30 + rng() * (W - 60),
          y: 24 + rng() * (H - 48)
        });
      }
      order = stops.map((_, i) => i);
      optimized = false;
      render();
    }

    function distance(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
    function pathLen(ord) {
      let d = 0;
      for (let i = 0; i < ord.length; i++) d += distance(stops[ord[i]], stops[ord[(i+1) % ord.length]]);
      return d;
    }

    function optimize() {
      // nearest neighbour from depot, then 2-opt swaps
      const n = stops.length;
      const visited = new Array(n).fill(false);
      visited[0] = true;
      const ord = [0];
      let cur = 0;
      for (let i = 1; i < n; i++) {
        let best = -1, bestD = 1e9;
        for (let j = 0; j < n; j++) {
          if (!visited[j]) {
            const d = distance(stops[cur], stops[j]);
            if (d < bestD) { bestD = d; best = j; }
          }
        }
        visited[best] = true; ord.push(best); cur = best;
      }
      // 2-opt
      let improved = true, guard = 0;
      while (improved && guard++ < 30) {
        improved = false;
        for (let i = 1; i < ord.length - 1; i++) {
          for (let k = i + 1; k < ord.length; k++) {
            const newOrd = ord.slice(0, i).concat(ord.slice(i, k + 1).reverse(), ord.slice(k + 1));
            if (pathLen(newOrd) < pathLen(ord) - 0.01) {
              for (let q = 0; q < ord.length; q++) ord[q] = newOrd[q];
              improved = true;
            }
          }
        }
      }
      order = ord;
      optimized = true;
      render(true);
    }

    function render(animate = false) {
      const ord = order;
      const linePts = ord.map(i => `${stops[i].x},${stops[i].y}`).join(" ") +
                      ` ${stops[ord[0]].x},${stops[ord[0]].y}`;
      const dots = stops.map((s, i) => `
        <circle cx="${s.x}" cy="${s.y}" r="${s.depot ? 6 : 3.2}"
                fill="${s.depot ? 'var(--signal)' : 'var(--paper)'}"
                stroke="${s.depot ? 'var(--ink)' : 'none'}" stroke-width="2"/>
        ${s.depot ? `<text x="${s.x}" y="${s.y - 11}" text-anchor="middle"
                font-family="var(--mono)" font-size="8" fill="var(--signal)" letter-spacing="1.5">DEPOT</text>` : ''}
      `).join("");
      const length = pathLen(ord);
      const stroke = optimized ? "var(--signal)" : "var(--muted)";
      const dash = optimized ? "0" : "4 3";

      svg.innerHTML = `
        <polyline points="${linePts}" fill="none" stroke="${stroke}"
                  stroke-width="${optimized ? 1.8 : 1}" stroke-dasharray="${dash}"
                  ${animate ? 'pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" style="animation:draw 1.2s ease forwards"' : ''}/>
        ${dots}
      `;
      // pseudo-baseline
      const naive = pathLen(stops.map((_,i) => i));
      distOut.textContent = (length / 11).toFixed(1) + " km";
      timeOut.textContent = (length / 11 * 2.6).toFixed(0) + " min";
      const saved = optimized ? clamp((naive - length) / naive * 100, 8, 42) : 0;
      savedOut.textContent = saved > 0 ? "−" + saved.toFixed(0) + "%" : "—";
    }

    stopsSl.addEventListener("input", () => {
      $(`label[for=log-stops] .val`, root).textContent = stopsSl.value + " stops";
      gen();
    });
    optBtn.addEventListener("click", optimize);
    gen();
  }

  // ===========================================================================
  // 07  TELECOM — churn (logistic regression vibes)
  // ===========================================================================
  function initChurn(root) {
    const tenure = $("#tc-ten", root);
    const monthly = $("#tc-mon", root);
    const support = $("#tc-sup", root);
    const contract = $("#tc-ctr", root);
    const fiber = $("#tc-fiber", root);
    const probEl = $("#tc-prob", root);
    const dial = $("#tc-dial", root);
    const action = $("#tc-action", root);
    const ev = $("#tc-ev", root);

    function sigmoid(x){ return 1/(1+Math.exp(-x)); }

    function score() {
      const ten = +tenure.value, mon = +monthly.value, sup = +support.value;
      const ctr = contract.value, fib = fiber.classList.contains("on") ? 1 : 0;
      // weights (toy)
      const z =
          - (ten - 24) * 0.04
          + (mon - 60) * 0.018
          + sup * 0.45
          + (ctr === "monthly" ? 1.1 : ctr === "yearly" ? -0.4 : -1.6)
          + fib * 0.45
          - 1.1;
      const p = clamp(sigmoid(z), 0.01, 0.97);
      probEl.textContent = (p * 100).toFixed(1) + "%";
      const len = 220;
      const fill = $(".dial-fill", dial);
      if (fill) fill.style.strokeDasharray = `${p*len} ${len}`;

      let label, cls;
      if (p < 0.25) { label = "RETAIN — NO ACTION"; cls = "good"; }
      else if (p < 0.6) { label = "OFFER VALUE BUNDLE"; cls = ""; }
      else { label = "PRIORITY SAVE QUEUE"; cls = "bad"; }
      action.textContent = label;
      action.style.background = cls === "good" ? "var(--good)" : cls === "bad" ? "var(--bad)" : "var(--signal)";
      action.style.color = "var(--ink)";
      action.style.borderColor = "transparent";

      // estimated lifetime value impact
      const baseLTV = mon * 24;
      const evImpact = baseLTV * p * 0.9;
      ev.textContent = "£" + fmt(evImpact, 0);
    }

    [tenure, monthly, support].forEach(el => el.addEventListener("input", () => {
      const lab = $(`label[for=${el.id}] .val`, root);
      if (el.id === "tc-ten") lab.textContent = el.value + " mo";
      if (el.id === "tc-mon") lab.textContent = "£" + el.value;
      if (el.id === "tc-sup") lab.textContent = el.value + " calls";
      score();
    }));
    contract.addEventListener("change", score);
    fiber.addEventListener("click", () => { fiber.classList.toggle("on"); score(); });
    score();
  }

  // ===========================================================================
  // 08  INSURANCE — claims triage (gradient boosting)
  // ===========================================================================
  function initClaims(root) {
    const text = $("#cl-text", root);
    const photoSlider = $("#cl-photo", root);
    const claim = $("#cl-amount", root);
    const sevOut = $("#cl-sev", root);
    const fraudOut = $("#cl-fraud", root);
    const lane = $("#cl-lane", root);
    const tags = $("#cl-tags", root);

    const KW = {
      "rear-end": [0.2, 0.05, "auto"], "rear ended": [0.2, 0.05, "auto"],
      "totalled": [0.85, 0.2, "auto"], "totaled": [0.85, 0.2, "auto"],
      "fire": [0.7, 0.3, "property"], "flood": [0.6, 0.15, "property"],
      "water": [0.4, 0.1, "property"], "theft": [0.5, 0.55, "property"],
      "stolen": [0.5, 0.6, "property"], "whiplash": [0.3, 0.4, "auto"],
      "hospital": [0.6, 0.15, "medical"], "ambulance": [0.55, 0.1, "medical"],
      "windshield": [0.1, 0.05, "auto"], "hail": [0.35, 0.1, "auto"],
      "broken": [0.3, 0.1, "general"], "crashed": [0.6, 0.2, "auto"]
    };

    function analyze() {
      const t = (text.value || "").toLowerCase();
      let sev = 0.1, fraud = 0.05;
      const found = new Set();
      Object.entries(KW).forEach(([k, [s, f, c]]) => {
        if (t.includes(k)) { sev = Math.max(sev, s); fraud = Math.max(fraud, f); found.add(k); }
      });
      const photoQ = +photoSlider.value / 100;
      const amt = +claim.value;
      sev = clamp(sev + (amt - 1000) / 50000 * 0.4, 0.05, 0.98);
      fraud = clamp(fraud + (1 - photoQ) * 0.25 + (amt > 8000 ? 0.15 : 0), 0.02, 0.96);

      sevOut.textContent = (sev * 100).toFixed(0);
      fraudOut.textContent = (fraud * 100).toFixed(0);

      let label, cls;
      if (fraud > 0.55) { label = "ROUTE → SIU"; cls = "bad"; }
      else if (sev < 0.3 && fraud < 0.2) { label = "FAST-TRACK AUTO-PAY"; cls = "good"; }
      else if (sev > 0.65) { label = "ASSIGN SENIOR ADJUSTER"; cls = ""; }
      else { label = "STANDARD QUEUE"; cls = ""; }
      lane.textContent = label;
      lane.style.background = cls === "good" ? "var(--good)" : cls === "bad" ? "var(--bad)" : "var(--signal)";
      lane.style.color = "var(--ink)"; lane.style.borderColor = "transparent";

      tags.innerHTML = Array.from(found).slice(0, 5).map(k =>
        `<span class="chip">#${k.replace(/\s+/g,"-")}</span>`
      ).join("") || `<span style="color:var(--muted-2); font-family:var(--mono); font-size:10px; letter-spacing:0.18em; text-transform:uppercase">— no signals yet —</span>`;
    }

    text.addEventListener("input", analyze);
    photoSlider.addEventListener("input", () => {
      $("label[for=cl-photo] .val", root).textContent = photoSlider.value + "%";
      analyze();
    });
    claim.addEventListener("input", () => {
      $("label[for=cl-amount] .val", root).textContent = "£" + fmt(+claim.value);
      analyze();
    });
    analyze();
  }

  // ===========================================================================
  // 09  MARKETING — LTV / segmentation (k-means scatter)
  // ===========================================================================
  function initLTV(root) {
    const svg = $("#mk-svg", root);
    const kSel = $("#mk-k", root);
    const out = $("#mk-out", root);
    const W = 360, H = 200;

    function gen(k) {
      const rng = mulberry32(k * 13);
      const pts = [];
      const centers = [];
      for (let i = 0; i < k; i++) {
        centers.push([20 + rng() * (W - 40), 20 + rng() * (H - 40)]);
      }
      for (let i = 0; i < 80; i++) {
        const c = centers[i % k];
        pts.push([
          clamp(c[0] + (rng() - 0.5) * 50, 10, W - 10),
          clamp(c[1] + (rng() - 0.5) * 36, 10, H - 10),
          i % k
        ]);
      }
      return { pts, centers };
    }

    const palette = ["var(--signal)", "#7ab8ff", "#a6e2c4", "#f7c4a3", "#c8a3f7"];
    const labels = ["High-value loyalists", "At-risk regulars", "Bargain hunters", "New explorers", "Dormant"];

    function render() {
      const k = +kSel.value;
      const { pts, centers } = gen(k);
      svg.innerHTML = `
        <line x1="20" y1="${H-20}" x2="${W-10}" y2="${H-20}" stroke="var(--rule-strong)"/>
        <line x1="20" y1="10" x2="20" y2="${H-20}" stroke="var(--rule-strong)"/>
        <text x="${W-10}" y="${H-6}" text-anchor="end"
              font-family="var(--mono)" font-size="8" fill="var(--muted-2)" letter-spacing="2">FREQUENCY →</text>
        <text x="22" y="14"
              font-family="var(--mono)" font-size="8" fill="var(--muted-2)" letter-spacing="2">↑ MONETARY</text>
        ${pts.map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="3" fill="${palette[p[2]]}" opacity="0.85"/>`).join("")}
        ${centers.map((c, i) => `
          <circle cx="${c[0]}" cy="${c[1]}" r="9" fill="none" stroke="${palette[i]}" stroke-width="1.5"/>
          <circle cx="${c[0]}" cy="${c[1]}" r="2" fill="${palette[i]}"/>
        `).join("")}
      `;
      out.innerHTML = Array.from({length: k}).map((_, i) =>
        `<div class="seg-row">
           <span class="seg-dot" style="background:${palette[i]}"></span>
           <span class="seg-name">${labels[i]}</span>
           <span class="seg-ltv">£${fmt(800 + i * 420 + (i===0?2400:0))}</span>
         </div>`
      ).join("");
    }
    kSel.addEventListener("change", render);
    render();
  }

  // ===========================================================================
  // 10  AGRICULTURE — crop yield / disease (vision + tabular)
  // ===========================================================================
  function initAgri(root) {
    const rain = $("#ag-rain", root);
    const tempo = $("#ag-temp", root);
    const ndvi = $("#ag-ndvi", root);
    const yieldOut = $("#ag-yield", root);
    const riskOut = $("#ag-risk", root);
    const fieldGrid = $("#ag-field", root);

    function render() {
      const r = +rain.value, t = +tempo.value, n = +ndvi.value / 100;
      const cells = [];
      const W = 12, H = 6;
      const rng = mulberry32(Math.round(r + t * 7 + n * 100));
      for (let i = 0; i < W * H; i++) {
        const v = clamp(n + (rng() - 0.5) * 0.4 + (Math.abs(t - 22) > 8 ? -0.15 : 0), 0.02, 1);
        cells.push(v);
      }
      fieldGrid.innerHTML = cells.map(v => {
        const hue = lerp(20, 145, v); // red→green
        const a = 0.35 + v * 0.6;
        return `<div class="ag-cell" style="background:oklch(72% 0.14 ${hue} / ${a})"></div>`;
      }).join("");
      const avg = cells.reduce((a,b)=>a+b,0) / cells.length;
      const baseT = 6.8;
      const yieldT = clamp(baseT * avg * (r > 60 && r < 180 ? 1.05 : 0.85) * (t > 28 ? 0.9 : 1), 1.2, 9.5);
      yieldOut.textContent = yieldT.toFixed(2) + " t/ha";
      const risk = clamp((1 - avg) * 100 + (r > 220 ? 18 : 0) + (t > 30 ? 10 : 0), 4, 92);
      riskOut.textContent = risk.toFixed(0) + "%";
    }

    [rain, tempo, ndvi].forEach(el => el.addEventListener("input", () => {
      const lab = $(`label[for=${el.id}] .val`, root);
      if (el.id === "ag-rain") lab.textContent = el.value + " mm";
      if (el.id === "ag-temp") lab.textContent = el.value + " °C";
      if (el.id === "ag-ndvi") lab.textContent = (+el.value / 100).toFixed(2);
      render();
    }));
    render();
  }

  // ===========================================================================
  // 11  FINANCE — credit risk / underwriting (waterfall SHAP)
  // ===========================================================================
  function initCredit(root) {
    const income = $("#cr-inc", root);
    const debt = $("#cr-debt", root);
    const utilSlider = $("#cr-util", root);
    const history = $("#cr-hist", root);
    const dq = $("#cr-dq", root);
    const scoreOut = $("#cr-score", root);
    const tier = $("#cr-tier", root);
    const factorsBox = $("#cr-factors", root);
    const apr = $("#cr-apr", root);

    function calc() {
      const inc = +income.value, d = +debt.value, u = +utilSlider.value;
      const h = +history.value, delinq = +dq.value;
      // contributions (toy)
      const contrib = [
        ["Income vs debt", clamp((inc - d * 5) / 1000, -80, 80)],
        ["Credit utilisation", clamp((50 - u) * 1.4, -70, 70)],
        ["History length", clamp((h - 24) * 0.9, -40, 40)],
        ["Delinquencies (24m)", -delinq * 22],
        ["Base score", 580]
      ];
      const total = clamp(contrib.reduce((a,c)=>a+c[1],0), 300, 850);
      scoreOut.textContent = Math.round(total);
      const t = total > 740 ? ["A — PRIME", "good"] : total > 670 ? ["B — NEAR-PRIME", ""] : total > 580 ? ["C — SUBPRIME", ""] : ["D — DECLINE", "bad"];
      tier.textContent = t[0];
      tier.style.background = t[1] === "good" ? "var(--good)" : t[1] === "bad" ? "var(--bad)" : "var(--signal)";
      tier.style.color = "var(--ink)"; tier.style.borderColor = "transparent";
      apr.textContent = (lerp(22, 5.4, (total - 300) / 550)).toFixed(1) + "%";

      // bars
      const max = 90;
      factorsBox.innerHTML = contrib.slice(0, 4).map(([k, v]) => {
        const w = clamp(Math.abs(v), 4, max);
        const pos = v >= 0;
        return `<div class="wf-row">
          <div class="wf-label">${k}</div>
          <div class="wf-bar">
            <div class="wf-axis"></div>
            <div class="wf-fill ${pos ? 'pos' : 'neg'}" style="width:${w/max*48}%; ${pos ? 'left:50%' : 'right:50%'}"></div>
          </div>
          <div class="wf-val ${pos ? 'pos' : 'neg'}">${pos ? "+" : ""}${Math.round(v)}</div>
        </div>`;
      }).join("");
    }
    [income, debt, utilSlider, history, dq].forEach(el => el.addEventListener("input", () => {
      const lab = $(`label[for=${el.id}] .val`, root);
      if (el.id === "cr-inc") lab.textContent = "£" + fmt(+el.value);
      if (el.id === "cr-debt") lab.textContent = "£" + fmt(+el.value);
      if (el.id === "cr-util") lab.textContent = el.value + "%";
      if (el.id === "cr-hist") lab.textContent = el.value + " mo";
      if (el.id === "cr-dq") lab.textContent = el.value;
      calc();
    }));
    calc();
  }

  // ===========================================================================
  // 12  HEALTHCARE — patient risk timeline (transformer-style)
  // ===========================================================================
  function initPatient(root) {
    const age = $("#pt-age", root);
    const bmi = $("#pt-bmi", root);
    const bp = $("#pt-bp", root);
    const a1c = $("#pt-a1c", root);
    const smoker = $("#pt-smoker", root);
    const out = $("#pt-out", root);
    const svg = $("#pt-svg", root);
    const action = $("#pt-action", root);
    const W = 360, H = 140;

    function risk() {
      const a = +age.value, b = +bmi.value, sys = +bp.value, c = +a1c.value;
      const sm = smoker.classList.contains("on") ? 1 : 0;
      // 5-year cardio + diabetes risk surfaces
      const points = [];
      for (let y = 0; y <= 5; y++) {
        const r = clamp(
          0.04
          + (a - 30) * 0.004
          + (b - 24) * 0.012
          + (sys - 120) * 0.0035
          + (c - 5.5) * 0.05
          + sm * 0.07
          + y * 0.018, 0.02, 0.92);
        points.push(r);
      }
      const xs = i => 20 + (i / 5) * (W - 40);
      const ys = v => H - 16 - v * (H - 30);
      const linePts = points.map((v,i) => `${xs(i)},${ys(v)}`).join(" ");
      const upPts = points.map((v,i) => `${xs(i)},${ys(v + 0.06 + i*0.005)}`).join(" ");
      const dnPts = points.map((v,i) => `${xs(i)},${ys(v - 0.06 - i*0.005)}`).reverse().join(" ");

      svg.innerHTML = `
        <polygon points="${upPts} ${dnPts}" fill="var(--signal)" opacity="0.16"/>
        <polyline points="${linePts}" fill="none" stroke="var(--signal)" stroke-width="1.6"/>
        ${points.map((v, i) => `<circle cx="${xs(i)}" cy="${ys(v)}" r="2.4" fill="var(--paper)"/>`).join("")}
        ${[0,1,2,3,4,5].map(i => `<text x="${xs(i)}" y="${H-2}" text-anchor="middle"
                font-family="var(--mono)" font-size="8" fill="var(--muted-2)" letter-spacing="2">Y+${i}</text>`).join("")}
      `;
      const r5 = points[5];
      out.textContent = (r5 * 100).toFixed(1) + "%";
      const lab = r5 > 0.4 ? ["INTENSIVE PATHWAY", "bad"]
                : r5 > 0.18 ? ["ENROLL CARE PROGRAM", ""]
                : ["ROUTINE FOLLOW-UP", "good"];
      action.textContent = lab[0];
      action.style.background = lab[1] === "good" ? "var(--good)" : lab[1] === "bad" ? "var(--bad)" : "var(--signal)";
      action.style.color = "var(--ink)"; action.style.borderColor = "transparent";
    }
    [age, bmi, bp, a1c].forEach(el => el.addEventListener("input", () => {
      const lab = $(`label[for=${el.id}] .val`, root);
      if (el.id === "pt-age") lab.textContent = el.value + " yr";
      if (el.id === "pt-bmi") lab.textContent = (+el.value).toFixed(1);
      if (el.id === "pt-bp") lab.textContent = el.value + " mmHg";
      if (el.id === "pt-a1c") lab.textContent = (+el.value).toFixed(1) + "%";
      risk();
    }));
    smoker.addEventListener("click", () => { smoker.classList.toggle("on"); risk(); });
    risk();
  }

  // ===========================================================================
  // ENTRY
  // ===========================================================================
  const inits = {
    "demo-fraud": initFraud,
    "demo-xray": initXray,
    "demo-recs": initRecs,
    "demo-rul": initRUL,
    "demo-load": initLoad,
    "demo-route": initRoute,
    "demo-churn": initChurn,
    "demo-claims": initClaims,
    "demo-ltv": initLTV,
    "demo-agri": initAgri,
    "demo-credit": initCredit,
    "demo-patient": initPatient
  };

  function boot() {
    Object.entries(inits).forEach(([id, fn]) => {
      const el = document.getElementById(id);
      if (el) try { fn(el); } catch (e) { console.error(id, e); }
    });

    // scroll reveals
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    document.querySelectorAll(".reveal").forEach(el => io.observe(el));

    // nav scrolled state
    const nav = document.querySelector(".nav");
    const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // hero "data ticker"
    const tickHost = document.querySelector(".hero-tickers");
    if (tickHost) {
      const lines = [
        "loss 0.0142", "AUC 0.94", "epoch 47/120", "f1 0.91",
        "p99 28ms", "drift 0.06", "RMSE 1.12", "AUPRC 0.89",
        "lr 3e-4", "tokens 2.4M", "MAPE 4.1%", "recall 0.93"
      ];
      lines.forEach((l, i) => {
        const t = document.createElement("div");
        t.className = "tick";
        t.textContent = l;
        const angle = (i / lines.length) * Math.PI * 2;
        t.style.left = `${50 + Math.cos(angle) * 46}%`;
        t.style.top = `${50 + Math.sin(angle) * 46}%`;
        t.style.animationDelay = (i * 0.6) + "s";
        tickHost.appendChild(t);
      });
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
