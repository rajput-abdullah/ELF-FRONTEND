import React, { useState } from 'react'
import { Analytics } from '@vercel/analytics/react'
import TripPlanner from './components/TripPlanner'
import MapView from './components/MapView'
import SummaryView from './components/SummaryView'
import ErrorBoundary from './components/ErrorBoundary'
import ErrorLogger from './components/ErrorLogger'
import PdfViewer from './components/PdfViewer'

// PdfViewer component is provided in src/components/PdfViewer.tsx

export default function App() {
  const [planResponse, setPlanResponse] = useState<any | null>(null)
  const [showPdf, setShowPdf] = useState(false)
  const [rightView, setRightView] = useState<'map' | 'pdf'>('map')

  return (
    <ErrorBoundary>
      <Analytics />
      <div className="app">
        <ErrorLogger />
  {/* debug banner removed */}
        <header className="header">Spotter ELD — Route Planner</header>
        <main className="main">
          <section className="left">
            <TripPlanner onPlan={(res) => setPlanResponse(res)} onShowPdf={() => setShowPdf((s) => !s)} />
            {planResponse && <SummaryView data={planResponse} />}
          </section>
          <section className="right">
            <div style={{display:'flex',gap:8,alignItems:'center',padding:10}}>
              <button className={`btn ${rightView==='map' ? '' : 'secondary'}`} onClick={() => { setRightView('map'); setShowPdf(false) }}>Map View</button>
              <button className={`btn ${rightView==='pdf' ? '' : 'secondary'}`} onClick={() => { setRightView('pdf'); setShowPdf(true) }}>Daily Logs</button>
            </div>
            <div style={{padding:8}}>
              {rightView === 'map' && <MapView plan={planResponse} />}
              {rightView === 'pdf' && (
                planResponse
                  ? <PdfViewer uuid={planResponse.uuid} />
                  : (
                    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:400,gap:12,color:'#475569'}}>
                      <svg width="48" height="48" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="32" height="32" rx="7" fill="#e6eef6"/>
                        <rect x="8" y="6" width="16" height="20" rx="2" fill="#cbd5e1"/>
                        <rect x="11" y="11" width="10" height="1.5" rx="0.75" fill="#94a3b8"/>
                        <rect x="11" y="14" width="7" height="1.5" rx="0.75" fill="#94a3b8"/>
                        <rect x="11" y="17" width="9" height="1.5" rx="0.75" fill="#94a3b8"/>
                      </svg>
                      <span style={{fontSize:15,fontWeight:600,color:'#334155'}}>No daily log yet</span>
                      <span style={{fontSize:13,textAlign:'center',maxWidth:220}}>Enter trip details and click <strong>Plan Trip</strong> to generate your daily log.</span>
                    </div>
                  )
              )}
            </div>
          </section>
        </main>
      </div>
    </ErrorBoundary>
  )
}
