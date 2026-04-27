// dangerouslySetInnerHTML below is safe: content is a static string literal (JSON-LD structured data),
// never derived from user input.
import type { Metadata } from 'next'
import Script from 'next/script'
import Link from 'next/link'
import { Brain, TrendingUp, Clock, Zap, ArrowRight } from 'lucide-react'
import { ShowcaseGrid } from './showcase-grid'

export const metadata: Metadata = {
  title: 'AI Model Showcase — 12 Live Interactive ML Demos | Videbimus AI',
  description:
    'Interact with 12 live ML models across finance, healthcare, retail, manufacturing, energy, logistics, telecom, insurance, marketing, and agriculture. Real architectures, real business outcomes.',
  keywords: [
    'AI model demos', 'machine learning showcase', 'fraud detection AI',
    'predictive maintenance ML', 'healthcare AI radiology', 'recommendation system demo',
    'churn prediction model', 'credit scoring AI', 'supply chain optimization',
    'energy load forecasting', 'Videbimus AI', 'bespoke ML consulting',
  ],
  openGraph: {
    title: 'AI Model Showcase — 12 Live Interactive ML Demos | Videbimus AI',
    description: 'Finance, healthcare, retail, manufacturing and more. Every card is a live miniature of a system we ship. Move sliders, watch the model respond.',
    url: 'https://videbimus.ai/showcase',
    images: [{ url: '/og-showcase.jpg', width: 1200, height: 630, alt: 'Videbimus AI Model Showcase' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Model Showcase — 12 Live Interactive ML Demos | Videbimus AI',
    description: 'Interact with 12 production ML models across 10 industries.',
    images: ['/og-showcase.jpg'],
  },
  alternates: { canonical: 'https://videbimus.ai/showcase' },
}

const structuredData = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Videbimus AI — Model Showcase',
  description: 'Interactive demonstrations of 12 production ML systems across 10 industries.',
  url: 'https://videbimus.ai/showcase',
  provider: { '@type': 'Organization', name: 'Videbimus AI', url: 'https://videbimus.ai' },
  mainEntity: {
    '@type': 'ItemList',
    name: 'ML Model Portfolio',
    numberOfItems: 12,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Real-time Fraud Decisioning', description: 'XGBoost · 312 features · p99 < 30ms' },
      { '@type': 'ListItem', position: 2, name: 'Radiology Triage (Chest X-ray)', description: 'CNN · ResNet-152 · Grad-CAM' },
      { '@type': 'ListItem', position: 3, name: 'E-commerce Recommendations', description: 'Two-tower · ANN · collaborative filtering' },
      { '@type': 'ListItem', position: 4, name: 'Predictive Maintenance (RUL)', description: 'LSTM · attention · signal RUL' },
      { '@type': 'ListItem', position: 5, name: 'Energy Load Forecasting', description: 'N-BEATS · temporal fusion · 24h' },
      { '@type': 'ListItem', position: 6, name: 'Logistics Route Optimisation', description: 'OR-Tools · GNN · VRP solver' },
      { '@type': 'ListItem', position: 7, name: 'Telecom Churn Prevention', description: 'LightGBM · survival · uplift' },
      { '@type': 'ListItem', position: 8, name: 'Insurance Claims Triage', description: 'Gradient boosting · NLP · vision' },
      { '@type': 'ListItem', position: 9, name: 'Customer LTV Segmentation', description: 'k-means · DBSCAN · BG/NBD' },
      { '@type': 'ListItem', position: 10, name: 'Crop Yield Forecasting', description: 'Random forest + CNN · Sentinel-2' },
      { '@type': 'ListItem', position: 11, name: 'Credit Risk Underwriting', description: 'XGBoost · monotonic · SHAP' },
      { '@type': 'ListItem', position: 12, name: 'Patient Cardio-Metabolic Risk', description: 'Transformer · EHR · 5-year' },
    ],
  },
})

export const models = [
  {
    id: 'demo-fraud', span: 'lg:col-span-2', sector: 'Finance',
    num: '01', industry: 'Finance · Banking',
    stack: 'XGBoost · 312 features · p99 < 30 ms',
    title: 'Real-time fraud decisioning at the swipe.',
    problem: 'Score every card transaction in under 30 ms. Approve good customers without friction, step-up the suspicious, block the obviously bad — and explain every decision.',
    kpis: [{ v: '−47%', l: 'Fraud losses' }, { v: '−62%', l: 'False positives' }, { v: '28 ms', l: 'p99 latency' }],
    demo: 'fraud',
    accent: '#00E5FF',
  },
  {
    id: 'demo-xray', span: 'lg:col-span-1', sector: 'Healthcare',
    num: '02', industry: 'Healthcare',
    stack: 'CNN · ResNet-152 · Grad-CAM',
    title: 'Triage radiology in seconds.',
    problem: 'A vision model that flags pneumonia, cardiomegaly and nodules, and shows the radiologist exactly where it looked.',
    kpis: [{ v: '0.94', l: 'AUROC' }, { v: '1.4 s', l: 'Read time' }],
    demo: 'xray',
    accent: '#00B894',
  },
  {
    id: 'demo-recs', span: 'lg:col-span-1', sector: 'Retail',
    num: '03', industry: 'Retail · E-commerce',
    stack: 'Two-tower · ANN · collaborative filtering',
    title: 'Recommendations that actually convert.',
    problem: 'Add a few items to a basket — watch the model re-rank the catalogue in real time based on what shoppers like this one usually buy together.',
    kpis: [{ v: '+34%', l: 'Avg order value' }, { v: '+18%', l: 'CTR on PDP' }],
    demo: 'recs',
    accent: '#6C5CE7',
  },
  {
    id: 'demo-rul', span: 'lg:col-span-1', sector: 'Manufacturing',
    num: '04', industry: 'Manufacturing',
    stack: 'LSTM · attention · signal RUL',
    title: 'Service the machine before it breaks.',
    problem: 'Sensor data in, hours-of-life-remaining out. Replace expensive emergency call-outs with calm, planned maintenance windows.',
    kpis: [{ v: '−38%', l: 'Unplanned downtime' }, { v: '+22%', l: 'Asset lifespan' }],
    demo: 'rul',
    accent: '#FDCB6E',
  },
  {
    id: 'demo-load', span: 'lg:col-span-1', sector: 'Energy',
    num: '05', industry: 'Energy · Utilities',
    stack: 'N-BEATS · temporal fusion · 24h horizon',
    title: "Forecast tomorrow's grid demand.",
    problem: "Hour-by-hour load prediction so traders buy the right block, operators schedule the right plant, and nobody pays the imbalance penalty.",
    kpis: [{ v: 'MAPE 2.4%', l: 'vs 6% baseline' }, { v: '£1.8M', l: 'Annual savings' }],
    demo: 'load',
    accent: '#F9CA24',
  },
  {
    id: 'demo-route', span: 'lg:col-span-1', sector: 'Logistics',
    num: '06', industry: 'Logistics & Supply Chain',
    stack: 'OR-Tools · GNN heuristics · VRP solver',
    title: 'The shortest path through every drop.',
    problem: 'Click optimise — watch dozens of stops collapse from a tangle into a clean loop. Same vans, more drops, less fuel.',
    kpis: [{ v: '−24%', l: 'Fuel & miles' }, { v: '+12%', l: 'Drops per van' }],
    demo: 'route',
    accent: '#E17055',
  },
  {
    id: 'demo-churn', span: 'lg:col-span-1', sector: 'Telecom',
    num: '07', industry: 'Telecom',
    stack: 'LightGBM · survival · uplift modelling',
    title: 'Stop the customer leaving before they think to.',
    problem: "A churn model that doesn't just rank risk — it routes each customer to the cheapest retention action that actually works.",
    kpis: [{ v: '−31%', l: 'Voluntary churn' }, { v: '3.2×', l: 'ROI on save offers' }],
    demo: 'churn',
    accent: '#A29BFE',
  },
  {
    id: 'demo-claims', span: 'lg:col-span-1', sector: 'Insurance',
    num: '08', industry: 'Insurance',
    stack: 'Gradient boosting · NLP · vision · tabular',
    title: 'Triage claims the second they arrive.',
    problem: 'Read the claim narrative, score severity and fraud signals, route to the right adjuster lane — and fast-track the obvious ones for instant payout.',
    kpis: [{ v: '2.1 d', l: 'Cycle time (was 7)' }, { v: '+£4.2M', l: 'Fraud caught / yr' }],
    demo: 'claims',
    accent: '#FD79A8',
  },
  {
    id: 'demo-ltv', span: 'lg:col-span-1', sector: 'Marketing',
    num: '09', industry: 'Marketing',
    stack: 'k-means · DBSCAN · BG/NBD · Gamma-Gamma',
    title: "Spend on the customers who'll pay you back.",
    problem: 'Cluster the audience by behaviour, attach a predicted lifetime value to each segment, point the CMO at the ones worth winning.',
    kpis: [{ v: '+41%', l: 'Marketing ROI' }, { v: '−28%', l: 'CAC on top tier' }],
    demo: 'ltv',
    accent: '#00CEC9',
  },
  {
    id: 'demo-agri', span: 'lg:col-span-1', sector: 'Agriculture',
    num: '10', industry: 'Agriculture',
    stack: 'Random forest + CNN · Sentinel-2 NDVI',
    title: 'Yield, field by field, weeks before harvest.',
    problem: 'Satellite NDVI plus ground tabular data. Forecasts yield per hectare and flags disease pressure before it costs you the crop.',
    kpis: [{ v: '+11%', l: 'Yield uplift' }, { v: '−40%', l: 'Crop loss to disease' }],
    demo: 'agri',
    accent: '#55EFC4',
  },
  {
    id: 'demo-credit', span: 'lg:col-span-2', sector: 'Finance',
    num: '11', industry: 'Finance · Underwriting',
    stack: 'XGBoost · monotonic · SHAP explanations',
    title: 'Lend confidently. Explain every no.',
    problem: "Credit decisioning that's accurate, monotonic-by-design, and produces a regulator-ready reason for every approval, decline and price.",
    kpis: [{ v: '+9pp', l: 'Approval rate' }, { v: '−18%', l: 'Default losses' }, { v: '100%', l: 'Reasoned decisions' }],
    demo: 'credit',
    accent: '#00E5FF',
  },
  {
    id: 'demo-patient', span: 'lg:col-span-1', sector: 'Healthcare',
    num: '12', industry: 'Healthcare',
    stack: 'Transformer · EHR · 5-year horizon',
    title: 'Patient risk, five years ahead.',
    problem: 'Read the EHR, project cardio-metabolic risk year by year, route patients to the right intervention before they end up in A&E.',
    kpis: [{ v: '+2,300', l: 'High-risk found / yr' }, { v: '−14%', l: 'Hospital readmits' }],
    demo: 'patient',
    accent: '#00B894',
  },
]

const steps = [
  { num: '01', week: 'Week 1', title: 'Discover', body: 'We sit with your operators, your data, your pain. We leave with the one model that will actually move the metric.' },
  { num: '02', week: 'Week 2–4', title: 'Prototype', body: 'A working model on your data, end-to-end. Not a slide. Not a notebook. A thing the team can poke at.' },
  { num: '03', week: 'Week 5–8', title: 'Productionise', body: 'Latency, monitoring, drift, retraining, hand-off. The boring parts done properly so the model still works in month six.' },
  { num: '04', week: 'Ongoing', title: 'Compound', body: 'We stay close. Every model gets better with every quarter of data. Your edge widens, not erodes.' },
]

export default function ShowcasePage() {
  return (
    <>
      {/* Static JSON-LD — safe string literal, no user input */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />

      <div className="min-h-screen">

        {/* ── HERO ── */}
        <section className="py-24 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-purple-600/20" />
          {/* subtle grid pattern */}
          <div className="absolute inset-0" style={{backgroundImage:'linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)',backgroundSize:'48px 48px'}} />
          <div className="container relative">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm text-cyan-300 font-mono tracking-widest uppercase mb-8">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                Bespoke ML &amp; deep learning
              </div>
              <h1 className="font-display text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl mb-6 leading-tight">
                Most companies{' '}
                <span className="relative inline-block">
                  <span className="text-gray-400 line-through decoration-cyan-400">guess.</span>
                </span>
                <br />
                <span className="text-gradient">We shall see.</span>
              </h1>
              <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                Twelve production ML systems across ten industries.{' '}
                <span className="text-gray-400">Every card is a live, interactive miniature. Move sliders — watch the model respond.</span>
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/contact" className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-gray-900 font-semibold px-8 py-3.5 rounded-full transition-all duration-200 hover:-translate-y-0.5 text-base">
                  Book a discovery call <ArrowRight className="h-4 w-4" />
                </Link>
                <a href="#models" className="inline-flex items-center gap-2 border border-white/30 hover:border-white/60 text-white px-8 py-3.5 rounded-full transition-all duration-200 text-base">
                  See the models
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── STATS BAR ── */}
        <div className="bg-gray-900 border-y border-gray-800">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-800">
              {[
                { icon: Brain, label: '12 Model archetypes', color: 'text-cyan-400' },
                { icon: TrendingUp, label: '10 Industries covered', color: 'text-green-400' },
                { icon: Clock, label: 'In production in weeks', color: 'text-yellow-400' },
                { icon: Zap, label: 'Real architectures', color: 'text-purple-400' },
              ].map(({ icon: Icon, label, color }) => (
                <div key={label} className="flex items-center gap-3 px-6 py-5">
                  <Icon className={`h-5 w-5 ${color} shrink-0`} />
                  <span className="text-sm font-medium text-gray-300">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── MODELS GRID ── */}
        <section id="models" className="py-24 bg-gray-50 dark:bg-gray-950">
          <div className="container">
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-2 text-sm text-cyan-600 dark:text-cyan-400 font-mono tracking-widest uppercase mb-6">
                02 · The portfolio
              </div>
              <h2 className="font-display text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl lg:text-5xl mb-4">
                Twelve working models,{' '}
                <span className="text-gradient">across ten industries.</span>
              </h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
                Numbers are illustrative; the architectures and the business outcomes are real.
              </p>
            </div>

            {/* Filter tabs + grid — client component handles interactivity */}
            <ShowcaseGrid models={models} />
          </div>
        </section>

        {/* ── PROCESS ── */}
        <section className="py-24 bg-white dark:bg-gray-900">
          <div className="container">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-2 text-sm text-purple-600 dark:text-purple-400 font-mono tracking-widest uppercase mb-6">
                03 · The engagement
              </div>
              <h2 className="font-display text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl lg:text-5xl">
                From your messy data{' '}
                <span className="text-gradient">to a model in production</span>{' '}
                — in weeks, not quarters.
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-gray-200 dark:bg-gray-800 rounded-2xl overflow-hidden">
              {steps.map((s, i) => (
                <div key={s.num} className="relative p-8 bg-white dark:bg-gray-900 group hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors duration-300">
                  <div className="text-xs font-mono text-cyan-500 font-bold tracking-widest uppercase mb-1">{s.num} · {s.week}</div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3 mt-3">{s.title}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{s.body}</p>
                  {i < steps.length - 1 && (
                    <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-800 border-2 border-cyan-500 flex items-center justify-center">
                      <ArrowRight className="h-3 w-3 text-cyan-500" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-24 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-purple-600/20" />
          <div className="absolute inset-0" style={{backgroundImage:'linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)',backgroundSize:'48px 48px'}} />
          <div className="container relative">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="font-display text-4xl font-bold text-white sm:text-5xl mb-6 leading-tight">
                  Bring us your <span className="text-gradient">hardest</span> problem.
                </h2>
                <p className="text-gray-200 text-lg mb-8 max-w-lg leading-relaxed">
                  Tell us the metric you&#39;d most like to move. We&#39;ll come back inside three working days
                  with the model archetype, the data we&#39;d need, and a fixed-fee discovery sprint.
                </p>
                <Link href="/contact" className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-gray-900 font-semibold px-8 py-4 rounded-full transition-all duration-200 hover:-translate-y-0.5 text-lg">
                  Book a discovery call <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
              <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8 divide-y divide-white/10">
                <h5 className="text-xs font-mono text-cyan-400 tracking-widest uppercase pb-5">· Direct line</h5>
                {[
                  { k: 'Email', v: 'consulting@videbimusai.com', href: 'mailto:consulting@videbimusai.com' },
                  { k: 'Phone', v: '+44 7442 852 675', href: 'tel:+447442852675' },
                  { k: 'Web', v: 'www.videbimusai.com', href: 'https://www.videbimusai.com' },
                ].map((row) => (
                  <div key={row.k} className="flex items-baseline gap-4 py-5">
                    <span className="text-xs font-mono text-gray-500 uppercase tracking-widest w-14 shrink-0">{row.k}</span>
                    <a href={row.href} target={row.k === 'Web' ? '_blank' : undefined} rel="noopener noreferrer"
                      className="text-lg font-semibold text-white hover:text-cyan-300 transition-colors">{row.v}</a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Demos JS — original from design handoff */}
      <Script src="/showcase-demos.js" strategy="afterInteractive" />
      <Script id="showcase-css-bridge" strategy="afterInteractive">{`
        (function() {
          var s = document.createElement('style');
          s.textContent = [
            '.bg-gray-950,.dark .bg-black,.sc-demo-panel{',
            '--signal:#00E5FF;--signal-2:#6C5CE7;--signal-soft:rgba(0,229,255,0.16);',
            '--paper:#ffffff;--muted:rgba(255,255,255,0.6);--muted-2:rgba(255,255,255,0.4);',
            '--ink:#030712;--rule:rgba(255,255,255,0.08);--rule-strong:rgba(255,255,255,0.2);',
            '--good:#00B894;--bad:#FF6B6B;',
            '--display:inherit;--mono:"JetBrains Mono",ui-monospace,monospace;--sans:inherit;',
            '}'
          ].join('');
          document.head.appendChild(s);
        })();
      `}</Script>

      <style>{showcaseCSS}</style>
    </>
  )
}

const showcaseCSS = `
.sc-demo-inner { display: flex; flex-direction: column; gap: 0; }

/* labels */
.sc-demo-label {
  font-family: "JetBrains Mono", ui-monospace, monospace;
  font-size: 9px; letter-spacing: 0.28em; text-transform: uppercase;
  color: rgba(255,255,255,0.4);
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 12px;
}
.sc-live { display: inline-flex; align-items: center; gap: 5px; color: #00E5FF; }
.sc-live::before { content: ""; width: 5px; height: 5px; border-radius: 50%; background: #00E5FF; animation: sc-blink 1.6s ease-in-out infinite; }
@keyframes sc-blink { 50% { opacity: 0.2; } }

/* controls */
.sc-ctrl-row { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin: 6px 0; }
.sc-ctrl { display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 100px; }
.sc-ctrl label {
  font-family: "JetBrains Mono", ui-monospace, monospace;
  font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase;
  color: rgba(255,255,255,0.4); display: flex; justify-content: space-between;
}
.sc-val { color: white; }

.sc-demo-inner input[type="range"] {
  -webkit-appearance: none; appearance: none;
  width: 100%; height: 2px; background: rgba(255,255,255,0.15); border-radius: 2px; outline: none;
}
.sc-demo-inner input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none; width: 13px; height: 13px; border-radius: 50%;
  background: #00E5FF; cursor: pointer; border: 2px solid #030712;
  box-shadow: 0 0 0 0 rgba(0,229,255,0.3); transition: box-shadow .2s;
}
.sc-demo-inner input[type="range"]::-webkit-slider-thumb:hover {
  box-shadow: 0 0 0 5px rgba(0,229,255,0.2);
}
.sc-demo-inner select {
  background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15);
  border-radius: 6px; padding: 7px 10px; color: white;
  font-family: "JetBrains Mono", ui-monospace, monospace;
  font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; outline: none; width: 100%;
}
.sc-demo-inner select option {
  background: #1a1a2e; color: #e2e8f0;
  font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em;
}
.sc-demo-inner textarea {
  width: 100%; min-height: 52px; resize: vertical;
  background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15);
  border-radius: 6px; padding: 10px 12px; color: white; font-size: 13px; outline: none;
}
.sc-demo-inner textarea:focus { border-color: #00E5FF; }

/* seg buttons */
.sc-seg {
  display: inline-flex; border: 1px solid rgba(255,255,255,0.2);
  border-radius: 999px; padding: 3px;
  font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 10px; letter-spacing: 0.1em;
}
.sc-seg button {
  padding: 5px 11px; border-radius: 999px; color: rgba(255,255,255,0.5);
  text-transform: uppercase; transition: all .2s; background: none; border: none; cursor: pointer; font: inherit;
}
.sc-seg button.on { background: #00E5FF; color: #030712; }

/* chips */
.sc-chip {
  font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 10px;
  letter-spacing: 0.12em; text-transform: uppercase;
  padding: 4px 10px; border: 1px solid rgba(255,255,255,0.2);
  border-radius: 999px; color: rgba(255,255,255,0.6);
  display: inline-flex; align-items: center; gap: 6px;
  transition: all .2s; cursor: pointer; background: none; font: inherit;
}
.sc-chip:hover { border-color: #00E5FF; color: #00E5FF; }
.sc-chip.on { background: #00E5FF; color: #030712; border-color: #00E5FF; }

/* outline btn for route demo */
.sc-btn-outline {
  display: inline-flex; align-items: center; gap: 8px;
  border: 1px solid rgba(255,255,255,0.2); border-radius: 999px;
  color: white; background: none; cursor: pointer;
  font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 12px;
  letter-spacing: 0.05em; transition: all .2s;
}
.sc-btn-outline:hover { border-color: #00E5FF; color: #00E5FF; }

/* gauge */
.sc-gauge-wrap { display: grid; place-items: center; padding: 6px 0 14px; }
.sc-gauge { width: 200px; height: 120px; position: relative; }
.sc-gauge svg { width: 100%; height: 100%; overflow: visible; }
.gauge-needle { transform-origin: 110px 110px; transition: transform .5s cubic-bezier(.6,.05,.2,1); }
.sc-gauge-readout { position: absolute; left: 0; right: 0; bottom: -2px; text-align: center; }
.sc-gauge-num { font-size: 34px; font-weight: 700; line-height: 1; color: white; }
.sc-gauge-lbl { font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 9px; letter-spacing: 0.24em; text-transform: uppercase; color: rgba(255,255,255,0.4); margin-top: 4px; }

/* recommender */
.sc-rec-grid-wrap { display: flex; flex-wrap: wrap; gap: 5px; margin: 8px 0 12px; }
.sc-rec-cart { display: flex; flex-wrap: wrap; gap: 5px; min-height: 26px; padding: 8px; background: rgba(255,255,255,0.04); border: 1px dashed rgba(255,255,255,0.15); border-radius: 6px; margin-bottom: 10px; }
.sc-rec-out { display: flex; flex-direction: column; gap: 6px; }
.rec-row { display: grid; grid-template-columns: 60px 1fr 36px; gap: 10px; align-items: center; }
.rec-bar { height: 3px; background: rgba(255,255,255,0.1); border-radius: 2px; overflow: hidden; }
.rec-fill { height: 100%; background: #00E5FF; transition: width .5s; }
.rec-name { font-size: 12px; color: white; }
.rec-score { font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 10px; color: rgba(255,255,255,0.4); text-align: right; }

/* segmentation */
.seg-row { display: grid; grid-template-columns: 12px 1fr auto; gap: 10px; align-items: center; padding: 5px 0; border-bottom: 1px solid rgba(255,255,255,0.07); }
.seg-row:last-child { border-bottom: 0; }
.seg-dot { width: 9px; height: 9px; border-radius: 50%; }
.seg-name { font-size: 12px; color: white; }
.seg-ltv { font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 11px; color: #00E5FF; letter-spacing: 0.04em; }

/* agriculture field */
.sc-ag-field { display: grid; grid-template-columns: repeat(12, 1fr); gap: 2px; aspect-ratio: 12/6; margin: 4px 0 8px; }
.ag-cell { border-radius: 2px; transition: background .4s; }

/* waterfall bars (credit) */
.wf-row { display: grid; grid-template-columns: 100px 1fr 32px; gap: 8px; align-items: center; padding: 3px 0; }
.wf-label { font-size: 11px; color: rgba(255,255,255,0.5); }
.wf-bar { height: 5px; position: relative; background: rgba(255,255,255,0.1); border-radius: 2px; }
.wf-axis { position: absolute; top: -2px; bottom: -2px; left: 50%; width: 1px; background: rgba(255,255,255,0.2); }
.wf-fill { position: absolute; top: 0; bottom: 0; border-radius: 2px; transition: width .4s; }
.wf-fill.pos { background: #00B894; }
.wf-fill.neg { background: #FF6B6B; }
.wf-val { font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 10px; text-align: right; }
.wf-val.pos { color: #00B894; }
.wf-val.neg { color: #FF6B6B; }

/* dial */
.sc-dial { width: 90px; height: 90px; }
.sc-dial .dial-fill { transition: stroke-dasharray .5s; }

/* route animation */
@keyframes draw { to { stroke-dashoffset: 0; } }

/* text-gradient for dark demo panels */
.sc-demo-panel .text-gradient {
  background: linear-gradient(to right, #00E5FF, #6C5CE7);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
`
