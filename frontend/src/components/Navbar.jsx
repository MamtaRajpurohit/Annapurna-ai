import { Link, useLocation, useNavigate } from "react-router-dom";

const links = [
  { to: "/", label: "Home" },
  { to: "/donor", label: "Donate" },
  { to: "/ngo", label: "NGO Dashboard" },
  { to: "/matching", label: "Live Match" },
  { to: "/analytics", label: "Analytics" }
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-10
      bg-[rgba(8,6,20,0.7)] backdrop-blur-[20px] border-b border-white/10">

      {/* LOGO */}
      <div className="font-extrabold text-[20px] tracking-tight 
        bg-gradient-to-r from-pink-400 via-purple-500 to-cyan-400 
        bg-clip-text text-transparent">
        Annapurna 
      </div>

      {/* NAV LINKS */}
      <div className="flex gap-1">
        {links.map((link) => {
          const isActive = location.pathname === link.to;

          return (
            <Link
              key={link.to}
              to={link.to}
              className={`
                px-4 py-[7px] rounded-md text-[14px] transition-all duration-200
                ${isActive
                  ? "text-pink-400 bg-white/10"
                  : "text-white/60 hover:text-white hover:bg-white/10"
                }
              `}
            >
              {link.label}
            </Link>
          );
        })}
      </div>

      {/* QUICK DONATE BUTTON */}
      <button
        onClick={() => navigate("/donor")}
        className="flex items-center gap-2 px-4 py-[6px] rounded-full text-[13px] font-medium
        bg-gradient-to-r from-pink-500 to-purple-600 text-white
        hover:opacity-90 hover:-translate-y-[1px] transition-all duration-200"
      >
        <span>⚡</span>
        Quick Donate
      </button>
    </nav>
  );
}