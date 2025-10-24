import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * DBSCANExplain.jsx
 * An animated, step-by-step explanation of DBSCAN.
 * - Analogy: "friends within walking distance" (ε) who can form a group if enough show up (MinPts).
 * - Plot aesthetics mirror the main viz: SVG, same palette, epsilon ring, neighbor lines.
 * - No external deps. Pure React + inline CSS (keyframes injected via <style>).
 */

/* ---------- Visual constants (match your main viz) ---------- */
const SVG_WIDTH = 600;
const SVG_HEIGHT = 400;
const POINT_RADIUS = 3;
const COLORS = [
  "#66D9EF", "#A6E22E", "#FD971F", "#AE81FF", "#F92672",
  "#E6DB74", "#52607A", "#75715E", "#273C4E", "#48A9A6",
];
const NOISE_COLOR = "#888";
const BG_GRADIENT_START = "#282C34";
const BG_GRADIENT_END = "#1C1F26";

/* ---------- Defaults that you can override via props ---------- */
const DEFAULT_EPS = 35;
const DEFAULT_MINPTS = 5;

/* ---------- Sample data (same structure as your main viz) ---------- */
/* You can pass your realEstateData via props.initialData to reuse the exact data. */
const fallbackData = [
  // A tiny subset to make the explanation clear and quick
  [28, 480, 1, 22], [30, 520, 1, 20], [32, 550, 1, 18], [35, 600, 2, 19],
  [85, 1250, 3, 12], [88, 1300, 3, 11], [92, 1350, 3, 10], [95, 1400, 3, 9],
  [185, 2250, 4, 6], [195, 2350, 4, 5], [130, 1100, 2, 18], [70, 700, 1, 30],
];

/* ---------- Helpers ---------- */
function scaleToSVG(dataArr) {
  const prices = dataArr.map(d => d[0]);
  const areas  = dataArr.map(d => d[1]);
  const minX = Math.min(...prices), maxX = Math.max(...prices);
  const minY = Math.min(...areas),  maxY = Math.max(...areas);
  const padding = 50;

  return dataArr.map((p, i) => ({
    id: i,
    price: p[0],
    area: p[1],
    bedrooms: p[2] ?? 0,
    age: p[3] ?? 0,
    x: ((p[0] - minX) / (maxX - minX || 1)) * (SVG_WIDTH - 2 * padding) + padding,
    y: SVG_HEIGHT - (((p[1] - minY) / (maxY - minY || 1)) * (SVG_HEIGHT - 2 * padding) + padding),
  }));
}

function dist(a, b) {
  const dx = a.x - b.x, dy = a.y - b.y;
  return Math.hypot(dx, dy);
}
function neighbors(points, center, eps) {
  return points.filter(p => p.id !== center.id && dist(p, center) <= eps);
}

/* ---------- Animation states ---------- */
/**
 * Steps:
 * 0: "select"          — pick a point (candidate)
 * 1: "epsilon"         — show ε circle (pulse)
 * 2: "neighbors"       — highlight neighbors + lines
 * 3: "core-check"      — core or not based on MinPts
 * 4: "expand"          — (if core) add neighbors into cluster
 * 5: "noise"           — (if not core) mark as noise (demonstrate with a different point)
 *
 * The animation loops through a small scenario to teach the idea.
 */
const STEPS = ["select", "epsilon", "neighbors", "core-check", "expand", "noise"];

const DBSCANExplain = ({
  initialData = fallbackData,
  epsilon = DEFAULT_EPS,
  minPts = DEFAULT_MINPTS,
}) => {
  /* ---------- State ---------- */
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tick, setTick] = useState(0); // drives pulse animation
  const timerRef = useRef(null);

  const points = useMemo(() => scaleToSVG(initialData), [initialData]);

  // Choose 1 candidate core-ish point from the first dense block
  const candidate = points[2] ?? points[0];
  const neigh = useMemo(() => neighbors(points, candidate, epsilon), [points, candidate, epsilon]);

  // For "noise" demo, pick an isolated point (usually around scattered middle)
  const noiseCandidate = useMemo(() => {
    // pick the point with smallest neighbor count
    let best = points[0], bestN = Infinity;
    for (const p of points) {
      const n = neighbors(points, p, epsilon).length;
      if (n < bestN) { bestN = n; best = p; }
    }
    return best;
  }, [points, epsilon]);

  const isCore = neigh.length + 1 /* include self */ >= minPts;

  /* ---------- Animation loop ---------- */
  useEffect(() => {
    if (!isPlaying) return;
    timerRef.current = setInterval(() => setTick(t => t + 1), 50);
    return () => clearInterval(timerRef.current);
  }, [isPlaying]);

  useEffect(() => {
    // Auto-advance steps slowly when playing
    if (!isPlaying) return;
    const s = STEPS[stepIndex];
    // dwell duration per step (ms)
    const dwell =
      s === "select" ? 800 :
      s === "epsilon" ? 1400 :
      s === "neighbors" ? 1400 :
      s === "core-check" ? 1000 :
      s === "expand" ? 1400 :
      1200; // noise

    const h = setTimeout(() => {
      setStepIndex(i => (i + 1) % STEPS.length);
    }, dwell);
    return () => clearTimeout(h);
  }, [tick, isPlaying, stepIndex]);

  /* ---------- Controls ---------- */
  const playPause = () => setIsPlaying(p => !p);
  const reset = () => { setIsPlaying(false); setStepIndex(0); setTick(0); };
  const next = () => setStepIndex(i => (i + 1) % STEPS.length);
  const prev = () => setStepIndex(i => (i - 1 + STEPS.length) % STEPS.length);

  const step = STEPS[stepIndex];

  /* ---------- Inline CSS (including keyframes) ---------- */
  const keyframes = `
    @keyframes pulse {
      0%   { transform: scale(0.95); opacity: 0.45; }
      50%  { transform: scale(1.05); opacity: 0.75; }
      100% { transform: scale(0.95); opacity: 0.45; }
    }
    @keyframes glow {
      0%   { filter: drop-shadow(0 0 0px rgba(255,255,255,0.0)); }
      50%  { filter: drop-shadow(0 0 6px rgba(255,255,255,0.6)); }
      100% { filter: drop-shadow(0 0 0px rgba(255,255,255,0.0)); }
    }
    .pulse {
      animation: pulse 1.2s ease-in-out infinite;
      transform-origin: center center;
    }
    .glow {
      animation: glow 1.2s ease-in-out infinite;
    }
    .btn { padding: 0.5rem 0.9rem; border: none; border-radius: 6px; cursor: pointer; font-size: 0.875rem; font-weight: 600; color: #fff; }
    .btn-blue { background: #3b82f6; }
    .btn-gray { background: #64748b; }
    .btn-amber { background: #f59e0b; }
    .muted { color: #94a3b8; font-size: 0.85rem; }
    .card { background: white; padding: 1.25rem; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
    .headline { font-size: 1.7rem; font-weight: 800; margin: 0 0 .5rem 0; color: #e2e8f0; text-align: center; }
    .sub { margin: 0; color: #94a3b8; text-align: center; }
    .label { font-weight: 700; color: #1e293b; }
  `;

  /* ---------- Step-by-step annotation text (analogy) ---------- */
  const explanation = {
    select: "Pick a person standing on the map. We’ll check who’s within walking distance (ε) from them.",
    epsilon: "Draw a circle of radius ε around the person — that’s their ‘walking distance’.",
    neighbors: "Everyone inside this circle are immediate friends (neighbors). Lines show who’s close enough.",
    "core-check": `If the person + their neighbors ≥ MinPts (${minPts}), they’re a CORE person; else not.`,
    expand: "From a CORE person, the group spreads: friends bring their friends (within ε), forming a cluster.",
    noise: "Someone with too few neighbors becomes NOISE (not in any group).",
  };

  /* ---------- Render ---------- */
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", color: "white", fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif", padding: "2rem" }}>
      <style>{keyframes}</style>

      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h1 className="headline">DBSCAN — Animated Explanation</h1>
        <p className="sub">Analogy: “Friends within walking distance” form groups (clusters) if enough show up.</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "1.25rem", marginTop: "1.25rem" }}>
          {/* Left: animation panel */}
          <div className="card" style={{ background: "white", borderRadius: 12 }}>
            {/* Controls */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
              <div>
                <div style={{ fontSize: "1.15rem", fontWeight: 700, color: "#1e293b" }}>{`Step ${stepIndex + 1} of ${STEPS.length}: ${step}`}</div>
                <div style={{ color: "#64748b", fontSize: ".9rem", marginTop: 4 }}>{explanation[step]}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-gray" onClick={prev}>◀︎ Prev</button>
                <button className="btn btn-blue" onClick={playPause}>{isPlaying ? "Pause" : "Play"}</button>
                <button className="btn btn-gray" onClick={next}>Next ▶︎</button>
                <button className="btn btn-amber" onClick={reset}>Reset</button>
              </div>
            </div>

            {/* SVG */}
            <div style={{ overflow: "hidden", borderRadius: 8 }}>
              <svg width={SVG_WIDTH} height={SVG_HEIGHT} style={{ display: "block", margin: "0 auto" }}>
                <defs>
                  <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: BG_GRADIENT_START, stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: BG_GRADIENT_END, stopOpacity: 1 }} />
                  </linearGradient>
                </defs>
                <rect width="100%" height="100%" fill="url(#bgGrad)" />

                {/* Epsilon circle + neighbors for "candidate" */}
                {(step === "epsilon" || step === "neighbors" || step === "core-check" || step === "expand") && (
                  <>
                    {/* Filled pulse */}
                    <circle
                      className="pulse"
                      cx={candidate.x}
                      cy={candidate.y}
                      r={epsilon}
                      fill="#ffffff"
                      opacity="0.08"
                    />
                    {/* Dashed ring */}
                    <circle
                      cx={candidate.x}
                      cy={candidate.y}
                      r={epsilon}
                      fill="none"
                      stroke="#ffffff"
                      strokeDasharray="6,6"
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
                    stroke={COLORS[0]}
                    strokeWidth={1}
                    opacity={0.55}
                  />
                ))}

                {/* Points */}
                {points.map(p => {
                  // Determine color per step
                  let fill = "#ffffff";
                  let stroke = "none";
                  let r = POINT_RADIUS;

                  // Default: all white dots
                  if (step === "select") {
                    if (p.id === candidate.id) { fill = COLORS[1]; r = 5; }
                  }
                  if (step === "epsilon" || step === "neighbors" || step === "core-check") {
                    if (p.id === candidate.id) { fill = COLORS[1]; r = 5; stroke = COLORS[1]; }
                    if (neigh.some(n => n.id === p.id)) { fill = COLORS[2]; r = 4; }
                  }
                  if (step === "expand") {
                    // If core, color the local cluster (candidate + neighbors)
                    if (isCore && (p.id === candidate.id || neigh.some(n => n.id === p.id))) {
                      fill = COLORS[3]; r = 5; stroke = COLORS[3];
                    } else if (p.id === candidate.id) {
                      fill = COLORS[1]; r = 5; stroke = COLORS[1];
                    } else if (neigh.some(n => n.id === p.id)) {
                      fill = COLORS[2]; r = 4;
                    }
                  }
                  if (step === "noise") {
                    if (p.id === noiseCandidate.id) { fill = NOISE_COLOR; r = 5; }
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
                      className={p.id === candidate.id && (step === "select" || step === "epsilon") ? "glow" : ""}
                    />
                  );
                })}

                {/* Labels for MinPts decision */}
                {(step === "core-check") && (
                  <g>
                    <rect x={12} y={12} width={240} height={64} fill="rgba(0,0,0,0.35)" rx="8" />
                    <text x={24} y={36} fill="#fff" style={{ fontSize: 14, fontWeight: 700 }}>
                      {`Neighbors + self = ${neigh.length + 1}`}
                    </text>
                    <text x={24} y={58} fill="#cbd5e1" style={{ fontSize: 13 }}>
                      {`MinPts = ${minPts} → ${isCore ? "CORE" : "NOT CORE"}`}
                    </text>
                  </g>
                )}

                {/* Noise highlight panel */}
                {(step === "noise") && (
                  <>
                    <circle
                      cx={noiseCandidate.x}
                      cy={noiseCandidate.y}
                      r={epsilon}
                      fill="none"
                      stroke={NOISE_COLOR}
                      strokeDasharray="6,6"
                      opacity="0.5"
                    />
                    <g>
                      <rect x={12} y={12} width={270} height={64} fill="rgba(0,0,0,0.35)" rx="8" />
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
          </div>

          {/* Right: parameters + legend + quick notes */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div className="card">
              <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "#1e293b", marginBottom: 8 }}>Parameters</div>
              <div style={{ color: "#1e293b", fontSize: ".95rem" }}>
                <div><span className="label">ε (walking distance):</span> <span style={{ color: "#3b82f6" }}>{epsilon}</span></div>
                <div style={{ marginTop: 6 }}><span className="label">MinPts (people needed):</span> <span style={{ color: "#10b981" }}>{minPts}</span></div>
                <p className="muted" style={{ marginTop: 8 }}>
                  DBSCAN forms a cluster only from <strong>CORE</strong> points (enough neighbors within ε). Border points are near a cluster but not dense themselves. Others are noise.
                </p>
              </div>
            </div>

            <div className="card">
              <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "#1e293b", marginBottom: 8 }}>Legend</div>
              <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", rowGap: 6, columnGap: 10, color: "#1e293b" }}>
                <div style={{ width: 14, height: 14, background: COLORS[1], borderRadius: "50%" }} />
                <div>Candidate point</div>
                <div style={{ width: 14, height: 14, background: COLORS[2], borderRadius: "50%" }} />
                <div>Neighbors (within ε)</div>
                <div style={{ width: 14, height: 14, background: COLORS[3], borderRadius: "50%" }} />
                <div>Growing cluster (expand)</div>
                <div style={{ width: 14, height: 14, background: NOISE_COLOR, borderRadius: "50%" }} />
                <div>Noise (too few neighbors)</div>
              </div>
            </div>

            <div className="card">
              <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "#1e293b", marginBottom: 8 }}>Tip</div>
              <p style={{ color: "#334155", fontSize: ".95rem", margin: 0 }}>
                Think of ε as your <em>comfortable walking distance</em>. If enough friends are close (≥ MinPts), you become a <strong>core</strong> person and the party naturally expands as friends bring friends.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DBSCANExplain;