import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function NGOLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    const ngos = JSON.parse(localStorage.getItem("ngos")) || [];

    const ngo = ngos.find(
      (ngo) => ngo.email === email && ngo.password === password
    );

    if (!ngo) {
      alert("Invalid credentials");
      return;
    }

    localStorage.setItem("loggedInNGO", JSON.stringify(ngo));
    navigate("/ngo");
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">

      {/* GLASS CARD */}
      <div className="w-full max-w-md p-8 rounded-2xl 
        bg-white/5 backdrop-blur-xl border border-white/10 
        shadow-[0_0_40px_rgba(168,85,247,0.15)]">

        {/* TITLE */}
        <h2 className="text-2xl font-bold text-center mb-2 
          bg-gradient-to-r from-pink-400 to-purple-400 
          bg-clip-text text-transparent">
          NGO Login
        </h2>

        <p className="text-center text-sm text-white/60 mb-6">
          Access your NGO dashboard and manage food distribution
        </p>

        {/* FORM */}
        <div className="flex flex-col gap-4">

          {/* EMAIL */}
          <input
            type="email"
            placeholder="Enter your email"
            className="px-4 py-2 rounded-lg bg-white/10 text-white 
              border border-white/10 outline-none 
              focus:border-pink-400 transition"
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* PASSWORD */}
          <input
            type="password"
            placeholder="Enter your password"
            className="px-4 py-2 rounded-lg bg-white/10 text-white 
              border border-white/10 outline-none 
              focus:border-purple-400 transition"
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* LOGIN BUTTON */}
          <button
            onClick={handleLogin}
            className="mt-2 py-2 rounded-lg font-medium 
              bg-gradient-to-r from-pink-500 to-purple-600 
              hover:opacity-90 transition"
          >
            Login
          </button>
        </div>

        {/* EXTRA LINKS */}
        <div className="mt-6 text-center text-sm text-white/60">
          Don’t have an NGO account?{" "}
          <span
            onClick={() => navigate("/ngo-register")}
            className="text-pink-400 cursor-pointer hover:underline"
          >
            Register here
          </span>
        </div>

      </div>
    </div>
  );
}