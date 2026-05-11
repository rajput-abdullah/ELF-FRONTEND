import React, { useEffect, useState } from 'react'

export default function ErrorLogger() {
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    function onError(e: any) {
      const msg = e?.message || e?.reason?.message || String(e)
      setErrors(prev => [msg, ...prev].slice(0, 20))
    }
    function onUnhandledRejection(e: any) {
      const msg = e?.reason?.message || JSON.stringify(e?.reason) || String(e)
      setErrors(prev => ["UnhandledRejection: " + msg, ...prev].slice(0, 20))
    }
    window.addEventListener('error', onError as any)
    window.addEventListener('unhandledrejection', onUnhandledRejection as any)
    return () => {
      window.removeEventListener('error', onError as any)
      window.removeEventListener('unhandledrejection', onUnhandledRejection as any)
    }
  }, [])

  if (errors.length === 0) return null

  return (
    <div style={{position:'fixed',left:12,top:60,zIndex:9999,maxWidth:520}}>
      <div className="card">
        <strong>Runtime errors</strong>
        <ul style={{marginTop:8}}>
          {errors.map((e,i) => <li key={i} style={{color:'#fcc',fontSize:12,whiteSpace:'pre-wrap'}}>{e}</li>)}
        </ul>
      </div>
    </div>
  )
}
