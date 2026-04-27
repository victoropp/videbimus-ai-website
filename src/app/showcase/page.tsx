// dangerouslySetInnerHTML below is safe: content is a static string literal (JSON-LD structured data),
// never derived from user input.
import type { Metadata } from 'next'
import Script from 'next/script'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'AI Model Showcase — Live Interactive Demos | Videbimus AI',
  description:
    'Interact with 12 live ML models across finance, healthcare, retail, manufacturing, energy, logistics, telecom, insurance, marketing, and agriculture. Real architectures, real business outcomes.',
  keywords: [
    'AI model demos',
    'machine learning showcase',
    'fraud detection AI',
    'predictive maintenance ML',
    'healthcare AI radiology',
    'recommendation system demo',
    'churn prediction model',
    'credit scoring AI',
    'supply chain optimization',
    'energy load forecasting',
    'Videbimus AI',
    'bespoke ML consulting',
  ],
  openGraph: {
    title: 'AI Model Showcase — 12 Live Interactive ML Demos | Videbimus AI',
    description:
      'Finance, healthcare, retail, manufacturing and more. Every card is a live miniature of a system we ship. Move sliders, watch the model respond.',
    url: 'https://videbimus.ai/showcase',
    images: [{ url: '/og-showcase.jpg', width: 1200, height: 630, alt: 'Videbimus AI Model Showcase' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Model Showcase — 12 Live Interactive ML Demos | Videbimus AI',
    description: 'Interact with 12 production ML models across 10 industries. Real architectures, real outcomes.',
    images: ['/og-showcase.jpg'],
  },
  alternates: { canonical: 'https://videbimus.ai/showcase' },
}

const structuredData = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Videbimus AI — Model Showcase',
  description:
    'Interactive demonstrations of 12 production machine-learning systems across finance, healthcare, retail, manufacturing, energy, logistics, telecom, insurance, marketing, and agriculture.',
  url: 'https://videbimus.ai/showcase',
  provider: {
    '@type': 'Organization',
    name: 'Videbimus AI',
    url: 'https://videbimus.ai',
  },
  mainEntity: {
    '@type': 'ItemList',
    name: 'ML Model Portfolio',
    numberOfItems: 12,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Real-time Fraud Decisioning', description: 'XGBoost · 312 features · p99 < 30ms' },
      { '@type': 'ListItem', position: 2, name: 'Radiology Triage (Chest X-ray)', description: 'CNN · ResNet-152 · Grad-CAM attention maps' },
      { '@type': 'ListItem', position: 3, name: 'E-commerce Recommendations', description: 'Two-tower · ANN · collaborative filtering' },
      { '@type': 'ListItem', position: 4, name: 'Predictive Maintenance (RUL)', description: 'LSTM · attention · signal remaining useful life' },
      { '@type': 'ListItem', position: 5, name: 'Energy Load Forecasting', description: 'N-BEATS · temporal fusion · 24h horizon' },
      { '@type': 'ListItem', position: 6, name: 'Logistics Route Optimisation', description: 'OR-Tools · GNN heuristics · VRP solver' },
      { '@type': 'ListItem', position: 7, name: 'Telecom Churn Prevention', description: 'LightGBM · survival · uplift modelling' },
      { '@type': 'ListItem', position: 8, name: 'Insurance Claims Triage', description: 'Gradient boosting · NLP · vision · tabular' },
      { '@type': 'ListItem', position: 9, name: 'Customer LTV Segmentation', description: 'k-means · DBSCAN · BG/NBD · Gamma-Gamma' },
      { '@type': 'ListItem', position: 10, name: 'Crop Yield Forecasting', description: 'Random forest + CNN · Sentinel-2 NDVI' },
      { '@type': 'ListItem', position: 11, name: 'Credit Risk Underwriting', description: 'XGBoost · monotonic · SHAP explanations' },
      { '@type': 'ListItem', position: 12, name: 'Patient Cardio-Metabolic Risk', description: 'Transformer · EHR · 5-year horizon' },
    ],
  },
})

export default function ShowcasePage() {
  return (
    <>
      {/* Static JSON-LD — safe string literal, no user input */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: structuredData }}
      />

      <div className="showcase-root">
        {/* ── HERO ──────────────────────────────────────────────── */}
        <section className="sc-hero">
          <div className="sc-wrap sc-hero-grid">
            <div>
              <div className="sc-eyebrow">
                <span className="sc-dot" aria-hidden="true" />
                Bespoke ML &amp; deep learning · est. consulting
              </div>
              <h1>
                Most companies <span className="sc-strike">guess.</span>
                <br />
                <span className="sc-it">We shall see.</span>
              </h1>
              <p className="sc-lede">
                Videbimus AI builds production machine-learning and deep-learning systems
                for finance, healthcare, retail, manufacturing and more —{' '}
                <span className="sc-quiet">turning the data you already have into decisions you can actually trust.</span>
              </p>
              <div className="sc-cta-row">
                <Link href="/contact" className="sc-btn sc-btn-primary">
                  Book a discovery call <span className="sc-arr">→</span>
                </Link>
                <a href="#models" className="sc-btn sc-btn-ghost">
                  See the models
                </a>
              </div>
              <div className="sc-hero-meta">
                <div className="sc-stat">
                  <span className="sc-num">10</span>
                  <span className="sc-lbl">Industries served</span>
                </div>
                <div className="sc-stat">
                  <span className="sc-num">12</span>
                  <span className="sc-lbl">Model archetypes</span>
                </div>
                <div className="sc-stat">
                  <span className="sc-num">∞</span>
                  <span className="sc-lbl">Bespoke to you</span>
                </div>
              </div>
            </div>

            <div className="sc-hero-viz" aria-hidden="true">
              <div className="sc-ring sc-spinner" />
              <div className="sc-ring" />
              <div className="sc-ring sc-r2" />
              <div className="sc-ring sc-r3" />
              <svg viewBox="-100 -100 200 200">
                <defs>
                  <radialGradient id="sc-core" cx="0.5" cy="0.5" r="0.5">
                    <stop offset="0" stopColor="#f0a35a" stopOpacity="0.9" />
                    <stop offset="0.5" stopColor="#c8553d" stopOpacity="0.4" />
                    <stop offset="1" stopColor="#0a1628" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <g stroke="rgba(244,236,223,0.12)" strokeWidth="0.5">
                  <line x1="-70" y1="0" x2="70" y2="0" />
                  <line x1="0" y1="-70" x2="0" y2="70" />
                  <line x1="-50" y1="-50" x2="50" y2="50" />
                  <line x1="-50" y1="50" x2="50" y2="-50" />
                  <line x1="-80" y1="-30" x2="80" y2="30" />
                  <line x1="-80" y1="30" x2="80" y2="-30" />
                </g>
                <g fill="#f4ecdf">
                  {[[-70,0],[70,0],[0,-70],[0,70]] .map(([x,y],i) => (
                    <circle key={i} cx={x} cy={y} r="2" />
                  ))}
                  {[[-50,-50],[50,50],[-50,50],[50,-50],[-80,-30],[80,30],[-80,30],[80,-30]].map(([x,y],i) => (
                    <circle key={i+4} cx={x} cy={y} r="1.5" />
                  ))}
                </g>
                <circle cx="0" cy="0" r="42" fill="url(#sc-core)" />
                <circle cx="0" cy="0" r="22" fill="#0d1e36" stroke="rgba(244,236,223,0.12)" strokeWidth="0.6" />
                <polygon points="-13,-11 -5.5,-11 1,14 -4,14" fill="#f4ecdf" />
                <polygon points="13,-11 5.5,-11 -1,14 4,14" fill="#f4ecdf" />
                <rect x="-13" y="1" width="26" height="2.8" rx="1.4" fill="#f0a35a" />
              </svg>
              <div className="sc-tickers" id="sc-tickers" />
            </div>
          </div>
        </section>

        {/* ── MODELS ────────────────────────────────────────────── */}
        <section id="models">
          <div className="sc-wrap">
            <div className="sc-section-head sc-reveal">
              <div className="sc-section-num">
                <span className="sc-n">02 ·</span> The portfolio
              </div>
              <div>
                <h2 className="sc-section-title">
                  Twelve working models,{' '}
                  <span className="sc-it">across ten industries</span> — interact with each.
                </h2>
                <p className="sc-section-sub">
                  Every card below is a live, interactive miniature of a system we ship for clients.
                  Move sliders, pick scenarios, watch the model respond. Numbers are illustrative;
                  the architectures and the business outcomes are real.
                </p>
              </div>
            </div>

            <div className="sc-models-grid">

              {/* 01 — FINANCE: FRAUD */}
              <article className="sc-model-card sc-span-8 sc-reveal" id="demo-fraud">
                <div className="sc-model-stack">XGBoost · 312 features<br />p99 &lt; 30 ms</div>
                <div className="sc-model-head">
                  <span className="sc-industry"><span className="sc-num">01</span> Finance · Banking</span>
                </div>
                <h3>Real-time <span className="sc-it">fraud</span> decisioning at the swipe.</h3>
                <p className="sc-problem">
                  Score every card transaction in under 30 ms. Approve good customers without friction,
                  step-up the suspicious, block the obviously bad — and explain every decision.
                </p>
                <div className="sc-model-demo">
                  <div className="sc-demo-label"><span>Try it · simulate a transaction</span><span className="sc-live">live model</span></div>
                  <div className="sc-ctrl-row">
                    <div className="sc-ctrl">
                      <label htmlFor="fr-amount">Amount <span className="sc-val">£420</span></label>
                      <input id="fr-amount" type="range" min="5" max="6000" defaultValue="420" step="5" />
                    </div>
                    <div className="sc-ctrl">
                      <label htmlFor="fr-hour">Hour <span className="sc-val">14:00</span></label>
                      <input id="fr-hour" type="range" min="0" max="23" defaultValue="14" />
                    </div>
                  </div>
                  <div className="sc-ctrl-row">
                    <div className="sc-ctrl">
                      <label>Merchant</label>
                      <select id="fr-merch">
                        <option value="grocery">Grocery</option>
                        <option value="electronics">Electronics</option>
                        <option value="travel">Travel</option>
                        <option value="crypto">Crypto exchange</option>
                        <option value="gambling">Gambling</option>
                      </select>
                    </div>
                    <div className="sc-ctrl">
                      <label>Card region</label>
                      <select id="fr-country">
                        <option value="dom">Domestic</option>
                        <option value="intl">International</option>
                      </select>
                    </div>
                  </div>
                  <div className="sc-ctrl-row" style={{ marginTop: 10 }}>
                    <button id="fr-newdev" className="sc-chip">New device</button>
                  </div>
                  <div className="sc-gauge-wrap">
                    <div className="sc-gauge" id="fr-gauge">
                      <svg viewBox="0 0 220 130">
                        <path d="M 20 110 A 90 90 0 0 1 200 110" fill="none" stroke="rgba(244,236,223,0.15)" strokeWidth="10" strokeLinecap="round" />
                        <path className="gauge-arc-fill" d="M 20 110 A 90 90 0 0 1 200 110" fill="none" stroke="var(--sc-signal)" strokeWidth="10" strokeLinecap="round" pathLength={240} strokeDasharray="0 240" />
                        <g className="gauge-needle">
                          <line x1="110" y1="110" x2="110" y2="40" stroke="var(--sc-paper)" strokeWidth="2" />
                          <circle cx="110" cy="110" r="5" fill="var(--sc-paper)" />
                        </g>
                      </svg>
                      <div className="sc-gauge-readout">
                        <div className="sc-gauge-num"><span id="fr-score">0</span><span style={{ fontSize: 18, color: 'var(--sc-muted)' }}>/100</span></div>
                        <div className="sc-gauge-lbl">Risk score</div>
                      </div>
                    </div>
                  </div>
                  <div className="sc-ctrl-row" style={{ justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                    <span id="fr-verdict" className="sc-chip">—</span>
                    <span id="fr-factors" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }} />
                  </div>
                </div>
                <div className="sc-model-foot">
                  <div className="sc-kpi"><span className="sc-kpi-v sc-signal">−47%</span><span className="sc-kpi-l">Fraud losses</span></div>
                  <div className="sc-kpi"><span className="sc-kpi-v">−62%</span><span className="sc-kpi-l">False positives</span></div>
                  <div className="sc-kpi"><span className="sc-kpi-v">28 ms</span><span className="sc-kpi-l">p99 latency</span></div>
                </div>
              </article>

              {/* 02 — HEALTHCARE: XRAY */}
              <article className="sc-model-card sc-span-4 sc-reveal" id="demo-xray">
                <div className="sc-model-stack">CNN · ResNet-152<br />Grad-CAM</div>
                <div className="sc-model-head">
                  <span className="sc-industry"><span className="sc-num">02</span> Healthcare</span>
                </div>
                <h3>Triage radiology <span className="sc-it">in seconds.</span></h3>
                <p className="sc-problem">
                  A vision model that flags pneumonia, cardiomegaly and nodules,
                  and shows the radiologist exactly where it looked.
                </p>
                <div className="sc-model-demo">
                  <div className="sc-demo-label"><span>Pick a finding</span><span className="sc-live">attention map</span></div>
                  <div id="xr-cond" className="sc-seg" style={{ marginBottom: 10 }}>
                    <button className="on" data-cond="pneumonia">Pneumonia</button>
                    <button data-cond="cardiomegaly">Cardiomegaly</button>
                    <button data-cond="nodule">Nodule</button>
                  </div>
                  <canvas id="xr-canvas" style={{ width: '100%', borderRadius: 3, aspectRatio: '360/260' }} />
                  <div className="sc-ctrl" style={{ marginTop: 10 }}>
                    <label htmlFor="xr-conf">Confidence weight <span className="sc-val">70</span></label>
                    <input id="xr-conf" type="range" min="20" max="100" defaultValue="70" />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontFamily: 'var(--sc-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    <span style={{ color: 'var(--sc-muted-2)' }}>Finding · <span id="xr-finding" style={{ color: 'var(--sc-paper)' }}>Pneumonia</span></span>
                    <span style={{ color: 'var(--sc-signal)' }} id="xr-prob">60.2%</span>
                  </div>
                </div>
                <div className="sc-model-foot">
                  <div className="sc-kpi"><span className="sc-kpi-v sc-signal">0.94</span><span className="sc-kpi-l">AUROC</span></div>
                  <div className="sc-kpi"><span className="sc-kpi-v">1.4 s</span><span className="sc-kpi-l">Read time</span></div>
                </div>
              </article>

              {/* 03 — RETAIL: RECS */}
              <article className="sc-model-card sc-span-6 sc-reveal" id="demo-recs">
                <div className="sc-model-stack">Two-tower · ANN<br />collaborative filtering</div>
                <div className="sc-model-head">
                  <span className="sc-industry"><span className="sc-num">03</span> Retail · E-commerce</span>
                </div>
                <h3>Recommendations that <span className="sc-it">actually convert.</span></h3>
                <p className="sc-problem">
                  Add a few items to a basket — watch the model re-rank the catalogue in real time
                  based on what shoppers like this one usually buy together.
                </p>
                <div className="sc-model-demo">
                  <div className="sc-demo-label"><span>Click to add to basket</span><span className="sc-live">re-ranking</span></div>
                  <div id="rec-grid" className="sc-rec-grid-wrap" />
                  <div className="sc-demo-label"><span>Basket</span></div>
                  <div id="rec-cart" className="sc-rec-cart" />
                  <div className="sc-demo-label">
                    <span>Top recommendations</span>
                    <span style={{ color: 'var(--sc-signal)' }}>expected lift <b id="rec-lift">+8%</b></span>
                  </div>
                  <div id="rec-out" className="sc-rec-out" />
                </div>
                <div className="sc-model-foot">
                  <div className="sc-kpi"><span className="sc-kpi-v sc-signal">+34%</span><span className="sc-kpi-l">Avg order value</span></div>
                  <div className="sc-kpi"><span className="sc-kpi-v">+18%</span><span className="sc-kpi-l">CTR on PDP</span></div>
                </div>
              </article>

              {/* 04 — MANUFACTURING: PdM */}
              <article className="sc-model-card sc-span-6 sc-reveal" id="demo-rul">
                <div className="sc-model-stack">LSTM · attention<br />signal RUL</div>
                <div className="sc-model-head">
                  <span className="sc-industry"><span className="sc-num">04</span> Manufacturing</span>
                </div>
                <h3>Service the machine <span className="sc-it">before it breaks.</span></h3>
                <p className="sc-problem">
                  Sensor data in, hours-of-life-remaining out. Replace expensive emergency call-outs
                  with calm, planned maintenance windows.
                </p>
                <div className="sc-model-demo">
                  <div className="sc-demo-label"><span>CNC #14 · spindle bearing</span><span className="sc-live">forecast</span></div>
                  <svg id="rul-svg" viewBox="0 0 360 160" style={{ width: '100%', height: 'auto' }} />
                  <div className="sc-ctrl-row">
                    <div className="sc-ctrl">
                      <label htmlFor="rul-vib">Vibration <span className="sc-val">12.0 mm/s</span></label>
                      <input id="rul-vib" type="range" min="0" max="40" defaultValue="12" step="0.5" />
                    </div>
                    <div className="sc-ctrl">
                      <label htmlFor="rul-temp">Temp <span className="sc-val">68 °C</span></label>
                      <input id="rul-temp" type="range" min="40" max="110" defaultValue="68" />
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                    <div style={{ fontFamily: 'var(--sc-mono)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--sc-muted-2)' }}>
                      RUL · <span id="rul-out" style={{ fontFamily: 'var(--sc-display)', fontSize: 28, color: 'var(--sc-signal)', letterSpacing: 0 }}>128</span> hrs
                    </div>
                    <span id="rul-status" className="sc-chip">—</span>
                  </div>
                </div>
                <div className="sc-model-foot">
                  <div className="sc-kpi"><span className="sc-kpi-v sc-signal">−38%</span><span className="sc-kpi-l">Unplanned downtime</span></div>
                  <div className="sc-kpi"><span className="sc-kpi-v">+22%</span><span className="sc-kpi-l">Asset lifespan</span></div>
                </div>
              </article>

              {/* 05 — ENERGY: LOAD */}
              <article className="sc-model-card sc-span-6 sc-reveal" id="demo-load">
                <div className="sc-model-stack">N-BEATS · temporal fusion<br />24h horizon</div>
                <div className="sc-model-head">
                  <span className="sc-industry"><span className="sc-num">05</span> Energy · Utilities</span>
                </div>
                <h3>Forecast tomorrow&#39;s <span className="sc-it">grid demand.</span></h3>
                <p className="sc-problem">
                  Hour-by-hour load prediction so traders buy the right block, operators
                  schedule the right plant, and nobody pays the imbalance penalty.
                </p>
                <div className="sc-model-demo">
                  <div className="sc-demo-label"><span>Tomorrow · 24h horizon</span><span className="sc-live">90% interval</span></div>
                  <svg id="en-svg" viewBox="0 0 360 160" style={{ width: '100%', height: 'auto' }} />
                  <div className="sc-ctrl-row" style={{ alignItems: 'flex-end' }}>
                    <div className="sc-ctrl">
                      <label htmlFor="en-temp">Forecast high <span className="sc-val">12 °C</span></label>
                      <input id="en-temp" type="range" min="-5" max="38" defaultValue="12" />
                    </div>
                    <div className="sc-ctrl" style={{ flex: '0 0 auto' }}>
                      <label>Day</label>
                      <div id="en-day" className="sc-seg">
                        <button className="on" data-day="weekday">Weekday</button>
                        <button data-day="weekend">Weekend</button>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontFamily: 'var(--sc-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    <span style={{ color: 'var(--sc-muted-2)' }}>Peak · <span id="en-peak" style={{ color: 'var(--sc-paper)' }}>—</span></span>
                    <span style={{ color: 'var(--sc-muted-2)' }}>Total · <span id="en-tot" style={{ color: 'var(--sc-signal)' }}>—</span></span>
                  </div>
                </div>
                <div className="sc-model-foot">
                  <div className="sc-kpi"><span className="sc-kpi-v sc-signal">MAPE 2.4%</span><span className="sc-kpi-l">vs 6% baseline</span></div>
                  <div className="sc-kpi"><span className="sc-kpi-v">£1.8M</span><span className="sc-kpi-l">Annual savings</span></div>
                </div>
              </article>

              {/* 06 — LOGISTICS: ROUTE */}
              <article className="sc-model-card sc-span-6 sc-reveal" id="demo-route">
                <div className="sc-model-stack">OR-Tools · GNN heuristics<br />VRP solver</div>
                <div className="sc-model-head">
                  <span className="sc-industry"><span className="sc-num">06</span> Logistics &amp; Supply Chain</span>
                </div>
                <h3>The shortest path <span className="sc-it">through every drop.</span></h3>
                <p className="sc-problem">
                  Click optimise — watch dozens of stops collapse from a tangle into a clean loop.
                  Same vans, more drops, less fuel.
                </p>
                <div className="sc-model-demo">
                  <div className="sc-demo-label"><span>Today&#39;s drops</span><span className="sc-live">VRP solver</span></div>
                  <svg id="log-svg" viewBox="0 0 360 220" style={{ width: '100%', height: 'auto', background: 'rgba(0,0,0,0.18)', borderRadius: 3 }} />
                  <div className="sc-ctrl-row" style={{ alignItems: 'flex-end' }}>
                    <div className="sc-ctrl">
                      <label htmlFor="log-stops">Stops <span className="sc-val">14 stops</span></label>
                      <input id="log-stops" type="range" min="6" max="24" defaultValue="14" />
                    </div>
                    <button id="log-opt" className="sc-btn sc-btn-ghost" style={{ padding: '8px 14px', fontSize: 12 }}>
                      Optimise route →
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: 18, marginTop: 10, fontFamily: 'var(--sc-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    <span style={{ color: 'var(--sc-muted-2)' }}>Distance · <span id="log-dist" style={{ color: 'var(--sc-paper)' }}>—</span></span>
                    <span style={{ color: 'var(--sc-muted-2)' }}>ETA · <span id="log-time" style={{ color: 'var(--sc-paper)' }}>—</span></span>
                    <span style={{ color: 'var(--sc-muted-2)', marginLeft: 'auto' }}>Saved · <span id="log-saved" style={{ color: 'var(--sc-signal)' }}>—</span></span>
                  </div>
                </div>
                <div className="sc-model-foot">
                  <div className="sc-kpi"><span className="sc-kpi-v sc-signal">−24%</span><span className="sc-kpi-l">Fuel &amp; miles</span></div>
                  <div className="sc-kpi"><span className="sc-kpi-v">+12%</span><span className="sc-kpi-l">Drops per van</span></div>
                </div>
              </article>

              {/* 07 — TELECOM: CHURN */}
              <article className="sc-model-card sc-span-6 sc-reveal" id="demo-churn">
                <div className="sc-model-stack">LightGBM · survival<br />uplift modelling</div>
                <div className="sc-model-head">
                  <span className="sc-industry"><span className="sc-num">07</span> Telecom</span>
                </div>
                <h3>Stop the customer <span className="sc-it">leaving</span> before they think to.</h3>
                <p className="sc-problem">
                  A churn model that doesn&#39;t just rank risk — it routes each customer
                  to the cheapest retention action that actually works.
                </p>
                <div className="sc-model-demo">
                  <div className="sc-demo-label"><span>Customer profile</span><span className="sc-live">retention engine</span></div>
                  <div className="sc-ctrl-row">
                    <div className="sc-ctrl">
                      <label htmlFor="tc-ten">Tenure <span className="sc-val">8 mo</span></label>
                      <input id="tc-ten" type="range" min="1" max="120" defaultValue="8" />
                    </div>
                    <div className="sc-ctrl">
                      <label htmlFor="tc-mon">Monthly bill <span className="sc-val">£68</span></label>
                      <input id="tc-mon" type="range" min="15" max="200" defaultValue="68" />
                    </div>
                  </div>
                  <div className="sc-ctrl-row">
                    <div className="sc-ctrl">
                      <label htmlFor="tc-sup">Support calls (90d) <span className="sc-val">3 calls</span></label>
                      <input id="tc-sup" type="range" min="0" max="10" defaultValue="3" />
                    </div>
                    <div className="sc-ctrl">
                      <label>Contract</label>
                      <select id="tc-ctr">
                        <option value="monthly">Month-to-month</option>
                        <option value="yearly">1-year</option>
                        <option value="biennial">2-year</option>
                      </select>
                    </div>
                  </div>
                  <div className="sc-ctrl-row" style={{ marginTop: 6 }}>
                    <button id="tc-fiber" className="sc-chip">Fibre service</button>
                  </div>
                  <div style={{ display: 'flex', gap: 24, alignItems: 'center', marginTop: 14 }}>
                    <svg className="sc-dial" id="tc-dial" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="35" fill="none" stroke="rgba(244,236,223,0.15)" strokeWidth="6" />
                      <circle className="dial-fill" cx="50" cy="50" r="35" fill="none" stroke="var(--sc-signal)" strokeWidth="6"
                        strokeLinecap="round" pathLength={220} strokeDasharray="0 220" transform="rotate(-90 50 50)" />
                    </svg>
                    <div>
                      <div style={{ fontFamily: 'var(--sc-display)', fontSize: 30, lineHeight: 1 }} id="tc-prob">—</div>
                      <div style={{ fontFamily: 'var(--sc-mono)', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--sc-muted-2)', marginTop: 4 }}>
                        Churn probability · 90d
                      </div>
                      <div style={{ marginTop: 12 }}><span id="tc-action" className="sc-chip">—</span></div>
                    </div>
                  </div>
                  <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--sc-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    <span style={{ color: 'var(--sc-muted-2)' }}>Estimated LTV at risk</span>
                    <span id="tc-ev" style={{ color: 'var(--sc-signal)' }}>—</span>
                  </div>
                </div>
                <div className="sc-model-foot">
                  <div className="sc-kpi"><span className="sc-kpi-v sc-signal">−31%</span><span className="sc-kpi-l">Voluntary churn</span></div>
                  <div className="sc-kpi"><span className="sc-kpi-v">3.2×</span><span className="sc-kpi-l">ROI on save offers</span></div>
                </div>
              </article>

              {/* 08 — INSURANCE: CLAIMS */}
              <article className="sc-model-card sc-span-6 sc-reveal" id="demo-claims">
                <div className="sc-model-stack">Gradient boosting<br />NLP · vision · tabular</div>
                <div className="sc-model-head">
                  <span className="sc-industry"><span className="sc-num">08</span> Insurance</span>
                </div>
                <h3>Triage claims <span className="sc-it">the second they arrive.</span></h3>
                <p className="sc-problem">
                  Read the claim narrative, score severity and fraud signals, route to the right
                  adjuster lane — and fast-track the obvious ones for instant payout.
                </p>
                <div className="sc-model-demo">
                  <div className="sc-demo-label"><span>Claim narrative · try editing</span><span className="sc-live">analysing</span></div>
                  <textarea id="cl-text" defaultValue="Customer was rear-ended at low speed; minor whiplash, ambulance not called. Photo of damage attached." />
                  <div className="sc-ctrl-row" style={{ marginTop: 10 }}>
                    <div className="sc-ctrl">
                      <label htmlFor="cl-photo">Photo quality <span className="sc-val">75%</span></label>
                      <input id="cl-photo" type="range" min="0" max="100" defaultValue="75" />
                    </div>
                    <div className="sc-ctrl">
                      <label htmlFor="cl-amount">Claim amount <span className="sc-val">£1,800</span></label>
                      <input id="cl-amount" type="range" min="200" max="20000" defaultValue="1800" step="100" />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 14 }}>
                    <div>
                      <div style={{ fontFamily: 'var(--sc-mono)', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--sc-muted-2)' }}>Severity</div>
                      <div style={{ fontFamily: 'var(--sc-display)', fontSize: 28 }}><span id="cl-sev">—</span><span style={{ color: 'var(--sc-muted)' }}>/100</span></div>
                    </div>
                    <div>
                      <div style={{ fontFamily: 'var(--sc-mono)', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--sc-muted-2)' }}>Fraud signal</div>
                      <div style={{ fontFamily: 'var(--sc-display)', fontSize: 28, color: 'var(--sc-signal)' }}><span id="cl-fraud">—</span><span style={{ color: 'var(--sc-muted)' }}>/100</span></div>
                    </div>
                  </div>
                  <div style={{ marginTop: 12 }}><span id="cl-lane" className="sc-chip">—</span></div>
                  <div id="cl-tags" style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }} />
                </div>
                <div className="sc-model-foot">
                  <div className="sc-kpi"><span className="sc-kpi-v sc-signal">2.1 d</span><span className="sc-kpi-l">Cycle time (was 7)</span></div>
                  <div className="sc-kpi"><span className="sc-kpi-v">+£4.2M</span><span className="sc-kpi-l">Fraud caught / yr</span></div>
                </div>
              </article>

              {/* 09 — MARKETING: LTV */}
              <article className="sc-model-card sc-span-6 sc-reveal" id="demo-ltv">
                <div className="sc-model-stack">k-means · DBSCAN<br />BG/NBD · Gamma-Gamma</div>
                <div className="sc-model-head">
                  <span className="sc-industry"><span className="sc-num">09</span> Marketing</span>
                </div>
                <h3>Spend on the customers <span className="sc-it">who&#39;ll pay you back.</span></h3>
                <p className="sc-problem">
                  Cluster the audience by behaviour, attach a predicted lifetime value to each
                  segment, point the CMO at the ones worth winning.
                </p>
                <div className="sc-model-demo">
                  <div className="sc-demo-label"><span>Customer segmentation · RFM</span><span className="sc-live">k-means</span></div>
                  <svg id="mk-svg" viewBox="0 0 360 200" style={{ width: '100%', height: 'auto', background: 'rgba(0,0,0,0.18)', borderRadius: 3 }} />
                  <div className="sc-ctrl-row" style={{ alignItems: 'flex-end' }}>
                    <div className="sc-ctrl">
                      <label>Number of segments</label>
                      <select id="mk-k">
                        <option>3</option>
                        <option>4</option>
                        <option>5</option>
                      </select>
                    </div>
                  </div>
                  <div id="mk-out" style={{ marginTop: 12 }} />
                </div>
                <div className="sc-model-foot">
                  <div className="sc-kpi"><span className="sc-kpi-v sc-signal">+41%</span><span className="sc-kpi-l">Marketing ROI</span></div>
                  <div className="sc-kpi"><span className="sc-kpi-v">−28%</span><span className="sc-kpi-l">CAC on top tier</span></div>
                </div>
              </article>

              {/* 10 — AGRICULTURE */}
              <article className="sc-model-card sc-span-6 sc-reveal" id="demo-agri">
                <div className="sc-model-stack">Random forest + CNN<br />Sentinel-2 NDVI</div>
                <div className="sc-model-head">
                  <span className="sc-industry"><span className="sc-num">10</span> Agriculture</span>
                </div>
                <h3>Yield, field by field, <span className="sc-it">weeks before harvest.</span></h3>
                <p className="sc-problem">
                  Satellite NDVI plus ground tabular data. Forecasts yield per hectare and flags
                  disease pressure before it costs you the crop.
                </p>
                <div className="sc-model-demo">
                  <div className="sc-demo-label"><span>Field 4-B · 28 ha</span><span className="sc-live">satellite</span></div>
                  <div id="ag-field" className="sc-ag-field" />
                  <div className="sc-ctrl-row">
                    <div className="sc-ctrl">
                      <label htmlFor="ag-rain">Rain (30d) <span className="sc-val">110 mm</span></label>
                      <input id="ag-rain" type="range" min="0" max="300" defaultValue="110" />
                    </div>
                    <div className="sc-ctrl">
                      <label htmlFor="ag-temp">Avg temp <span className="sc-val">22 °C</span></label>
                      <input id="ag-temp" type="range" min="5" max="40" defaultValue="22" />
                    </div>
                  </div>
                  <div className="sc-ctrl">
                    <label htmlFor="ag-ndvi">NDVI <span className="sc-val">0.62</span></label>
                    <input id="ag-ndvi" type="range" min="20" max="95" defaultValue="62" />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, fontFamily: 'var(--sc-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    <span style={{ color: 'var(--sc-muted-2)' }}>Yield · <span id="ag-yield" style={{ fontFamily: 'var(--sc-display)', fontSize: 22, color: 'var(--sc-signal)', letterSpacing: 0 }}>—</span></span>
                    <span style={{ color: 'var(--sc-muted-2)' }}>Disease risk · <span id="ag-risk" style={{ color: 'var(--sc-paper)' }}>—</span></span>
                  </div>
                </div>
                <div className="sc-model-foot">
                  <div className="sc-kpi"><span className="sc-kpi-v sc-signal">+11%</span><span className="sc-kpi-l">Yield uplift</span></div>
                  <div className="sc-kpi"><span className="sc-kpi-v">−40%</span><span className="sc-kpi-l">Crop loss to disease</span></div>
                </div>
              </article>

              {/* 11 — FINANCE: CREDIT */}
              <article className="sc-model-card sc-span-7 sc-reveal" id="demo-credit">
                <div className="sc-model-stack">XGBoost · monotonic<br />SHAP explanations</div>
                <div className="sc-model-head">
                  <span className="sc-industry"><span className="sc-num">11</span> Finance · Underwriting</span>
                </div>
                <h3>Lend confidently. <span className="sc-it">Explain every no.</span></h3>
                <p className="sc-problem">
                  Credit decisioning that&#39;s accurate, monotonic-by-design, and produces a
                  regulator-ready reason for every approval, decline and price.
                </p>
                <div className="sc-model-demo">
                  <div className="sc-demo-label"><span>Applicant</span><span className="sc-live">scoring</span></div>
                  <div className="sc-ctrl-row">
                    <div className="sc-ctrl">
                      <label htmlFor="cr-inc">Annual income <span className="sc-val">£42,000</span></label>
                      <input id="cr-inc" type="range" min="14000" max="180000" defaultValue="42000" step="500" />
                    </div>
                    <div className="sc-ctrl">
                      <label htmlFor="cr-debt">Existing debt <span className="sc-val">£6,000</span></label>
                      <input id="cr-debt" type="range" min="0" max="80000" defaultValue="6000" step="500" />
                    </div>
                  </div>
                  <div className="sc-ctrl-row">
                    <div className="sc-ctrl">
                      <label htmlFor="cr-util">Credit utilisation <span className="sc-val">35%</span></label>
                      <input id="cr-util" type="range" min="0" max="100" defaultValue="35" />
                    </div>
                    <div className="sc-ctrl">
                      <label htmlFor="cr-hist">Credit history <span className="sc-val">42 mo</span></label>
                      <input id="cr-hist" type="range" min="3" max="240" defaultValue="42" />
                    </div>
                  </div>
                  <div className="sc-ctrl">
                    <label htmlFor="cr-dq">Delinquencies (24 mo) <span className="sc-val">0</span></label>
                    <input id="cr-dq" type="range" min="0" max="6" defaultValue="0" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 24, alignItems: 'center', marginTop: 14 }}>
                    <div>
                      <div style={{ fontFamily: 'var(--sc-display)', fontSize: 48, lineHeight: 1 }} id="cr-score">—</div>
                      <div style={{ fontFamily: 'var(--sc-mono)', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--sc-muted-2)', marginTop: 4 }}>Score</div>
                      <div style={{ marginTop: 10 }}><span id="cr-tier" className="sc-chip">—</span></div>
                      <div style={{ marginTop: 10, fontFamily: 'var(--sc-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--sc-muted-2)' }}>
                        APR · <span id="cr-apr" style={{ color: 'var(--sc-signal)' }}>—</span>
                      </div>
                    </div>
                    <div id="cr-factors" />
                  </div>
                </div>
                <div className="sc-model-foot">
                  <div className="sc-kpi"><span className="sc-kpi-v sc-signal">+9pp</span><span className="sc-kpi-l">Approval rate</span></div>
                  <div className="sc-kpi"><span className="sc-kpi-v">−18%</span><span className="sc-kpi-l">Default losses</span></div>
                  <div className="sc-kpi"><span className="sc-kpi-v">100%</span><span className="sc-kpi-l">Reasoned decisions</span></div>
                </div>
              </article>

              {/* 12 — HEALTHCARE: PATIENT RISK */}
              <article className="sc-model-card sc-span-5 sc-reveal" id="demo-patient">
                <div className="sc-model-stack">Transformer · EHR<br />5-year horizon</div>
                <div className="sc-model-head">
                  <span className="sc-industry"><span className="sc-num">12</span> Healthcare</span>
                </div>
                <h3>Patient risk, <span className="sc-it">five years ahead.</span></h3>
                <p className="sc-problem">
                  Read the EHR, project cardio-metabolic risk year by year, route patients
                  to the right intervention before they end up in A&amp;E.
                </p>
                <div className="sc-model-demo">
                  <div className="sc-demo-label"><span>5-year risk trajectory</span><span className="sc-live">forecast</span></div>
                  <svg id="pt-svg" viewBox="0 0 360 140" style={{ width: '100%', height: 'auto' }} />
                  <div className="sc-ctrl-row">
                    <div className="sc-ctrl">
                      <label htmlFor="pt-age">Age <span className="sc-val">52 yr</span></label>
                      <input id="pt-age" type="range" min="20" max="85" defaultValue="52" />
                    </div>
                    <div className="sc-ctrl">
                      <label htmlFor="pt-bmi">BMI <span className="sc-val">27.0</span></label>
                      <input id="pt-bmi" type="range" min="18" max="42" defaultValue="27" step="0.5" />
                    </div>
                  </div>
                  <div className="sc-ctrl-row">
                    <div className="sc-ctrl">
                      <label htmlFor="pt-bp">Systolic BP <span className="sc-val">132 mmHg</span></label>
                      <input id="pt-bp" type="range" min="100" max="180" defaultValue="132" />
                    </div>
                    <div className="sc-ctrl">
                      <label htmlFor="pt-a1c">HbA1c <span className="sc-val">5.8%</span></label>
                      <input id="pt-a1c" type="range" min="4.5" max="11" defaultValue="5.8" step="0.1" />
                    </div>
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <button id="pt-smoker" className="sc-chip">Smoker</button>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
                    <div>
                      <div style={{ fontFamily: 'var(--sc-display)', fontSize: 30, lineHeight: 1 }} id="pt-out">—</div>
                      <div style={{ fontFamily: 'var(--sc-mono)', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--sc-muted-2)', marginTop: 4 }}>
                        5-yr cardio risk
                      </div>
                    </div>
                    <span id="pt-action" className="sc-chip">—</span>
                  </div>
                </div>
                <div className="sc-model-foot">
                  <div className="sc-kpi"><span className="sc-kpi-v sc-signal">+2,300</span><span className="sc-kpi-l">High-risk found / yr</span></div>
                  <div className="sc-kpi"><span className="sc-kpi-v">−14%</span><span className="sc-kpi-l">Hospital readmits</span></div>
                </div>
              </article>

            </div>
          </div>
        </section>

        {/* ── PROCESS ───────────────────────────────────────────── */}
        <section id="process" className="sc-process">
          <div className="sc-wrap">
            <div className="sc-section-head sc-reveal">
              <div className="sc-section-num"><span className="sc-n">03 ·</span> The engagement</div>
              <div>
                <h2 className="sc-section-title">
                  From your messy data <span className="sc-it">to a model in production</span> — in weeks, not quarters.
                </h2>
              </div>
            </div>
            <div className="sc-process-row">
              {[
                { num: '01 · WEEK 1', title: 'Discover', body: 'We sit with your operators, your data, your pain. We leave with the one model that will actually move the metric.' },
                { num: '02 · WEEK 2–4', title: 'Prototype', body: 'A working model on your data, end-to-end. Not a slide. Not a notebook. A thing the team can poke at.' },
                { num: '03 · WEEK 5–8', title: 'Productionise', body: 'Latency, monitoring, drift, retraining, hand-off. The boring parts done properly so the model still works in month six.' },
                { num: '04 · ONGOING', title: 'Compound', body: 'We stay close. Every model gets better with every quarter of data. Your edge widens, not erodes.' },
              ].map((s) => (
                <div key={s.num} className="sc-process-step sc-reveal">
                  <div className="sc-step-num">{s.num}</div>
                  <h4>{s.title}</h4>
                  <p>{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────── */}
        <section id="contact" className="sc-cta">
          <div className="sc-wrap sc-cta-inner sc-reveal">
            <div>
              <h2>Bring us your <span className="sc-it">hardest</span> problem.</h2>
              <p>
                Tell us the metric you&#39;d most like to move. We&#39;ll come back inside three working days
                with the model archetype, the data we&#39;d need, and a fixed-fee discovery sprint.
              </p>
              <Link href="/contact" className="sc-btn sc-btn-primary">
                Book a discovery call <span className="sc-arr">→</span>
              </Link>
            </div>
            <div className="sc-cta-card">
              <h5>· Direct line</h5>
              <div className="sc-cta-row">
                <span className="sc-cta-k">Email</span>
                <a className="sc-cta-v" href="mailto:info@videbimusai.com">info@videbimusai.com</a>
              </div>
              <div className="sc-cta-row">
                <span className="sc-cta-k">Phone</span>
                <a className="sc-cta-v" href="tel:+447442852675">+44 7442 852675</a>
              </div>
              <div className="sc-cta-row">
                <span className="sc-cta-k">Web</span>
                <a className="sc-cta-v" href="https://www.videbimusai.com" target="_blank" rel="noopener noreferrer">www.videbimusai.com</a>
              </div>
            </div>
          </div>
        </section>

        {/* Demos JS — original file from design handoff, loads after page is interactive */}
        <Script src="/showcase-demos.js" strategy="afterInteractive" />
        <Script id="showcase-boot" strategy="afterInteractive">{`
          (function() {
            // Bridge: expose the original demos.js CSS var names (--signal, --paper etc.)
            // inside .showcase-root so the vanilla JS can reference them without modification.
            var style = document.createElement('style');
            style.textContent = '.showcase-root{--signal:oklch(76% 0.14 64);--signal-2:oklch(66% 0.16 50);--signal-soft:oklch(76% 0.14 64 / 0.16);--paper:#f4ecdf;--muted:rgba(244,236,223,0.62);--muted-2:rgba(244,236,223,0.42);--ink:#0a1628;--rule:rgba(244,236,223,0.14);--rule-strong:rgba(244,236,223,0.32);--good:oklch(78% 0.13 165);--bad:oklch(68% 0.18 25);--display:"Instrument Serif","Times New Roman",serif;--mono:"JetBrains Mono",ui-monospace,"SF Mono",Menlo,monospace;--sans:"Inter Tight",ui-sans-serif,system-ui,sans-serif;}';
            document.head.appendChild(style);

            // Hero tickers
            var tickHost = document.getElementById('sc-tickers');
            if (tickHost) {
              var lines = ['loss 0.0142','AUC 0.94','epoch 47/120','f1 0.91','p99 28ms','drift 0.06','RMSE 1.12','AUPRC 0.89','lr 3e-4','tokens 2.4M','MAPE 4.1%','recall 0.93'];
              lines.forEach(function(l, i) {
                var t = document.createElement('div');
                t.className = 'sc-tick';
                t.textContent = l;
                var angle = (i / lines.length) * Math.PI * 2;
                t.style.left = (50 + Math.cos(angle) * 46) + '%';
                t.style.top = (50 + Math.sin(angle) * 46) + '%';
                t.style.animationDelay = (i * 0.6) + 's';
                tickHost.appendChild(t);
              });
            }

            // Scroll reveals
            var io = new IntersectionObserver(function(entries) {
              entries.forEach(function(e) {
                if (e.isIntersecting) { e.target.classList.add('sc-in'); io.unobserve(e.target); }
              });
            }, { threshold: 0.1 });
            document.querySelectorAll('.sc-reveal').forEach(function(el) { io.observe(el); });
          })();
        `}</Script>
      </div>

      <style>{showcaseStyles}</style>
    </>
  )
}

const showcaseStyles = `
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter+Tight:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

.showcase-root {
  --sc-ink: #0a1628;
  --sc-ink-2: #0f1d33;
  --sc-ink-3: #182840;
  --sc-paper: #f4ecdf;
  --sc-paper-2: #ebe1d0;
  --sc-rule: rgba(244,236,223,0.14);
  --sc-rule-strong: rgba(244,236,223,0.32);
  --sc-muted: rgba(244,236,223,0.62);
  --sc-muted-2: rgba(244,236,223,0.42);
  --sc-signal: oklch(76% 0.14 64);
  --sc-signal-2: oklch(66% 0.16 50);
  --sc-signal-soft: oklch(76% 0.14 64 / 0.16);
  --sc-good: oklch(78% 0.13 165);
  --sc-bad: oklch(68% 0.18 25);
  --sc-display: "Instrument Serif", "Times New Roman", serif;
  --sc-sans: "Inter Tight", ui-sans-serif, system-ui, sans-serif;
  --sc-mono: "JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace;
  background: var(--sc-ink);
  color: var(--sc-paper);
  font-family: var(--sc-sans);
  font-size: 16px;
  line-height: 1.55;
  -webkit-font-smoothing: antialiased;
}

/* ── LAYOUT ── */
.sc-wrap { width: min(1280px, 92vw); margin: 0 auto; }

/* ── HERO ── */
.sc-hero {
  min-height: 100vh;
  padding: 140px 0 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  overflow: hidden;
}
.sc-hero-grid {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 80px;
  align-items: center;
}
.sc-eyebrow {
  font-family: var(--sc-mono);
  font-size: 11px;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: var(--sc-signal);
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
}
.sc-dot {
  width: 6px; height: 6px;
  background: var(--sc-signal);
  border-radius: 50%;
  display: inline-block;
  animation: sc-pulse 2.4s ease-out infinite;
}
@keyframes sc-pulse {
  0% { box-shadow: 0 0 0 0 oklch(76% 0.14 64 / 0.6); }
  100% { box-shadow: 0 0 0 14px oklch(76% 0.14 64 / 0); }
}
.showcase-root h1 {
  font-family: var(--sc-display);
  font-weight: 400;
  font-size: clamp(48px, 7.4vw, 104px);
  line-height: 0.95;
  letter-spacing: -0.015em;
  margin: 0 0 36px;
  text-wrap: balance;
  color: var(--sc-paper);
}
.sc-strike {
  position: relative;
  white-space: nowrap;
}
.sc-strike::after {
  content: "";
  position: absolute;
  left: -2%; right: -2%; top: 56%;
  height: 2px;
  background: var(--sc-signal);
  transform: scaleX(0);
  transform-origin: left;
  animation: sc-strike 1.6s 0.8s cubic-bezier(.6,.05,.2,1) forwards;
}
@keyframes sc-strike { to { transform: scaleX(1); } }
.sc-it { font-style: italic; color: var(--sc-signal); }
.sc-lede {
  font-size: 19px;
  max-width: 520px;
  color: var(--sc-paper);
  margin: 0 0 40px;
  line-height: 1.5;
}
.sc-quiet { color: var(--sc-muted); }
.sc-cta-row { display: flex; gap: 14px; align-items: center; flex-wrap: wrap; }
.sc-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 22px;
  border-radius: 999px;
  font-size: 14px;
  letter-spacing: 0.01em;
  transition: all .25s ease;
  text-decoration: none;
  font-family: var(--sc-sans);
  cursor: pointer;
}
.sc-btn-primary { background: var(--sc-paper); color: var(--sc-ink); border: none; }
.sc-btn-primary:hover { background: var(--sc-signal); color: var(--sc-ink); transform: translateY(-1px); }
.sc-btn-ghost { border: 1px solid var(--sc-rule-strong); color: var(--sc-paper); background: none; }
.sc-btn-ghost:hover { border-color: var(--sc-paper); }
.sc-arr { transition: transform .25s; }
.sc-btn:hover .sc-arr { transform: translateX(4px); }
.sc-hero-meta {
  margin-top: 56px;
  display: flex;
  gap: 40px;
  flex-wrap: wrap;
  padding-top: 32px;
  border-top: 1px solid var(--sc-rule);
}
.sc-stat { display: flex; flex-direction: column; gap: 6px; }
.sc-num {
  font-family: var(--sc-display);
  font-size: 36px;
  line-height: 1;
}
.sc-lbl {
  font-family: var(--sc-mono);
  font-size: 10px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--sc-muted-2);
}

/* ── HERO VIZ ── */
.sc-hero-viz {
  position: relative;
  aspect-ratio: 1/1;
  max-width: 520px;
  margin-left: auto;
}
.sc-hero-viz svg { width: 100%; height: 100%; overflow: visible; }
.sc-ring {
  position: absolute; inset: 0;
  border-radius: 50%;
  border: 1px solid var(--sc-rule);
}
.sc-r2 { inset: 14%; border-color: rgba(244,236,223,0.08); }
.sc-r3 { inset: 28%; border-color: rgba(244,236,223,0.05); }
.sc-spinner {
  inset: -2%;
  border: 1px dashed var(--sc-rule-strong);
  border-top-color: var(--sc-signal);
  border-right-color: transparent;
  border-bottom-color: transparent;
  animation: sc-spin 22s linear infinite;
}
@keyframes sc-spin { to { transform: rotate(360deg); } }
.sc-tickers { position: absolute; pointer-events: none; inset: 0; }
.sc-tick {
  position: absolute;
  font-family: var(--sc-mono);
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--sc-muted);
  opacity: 0;
  animation: sc-ticker 8s linear infinite;
}
.sc-tick::before {
  content: "";
  display: inline-block;
  width: 16px; height: 1px;
  background: var(--sc-signal);
  margin-right: 8px;
  vertical-align: middle;
}
@keyframes sc-ticker {
  0%, 100% { opacity: 0; }
  10%, 90% { opacity: 1; }
}

/* ── SECTION HEADERS ── */
.sc-section-head {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 60px;
  padding: 100px 0 56px;
  align-items: end;
  border-top: 1px solid var(--sc-rule);
}
.sc-section-num {
  font-family: var(--sc-mono);
  font-size: 11px;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: var(--sc-muted-2);
  display: flex;
  gap: 12px;
  align-items: baseline;
}
.sc-n { color: var(--sc-signal); font-size: 13px; }
.sc-section-title {
  font-family: var(--sc-display);
  font-weight: 400;
  font-size: clamp(36px, 4.4vw, 60px);
  line-height: 1.0;
  letter-spacing: -0.012em;
  margin: 0;
  color: var(--sc-paper);
}
.sc-section-sub {
  margin-top: 18px;
  max-width: 60ch;
  color: var(--sc-muted);
  font-size: 16px;
}

/* ── MODELS GRID ── */
.sc-models-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1px;
  background: var(--sc-rule);
  border: 1px solid var(--sc-rule);
  margin-bottom: 80px;
}
.sc-model-card {
  background: var(--sc-ink);
  padding: 36px 32px;
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 460px;
  grid-column: span 6;
  transition: background .35s;
  overflow: hidden;
}
.sc-model-card:hover { background: var(--sc-ink-2); }
.sc-span-12 { grid-column: span 12; }
.sc-span-4 { grid-column: span 4; }
.sc-span-5 { grid-column: span 5; }
.sc-span-6 { grid-column: span 6; }
.sc-span-7 { grid-column: span 7; }
.sc-span-8 { grid-column: span 8; }

.sc-model-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 24px;
}
.sc-industry {
  font-family: var(--sc-mono);
  font-size: 10px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--sc-muted-2);
}
.sc-industry .sc-num { color: var(--sc-signal); margin-right: 10px; font-size: 10px; }
.sc-model-card h3 {
  font-family: var(--sc-display);
  font-weight: 400;
  font-size: 32px;
  line-height: 1.05;
  letter-spacing: -0.005em;
  margin: 0 0 12px;
  color: var(--sc-paper);
}
.sc-problem {
  color: var(--sc-muted);
  font-size: 14px;
  line-height: 1.55;
  margin: 0 0 24px;
  max-width: 44ch;
}
.sc-model-stack {
  position: absolute;
  top: 24px; right: 24px;
  font-family: var(--sc-mono);
  font-size: 9px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--sc-muted-2);
  text-align: right;
  line-height: 1.6;
}
.sc-model-demo {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: rgba(0,0,0,0.18);
  border: 1px solid var(--sc-rule);
  border-radius: 4px;
  padding: 18px;
  min-height: 200px;
  position: relative;
}
.sc-demo-label {
  font-family: var(--sc-mono);
  font-size: 9px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--sc-muted-2);
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}
.sc-live {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--sc-signal);
}
.sc-live::before {
  content: "";
  width: 5px; height: 5px;
  border-radius: 50%;
  background: var(--sc-signal);
  animation: sc-blink 1.6s ease-in-out infinite;
}
@keyframes sc-blink { 50% { opacity: 0.3; } }
.sc-model-foot {
  display: flex;
  gap: 24px;
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px solid var(--sc-rule);
}
.sc-kpi { display: flex; flex-direction: column; }
.sc-kpi-v {
  font-family: var(--sc-display);
  font-size: 22px;
  line-height: 1;
  color: var(--sc-paper);
}
.sc-kpi-v.sc-signal { color: var(--sc-signal); }
.sc-kpi-l {
  font-family: var(--sc-mono);
  font-size: 9px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--sc-muted-2);
  margin-top: 6px;
}

/* ── CONTROLS ── */
.sc-ctrl-row {
  display: flex;
  gap: 14px;
  align-items: center;
  flex-wrap: wrap;
  margin: 8px 0;
}
.sc-ctrl {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 110px;
}
.sc-ctrl label {
  font-family: var(--sc-mono);
  font-size: 9px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--sc-muted-2);
  display: flex;
  justify-content: space-between;
}
.sc-val { color: var(--sc-paper); }
.showcase-root input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 2px;
  background: var(--sc-rule-strong);
  border-radius: 2px;
  outline: none;
}
.showcase-root input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px; height: 14px;
  border-radius: 50%;
  background: var(--sc-signal);
  cursor: pointer;
  border: 2px solid var(--sc-ink);
  box-shadow: 0 0 0 0 var(--sc-signal-soft);
  transition: box-shadow .2s;
}
.showcase-root input[type="range"]::-webkit-slider-thumb:hover {
  box-shadow: 0 0 0 6px var(--sc-signal-soft);
}
.showcase-root select {
  background: rgba(0,0,0,0.3);
  border: 1px solid var(--sc-rule-strong);
  border-radius: 4px;
  padding: 8px 10px;
  color: var(--sc-paper);
  font-family: var(--sc-mono);
  font-size: 11px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  outline: none;
  width: 100%;
}
.showcase-root textarea {
  width: 100%;
  min-height: 56px;
  resize: vertical;
  background: rgba(0,0,0,0.3);
  border: 1px solid var(--sc-rule-strong);
  border-radius: 4px;
  padding: 10px 12px;
  color: var(--sc-paper);
  font-size: 13px;
  font-family: var(--sc-sans);
  outline: none;
}
.showcase-root textarea:focus { border-color: var(--sc-signal); }
.sc-seg {
  display: inline-flex;
  gap: 0;
  border: 1px solid var(--sc-rule-strong);
  border-radius: 999px;
  padding: 3px;
  font-family: var(--sc-mono);
  font-size: 10px;
  letter-spacing: 0.12em;
}
.sc-seg button {
  padding: 6px 12px;
  border-radius: 999px;
  color: var(--sc-muted);
  text-transform: uppercase;
  transition: all .2s;
  background: none;
  border: none;
  cursor: pointer;
  font: inherit;
}
.sc-seg button.on { background: var(--sc-paper); color: var(--sc-ink); }
.sc-chip {
  font-family: var(--sc-mono);
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  padding: 4px 10px;
  border: 1px solid var(--sc-rule-strong);
  border-radius: 999px;
  color: var(--sc-muted);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all .2s;
  cursor: pointer;
  background: none;
  font: inherit;
}
.sc-chip:hover { border-color: var(--sc-paper); color: var(--sc-paper); }
.sc-chip.on { background: var(--sc-signal); color: var(--sc-ink); border-color: var(--sc-signal); }

/* ── GAUGE ── */
.sc-gauge-wrap { display: grid; place-items: center; padding: 8px 0 16px; }
.sc-gauge { width: 220px; height: 130px; position: relative; }
.sc-gauge svg { width: 100%; height: 100%; overflow: visible; }
.gauge-needle { transform-origin: 110px 110px; transition: transform .5s cubic-bezier(.6,.05,.2,1); }
.sc-gauge-readout {
  position: absolute; left: 0; right: 0; bottom: -2px; text-align: center;
}
.sc-gauge-num { font-family: var(--sc-display); font-size: 38px; line-height: 1; }
.sc-gauge-lbl { font-family: var(--sc-mono); font-size: 9px; letter-spacing: 0.24em; text-transform: uppercase; color: var(--sc-muted-2); margin-top: 4px; }

/* ── RECOMMENDER ── */
.sc-rec-grid-wrap { display: flex; flex-wrap: wrap; gap: 6px; margin: 10px 0 16px; }
.sc-rec-cart {
  display: flex; flex-wrap: wrap; gap: 6px; min-height: 28px; padding: 10px;
  background: rgba(0,0,0,0.18);
  border: 1px dashed var(--sc-rule-strong);
  border-radius: 4px;
  margin-bottom: 14px;
}
.sc-rec-out { display: flex; flex-direction: column; gap: 8px; }
.rec-row { display: grid; grid-template-columns: 70px 1fr 40px; gap: 12px; align-items: center; }
.rec-bar { height: 4px; background: var(--sc-rule); border-radius: 2px; overflow: hidden; }
.rec-fill { height: 100%; background: var(--sc-signal); transition: width .5s; }
.rec-name { font-size: 13px; color: var(--sc-paper); }
.rec-score { font-family: var(--sc-mono); font-size: 10px; color: var(--sc-muted); text-align: right; }

/* ── SEGMENTATION ── */
.seg-row { display: grid; grid-template-columns: 14px 1fr auto; gap: 12px; align-items: center; padding: 6px 0; border-bottom: 1px solid var(--sc-rule); }
.seg-row:last-child { border-bottom: 0; }
.seg-dot { width: 10px; height: 10px; border-radius: 50%; }
.seg-name { font-size: 13px; color: var(--sc-paper); }
.seg-ltv { font-family: var(--sc-mono); font-size: 11px; color: var(--sc-signal); letter-spacing: 0.04em; }

/* ── AGRICULTURE FIELD ── */
.sc-ag-field { display: grid; grid-template-columns: repeat(12, 1fr); gap: 2px; aspect-ratio: 12/6; margin: 4px 0 8px; }
.ag-cell { border-radius: 1.5px; transition: background .4s; }

/* ── WATERFALL (credit) ── */
.wf-row { display: grid; grid-template-columns: 110px 1fr 36px; gap: 10px; align-items: center; padding: 4px 0; }
.wf-label { font-size: 12px; color: var(--sc-muted); }
.wf-bar { height: 6px; position: relative; background: rgba(0,0,0,0.25); border-radius: 2px; }
.wf-axis { position: absolute; top: -2px; bottom: -2px; left: 50%; width: 1px; background: var(--sc-rule-strong); }
.wf-fill { position: absolute; top: 0; bottom: 0; border-radius: 2px; transition: width .4s; }
.wf-fill.pos { background: var(--sc-good); }
.wf-fill.neg { background: var(--sc-bad); }
.wf-val { font-family: var(--sc-mono); font-size: 11px; text-align: right; }
.wf-val.pos { color: var(--sc-good); }
.wf-val.neg { color: var(--sc-bad); }

/* ── DIAL ── */
.sc-dial { width: 110px; height: 110px; }
.sc-dial circle.dial-fill { transition: stroke-dasharray .5s; }

/* ── PROCESS ── */
.sc-process { padding: 80px 0 120px; }
.sc-process-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 32px;
  margin-top: 48px;
}
.sc-process-step {
  border-top: 1px solid var(--sc-rule-strong);
  padding-top: 24px;
  position: relative;
}
.sc-process-step::before {
  content: "";
  position: absolute;
  top: -1px; left: 0;
  width: 32px; height: 1px;
  background: var(--sc-signal);
}
.sc-step-num {
  font-family: var(--sc-mono);
  font-size: 10px;
  letter-spacing: 0.28em;
  color: var(--sc-signal);
  margin-bottom: 14px;
}
.sc-process-step h4 {
  font-family: var(--sc-display);
  font-weight: 400;
  font-size: 26px;
  margin: 0 0 10px;
  line-height: 1.05;
  color: var(--sc-paper);
}
.sc-process-step p { color: var(--sc-muted); font-size: 14px; margin: 0; }

/* ── CTA ── */
.sc-cta {
  padding: 100px 0;
  border-top: 1px solid var(--sc-rule);
  position: relative;
  overflow: hidden;
}
.sc-cta::before {
  content: "";
  position: absolute; inset: 0;
  background:
    radial-gradient(900px 380px at 80% 30%, oklch(76% 0.14 64 / 0.10), transparent 60%),
    radial-gradient(700px 300px at 20% 70%, oklch(66% 0.16 50 / 0.08), transparent 60%);
  pointer-events: none;
}
.sc-cta-inner {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: center;
}
.sc-cta h2 {
  font-family: var(--sc-display);
  font-weight: 400;
  font-size: clamp(40px, 5vw, 68px);
  line-height: 1.0;
  letter-spacing: -0.012em;
  margin: 0 0 24px;
  color: var(--sc-paper);
}
.sc-cta p { color: var(--sc-muted); font-size: 17px; max-width: 46ch; margin: 0 0 32px; }
.sc-cta-card {
  border: 1px solid var(--sc-rule-strong);
  padding: 32px;
  border-radius: 4px;
  background: rgba(0,0,0,0.2);
}
.sc-cta-card h5 {
  font-family: var(--sc-mono);
  font-size: 11px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--sc-signal);
  margin: 0 0 18px;
}
.sc-cta-row {
  display: flex;
  align-items: baseline;
  gap: 12px;
  padding: 14px 0;
  border-bottom: 1px solid var(--sc-rule);
}
.sc-cta-row:last-child { border-bottom: 0; }
.sc-cta-k {
  font-family: var(--sc-mono);
  font-size: 10px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--sc-muted-2);
  width: 80px;
  flex-shrink: 0;
}
.sc-cta-v {
  font-family: var(--sc-display);
  font-size: 20px;
  color: var(--sc-paper);
  text-decoration: none;
  flex: 1;
}
.sc-cta-v:hover { color: var(--sc-signal); }

/* ── REVEAL ── */
.sc-reveal { opacity: 0; transform: translateY(24px); transition: opacity .9s ease, transform .9s ease; }
.sc-reveal.sc-in { opacity: 1; transform: none; }

/* ── ROUTE ANIMATION ── */
@keyframes draw { to { stroke-dashoffset: 0; } }

/* ── RESPONSIVE ── */
@media (max-width: 980px) {
  .sc-hero-grid { grid-template-columns: 1fr; gap: 48px; }
  .sc-hero-viz { max-width: 360px; margin: 0 auto; }
  .sc-section-head { grid-template-columns: 1fr; gap: 20px; padding: 64px 0 32px; }
  .sc-models-grid { grid-template-columns: 1fr; }
  .sc-model-card,
  .sc-span-4, .sc-span-5, .sc-span-6, .sc-span-7, .sc-span-8, .sc-span-12 {
    grid-column: span 1;
    min-height: auto;
  }
  .sc-process-row { grid-template-columns: 1fr 1fr; }
  .sc-cta-inner { grid-template-columns: 1fr; gap: 32px; }
}
@media (max-width: 560px) {
  .sc-process-row { grid-template-columns: 1fr; }
  .sc-hero-meta { gap: 24px; }
  .sc-model-card { padding: 28px 22px; }
}
`
