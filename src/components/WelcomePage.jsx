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
    <div style={{ textAlign: "center", maxWidth: 900, margin: "0 auto" }}>
      <h2 style={{ fontSize: 36, color: "#1e293b", marginBottom: 16 }}>
        Welcome! Let's speak your language.
      </h2>
      <p
        style={{
          fontSize: 18,
          color: "#475569",
          marginBottom: 40,
          lineHeight: 1.6,
        }}
      >
        You work with data every day—properties, cases, articles. What if you
        could automatically find patterns, group similar items, and spot the
        outliers? That's what clustering does, and we'll show you how
        <strong style={{ color: "#667eea" }}>
          {" "}
          without any technical jargon
        </strong>
        .
      </p>

      <div style={{ marginBottom: 40 }}>
        <h3 style={{ fontSize: 24, color: "#1e293b", marginBottom: 24 }}>
          Choose your profession:
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: 20,
          }}
        >
          {professions.map((p) => (
            <button
              key={p.name}
              onClick={() => setProfession(p.name)}
              style={{
                padding: 30,
                border:
                  profession === p.name
                    ? "3px solid #667eea"
                    : "2px solid #e2e8f0",
                background: profession === p.name ? "#f0f4ff" : "white",
                borderRadius: 16,
                cursor: "pointer",
                transition: "all 0.3s",
                boxShadow:
                  profession === p.name
                    ? "0 8px 20px rgba(102,126,234,0.2)"
                    : "0 2px 8px rgba(0,0,0,0.05)",
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 12 }}>{p.icon}</div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#1e293b",
                  marginBottom: 8,
                }}
              >
                {p.name}
              </div>
              <div style={{ fontSize: 14, color: "#64748b" }}>{p.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => setCurrentPage(1)}
        style={{
          padding: "16px 40px",
          border: "none",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          borderRadius: 12,
          cursor: "pointer",
          fontSize: 18,
          fontWeight: 700,
          boxShadow: "0 8px 20px rgba(102,126,234,0.3)",
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        Get Started
        <ChevronRight size={20} />
      </button>
    </div>
  );
}