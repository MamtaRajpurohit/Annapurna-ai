export default function GlassCard({ title, children }) {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
      <h3 className="font-bold mb-4">{title}</h3>
      {children}
    </div>
  );
}