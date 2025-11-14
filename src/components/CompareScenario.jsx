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
  const raw = useMemo(() => makeRealisticDataset(profession), []);  
  useEffect(() => {
    const W = 460, H = 400;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    
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
    <div className="relative">
      <svg ref={svgRef} width={460} height={400} className="block rounded-xl" />
      <div className="mt-2 text-xs text-slate-500 text-center">
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
    <div className="max-w-7xl mx-auto">
      <h2 className="text-4xl text-slate-800 mb-4 text-center">
        Compare Scenarios: Find Your Sweet Spot
      </h2>
      <p className="text-lg text-slate-600 mb-10 text-center leading-relaxed">
        Different situations need different settings. See how three approaches compare for your work.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {current.map((scenario, idx) => (
          <button
            key={idx}
            onClick={() => {
              setSelectedScenario(idx);
              setUseCustom(false);
            }}
            className={`p-0 border-2 bg-white rounded-xl cursor-pointer transition-all duration-300 ${
              selectedScenario === idx && !useCustom
                ? 'border-blue-500 shadow-2xl shadow-blue-500/25 -translate-y-1'
                : 'border-slate-200 shadow-md'
            } hover:shadow-lg`}
          >
            <div className="p-6 text-center">
              <div className="text-5xl mb-3">{scenario.emoji}</div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">{scenario.title}</h3>
              <p className="text-sm text-slate-500 mb-4 leading-relaxed">{scenario.desc}</p>

              <div className="flex justify-around py-3 bg-slate-50 rounded-lg mb-3">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Distance</div>
                  <div className="text-lg font-bold text-blue-600">{scenario.eps}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Min Size</div>
                  <div className="text-lg font-bold text-blue-600">{scenario.minPts}</div>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed italic m-0">
                {scenario.preset}
              </p>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-white border-2 border-indigo-200 rounded-xl p-8">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-2xl text-blue-600 m-0">
            {activeScenario.emoji} {activeScenario.title}
          </h3>
          <div className="flex gap-3">
            <button
              onClick={() => setUseCustom(!useCustom)}
              className={`px-5 py-2.5 border-2 rounded-lg cursor-pointer font-semibold text-sm transition-all duration-200 ${
                useCustom
                  ? 'border-purple-600 bg-purple-600 text-white'
                  : 'border-purple-600 bg-white text-purple-600 hover:bg-purple-600 hover:text-white'
              }`}
            >
              ⚙️ Use Custom
            </button>
            <button
              onClick={exportToCSV}
              className="px-5 py-2.5 border-2 border-blue-600 bg-white text-blue-600 rounded-lg cursor-pointer font-semibold text-sm transition-all duration-200 hover:bg-blue-600 hover:text-white"
            >
              📥 Export CSV
            </button>
          </div>
        </div>
        {(useCustom) && <div className="bg-slate-50 border-2 border-indigo-200 rounded-xl p-5 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-bold text-slate-800 m-0">⚙️ Custom Settings</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">
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
                className={`w-full ${useCustom ? 'cursor-pointer opacity-100' : 'cursor-not-allowed opacity-50'}`}
              />
              <p className="text-xs text-slate-500 mt-1">How close items must be to group</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">
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
                className={`w-full ${useCustom ? 'cursor-pointer opacity-100' : 'cursor-not-allowed opacity-50'}`}
              />
              <p className="text-xs text-slate-500 mt-1">Minimum items to form a group</p>
            </div>
          </div>
        </div>}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <ScenarioVisualization scenario={activeScenario} profession={profession} />

          <div>
            {!useCustom && (
              <>
                <div className="bg-blue-50 rounded-xl p-5 mb-4">
                  <h4 className="text-lg font-bold text-blue-800 mb-3">✅ Best For</h4>
                  <p className="text-sm text-blue-700 leading-relaxed m-0">{current[selectedScenario].useCase}</p>
                </div>

                {current[selectedScenario].warning && (
                  <div className="bg-yellow-50 rounded-xl p-5 mb-4">
                    <h4 className="text-lg font-bold text-yellow-800 mb-3">⚠️ Watch Out</h4>
                    <p className="text-sm text-yellow-700 leading-relaxed m-0">{current[selectedScenario].warning}</p>
                  </div>
                )}

                <div className="p-5 bg-slate-50 rounded-xl">
                  <h4 className="text-sm font-bold text-slate-600 mb-3">💡 Pro Tip</h4>
                  <p className="text-xs text-slate-500 leading-relaxed m-0">
                    {selectedScenario === 0 && "Start here for exploration, then tighten settings as you learn your data."}
                    {selectedScenario === 1 && "This is your daily driver—works for 80% of situations."}
                    {selectedScenario === 2 && "Use when precision matters more than coverage."}
                  </p>
                </div>
              </>
            )}

            {useCustom && (
              <div className="bg-blue-50 rounded-xl p-5">
                <h4 className="text-lg font-bold text-blue-800 mb-3">🎯 Experiment Mode</h4>
                <p className="text-sm text-blue-700 leading-relaxed mb-4">
                  Try different combinations and see how clusters change in real-time. This is how you find the perfect settings for your specific data.
                </p>
                <div className="bg-white rounded-lg p-4">
                  <p className="text-xs font-bold text-slate-800 mb-2">🔍 What to look for:</p>
                  <ul className="text-xs text-slate-600 m-0 pl-5 leading-relaxed">
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
        <div className="flex justify-center gap-5 mb-6">
          <button
            onClick={() => {
              setShowFAQ(!showFAQ);
              setShowLimitations(false);
            }}
            className={`px-5 py-2.5 border-2 rounded-lg cursor-pointer font-semibold text-sm transition-all duration-200 ${
              showFAQ
                ? 'border-green-500 bg-green-500 text-white'
                : 'border-green-500 bg-white text-green-500 hover:bg-green-500 hover:text-white'
            }`}
          >
            ❓ FAQ
          </button>
          <button
            onClick={() => {
              setShowLimitations(!showLimitations);
              setShowFAQ(false);
            }}
            className={`px-5 py-2.5 border-2 rounded-lg cursor-pointer font-semibold text-sm transition-all duration-200 ${
              showLimitations
                ? 'border-yellow-500 bg-yellow-500 text-white'
                : 'border-yellow-500 bg-white text-yellow-500 hover:bg-yellow-500 hover:text-white'
            }`}
          >
            ⚠️ Important Notes
          </button>
        </div>

        {showFAQ && (
          <div className="bg-green-50 border-2 border-green-500 rounded-xl p-6 mb-5">
            <h4 className="text-xl font-bold text-green-800 mb-4">❓ Quick FAQ</h4>
            <div className="grid gap-4">
              <div>
                <p className="text-sm font-bold text-green-700 mb-1.5">Q: What is a cluster?</p>
                <p className="text-sm text-green-700 leading-relaxed m-0">
                  A: A cluster is a small group of things that are similar—like {profession === "Real Estate" ? "houses with similar size & price" : profession === "Law" ? "cases of similar length & severity" : "articles with similar topics & engagement"}.
                </p>
              </div>
              <div>
                <p className="text-sm font-bold text-green-700 mb-1.5">Q: Why change settings?</p>
                <p className="text-sm text-green-700 leading-relaxed m-0">
                  A: Because sometimes you want a broad overview, other times only exact matches—settings control that. Think of it like adjusting binoculars: zoom in for detail, zoom out for the big picture.
                </p>
              </div>
              <div>
                <p className="text-sm font-bold text-green-700 mb-1.5">Q: What to do with outliers?</p>
                <p className="text-sm text-green-700 leading-relaxed m-0">
                  A: Investigate—they might be {profession === "Real Estate" ? "special investment opportunities or data entry errors" : profession === "Law" ? "landmark cases needing senior attention or filing mistakes" : "viral stories worth featuring or content gaps to fill"}.
                </p>
              </div>
            </div>
          </div>
        )}

        {showLimitations && (
          <div className="bg-yellow-50 border-2 border-yellow-500 rounded-xl p-6 mb-5">
            <h4 className="text-xl font-bold text-yellow-800 mb-4">⚠️ Important Notes for Stakeholders</h4>
            <div className="grid gap-3.5">
              <div className="flex gap-3 items-start">
                <span className="text-xl flex-shrink-0">🎛️</span>
                <div>
                  <p className="text-sm font-bold text-yellow-700 mb-1">Settings Matter</p>
                  <p className="text-xs text-yellow-700 leading-relaxed m-0">
                    Results change significantly with Distance (ε) and Min Size settings. There's no one-size-fits-all—you'll need to experiment to find what works for your data.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <span className="text-xl flex-shrink-0">📊</span>
                <div>
                  <p className="text-sm font-bold text-yellow-700 mb-1">Features You Choose Matter Hugely</p>
                  <p className="text-xs text-yellow-700 leading-relaxed m-0">
                    If you pick {profession === "Real Estate" ? "price and area" : profession === "Law" ? "duration and complexity" : "word count and engagement"}, clusters will reflect only those features. Other characteristics (like {profession === "Real Estate" ? "location or age" : profession === "Law" ? "court type or outcome" : "author or publication date"}) won't be considered.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <span className="text-xl flex-shrink-0">⚖️</span>
                <div>
                  <p className="text-sm font-bold text-yellow-700 mb-1">Data Must Be Normalized</p>
                  <p className="text-xs text-yellow-700 leading-relaxed m-0">
                    For real-world data, you need to scale features to similar ranges. Otherwise, {profession === "Real Estate" ? "price in lakhs (50-200) will dominate over bedrooms (1-5)" : profession === "Law" ? "days (10-500) will dominate over complexity scores (1-10)" : "word count (300-5000) will dominate over engagement % (10-100)"}.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <span className="text-xl flex-shrink-0">🧪</span>
                <div>
                  <p className="text-sm font-bold text-yellow-700 mb-1">This is a Demo</p>
                  <p className="text-xs text-yellow-700 leading-relaxed m-0">
                    These visualizations use small synthetic datasets to show the concept. For production use, you'll need properly cleaned real data with appropriate preprocessing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}