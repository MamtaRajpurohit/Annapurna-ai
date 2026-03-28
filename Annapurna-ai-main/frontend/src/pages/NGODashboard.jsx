import { useEffect, useState } from "react";
import GlassCard from "../components/GlassCard";
import { getMatches, getPrediction } from "../api/client"; // ✅ UPDATED

export default function NGODashboard() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const [prediction, setPrediction] = useState(null); // ✅ NEW

  useEffect(() => {
    getMatches({
      lat: 28.6139,
      lng: 77.209,
      trustScore: 65,
      urgency: "urgent",
    })
      .then((res) => setMatches(res.matches || []))
      .finally(() => setLoading(false));
  }, []);

  // ✅ FETCH PREDICTION
  useEffect(() => {
    async function fetchPrediction() {
      try {
        const data = await getPrediction();
        setPrediction(data.predictedTime);
      } catch (err) {
        console.error("Prediction error", err);
      }
    }

    fetchPrediction();
  }, []);

  // ✅ PRE-ALERT SYSTEM
  useEffect(() => {
    if (prediction) {
      alert(`📢 Food donation expected around ${prediction}`);
    }
  }, [prediction]);

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto space-y-6 text-white">
      
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">NGO Hub</h2>
          <p className="text-gray-400 text-sm">
            Manage incoming food assignments and track your impact.
          </p>
        </div>

        <div className="flex gap-3">
          <div className="px-4 py-2 rounded-full bg-green-500/10 border border-green-400/30 text-green-400 text-sm">
            ● Online
          </div>
          <div className="px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-400 text-sm">
            Akshaya Patra – Mumbai
          </div>
        </div>
      </div>

      {/* METRICS */}
      <div className="grid md:grid-cols-3 gap-4">
        <GlassCard>
          <p className="text-gray-400 text-xs uppercase">Today's Meals</p>
          <h3 className="text-3xl font-bold text-pink-400">342</h3>
          <p className="text-green-400 text-sm">↑ 18% vs yesterday</p>
        </GlassCard>

        <GlassCard>
          <p className="text-gray-400 text-xs uppercase">Active Requests</p>
          <h3 className="text-3xl font-bold text-cyan-400">7</h3>
          <p className="text-green-400 text-sm">3 urgent</p>
        </GlassCard>

        <GlassCard>
          <p className="text-gray-400 text-xs uppercase">Capacity Used</p>
          <h3 className="text-3xl font-bold text-green-400">68%</h3>
          <p className="text-gray-400 text-sm">Max 500 portions</p>
        </GlassCard>
      </div>

      {/* MAIN GRID */}
      <div className="grid md:grid-cols-2 gap-5">
        
        {/* LEFT - INCOMING REQUESTS */}
        <GlassCard>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">📥 Incoming Requests</h3>
            <span className="text-red-400 text-xs">3 Urgent</span>
          </div>

          <div className="space-y-3">
            {loading ? (
              <p className="text-gray-400">Loading...</p>
            ) : (
              matches.map((m, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-pink-500/10 transition"
                >
                  <div className="flex justify-between items-start">
                    
                    <div>
                      <h4 className="font-semibold text-sm">
                        {m.ngoName}
                      </h4>

                      <div className="text-xs text-gray-400 space-y-1 mt-1">
                        <p>📍 {m.distanceKm} km away</p>
                        <p>📦 Capacity: {m.remainingCapacityKg} kg</p>
                        <p>⏱ ETA: {m.etaMinutes} mins</p>
                      </div>

                      <div className="mt-2 text-xs">
                        <span className="px-2 py-1 rounded-full bg-yellow-400/10 text-yellow-300 border border-yellow-400/30">
                          {m.type}
                        </span>
                      </div>
                    </div>

                    <div className="text-right space-y-2">
                      <div className="text-green-400 font-bold text-lg">
                        {m.fitScore}%
                      </div>

                      <div className="flex flex-col gap-1">
                        <button className="px-3 py-1 text-xs rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90">
                          Accept
                        </button>
                        <button className="px-3 py-1 text-xs rounded-lg border border-white/20 hover:bg-white/10">
                          Pass
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>

        {/* RIGHT COLUMN */}
        <div className="space-y-4">

          {/* CAPACITY */}
          <GlassCard>
            <h3 className="font-semibold mb-3">🏠 Storage Capacity</h3>

            <div className="space-y-4 text-sm">
              <div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Immediate</span>
                  <span className="text-cyan-400">68%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full mt-1">
                  <div className="h-2 bg-cyan-400 rounded-full w-[68%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Cold Storage</span>
                  <span className="text-green-400">42%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full mt-1">
                  <div className="h-2 bg-green-400 rounded-full w-[42%]" />
                </div>
              </div>
            </div>
          </GlassCard>

          {/* ✅ REAL PREDICTIVE ALERT */}
          {prediction && (
            <GlassCard className="border-yellow-400/30 bg-yellow-400/5">
              <p className="text-yellow-400 text-xs uppercase mb-2">
                📈 Predictive Alert
              </p>

              <h4 className="font-medium text-sm">
                Upcoming Donation Window
              </h4>

              <p className="text-gray-400 text-xs mt-1">
                Food surplus expected around{" "}
                <span className="text-pink-400 font-bold">
                  {prediction}
                </span>
              </p>

              <div className="flex gap-2 mt-3">
                <button className="flex-1 py-1 text-xs rounded-lg bg-gradient-to-r from-pink-500 to-purple-600">
                  Prepare
                </button>
                <button className="flex-1 py-1 text-xs rounded-lg border border-white/20">
                  Dismiss
                </button>
              </div>
            </GlassCard>
          )}

          {/* IMPACT */}
          <GlassCard>
            <p className="text-gray-400 text-xs uppercase mb-3">
              🌍 Today's Impact
            </p>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-lg bg-pink-500/10 border border-pink-400/20">
                <h3 className="text-xl font-bold text-pink-400">342</h3>
                <p className="text-xs text-gray-400">Meals</p>
              </div>

              <div className="p-3 rounded-lg bg-green-500/10 border border-green-400/20">
                <h3 className="text-xl font-bold text-green-400">68kg</h3>
                <p className="text-xs text-gray-400">Saved</p>
              </div>

              <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-400/20">
                <h3 className="text-xl font-bold text-cyan-400">12.3</h3>
                <p className="text-xs text-gray-400">CO₂</p>
              </div>

              <div className="p-3 rounded-lg bg-yellow-400/10 border border-yellow-400/20">
                <h3 className="text-xl font-bold text-yellow-400">7</h3>
                <p className="text-xs text-gray-400">Pickups</p>
              </div>
            </div>
          </GlassCard>

        </div>
      </div>
    </div>
  );
}