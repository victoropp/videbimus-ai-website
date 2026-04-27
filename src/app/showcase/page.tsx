// dangerouslySetInnerHTML below is safe: content is a static string literal (JSON-LD structured data),
// never derived from user input.
import type { Metadata } from 'next'
import Script from 'next/script'
import Link from 'next/link'
import { Brain, TrendingUp, Clock, Zap, ArrowRight } from 'lucide-react'

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

const models = [
  {
    id: 'demo-fraud', span: 'lg:col-span-2',
    num: '01', industry: 'Finance · Banking',
    stack: 'XGBoost · 312 features · p99 < 30 ms',
    title: 'Real-time fraud decisioning at the swipe.',
    titleHighlight: 'fraud',
    problem: 'Score every card transaction in under 30 ms. Approve good customers without friction, step-up the suspicious, block the obviously bad — and explain every decision.',
    kpis: [{ v: '−47%', l: 'Fraud losses' }, { v: '−62%', l: 'False positives' }, { v: '28 ms', l: 'p99 latency' }],
    demo: 'fraud',
  },
  {
    id: 'demo-xray', span: 'lg:col-span-1',
    num: '02', industry: 'Healthcare',
    stack: 'CNN · ResNet-152 · Grad-CAM',
    title: 'Triage radiology in seconds.',
    titleHighlight: 'in seconds.',
    problem: 'A vision model that flags pneumonia, cardiomegaly and nodules, and shows the radiologist exactly where it looked.',
    kpis: [{ v: '0.94', l: 'AUROC' }, { v: '1.4 s', l: 'Read time' }],
    demo: 'xray',
  },
  {
    id: 'demo-recs', span: 'lg:col-span-1',
    num: '03', industry: 'Retail · E-commerce',
    stack: 'Two-tower · ANN · collaborative filtering',
    title: 'Recommendations that actually convert.',
    titleHighlight: 'actually convert.',
    problem: 'Add a few items to a basket — watch the model re-rank the catalogue in real time based on what shoppers like this one usually buy together.',
    kpis: [{ v: '+34%', l: 'Avg order value' }, { v: '+18%', l: 'CTR on PDP' }],
    demo: 'recs',
  },
  {
    id: 'demo-rul', span: 'lg:col-span-1',
    num: '04', industry: 'Manufacturing',
    stack: 'LSTM · attention · signal RUL',
    title: 'Service the machine before it breaks.',
    titleHighlight: 'before it breaks.',
    problem: 'Sensor data in, hours-of-life-remaining out. Replace expensive emergency call-outs with calm, planned maintenance windows.',
    kpis: [{ v: '−38%', l: 'Unplanned downtime' }, { v: '+22%', l: 'Asset lifespan' }],
    demo: 'rul',
  },
  {
    id: 'demo-load', span: 'lg:col-span-1',
    num: '05', industry: 'Energy · Utilities',
    stack: 'N-BEATS · temporal fusion · 24h horizon',
    title: "Forecast tomorrow's grid demand.",
    titleHighlight: 'grid demand.',
    problem: "Hour-by-hour load prediction so traders buy the right block, operators schedule the right plant, and nobody pays the imbalance penalty.",
    kpis: [{ v: 'MAPE 2.4%', l: 'vs 6% baseline' }, { v: '£1.8M', l: 'Annual savings' }],
    demo: 'load',
  },
  {
    id: 'demo-route', span: 'lg:col-span-1',
    num: '06', industry: 'Logistics & Supply Chain',
    stack: 'OR-Tools · GNN heuristics · VRP solver',
    title: 'The shortest path through every drop.',
    titleHighlight: 'through every drop.',
    problem: 'Click optimise — watch dozens of stops collapse from a tangle into a clean loop. Same vans, more drops, less fuel.',
    kpis: [{ v: '−24%', l: 'Fuel & miles' }, { v: '+12%', l: 'Drops per van' }],
    demo: 'route',
  },
  {
    id: 'demo-churn', span: 'lg:col-span-1',
    num: '07', industry: 'Telecom',
    stack: 'LightGBM · survival · uplift modelling',
    title: 'Stop the customer leaving before they think to.',
    titleHighlight: 'leaving',
    problem: "A churn model that doesn't just rank risk — it routes each customer to the cheapest retention action that actually works.",
    kpis: [{ v: '−31%', l: 'Voluntary churn' }, { v: '3.2×', l: 'ROI on save offers' }],
    demo: 'churn',
  },
  {
    id: 'demo-claims', span: 'lg:col-span-1',
    num: '08', industry: 'Insurance',
    stack: 'Gradient boosting · NLP · vision · tabular',
    title: 'Triage claims the second they arrive.',
    titleHighlight: 'the second they arrive.',
    problem: 'Read the claim narrative, score severity and fraud signals, route to the right adjuster lane — and fast-track the obvious ones for instant payout.',
    kpis: [{ v: '2.1 d', l: 'Cycle time (was 7)' }, { v: '+£4.2M', l: 'Fraud caught / yr' }],
    demo: 'claims',
  },
  {
    id: 'demo-ltv', span: 'lg:col-span-1',
    num: '09', industry: 'Marketing',
    stack: 'k-means · DBSCAN · BG/NBD · Gamma-Gamma',
    title: "Spend on the customers who'll pay you back.",
    titleHighlight: "who'll pay you back.",
    problem: 'Cluster the audience by behaviour, attach a predicted lifetime value to each segment, point the CMO at the ones worth winning.',
    kpis: [{ v: '+41%', l: 'Marketing ROI' }, { v: '−28%', l: 'CAC on top tier' }],
    demo: 'ltv',
  },
  {
    id: 'demo-agri', span: 'lg:col-span-1',
    num: '10', industry: 'Agriculture',
    stack: 'Random forest + CNN · Sentinel-2 NDVI',
    title: 'Yield, field by field, weeks before harvest.',
    titleHighlight: 'weeks before harvest.',
    problem: 'Satellite NDVI plus ground tabular data. Forecasts yield per hectare and flags disease pressure before it costs you the crop.',
    kpis: [{ v: '+11%', l: 'Yield uplift' }, { v: '−40%', l: 'Crop loss to disease' }],
    demo: 'agri',
  },
  {
    id: 'demo-credit', span: 'lg:col-span-2',
    num: '11', industry: 'Finance · Underwriting',
    stack: 'XGBoost · monotonic · SHAP explanations',
    title: 'Lend confidently. Explain every no.',
    titleHighlight: 'Explain every no.',
    problem: "Credit decisioning that's accurate, monotonic-by-design, and produces a regulator-ready reason for every approval, decline and price.",
    kpis: [{ v: '+9pp', l: 'Approval rate' }, { v: '−18%', l: 'Default losses' }, { v: '100%', l: 'Reasoned decisions' }],
    demo: 'credit',
  },
  {
    id: 'demo-patient', span: 'lg:col-span-1',
    num: '12', industry: 'Healthcare',
    stack: 'Transformer · EHR · 5-year horizon',
    title: 'Patient risk, five years ahead.',
    titleHighlight: 'five years ahead.',
    problem: 'Read the EHR, project cardio-metabolic risk year by year, route patients to the right intervention before they end up in A&E.',
    kpis: [{ v: '+2,300', l: 'High-risk found / yr' }, { v: '−14%', l: 'Hospital readmits' }],
    demo: 'patient',
  },
]

function DemoContent({ demo }: { demo: string }) {
  if (demo === 'fraud') return (
    <div className="sc-demo-inner">
      <div className="sc-demo-label"><span>Try it · simulate a transaction</span><span className="sc-live">live model</span></div>
      <div className="sc-ctrl-row">
        <div className="sc-ctrl"><label htmlFor="fr-amount">Amount <span className="sc-val">£420</span></label><input id="fr-amount" type="range" min="5" max="6000" defaultValue="420" step="5" /></div>
        <div className="sc-ctrl"><label htmlFor="fr-hour">Hour <span className="sc-val">14:00</span></label><input id="fr-hour" type="range" min="0" max="23" defaultValue="14" /></div>
      </div>
      <div className="sc-ctrl-row">
        <div className="sc-ctrl"><label>Merchant</label><select id="fr-merch"><option value="grocery">Grocery</option><option value="electronics">Electronics</option><option value="travel">Travel</option><option value="crypto">Crypto exchange</option><option value="gambling">Gambling</option></select></div>
        <div className="sc-ctrl"><label>Card region</label><select id="fr-country"><option value="dom">Domestic</option><option value="intl">International</option></select></div>
      </div>
      <div className="sc-ctrl-row" style={{ marginTop: 8 }}><button id="fr-newdev" className="sc-chip">New device</button></div>
      <div className="sc-gauge-wrap">
        <div className="sc-gauge" id="fr-gauge">
          <svg viewBox="0 0 220 130"><path d="M 20 110 A 90 90 0 0 1 200 110" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" strokeLinecap="round"/><path className="gauge-arc-fill" d="M 20 110 A 90 90 0 0 1 200 110" fill="none" stroke="#00E5FF" strokeWidth="10" strokeLinecap="round" pathLength={240} strokeDasharray="0 240"/><g className="gauge-needle"><line x1="110" y1="110" x2="110" y2="40" stroke="white" strokeWidth="2"/><circle cx="110" cy="110" r="5" fill="white"/></g></svg>
          <div className="sc-gauge-readout"><div className="sc-gauge-num"><span id="fr-score">0</span><span style={{fontSize:16,opacity:0.5}}>/100</span></div><div className="sc-gauge-lbl">Risk score</div></div>
        </div>
      </div>
      <div className="sc-ctrl-row" style={{justifyContent:'space-between',alignItems:'center',gap:12}}><span id="fr-verdict" className="sc-chip">—</span><span id="fr-factors" style={{display:'flex',gap:6,flexWrap:'wrap',justifyContent:'flex-end'}}/></div>
    </div>
  )

  if (demo === 'xray') return (
    <div className="sc-demo-inner">
      <div className="sc-demo-label"><span>Pick a finding</span><span className="sc-live">attention map</span></div>
      <div id="xr-cond" className="sc-seg" style={{marginBottom:10}}><button className="on" data-cond="pneumonia">Pneumonia</button><button data-cond="cardiomegaly">Cardiomegaly</button><button data-cond="nodule">Nodule</button></div>
      <canvas id="xr-canvas" style={{width:'100%',borderRadius:4,aspectRatio:'360/260'}}/>
      <div className="sc-ctrl" style={{marginTop:10}}><label htmlFor="xr-conf">Confidence weight <span className="sc-val">70</span></label><input id="xr-conf" type="range" min="20" max="100" defaultValue="70"/></div>
      <div style={{display:'flex',justifyContent:'space-between',marginTop:10,fontFamily:'var(--sc-mono)',fontSize:11,letterSpacing:'0.1em',textTransform:'uppercase'}}>
        <span style={{opacity:0.5}}>Finding · <span id="xr-finding" style={{color:'white'}}>Pneumonia</span></span>
        <span style={{color:'#00E5FF'}} id="xr-prob">60.2%</span>
      </div>
    </div>
  )

  if (demo === 'recs') return (
    <div className="sc-demo-inner">
      <div className="sc-demo-label"><span>Click to add to basket</span><span className="sc-live">re-ranking</span></div>
      <div id="rec-grid" className="sc-rec-grid-wrap"/>
      <div className="sc-demo-label" style={{marginTop:8}}><span>Basket</span></div>
      <div id="rec-cart" className="sc-rec-cart"/>
      <div className="sc-demo-label"><span>Top recommendations</span><span style={{color:'#00E5FF'}}>lift <b id="rec-lift">+8%</b></span></div>
      <div id="rec-out" className="sc-rec-out"/>
    </div>
  )

  if (demo === 'rul') return (
    <div className="sc-demo-inner">
      <div className="sc-demo-label"><span>CNC #14 · spindle bearing</span><span className="sc-live">forecast</span></div>
      <svg id="rul-svg" viewBox="0 0 360 160" style={{width:'100%',height:'auto'}}/>
      <div className="sc-ctrl-row">
        <div className="sc-ctrl"><label htmlFor="rul-vib">Vibration <span className="sc-val">12.0 mm/s</span></label><input id="rul-vib" type="range" min="0" max="40" defaultValue="12" step="0.5"/></div>
        <div className="sc-ctrl"><label htmlFor="rul-temp">Temp <span className="sc-val">68 °C</span></label><input id="rul-temp" type="range" min="40" max="110" defaultValue="68"/></div>
      </div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:10}}>
        <div style={{fontFamily:'var(--sc-mono)',fontSize:10,letterSpacing:'0.2em',textTransform:'uppercase',opacity:0.5}}>RUL · <span id="rul-out" style={{fontFamily:'var(--sc-display)',fontSize:26,color:'#00E5FF',letterSpacing:0}}>128</span> hrs</div>
        <span id="rul-status" className="sc-chip">—</span>
      </div>
    </div>
  )

  if (demo === 'load') return (
    <div className="sc-demo-inner">
      <div className="sc-demo-label"><span>Tomorrow · 24h horizon</span><span className="sc-live">90% interval</span></div>
      <svg id="en-svg" viewBox="0 0 360 160" style={{width:'100%',height:'auto'}}/>
      <div className="sc-ctrl-row" style={{alignItems:'flex-end'}}>
        <div className="sc-ctrl"><label htmlFor="en-temp">Forecast high <span className="sc-val">12 °C</span></label><input id="en-temp" type="range" min="-5" max="38" defaultValue="12"/></div>
        <div className="sc-ctrl" style={{flex:'0 0 auto'}}><label>Day</label><div id="en-day" className="sc-seg"><button className="on" data-day="weekday">Weekday</button><button data-day="weekend">Weekend</button></div></div>
      </div>
      <div style={{display:'flex',justifyContent:'space-between',marginTop:10,fontFamily:'var(--sc-mono)',fontSize:11,letterSpacing:'0.1em',textTransform:'uppercase',opacity:0.6}}>
        <span>Peak · <span id="en-peak" style={{color:'white',opacity:1}}>—</span></span>
        <span>Total · <span id="en-tot" style={{color:'#00E5FF',opacity:1}}>—</span></span>
      </div>
    </div>
  )

  if (demo === 'route') return (
    <div className="sc-demo-inner">
      <div className="sc-demo-label"><span>Today&#39;s drops</span><span className="sc-live">VRP solver</span></div>
      <svg id="log-svg" viewBox="0 0 360 220" style={{width:'100%',height:'auto',background:'rgba(0,0,0,0.3)',borderRadius:4}}/>
      <div className="sc-ctrl-row" style={{alignItems:'flex-end'}}>
        <div className="sc-ctrl"><label htmlFor="log-stops">Stops <span className="sc-val">14 stops</span></label><input id="log-stops" type="range" min="6" max="24" defaultValue="14"/></div>
        <button id="log-opt" className="sc-btn-outline" style={{padding:'8px 14px',fontSize:12,whiteSpace:'nowrap'}}>Optimise route →</button>
      </div>
      <div style={{display:'flex',gap:18,marginTop:10,fontFamily:'var(--sc-mono)',fontSize:11,letterSpacing:'0.1em',textTransform:'uppercase',opacity:0.6}}>
        <span>Distance · <span id="log-dist" style={{color:'white',opacity:1}}>—</span></span>
        <span>ETA · <span id="log-time" style={{color:'white',opacity:1}}>—</span></span>
        <span style={{marginLeft:'auto'}}>Saved · <span id="log-saved" style={{color:'#00E5FF',opacity:1}}>—</span></span>
      </div>
    </div>
  )

  if (demo === 'churn') return (
    <div className="sc-demo-inner">
      <div className="sc-demo-label"><span>Customer profile</span><span className="sc-live">retention engine</span></div>
      <div className="sc-ctrl-row">
        <div className="sc-ctrl"><label htmlFor="tc-ten">Tenure <span className="sc-val">8 mo</span></label><input id="tc-ten" type="range" min="1" max="120" defaultValue="8"/></div>
        <div className="sc-ctrl"><label htmlFor="tc-mon">Monthly bill <span className="sc-val">£68</span></label><input id="tc-mon" type="range" min="15" max="200" defaultValue="68"/></div>
      </div>
      <div className="sc-ctrl-row">
        <div className="sc-ctrl"><label htmlFor="tc-sup">Support calls (90d) <span className="sc-val">3 calls</span></label><input id="tc-sup" type="range" min="0" max="10" defaultValue="3"/></div>
        <div className="sc-ctrl"><label>Contract</label><select id="tc-ctr"><option value="monthly">Month-to-month</option><option value="yearly">1-year</option><option value="biennial">2-year</option></select></div>
      </div>
      <div className="sc-ctrl-row" style={{marginTop:6}}><button id="tc-fiber" className="sc-chip">Fibre service</button></div>
      <div style={{display:'flex',gap:20,alignItems:'center',marginTop:14}}>
        <svg className="sc-dial" id="tc-dial" viewBox="0 0 100 100"><circle cx="50" cy="50" r="35" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6"/><circle className="dial-fill" cx="50" cy="50" r="35" fill="none" stroke="#00E5FF" strokeWidth="6" strokeLinecap="round" pathLength={220} strokeDasharray="0 220" transform="rotate(-90 50 50)"/></svg>
        <div>
          <div style={{fontSize:28,lineHeight:1,fontWeight:700}} id="tc-prob">—</div>
          <div style={{fontFamily:'var(--sc-mono)',fontSize:9,letterSpacing:'0.22em',textTransform:'uppercase',opacity:0.5,marginTop:4}}>Churn probability · 90d</div>
          <div style={{marginTop:10}}><span id="tc-action" className="sc-chip">—</span></div>
        </div>
      </div>
      <div style={{marginTop:10,display:'flex',justifyContent:'space-between',fontFamily:'var(--sc-mono)',fontSize:11,letterSpacing:'0.1em',textTransform:'uppercase',opacity:0.6}}>
        <span>Estimated LTV at risk</span><span id="tc-ev" style={{color:'#00E5FF',opacity:1}}>—</span>
      </div>
    </div>
  )

  if (demo === 'claims') return (
    <div className="sc-demo-inner">
      <div className="sc-demo-label"><span>Claim narrative · try editing</span><span className="sc-live">analysing</span></div>
      <textarea id="cl-text" defaultValue="Customer was rear-ended at low speed; minor whiplash, ambulance not called. Photo of damage attached."/>
      <div className="sc-ctrl-row" style={{marginTop:10}}>
        <div className="sc-ctrl"><label htmlFor="cl-photo">Photo quality <span className="sc-val">75%</span></label><input id="cl-photo" type="range" min="0" max="100" defaultValue="75"/></div>
        <div className="sc-ctrl"><label htmlFor="cl-amount">Claim amount <span className="sc-val">£1,800</span></label><input id="cl-amount" type="range" min="200" max="20000" defaultValue="1800" step="100"/></div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginTop:14}}>
        <div><div style={{fontFamily:'var(--sc-mono)',fontSize:9,letterSpacing:'0.22em',textTransform:'uppercase',opacity:0.5}}>Severity</div><div style={{fontSize:28,fontWeight:700}}><span id="cl-sev">—</span><span style={{opacity:0.4,fontSize:16}}>/100</span></div></div>
        <div><div style={{fontFamily:'var(--sc-mono)',fontSize:9,letterSpacing:'0.22em',textTransform:'uppercase',opacity:0.5}}>Fraud signal</div><div style={{fontSize:28,fontWeight:700,color:'#00E5FF'}}><span id="cl-fraud">—</span><span style={{opacity:0.4,fontSize:16,color:'white'}}>/100</span></div></div>
      </div>
      <div style={{marginTop:10}}><span id="cl-lane" className="sc-chip">—</span></div>
      <div id="cl-tags" style={{marginTop:8,display:'flex',gap:6,flexWrap:'wrap'}}/>
    </div>
  )

  if (demo === 'ltv') return (
    <div className="sc-demo-inner">
      <div className="sc-demo-label"><span>Customer segmentation · RFM</span><span className="sc-live">k-means</span></div>
      <svg id="mk-svg" viewBox="0 0 360 200" style={{width:'100%',height:'auto',background:'rgba(0,0,0,0.3)',borderRadius:4}}/>
      <div className="sc-ctrl-row" style={{alignItems:'flex-end',marginTop:10}}>
        <div className="sc-ctrl"><label>Number of segments</label><select id="mk-k"><option>3</option><option>4</option><option>5</option></select></div>
      </div>
      <div id="mk-out" style={{marginTop:12}}/>
    </div>
  )

  if (demo === 'agri') return (
    <div className="sc-demo-inner">
      <div className="sc-demo-label"><span>Field 4-B · 28 ha</span><span className="sc-live">satellite</span></div>
      <div id="ag-field" className="sc-ag-field"/>
      <div className="sc-ctrl-row">
        <div className="sc-ctrl"><label htmlFor="ag-rain">Rain (30d) <span className="sc-val">110 mm</span></label><input id="ag-rain" type="range" min="0" max="300" defaultValue="110"/></div>
        <div className="sc-ctrl"><label htmlFor="ag-temp">Avg temp <span className="sc-val">22 °C</span></label><input id="ag-temp" type="range" min="5" max="40" defaultValue="22"/></div>
      </div>
      <div className="sc-ctrl"><label htmlFor="ag-ndvi">NDVI <span className="sc-val">0.62</span></label><input id="ag-ndvi" type="range" min="20" max="95" defaultValue="62"/></div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:10,fontFamily:'var(--sc-mono)',fontSize:11,letterSpacing:'0.1em',textTransform:'uppercase',opacity:0.6}}>
        <span>Yield · <span id="ag-yield" style={{fontSize:20,fontWeight:700,color:'#00E5FF',opacity:1,letterSpacing:0}}>—</span></span>
        <span>Disease risk · <span id="ag-risk" style={{color:'white',opacity:1}}>—</span></span>
      </div>
    </div>
  )

  if (demo === 'credit') return (
    <div className="sc-demo-inner">
      <div className="sc-demo-label"><span>Applicant</span><span className="sc-live">scoring</span></div>
      <div className="sc-ctrl-row">
        <div className="sc-ctrl"><label htmlFor="cr-inc">Annual income <span className="sc-val">£42,000</span></label><input id="cr-inc" type="range" min="14000" max="180000" defaultValue="42000" step="500"/></div>
        <div className="sc-ctrl"><label htmlFor="cr-debt">Existing debt <span className="sc-val">£6,000</span></label><input id="cr-debt" type="range" min="0" max="80000" defaultValue="6000" step="500"/></div>
      </div>
      <div className="sc-ctrl-row">
        <div className="sc-ctrl"><label htmlFor="cr-util">Credit utilisation <span className="sc-val">35%</span></label><input id="cr-util" type="range" min="0" max="100" defaultValue="35"/></div>
        <div className="sc-ctrl"><label htmlFor="cr-hist">Credit history <span className="sc-val">42 mo</span></label><input id="cr-hist" type="range" min="3" max="240" defaultValue="42"/></div>
      </div>
      <div className="sc-ctrl"><label htmlFor="cr-dq">Delinquencies (24 mo) <span className="sc-val">0</span></label><input id="cr-dq" type="range" min="0" max="6" defaultValue="0"/></div>
      <div style={{display:'grid',gridTemplateColumns:'130px 1fr',gap:20,alignItems:'center',marginTop:14}}>
        <div>
          <div style={{fontSize:44,fontWeight:700,lineHeight:1}} id="cr-score">—</div>
          <div style={{fontFamily:'var(--sc-mono)',fontSize:9,letterSpacing:'0.22em',textTransform:'uppercase',opacity:0.5,marginTop:4}}>Score</div>
          <div style={{marginTop:8}}><span id="cr-tier" className="sc-chip">—</span></div>
          <div style={{marginTop:8,fontFamily:'var(--sc-mono)',fontSize:11,letterSpacing:'0.1em',textTransform:'uppercase',opacity:0.5}}>APR · <span id="cr-apr" style={{color:'#00E5FF',opacity:1}}>—</span></div>
        </div>
        <div id="cr-factors"/>
      </div>
    </div>
  )

  if (demo === 'patient') return (
    <div className="sc-demo-inner">
      <div className="sc-demo-label"><span>5-year risk trajectory</span><span className="sc-live">forecast</span></div>
      <svg id="pt-svg" viewBox="0 0 360 140" style={{width:'100%',height:'auto'}}/>
      <div className="sc-ctrl-row">
        <div className="sc-ctrl"><label htmlFor="pt-age">Age <span className="sc-val">52 yr</span></label><input id="pt-age" type="range" min="20" max="85" defaultValue="52"/></div>
        <div className="sc-ctrl"><label htmlFor="pt-bmi">BMI <span className="sc-val">27.0</span></label><input id="pt-bmi" type="range" min="18" max="42" defaultValue="27" step="0.5"/></div>
      </div>
      <div className="sc-ctrl-row">
        <div className="sc-ctrl"><label htmlFor="pt-bp">Systolic BP <span className="sc-val">132 mmHg</span></label><input id="pt-bp" type="range" min="100" max="180" defaultValue="132"/></div>
        <div className="sc-ctrl"><label htmlFor="pt-a1c">HbA1c <span className="sc-val">5.8%</span></label><input id="pt-a1c" type="range" min="4.5" max="11" defaultValue="5.8" step="0.1"/></div>
      </div>
      <div style={{marginTop:8}}><button id="pt-smoker" className="sc-chip">Smoker</button></div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:12}}>
        <div><div style={{fontSize:28,fontWeight:700,lineHeight:1}} id="pt-out">—</div><div style={{fontFamily:'var(--sc-mono)',fontSize:9,letterSpacing:'0.22em',textTransform:'uppercase',opacity:0.5,marginTop:4}}>5-yr cardio risk</div></div>
        <span id="pt-action" className="sc-chip">—</span>
      </div>
    </div>
  )

  return null
}

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
        <section className="py-20 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-purple-600/20" />
          <div className="absolute inset-0 hero-bg" />
          <div className="container relative">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm text-cyan-300 font-mono tracking-widest uppercase mb-8">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                Bespoke ML &amp; deep learning
              </div>
              <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl mb-6">
                Most companies{' '}
                <span className="relative inline-block">
                  <span className="text-gray-400 line-through decoration-cyan-400">guess.</span>
                </span>
                <br />
                <span className="text-gradient">We shall see.</span>
              </h1>
              <p className="text-xl text-gray-200 mb-10 max-w-2xl mx-auto leading-relaxed">
                Twelve production ML systems across ten industries.{' '}
                <span className="text-gray-400">Every card is a live, interactive miniature. Move sliders — watch the model respond.</span>
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8 text-white/80 mb-10">
                <div className="flex items-center gap-2"><Brain className="h-5 w-5 text-cyan-400" /><span>12 Model archetypes</span></div>
                <div className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-green-400" /><span>10 Industries</span></div>
                <div className="flex items-center gap-2"><Clock className="h-5 w-5 text-yellow-400" /><span>In production in weeks</span></div>
                <div className="flex items-center gap-2"><Zap className="h-5 w-5 text-purple-400" /><span>Real architectures</span></div>
              </div>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/contact" className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-gray-900 font-semibold px-6 py-3 rounded-full transition-all duration-200 hover:-translate-y-0.5">
                  Book a discovery call <ArrowRight className="h-4 w-4" />
                </Link>
                <a href="#models" className="inline-flex items-center gap-2 border border-white/30 hover:border-white/60 text-white px-6 py-3 rounded-full transition-all duration-200">
                  See the models
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── MODELS GRID ── */}
        <section id="models" className="py-24 bg-gray-50 dark:bg-gray-900/50">
          <div className="container">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-2 text-sm text-cyan-600 dark:text-cyan-400 font-mono tracking-widest uppercase mb-6">
                02 · The portfolio
              </div>
              <h2 className="font-display text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl lg:text-5xl mb-4">
                Twelve working models,{' '}
                <span className="text-gradient">across ten industries.</span>
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
                Numbers are illustrative; the architectures and the business outcomes are real.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {models.map((m) => (
                <div
                  key={m.id}
                  id={m.id}
                  className={`${m.span} group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:border-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-500`}
                >
                  {/* Card header band */}
                  <div className="h-1 w-full bg-gradient-to-r from-cyan-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="p-6">
                    {/* Industry + stack */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-cyan-500">{m.num}</span>
                        <span className="text-xs font-mono text-gray-500 dark:text-gray-400 uppercase tracking-widest">{m.industry}</span>
                      </div>
                      <span className="text-xs font-mono text-gray-400 dark:text-gray-600 text-right leading-tight">{m.stack}</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 leading-snug group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                      {m.title}
                    </h3>

                    {/* Problem */}
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-5 leading-relaxed">
                      {m.problem}
                    </p>

                    {/* Interactive demo */}
                    <div className="bg-gray-950 dark:bg-black rounded-xl p-4 mb-5 border border-gray-800">
                      <DemoContent demo={m.demo} />
                    </div>

                    {/* KPIs */}
                    <div className="flex gap-4 flex-wrap pt-4 border-t border-gray-100 dark:border-gray-800">
                      {m.kpis.map((k) => (
                        <div key={k.l} className="flex flex-col">
                          <span className="text-lg font-bold text-cyan-600 dark:text-cyan-400">{k.v}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-500 font-mono uppercase tracking-wider mt-0.5">{k.l}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PROCESS ── */}
        <section className="py-24 bg-white dark:bg-gray-950">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((s) => (
                <div key={s.num} className="relative p-6 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-cyan-500/40 transition-all duration-300 group">
                  <div className="absolute top-0 left-6 right-6 h-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="text-xs font-mono text-cyan-500 font-bold tracking-widest uppercase mb-1">{s.num} · {s.week}</div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{s.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-24 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-purple-600/20" />
          <div className="container relative">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-display text-4xl font-bold text-white sm:text-5xl mb-6">
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
              <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-8">
                <h5 className="text-xs font-mono text-cyan-300 tracking-widest uppercase mb-6">· Direct line</h5>
                {[
                  { k: 'Email', v: 'info@videbimusai.com', href: 'mailto:info@videbimusai.com' },
                  { k: 'Phone', v: '+44 7442 852675', href: 'tel:+447442852675' },
                  { k: 'Web', v: 'www.videbimusai.com', href: 'https://www.videbimusai.com' },
                ].map((row) => (
                  <div key={row.k} className="flex items-baseline gap-4 py-4 border-b border-white/10 last:border-0">
                    <span className="text-xs font-mono text-gray-400 uppercase tracking-widest w-16 shrink-0">{row.k}</span>
                    <a href={row.href} target={row.k === 'Web' ? '_blank' : undefined} rel="noopener noreferrer"
                      className="text-xl font-semibold text-white hover:text-cyan-300 transition-colors">{row.v}</a>
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
          /* Bridge CSS vars so demos.js (which references --signal, --paper, etc.)
             resolves correctly inside the dark demo panels */
          var s = document.createElement('style');
          s.textContent = [
            '.bg-gray-950,.dark .bg-black{',
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

input[type="range"].sc-ctrl input,
.bg-gray-950 input[type="range"],
.dark .bg-black input[type="range"] {
  -webkit-appearance: none; appearance: none;
  width: 100%; height: 2px; background: rgba(255,255,255,0.15); border-radius: 2px; outline: none;
}
.bg-gray-950 input[type="range"]::-webkit-slider-thumb,
.dark .bg-black input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none; width: 13px; height: 13px; border-radius: 50%;
  background: #00E5FF; cursor: pointer; border: 2px solid #030712;
}

/* all range inputs inside demo panels */
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
.bg-gray-950 .text-gradient, .dark .bg-black .text-gradient {
  background: linear-gradient(to right, #00E5FF, #6C5CE7);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
`
