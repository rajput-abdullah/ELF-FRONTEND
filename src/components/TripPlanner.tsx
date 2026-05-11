import React, { useState } from 'react'
import axios from 'axios'

type Props = {
  onPlan: (res: any) => void
  onShowPdf: () => void
}

const SAMPLE = {
  current_location: 'Miami, FL',
  pickup_location: 'Miami, FL',
  pickup_lat: 25.7617,
  pickup_lng: -80.1918,
  dropoff_location: 'New York, NY',
  dropoff_lat: 40.7128,
  dropoff_lng: -74.0060,
  current_cycle_used_hrs: 4,
}

export default function TripPlanner({ onPlan, onShowPdf }: Props) {
  const [currentLocation, setCurrentLocation] = useState<string>('')
  const [pickup, setPickup] = useState<string>('')
  const [pickupLat, setPickupLat] = useState<number | null>(null)
  const [pickupLng, setPickupLng] = useState<number | null>(null)
  const [dropoff, setDropoff] = useState<string>('')
  const [dropoffLat, setDropoffLat] = useState<number | null>(null)
  const [dropoffLng, setDropoffLng] = useState<number | null>(null)
  const [cycle, setCycle] = useState<number>(SAMPLE.current_cycle_used_hrs)
  const [loading, setLoading] = useState(false)

  const setSample = () => {
    setCurrentLocation(SAMPLE.current_location)
    setPickup(SAMPLE.pickup_location)
    setPickupLat(SAMPLE.pickup_lat)
    setPickupLng(SAMPLE.pickup_lng)
    setDropoff(SAMPLE.dropoff_location)
    setDropoffLat(SAMPLE.dropoff_lat)
    setDropoffLng(SAMPLE.dropoff_lng)
    setCycle(SAMPLE.current_cycle_used_hrs)
  }

  // Geocoding suggestions
  const [pickupSuggestions, setPickupSuggestions] = useState<Array<any>>([])
  const [dropoffSuggestions, setDropoffSuggestions] = useState<Array<any>>([])

  async function suggest(query: string) {
    const token = (window as any).MAPBOX_TOKEN || (import.meta as any).env?.VITE_MAPBOX_TOKEN || ''
    if (!token || query.length < 2) return []
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?autocomplete=true&limit=6&access_token=${token}`
    try {
      const r = await axios.get(url)
      return r.data.features || []
    } catch (e) {
      return []
    }
  }


  async function planTrip() {
    if (!pickupLat || !pickupLng || !dropoffLat || !dropoffLng) {
      alert('Please provide lat/lng for pickup and dropoff (use Sample).')
      return
    }
    setLoading(true)
    try {
      // Call Mapbox Directions API to compute distance & duration
      const mapboxToken = (window as any).MAPBOX_TOKEN || ''
      let total_distance_miles = 0
      let total_drive_minutes = 0
      if (mapboxToken) {
        const coords = `${pickupLng},${pickupLat};${dropoffLng},${dropoffLat}`
        const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}?overview=full&geometries=geojson&access_token=${mapboxToken}`
        const r = await axios.get(url)
        const route = r.data.routes && r.data.routes[0]
        if (route) {
          total_distance_miles = (route.distance || 0) * 0.000621371 // meters to miles
          total_drive_minutes = Math.round((route.duration || 0) / 60)
        }
      } else {
        // Fallback estimate
        total_distance_miles = 1100
        total_drive_minutes = 1100
      }

      const body = {
        current_location: currentLocation,
        pickup_location: pickup,
        pickup_lat: pickupLat,
        pickup_lng: pickupLng,
        dropoff_location: dropoff,
        dropoff_lat: dropoffLat,
        dropoff_lng: dropoffLng,
        current_cycle_used_hrs: cycle,
        total_distance_miles: Number(total_distance_miles.toFixed(1)),
        total_drive_minutes: total_drive_minutes,
      }

      // Use relative API path so Vite dev proxy can forward to backend and avoid CORS issues.
      const apiUrl = '/api/plan-trip/'
      const resp = await axios.post(apiUrl, body)
      onPlan(resp.data)
    } catch (err) {
      // Improve debugging output for network/CORS issues
      console.error('Plan trip error', err)
      const e: any = err
      let msg = e?.message || String(e)
      if (e?.response) {
        msg += ` — response status ${e.response.status} ${e.response.statusText}`
      } else if (e?.request) {
        msg += ' — no response received (possible CORS or network error)'
      }
      alert('Failed to plan trip: ' + msg + '\nCheck browser console and network tab for details.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div className="small">Plan trip & generate logs</div>
      </div>

      <div style={{marginTop:10}}>
        <div className="form-row">
          <input value={currentLocation} onChange={e=>setCurrentLocation(e.target.value)} placeholder="Current location" />
        </div>
        <div className="form-row" style={{position:'relative'}}>
          <input value={pickup} onChange={async e=>{ setPickup(e.target.value); const s = await suggest(e.target.value); setPickupSuggestions(s) }} placeholder="Pickup location" />
          {pickupSuggestions.length>0 && (
            <div style={{position:'absolute',top:'44px',left:0,right:0,background:'#021224',border:'1px solid rgba(255,255,255,0.04)',zIndex:50,borderRadius:6,padding:6}}>
              {pickupSuggestions.map((f:any,i:number)=> (
                <div key={i} style={{padding:6,cursor:'pointer'}} onClick={()=>{ setPickup(f.place_name); setPickupLat(f.center[1]); setPickupLng(f.center[0]); setPickupSuggestions([]) }}>{f.place_name}</div>
              ))}
            </div>
          )}
        </div>
        <div className="form-row" style={{position:'relative'}}>
          <input value={dropoff} onChange={async e=>{ setDropoff(e.target.value); const s = await suggest(e.target.value); setDropoffSuggestions(s) }} placeholder="Dropoff location" />
          {dropoffSuggestions.length>0 && (
            <div style={{position:'absolute',top:'44px',left:0,right:0,background:'#021224',border:'1px solid rgba(255,255,255,0.04)',zIndex:50,borderRadius:6,padding:6}}>
              {dropoffSuggestions.map((f:any,i:number)=> (
                <div key={i} style={{padding:6,cursor:'pointer'}} onClick={()=>{ setDropoff(f.place_name); setDropoffLat(f.center[1]); setDropoffLng(f.center[0]); setDropoffSuggestions([]) }}>{f.place_name}</div>
              ))}
            </div>
          )}
        </div>
        {/* Lat/Lng fields removed - coordinates are set when user selects a suggestion or uses Sample */}

        <div className="form-row">
          <div className="cycle-control">
            <button className="btn secondary" onClick={()=>setCycle(c=>Math.max(0,Number((c-0.5).toFixed(1))))}>-</button>
            <div className="small">{cycle} hrs</div>
            <button className="btn secondary" onClick={()=>setCycle(c=>Number((c+0.5).toFixed(1)))}>+</button>
          </div>
          <div style={{marginLeft:'auto'}}>
            <button className="btn" onClick={planTrip} disabled={loading}>{loading? 'Planning...' : 'Plan trip & generate logs'}</button>
            <button className="btn secondary" style={{marginLeft:8}} onClick={setSample}>Sample</button>
          </div>
        </div>
      </div>
    </div>
  )
}
