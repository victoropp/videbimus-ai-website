'use client'

import { useState } from 'react'

type Model = {
  id: string
  span: string
  sector: string
  num: string
  industry: string
  stack: string
  title: string
  problem: string
  kpis: { v: string; l: string }[]
  demo: string
  accent: string
}

const SECTORS = ['All', 'Finance', 'Healthcare', 'Retail', 'Manufacturing', 'Energy', 'Logistics', 'Telecom', 'Insurance', 'Marketing', 'Agriculture']

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
        <div style={{fontFamily:'var(--sc-mono)',fontSize:10,letterSpacing:'0.2em',textTransform:'uppercase',opacity:0.5}}>RUL · <span id="rul-out" style={{fontFamily:'inherit',fontSize:26,color:'#00E5FF',letterSpacing:0}}>128</span> hrs</div>
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

export function ShowcaseGrid({ models }: { models: Model[] }) {
  const [active, setActive] = useState('All')

  const filtered = active === 'All' ? models : models.filter(m => m.sector === active)

  // Group by sector for the "All" view
  const sectors = active === 'All'
    ? [...new Set(models.map(m => m.sector))]
    : [active]

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 justify-center mt-10 mb-14">
        {SECTORS.map(s => (
          <button
            key={s}
            onClick={() => setActive(s)}
            className={`px-4 py-2 rounded-full text-xs font-mono tracking-widest uppercase transition-all duration-200 border ${
              active === s
                ? 'bg-cyan-500 text-gray-900 border-cyan-500 shadow-lg shadow-cyan-500/20'
                : 'bg-transparent text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-cyan-500/50 hover:text-cyan-600 dark:hover:text-cyan-400'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Sector groups */}
      <div className="space-y-16">
        {sectors.map(sector => {
          const sectorModels = filtered.filter(m => m.sector === sector)
          if (!sectorModels.length) return null
          const accentColor = sectorModels[0].accent

          return (
            <div key={sector}>
              {/* Sector header — only in All view */}
              {active === 'All' && (
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className="w-1 h-8 rounded-full shrink-0"
                    style={{ background: accentColor }}
                  />
                  <h3 className="text-sm font-mono font-bold tracking-widest uppercase text-gray-400 dark:text-gray-500">
                    {sector}
                  </h3>
                  <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
                  <span className="text-xs font-mono text-gray-400 dark:text-gray-600">
                    {sectorModels.length} model{sectorModels.length > 1 ? 's' : ''}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {sectorModels.map((m) => (
                  <div
                    key={m.id}
                    id={m.id}
                    className={`${m.span} group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-2xl transition-all duration-500`}
                    style={{
                      ['--card-accent' as string]: m.accent,
                    }}
                  >
                    {/* Accent top bar */}
                    <div
                      className="h-0.5 w-full opacity-40 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: `linear-gradient(to right, ${m.accent}, transparent)` }}
                    />

                    <div className="p-6">
                      {/* Header row */}
                      <div className="flex items-start justify-between gap-4 mb-5">
                        <div className="flex items-center gap-3">
                          <span
                            className="text-xs font-mono font-bold tabular-nums w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                            style={{ background: `${m.accent}18`, color: m.accent }}
                          >
                            {m.num}
                          </span>
                          <div>
                            <div className="text-xs font-mono font-semibold uppercase tracking-widest" style={{ color: m.accent }}>
                              {m.sector}
                            </div>
                            <div className="text-xs font-mono text-gray-400 dark:text-gray-600 mt-0.5">{m.industry}</div>
                          </div>
                        </div>
                        <span className="text-xs font-mono text-gray-300 dark:text-gray-700 text-right leading-relaxed max-w-[140px]">{m.stack}</span>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 leading-snug group-hover:transition-colors duration-300">
                        {m.title}
                      </h3>

                      {/* Problem */}
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 leading-relaxed">
                        {m.problem}
                      </p>

                      {/* Interactive demo */}
                      <div className="sc-demo-panel rounded-xl p-4 mb-5 border" style={{background:'#03070F', borderColor:'rgba(255,255,255,0.07)'}}>
                        <DemoContent demo={m.demo} />
                      </div>

                      {/* KPIs */}
                      <div className="flex gap-5 flex-wrap pt-4 border-t border-gray-100 dark:border-gray-800">
                        {m.kpis.map((k) => (
                          <div key={k.l} className="flex flex-col gap-0.5">
                            <span className="text-base font-bold tabular-nums" style={{ color: m.accent }}>{k.v}</span>
                            <span className="text-xs text-gray-400 dark:text-gray-600 font-mono uppercase tracking-wider">{k.l}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-24 text-gray-400 font-mono text-sm tracking-widest uppercase">
          No models in this sector yet.
        </div>
      )}
    </div>
  )
}
