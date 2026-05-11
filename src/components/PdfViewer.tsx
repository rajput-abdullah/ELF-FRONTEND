import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function PdfViewer({ uuid }: { uuid: string }) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  useEffect(() => {
    if (!uuid) return
    let canceled = false
    async function load() {
      try {
        const url = `/api/plan-trip/${uuid}/logs.pdf`
        const resp = await axios.get(url, { responseType: 'blob' })
        if (canceled) return
        const bUrl = URL.createObjectURL(resp.data)
        setBlobUrl(bUrl)
      } catch (e) {
        console.error('Failed to load PDF', e)
      }
    }
    load()
    return () => { canceled = true; if (blobUrl) URL.revokeObjectURL(blobUrl) }
  }, [uuid])

  if (!uuid) return null

  return (
    <div style={{padding:12}}>
      <div style={{display:'flex',gap:8,marginBottom:8}}>
        <a className="btn" href={`/api/plan-trip/${uuid}/logs.pdf`} target="_blank" rel="noreferrer">Open PDF</a>
        <a className="btn secondary" href={`/api/plan-trip/${uuid}/logs.pdf`} download>Download</a>
      </div>
      <div style={{height:'100%',minHeight:480}}>
        {blobUrl ? (
          <iframe src={blobUrl} style={{width:'100%',height:'640px',border:'none'}} title="Daily logs PDF" />
        ) : (
          <div className="card small">Loading PDF...</div>
        )}
      </div>
    </div>
  )
}
