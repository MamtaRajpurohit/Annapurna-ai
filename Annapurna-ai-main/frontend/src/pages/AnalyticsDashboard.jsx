import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Line,
  Doughnut,
  Bar
} from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
} from "chart.js";
import GlassCard from "../components/GlassCard";
import { getAnalytics } from "../api/client";

ChartJS.register(
  LineElement,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

export default function AnalyticsDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    getAnalytics().then(setData).catch(() => setData(null));
  }, []);

  // fallback demo data (same as your HTML)
  const mealsData = data?.mealsTrend || [1420,1680,1550,1920,2100,2480,1697];

  return (
    <div className="pt-8 px-6 space-y-6 max-w-7xl mx-auto">

      {/* HEADER */}
      <div>
        <h2 className="text-3xl font-bold text-white">Impact Analytics</h2>
        <p className="text-slate-400 text-sm">
          Real-time metrics on food saved, meals served, and CO₂ reduced.
        </p>
      </div>

      {/* TOP METRICS */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid md:grid-cols-3 lg:grid-cols-6 gap-4"
      >

        <Metric title="Meals Served" value="12,847" color="text-pink-400" delta="↑ 23% this month"/>
        <Metric title="Food Saved (kg)" value="4,218" color="text-green-400" delta="↑ 18% this month"/>
        <Metric title="CO₂ Offset (kg)" value="6,327" color="text-cyan-400" delta="↑ 31% this month"/>
        <Metric title="Donations" value="1,043" color="text-yellow-400" delta="↑ 15% this month"/>
        <Metric title="Avg Trust Score" value="76.4" color="text-purple-400" sub="Safe threshold: 80"/>
        <Metric title="Active NGOs" value="68" color="text-white" delta="↑ 12 new"/>

      </motion.div>

      {/* CHARTS GRID */}
      <div className="grid md:grid-cols-2 gap-5">

        {/* LINE CHART */}
        <GlassCard title="📈 Meals Served – Last 7 Days">
          <Line
            data={{
              labels: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
              datasets: [{
                data: mealsData,
                borderColor: "#f72585",
                backgroundColor: "rgba(247,37,133,0.1)",
                tension: 0.4,
                fill: true
              }]
            }}
            options={chartOptions}
          />
        </GlassCard>

        {/* DOUGHNUT */}
        <GlassCard title="🥘 Food Category Breakdown">
          <Doughnut
            data={{
              labels: ["Cooked","Bakery","Raw","Dairy","Packaged","Fruits"],
              datasets: [{
                data: [38,22,14,10,9,7],
                backgroundColor: [
                  "#f72585","#7209b7","#4361ee","#4cc9f0","#06d6a0","#ffd166"
                ]
              }]
            }}
            options={{ plugins: { legend: { position: "right" } } }}
          />
        </GlassCard>

        {/* BAR CHART */}
        <GlassCard title="🧠 Trust Score Distribution">
          <Bar
            data={{
              labels: ["0–20","21–40","41–60","61–80","81–100"],
              datasets: [{
                data: [23,87,214,398,321],
                backgroundColor: [
                  "#ef233c","#ff6b9d","#ffd166","#4cc9f0","#06d6a0"
                ],
                borderRadius: 6
              }]
            }}
            options={chartOptions}
          />
        </GlassCard>

        {/* TOP NGOs */}
        <GlassCard title="🏆 Top NGOs by Meals">
          <TopNGO name="Akshaya Patra" value={4821} percent={100}/>
          <TopNGO name="Robin Hood Army" value={3214} percent={67}/>
          <TopNGO name="No Food Waste" value={2108} percent={44}/>
          <TopNGO name="ISKCON Food Relief" value={1672} percent={35}/>
          <TopNGO name="Food Bank Mumbai" value={1032} percent={21}/>
        </GlassCard>

      </div>
    </div>
  );
}

/* ───────── COMPONENTS ───────── */

function Metric({ title, value, color, delta, sub }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-lg">
      <p className="text-xs text-slate-400 uppercase">{title}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      {delta && <p className="text-green-400 text-xs mt-2">{delta}</p>}
      {sub && <p className="text-slate-400 text-xs mt-2">{sub}</p>}
    </div>
  );
}

function TopNGO({ name, value, percent }) {
  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span>{name}</span>
        <span className="text-cyan-400 font-semibold">{value}</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          style={{ width: `${percent}%` }}
          className="h-full bg-gradient-to-r from-pink-500 to-purple-600"
        />
      </div>
    </div>
  );
}

/* ───────── CHART OPTIONS ───────── */

const chartOptions = {
  responsive: true,
  plugins: { legend: { display: false } },
  scales: {
    x: {
      grid: { color: "rgba(255,255,255,0.05)" },
      ticks: { color: "#aaa" }
    },
    y: {
      grid: { color: "rgba(255,255,255,0.05)" },
      ticks: { color: "#aaa" }
    }
  }
};