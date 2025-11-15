import { ChevronRight } from "lucide-react";
export default function WelcomePage({ profession, setProfession, setCurrentPage }) {
  const professions = [
    {
      name: "Real Estate",
      icon: "🏠",
      desc: "Group similar properties, identify unique listings",
    },
    { name: "Law", icon: "⚖️", desc: "Cluster similar cases, find precedents" },
    {
      name: "Journalism",
      icon: "✍️",
      desc: "Organize stories by topic, spot trending themes",
    },
  ];

  return (
    <div className="text-center max-w-[900px] mx-auto">
      <h1 className="text-[50px] text-slate-800 mb-4 font-black tracking-tight font-bold">DBSCAN Visualization</h1>
      <h2 className="text-[36px] text-slate-800 mb-4 font-black">Welcome! Let's speak your language.</h2>
      <p className="text-lg text-slate-600 mb-10 leading-relaxed">
        You work with data every day—properties, cases, articles. What if you
        could automatically find patterns, group similar items, and spot the
        outliers? That's what clustering does, and we'll show you how
        <strong className="text-indigo-500"> without any technical jargon</strong>.
      </p>

      <div className="mb-10">
        <h3 className="text-2xl text-slate-800 mb-6 font-bold">Choose your profession:</h3>
        <div className="grid gap-5 grid-cols-[repeat(auto-fit,minmax(250px,1fr))]">
          {professions.map((p) => (
            <button
              key={p.name}
              onClick={() => setProfession(p.name)}
              className={`p-8 rounded-2xl transition-all cursor-pointer shadow-sm text-left flex flex-col items-start ${
                profession === p.name
                  ? 'border-4 border-indigo-500 bg-indigo-50 shadow-xl'
                  : 'border-4 border-slate-200 bg-white hover:border-indigo-300'
              }`}
            >
              <div className="text-[48px] mb-3">{p.icon}</div>
              <div className="text-xl font-bold text-slate-800 mb-2">{p.name}</div>
              <div className="text-sm text-slate-500">{p.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => setCurrentPage(1)}
        className="px-10 py-4 rounded-xl cursor-pointer text-white font-bold text-lg inline-flex items-center gap-2 shadow-xl bg-gradient-to-br from-indigo-500 to-purple-600 hover:shadow-2xl hover:-translate-y-1 transition"
      >
        Get Started
        <ChevronRight size={20} />
      </button>
    </div>
  );
}