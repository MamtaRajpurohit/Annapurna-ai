import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import DonorDashboard from "./pages/DonorDashboard";
import NGODashboard from "./pages/NGODashboard";
import LiveMatching from "./pages/LiveMatching";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";

// ✅ NEW IMPORTS
import NGOLogin from "./pages/NGOLogin";
import NGORegister from "./pages/NGORegister";

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/40 to-slate-900">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 pb-12">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/donor" element={<DonorDashboard />} />
          <Route path="/ngo" element={<NGODashboard />} />
          <Route path="/matching" element={<LiveMatching />} />
          <Route path="/analytics" element={<AnalyticsDashboard />} />

          {/* ✅ NEW ROUTES */}
          <Route path="/ngo-login" element={<NGOLogin />} />
          <Route path="/ngo-register" element={<NGORegister />} />
        </Routes>
      </main>
    </div>
  );
}