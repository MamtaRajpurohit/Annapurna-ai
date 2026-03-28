import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import GlassCard from "../components/GlassCard";
import { postDonation } from "../api/client";

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result?.toString() || "");
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function DonorDashboard() {
  const [form, setForm] = useState({
    category: "",
    quantity: "",
    preparedAtHoursAgo: 1,
    storage: "refrigerated",
    location: "",
    notes: "",
  });

  const [coords, setCoords] = useState(null);
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [countdown, setCountdown] = useState(300);

  // 📍 AUTO LOCATION DETECTION
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => console.log("Location denied")
    );
  }, []);

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const runAI = async () => {
    if (!form.category) return alert("Select food type");

    setLoading(true);
    setStep(2);

    try {
      let base64 = "";
      if (image) {
        base64 = await toBase64(image);
      }

      // ✅ FIXED PAYLOAD
      const payload = {
        ...form,
        quantityKg: parseFloat(form.quantity),
        location: coords,
        imageData: base64,
        imageFreshness: Math.floor(60 + Math.random() * 30),
        preparedAt: new Date(
          Date.now() - form.preparedAtHoursAgo * 3600000
        ).toISOString(),
      };

      const res = await postDonation(payload);
      setResult(res);
      setStep(3);

      // ⏳ TIMER
      let time = 300;
      const interval = setInterval(() => {
        time--;
        setCountdown(time);
        if (time <= 0) clearInterval(interval);
      }, 1000);
    } catch (err) {
  console.error("FULL ERROR:", err);
  alert("AI failed");
} finally {
      setLoading(false);
    }
  };

  const steps = ["Upload Food", "AI Analysis", "NGO Match", "Dispatched"];

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
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">

        {/* LEFT */}
        <div className="space-y-5">

          <GlassCard title="📸 Food Details">
            <div className="space-y-4">

              {/* IMAGE */}
              <label className="input flex items-center justify-between cursor-pointer">
                <span className="text-white/70">
                  {image ? image.name : "Upload food image"}
                </span>
                <span className="text-pink-400 font-semibold">Browse</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setImage(e.target.files[0])}
                />
              </label>

              {/* CATEGORY */}
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

              {/* QUANTITY */}
              <input
                className="input"
                placeholder="Quantity (kg)"
                onChange={(e) => update("quantity", e.target.value)}
              />

              {/* TIME + STORAGE */}
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

              {/* MAIN BUTTON */}
              <button
                onClick={runAI}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 font-semibold"
              >
                {loading ? "Analyzing..." : "🧠 Analyze & Match →"}
              </button>
            </div>
          </GlassCard>

          <GlassCard title="📋 Your Donations">
            <div className="text-sm text-slate-400">
              Previous donation records will appear here.
            </div>
          </GlassCard>
        </div>

        {/* RIGHT */}
        <div className="space-y-5">

          {/* TRUST */}
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

                {/* 🔥 IMPROVED URGENCY */}
                <div className="flex justify-between">
                  <span>Urgency</span>
                  <span
                    className={`font-bold ${
                      result.urgency === "critical"
                        ? "text-red-500 animate-pulse"
                        : result.urgency === "urgent"
                        ? "text-amber-400"
                        : "text-green-400"
                    }`}
                  >
                    {result.urgency.toUpperCase()}
                  </span>
                </div>

              </div>
            )}
          </GlassCard>

          {/* ADVICE */}
          {result?.advice && (
            <GlassCard title="📦 Smart Suggestions">
              <ul className="text-sm space-y-2">
                {result.advice.map((a, i) => (
                  <li key={i}>• {a}</li>
                ))}
              </ul>
            </GlassCard>
          )}

          {/* ALERTS */}
          {result?.alerts && (
            <GlassCard title="⚠️ Risk Alerts">
              <ul className="text-red-400 text-sm space-y-2">
                {result.alerts.map((a, i) => (
                  <li key={i}>⚠ {a}</li>
                ))}
              </ul>
            </GlassCard>
          )}

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
                        <p className="font-semibold">{ngo.ngoName}</p>
                        <p className="text-xs text-slate-400">
                          {ngo.distanceKm} km • Capacity: {ngo.remainingCapacityKg}
                        </p>

                        {/* 🔥 NEW */}
                        <p className="text-xs text-pink-300 mt-2">
                          🤖 {ngo.reason}
                        </p>

                        <p className="text-xs text-slate-500">
                          ETA: {ngo.etaMinutes} mins
                        </p>
                      </div>

                      <div className="text-green-400 font-bold">
                        {ngo.fitScore}%
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          )}

          {/* TIMER */}
          {result && (
            <GlassCard title="⏳ NGO Response Timer">
              <div className="text-center text-2xl font-bold text-pink-400">
                {Math.floor(countdown / 60)}:
                {String(countdown % 60).padStart(2, "0")}
              </div>
            </GlassCard>
          )}

          {/* 🗺️ GOOGLE MAP */}
          {result && (
            <GlassCard title="🗺️ Delivery Route">
              <iframe
                width="100%"
                height="200"
                className="rounded-xl"
                src={`https://www.google.com/maps?q=${result.matches[0].ngoName}&output=embed`}
              ></iframe>

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