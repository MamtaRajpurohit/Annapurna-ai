import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="text-white relative overflow-hidden">

      {/* BACKGROUND GLOW */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute w-[500px] h-[500px] bg-pink-500/20 blur-[120px] top-[-100px] left-[-100px]"></div>
        <div className="absolute w-[400px] h-[400px] bg-cyan-400/20 blur-[120px] bottom-[-100px] right-[-100px]"></div>
      </div>

      {/* HERO */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 relative">

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-extrabold leading-tight mb-6"
        >
          <span className="block">Zero Food Waste,</span>
          <span className="block bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
            Maximum Impact
          </span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-gray-300 max-w-xl mb-10 text-sm md:text-base"
        >
          Annapurna uses trust scoring, predictive matching, and intelligent routing 
          to deliver surplus food to the right NGO within minutes.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-4 flex-wrap justify-center"
        >
          <button
            onClick={() => navigate("/donor")}
            className="px-7 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:scale-105 transition shadow-[0_10px_40px_rgba(247,37,133,0.4)]"
          >
            Donate Food Now
          </button>

          <button
            onClick={() => navigate("/analytics")}
            className="px-7 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition backdrop-blur"
          >
            See Impact
          </button>
        </motion.div>
      </section>

      {/* STATS (GLASS CARDS)
      <div className="max-w-5xl mx-auto px-6 -mt-20 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: "12,847", label: "Meals Served" },
            { value: "4.2T", label: "CO₂ Saved" },
            { value: "68", label: "NGOs Active" },
            { value: "94%", label: "AI Accuracy" }
          ].map((stat, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur hover:bg-white/10 transition text-center"
            >
              <div className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-xs text-gray-400 mt-2 uppercase tracking-wide">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div> */}

      {/* FEATURES */}
      <section className="max-w-6xl mx-auto px-6 py-16 -mt-20 pt-2 pb-20 ">
        <h2 className="text-3xl md:text-5xl font-bold mb-16 text-center">
          Six AI Engines, One Mission
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            "FoodTrust Score",
            "Expiry Engine",
            "Smart NGO Matching",
            "Dynamic Routing",
            "Predictive Surplus",
            "Impact Dashboard"
          ].map((item, i) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur hover:bg-white/10 hover:scale-[1.02] transition"
            >
              <h3 className="text-lg font-semibold mb-2">{item}</h3>
              <p className="text-gray-400 text-sm">
                AI-powered intelligence for smarter food redistribution decisions.
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="text-center pb-24 px-6">
        <h3 className="text-2xl md:text-4xl font-bold mb-6">
          Every Meal Matters.
        </h3>
        <p className="text-gray-400 mb-8">
          Start redistributing surplus food today.
        </p>
        <button
          onClick={() => navigate("/donor")}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 hover:scale-105 transition shadow-lg"
        >
          Get Started
        </button>
      </section>

    </div>
  );
}