import { motion } from "framer-motion";

export default function RouteMap({ points = [], eta = "8 min" }) {
  const normalized = points.length
    ? points
    : [
        { x: 10, y: 80, label: "Donor", color: "#f72585" },
        { x: 45, y: 50, label: "Hub", color: "#4cc9f0" },
        { x: 90, y: 20, label: "NGO", color: "#06d6a0" }
      ];

  const polyline = normalized.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className="relative h-[240px] rounded-xl overflow-hidden border border-white/10 bg-[#0d0a1e]">

      {/* GRID BACKGROUND */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "32px 32px"
        }}
      />

      {/* ETA BOX */}
      <div className="absolute top-3 right-3 px-3 py-2 rounded-lg bg-black/60 border border-white/10 backdrop-blur-md text-xs">
        <span className="text-slate-400 block">ETA</span>
        <span className="text-cyan-300 text-lg font-bold">{eta}</span>
      </div>

      {/* SVG ROUTE */}
      <svg viewBox="0 0 100 100" className="w-full h-full">

        {/* GLOW PATH */}
        <motion.polyline
          points={polyline}
          fill="none"
          stroke="url(#routeGradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          style={{
            filter: "drop-shadow(0px 0px 6px rgba(247,37,133,0.6))"
          }}
        />

        {/* GRADIENT */}
        <defs>
          <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f72585" />
            <stop offset="50%" stopColor="#7209b7" />
            <stop offset="100%" stopColor="#4cc9f0" />
          </linearGradient>
        </defs>

        {/* PINS */}
        {normalized.map((p, idx) => (
          <g key={idx}>
            {/* Glow */}
            <circle
              cx={p.x}
              cy={p.y}
              r="5"
              fill={p.color}
              opacity="0.2"
            />

            {/* Main Dot */}
            <circle
              cx={p.x}
              cy={p.y}
              r="3"
              fill={p.color}
              stroke="#080614"
              strokeWidth="1"
            />

            {/* Label */}
            <text
              x={p.x + 3}
              y={p.y - 3}
              fill="#cbd5e1"
              fontSize="4"
            >
              {p.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}