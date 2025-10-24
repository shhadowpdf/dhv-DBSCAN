import React, { useState } from "react";
import DBSCANViz, { realEstateData } from "./DBSCANViz.jsx";
import DBSCANExplain from "./DBSCANExplain.jsx";

export default function App() {
  const [epsilon, setEpsilon] = useState(35);
  const [minPts, setMinPts] = useState(5);
  const [showExplain, setShowExplain] = useState(true);

  return (
    <div style={{ padding: "20px", background: "#0f172a", color: "white", minHeight: "100vh" }}>

      

      {/* main visualization */}
      <DBSCANViz epsilon={epsilon} minPt={minPts} />

      {/* animated explanation */}
      {showExplain && (
        <div style={{ marginTop: "40px" }}>
          <DBSCANExplain epsilon={22} minPts={5} />
        </div>
      )}
    </div>
  );
}
