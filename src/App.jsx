import React, { useState } from "react";
import DBSCANViz, { realEstateData } from "./DBSCANViz.jsx";
import DBSCANExplain from "./DBSCANExplain.jsx";

export default function App() {
  const [epsilon, setEpsilon] = useState(35);
  const [minPts, setMinPts] = useState(5);
  const [showExplain, setShowExplain] = useState(true);

  return (
    <div style={{ padding: "20px", background: "#0f172a", color: "white", minHeight: "100vh" }}>
      <h1 style={{ textAlign: "center", color: "#60a5fa" }}>DBSCAN Visualization</h1>

      {/* sliders */}
      <div style={{ display: "flex", justifyContent: "center", gap: "20px", margin: "20px" }}>
        <div>
          <label>Epsilon: {epsilon}</label>
          <input
            type="range"
            min="10"
            max="100"
            value={epsilon}
            onChange={(e) => setEpsilon(Number(e.target.value))}
          />
        </div>

        <div>
          <label>MinPts: {minPts}</label>
          <input
            type="range"
            min="2"
            max="10"
            value={minPts}
            onChange={(e) => setMinPts(Number(e.target.value))}
          />
        </div>

        <button
          onClick={() => setShowExplain((s) => !s)}
          style={{
            padding: "8px 12px",
            borderRadius: "6px",
            background: "#3b82f6",
            border: "none",
            cursor: "pointer",
            color: "white",
            fontWeight: "bold",
          }}
        >
          {showExplain ? "Hide" : "Show"} Explainer
        </button>
      </div>

      {/* main visualization */}
      <DBSCANViz epsilon={epsilon} minPt={minPts} />

      {/* animated explanation */}
      {showExplain && (
        <div style={{ marginTop: "40px" }}>
          <DBSCANExplain initialData={realEstateData} epsilon={epsilon} minPts={minPts} />
        </div>
      )}
    </div>
  );
}
