import React from 'react'

export default function SummaryView({ data }: { data: any }) {
  if (!data) return null
  const dist = data.plan_data?.route_instructions?.distance ?? data.route_instructions?.distance
  const est = data.plan_data?.route_instructions?.estimated_time ?? data.route_instructions?.estimated_time

  return (
    <div className="card summary">
      <h3>Summary</h3>
      <div className="small">Distance</div>
      <div style={{fontSize:24,fontWeight:700}}>{dist ? `${Number(dist).toLocaleString()} mi` : '—'}</div>
      <div className="small">Driving</div>
      <div style={{fontSize:18}}>{est ?? '—'}</div>

      <div className="stops">
        <h4>Stops</h4>
        {data.plan_data?.eld_logs?.map((s:any, i:number) => (
          <div key={i} className="small">{i+1}. {s.status} · {new Date(s.start_time).toLocaleString()}</div>
        ))}

        <h4 style={{marginTop:12}}>Timeline</h4>
        <div style={{display:'flex',height:36,borderRadius:6,overflow:'hidden',background:'rgba(255,255,255,0.02)'}}>
          {data.plan_data?.eld_logs?.map((s:any,i:number)=>{
            const color = s.status.includes('Driving') ? '#02aab0' : s.status.includes('Rest') ? '#f59e0b' : '#ef4444'
            return <div key={i} title={`${s.status} ${new Date(s.start_time).toLocaleString()}`} style={{flex:1,background:color}} />
          })}
        </div>
        <div style={{display:'flex',gap:8,alignItems:'center',marginTop:8}}>
          <div style={{display:'flex',gap:6,alignItems:'center'}}><div style={{width:14,height:12,background:'#02aab0',borderRadius:3}}></div><div className="small">Driving</div></div>
          <div style={{display:'flex',gap:6,alignItems:'center'}}><div style={{width:14,height:12,background:'#f59e0b',borderRadius:3}}></div><div className="small">Rest</div></div>
          <div style={{display:'flex',gap:6,alignItems:'center'}}><div style={{width:14,height:12,background:'#ef4444',borderRadius:3}}></div><div className="small">Off Duty</div></div>
        </div>
      </div>
    </div>
  )
}
