import { useState } from "react";
import { motion } from "framer-motion";
import GlassCard from "../components/GlassCard";
import RouteMap from "../components/RouteMap";
import { postDonation } from "../api/client";

export default function DonorDashboard() {
  const [form, setForm] = useState({
    category: "",
    quantity: "",
    preparedAtHoursAgo: 1,
    storage: "refrigerated",
    location: "",
    notes: "",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const runAI = async () => {
    if (!form.category) return alert("Select food type");

    setLoading(true);
    setStep(2);

    try {
      const payload = {
        ...form,
        preparedAt: new Date(Date.now() - form.preparedAtHoursAgo * 3600000),
      };

      const res = await postDonation(payload);
      setResult(res);
      setStep(4);
    } catch {
      alert("AI failed");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    "Upload Food",
    "AI Analysis",
    "NGO Match",
    "Dispatched",
  ];

  return (
    <div className="pt-6 px-6 max-w-7xl mx-auto space-y-6">

      {/* HEADER */}
      <div>
        <h2 className="text-3xl font-bold">Donor Dashboard</h2>
        <p className="text-slate-400 text-sm">
          Upload surplus food — AI handles everything instantly
        </p>
      </div>

      {/* STEP INDICATOR */}
      <div className="flex items-center gap-4">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-3">
            <div
              className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold
              ${
                step > i + 1
                  ? "bg-pink-500 text-white"
                  : step === i + 1
                  ? "border border-pink-400 text-pink-400"
                  : "bg-white/10 text-slate-400"
              }`}
            >
              {step > i + 1 ? "✓" : i + 1}
            </div>
            <span className="text-sm">{s}</span>
            {i !== steps.length - 1 && (
              <div className="w-6 h-[1px] bg-white/10"></div>
            )}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">

        {/* LEFT SIDE */}
        <div className="space-y-5">

          {/* FORM */}
          <GlassCard title="📸 Food Details">
            <div className="space-y-4">

              <select
                className="input"
                onChange={(e) => update("category", e.target.value)}
              >
                <option value="">Select category</option>
                <option value="cooked">Cooked Meals</option>
                <option value="raw">Raw</option>
                <option value="bakery">Bakery</option>
                <option value="dairy">Dairy</option>
              </select>

              <input
                className="input"
                placeholder="Quantity (e.g. 10kg)"
                onChange={(e) => update("quantity", e.target.value)}
              />

              <div className="grid grid-cols-2 gap-3">
                <select
                  className="input"
                  onChange={(e) =>
                    update("preparedAtHoursAgo", e.target.value)
                  }
                >
                  <option value={1}>Less than 1 hr</option>
                  <option value={3}>1–3 hrs</option>
                  <option value={6}>3–6 hrs</option>
                  <option value={12}>6–12 hrs</option>
                </select>

                <select
                  className="input"
                  onChange={(e) => update("storage", e.target.value)}
                >
                  <option value="refrigerated">Refrigerated</option>
                  <option value="room">Room Temp</option>
                  <option value="hot">Hot</option>
                </select>
              </div>

              <input
                className="input"
                placeholder="Location"
                onChange={(e) => update("location", e.target.value)}
              />

              <button
                onClick={runAI}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 font-semibold"
              >
                {loading ? "Analyzing..." : "🧠 Analyze & Match →"}
              </button>
            </div>
          </GlassCard>

          {/* HISTORY */}
          <GlassCard title="📋 Your Donations">
            <div className="text-sm text-slate-400">
              Previous donation records will appear here.
            </div>
          </GlassCard>
        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-5">

          {/* TRUST SCORE */}
          <GlassCard title="🧠 FoodTrust AI Score">
            {!result ? (
              <div className="text-center text-slate-400 py-8">
                AI awaiting input
              </div>
            ) : (
              <div className="space-y-4">

                <div className="flex justify-between">
                  <span>Trust Score</span>
                  <span className="text-2xl font-bold text-cyan-400">
                    {result.trust.score}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Status</span>
                  <span className="text-green-400">
                    {result.quality.status}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Urgency</span>
                  <span className="text-amber-400">
                    {result.urgency}
                  </span>
                </div>

              </div>
            )}
          </GlassCard>

          {/* NGO MATCH */}
          {result && (
            <GlassCard title="🎯 Smart NGO Match">
              <div className="space-y-3">
                {result.matches?.map((ngo, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.02 }}
                    className={`p-4 rounded-xl border ${
                      i === 0
                        ? "border-pink-400 bg-pink-500/10"
                        : "border-white/10"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{ngo.name}</p>
                        <p className="text-xs text-slate-400">
                          {ngo.distance} • {ngo.capacity}
                        </p>
                      </div>

                      <div className="text-green-400 font-bold">
                        {ngo.match}%
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          )}

          {/* ROUTE */}
          {result && (
            <GlassCard title="🗺️ Delivery Route">
              <RouteMap points={result.route?.points} />
              <button className="w-full mt-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl">
                Confirm Dispatch
              </button>
            </GlassCard>
          )}

        </div>
      </div>
    </div>
  );
}