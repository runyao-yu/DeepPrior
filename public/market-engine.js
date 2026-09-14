// ES module (loaded via dynamic import from site-content-bootstrap.js before the WebGL bundle starts,
// so the section has its final height when scroll triggers are measured).

  const MOUNT_SELECTOR = "[data-market-engine]";
  const DATA_URL = "/data/market-engine.json";
  const NS = "http://www.w3.org/2000/svg";

  const INK = "#f4f5f5";
  const MUTED = "rgba(244,245,245,0.62)";
  const FAINT = "rgba(244,245,245,0.38)";
  const GRID = "rgba(244,245,245,0.16)";
  const BAND = "rgba(244,245,245,0.13)";
  const BUY = "#7fb0ff";
  const SELL = "#ff7d92";

  const MARKETS = [
    { key: "dayAhead", label: "Day-ahead" },
    { key: "intraday", label: "Intraday" },
    { key: "balancing", label: "Balancing" },
  ];

  /* ------------------------------------------------------------------ helpers */
  function h(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (typeof text === "string") node.textContent = text;
    return node;
  }
  function el(parent, tag, attrs) {
    const node = document.createElementNS(NS, tag);
    for (const k in attrs) if (attrs[k] !== undefined && attrs[k] !== null) node.setAttribute(k, attrs[k]);
    parent.appendChild(node);
    return node;
  }
  function txt(parent, attrs, content) {
    const node = el(parent, "text", attrs);
    node.textContent = content;
    return node;
  }
  const ms = (t) => Date.parse(t);
  const hhmm = (t) => t.slice(11, 16); // wall-clock time as written in the data file
  const dayLabel = (t) => {
    // use the calendar date written in the data file (its own timezone), not the viewer's
    const d = new Date(Date.UTC(Number(t.slice(0, 4)), Number(t.slice(5, 7)) - 1, Number(t.slice(8, 10))));
    return d.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short", timeZone: "UTC" }).toUpperCase();
  };
  const fmtPrice = (v) => (Math.round(v * 10) / 10).toLocaleString("en-GB", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const fmtMW = (v) => (v >= 10000 ? `${(v / 1000).toFixed(1)} GW` : `${Math.round(v).toLocaleString("en-GB")} MW`);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  function niceTicks(min, max, count) {
    const span = max - min || 1;
    const rough = span / Math.max(1, count);
    const pow = Math.pow(10, Math.floor(Math.log10(rough)));
    const candidates = [1, 2, 2.5, 5, 10].map((m) => m * pow);
    const step = candidates.find((c) => span / c <= count) || candidates[candidates.length - 1];
    const ticks = [];
    for (let v = Math.ceil(min / step) * step; v <= max + 1e-9; v += step) ticks.push(Number(v.toFixed(6)));
    return ticks;
  }
  function extent(values, pad) {
    let min = Infinity, max = -Infinity;
    values.forEach((v) => { if (v < min) min = v; if (v > max) max = v; });
    const p = (max - min || 1) * (pad ?? 0.12);
    return [min - p, max + p];
  }
  function argMin(arr, key) { let b = 0; arr.forEach((d, i) => { if (d[key] < arr[b][key]) b = i; }); return b; }
  function argMax(arr, key) { let b = 0; arr.forEach((d, i) => { if (d[key] > arr[b][key]) b = i; }); return b; }
  const smoothPath = (pts) => pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join("");
  const areaPath = (top, bottom) => smoothPath(top) + bottom.slice().reverse().map((p) => `L${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join("") + "Z";

  /* ------------------------------------------------------------------ tooltip */
  function attachTooltip(container) {
    const tip = h("div", "MarketEngine__tip");
    tip.setAttribute("aria-hidden", "true");
    container.appendChild(tip);
    container.addEventListener("pointerover", (event) => {
      const target = event.target.closest("[data-tip]");
      if (!target) return;
      const [label, value] = target.getAttribute("data-tip").split("|");
      tip.replaceChildren(h("b", "", label), document.createTextNode(value));
      const box = container.getBoundingClientRect();
      const r = target.getBoundingClientRect();
      tip.style.left = `${r.left + r.width / 2 - box.left}px`;
      tip.style.top = `${r.top - box.top}px`;
      tip.dataset.show = "true";
    });
    container.addEventListener("pointerout", (event) => {
      if (event.target.closest("[data-tip]")) tip.dataset.show = "false";
    });
  }

  /* ------------------------------------------------------------------ chart primitives */
  function frame(svg, W, H, m) {
    return {
      x0: m.l, x1: W - m.r, y0: m.t, y1: H - m.b,
      sx: (t, t0, t1) => m.l + ((t - t0) / (t1 - t0)) * (W - m.l - m.r),
      sy: (v, v0, v1) => H - m.b - ((v - v0) / (v1 - v0)) * (H - m.t - m.b),
    };
  }
  function yAxis(svg, f, v0, v1, count, format, side) {
    niceTicks(v0, v1, count).forEach((v, i) => {
      const y = f.sy(v, v0, v1);
      el(svg, "line", { x1: f.x0, y1: y, x2: f.x1, y2: y, stroke: GRID, "stroke-width": 0.6, class: "fade", style: `animation-delay:${i * 0.04}s` });
      txt(svg, { x: side === "right" ? f.x1 + 8 : f.x0 - 8, y: y + 3, "font-size": 9, fill: MUTED, "text-anchor": side === "right" ? "start" : "end", class: "fade" }, format ? format(v) : v);
    });
  }
  function floor(svg, f, t0, t1, minorStep, majorEvery, labelFn) {
    // barcode floor: one hairline per interval, taller every `majorEvery`
    el(svg, "line", { x1: f.x0, y1: f.y1, x2: f.x1, y2: f.y1, stroke: GRID, "stroke-width": 0.9, class: "fade" });
    let i = 0;
    for (let t = t0; t <= t1 + 1; t += minorStep, i++) {
      const x = f.sx(t, t0, t1);
      const major = i % majorEvery === 0;
      el(svg, "line", { x1: x, y1: f.y1, x2: x, y2: f.y1 - (major ? 7 : 3.5), stroke: major ? FAINT : GRID, "stroke-width": 0.6, class: "fade", style: `animation-delay:${i * 0.006}s` });
      if (major && labelFn) txt(svg, { x, y: f.y1 + 17, "font-size": 8.5, fill: MUTED, "text-anchor": "middle", "letter-spacing": ".08em", class: "fade" }, labelFn(t));
    }
  }
  function divider(svg, f, x, leftLabel, rightLabel) {
    el(svg, "line", { x1: x, y1: f.y0 - 4, x2: x, y2: f.y1, stroke: INK, "stroke-width": 0.9, "stroke-dasharray": "2 4", opacity: 0.8, class: "fade" });
    txt(svg, { x: x - 8, y: f.y0 + 2, "font-size": 8.5, fill: MUTED, "text-anchor": "end", "letter-spacing": ".14em", class: "fade" }, leftLabel);
    txt(svg, { x: x + 8, y: f.y0 + 2, "font-size": 8.5, fill: INK, "text-anchor": "start", "letter-spacing": ".14em", class: "fade" }, rightLabel);
  }
  function band(svg, top, bottom, fill, delay) {
    el(svg, "path", { d: areaPath(top, bottom), fill: fill || BAND, class: "fade", style: `animation-delay:${delay || 0.2}s` });
  }
  function line(svg, pts, color, width, delay, dash) {
    el(svg, "path", { d: smoothPath(pts), fill: "none", stroke: color, "stroke-width": width, "stroke-dasharray": dash, pathLength: 1, class: "draw", style: `animation-delay:${delay || 0}s`, "stroke-linejoin": "round", "stroke-linecap": "round" });
  }
  function marker(svg, x, y, label, value, place, color, delay) {
    const g = el(svg, "g", {});
    el(g, "circle", { cx: x, cy: y, r: 4.4, fill: color || INK, class: "pop", style: `animation-delay:${delay}s` });
    el(g, "circle", { cx: x, cy: y, r: 8, fill: "none", stroke: color || INK, "stroke-width": 0.7, opacity: 0.6, class: "pop", style: `animation-delay:${delay + 0.05}s` });
    const above = place === "above";
    const t = txt(g, { x, y: above ? y - 16 : y + 22, "font-size": 10, "font-weight": 500, fill: color || INK, "text-anchor": "middle", class: "fade", style: `animation-delay:${delay + 0.2}s` }, value);
    txt(g, { x, y: above ? y - 28 : y + 33, "font-size": 8, fill: MUTED, "text-anchor": "middle", "letter-spacing": ".12em", class: "fade", style: `animation-delay:${delay + 0.2}s` }, label);
    return t;
  }
  function note(svg, W, y, text) {
    txt(svg, { x: W / 2, y, "font-size": 8, fill: FAINT, "text-anchor": "middle", "letter-spacing": ".14em", class: "fade", style: "animation-delay:1s" }, text);
  }

  // phone-width containers get a narrower, taller drawing so labels keep a readable size
  function mainSize(svg) {
    const compact = (svg.parentNode?.clientWidth || 900) < 600;
    return { W: compact ? 520 : 880, H: compact ? 380 : 310, compact };
  }

  /* ------------------------------------------------------------------ day-ahead */
  function renderDayAhead(svg, data) {
    const { W, H, compact } = mainSize(svg);
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    const f = frame(svg, W, H, { l: 46, r: 18, t: 22, b: 46 });
    const hist = data.history, fc = data.forecast;
    const step = 15 * 60 * 1000;
    const t0 = ms(hist[0].t), t1 = ms(fc[fc.length - 1].t) + step;
    const [v0, v1] = extent([...hist.map((d) => d.price), ...fc.map((d) => d.q10), ...fc.map((d) => d.q90)]);
    const sx = (t) => f.sx(t, t0, t1), sy = (v) => f.sy(v, v0, v1);

    yAxis(svg, f, v0, v1, 5, (v) => Math.round(v));
    floor(svg, f, t0, t1, 60 * 60 * 1000, compact ? 12 : 6, (t) => String(Math.round(((t - t0) / 3600000) % 24)).padStart(2, "0") + ":00");
    const split = sx(ms(fc[0].t));
    divider(svg, f, split, compact ? "CLEARED" : dayLabel(hist[0].t) + " · CLEARED", compact ? "FORECAST" : dayLabel(fc[0].t) + " · FORECAST");

    // history: hairline + quarter-hour dots (every 4th dot emphasised)
    const hp = hist.map((d) => [sx(ms(d.t) + step / 2), sy(d.price)]);
    line(svg, hp, INK, 1.1, 0.1);
    hist.forEach((d, i) => {
      if (i % 4 !== 0) return;
      el(svg, "circle", { cx: hp[i][0], cy: hp[i][1], r: 1.7, fill: INK, class: "pop", style: `animation-delay:${0.2 + i * 0.006}s`, "data-tip": `${hhmm(d.t)} · cleared|${fmtPrice(d.price)} €/MWh` });
    });

    // forecast: P10–P90 band + median
    const top = fc.map((d) => [sx(ms(d.t) + step / 2), sy(d.q90)]);
    const bot = fc.map((d) => [sx(ms(d.t) + step / 2), sy(d.q10)]);
    const mid = fc.map((d) => [sx(ms(d.t) + step / 2), sy(d.q50)]);
    band(svg, top, bot, BAND, 0.5);
    line(svg, top, FAINT, 0.6, 0.5);
    line(svg, bot, FAINT, 0.6, 0.5);
    line(svg, mid, INK, 1.4, 0.6);
    fc.forEach((d, i) => {
      if (i % 4 !== 2) return;
      el(svg, "circle", { cx: mid[i][0], cy: mid[i][1], r: 3.2, fill: "transparent", "data-tip": `${hhmm(d.t)} · forecast|P50 ${fmtPrice(d.q50)} · P10 ${fmtPrice(d.q10)} · P90 ${fmtPrice(d.q90)}` });
    });

    const iMin = argMin(fc, "q50"), iMax = argMax(fc, "q50");
    marker(svg, mid[iMin][0], mid[iMin][1], `BUY · ${hhmm(fc[iMin].t)}`, fmtPrice(fc[iMin].q50), "below", BUY, 1.1);
    marker(svg, mid[iMax][0], mid[iMax][1], `SELL · ${hhmm(fc[iMax].t)}`, fmtPrice(fc[iMax].q50), "above", SELL, 1.2);
    txt(svg, { x: f.x0 - 8, y: f.y0 - 8, "font-size": 8, fill: FAINT, "text-anchor": "end", "letter-spacing": ".1em", class: "fade" }, "€/MWh");
    note(svg, W, H - 6, compact ? "DOT = ONE HOUR · BAND = P10–P90 · TIME →" : "ONE DOT = ONE HOUR OF CLEARED PRICES · BAND = P10–P90 OF THE QUARTER-HOURLY FORECAST · TIME →");
  }

  /* ------------------------------------------------------------------ intraday */
  function renderIntraday(svg, data, now) {
    const { W, H, compact } = mainSize(svg);
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    const f = frame(svg, W, H, { l: 46, r: 18, t: 22, b: 46 });
    const trades = data.trades, buy = data.forecast.buy, sell = data.forecast.sell;
    const step = 15 * 60 * 1000;
    const t0 = now - 3 * 3600 * 1000, t1 = now + 3 * 3600 * 1000;
    const [v0, v1] = extent([...trades.map((d) => d.price), ...buy.map((d) => d.q10), ...sell.map((d) => d.q90)]);
    const sx = (t) => f.sx(t, t0, t1), sy = (v) => f.sy(v, v0, v1);

    yAxis(svg, f, v0, v1, 5, (v) => Math.round(v));
    floor(svg, f, t0, t1, step, compact ? 4 : 2, (t) => new Date(t).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Berlin" }));
    divider(svg, f, sx(now), compact ? "RAW TRADES" : "LAST 3 H · RAW TRADES", compact ? "VWAP FORECAST" : "NEXT 3 H · VWAP FORECAST");

    // raw trades: area encodes volume (sqrt), colour encodes side
    trades.forEach((d, i) => {
      const color = d.side === "buy" ? BUY : SELL;
      el(svg, "circle", { cx: sx(ms(d.t)), cy: sy(d.price), r: 1.8 + Math.sqrt(d.volume) * 1.6, fill: color, "fill-opacity": 0.32, stroke: color, "stroke-width": 0.8, "stroke-opacity": 0.85, class: "pop", style: `animation-delay:${0.1 + (i % 50) * 0.012}s`, "data-tip": `${hhmm(d.t)} · ${d.side.toUpperCase()} ${d.volume} MW|${fmtPrice(d.price)} €/MWh` });
    });

    // VWAP forecast: P10–P90 whiskers + median dots, buy left / sell right of the interval centre
    const drawSide = (arr, color, offset, label) => {
      const pts = arr.map((d) => [sx(ms(d.t) + step / 2) + offset, sy(d.q50)]);
      line(svg, pts, color, 0.8, 0.5, "1.5 3");
      arr.forEach((d, i) => {
        const x = pts[i][0];
        el(svg, "line", { x1: x, y1: sy(d.q10), x2: x, y2: sy(d.q90), stroke: color, "stroke-width": 1, "stroke-linecap": "round", opacity: 0.85, class: "fade", style: `animation-delay:${0.6 + i * 0.05}s` });
        el(svg, "line", { x1: x - 3, y1: sy(d.q10), x2: x + 3, y2: sy(d.q10), stroke: color, "stroke-width": 1, opacity: 0.7, class: "fade", style: `animation-delay:${0.6 + i * 0.05}s` });
        el(svg, "line", { x1: x - 3, y1: sy(d.q90), x2: x + 3, y2: sy(d.q90), stroke: color, "stroke-width": 1, opacity: 0.7, class: "fade", style: `animation-delay:${0.6 + i * 0.05}s` });
        el(svg, "circle", { cx: x, cy: pts[i][1], r: 3.4, fill: color, class: "pop", style: `animation-delay:${0.7 + i * 0.05}s`, "data-tip": `${hhmm(d.t)} · ${label} VWAP|P50 ${fmtPrice(d.q50)} · P10 ${fmtPrice(d.q10)} · P90 ${fmtPrice(d.q90)}` });
      });
      return pts;
    };
    const bp = drawSide(buy, BUY, -4, "BUY");
    const sp = drawSide(sell, SELL, 4, "SELL");
    const iMin = argMin(buy, "q50"), iMax = argMax(sell, "q50");
    marker(svg, bp[iMin][0], bp[iMin][1], `BUY · ${hhmm(buy[iMin].t)}`, fmtPrice(buy[iMin].q50), "below", BUY, 1.3);
    marker(svg, sp[iMax][0], sp[iMax][1], `SELL · ${hhmm(sell[iMax].t)}`, fmtPrice(sell[iMax].q50), "above", SELL, 1.4);
    txt(svg, { x: f.x0 - 8, y: f.y0 - 8, "font-size": 8, fill: FAINT, "text-anchor": "end", "letter-spacing": ".1em", class: "fade" }, "€/MWh");
    note(svg, W, H - 6, compact ? "CIRCLE = TRADE · AREA = VOLUME · WHISKER = P10–P90" : "ONE CIRCLE = ONE TRADE · AREA = TRADED VOLUME · ONE WHISKER = ONE 15-MIN VWAP WITH P10–P90 · TIME →");
  }

  /* ------------------------------------------------------------------ balancing */
  function renderBalancing(svg, data) {
    const { W, H, compact } = mainSize(svg);
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    const f = frame(svg, W, H, { l: 46, r: 52, t: 22, b: 46 });
    const hist = data.history, fc = data.forecast;
    const step = 15 * 60 * 1000;
    const t0 = ms(hist[0].t), t1 = ms(fc[fc.length - 1].t) + step;
    const [v0, v1] = extent([...hist.map((d) => d.price), ...fc.map((d) => d.q10), ...fc.map((d) => d.q90)], 0.16);
    const imbMax = Math.max(...hist.map((d) => Math.abs(d.imbalance))) * 1.15;
    const sx = (t) => f.sx(t, t0, t1), sy = (v) => f.sy(v, v0, v1);
    const zeroY = (f.y0 + f.y1) / 2;
    const syImb = (v) => zeroY - (v / imbMax) * (f.y1 - f.y0) / 2;

    yAxis(svg, f, v0, v1, 5, (v) => Math.round(v));
    floor(svg, f, t0, t1, step, compact ? 4 : 2, (t) => new Date(t).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Berlin" }));
    const split = sx(ms(fc[0].t));
    divider(svg, f, split, compact ? "SETTLED" : "LAST 3 H · SETTLED", compact ? "FORECAST" : "NEXT 3 H · FORECAST");

    // system imbalance bars (right axis, MW), left half only
    const slot = sx(t0 + step) - sx(t0);
    el(svg, "line", { x1: f.x0, y1: zeroY, x2: split, y2: zeroY, stroke: FAINT, "stroke-width": 0.6, "stroke-dasharray": "1 3", class: "fade" });
    hist.forEach((d, i) => {
      const x = sx(ms(d.t)) + slot * 0.2, w = slot * 0.6;
      const y = syImb(d.imbalance);
      const short = d.imbalance < 0;
      el(svg, "rect", { x, y: Math.min(y, zeroY), width: w, height: Math.abs(zeroY - y), rx: 2, fill: short ? SELL : BUY, "fill-opacity": 0.28, stroke: short ? SELL : BUY, "stroke-opacity": 0.55, "stroke-width": 0.6, class: "grow", style: `animation-delay:${0.1 + i * 0.05}s; transform-origin: ${x + w / 2}px ${zeroY}px`, "data-tip": `${hhmm(d.t)} · system ${short ? "short" : "long"}|${Math.round(d.imbalance)} MW imbalance · ${fmtPrice(d.price)} €/MWh` });
    });
    [imbMax, 0, -imbMax].forEach((v) => {
      txt(svg, { x: f.x1 + 8, y: syImb(v) + 3, "font-size": 8.5, fill: MUTED, class: "fade" }, `${v > 0 ? "+" : ""}${Math.round(v / 100) * 100} MW`);
    });
    txt(svg, { x: f.x1 + 8, y: f.y0 - 8, "font-size": 8, fill: FAINT, "letter-spacing": ".1em", class: "fade" }, "IMBALANCE");

    // settled balancing price
    const hp = hist.map((d) => [sx(ms(d.t) + step / 2), sy(d.price)]);
    line(svg, hp, INK, 1.2, 0.2);
    hist.forEach((d, i) => el(svg, "circle", { cx: hp[i][0], cy: hp[i][1], r: 2.4, fill: INK, class: "pop", style: `animation-delay:${0.3 + i * 0.04}s`, "data-tip": `${hhmm(d.t)} · settled|${fmtPrice(d.price)} €/MWh` }));

    // forecast band + median
    const top = fc.map((d) => [sx(ms(d.t) + step / 2), sy(d.q90)]);
    const bot = fc.map((d) => [sx(ms(d.t) + step / 2), sy(d.q10)]);
    const mid = fc.map((d) => [sx(ms(d.t) + step / 2), sy(d.q50)]);
    band(svg, top, bot, BAND, 0.6);
    line(svg, top, FAINT, 0.6, 0.6);
    line(svg, bot, FAINT, 0.6, 0.6);
    line(svg, mid, INK, 1.4, 0.7);
    fc.forEach((d, i) => el(svg, "circle", { cx: mid[i][0], cy: mid[i][1], r: 2.6, fill: INK, class: "pop", style: `animation-delay:${0.8 + i * 0.04}s`, "data-tip": `${hhmm(d.t)} · forecast|P50 ${fmtPrice(d.q50)} · P10 ${fmtPrice(d.q10)} · P90 ${fmtPrice(d.q90)}` }));

    const iMin = argMin(fc, "q50"), iMax = argMax(fc, "q50");
    marker(svg, mid[iMin][0], mid[iMin][1], `BUY · ${hhmm(fc[iMin].t)}`, fmtPrice(fc[iMin].q50), "below", BUY, 1.3);
    marker(svg, mid[iMax][0], mid[iMax][1], `SELL · ${hhmm(fc[iMax].t)}`, fmtPrice(fc[iMax].q50), "above", SELL, 1.4);
    txt(svg, { x: f.x0 - 8, y: f.y0 - 8, "font-size": 8, fill: FAINT, "text-anchor": "end", "letter-spacing": ".1em", class: "fade" }, "€/MWh");
    note(svg, W, H - 6, compact ? "LINE = PRICE · BARS = IMBALANCE · BAND = P10–P90" : "LINE = BALANCING PRICE · BARS = SYSTEM IMBALANCE (RED SHORT / BLUE LONG) · BAND = P10–P90 · TIME →");
  }

  /* ------------------------------------------------------------------ generation */
  function renderGeneration(svg, series, kind) {
    const W = 420, H = 210;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    const f = frame(svg, W, H, { l: 40, r: 12, t: 16, b: 34 });
    const step = 15 * 60 * 1000;
    const t0 = ms(series[0].t), t1 = ms(series[series.length - 1].t) + step;
    const [, vMax] = extent(series.map((d) => d.q90), 0.08);
    const v0 = 0, v1 = vMax;
    const sx = (t) => f.sx(t, t0, t1), sy = (v) => f.sy(v, v0, v1);

    yAxis(svg, f, v0, v1, 4, (v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : Math.round(v)));
    floor(svg, f, t0, t1, 60 * 60 * 1000, 6, (t) => new Date(t).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Berlin" }));

    // hairline area: one hairline per quarter hour from the floor to the median
    series.forEach((d, i) => {
      const x = sx(ms(d.t) + step / 2);
      el(svg, "line", { x1: x, y1: f.y1, x2: x, y2: sy(d.q50), stroke: INK, "stroke-width": 0.55, opacity: 0.22 + 0.22 * ((i * 7) % 5) / 4, class: "fade", style: `animation-delay:${i * 0.008}s` });
    });
    const top = series.map((d) => [sx(ms(d.t) + step / 2), sy(d.q90)]);
    const bot = series.map((d) => [sx(ms(d.t) + step / 2), sy(d.q10)]);
    const mid = series.map((d) => [sx(ms(d.t) + step / 2), sy(d.q50)]);
    band(svg, top, bot, BAND, 0.4);
    line(svg, mid, INK, 1.2, 0.3);
    series.forEach((d, i) => {
      if (i % 4 !== 2) return;
      el(svg, "circle", { cx: mid[i][0], cy: mid[i][1], r: 4, fill: "transparent", "data-tip": `${hhmm(d.t)} · ${kind}|P50 ${fmtMW(d.q50)} · P10 ${fmtMW(d.q10)} · P90 ${fmtMW(d.q90)}` });
    });
    const iMax = argMax(series, "q50");
    el(svg, "circle", { cx: mid[iMax][0], cy: mid[iMax][1], r: 3.6, fill: INK, class: "pop", style: "animation-delay:1.1s" });
    txt(svg, { x: clamp(mid[iMax][0], f.x0 + 26, f.x1 - 26), y: mid[iMax][1] - 10, "font-size": 9, "font-weight": 500, fill: INK, "text-anchor": "middle", class: "fade", style: "animation-delay:1.2s" }, `${fmtMW(series[iMax].q50)} · ${hhmm(series[iMax].t)}`);
    txt(svg, { x: f.x0 - 8, y: f.y0 - 6, "font-size": 7.5, fill: FAINT, "text-anchor": "end", "letter-spacing": ".1em", class: "fade" }, "MW");
  }

  /* ------------------------------------------------------------------ section builders */
  function buildStat(value, label) {
    const node = h("div", "MarketEngine__stat");
    node.append(h("span", "MarketEngine__stat_value", value), h("span", "MarketEngine__stat_label", label));
    return node;
  }

  function buildLegend(items) {
    const sub = h("p", "MarketEngine__card_sub");
    items.forEach(([k, label], i) => {
      const dot = h("i");
      dot.dataset.k = k;
      sub.append(dot, document.createTextNode(label + (i < items.length - 1 ? "   ·   " : "")));
    });
    return sub;
  }

  // mean P10–P90 width relative to the median level: > 35 % reads as high uncertainty, < 18 % as low
  function uncertaintyOf(series) {
    const width = series.reduce((sum, d) => sum + (d.q90 - d.q10), 0) / series.length;
    const level = series.reduce((sum, d) => sum + Math.abs(d.q50), 0) / series.length || 1;
    const ratio = width / level;
    const grade = ratio > 0.35 ? "high" : ratio < 0.18 ? "low" : "moderate";
    return { width, ratio, grade };
  }

  function actionsFor(marketKey, data) {
    if (marketKey === "dayAhead") {
      const fc = data.dayAhead.forecast, iMin = argMin(fc, "q50"), iMax = argMax(fc, "q50");
      return { min: fc[iMin], max: fc[iMax], uncertainty: uncertaintyOf(fc), scope: `Delivery day ${dayLabel(fc[0].t)} · quarter-hourly products` };
    }
    if (marketKey === "intraday") {
      const b = data.intraday.forecast.buy, s = data.intraday.forecast.sell, iMin = argMin(b, "q50"), iMax = argMax(s, "q50");
      return { min: b[iMin], max: s[iMax], uncertainty: uncertaintyOf([...b, ...s]), scope: "Next 12 quarter-hour products · side-specific VWAP" };
    }
    const fc = data.balancing.forecast, iMin = argMin(fc, "q50"), iMax = argMax(fc, "q50");
    return { min: fc[iMin], max: fc[iMax], uncertainty: uncertaintyOf(fc), scope: "Next 12 imbalance settlement periods" };
  }

  function buildActions(marketKey, data) {
    const card = h("aside", "MarketEngine__card MarketEngine__actions");
    card.setAttribute("aria-label", "Suggested actions");
    const a = actionsFor(marketKey, data);
    const spread = a.max.q50 - a.min.q50;
    card.append(h("h4", "MarketEngine__actions_title", "Suggested actions · predicted median"));

    const row = (side, label, point) => {
      const item = h("div", "MarketEngine__action");
      const pill = h("span", "MarketEngine__action_side", side);
      pill.dataset.side = side;
      const value = h("span", "MarketEngine__action_value", fmtPrice(point.q50));
      value.append(h("small", "", "€/MWh"));
      const time = h("span", "MarketEngine__action_time");
      time.append(document.createTextNode(`${hhmm(point.t)}–${shiftQuarter(point.t)} `), h("span", "", `· delivery · P10 ${fmtPrice(point.q10)} / P90 ${fmtPrice(point.q90)}`));
      item.append(pill, h("span", "MarketEngine__action_label", label), value, time);
      return item;
    };
    const u = a.uncertainty;
    const uItem = h("div", "MarketEngine__action");
    const uPill = h("span", "MarketEngine__action_side", "risk");
    uPill.dataset.side = "risk";
    const uValue = h("span", "MarketEngine__action_value", fmtPrice(u.width));
    uValue.append(h("small", "", "€/MWh · mean P90 − P10"));
    const size = u.grade === "high" ? "large" : u.grade === "low" ? "small" : "moderate";
    const uText = h("span", "MarketEngine__action_time");
    uText.append(document.createTextNode(`Distance between upper and lower quantile is ${size} `), h("span", "", `· current market risk is ${u.grade} (${Math.round(u.ratio * 100)} % of the median)`));
    uItem.dataset.tone = "muted";
    uItem.append(uPill, h("span", "MarketEngine__action_label", "Quantile interval width"), uValue, uText);
    card.append(
      row("buy", "Minimum of the median", a.min),
      row("sell", "Maximum of the median", a.max),
      uItem
    );
    const noteNode = h("p", "MarketEngine__actions_note");
    noteNode.append(document.createTextNode("Predicted spread "), h("strong", "", `${fmtPrice(spread)} €/MWh`), document.createTextNode(` between the cheapest and dearest interval. ${a.scope}. Placeholder data — not trading advice.`));
    card.append(noteNode);
    return card;
  }

  // "12:45" -> "13:00" using the wall-clock string only (keeps the data file's timezone)
  function shiftQuarter(t) {
    const hh = Number(t.slice(11, 13)), mm = Number(t.slice(14, 16));
    const total = (hh * 60 + mm + 15) % (24 * 60);
    return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
  }

  const MARKET_COPY = {
    dayAhead: {
      title: "Day-ahead: today's clearing against tomorrow's forecast",
      legend: [["ink", "Cleared price (today)"], ["ink", "Forecast median (tomorrow)"], ["band", "P10–P90 band"]],
      source: "DAY-AHEAD AUCTION · 96 CLEARED + 96 FORECAST QUARTER HOURS · EUR/MWH",
      badge: "15-min",
    },
    intraday: {
      title: "Intraday: the order flow so far, the VWAP path ahead",
      legend: [["buy", "Buy trades / buy VWAP"], ["sell", "Sell trades / sell VWAP"], ["band", "Whisker = P10–P90"]],
      source: "CONTINUOUS INTRADAY · RAW TRADES −3 H · 12 VWAP FORECASTS +3 H · EUR/MWH",
      badge: "±3 h",
    },
    balancing: {
      title: "Balancing: settled prices, system imbalance, and what comes next",
      legend: [["ink", "Balancing price"], ["bar", "System imbalance (MW)"], ["band", "Forecast P10–P90"]],
      source: "IMBALANCE SETTLEMENT · 12 SETTLED + 12 FORECAST PERIODS · EUR/MWH · MW",
      badge: "±3 h",
    },
  };

  function buildSection(mount, data) {
    const now = ms(data.meta.now);
    const nowLabel = `${hhmm(data.meta.now)} · ${dayLabel(data.meta.now)}`;

    mount.append(h("span", "MarketEngine__section_number", "02 — Platform"));

    // header
    const header = h("header", "MarketEngine__header");
    const title = h("h2", "MarketEngine__title");
    title.id = "market-engine-title";
    title.append(document.createTextNode("Intelligent "), h("em", "", "Electricity Market"), document.createTextNode(" Engine"));
    const right = h("div", "");
    right.append(
      h("p", "MarketEngine__lead", "Probabilistic price forecasts for the day-ahead, intraday and balancing markets."),
    );
    const stats = h("div", "MarketEngine__stats");
    stats.append(buildStat("3", "Markets covered"), buildStat("15 min", "Native resolution"), buildStat("P10–P90", "Quantile forecasts"));
    right.append(stats);
    header.append(title, right);
    mount.append(header);

    // market bar
    const bar = h("div", "MarketEngine__bar");
    const tabs = h("div", "MarketEngine__tabs");
    tabs.setAttribute("role", "tablist");
    tabs.setAttribute("aria-label", "Market");
    bar.append(tabs, h("div", "MarketEngine__clock", `Forecast issued ${nowLabel} CEST`));
    mount.append(bar);

    // main grid
    const grid = h("div", "MarketEngine__grid");
    const chartCard = h("article", "MarketEngine__card");
    const chartHead = h("div", "MarketEngine__card_head");
    const chartTitleWrap = h("div", "");
    const chartTitle = h("h3", "MarketEngine__card_title");
    const chartLegend = h("div", "");
    chartTitleWrap.append(chartTitle, chartLegend);
    const badge = h("span", "MarketEngine__badge");
    chartHead.append(chartTitleWrap, badge);
    const chartBox = h("div", "MarketEngine__chart");
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("role", "img");
    chartBox.append(svg);
    const initialSize = mainSize(svg);
    attachTooltip(chartBox);
    svg.setAttribute("viewBox", `0 0 ${initialSize.W} ${initialSize.H}`);
    const source = h("div", "MarketEngine__source");
    chartCard.append(chartHead, chartBox, source);
    let actions = buildActions("dayAhead", data);
    grid.append(chartCard, actions);
    mount.append(grid);

    // generation row
    const row = h("div", "MarketEngine__row");
    const gen = [
      ["solar", "Solar generation forecast", "Bell of daylight, next 24 h"],
      ["wind", "Wind generation forecast", "Evening front ramps the fleet up"],
      ["load", "Load forecast", "Morning ramp, evening peak"],
    ];
    gen.forEach(([key, name, sub]) => {
      const card = h("article", "MarketEngine__card");
      const head = h("div", "MarketEngine__card_head");
      const wrap = h("div", "");
      wrap.append(h("h3", "MarketEngine__card_title", name), h("p", "MarketEngine__card_sub", `${sub} · median with P10–P90`));
      const series = data.generation[key];
      const iMax = argMax(series, "q50");
      const peak = h("div", "MarketEngine__peak", fmtMW(series[iMax].q50));
      peak.append(h("small", "", `peak · ${hhmm(series[iMax].t)}`));
      head.append(wrap, peak);
      const box = h("div", "MarketEngine__chart");
      const s = document.createElementNS(NS, "svg");
      s.setAttribute("role", "img");
      s.setAttribute("viewBox", "0 0 420 210");
      s.setAttribute("aria-label", name);
      box.append(s);
      attachTooltip(box);
      card.append(head, box, h("div", "MarketEngine__source", `${key.toUpperCase()} · 96 QUARTER HOURS AHEAD · MW`));
      row.append(card);
      card.dataset.generation = key;
      card._render = () => { s.replaceChildren(); renderGeneration(s, series, key); };
    });
    mount.append(row);

    // tabs + render
    let current = null;
    const renderMarket = (key) => {
      current = key;
      const copy = MARKET_COPY[key];
      chartTitle.textContent = copy.title;
      chartLegend.replaceChildren(buildLegend(copy.legend));
      badge.textContent = copy.badge;
      source.textContent = copy.source;
      svg.setAttribute("aria-label", copy.title);
      svg.replaceChildren();
      if (key === "dayAhead") renderDayAhead(svg, data.dayAhead);
      else if (key === "intraday") renderIntraday(svg, data.intraday, now);
      else renderBalancing(svg, data.balancing);
      const next = buildActions(key, data);
      actions.replaceWith(next);
      actions = next;
      tabs.querySelectorAll(".MarketEngine__tab").forEach((tab) => tab.setAttribute("aria-selected", tab.dataset.market === key ? "true" : "false"));
    };
    const flash = (node) => {
      node.classList.remove("is-flash");
      void node.offsetWidth; // restart the animation
      node.classList.add("is-flash");
      setTimeout(() => node.classList.remove("is-flash"), 1600);
    };
    const switchTo = (key) => {
      renderMarket(key);
      const tab = tabs.querySelector(`.MarketEngine__tab[data-market="${key}"]`);
      if (tab) flash(tab);
      flash(chartCard);
    };
    // first reveal: tour Day-ahead -> Intraday -> Balancing -> Day-ahead, then stay; any click stops it
    let tourTimers = [];
    const stopTour = () => { tourTimers.forEach(clearTimeout); tourTimers = []; };
    const startTour = () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const steps = ["intraday", "balancing", "dayAhead"];
      steps.forEach((key, i) => tourTimers.push(setTimeout(() => switchTo(key), 4200 * (i + 1))));
    };
    MARKETS.forEach((m) => {
      const tab = h("button", "MarketEngine__tab", m.label);
      tab.type = "button";
      tab.dataset.market = m.key;
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-selected", "false");
      tab.addEventListener("click", () => { stopTour(); switchTo(m.key); });
      tabs.append(tab);
    });
    svg.addEventListener("click", () => current && renderMarket(current)); // replay entry motion
    let lastCompact = mainSize(svg).compact, resizeTimer = 0;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const compact = mainSize(svg).compact;
        if (compact !== lastCompact) { lastCompact = compact; if (current) renderMarket(current); }
      }, 150);
    });
    row.querySelectorAll("[data-generation]").forEach((card) => card.querySelector("svg").addEventListener("click", () => card._render()));

    return {
      reveal() {
        if (current) return;
        renderMarket("dayAhead");
        row.querySelectorAll("[data-generation]").forEach((card) => card._render());
        startTour();
      },
    };
  }

  function setupVisibility(section, api) {
    const setInView = (inView) => {
      if (inView) document.body.setAttribute("data-market-engine-in-view", "true");
      else document.body.removeAttribute("data-market-engine-in-view");
    };
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[entries.length - 1];
      const visible = Boolean(entry && entry.isIntersecting && entry.intersectionRatio >= 0.01);
      setInView(visible);
      if (visible) api.reveal();
    }, { threshold: [0, 0.01, 0.2] });
    observer.observe(section);
  }

  async function initialize() {
    const mount = document.querySelector(MOUNT_SELECTOR);
    if (!mount) return;
    try {
      const response = await fetch(DATA_URL, { credentials: "same-origin", cache: "no-cache" });
      if (!response.ok) throw new Error(`market data request failed (${response.status})`);
      const data = await response.json();
      const api = buildSection(mount, data);
      setupVisibility(mount, api);
      window.DeepPriorMarketEngine = { data, render: api.reveal };
    } catch (error) {
      console.error(`[DeepPrior market engine] ${error instanceof Error ? error.message : error}`);
    }
  }

await initialize();
