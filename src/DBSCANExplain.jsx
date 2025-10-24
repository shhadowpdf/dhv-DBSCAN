import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * DBSCANExplain.jsx
 * - Static green ε circle (no pulsing).
 * - Steps now include STEP 7: final-clusters (shows full DBSCAN clustering).
 * - Exact same plot look/feel as your original viz (SVG size, gradient, colors).
 */

/* ---------- Visual constants (mirror your main viz) ---------- */
const SVG_WIDTH = 600;
const SVG_HEIGHT = 400;
const POINT_RADIUS = 3;
const HOVER_RADIUS_INCREASE = 2;
const SELECTED_POINT_RADIUS = POINT_RADIUS + HOVER_RADIUS_INCREASE;

const COLORS = [
  '#66D9EF', '#A6E22E', '#FD971F', '#AE81FF', '#F92672',
  '#E6DB74', '#52607A', '#75715E', '#273C4E', '#48A9A6',
];
const NOISE_COLOR = '#888';
const BG_GRADIENT_START = '#282C34';
const BG_GRADIENT_END = '#1C1F26';

/* Tuned for Iris in SVG space (PetalLength vs PetalWidth) */
const DEFAULT_EPS = 22;
const DEFAULT_MIN_PTS = 5;

/* ---------- Iris dataset: [sepal_len, sepal_wid, petal_len, petal_wid, classId] ---------- */
const irisRaw = [
  [5.1,3.5,1.4,0.2,0],[4.9,3.0,1.4,0.2,0],[4.7,3.2,1.3,0.2,0],[4.6,3.1,1.5,0.2,0],[5.0,3.6,1.4,0.2,0],
  [5.4,3.9,1.7,0.4,0],[4.6,3.4,1.4,0.3,0],[5.0,3.4,1.5,0.2,0],[4.4,2.9,1.4,0.2,0],[4.9,3.1,1.5,0.1,0],
  [5.4,3.7,1.5,0.2,0],[4.8,3.4,1.6,0.2,0],[4.8,3.0,1.4,0.1,0],[4.3,3.0,1.1,0.1,0],[5.8,4.0,1.2,0.2,0],
  [5.7,4.4,1.5,0.4,0],[5.4,3.9,1.3,0.4,0],[5.1,3.5,1.4,0.3,0],[5.7,3.8,1.7,0.3,0],[5.1,3.8,1.5,0.3,0],
  [5.4,3.4,1.7,0.2,0],[5.1,3.7,1.5,0.4,0],[4.6,3.6,1.0,0.2,0],[5.1,3.3,1.7,0.5,0],[4.8,3.4,1.9,0.2,0],
  [5.0,3.0,1.6,0.2,0],[5.0,3.4,1.6,0.4,0],[5.2,3.5,1.5,0.2,0],[5.2,3.4,1.4,0.2,0],[4.7,3.2,1.6,0.2,0],
  [4.8,3.1,1.6,0.2,0],[5.4,3.4,1.5,0.4,0],[5.2,4.1,1.5,0.1,0],[5.5,4.2,1.4,0.2,0],[4.9,3.1,1.5,0.2,0],
  [5.0,3.2,1.2,0.2,0],[5.5,3.5,1.3,0.2,0],[4.9,3.6,1.4,0.1,0],[4.4,3.0,1.3,0.2,0],[5.1,3.4,1.5,0.2,0],
  [5.0,3.5,1.3,0.3,0],[4.5,2.3,1.3,0.3,0],[4.4,3.2,1.3,0.2,0],[5.0,3.5,1.6,0.6,0],[5.1,3.8,1.9,0.4,0],
  [4.8,3.0,1.4,0.3,0],[5.1,3.8,1.6,0.2,0],[4.6,3.2,1.4,0.2,0],[5.3,3.7,1.5,0.2,0],[5.0,3.3,1.4,0.2,0],
  [7.0,3.2,4.7,1.4,1],[6.4,3.2,4.5,1.5,1],[6.9,3.1,4.9,1.5,1],[5.5,2.3,4.0,1.3,1],[6.5,2.8,4.6,1.5,1],
  [5.7,2.8,4.5,1.3,1],[6.3,3.3,4.7,1.6,1],[4.9,2.4,3.3,1.0,1],[6.6,2.9,4.6,1.3,1],[5.2,2.7,3.9,1.4,1],
  [5.0,2.0,3.5,1.0,1],[5.9,3.0,4.2,1.5,1],[6.0,2.2,4.0,1.0,1],[6.1,2.9,4.7,1.4,1],[5.6,2.9,3.6,1.3,1],
  [6.7,3.1,4.4,1.4,1],[5.6,3.0,4.5,1.5,1],[5.8,2.7,4.1,1.0,1],[6.2,2.2,4.5,1.5,1],[5.6,2.5,3.9,1.1,1],
  [5.9,3.2,4.8,1.8,1],[6.1,2.8,4.0,1.3,1],[6.3,2.5,4.9,1.5,1],[6.1,2.8,4.7,1.2,1],[6.4,2.9,4.3,1.3,1],
  [6.6,3.0,4.4,1.4,1],[6.8,2.8,4.8,1.4,1],[6.7,3.0,5.0,1.7,1],[6.0,2.9,4.5,1.5,1],[5.7,2.6,3.5,1.0,1],
  [5.5,2.4,3.8,1.1,1],[5.5,2.4,3.7,1.0,1],[5.8,2.7,3.9,1.2,1],[6.0,2.7,5.1,1.6,1],[5.4,3.0,4.5,1.5,1],
  [6.0,3.4,4.5,1.6,1],[6.7,3.1,4.7,1.5,1],[6.3,2.3,4.4,1.3,1],[5.6,3.0,4.1,1.3,1],[5.5,2.5,4.0,1.3,1],
  [5.5,2.6,4.4,1.2,1],[6.1,3.0,4.6,1.4,1],[5.8,2.6,4.0,1.2,1],[5.0,2.3,3.3,1.0,1],[5.6,2.7,4.2,1.3,1],
  [5.7,3.0,4.2,1.2,1],[5.7,2.9,4.2,1.3,1],[6.2,2.9,4.3,1.3,1],[5.1,2.5,3.0,1.1,1],[5.7,2.8,4.1,1.3,1],
  [6.3,3.3,6.0,2.5,2],[5.8,2.7,5.1,1.9,2],[7.1,3.0,5.9,2.1,2],[6.3,2.9,5.6,1.8,2],[6.5,3.0,5.8,2.2,2],
  [7.6,3.0,6.6,2.1,2],[4.9,2.5,4.5,1.7,2],[7.3,2.9,6.3,1.8,2],[6.7,2.5,5.8,1.8,2],[7.2,3.6,6.1,2.5,2],
  [6.5,3.2,5.1,2.0,2],[6.4,2.7,5.3,1.9,2],[6.8,3.0,5.5,2.1,2],[5.7,2.5,5.0,2.0,2],[5.8,2.8,5.1,2.4,2],
  [6.4,3.2,5.3,2.3,2],[6.5,3.0,5.5,1.8,2],[7.7,3.8,6.7,2.2,2],[7.7,2.6,6.9,2.3,2],[6.0,2.2,5.0,1.5,2],
  [6.9,3.2,5.7,2.3,2],[5.6,2.8,4.9,2.0,2],[7.7,2.8,6.7,2.0,2],[6.3,2.7,4.9,1.8,2],[6.7,3.3,5.7,2.1,2],
  [7.2,3.2,6.0,1.8,2],[6.2,2.8,4.8,1.8,2],[6.1,3.0,4.9,1.8,2],[6.4,2.8,5.6,2.1,2],[7.2,3.0,5.8,1.6,2],
  [7.4,2.8,6.1,1.9,2],[7.9,3.8,6.4,2.0,2],[6.4,2.8,5.6,2.2,2],[6.3,2.8,5.1,1.5,2],[6.1,2.6,5.6,1.4,2],
  [7.7,3.0,6.1,2.3,2],[6.3,3.4,5.6,2.4,2],[6.4,3.1,5.5,1.8,2],[6.0,3.0,4.8,1.8,2],[6.9,3.1,5.4,2.1,2],
  [6.7,3.1,5.6,2.4,2],[6.9,3.1,5.1,2.3,2],[5.8,2.7,5.1,1.9,2],[6.8,3.2,5.9,2.3,2],[6.7,3.3,5.7,2.5,2],
  [6.7,3.0,5.2,2.3,2],[6.3,2.5,5.0,1.9,2],[6.5,3.0,5.2,2.0,2],[6.2,3.4,5.4,2.3,2],[5.9,3.0,5.1,1.8,2],
];

/* ---------- Feature pairs ---------- */
const FEATURE_NAMES = ["Sepal Length","Sepal Width","Petal Length","Petal Width"];
const FEATURE_PAIRS = [
  { x: 2, y: 3, label: "Petal Length vs Petal Width" },
  { x: 0, y: 1, label: "Sepal Length vs Sepal Width" },
  { x: 0, y: 2, label: "Sepal Length vs Petal Length" },
  { x: 1, y: 3, label: "Sepal Width vs Petal Width" },
];

/* ---------- Helpers ---------- */
function scaleToSVG(dataArr, xIdx, yIdx) {
  const xs = dataArr.map(d => d[xIdx]);
  const ys = dataArr.map(d => d[yIdx]);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const padding = 50;
  return dataArr.map((row, i) => ({
    id: i,
    raw: row,
    xRaw: row[xIdx],
    yRaw: row[yIdx],
    x: ((row[xIdx] - minX) / (maxX - minX || 1)) * (SVG_WIDTH - 2 * padding) + padding,
    y: SVG_HEIGHT - (((row[yIdx] - minY) / (maxY - minY || 1)) * (SVG_HEIGHT - 2 * padding) + padding),
  }));
}

function dist(a, b) {
  const dx = a.x - b.x, dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

function getNeighbors(points, center, eps) {
  const out = [];
  for (const p of points) {
    if (p.id === center.id) continue;
    if (dist(p, center) <= eps) out.push(p);
  }
  return out;
}

/* ---------- DBSCAN in SVG space ---------- */
function dbscan(points, epsilon, minPts) {
  const pts = points.map(p => ({ ...p, cluster: undefined, type: 'noise', visited: false }));
  let clusterId = 0;

  const neighbors = (pt) => pts.filter(q => q.id !== pt.id && dist(pt, q) <= epsilon);

  function expandCluster(point, nbrs) {
    point.cluster = clusterId;
    point.type = 'core';
    point.visited = true;
    let queue = nbrs.slice();

    for (let i = 0; i < queue.length; i++) {
      const cur = queue[i];
      if (!cur.visited) {
        cur.visited = true;
        const curNbrs = neighbors(cur);
        if (curNbrs.length + 1 >= minPts) {
          // add new neighbors
          for (const n of curNbrs) if (!n.visited) queue.push(n);
        }
      }
      if (cur.cluster === undefined) {
        cur.cluster = clusterId;
        cur.type = (neighbors(cur).length + 1 >= minPts) ? 'core' : 'border';
      }
    }
  }

  for (const pt of pts) {
    if (pt.visited) continue;
    pt.visited = true;
    const nbrs = neighbors(pt);
    if (nbrs.length + 1 < minPts) {
      pt.type = 'noise';
    } else {
      clusterId++;
      expandCluster(pt, nbrs);
    }
  }

  for (const pt of pts) {
    if (pt.cluster === undefined) pt.type = 'noise';
  }
  return pts;
}

/* ---------- Component ---------- */
const DBSCANExplain = ({
  initialPairIndex = 0,        // default: Petal Length vs Petal Width
  epsilon = DEFAULT_EPS,
  minPts = DEFAULT_MIN_PTS,
}) => {
  const [pairIndex, setPairIndex] = useState(initialPairIndex);

  // Animation/state machine
  const STEPS = [
    "select",        // 1
    "epsilon",       // 2
    "neighbors",     // 3
    "core-check",    // 4
    "expand",        // 5
    "noise",         // 6
    "final-clusters" // 7
  ];
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const rafRef = useRef(null);
  const dwellRef = useRef(Date.now());

  const xIdx = FEATURE_PAIRS[pairIndex].x;
  const yIdx = FEATURE_PAIRS[pairIndex].y;

  const points = useMemo(() => scaleToSVG(irisRaw, xIdx, yIdx), [xIdx, yIdx]);

  // Choose a solid candidate (densest local point) to keep demo clean
  const candidate = useMemo(() => {
    let best = points[0], bestN = -1;
    for (const p of points) {
      const n = getNeighbors(points, p, epsilon).length;
      if (n > bestN) { bestN = n; best = p; }
    }
    return best;
  }, [points, epsilon]);

  const neigh = useMemo(() => getNeighbors(points, candidate, epsilon), [points, candidate, epsilon]);
  const isCore = neigh.length + 1 >= minPts;

  // Isolated point for noise demo
  const noiseCandidate = useMemo(() => {
    let worst = points[0], worstN = Infinity;
    for (const p of points) {
      const n = getNeighbors(points, p, epsilon).length;
      if (n < worstN) { worstN = n; worst = p; }
    }
    return worst;
  }, [points, epsilon]);

  // Full DBSCAN result for STEP 7
  const clusteredAll = useMemo(() => dbscan(points, epsilon, minPts), [points, epsilon, minPts]);
  const numClusters = useMemo(() => {
    const set = new Set(clusteredAll.filter(p => p.cluster !== undefined).map(p => p.cluster));
    return set.size;
  }, [clusteredAll]);

  const step = STEPS[stepIndex];

  // Clean inline CSS (NO pulse/glow so the green circle is static)
  const styles = `
    .btn { padding: 0.5rem 0.9rem; border: none; border-radius: 8px; cursor: pointer; font-size: 0.875rem; font-weight: 600; color: #fff; }
    .btn-blue { background: #3b82f6; }
    .btn-gray { background: #64748b; }
    .btn-amber { background: #f59e0b; }
    .card { background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
    .muted { color: #64748b; font-size: 0.9rem; }
    .label { font-weight: 700; color: #1e293b; }
  `;

  // Animation loop
  useEffect(() => {
    if (!isPlaying) return;
    const durations = {
      "select": 900, "epsilon": 900, "neighbors": 1100,
      "core-check": 900, "expand": 1100, "noise": 900, "final-clusters": 1800
    };
    const loop = () => {
      const now = Date.now();
      const dwell = durations[step];
      if (now - dwellRef.current >= dwell) {
        dwellRef.current = now;
        setStepIndex(i => (i + 1) % STEPS.length);
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    dwellRef.current = Date.now();
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isPlaying, step]);

  const togglePlay = () => setIsPlaying(p => !p);
  const next = () => { setIsPlaying(false); setStepIndex(i => (i + 1) % STEPS.length); };
  const prev = () => { setIsPlaying(false); setStepIndex(i => (i - 1 + STEPS.length) % STEPS.length); };
  const reset = () => { setIsPlaying(false); setStepIndex(0); };

  // Descriptions
  const descriptions = {
    "select": "Step 1: Pick a point in the cloud.",
    "epsilon": `Step 2: Draw the ε circle around it (ε = ${epsilon}, static).`,
    "neighbors": "Step 3: Points inside the circle are neighbors (lines show proximity).",
    "core-check": `Step 4: Core check — neighbors + self ≥ MinPts (${minPts})?`,
    "expand": "Step 5: If core, cluster expands by exploring neighbors’ neighbors.",
    "noise": "Step 6: A point with too few neighbors is noise.",
    "final-clusters": "Step 7: Run DBSCAN over all points — view all clusters."
  };

  // Rendering (same visual decisions as your main viz)
  const renderPointExplainer = (p) => {
    let fill = "#ffffff";
    let stroke = "none";
    let r = POINT_RADIUS;

    if (step === "select") {
      if (p.id === candidate.id) { fill = COLORS[1]; stroke = COLORS[1]; r = 5; }
    }
    if (step === "epsilon" || step === "neighbors" || step === "core-check") {
      if (p.id === candidate.id) { fill = COLORS[1]; stroke = COLORS[1]; r = 5; }
      if (neigh.some(n => n.id === p.id)) { fill = COLORS[2]; r = 4; }
    }
    if (step === "expand") {
      if (isCore && (p.id === candidate.id || neigh.some(n => n.id === p.id))) {
        fill = COLORS[3]; stroke = COLORS[3]; r = 5;
      } else if (p.id === candidate.id) {
        fill = COLORS[1]; stroke = COLORS[1]; r = 5;
      } else if (neigh.some(n => n.id === p.id)) {
        fill = COLORS[2]; r = 4;
      }
    }
    if (step === "noise") {
      if (p.id === noiseCandidate.id) { fill = NOISE_COLOR; r = 5; }
    }
    if (step === "final-clusters") {
      // In final step we draw from clusteredAll, not from this branch.
      // So keep them default here to avoid double coloring.
    }

    return (
      <circle
        key={p.id}
        cx={p.x}
        cy={p.y}
        r={r}
        fill={fill}
        stroke={stroke}
        strokeWidth={p.id === candidate.id ? 1.6 : 0}
      />
    );
  };

  // Final clusters rendering
  const renderPointClusters = (p) => {
    const color = (p.cluster === undefined || p.type === 'noise')
      ? NOISE_COLOR
      : COLORS[(p.cluster - 1) % COLORS.length];
    const r = POINT_RADIUS;
    const stroke = (p.type === 'core' && p.cluster !== undefined) ? color : 'none';
    const strokeWidth = (p.type === 'core' && p.cluster !== undefined) ? 1.5 : 0;

    return (
      <circle
        key={`final-${p.id}`}
        cx={p.x}
        cy={p.y}
        r={r}
        fill={color}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    );
  };

  // Legend for final clusters
  const clusterLegend = () => {
    const clusters = Array.from(new Set(clusteredAll.map(p => p.cluster))).filter(c => c !== undefined).sort((a,b)=>a-b);
    const noiseCount = clusteredAll.filter(p => p.cluster === undefined).length;

    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.75rem', justifyContent: 'center' }}>
        {clusters.map(c => {
          const count = clusteredAll.filter(p => p.cluster === c).length;
          return (
            <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 16, height: 16, borderRadius: '50%', background: COLORS[(c - 1) % COLORS.length] }} />
              <span style={{ color: '#1e293b', fontSize: 13 }}>Cluster {c} ({count})</span>
            </div>
          );
        })}
        {noiseCount > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 16, height: 16, borderRadius: '50%', background: NOISE_COLOR }} />
            <span style={{ color: '#1e293b', fontSize: 13 }}>Noise ({noiseCount})</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", color: "white", fontFamily: "system-ui, -apple-system, sans-serif", padding: "2rem" }}>
      <style>{styles}</style>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ fontSize: "1.9rem", fontWeight: 800, margin: 0, textAlign: "center", color: "#e2e8f0" }}>
          DBSCAN — Animated (Iris Dataset)
        </h1>
        <p style={{ margin: 0, textAlign: "center", color: "#94a3b8" }}>
          Static ε circle + final clusters view (exact same plot styling as your main viz)
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "1.25rem", marginTop: "1rem" }}>
          {/* Left: animation panel */}
          <div className="card" style={{ background: "white", color: "#1e293b" }}>
            {/* Controls */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: "1.1rem", fontWeight: 700 }}>
                  {`Step ${stepIndex + 1} of ${STEPS.length}: ${step}`}
                </div>
                <div className="muted" style={{ marginTop: 2 }}>{descriptions[step]}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-gray" onClick={prev}>◀ Prev</button>
                <button className="btn btn-gray" onClick={next}>Next ▶</button>
              </div>
            </div>

            {/* Feature pair selector */}
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
              <span className="label">Feature Pair:</span>
              <select
                value={pairIndex}
                onChange={(e) => { setPairIndex(parseInt(e.target.value, 10)); setStepIndex(0); }}
                style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#f8fafc" }}
              >
                {FEATURE_PAIRS.map((p, idx) => (
                  <option key={idx} value={idx}>{p.label}</option>
                ))}
              </select>
            </div>

            {/* SVG */}
            <div style={{ overflow: "hidden", borderRadius: 8 }}>
              <svg width={SVG_WIDTH} height={SVG_HEIGHT} style={{ display: "block", margin: "0 auto" }}>
                <defs>
                  <linearGradient id="svgBackgroundGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: BG_GRADIENT_START, stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: BG_GRADIENT_END, stopOpacity: 1 }} />
                  </linearGradient>
                </defs>
                <rect width="100%" height="100%" fill="url(#svgBackgroundGradient)" />

                {/* Static ε circle (no animation) */}
                {(step === "epsilon" || step === "neighbors" || step === "core-check" || step === "expand") && (
                  <>
                    <circle
                      cx={candidate.x}
                      cy={candidate.y}
                      r={epsilon}
                      fill={COLORS[1]}
                      opacity="0.10"
                    />
                    <circle
                      cx={candidate.x}
                      cy={candidate.y}
                      r={epsilon}
                      stroke={COLORS[1]}
                      strokeDasharray="5,5"
                      fill="none"
                      opacity="0.5"
                    />
                  </>
                )}

                {/* Neighbor lines */}
                {(step === "neighbors" || step === "core-check" || step === "expand") && neigh.map(n => (
                  <line
                    key={`line-${n.id}`}
                    x1={candidate.x}
                    y1={candidate.y}
                    x2={n.x}
                    y2={n.y}
                    stroke={COLORS[1]}
                    strokeWidth="1"
                    opacity="0.5"
                  />
                ))}

                {/* Points: steps 1–6 use explainer coloring; step 7 shows final clusters */}
                {step !== "final-clusters" && points.map(renderPointExplainer)}
                {step === "final-clusters" && clusteredAll.map(renderPointClusters)}

                {/* Overlays */}
                {(step === "core-check") && (
                  <g>
                    <rect x={12} y={12} width={260} height={64} fill="rgba(0,0,0,0.35)" rx="8" />
                    <text x={24} y={36} fill="#fff" style={{ fontSize: 14, fontWeight: 700 }}>
                      {`Neighbors + self = ${neigh.length + 1}`}
                    </text>
                    <text x={24} y={58} fill="#cbd5e1" style={{ fontSize: 13 }}>
                      {`MinPts = ${minPts} → ${isCore ? "CORE" : "NOT CORE"}`}
                    </text>
                  </g>
                )}

                {(step === "noise") && (
                  <>
                    <circle
                      cx={noiseCandidate.x}
                      cy={noiseCandidate.y}
                      r={epsilon}
                      fill="none"
                      stroke={NOISE_COLOR}
                      strokeDasharray="5,5"
                      opacity="0.5"
                    />
                    <g>
                      <rect x={12} y={12} width={280} height={64} fill="rgba(0,0,0,0.35)" rx="8" />
                      <text x={24} y={36} fill="#fff" style={{ fontSize: 14, fontWeight: 700 }}>
                        Noise example (too few neighbors)
                      </text>
                      <text x={24} y={58} fill="#cbd5e1" style={{ fontSize: 13 }}>
                        Not assigned to any cluster
                      </text>
                    </g>
                  </>
                )}
              </svg>
            </div>

            {/* Legend only for final clusters */}
            {step === "final-clusters" && clusterLegend()}

            {/* Axis labels (to match exact-plot vibe) */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, color: "#1e293b" }}>
              <div style={{ fontSize: 12 }}><strong>X:</strong> {FEATURE_NAMES[xIdx]}</div>
              <div style={{ fontSize: 12 }}><strong>Y:</strong> {FEATURE_NAMES[yIdx]}</div>
            </div>
          </div>

          {/* Right: parameters & notes */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div className="card">
              <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "#1e293b", marginBottom: 8 }}>Parameters</div>
              <div style={{ color: "#1e293b", fontSize: ".95rem" }}>
                <div><span className="label">ε:</span> <span style={{ color: "#3b82f6" }}>{epsilon}</span> <span className="muted">(SVG units)</span></div>
                <div style={{ marginTop: 6 }}><span className="label">MinPts:</span> <span style={{ color: "#10b981" }}>{minPts}</span></div>
                <p className="muted" style={{ marginTop: 8 }}>
                  ε is measured in the scaled SVG space (same scaling as your main viz).
                </p>
                {step === "final-clusters" && (
                  <p className="muted" style={{ marginTop: 8 }}>
                    Clusters found: <strong>{numClusters}</strong> (colored), noise shown in grey.
                  </p>
                )}
              </div>
            </div>

            {/* <div className="card">
              <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "#1e293b", marginBottom: 8 }}>What changed</div>
              <ul style={{ margin: 0, paddingLeft: "1.1rem", color: "#334155", fontSize: ".95rem" }}>
                <li>Green ε highlight is now <strong>static</strong> (no movement).</li>
                <li>New <strong>STEP 7</strong>: shows the <strong>full DBSCAN clustering</strong> across all points.</li>
                <li>Plot style is identical to your main chart (gradient, colors, stroke logic).</li>
              </ul>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DBSCANExplain;