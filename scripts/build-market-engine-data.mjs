#!/usr/bin/env node
/**
 * Deterministic placeholder data for the Intelligent Electricity Market Engine
 * section (public/data/market-engine.json).
 *
 * Replace the generated file with real data that follows the same schema:
 *
 *   {
 *     "meta":      { "now": ISO, "priceUnit": "EUR/MWh", "powerUnit": "MW", "resolutionMinutes": 15 },
 *     "dayAhead":  { "history":  [{ "t": ISO, "price": number } x 96],              // delivery day D
 *                    "forecast": [{ "t": ISO, "q10": n, "q50": n, "q90": n } x 96] }, // delivery day D+1
 *     "intraday":  { "trades":   [{ "t": ISO, "price": n, "volume": n, "side": "buy" | "sell" }],  // last 3 h
 *                    "forecast": { "buy":  [{ "t": ISO, "q10": n, "q50": n, "q90": n } x 12],      // next 3 h VWAP
 *                                  "sell": [{ ... } x 12] } },
 *     "balancing": { "history":  [{ "t": ISO, "price": n, "imbalance": n } x 12],   // last 3 h (price EUR/MWh, imbalance MW)
 *                    "forecast": [{ "t": ISO, "q10": n, "q50": n, "q90": n } x 12] }, // next 3 h
 *     "generation":{ "solar": [{ "t": ISO, "q10": n, "q50": n, "q90": n } x 96],    // next 24 h, MW
 *                    "wind":  [...], "load": [...] }
 *   }
 *
 * Timestamps mark the START of each 15-minute delivery interval.
 */
import fs from "node:fs";
import path from "node:path";

const OUT = path.resolve(process.argv[2] || "public/data/market-engine.json");
const TZ = "+02:00";
const NOW = new Date("2026-09-14T12:00:00+02:00");
const STEP = 15 * 60 * 1000;

// mulberry32 — deterministic pseudo random so the page renders identically on every reload
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(20260914);
const gauss = () => { const u = 1 - rnd(), v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
const round = (v, d = 1) => Number(v.toFixed(d));
const iso = (date) => {
  const local = new Date(date.getTime() + 2 * 3600 * 1000); // shift to +02:00 wall clock
  return local.toISOString().replace(/\.\d{3}Z$/, TZ);
};
const startOfDay = (d) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), -2, 0, 0)); // 00:00 local (+02:00)

// Smoothed noise (AR(1)) helper
function ar1(n, phi, sigma) {
  const out = []; let x = 0;
  for (let i = 0; i < n; i++) { x = phi * x + sigma * gauss(); out.push(x); }
  return out;
}

// ---- day-ahead: duck-curve shaped hourly-ish price, quarter-hourly resolution
function dayAheadShape(h, dayTweak) {
  const morning = 38 * Math.exp(-((h - 8) ** 2) / 3.2);
  const evening = 62 * Math.exp(-((h - 19.5) ** 2) / 4.5);
  const solarDip = -48 * Math.exp(-((h - 13) ** 2) / 7) * dayTweak.solar;
  const night = -12 * Math.exp(-((h - 3) ** 2) / 9);
  return 92 + morning + evening + solarDip + night + dayTweak.level;
}
function buildDayAhead() {
  const today0 = startOfDay(NOW);
  const histNoise = ar1(96, 0.85, 4.5);
  const history = [];
  for (let i = 0; i < 96; i++) {
    const h = i / 4;
    history.push({ t: iso(new Date(today0.getTime() + i * STEP)), price: round(dayAheadShape(h, { solar: 1.05, level: 0 }) + histNoise[i]) });
  }
  const fcNoise = ar1(96, 0.9, 3.5);
  const forecast = [];
  for (let i = 0; i < 96; i++) {
    const h = i / 4;
    const q50 = dayAheadShape(h, { solar: 0.78, level: 6 }) + fcNoise[i];
    const spread = 9 + 8 * Math.abs(Math.sin((h - 6) / 24 * Math.PI * 2)) + (h > 17 && h < 22 ? 10 : 0);
    forecast.push({ t: iso(new Date(today0.getTime() + 24 * 3600 * 1000 + i * STEP)), q10: round(q50 - spread * 0.85), q50: round(q50), q90: round(q50 + spread) });
  }
  return { history, forecast };
}

// ---- intraday: raw trades over the last 3 h, VWAP forecast for the next 12 quarter hours
function buildIntraday() {
  const trades = [];
  const midDrift = ar1(36, 0.9, 2.2);
  const t0 = NOW.getTime() - 3 * 3600 * 1000;
  let mid = 98;
  for (let k = 0; k < 250; k++) {
    const frac = rnd();
    const t = t0 + frac * 3 * 3600 * 1000;
    const idx = Math.min(35, Math.floor(frac * 36));
    mid = 98 + 9 * Math.sin(frac * 4.2) + midDrift[idx] + 6 * frac; // drifts up towards delivery
    const side = rnd() < 0.5 ? "buy" : "sell";
    const price = mid + (side === "buy" ? -1.6 : 1.6) + gauss() * (2.4 + 1.8 * frac);
    const volume = Math.min(30, Math.max(0.5, Math.exp(gauss() * 0.75 + 1.4)));
    trades.push({ t: iso(new Date(t)), price: round(price, 2), volume: round(volume, 1), side });
  }
  trades.sort((a, b) => a.t.localeCompare(b.t));

  const fcStart = Math.ceil(NOW.getTime() / STEP) * STEP;
  const buy = [], sell = [];
  const wob = ar1(12, 0.8, 1.6);
  for (let i = 0; i < 12; i++) {
    const h = i + 1;
    const base = 105 + 5.5 * Math.sin(i / 2.3) + 1.4 * i + wob[i];
    const spread = 4 + 1.9 * h;
    const t = iso(new Date(fcStart + i * STEP));
    buy.push({ t, q10: round(base - 1.5 - spread * 0.9), q50: round(base - 1.5), q90: round(base - 1.5 + spread * 0.8) });
    sell.push({ t, q10: round(base + 1.7 - spread * 0.8), q50: round(base + 1.7), q90: round(base + 1.7 + spread * 0.95) });
  }
  return { trades, forecast: { buy, sell } };
}

// ---- balancing: price + system imbalance history, price forecast
function buildBalancing() {
  const hStart = Math.floor(NOW.getTime() / STEP) * STEP - 12 * STEP;
  const imbNoise = ar1(12, 0.6, 260);
  const history = [];
  for (let i = 0; i < 12; i++) {
    const imbalance = -180 + 420 * Math.sin(i / 2.1 + 0.6) + imbNoise[i]; // MW, negative = system short
    const price = 96 - 0.26 * imbalance + gauss() * 14; // short system -> expensive balancing energy
    history.push({ t: iso(new Date(hStart + i * STEP)), price: round(price), imbalance: round(imbalance, 0) });
  }
  const fStart = hStart + 12 * STEP;
  const fcNoise = ar1(12, 0.7, 9);
  const forecast = [];
  for (let i = 0; i < 12; i++) {
    const q50 = 118 + 55 * Math.sin(i / 2.4 + 1.1) + fcNoise[i];
    const spread = 26 + 9 * i;
    forecast.push({ t: iso(new Date(fStart + i * STEP)), q10: round(q50 - spread * 0.9), q50: round(q50), q90: round(q50 + spread * 1.15) });
  }
  return { history, forecast };
}

// ---- generation forecasts for the next 24 h (MW)
function buildGeneration() {
  const start = Math.ceil(NOW.getTime() / STEP) * STEP;
  const windAr = ar1(96, 0.97, 380);
  const loadAr = ar1(96, 0.9, 260);
  const solar = [], wind = [], load = [];
  for (let i = 0; i < 96; i++) {
    const t = new Date(start + i * STEP);
    const h = ((t.getUTCHours() + 2) % 24) + t.getUTCMinutes() / 60; // local hour
    // solar: bell centred on 13:15, zero outside daylight
    const s = Math.max(0, 27500 * Math.exp(-((h - 13.25) ** 2) / 8.5) - 900) * (1 + 0.04 * Math.sin(i / 3));
    const sSpread = s * 0.16 + 250 * (s > 0);
    solar.push({ t: iso(t), q10: round(Math.max(0, s - sSpread), 0), q50: round(s, 0), q90: round(s + sSpread * 1.15, 0) });
    // wind: slow ramp with a front passing in the evening, autocorrelated wobble
    const w = 9500 + 6500 * (1 / (1 + Math.exp(-(i - 58) / 7))) + 1800 * Math.sin(i / 11) + windAr[i];
    const wSpread = 1600 + 55 * i;
    wind.push({ t: iso(t), q10: round(Math.max(1200, w - wSpread * 0.9), 0), q50: round(w, 0), q90: round(w + wSpread, 0) });
    // load: night trough, morning ramp, midday plateau, evening peak
    const l = 47000 + 9500 * Math.exp(-((h - 11) ** 2) / 14) + 11500 * Math.exp(-((h - 18.8) ** 2) / 6.5) - 6500 * Math.exp(-((h - 3.5) ** 2) / 9) + loadAr[i];
    const lSpread = 900 + 28 * i;
    load.push({ t: iso(t), q10: round(l - lSpread, 0), q50: round(l, 0), q90: round(l + lSpread, 0) });
  }
  return { solar, wind, load };
}

const data = {
  meta: { now: iso(NOW), priceUnit: "EUR/MWh", powerUnit: "MW", resolutionMinutes: 15, placeholder: true },
  dayAhead: buildDayAhead(),
  intraday: buildIntraday(),
  balancing: buildBalancing(),
  generation: buildGeneration(),
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(data, null, 1) + "\n");
console.log(`wrote ${OUT}`);
