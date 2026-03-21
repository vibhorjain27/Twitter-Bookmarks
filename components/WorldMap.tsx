'use client'

import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import { useState } from 'react'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

/** Normalise user-entered country names to match world-atlas geo.properties.name */
const NAME_MAP: Record<string, string> = {
  'United States': 'United States of America',
  USA: 'United States of America',
  UK: 'United Kingdom',
  Russia: 'Russian Federation',
  'South Korea': 'Republic of Korea',
  'North Korea': "Dem. Rep. Korea",
  'Czech Republic': 'Czechia',
  Vietnam: 'Vietnam',
  Tanzania: 'United Rep. of Tanzania',
  Iran: 'Iran',
  Syria: 'Syria',
  "Ivory Coast": "Côte d'Ivoire",
  Myanmar: 'Myanmar',
}

interface WorldMapProps {
  visitedCountries: string[]
  onCountryClick?: (country: string) => void
  selectedCountry?: string | null
  height?: number
}

export function WorldMap({ visitedCountries, onCountryClick, selectedCountry, height = 320 }: WorldMapProps) {
  const [tooltip, setTooltip] = useState<{ name: string; x: number; y: number } | null>(null)

  function normalise(name: string) {
    return NAME_MAP[name] ?? name
  }

  function isVisited(geoName: string) {
    return visitedCountries.some((c) => normalise(c) === geoName || c === geoName)
  }

  function isSelected(geoName: string) {
    if (!selectedCountry) return false
    return normalise(selectedCountry) === geoName || selectedCountry === geoName
  }

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-b from-sky-100 to-blue-200" style={{ height }}>
      {tooltip && (
        <div
          className="absolute z-20 bg-slate-900/90 text-white text-xs px-2.5 py-1.5 rounded-lg pointer-events-none shadow-lg whitespace-nowrap"
          style={{ left: tooltip.x, top: tooltip.y, transform: 'translate(-50%, -110%)' }}
        >
          📍 {tooltip.name}
        </div>
      )}

      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 118, center: [10, 15] }}
        style={{ width: '100%', height: '100%' }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const name: string = geo.properties.name
              const visited = isVisited(name)
              const selected = isSelected(name)

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={selected ? '#f97316' : visited ? '#fbbf24' : '#cbd5e1'}
                  stroke="#ffffff"
                  strokeWidth={0.4}
                  onClick={() => visited && onCountryClick?.(name)}
                  onMouseEnter={(e: React.MouseEvent<SVGPathElement>) => {
                    if (!visited) return
                    const svg = (e.target as SVGElement).closest('svg')
                    const rect = svg?.getBoundingClientRect()
                    setTooltip({
                      name,
                      x: e.clientX - (rect?.left ?? 0),
                      y: e.clientY - (rect?.top ?? 0),
                    })
                  }}
                  onMouseLeave={() => setTooltip(null)}
                  style={{
                    default: { outline: 'none', cursor: visited ? 'pointer' : 'default', transition: 'fill 0.2s' },
                    hover: { fill: selected ? '#ea580c' : visited ? '#f97316' : '#94a3b8', outline: 'none' },
                    pressed: { outline: 'none' },
                  }}
                />
              )
            })
          }
        </Geographies>
      </ComposableMap>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 flex items-center gap-3 text-xs bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-amber-400 inline-block" />
          Visited
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-orange-500 inline-block" />
          Selected
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-slate-300 inline-block" />
          Not yet
        </span>
      </div>

      {visitedCountries.length > 0 && (
        <div className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow">
          🌍 {visitedCountries.length} {visitedCountries.length === 1 ? 'country' : 'countries'} explored
        </div>
      )}
    </div>
  )
}
