import { useEffect, useState } from "react";
import GlassCard from "../components/GlassCard";
import RouteMap from "../components/RouteMap";
import { getMatches } from "../api/client";

export default function LiveMatching() {
  const [best, setBest] = useState(null);
  const [events, setEvents] = useState([]);
  const [activeMatches, setActiveMatches] = useState(4);
  const [criticalCount, setCriticalCount] = useState(2);

  // Initial API call
  useEffect(() => {
    getMatches({
      lat: 28.61,
      lng: 77.2,
      trustScore: 40,
      urgency: "critical",
    }).then((res) => {
      setBest(res.matches?.[0] || null);
    });
  }, []);

  // Initial events
  useEffect(() => {
    setEvents([
      {
        icon: "🧠",
        title: "Trust score computed: 87/100 — Safe",
        sub: "Biryani 20kg · Donor: Hotel Taj Bandra",
        time: "2 min ago",
      },
      {
        icon: "🎯",
        title: "NGO matched: Akshaya Patra (94% fit)",
        sub: "Distance: 1.8 km · Capacity: Available",
        time: "2 min ago",
      },
      {
        icon: "⚠️",
        title: "Urgency escalated: Normal → Urgent",
        sub: "Dal Makhani 15kg · 6hr threshold",
        time: "5 min ago",
      },
    ]);
  }, []);

  // Simulate live feed
  useEffect(() => {
    const templates = [
      {
        icon: "📈",
        title: "Surplus predicted: Wedding event",
        sub: "~80kg expected",
      },
      {
        icon: "🗺️",
        title: "Route optimized · ETA 6 min",
        sub: "2.1 km route",
      },
      {
        icon: "✅",
        title: "Delivery confirmed: 80 meals served",
        sub: "Impact logged",
      },
    ];

    const interval = setInterval(() => {
      const e = templates[Math.floor(Math.random() * templates.length)];

      setEvents((prev) => [
        {
          ...e,
          time: "just now",
        },
        ...prev.slice(0, 6),
      ]);

      setActiveMatches(3 + Math.floor(Math.random() * 4));
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const addLiveEvent = () => {
    const newEvent = {
      icon: "🧠",
      title: "New AI decision triggered",
      sub: "Realtime matching update",
      time: "just now",
    };
    setEvents((prev) => [newEvent, ...prev]);
  };

  return (
    <div className="pt-8 px-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold">Live Matching Feed</h2>
          <p className="text-slate-400 text-sm">
            Real-time AI decisions — every donation matched in seconds.
          </p>
        </div>

        <div className="px-4 py-2 rounded-full bg-green-500/10 text-green-400 text-sm">
          ● AI Engine Active
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* LEFT - LIVE FEED */}
        <GlassCard title="⚡ Live Events">
          <button
            onClick={addLiveEvent}
            className="mb-4 px-3 py-1 text-xs rounded bg-white/10 hover:bg-white/20"
          >
            + Simulate
          </button>

          <div className="space-y-3">
            {events.map((e, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-white/5 border border-white/10 flex gap-3"
              >
                <div className="text-xl">{e.icon}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{e.title}</p>
                  <p className="text-xs text-slate-400">{e.sub}</p>
                </div>
                <div className="text-xs text-slate-500">{e.time}</div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* RIGHT SIDE */}
        <div className="space-y-5">
          {/* STATS */}
          <div className="grid grid-cols-3 gap-3">
            <GlassCard>
              <p className="text-xs text-slate-400">Active Matches</p>
              <h3 className="text-2xl font-bold text-cyan-400">
                {activeMatches}
              </h3>
            </GlassCard>

            <GlassCard>
              <p className="text-xs text-slate-400">Avg Match Time</p>
              <h3 className="text-2xl font-bold text-green-400">8m</h3>
            </GlassCard>

            <GlassCard>
              <p className="text-xs text-slate-400">Critical Today</p>
              <h3 className="text-2xl font-bold text-red-400">
                {criticalCount}
              </h3>
            </GlassCard>
          </div>

          {/* MAP */}
          <GlassCard title="🗺️ City Overview">
            <RouteMap
              points={[
                { x: 10, y: 80, label: "Donor" },
                { x: 45, y: 55, label: "Transit" },
                { x: 85, y: 20, label: best?.ngoName || "NGO" },
              ]}
            />
          </GlassCard>

          {/* BEST MATCH */}
          <GlassCard title="🎯 Current Match">
            {!best ? (
              <p className="text-slate-400">
                Loading routing intelligence...
              </p>
            ) : (
              <div className="space-y-2 text-sm">
                <p>
                  NGO: <strong>{best.ngoName}</strong>
                </p>
                <p>Distance: {best.distanceKm} km</p>
                <p>ETA: {best.etaMinutes} mins</p>
                <p className="text-slate-400">{best.reason}</p>
              </div>
            )}
          </GlassCard>

          {/* AI LOG */}
          <GlassCard title="🧠 AI Decision Log">
            <div className="text-xs text-slate-400 font-mono space-y-1">
              <p>[09:42] score=87 → safe → match_capacity=true</p>
              <p>[09:38] score=54 → critical → force_nearest=true</p>
              <p>[09:31] score=73 → ngo_type=immediate → eta=12min</p>
              <p>[09:24] surplus_predict=true → alert sent</p>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}