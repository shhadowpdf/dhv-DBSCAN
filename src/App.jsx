import React, { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import { ChevronRight, ChevronLeft, Play, Info, Users, TrendingUp, FileText, Home } from "lucide-react";

/* ---------- shape generators ---------- */
function makeCircle(cx, cy, r, n, id) {
  return Array.from({ length: n }, (_, i) => {
    const a = Math.random() * Math.PI * 2;
    const rad = r * (0.7 + Math.random() * 0.5);
    return { id: `${id}${i}`, x: cx + Math.cos(a) * rad, y: cy + Math.sin(a) * rad };
  });
}
function makeEllipse(cx, cy, rx, ry, n, id) {
  return Array.from({ length: n }, (_, i) => {
    const a = Math.random() * Math.PI * 2;
    const rr = 0.8 + Math.random() * 0.4;
    return { id: `${id}${i}`, x: cx + Math.cos(a) * rx * rr, y: cy + Math.sin(a) * ry * rr };
  });
}
function makeLine(x1, y1, x2, y2, spread, n, id) {
  return Array.from({ length: n }, (_, i) => {
    const t = Math.random();
    return { id: `${id}${i}`, x: x1 + (x2 - x1) * t + (Math.random() - 0.5) * spread, y: y1 + (y2 - y1) * t + (Math.random() - 0.5) * spread };
  });
}
function makeCrescent(cx, cy, r1, r2, n, id) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = r1 + Math.random() * (r2 - r1);
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    if ((x - (cx + r1 * 0.4)) ** 2 + (y - cy) ** 2 > (r1 * 0.6) ** 2) pts.push({ id: `${id}${i}`, x, y });
  }
  return pts;
}

/* ---------- datasets ---------- */
function makeDataset(kind) {
  if (kind === "Real Estate")
    return [
      ...makeCircle(24, 34, 6, 20, "RE-C1-"),
      ...makeEllipse(62, 36, 10, 5, 22, "RE-E1-"),
      ...makeCrescent(46, 76, 6, 12, 18, "RE-CR-"),
      ...makeLine(72, 22, 90, 40, 2.2, 14, "RE-L1-"),
      { id: "RE-OUT", x: 88, y: 12 },
    ];
  if (kind === "Law")
    return [
      ...makeCircle(20, 24, 5.5, 18, "LAW-C1-"),
      ...makeLine(52, 18, 72, 36, 3, 16, "LAW-L1-"),
      ...makeCrescent(50, 72, 6, 12, 18, "LAW-CR-"),
      { id: "LAW-OUT1", x: 92, y: 88 },
      { id: "LAW-OUT2", x: 6, y: 88 },
    ];
  return [
    ...makeCircle(25, 62, 6, 18, "J-C1-"),
    ...makeEllipse(62, 28, 8, 4, 18, "J-E1-"),
    ...makeCrescent(68, 68, 6, 11, 16, "J-CR-"),
    { id: "J-OUT", x: 8, y: 10 },
  ];
}

/* ---------- DBSCAN ---------- */
function dbscan(points, eps, minPts) {
  const n = points.length;
  const labels = new Array(n).fill(null);
  let cid = 0;
  const dist = (i, j) => Math.hypot(points[i].x - points[j].x, points[i].y - points[j].y);
  function nbr(i) {
    const out = [];
    for (let j = 0; j < n; j++) if (dist(i, j) <= eps) out.push(j);
    return out;
  }
  for (let i = 0; i < n; i++) {
    if (labels[i] !== null) continue;
    const nbs = nbr(i);
    if (nbs.length < minPts) {
      labels[i] = -1;
      continue;
    }
    labels[i] = cid;
    const stack = [...nbs];
    while (stack.length) {
      const j = stack.pop();
      if (labels[j] === -1) labels[j] = cid;
      if (labels[j] !== null) continue;
      labels[j] = cid;
      const n2 = nbr(j);
      if (n2.length >= minPts) {
        for (const k of n2) if (!stack.includes(k)) stack.push(k);
      }
    }
    cid++;
  }
  return labels;
}

/* ---------- MAIN DASHBOARD COMPONENT ---------- */
export default function DBSCANProfessionalDashboard() {
  const [currentPage, setCurrentPage] = useState(0);
  const [profession, setProfession] = useState("Real Estate");
  const [eps, setEps] = useState(6);
  const [minPts, setMinPts] = useState(4);
  const [tutorialStep, setTutorialStep] = useState(0);

  const pages = [
    { id: "welcome", title: "Welcome", icon: Home },
    { id: "learn", title: "Learn the Language", icon: Info },
    { id: "interactive", title: "Interactive Tutorial", icon: Play },
    { id: "visualize", title: "Live Clustering", icon: TrendingUp },
    { id: "compare", title: "Compare Scenarios", icon: Users },
    { id: "insights", title: "Professional Insights", icon: FileText }
  ];

  return (
    <div style={{ fontFamily: "Inter, -apple-system, sans-serif", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", minHeight: "100vh", padding: "20px" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", background: "white", borderRadius: 20, boxShadow: "0 20px 60px rgba(0,0,0,0.3)", overflow: "hidden" }}>
        
        <header style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", padding: "30px 40px", color: "white" }}>
          <h1 style={{ margin: 0, fontSize: 32, fontWeight: 900, letterSpacing: "-0.5px" }}>
            Pattern Discovery for Professionals
          </h1>
          <p style={{ margin: "8px 0 0 0", fontSize: 16, opacity: 0.9 }}>
            Understanding data clustering through your professional lens
          </p>
        </header>

        <nav style={{ display: "flex", borderBottom: "2px solid #e2e8f0", background: "#f8fafc", overflowX: "auto" }}>
          {pages.map((page, idx) => {
            const Icon = page.icon;
            return (
              <button
                key={page.id}
                onClick={() => setCurrentPage(idx)}
                style={{
                  flex: "1 1 auto",
                  padding: "16px 20px",
                  border: "none",
                  background: currentPage === idx ? "white" : "transparent",
                  borderBottom: currentPage === idx ? "3px solid #667eea" : "3px solid transparent",
                  color: currentPage === idx ? "#667eea" : "#64748b",
                  cursor: "pointer",
                  fontWeight: currentPage === idx ? 700 : 500,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  fontSize: 14,
                  transition: "all 0.2s"
                }}
              >
                <Icon size={18} />
                {page.title}
              </button>
            );
          })}
        </nav>

        <main style={{ padding: 40, minHeight: 500 }}>
          {currentPage === 0 && <WelcomePage profession={profession} setProfession={setProfession} setCurrentPage={setCurrentPage} />}
          {currentPage === 1 && <LearnLanguagePage profession={profession} />}
          {currentPage === 2 && <InteractiveTutorialPage profession={profession} tutorialStep={tutorialStep} setTutorialStep={setTutorialStep} />}
          {currentPage === 3 && <LiveClusteringPage profession={profession} eps={eps} setEps={setEps} minPts={minPts} setMinPts={setMinPts} />}
          {currentPage === 4 && <CompareScenarios profession={profession} />}
          {currentPage === 5 && <InsightsPage profession={profession} />}
        </main>

        <footer style={{ padding: "20px 40px", background: "#f8fafc", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between" }}>
          <button
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            style={{
              padding: "10px 20px",
              border: "none",
              background: currentPage === 0 ? "#e2e8f0" : "#667eea",
              color: currentPage === 0 ? "#94a3b8" : "white",
              borderRadius: 8,
              cursor: currentPage === 0 ? "not-allowed" : "pointer",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 8
            }}
          >
            <ChevronLeft size={18} />
            Previous
          </button>
          <button
            onClick={() => setCurrentPage(Math.min(pages.length - 1, currentPage + 1))}
            disabled={currentPage === pages.length - 1}
            style={{
              padding: "10px 20px",
              border: "none",
              background: currentPage === pages.length - 1 ? "#e2e8f0" : "#667eea",
              color: currentPage === pages.length - 1 ? "#94a3b8" : "white",
              borderRadius: 8,
              cursor: currentPage === pages.length - 1 ? "not-allowed" : "pointer",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 8
            }}
          >
            Next
            <ChevronRight size={18} />
          </button>
        </footer>
      </div>
    </div>
  );
}

/* ---------- PAGE COMPONENTS ---------- */

function WelcomePage({ profession, setProfession, setCurrentPage }) {
  const professions = [
    { name: "Real Estate", icon: "🏠", desc: "Group similar properties, identify unique listings" },
    { name: "Law", icon: "⚖️", desc: "Cluster similar cases, find precedents" },
    { name: "Journalism", icon: "✍️", desc: "Organize stories by topic, spot trending themes" }
  ];

  return (
    <div style={{ textAlign: "center", maxWidth: 900, margin: "0 auto" }}>
      <h2 style={{ fontSize: 36, color: "#1e293b", marginBottom: 16 }}>Welcome! Let's speak your language.</h2>
      <p style={{ fontSize: 18, color: "#475569", marginBottom: 40, lineHeight: 1.6 }}>
        You work with data every day—properties, cases, articles. What if you could automatically find patterns, 
        group similar items, and spot the outliers? That's what clustering does, and we'll show you how 
        <strong style={{ color: "#667eea" }}> without any technical jargon</strong>.
      </p>

      <div style={{ marginBottom: 40 }}>
        <h3 style={{ fontSize: 24, color: "#1e293b", marginBottom: 24 }}>Choose your profession:</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 20 }}>
          {professions.map(p => (
            <button
              key={p.name}
              onClick={() => setProfession(p.name)}
              style={{
                padding: 30,
                border: profession === p.name ? "3px solid #667eea" : "2px solid #e2e8f0",
                background: profession === p.name ? "#f0f4ff" : "white",
                borderRadius: 16,
                cursor: "pointer",
                transition: "all 0.3s",
                boxShadow: profession === p.name ? "0 8px 20px rgba(102,126,234,0.2)" : "0 2px 8px rgba(0,0,0,0.05)"
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 12 }}>{p.icon}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#1e293b", marginBottom: 8 }}>{p.name}</div>
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
          gap: 10
        }}
      >
        Get Started
        <ChevronRight size={20} />
      </button>
    </div>
  );
}

function LearnLanguagePage({ profession }) {
  const translations = {
    "Real Estate": [
      { your: "Neighborhood", tech: "Cluster", explanation: "A group of similar properties close together in price and features" },
      { your: "Walking Distance", tech: "Epsilon (ε)", explanation: "How close properties need to be to consider them part of the same neighborhood" },
      { your: "Minimum Community Size", tech: "MinPts", explanation: "How many similar properties you need before calling it a neighborhood" },
      { your: "Unique Listing", tech: "Outlier", explanation: "A property that doesn't fit any neighborhood—too different or isolated" },
      { your: "Property Features", tech: "Data Points", explanation: "Size, price, location—the characteristics you compare" },
      { your: "Market Segment", tech: "Dense Region", explanation: "An area where many similar properties cluster together" }
    ],
    "Law": [
      { your: "Case Category", tech: "Cluster", explanation: "A group of similar cases (theft, fraud, assault, etc.)" },
      { your: "Similar Circumstances", tech: "Epsilon (ε)", explanation: "How similar cases must be to group them together" },
      { your: "Minimum Precedent Count", tech: "MinPts", explanation: "How many similar cases needed to establish a pattern" },
      { your: "Landmark Case", tech: "Outlier", explanation: "A unique case that doesn't fit existing categories" },
      { your: "Case Characteristics", tech: "Data Points", explanation: "Duration, complexity, severity—the factors you compare" },
      { your: "Common Case Type", tech: "Dense Region", explanation: "Areas where many similar cases cluster" }
    ],
    "Journalism": [
      { your: "Story Beat", tech: "Cluster", explanation: "A group of articles covering the same topic or theme" },
      { your: "Topic Similarity", tech: "Epsilon (ε)", explanation: "How similar articles must be to group them in the same beat" },
      { your: "Minimum Coverage", tech: "MinPts", explanation: "How many articles needed to call something a recurring beat" },
      { your: "Breaking Investigation", tech: "Outlier", explanation: "A unique story that stands alone, not part of regular coverage" },
      { your: "Article Metrics", tech: "Data Points", explanation: "Length, engagement, topic—the characteristics you measure" },
      { your: "Trending Topic", tech: "Dense Region", explanation: "Where many similar stories cluster together" }
    ]
  };

  const current = translations[profession];

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <h2 style={{ fontSize: 32, color: "#1e293b", marginBottom: 16, textAlign: "center" }}>
        Your Language ↔ Tech Language
      </h2>
      <p style={{ fontSize: 16, color: "#475569", marginBottom: 40, textAlign: "center", lineHeight: 1.6 }}>
        Here's how the words you use every day connect to data clustering concepts. 
        <strong> No formulas, just plain translations</strong>.
      </p>

      <div style={{ display: "grid", gap: 20 }}>
        {current.map((item, idx) => (
          <div 
            key={idx}
            style={{
              background: "linear-gradient(135deg, #f8faff 0%, #ffffff 100%)",
              border: "2px solid #e0e7ff",
              borderRadius: 16,
              padding: 24,
              display: "grid",
              gridTemplateColumns: "1fr auto 1fr",
              gap: 20,
              alignItems: "center",
              boxShadow: "0 4px 12px rgba(102,126,234,0.08)",
              transition: "all 0.3s"
            }}
          >
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#667eea", marginBottom: 4 }}>{item.your}</div>
              <div style={{ fontSize: 13, color: "#64748b" }}>What you say</div>
            </div>
            <div style={{ fontSize: 24, color: "#94a3b8" }}>⟷</div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#764ba2", marginBottom: 4 }}>{item.tech}</div>
              <div style={{ fontSize: 13, color: "#64748b" }}>Tech term</div>
            </div>
            <div style={{ gridColumn: "1 / -1", marginTop: 8, padding: 16, background: "white", borderRadius: 8, fontSize: 14, color: "#475569", lineHeight: 1.5 }}>
              💡 {item.explanation}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 40, padding: 24, background: "#fef3c7", borderRadius: 16, border: "2px solid #fbbf24" }}>
        <h3 style={{ margin: "0 0 12px 0", color: "#92400e", fontSize: 18 }}>✨ The Big Picture</h3>
        <p style={{ margin: 0, color: "#78350f", lineHeight: 1.6 }}>
          {profession === "Real Estate" && "Clustering helps you automatically group properties into market segments, find comparable sales, and identify unique investment opportunities—all based on the features you already track."}
          {profession === "Law" && "Clustering helps you automatically categorize cases, find relevant precedents, and identify unusual cases that need special attention—based on the characteristics you already record."}
          {profession === "Journalism" && "Clustering helps you automatically organize your coverage into beats, spot trending topics, and identify unique stories worth deeper investigation—based on the metrics you already measure."}
        </p>
      </div>
    </div>
  );
}

function InteractiveTutorialPage({ profession, tutorialStep, setTutorialStep }) {
  const steps = {
    "Real Estate": [
      { title: "Step 1: Your Data", desc: "You have 50 property listings. Each has a size (sqft) and price." },
      { title: "Step 2: Set Walking Distance", desc: "Properties within $50k and 200 sqft are 'walking distance' apart." },
      { title: "Step 3: Minimum Neighborhood", desc: "Need at least 4 similar properties to call it a neighborhood." },
      { title: "Step 4: Find Neighborhoods", desc: "System groups properties automatically—no manual sorting!" },
      { title: "Step 5: Spot Outliers", desc: "Unique properties (luxury penthouse, fixer-upper) stand alone." }
    ],
    "Law": [
      { title: "Step 1: Your Cases", desc: "You have 50 cases. Each has duration and complexity score." },
      { title: "Step 2: Define Similarity", desc: "Cases within 30 days and 10 complexity points are 'similar'." },
      { title: "Step 3: Minimum Pattern", desc: "Need at least 4 similar cases to establish a pattern." },
      { title: "Step 4: Auto-Categorize", desc: "System groups cases by type automatically!" },
      { title: "Step 5: Flag Unique Cases", desc: "Landmark or complex cases that need special review." }
    ],
    "Journalism": [
      { title: "Step 1: Your Articles", desc: "You have 50 articles. Each has word count and engagement score." },
      { title: "Step 2: Topic Similarity", desc: "Articles within 500 words and 20 engagement points are 'similar'." },
      { title: "Step 3: Minimum Beat", desc: "Need at least 4 articles to establish a recurring beat." },
      { title: "Step 4: Auto-Organize", desc: "System groups articles by topic automatically!" },
      { title: "Step 5: Find Standouts", desc: "Unique investigations or viral pieces that stand alone." }
    ]
  };

  const currentSteps = steps[profession];
  const current = currentSteps[tutorialStep];

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <h2 style={{ fontSize: 32, color: "#1e293b", marginBottom: 40, textAlign: "center" }}>
        Interactive Tutorial: How It Works
      </h2>

      <div style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          {currentSteps.map((step, idx) => (
            <div
              key={idx}
              style={{
                flex: 1,
                height: 8,
                background: idx <= tutorialStep ? "#667eea" : "#e2e8f0",
                marginRight: idx < currentSteps.length - 1 ? 8 : 0,
                borderRadius: 4,
                transition: "all 0.3s"
              }}
            />
          ))}
        </div>
        <div style={{ fontSize: 14, color: "#64748b", textAlign: "center" }}>
          Step {tutorialStep + 1} of {currentSteps.length}
        </div>
      </div>

      <div style={{ background: "white", border: "2px solid #e0e7ff", borderRadius: 16, padding: 40, marginBottom: 30 }}>
        <h3 style={{ fontSize: 28, color: "#667eea", marginBottom: 16 }}>{current.title}</h3>
        <p style={{ fontSize: 18, color: "#475569", lineHeight: 1.6, marginBottom: 30 }}>{current.desc}</p>

        <TutorialVisual step={tutorialStep} profession={profession} />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", gap: 20 }}>
        <button
          onClick={() => setTutorialStep(Math.max(0, tutorialStep - 1))}
          disabled={tutorialStep === 0}
          style={{
            padding: "12px 24px",
            border: "2px solid #e2e8f0",
            background: "white",
            borderRadius: 8,
            cursor: tutorialStep === 0 ? "not-allowed" : "pointer",
            fontWeight: 600,
            color: tutorialStep === 0 ? "#94a3b8" : "#1e293b",
            opacity: tutorialStep === 0 ? 0.5 : 1
          }}
        >
          ← Previous Step
        </button>
        <button
          onClick={() => setTutorialStep(Math.min(currentSteps.length - 1, tutorialStep + 1))}
          disabled={tutorialStep === currentSteps.length - 1}
          style={{
            padding: "12px 24px",
            border: "none",
            background: tutorialStep === currentSteps.length - 1 ? "#e2e8f0" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: 8,
            cursor: tutorialStep === currentSteps.length - 1 ? "not-allowed" : "pointer",
            fontWeight: 600,
            color: "white",
            opacity: tutorialStep === currentSteps.length - 1 ? 0.5 : 1
          }}
        >
          Next Step →
        </button>
      </div>
    </div>
  );
}

function TutorialVisual({ step, profession }) {
  const svgRef = useRef(null);
  const clustersDef = useMemo(()=> [
      { name: "Cluster 1", shape: "circle", pts: makeCircle(260, 180, 64, 14, "C1-") },
      { name: "Cluster 2", shape: "ellipse", pts: makeEllipse(560, 120, 90, 42, 14, "C2-") },
      { name: "Cluster 3", shape: "crescent", pts: makeCrescent(420, 300, 48, 84, 14, "C3-") },
      { name: "Cluster 4", shape: "line", pts: makeLine(160, 320, 320, 380, 18, 12, "C4-") }
    ],[profession]);
  useEffect(() => {
    const W = 900;
    const H = 440;
    const svg = d3.select(svgRef.current);
    const xScale = d3.scaleLinear().domain([0, W]).range([0, W]);
    const yScale = d3.scaleLinear().domain([0, H]).range([H, 0]); // <-- Notice reversed range

    svg.selectAll("*").remove();

    const colors = ["#667eea", "#10b981", "#f59e0b", "#ef4444"];
    const bg = svg.append("rect")
      .attr("width", W)
      .attr("height", H)
      .attr("rx", 14)
      .attr("fill", "#f8fafc");

    // Axis labels depending on profession
    let xLabel = "X-Axis", yLabel = "Y-Axis";
    if (profession === "Law") {
      xLabel = "Case Duration (days)";
      yLabel = "Case Complexity Score";
    } else if (profession === "Real Estate") {
      xLabel = "Property Size (sqft)";
      yLabel = "Property Price ($)";
    } else {
      xLabel = "Article Word Count";
      yLabel = "Engagement Score";
    }

    svg.append("text")
      .attr("x", W / 2)
      .attr("y", H - 8)
      .attr("text-anchor", "middle")
      .attr("font-size", 13)
      .attr("fill", "#475569")
      .text(xLabel);

    svg.append("text")
      .attr("x", 22)
      .attr("y", H / 2)
      .attr("transform", `rotate(-90, 22, ${H / 2})`)
      .attr("text-anchor", "middle")
      .attr("font-size", 13)
      .attr("fill", "#475569")
      .text(yLabel);

    // Create clusters using your shape generators and tag each point with cluster index & shape type


    // attach metadata
    clustersDef.forEach((c, i) => {
      c.pts.forEach(p => {
        p.cluster = i;      // cluster index
        p.clusterName = c.name;
        p.shape = c.shape;
      });
    });

    // Compose flat data points
    const data = clustersDef.flatMap(c => c.pts);

    // add an outlier if step >= 4
    if (step >= 4) {
      data.push({ id: "OUT-1", x: 800, y: 70, cluster: -1, clusterName: "Outlier", shape: "outlier" });
    }

    // tooltip element
    const tooltip = d3.select("body").append("div")
      .attr("class", "db-tooltip")
      .style("position", "absolute")
      .style("pointer-events", "none")
      .style("padding", "8px 12px")
      .style("background", "white")
      .style("border", "1px solid #e2e8f0")
      .style("border-radius", "8px")
      .style("box-shadow", "0 6px 18px rgba(2,6,23,0.08)")
      .style("font-size", "13px")
      .style("color", "#0f172a")
      .style("opacity", 0);

    // helper to describe a point in profession language
    function describePoint(d) {
      const entity = profession === "Law" ? "Case" : profession === "Real Estate" ? "Property" : "Article";
      const clusterText = d.cluster === -1 ? "Unique / Outlier" : d.clusterName;
      // extra human readable features: map x/y to profession-friendly text (approx)
      const xVal = d.x.toFixed(1);
      const yVal = d.y.toFixed(1);
      return `<strong>${entity}</strong><br/>${clusterText}<br/>X: ${xVal} — Y: ${yVal}`;
    }

    // Intro: add a subtle legend (bottom-right)
    const legend = svg.append("g").attr("transform", `translate(${W - 220}, ${H - 110})`);
    legend.append("rect").attr("width", 210).attr("height", 90).attr("rx", 10).attr("fill", "white").attr("stroke", "#e6eef8");
    legend.append("text").attr("x", 14).attr("y", 20).attr("font-size", 13).attr("font-weight", 700).attr("fill", "#334155").text("Legend");
    const legendItems = [
      { text: "Cluster boundary", sym: "rect", color: "#667eea" },
      { text: "Point (hover for details)", sym: "dot", color: "#64748b" },
      { text: "Outlier (pulsing)", sym: "circle", color: "#94a3b8" }
    ];
    legendItems.forEach((it, i) => {
      if (it.sym === "rect") {
        legend.append("rect").attr("x", 16).attr("y", 30 + i * 20).attr("width", 12).attr("height", 8).attr("fill", it.color).attr("opacity", 0.85);
      } else {
        legend.append("circle").attr("cx", 22).attr("cy", 34 + i * 20).attr("r", 5).attr("fill", it.color).attr("opacity", 0.85);
      }
      legend.append("text").attr("x", 36).attr("y", 35 + i * 20).attr("font-size", 12).attr("fill", "#475569").text(it.text);
    });

    // MAIN: draw points with entry animation that depends on shape
    // We'll draw a small center pin position for each cluster shape so points "grow/form" from there
    const centers = clustersDef.map((c, i) => {
      // mean center
      const meanX = d3.mean(c.pts, p => p.x);
      const meanY = d3.mean(c.pts, p => p.y);
      return { x: meanX, y: meanY };
    });

    // Draw points (initially tiny) and animate them based on step
    const pointSel = svg.selectAll("g.point-wrapper")
      .data(data, d => d.id)
      .enter()
      .append("g")
      .attr("class", "point-wrapper")
      .attr("transform", d => `translate(${d.x},${yScale(d.y)})`);

    // support shapes visually: circle / ellipse / crescent / line will share same circle node for hover but we animate their "appearance" differently
    pointSel.append("circle")
      .attr("class", "pt-core")
      .attr("r", 0)
      .attr("fill", "#64748b")
      .attr("stroke", "white")
      .attr("stroke-width", 1.2)
      .style("cursor", "pointer")
      .on("mouseover", function (event, d) {
        // highlight
        d3.select(this).transition().duration(140).attr("r", 12).attr("stroke-width", 2);
        tooltip.transition().duration(120).style("opacity", 1);
        tooltip.html(describePoint(d));
      })
      .on("mousemove", (event) => {
        tooltip.style("left", event.pageX + 12 + "px").style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", function () {
        d3.select(this).transition().duration(140).attr("r", 8).attr("stroke-width", 1.2);
        tooltip.transition().duration(120).style("opacity", 0);
      });

    // shape-based entrance animation: points move from cluster center outward (gives "formation" feel)
    pointSel.each(function (d) {
      const node = d3.select(this).select("circle.pt-core");
      const clusterIdx = d.cluster;
      const from = (clusterIdx >= 0 && clusterIdx < centers.length) ? centers[clusterIdx] : { x: d.x, y: yScale(d.y) };
      // set initial transform to center then animate to actual position
      d3.select(this).attr("transform", `translate(${from.x},${from.y})`);
      // sequential delays so shape appears organically
      const delay = (Math.abs(d.x - from.x) + Math.abs(yScale(d.y) - from.y)) * 0.6 + Math.random() * 200;
      d3.select(this)
        .transition()
        .delay(delay)
        .duration(900)
        .attr("transform", `translate(${d.x},${yScale(d.y)})`)
        .ease(d3.easeCubicOut);

      node.transition()
        .delay(delay)
        .duration(900)
        .attr("r", 8)
        .attr("fill", "#64748b");
    });

    // STEP 2: show epsilon (neighborhood) around one example point (animated)
    if (step === 2) {
      const example = data[1] || data[0];
      const epsR = 70;
      const epsG = svg.append("g").attr("class", "eps-group");
      epsG.append("circle")
        .attr("cx", example.x)
        .attr("cy", example.y)
        .attr("r", 0)
        .attr("stroke", "#334155")
        .attr("stroke-dasharray", "6,4")
        .attr("fill", "none")
        .attr("stroke-width", 1.8)
        .attr("opacity", 0.95)
        .transition()
        .duration(1100)
        .attr("r", epsR)
        .attr("opacity", 0.9)
        .ease(d3.easeCubicOut);

      // show explanatory label
      epsG.append("text")
        .attr("x", example.x)
        .attr("y", example.y - epsR - 10)
        .attr("text-anchor", "middle")
        .attr("font-size", 13)
        .attr("fill", "#334155")
        .attr("opacity", 0)
        .text("ε — similarity radius")
        .transition()
        .delay(600)
        .duration(600)
        .attr("opacity", 1);
    }

    // STEP 3 and above: compute convex hulls for each cluster and animate boundary drawing + fill fade-in
    if (step >= 3) {
      clustersDef.forEach((cdef, ci) => {
        // cluster points array
        const pts = cdef.pts;
        const hull = d3.polygonHull(pts.map(p => [p.x, p.y]));
        if (!hull) return;
        // create smooth curved path from hull points
        const hullPath = d3.line().curve(d3.curveCardinalClosed.tension(0.5));
        const path = svg.append("path")
          .attr("d", hullPath(hull))
          .attr("fill", colors[ci % colors.length])
          .attr("fill-opacity", 0)
          .attr("stroke", colors[ci % colors.length])
          .attr("stroke-width", 2)
          .attr("stroke-linejoin", "round")
          .attr("stroke-linecap", "round")
          .attr("opacity", 0.95);

        // animate stroke drawing using stroke-dash technique
        const totalLen = path.node().getTotalLength();
        path
          .attr("stroke-dasharray", `${totalLen} ${totalLen}`)
          .attr("stroke-dashoffset", totalLen)
          .transition()
          .duration(1400)
          .ease(d3.easeCubicOut)
          .attr("stroke-dashoffset", 0)
          .on("end", () => {
            // after stroke draw, fade in fill slightly
            path.transition().duration(800).attr("fill-opacity", 0.12);
          });

        // centroid label
        const cx = d3.mean(pts, p => p.x);
        const cy = d3.mean(pts, p => p.y);
        svg.append("text")
          .attr("x", cx)
          .attr("y", cy - 36)
          .attr("text-anchor", "middle")
          .attr("font-weight", 800)
          .attr("font-size", 15)
          .attr("fill", colors[ci % colors.length])
          .attr("opacity", 0)
          .text(cdef.name)
          .transition()
          .delay(1200)
          .duration(600)
          .attr("opacity", 1);

        // slightly "push" cluster points' color into cluster color with easing
        pts.forEach(pt => {
          svg.selectAll("g.point-wrapper")
            .filter(d => d.id === pt.id)
            .select("circle.pt-core")
            .transition()
            .delay(900 + Math.random() * 300)
            .duration(700)
            .attr("fill", colors[ci % colors.length]);
        });
      });
    }

    // STEP 4: outlier pulse & label if present
    if (step >= 4) {
      const out = data.find(d => d.cluster === -1);
      if (out) {
        const pulse = svg.append("circle")
          .attr("cx", out.x)
          .attr("cy", out.y)
          .attr("r", 10)
          .attr("fill", "none")
          .attr("stroke", "#94a3b8")
          .attr("stroke-width", 2)
          .attr("opacity", 0.9)
          .attr("stroke-dasharray", "6,4");

        // infinite pulse loop
        (function repeatPulse() {
          pulse.attr("r", 10).attr("opacity", 0.9)
            .transition()
            .duration(900)
            .attr("r", 28)
            .attr("opacity", 0.18)
            .transition()
            .duration(900)
            .attr("r", 12)
            .attr("opacity", 0.8)
            .on("end", repeatPulse);
        })();

        // outline highlight circle
        svg.append("circle")
          .attr("cx", out.x)
          .attr("cy", out.y)
          .attr("r", 10)
          .attr("fill", "#94a3b8")
          .attr("opacity", 0.85)
          .transition()
          .duration(700)
          .attr("r", 12);

        svg.append("text")
          .attr("x", out.x + 18)
          .attr("y", out.y - 8)
          .attr("font-size", 13)
          .attr("font-weight", 700)
          .attr("fill", "#475569")
          .attr("opacity", 0)
          .text("Outlier — needs review")
          .transition()
          .delay(400)
          .duration(600)
          .attr("opacity", 1);
      }
    }

    // Accessibility: keyboard hint for hover interactions (simple)
    svg.append("text")
      .attr("x", 18)
      .attr("y", 18)
      .attr("font-size", 12)
      .attr("fill", "#475569")
      .text("Hover points to see details — shapes form into clusters across steps.");

    // cleanup on unmount
    return () => {
      tooltip.remove();
    };
  }, [step, profession]);

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <svg
        ref={svgRef}
        width={900}
        height={440}
        style={{ borderRadius: 14, boxShadow: "0 6px 20px rgba(2,6,23,0.08)", background: "transparent" }}
      />
    </div>
  );
}


function LiveClusteringPage({ profession, eps, setEps, minPts, setMinPts }) {
  return (
    <div>
      <h2>Live Clustering Page</h2>
      <p>Profession: {profession}</p>
      <p>Eps: {eps}</p>
      <p>MinPts: {minPts}</p>
      {/* Add your visualization or logic here */}
    </div>
  );
}
