// Original isometric parking scene: a floating location pin above a miniature car
// parked in a highlighted bay, on a layered map slab with contour lines and price tags.
// Pure SVG + CSS (no images). Motion is limited to a gentle float, a breathing ring and a
// dashed route, all disabled by the global prefers-reduced-motion rule in index.css.

const CX = 240
const CY = 270

// Isometric projection: (x, y, z) in scene units -> "sx,sy" screen point.
const P = (x, y, z = 0) => `${(CX + (x - y) * 0.7071).toFixed(1)},${(CY + (x + y) * 0.3536 - z).toFixed(1)}`

function Box({ x, y, z = 0, w, d, h, top, left, right, edge = 'rgba(255,255,255,.28)' }) {
  const face = (pts, fill) => (
    <polygon points={pts.map(([a, b, c]) => P(a, b, c)).join(' ')} fill={fill} stroke={edge} strokeWidth=".6" strokeLinejoin="round" />
  )
  return (
    <g>
      {face([[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]], left)}
      {face([[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]], right)}
      {face([[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]], top)}
    </g>
  )
}

const CONTOUR = 'M10 70 C14 28 58 6 96 20 C132 33 150 66 128 96 C106 126 52 132 28 112 C14 100 8 86 10 70Z'

function Contours({ cx, cy, scale = 1 }) {
  return (
    <g fill="none" stroke="rgba(160,195,255,.16)" strokeWidth="1">
      {[1, 0.74, 0.48, 0.24].map((s) => (
        <path
          key={s}
          d={CONTOUR}
          vectorEffect="non-scaling-stroke"
          transform={`translate(${cx - 80 * s * scale} ${cy - 68 * s * scale}) scale(${s * scale})`}
        />
      ))}
    </g>
  )
}

function PriceTag({ x, y, label, delay = '0s' }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className="animate-float" style={{ animationDelay: delay }}>
        <rect x="-24" y="-13" width="48" height="24" rx="12" fill="rgba(255,255,255,.95)" />
        <path d="M-4 10.5 L0 17 L4 10.5Z" fill="rgba(255,255,255,.95)" />
        <circle cx="-13" cy="-1" r="3.2" fill="#3374f6" />
        <text x="4" y="3" textAnchor="middle" fontSize="11" fontWeight="700" fill="#1b2d56" fontFamily="Plus Jakarta Sans, sans-serif">
          {label}
        </text>
      </g>
    </g>
  )
}

export default function ParkingIllustration({ className = '' }) {
  const gridSteps = [-104, -74, -44, -14, 16, 46, 76, 106]
  const gridPath = gridSteps.map((v) => `M${v} -134 V134 M-134 ${v} H134`).join(' ')

  return (
    <svg viewBox="0 0 480 400" className={className} aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="pi-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#5996ff" stopOpacity=".42" />
          <stop offset="1" stopColor="#5996ff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="pi-ground" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4a74d4" />
          <stop offset="1" stopColor="#23418c" />
        </linearGradient>
        <linearGradient id="pi-pin" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9cc2ff" />
          <stop offset=".45" stopColor="#3374f6" />
          <stop offset="1" stopColor="#1a2f8f" />
        </linearGradient>
        <filter id="pi-blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>

      {/* ambient light + map contours */}
      <ellipse cx="240" cy="300" rx="230" ry="120" fill="url(#pi-glow)" />
      <Contours cx={105} cy={100} scale={0.95} />
      <Contours cx={392} cy={96} scale={0.7} />

      {/* slab thickness */}
      <polygon points="50.5,270 240,365 240,381 50.5,286" fill="rgba(160,195,255,.16)" stroke="rgba(190,215,255,.35)" strokeWidth=".8" />
      <polygon points="240,365 429.5,270 429.5,286 240,381" fill="rgba(160,195,255,.09)" stroke="rgba(190,215,255,.3)" strokeWidth=".8" />

      {/* ground plane, drawn flat then projected */}
      <g transform="translate(240 270) scale(1 .5) rotate(45)">
        <rect x="-134" y="-134" width="268" height="268" rx="8" fill="url(#pi-ground)" stroke="rgba(190,215,255,.7)" strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
        <path d={gridPath} stroke="rgba(255,255,255,.08)" strokeWidth="1" fill="none" vectorEffect="non-scaling-stroke" />

        {/* lane */}
        <path d="M92 -134 V134" stroke="rgba(255,255,255,.35)" strokeWidth="2" strokeDasharray="12 10" fill="none" vectorEffect="non-scaling-stroke" />

        {/* bays */}
        <rect x="-50" y="-10" width="100" height="60" fill="rgba(18,184,134,.28)" />
        <path d="M-50 -70 H50 M-50 -10 H50 M-50 50 H50 M-50 110 H50" stroke="rgba(255,255,255,.75)" strokeWidth="2" fill="none" vectorEffect="non-scaling-stroke" />
        <path d="M-50 -70 V110" stroke="rgba(255,255,255,.95)" strokeWidth="3.5" fill="none" vectorEffect="non-scaling-stroke" />
        <rect x="-50" y="-10" width="100" height="60" fill="none" stroke="#34d399" strokeWidth="2.2" vectorEffect="non-scaling-stroke" />
        {[-40, 80].map((y) => (
          <text key={y} x="0" y={y} textAnchor="middle" dominantBaseline="central" fontSize="38" fontWeight="800" fill="rgba(255,255,255,.5)" fontFamily="Sora, sans-serif">
            P
          </text>
        ))}

        {/* route into the highlighted bay */}
        <path d="M92 -122 V20 H54" stroke="#a9ccff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6 8" fill="none" vectorEffect="non-scaling-stroke" className="animate-dash" />
        <circle cx="92" cy="-122" r="5" fill="#fff" />

        {/* target ring + car shadow */}
        <circle cx="0" cy="20" r="36" fill="none" stroke="#34d399" strokeWidth="2" vectorEffect="non-scaling-stroke" className="animate-breathe [transform-box:fill-box] [transform-origin:center]" />
        <rect x="-33" y="4" width="76" height="38" rx="8" fill="#050b1f" opacity=".5" filter="url(#pi-blur)" />
      </g>

      {/* miniature car (isometric boxes) */}
      <g>
        <Box x={-28} y={0} z={0} w={14} d={4} h={8} top="#1b2d56" left="#0f1d3d" right="#0a1429" edge="rgba(255,255,255,.1)" />
        <Box x={14} y={0} z={0} w={14} d={4} h={8} top="#1b2d56" left="#0f1d3d" right="#0a1429" edge="rgba(255,255,255,.1)" />
        <Box x={-35} y={2} z={3} w={70} d={36} h={12} top="#6aa0ff" left="#2f66e8" right="#1f4fc4" />
        <Box x={-18} y={5} z={15} w={36} d={30} h={11} top="#dbe8ff" left="#27468a" right="#17306b" />
        <polygon points={[[35, 6, 7], [35, 13, 7], [35, 13, 11], [35, 6, 11]].map(([a, b, c]) => P(a, b, c)).join(' ')} fill="#fff6c8" />
        <polygon points={[[35, 27, 7], [35, 34, 7], [35, 34, 11], [35, 27, 11]].map(([a, b, c]) => P(a, b, c)).join(' ')} fill="#fff6c8" />
        <Box x={-28} y={38} z={0} w={14} d={4} h={9} top="#243a6b" left="#13244f" right="#0a1429" edge="rgba(255,255,255,.12)" />
        <Box x={14} y={38} z={0} w={14} d={4} h={9} top="#243a6b" left="#13244f" right="#0a1429" edge="rgba(255,255,255,.12)" />
      </g>

      {/* floating pin + its ground shadow */}
      <ellipse cx="226" cy="297" rx="20" ry="7" fill="#050b1f" opacity=".35" className="animate-breathe [transform-box:fill-box] [transform-origin:center]" />
      <g transform="translate(178 140)">
        <g className="animate-float">
          <path
            d="M32 3C19.8 3 10 12.6 10 24.5 10 40 32 61 32 61s22-21 22-36.5C54 12.6 44.2 3 32 3z"
            transform="scale(1.5)"
            fill="url(#pi-pin)"
            stroke="rgba(255,255,255,.45)"
            strokeWidth=".6"
          />
          <path d="M25 16h10.5a8 8 0 010 16H31v10h-6V16zm6 5.5v5h4.2a2.5 2.5 0 000-5H31z" transform="scale(1.5)" fill="#fff" fillRule="evenodd" />
          <ellipse cx="34" cy="21" rx="12" ry="6" transform="rotate(-38 34 21)" fill="#fff" opacity=".2" />
        </g>
      </g>

      {/* nearby spaces */}
      <PriceTag x={82} y={196} label="₹25" delay="1.2s" />
      <PriceTag x={398} y={176} label="₹40" delay="2.4s" />
    </svg>
  )
}
