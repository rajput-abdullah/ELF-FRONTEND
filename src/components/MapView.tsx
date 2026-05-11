import React, { useEffect, useRef, useState } from 'react'

type Plan = any

export default function MapView({ plan }: { plan: Plan | null }) {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const mapObj = useRef<{ map: any; mapboxgl: any } | null>(null)
  const [mapError, setMapError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function setup() {
      if (!mapRef.current) return
      try {
  const mapboxgl = (await import('mapbox-gl')).default
  // prefer token from window for dev convenience, then from Vite env (VITE_MAPBOX_TOKEN), then legacy REACT_APP_MAPBOX_TOKEN
  const env: any = (import.meta as any).env || {}
  const tokenFromEnv = env.VITE_MAPBOX_TOKEN || env.REACT_APP_MAPBOX_TOKEN || env.REACT_APP_MAPBOX_TOKEN
  mapboxgl.accessToken = (window as any).MAPBOX_TOKEN || tokenFromEnv || ''
        if (cancelled) return
        if (!mapObj.current) {
          const map = new mapboxgl.Map({
            container: mapRef.current,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [-95, 38],
            zoom: 3,
          })
          mapObj.current = { map, mapboxgl }
        }
      } catch (e: any) {
        console.warn('Failed to load mapbox-gl', e)
        setMapError(String(e?.message ?? e))
      }
    }
    setup()
    return () => { cancelled = true; mapObj.current?.map?.remove?.(); mapObj.current = null }
  }, [])

  useEffect(() => {
    if (!plan || !mapObj.current) return
    const { map, mapboxgl } = mapObj.current
    ;(async () => {
      try {
      const start: [number, number] = [plan.input_data.pickup_lng, plan.input_data.pickup_lat]
      const end: [number, number] = [plan.input_data.dropoff_lng, plan.input_data.dropoff_lat]
      const bounds = new mapboxgl.LngLatBounds(start, end)
      map.fitBounds(bounds, { padding: 60 })

      // If backend returned detailed route geometry, use it. Otherwise query Mapbox Directions.
      let routeGeo: any = null
      if (plan.plan_data?.route_instructions?.route_geo) {
        routeGeo = plan.plan_data.route_instructions.route_geo
      } else {
        const token = (window as any).MAPBOX_TOKEN || (import.meta as any).env?.VITE_MAPBOX_TOKEN || ''
        if (token) {
          const coords = `${start[0]},${start[1]};${end[0]},${end[1]}`
          const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}?overview=full&geometries=geojson&access_token=${token}`
          try {
            const r = await fetch(url)
            const json = await r.json()
            const route = json.routes && json.routes[0]
            if (route) routeGeo = { type: 'FeatureCollection', features: [{ type: 'Feature', geometry: route.geometry, properties: {} }] }
          } catch (e) {
            console.warn('Failed to fetch directions', e)
          }
        }
      }

      if (!routeGeo) {
        routeGeo = { type: 'FeatureCollection', features: [{ type: 'Feature', geometry: { type: 'LineString', coordinates: [start, end] }, properties: {} }] }
      }

      if (map.getSource && map.getSource('route')) {
        if (map.getLayer && map.getLayer('route-line')) map.removeLayer('route-line')
        map.removeSource('route')
      }

      if (map.addSource) map.addSource('route', { type: 'geojson', data: routeGeo })
      if (map.addLayer) map.addLayer({ id: 'route-line', type: 'line', source: 'route', paint: { 'line-color': '#02aab0', 'line-width': 5 } })

      // If ELD logs exist, color segments by status
      const logs = plan.plan_data?.eld_logs || []
      if (logs.length > 0) {
        // naive segmentation: split line into equal parts per log and add colored layers
        const coordinates = routeGeo.features[0].geometry.coordinates
        const parts = logs.length
        const per = Math.max(1, Math.floor(coordinates.length / parts))
        // remove old segments
        if (map.getSource('route-seg')) { if (map.getLayer('route-seg-line')) map.removeLayer('route-seg-line'); map.removeSource('route-seg') }
        const segFeatures = logs.map((l:any, idx:number) => {
          const slice = coordinates.slice(idx*per, Math.min((idx+1)*per, coordinates.length))
          return { type: 'Feature', geometry: { type: 'LineString', coordinates: slice }, properties: { status: l.status } }
        })
        const segGeo = { type: 'FeatureCollection', features: segFeatures }
        map.addSource('route-seg', { type: 'geojson', data: segGeo })
        map.addLayer({ id: 'route-seg-line', type: 'line', source: 'route-seg', paint: { 'line-color': ['match', ['get', 'status'], 'Driving', '#02aab0', 'Rest', '#f59e0b', 'Off Duty (10-hr reset)', '#ef4444', '#9ca3af'], 'line-width': 6 } })
      }

      document.querySelectorAll('.mapboxgl-marker').forEach(el => el.remove())
      new mapboxgl.Marker({ color: '#0f766e' }).setLngLat(start).addTo(map)
      new mapboxgl.Marker({ color: '#be185d' }).setLngLat(end).addTo(map)
      } catch (e) {
        console.warn('Map draw error', e)
        setMapError(String(e))
      }
    })()
  }, [plan])

  return (
    <div style={{height:'100%'}}>
      {mapError ? (
        <div style={{padding:12}}>
          <div className="card">
            <h4>Map error</h4>
            <div className="small">{mapError}</div>
            <div className="small">Make sure you set <code>window.MAPBOX_TOKEN</code> in browser console and refresh.</div>
          </div>
        </div>
      ) : (
        <div ref={mapRef} className="map-container" />
      )}
    </div>
  )
}