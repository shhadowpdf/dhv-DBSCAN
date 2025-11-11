import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronRight, ChevronLeft, Play, Info, Users, TrendingUp, FileText, Home,Pause, RotateCcw, Plus, Minus, Zap } from "lucide-react";
import * as d3 from "d3";
function dbscan(points, eps, minPts) {
  const n = points.length;
  const labels = new Array(n).fill(null);
  const dist = (i, j) =>
    Math.hypot(points[i].x - points[j].x, points[i].y - points[j].y);

  function region(i) {
    const out = [];
    for (let j = 0; j < n; j++) if (dist(i, j) <= eps) out.push(j);
    return out;
  }

  let cid = 0;
  for (let i = 0; i < n; i++) {
    if (labels[i] !== null) continue;
    const nbrs = region(i);
    if (nbrs.length < minPts) {
      labels[i] = -1;
      continue;
    }
    labels[i] = cid;
    const stack = [...nbrs];
    while (stack.length) {
      const j = stack.pop();
      if (labels[j] === -1) labels[j] = cid;
      if (labels[j] !== null) continue;
      labels[j] = cid;
      const nb2 = region(j);
      if (nb2.length >= minPts) {
        for (const k of nb2) if (!stack.includes(k)) stack.push(k);
      }
    }
    cid++;
  }
  return labels;
}
function ScenarioVisualization({ scenario, profession }) {
  const svgRef = useRef(null);

  // Generate realistic clusters
  const makeRealisticDataset = (profession) => {
    const clusters = [];
    const pts = 18;
    const noisePts = 8;

    const addCluster = (cx, cy, sx, sy, prefix) => {
      for (let i = 0; i < pts; i++) {
        clusters.push({
          id: `${prefix}${clusters.length + 1}`,
          x: d3.randomNormal(cx, sx)(),
          y: d3.randomNormal(cy, sy)(),
        });
      }
    };

    if (profession === "Real Estate") {
      addCluster(900, 45, 90, 8, "P");
      addCluster(1600, 85, 130, 10, "P");
      addCluster(2700, 130, 100, 10, "P");
    } else if (profession === "Law") {
      addCluster(100, 3, 35, 0.6, "C");
      addCluster(250, 6, 50, 0.8, "C");
      addCluster(400, 8.5, 35, 0.6, "C");
    } else {
      addCluster(600, 35, 100, 6, "A");
      addCluster(1500, 55, 130, 8, "A");
      addCluster(2500, 85, 80, 4, "A");
    }

    // Mild outliers
    for (let i = 0; i < noisePts; i++) {
      if (profession === "Real Estate")
        clusters.push({ id: `O${i}`, x: 500 + Math.random() * 2500, y: 30 + Math.random() * 120 });
      else if (profession === "Law")
        clusters.push({ id: `O${i}`, x: 30 + Math.random() * 470, y: 1 + Math.random() * 9 });
      else
        clusters.push({ id: `O${i}`, x: 300 + Math.random() * 2700, y: 20 + Math.random() * 75 });
    }
    return clusters;
  };

  // Normalize data 0–1
  const normalizeDataset = (data) => {
    const xMin = d3.min(data, (d) => d.x);
    const xMax = d3.max(data, (d) => d.x);
    const yMin = d3.min(data, (d) => d.y);
    const yMax = d3.max(data, (d) => d.y);
    return data.map((d) => ({
      ...d,
      xNorm: (d.x - xMin) / (xMax - xMin),
      yNorm: (d.y - yMin) / (yMax - yMin),
    }));
  };

  const getPointDescription = (pt, cluster, profession) => {
    const label = cluster === -1 ? "Unique / Outlier" : `Group ${cluster + 1}`;
    if (profession === "Real Estate")
      return `${pt.id}\n${pt.x.toFixed(0)} sqft\n₹${pt.y.toFixed(1)} L\n${label}`;
    if (profession === "Law")
      return `${pt.id}\n${pt.x.toFixed(0)} days\nComplexity ${pt.y.toFixed(1)}\n${label}`;
    return `${pt.id}\n${pt.x.toFixed(0)} words\n${pt.y.toFixed(1)}% engagement\n${label}`;
  };

  useEffect(() => {
    const W = 460, H = 400;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const raw = makeRealisticDataset(profession);
    const norm = normalizeDataset(raw);

    // 🧮 Adaptive eps scaling
    const baseEps = scenario.eps || 7;
    const profFactor =
      profession === "Real Estate" ? 0.09 :
      profession === "Law" ? 0.11 :
      0.08; // Journalism
    const epsScaled = (baseEps / 7) * profFactor; // around 0.09–0.12 range

    const labels = dbscan(
      norm.map((p) => ({ x: p.xNorm, y: p.yNorm })),
      epsScaled,
      scenario.minPts
    );

    const colors = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6"];

    const xScale = d3.scaleLinear().domain(d3.extent(raw, (d) => d.x)).range([50, W - 40]);
    const yScale = d3.scaleLinear().domain(d3.extent(raw, (d) => d.y)).range([H - 50, 40]);

    // Pretty background
    const defs = svg.append("defs");
    const grad = defs.append("linearGradient").attr("id", "grad")
      .attr("x1", "0%").attr("x2", "100%").attr("y1", "0%").attr("y2", "100%");
    grad.append("stop").attr("offset", "0%").attr("stop-color", "#f0f9ff");
    grad.append("stop").attr("offset", "100%").attr("stop-color", "#eef2ff");
    svg.append("rect").attr("width", W).attr("height", H).attr("fill", "url(#grad)").attr("rx", 10);

    // Group points
    const clusters = {};
    raw.forEach((p, i) => {
      const l = labels[i];
      if (!clusters[l]) clusters[l] = [];
      clusters[l].push(p);
    });

    // Draw cluster hulls
    Object.entries(clusters).forEach(([l, pts]) => {
      if (l === "-1") return;
      const hull = d3.polygonHull(pts.map((p) => [xScale(p.x), yScale(p.y)]));
      if (hull) {
        svg.append("path")
          .attr("d", d3.line().curve(d3.curveCardinalClosed.tension(0.6))(hull))
          .attr("fill", colors[l % colors.length])
          .attr("fill-opacity", 0.2)
          .attr("stroke", colors[l % colors.length])
          .attr("stroke-width", 2.5);
      }
    });

    // Tooltip
    const tooltip = d3.select("body").append("div")
      .style("position", "absolute")
      .style("background", "white")
      .style("border", "2px solid #6366f1")
      .style("border-radius", "8px")
      .style("padding", "10px 14px")
      .style("font-size", "13px")
      .style("font-weight", "600")
      .style("color", "#1e293b")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .style("box-shadow", "0 4px 12px rgba(0,0,0,0.15)")
      .style("white-space", "pre-line");

    // Points
    raw.forEach((p, i) => {
      const l = labels[i];
      svg.append("circle")
        .attr("cx", xScale(p.x))
        .attr("cy", yScale(p.y))
        .attr("r", l === -1 ? 7 : 6)
        .attr("fill", l === -1 ? "#94a3b8" : colors[l % colors.length])
        .attr("stroke", "white")
        .attr("stroke-width", 1.8)
        .style("cursor", "pointer")
        .on("mouseover", (e) => {
          d3.select(e.target).transition().duration(150).attr("r", 9);
          tooltip.style("opacity", 1).html(getPointDescription(p, l, profession));
        })
        .on("mousemove", (e) => {
          tooltip.style("left", `${e.pageX + 15}px`).style("top", `${e.pageY - 15}px`);
        })
        .on("mouseout", (e) => {
          d3.select(e.target).transition().duration(150).attr("r", l === -1 ? 7 : 6);
          tooltip.style("opacity", 0);
        });
    });

    // Axes
    const xAxis = d3.axisBottom(xScale).ticks(5);
    const yAxis = d3.axisLeft(yScale).ticks(5);
    svg.append("g").attr("transform", `translate(0,${H - 50})`).call(xAxis);
    svg.append("g").attr("transform", `translate(50,0)`).call(yAxis);
    svg.selectAll("text").attr("font-size", "11px").attr("fill", "#334155");

    // Labels
    const xLabel = profession === "Real Estate"
      ? "Property Size (sqft)"
      : profession === "Law"
      ? "Case Duration (days)"
      : "Article Length (words)";
    const yLabel = profession === "Real Estate"
      ? "Price (₹ lakhs)"
      : profession === "Law"
      ? "Complexity Level"
      : "Engagement (%)";

    svg.append("text").attr("x", W / 2).attr("y", H - 10)
      .attr("text-anchor", "middle").attr("font-size", 12).attr("fill", "#475569").text(xLabel);
    svg.append("text").attr("x", 20).attr("y", H / 2)
      .attr("transform", `rotate(-90, 20, ${H / 2})`)
      .attr("text-anchor", "middle").attr("font-size", 12).attr("fill", "#475569").text(yLabel);

    // Summary
    const numClusters = Math.max(...labels) + 1;
    const numOutliers = labels.filter((l) => l === -1).length;
    svg.append("text")
      .attr("x", 60).attr("y", 25)
      .attr("font-size", 13).attr("font-weight", 700)
      .attr("fill", "#1e293b")
      .text(`${numClusters} clusters, ${numOutliers} outliers`);

    return () => tooltip.remove();
  }, [scenario, profession]);

  return (
    <div style={{ position: "relative" }}>
      <svg ref={svgRef} width={460} height={400} style={{ display: "block", borderRadius: "12px" }} />
      <div style={{ marginTop: 8, fontSize: 12, color: "#64748b", textAlign: "center" }}>
        💡 Hover over points for realistic {profession.toLowerCase()} details
      </div>
    </div>
  );
}

export default function CompareScenarios({ profession }) {
  const scenarios = {
    "Real Estate": [
      {
        title: "Loose Grouping",
        desc: "Cast a wide net—group distant properties together",
        eps: 12,
        minPts: 3,
        emoji: "🏘️",
        useCase: "Good for: Initial market overview, broad comparisons",
        warning: "⚠️ May group very different properties",
        preset: "Use this when you want to see the big picture and understand overall market segments without worrying about fine details."
      },
      {
        title: "Balanced",
        desc: "Standard approach—reasonable neighborhoods",
        eps: 7,
        minPts: 4,
        emoji: "🏡",
        useCase: "Good for: Most market analyses, client matching",
        warning: "",
        preset: "Your go-to setting for daily work. Balances precision with coverage for most real estate scenarios."
      },
      {
        title: "Strict Grouping",
        desc: "Only group very similar properties",
        eps: 4,
        minPts: 5,
        emoji: "🏢",
        useCase: "Good for: Precise comps, luxury markets",
        warning: "⚠️ May miss valid comparisons",
        preset: "Perfect when you need exact matches—like finding comparable sales for appraisals or pricing unique properties."
      }
    ],
    "Law": [
      {
        title: "Broad Categories",
        desc: "Group loosely related cases together",
        eps: 12,
        minPts: 3,
        emoji: "📚",
        useCase: "Good for: General case organization, training",
        warning: "⚠️ May combine dissimilar precedents",
        preset: "Ideal for organizing your entire case database or training new associates on case types."
      },
      {
        title: "Balanced",
        desc: "Standard case categorization",
        eps: 7,
        minPts: 4,
        emoji: "⚖️",
        useCase: "Good for: Regular case management, research",
        warning: "",
        preset: "The standard for day-to-day case management and precedent research. Reliable and proven."
      },
      {
        title: "Precise Matching",
        desc: "Only group highly similar cases",
        eps: 4,
        minPts: 5,
        emoji: "🔍",
        useCase: "Good for: Finding exact precedents, appeals",
        warning: "⚠️ May require more manual review",
        preset: "Use when you need highly specific precedents for appeals or complex litigation strategies."
      }
    ],
    "Journalism": [
      {
        title: "Broad Beats",
        desc: "Group loosely related stories",
        eps: 12,
        minPts: 3,
        emoji: "📰",
        useCase: "Good for: Content overview, archive organization",
        warning: "⚠️ May blur topic boundaries",
        preset: "Perfect for getting a bird's-eye view of your coverage or organizing large archives quickly."
      },
      {
        title: "Balanced",
        desc: "Standard beat organization",
        eps: 7,
        minPts: 4,
        emoji: "✍️",
        useCase: "Good for: Regular coverage tracking, editorial planning",
        warning: "",
        preset: "Your reliable daily setting for tracking coverage and planning editorial calendars."
      },
      {
        title: "Tight Topics",
        desc: "Only group very similar articles",
        eps: 4,
        minPts: 5,
        emoji: "🔬",
        useCase: "Good for: Deep-dive series, investigative work",
        warning: "⚠️ May fragment related coverage",
        preset: "Essential for investigative series where you need to identify very specific story patterns."
      }
    ]
  };

  const current = scenarios[profession];
  const [selectedScenario, setSelectedScenario] = useState(1);
  const [showFAQ, setShowFAQ] = useState(false);
  const [showLimitations, setShowLimitations] = useState(false);
  const [customEps, setCustomEps] = useState(7);
  const [customMinPts, setCustomMinPts] = useState(4);
  const [useCustom, setUseCustom] = useState(false);

  // Export function (single copy)
  const exportToCSV = () => {
    const dataset = makeDataset(profession);
    const epsVal = useCustom ? customEps : current[selectedScenario].eps;
    const minPtsVal = useCustom ? customMinPts : current[selectedScenario].minPts;
    const labels = dbscan(dataset, epsVal, minPtsVal);
    
    let csvContent = "ID,X_Value,Y_Value,Cluster,Status\n";
    dataset.forEach((pt, idx) => {
      const cluster = labels[idx];
      const status = cluster === -1 ? "Outlier" : `Group ${cluster + 1}`;
      csvContent += `${pt.id},${pt.x.toFixed(2)},${pt.y.toFixed(2)},${cluster},${status}\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clustering_${profession.replace(/\s+/g, '_')}_${useCustom ? 'custom' : current[selectedScenario].title.replace(/\s+/g, '_')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const activeScenario = useCustom 
    ? { eps: customEps, minPts: customMinPts, title: "Custom Settings", emoji: "⚙️" }
    : current[selectedScenario];

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <h2 style={{ fontSize: 32, color: "#1e293b", marginBottom: 16, textAlign: "center" }}>
        Compare Scenarios: Find Your Sweet Spot
      </h2>
      <p style={{ fontSize: 16, color: "#475569", marginBottom: 40, textAlign: "center", lineHeight: 1.6 }}>
        Different situations need different settings. See how three approaches compare for your work.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginBottom: 40 }}>
        {current.map((scenario, idx) => (
          <button
            key={idx}
            onClick={() => {
              setSelectedScenario(idx);
              setUseCustom(false);
            }}
            style={{
              padding: 0,
              border: selectedScenario === idx && !useCustom ? "3px solid #667eea" : "2px solid #e2e8f0",
              background: "white",
              borderRadius: 16,
              cursor: "pointer",
              transition: "all 0.3s",
              boxShadow: selectedScenario === idx && !useCustom ? "0 12px 30px rgba(102,126,234,0.25)" : "0 4px 12px rgba(0,0,0,0.06)",
              transform: selectedScenario === idx && !useCustom ? "translateY(-4px)" : "none"
            }}
          >
            <div style={{ padding: 24, textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>{scenario.emoji}</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: "#1e293b", marginBottom: 8 }}>{scenario.title}</h3>
              <p style={{ fontSize: 14, color: "#64748b", marginBottom: 16, lineHeight: 1.5 }}>{scenario.desc}</p>
              
              <div style={{ display: "flex", justifyContent: "space-around", padding: "12px 0", background: "#f8fafc", borderRadius: 8, marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>Distance</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#667eea" }}>{scenario.eps}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>Min Size</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#667eea" }}>{scenario.minPts}</div>
                </div>
              </div>
              
              <p style={{ fontSize: 12, color: "#475569", lineHeight: 1.4, fontStyle: "italic", margin: 0 }}>
                {scenario.preset}
              </p>
            </div>
          </button>
        ))}
      </div>

      <div style={{ background: "white", border: "2px solid #e0e7ff", borderRadius: 16, padding: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontSize: 24, color: "#667eea", margin: 0 }}>
            {activeScenario.emoji} {activeScenario.title}
          </h3>
          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={() => setShowFAQ(!showFAQ)}
              style={{
                padding: "10px 20px",
                border: "2px solid #10b981",
                background: showFAQ ? "#10b981" : "white",
                color: showFAQ ? "white" : "#10b981",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 14,
                transition: "all 0.2s"
              }}
            >
              ❓ FAQ
            </button>
            <button
              onClick={() => setShowLimitations(!showLimitations)}
              style={{
                padding: "10px 20px",
                border: "2px solid #f59e0b",
                background: showLimitations ? "#f59e0b" : "white",
                color: showLimitations ? "white" : "#f59e0b",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 14,
                transition: "all 0.2s"
              }}
            >
              ⚠️ Important Notes
            </button>
            <button
              onClick={exportToCSV}
              style={{
                padding: "10px 20px",
                border: "2px solid #667eea",
                background: "white",
                color: "#667eea",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 14,
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "#667eea";
                e.target.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "white";
                e.target.style.color = "#667eea";
              }}
            >
              📥 Export CSV
            </button>
          </div>
        </div>

        {showFAQ && (
          <div style={{ background: "#f0fdf4", border: "2px solid #10b981", borderRadius: 12, padding: 24, marginBottom: 20 }}>
            <h4 style={{ fontSize: 18, fontWeight: 700, color: "#065f46", marginBottom: 16 }}>❓ Quick FAQ</h4>
            <div style={{ display: "grid", gap: 16 }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#047857", marginBottom: 6 }}>Q: What is a cluster?</p>
                <p style={{ fontSize: 14, color: "#065f46", margin: 0, lineHeight: 1.6 }}>
                  A: A cluster is a small group of things that are similar—like {profession === "Real Estate" ? "houses with similar size & price" : profession === "Law" ? "cases of similar length & severity" : "articles with similar topics & engagement"}.
                </p>
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#047857", marginBottom: 6 }}>Q: Why change settings?</p>
                <p style={{ fontSize: 14, color: "#065f46", margin: 0, lineHeight: 1.6 }}>
                  A: Because sometimes you want a broad overview, other times only exact matches—settings control that. Think of it like adjusting binoculars: zoom in for detail, zoom out for the big picture.
                </p>
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#047857", marginBottom: 6 }}>Q: What to do with outliers?</p>
                <p style={{ fontSize: 14, color: "#065f46", margin: 0, lineHeight: 1.6 }}>
                  A: Investigate—they might be {profession === "Real Estate" ? "special investment opportunities or data entry errors" : profession === "Law" ? "landmark cases needing senior attention or filing mistakes" : "viral stories worth featuring or content gaps to fill"}.
                </p>
              </div>
            </div>
          </div>
        )}

        {showLimitations && (
          <div style={{ background: "#fef3c7", border: "2px solid #f59e0b", borderRadius: 12, padding: 24, marginBottom: 20 }}>
            <h4 style={{ fontSize: 18, fontWeight: 700, color: "#92400e", marginBottom: 16 }}>⚠️ Important Notes for Stakeholders</h4>
            <div style={{ display: "grid", gap: 14 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>🎛️</span>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#78350f", marginBottom: 4 }}>Settings Matter</p>
                  <p style={{ fontSize: 13, color: "#92400e", margin: 0, lineHeight: 1.5 }}>
                    Results change significantly with Distance (ε) and Min Size settings. There's no one-size-fits-all—you'll need to experiment to find what works for your data.
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>📊</span>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#78350f", marginBottom: 4 }}>Features You Choose Matter Hugely</p>
                  <p style={{ fontSize: 13, color: "#92400e", margin: 0, lineHeight: 1.5 }}>
                    If you pick {profession === "Real Estate" ? "price and area" : profession === "Law" ? "duration and complexity" : "word count and engagement"}, clusters will reflect only those features. Other characteristics (like {profession === "Real Estate" ? "location or age" : profession === "Law" ? "court type or outcome" : "author or publication date"}) won't be considered.
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>⚖️</span>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#78350f", marginBottom: 4 }}>Data Must Be Normalized</p>
                  <p style={{ fontSize: 13, color: "#92400e", margin: 0, lineHeight: 1.5 }}>
                    For real-world data, you need to scale features to similar ranges. Otherwise, {profession === "Real Estate" ? "price in lakhs (50-200) will dominate over bedrooms (1-5)" : profession === "Law" ? "days (10-500) will dominate over complexity scores (1-10)" : "word count (300-5000) will dominate over engagement % (10-100)"}.
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>🧪</span>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#78350f", marginBottom: 4 }}>This is a Demo</p>
                  <p style={{ fontSize: 13, color: "#92400e", margin: 0, lineHeight: 1.5 }}>
                    These visualizations use small synthetic datasets to show the concept. For production use, you'll need properly cleaned real data with appropriate preprocessing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={{ background: "#f8fafc", border: "2px solid #e0e7ff", borderRadius: 12, padding: 20, marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h4 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", margin: 0 }}>⚙️ Custom Settings</h4>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input 
                type="checkbox" 
                checked={useCustom}
                onChange={(e) => setUseCustom(e.target.checked)}
                style={{ width: 18, height: 18, cursor: "pointer" }}
              />
              <span style={{ fontSize: 14, fontWeight: 600, color: "#475569" }}>Use Custom</span>
            </label>
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 8 }}>
                Distance (ε): {customEps.toFixed(1)}
              </label>
              <input
                type="range"
                min="3"
                max="15"
                step="0.5"
                value={customEps}
                onChange={(e) => setCustomEps(parseFloat(e.target.value))}
                disabled={!useCustom}
                style={{ width: "100%", cursor: useCustom ? "pointer" : "not-allowed", opacity: useCustom ? 1 : 0.5 }}
              />
              <p style={{ fontSize: 11, color: "#64748b", margin: "4px 0 0 0" }}>How close items must be to group</p>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 8 }}>
                Min Size: {customMinPts}
              </label>
              <input
                type="range"
                min="2"
                max="8"
                step="1"
                value={customMinPts}
                onChange={(e) => setCustomMinPts(parseInt(e.target.value))}
                disabled={!useCustom}
                style={{ width: "100%", cursor: useCustom ? "pointer" : "not-allowed", opacity: useCustom ? 1 : 0.5 }}
              />
              <p style={{ fontSize: 11, color: "#64748b", margin: "4px 0 0 0" }}>Minimum items to form a group</p>
            </div>
          </div>
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
          <ScenarioVisualization scenario={activeScenario} profession={profession} />
          
          <div>
            {!useCustom && (
              <>
                <div style={{ background: "#f0f9ff", borderRadius: 12, padding: 20, marginBottom: 16 }}>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: "#0369a1", marginBottom: 12 }}>✅ Best For</h4>
                  <p style={{ fontSize: 14, color: "#075985", lineHeight: 1.6, margin: 0 }}>{current[selectedScenario].useCase}</p>
                </div>
                
                {current[selectedScenario].warning && (
                  <div style={{ background: "#fef3c7", borderRadius: 12, padding: 20, marginBottom: 16 }}>
                    <h4 style={{ fontSize: 16, fontWeight: 700, color: "#92400e", marginBottom: 12 }}>⚠️ Watch Out</h4>
                    <p style={{ fontSize: 14, color: "#78350f", lineHeight: 1.6, margin: 0 }}>{current[selectedScenario].warning}</p>
                  </div>
                )}

                <div style={{ padding: 20, background: "#f8fafc", borderRadius: 12 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: "#475569", marginBottom: 12 }}>💡 Pro Tip</h4>
                  <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6, margin: 0 }}>
                    {selectedScenario === 0 && "Start here for exploration, then tighten settings as you learn your data."}
                    {selectedScenario === 1 && "This is your daily driver—works for 80% of situations."}
                    {selectedScenario === 2 && "Use when precision matters more than coverage."}
                  </p>
                </div>
              </>
            )}
            
            {useCustom && (
              <div style={{ background: "#f0f9ff", borderRadius: 12, padding: 20 }}>
                <h4 style={{ fontSize: 16, fontWeight: 700, color: "#0369a1", marginBottom: 12 }}>🎯 Experiment Mode</h4>
                <p style={{ fontSize: 14, color: "#075985", lineHeight: 1.6, marginBottom: 16 }}>
                  Try different combinations and see how clusters change in real-time. This is how you find the perfect settings for your specific data.
                </p>
                <div style={{ background: "white", borderRadius: 8, padding: 16 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 8 }}>🔍 What to look for:</p>
                  <ul style={{ fontSize: 13, color: "#475569", margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
                    <li>Too many outliers? Decrease Distance or Min Size</li>
                    <li>Too few groups? Increase Distance or decrease Min Size</li>
                    <li>Groups too mixed? Decrease Distance</li>
                    <li>Can't find patterns? Increase Distance</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", borderRadius: 16, padding: 32, color: "white" }}>
        <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20, textAlign: "center" }}>🚀 Ready for More?</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }}>
          <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>📊</div>
            <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Use Your Own Data</h4>
            <p style={{ fontSize: 13, margin: 0, opacity: 0.95, lineHeight: 1.5 }}>
              Upload your CSV and map columns to cluster on real {profession === "Real Estate" ? "properties" : profession === "Law" ? "cases" : "articles"}
            </p>
          </div>
          <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🌐</div>
            <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Advanced Clustering</h4>
            <p style={{ fontSize: 13, margin: 0, opacity: 0.95, lineHeight: 1.5 }}>
              For complex data (text, many features), use HDBSCAN or dimensionality reduction + DBSCAN
            </p>
          </div>
          <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🎓</div>
            <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Team Training</h4>
            <p style={{ fontSize: 13, margin: 0, opacity: 0.95, lineHeight: 1.5 }}>
              Share this tool with your team—visual learning beats technical manuals every time
            </p>
          </div>
          <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🌍</div>
            <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Multilingual Support</h4>
            <p style={{ fontSize: 13, margin: 0, opacity: 0.95, lineHeight: 1.5 }}>
              Need explanations in Hindi/Hinglish? Tutorials in regional languages coming soon
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}