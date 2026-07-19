'use client'
import { motion } from 'framer-motion'

// Approximate positions (percentage of a 1000x520 viewBox) for major trading cities
const HUB = { x: 690, y: 245, name: 'Chennai', country: 'India', role: 'HQ' }
const DESTINATIONS = [
  { x: 610, y: 250, name: 'Dubai', country: 'UAE' },
  { x: 750, y: 275, name: 'Singapore', country: 'SG' },
  { x: 820, y: 235, name: 'Tokyo', country: 'JP' },
  { x: 490, y: 165, name: 'London', country: 'UK' },
  { x: 520, y: 180, name: 'Frankfurt', country: 'DE' },
  { x: 270, y: 195, name: 'New York', country: 'US' },
  { x: 545, y: 220, name: 'Istanbul', country: 'TR' },
  { x: 855, y: 405, name: 'Sydney', country: 'AU' },
  { x: 500, y: 260, name: 'Cairo', country: 'EG' },
  { x: 335, y: 260, name: 'São Paulo', country: 'BR' },
]

function curve(x1, y1, x2, y2, k = 0.35) {
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2
  const dx = x2 - x1
  const dy = y2 - y1
  const dist = Math.sqrt(dx * dx + dy * dy)
  const nx = -dy / dist
  const ny = dx / dist
  const cx = mx + nx * dist * k
  const cy = my + ny * dist * k - Math.min(60, dist * 0.15)
  return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`
}

// Simplified continent silhouettes (very rough) — render as soft-fill decorative shapes
const CONTINENTS = [
  // North America
  'M120 130 Q180 90 260 100 L320 130 L340 200 L300 250 L240 260 L200 240 L160 260 L130 220 L110 180 Z',
  // South America
  'M300 280 L360 280 L370 340 L340 420 L310 440 L290 400 L285 340 Z',
  // Europe
  'M470 130 L560 130 L570 180 L540 210 L490 210 L470 180 Z',
  // Africa
  'M480 220 L570 220 L590 300 L560 380 L510 400 L480 340 L470 280 Z',
  // Asia
  'M580 110 L820 110 L860 180 L830 230 L770 250 L700 260 L640 240 L600 210 L580 170 Z',
  // India subcontinent
  'M660 210 L720 210 L710 275 L680 285 L665 260 Z',
  // Southeast Asia / Indonesia
  'M760 270 L830 265 L840 295 L790 305 Z',
  // Australia
  'M820 370 L900 370 L905 420 L860 435 L820 415 Z',
]

export default function WorldMap() {
  return (
    <div className="relative w-full aspect-[1000/520]">
      <svg viewBox="0 0 1000 520" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id="glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="hsl(37 60% 72%)" stopOpacity="0.9" />
              <stop offset="100%" stopColor="hsl(37 60% 72%)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="routeGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="hsl(37 60% 72%)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="hsl(37 60% 72%)" stopOpacity="0.2" />
          </linearGradient>
          <pattern id="dotgrid" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.7" fill="white" opacity="0.14" />
          </pattern>
          <mask id="continentMask">
            {CONTINENTS.map((d, i) => <path key={i} d={d} fill="white" />)}
          </mask>
        </defs>

        {/* Base dotted world (masked to continents) */}
        <rect x="0" y="0" width="1000" height="520" fill="url(#dotgrid)" mask="url(#continentMask)" />

        {/* Continent soft outlines */}
        {CONTINENTS.map((d, i) => (
          <path key={i} d={d} fill="hsl(37 45% 58% / 0.05)" stroke="hsl(37 45% 58% / 0.22)" strokeWidth="0.6" />
        ))}

        {/* Latitude/longitude decorative arcs */}
        <ellipse cx="500" cy="260" rx="480" ry="235" fill="none" stroke="hsl(37 45% 58% / 0.08)" strokeDasharray="2 6" />

        {/* Routes from HQ to destinations */}
        {DESTINATIONS.map((d, i) => (
          <motion.path
            key={d.name}
            d={curve(HUB.x, HUB.y, d.x, d.y, 0.28)}
            fill="none"
            stroke="url(#routeGrad)"
            strokeWidth="1.2"
            strokeLinecap="round"
            className="route-dash"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 1.8, delay: 0.1 * i, ease: [0.16, 1, 0.3, 1] }}
          />
        ))}

        {/* Destination pulses */}
        {DESTINATIONS.map((d, i) => (
          <g key={`m-${d.name}`}>
            <motion.circle
              cx={d.x} cy={d.y} r="14" fill="url(#glow)"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: [0, 0.9, 0] }}
              viewport={{ once: true }}
              transition={{ duration: 2.4, delay: 0.5 + i * 0.15, repeat: Infinity, repeatDelay: 1.5 }}
            />
            <circle cx={d.x} cy={d.y} r="2.4" fill="hsl(37 60% 72%)" />
            <text x={d.x + 8} y={d.y - 6} fill="white" fillOpacity="0.7" fontSize="9" fontFamily="var(--font-inter)" fontWeight="500">{d.name}</text>
          </g>
        ))}

        {/* HQ */}
        <g>
          <circle cx={HUB.x} cy={HUB.y} r="22" fill="url(#glow)" opacity="0.7" />
          <circle cx={HUB.x} cy={HUB.y} r="5" fill="hsl(37 60% 72%)" />
          <circle cx={HUB.x} cy={HUB.y} r="5" fill="none" stroke="hsl(37 60% 72%)" strokeWidth="1">
            <animate attributeName="r" from="5" to="18" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="1" to="0" dur="2s" repeatCount="indefinite" />
          </circle>
          <text x={HUB.x + 10} y={HUB.y - 10} fill="hsl(37 60% 72%)" fontSize="11" fontFamily="var(--font-jakarta)" fontWeight="700">Chennai HQ</text>
        </g>
      </svg>
    </div>
  )
}
