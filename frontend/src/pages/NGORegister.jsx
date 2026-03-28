import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function NGORegister() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    capacity: "",
    address: "",
    city: "",
    pincode: "",
    storageType: "",
    contact: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = () => {
    let ngos = JSON.parse(localStorage.getItem("ngos")) || [];

    const exists = ngos.find((ngo) => ngo.email === form.email);
    if (exists) {
      alert("NGO already registered!");
      return;
    }

    ngos.push(form);
    localStorage.setItem("ngos", JSON.stringify(ngos));

    alert("NGO Registered Successfully!");
    navigate("/ngo-login");
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center pt-20">

      <div className="w-full max-w-lg p-8 rounded-2xl 
        bg-white/5 backdrop-blur-xl border border-white/10 
        shadow-[0_0_40px_rgba(168,85,247,0.15)]">

        <h2 className="text-2xl font-bold text-center mb-2 
          bg-gradient-to-r from-pink-400 to-purple-400 
          bg-clip-text text-transparent">
          Register Your NGO
        </h2>

        <p className="text-center text-sm text-white/60 mb-6">
          Join Annapurna AI and start receiving food donations
        </p>

        <div className="grid grid-cols-1 gap-4">

          <input
            name="name"
            placeholder="NGO Name"
            className="px-4 py-2 rounded-lg bg-white/10 text-white border border-white/10 outline-none focus:border-pink-400"
            onChange={handleChange}
          />

          <input
            name="email"
            type="email"
            placeholder="Email Address"
            className="px-4 py-2 rounded-lg bg-white/10 text-white border border-white/10 outline-none focus:border-purple-400"
            onChange={handleChange}
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            className="px-4 py-2 rounded-lg bg-white/10 text-white border border-white/10 outline-none focus:border-pink-400"
            onChange={handleChange}
          />

          <input
            name="capacity"
            type="number"
            placeholder="Meals Capacity per Day (e.g. 100)"
            className="px-4 py-2 rounded-lg bg-white/10 text-white border border-white/10 outline-none focus:border-purple-400"
            onChange={handleChange}
          />

          <input
            name="address"
            placeholder="NGO Address"
            className="px-4 py-2 rounded-lg bg-white/10 text-white border border-white/10 outline-none focus:border-pink-400"
            onChange={handleChange}
          />

          <input
            name="city"
            placeholder="City"
            className="px-4 py-2 rounded-lg bg-white/10 text-white border border-white/10 outline-none focus:border-purple-400"
            onChange={handleChange}
          />

          <input
            name="pincode"
            type="number"
            placeholder="Pincode"
            className="px-4 py-2 rounded-lg bg-white/10 text-white border border-white/10 outline-none focus:border-pink-400"
            onChange={handleChange}
          />

          {/* ✅ FIXED STORAGE TYPE DROPDOWN */}
          <select
            name="storageType"
            className="px-4 py-2 rounded-lg bg-[#1e1b2e] text-white border border-white/10 outline-none focus:border-purple-400"
            onChange={handleChange}
          >
            <option value="" className="bg-slate-900 text-white">
              Select Storage Type
            </option>
            <option value="refrigeration" className="bg-slate-900 text-white">
              Refrigeration ❄️
            </option>
            <option value="dry" className="bg-slate-900 text-white">
              Dry Storage 📦
            </option>
          </select>

          <input
            name="contact"
            placeholder="Contact Number"
            className="px-4 py-2 rounded-lg bg-white/10 text-white border border-white/10 outline-none focus:border-purple-400"
            onChange={handleChange}
          />

          <button
            onClick={handleRegister}
            className="mt-2 py-2 rounded-lg font-medium 
              bg-gradient-to-r from-pink-500 to-purple-600 
              hover:opacity-90 transition"
          >
            Register NGO
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-white/60">
          Already registered?{" "}
          <span
            onClick={() => navigate("/ngo-login")}
            className="text-pink-400 cursor-pointer hover:underline"
          >
            Login here
          </span>
        </div>

      </div>
    </div>
  );
}