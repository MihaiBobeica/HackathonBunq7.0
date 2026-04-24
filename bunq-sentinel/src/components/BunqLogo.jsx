const STRIPES = [
  '#1b5e20', '#2e7d32', '#43a047', '#66bb6a',
  '#00897b', '#0288d1', '#1565c0', '#283593',
  '#6a1b9a', '#b71c1c', '#e53935', '#ef6c00', '#f9a825',
];

export default function BunqLogo({ size = 36 }) {
  const w = size;
  const h = size;
  const r = size * 0.22;
  const stripeW = w / STRIPES.length;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ borderRadius: r, display: 'block', flexShrink: 0 }}>
      <defs>
        <clipPath id="logo-clip">
          <rect width={w} height={h} rx={r} ry={r} />
        </clipPath>
      </defs>

      <g clipPath="url(#logo-clip)">
        {STRIPES.map((color, i) => (
          <rect
            key={i}
            x={i * stripeW}
            y={0}
            width={stripeW + 0.5}
            height={h}
            fill={color}
          />
        ))}

        <text
          x={w / 2}
          y={h * 0.68}
          textAnchor="middle"
          fill="white"
          fontFamily="Inter, ui-sans-serif, system-ui, sans-serif"
          fontWeight="900"
          fontSize={h * 0.38}
          letterSpacing="-0.5"
        >
          bunq
        </text>
      </g>
    </svg>
  );
}
