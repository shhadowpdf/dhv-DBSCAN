import React, { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
/* ---------- datasets ---------- */

/* ---------- DBSCAN ---------- */
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
      if (labels[j] === -1) labels[j] = cid; // previously marked noise -> becomes border
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
/* ---------- shape generators ---------- */
function makeCircle(cx, cy, r, n, prefix = "") {
  return Array.from({ length: n }, (_, i) => {
    const a = Math.random() * Math.PI * 2;
    const rr = r * (0.7 + Math.random() * 0.4);
    return {
      id: `${prefix}${i}`,
      x: cx + Math.cos(a) * rr,
      y: cy + Math.sin(a) * rr,
    };
  });
}
function makeEllipse(cx, cy, rx, ry, n, prefix = "") {
  return Array.from({ length: n }, (_, i) => {
    const a = Math.random() * Math.PI * 2;
    const rr = 0.8 + Math.random() * 0.4;
    return {
      id: `${prefix}${i}`,
      x: cx + Math.cos(a) * rx * rr,
      y: cy + Math.sin(a) * ry * rr,
    };
  });
}
function makeLine(x1, y1, x2, y2, n, jitter = 2, prefix = "") {
  return Array.from({ length: n }, (_, i) => {
    const t = i / Math.max(1, n - 1);
    return {
      id: `${prefix}${i}`,
      x: x1 + (x2 - x1) * t + (Math.random() - 0.5) * jitter,
      y: y1 + (y2 - y1) * t + (Math.random() - 0.5) * jitter,
    };
  });
}
function makeCrescent(cx, cy, r1, r2, n, prefix = "") {
  const out = [];
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const rr = r1 + Math.random() * (r2 - r1);
    const x = cx + Math.cos(a) * rr;
    const y = cy + Math.sin(a) * rr;
    // remove some interior points to create a crescent-like shape
    if ((x - (cx + r1 * 0.35)) ** 2 + (y - cy) ** 2 > (r1 * 0.5) ** 2)
      out.push({ id: `${prefix}${i}`, x, y });
  }
  return out;
}

export default function TutorialVisual({ step = 0, profession = "Journalism" }) {
  const [epsCoord, setepsCoord] = useState(55);
  const [minPts, setminPts] = useState(6);
  const svgRef = useRef(null);

  const { baseData, colors } = useMemo(() => {
    const c1 = makeCircle(220, 160, 64, 18, "C1-");
    const c2 = makeEllipse(560, 120, 100, 42, 20, "C2-");
    const c3 = makeCrescent(420, 300, 48, 84, 18, "C3-");
    const c4 = makeLine(160, 320, 320, 380, 18, 12, "C4-");
    const data = [...c1, ...c2, ...c3, ...c4];
    for (let i = 0; i < 6; i++) {
      if (Math.random() < 0.5)
        data.push({
          id: `NOISE-${i}`,
          x: Math.random() * 880 + 10,
          y: Math.random() * 420 + 10,
        });
    }
    return {
      baseData: data,
      colors: [
        "#667eea",
        "#10b981",
        "#f59e0b",
        "#ef4444",
        "#7c3aed",
        "#06b6d4",
      ],
    };
  }, []);

  useEffect(() => {
    const W = 900;
    const H = 440;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const xScale = d3.scaleLinear().domain([0, W]).range([0, W]);
    const yScale = d3.scaleLinear().domain([0, H]).range([H, 0]);

    svg
      .append("rect")
      .attr("width", W)
      .attr("height", H)
      .attr("rx", 14)
      .attr("fill", "#f8fafc");

    let xLabel = "X-Axis",
      yLabel = "Y-Axis";
    if (profession === "Law") {
      xLabel = "Case Duration (days)";
      yLabel = "Case Complexity Score";
    } else if (profession === "Real Estate") {
      xLabel = "Property Size (sqft)";
      yLabel = "Property Price (₹)";
    } else {
      xLabel = "Article Word Count";
      yLabel = "Engagement Score";
    }

    svg
      .append("text")
      .attr("x", W / 2)
      .attr("y", H - 8)
      .attr("text-anchor", "middle")
      .attr("font-size", 13)
      .attr("fill", "#475569")
      .text(xLabel);

    svg
      .append("text")
      .attr("x", 22)
      .attr("y", H / 2)
      .attr("transform", `rotate(-90, 22, ${H / 2})`)
      .attr("text-anchor", "middle")
      .attr("font-size", 13)
      .attr("fill", "#475569")
      .text(yLabel);

    const data = baseData.map((d) => ({ ...d }));
    if (step >= 4) data.push({ id: "OUT-1", x: 800, y: 70 });

    const tooltip = d3
      .select("body")
      .append("div")
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

    function describePoint(d) {
      const entity =
        profession === "Law"
          ? "Case"
          : profession === "Real Estate"
          ? "Property"
          : "Article";
      const clusterText =
        d._label === undefined
          ? "—"
          : d._label === -1
          ? "Outlier"
          : `Cluster ${d._label + 1}`;
      return `<strong>${entity}</strong><br/>${clusterText}<br/>X: ${d.x.toFixed(
        1
      )} — Y: ${d.y.toFixed(1)}`;
    }

    const centers = [
      {
        x: d3.mean(baseData.slice(0, 18), (p) => p.x) || 120,
        y: d3.mean(baseData.slice(0, 18), (p) => p.y) || 140,
      },
      {
        x: d3.mean(baseData.slice(18, 38), (p) => p.x) || 420,
        y: d3.mean(baseData.slice(18, 38), (p) => p.y) || 120,
      },
      {
        x: d3.mean(baseData.slice(38, 56), (p) => p.x) || 640,
        y: d3.mean(baseData.slice(38, 56), (p) => p.y) || 320,
      },
      {
        x: d3.mean(baseData.slice(56, 74), (p) => p.x) || 220,
        y: d3.mean(baseData.slice(56, 74), (p) => p.y) || 320,
      },
    ];

    const group = svg
      .selectAll("g.pt")
      .data(data, (d) => d.id)
      .enter()
      .append("g")
      .attr("class", "pt")
      .attr("transform", (d) => `translate(${xScale(d.x)},${yScale(d.y)})`);

    group
      .append("circle")
      .attr("r", 0)
      .attr("fill", "#64748b")
      .attr("stroke", "white")
      .attr("stroke-width", 1.2)
      .style("cursor", "pointer")
      .on("mouseover", function (event, d) {
        d3.select(this)
          .transition()
          .duration(120)
          .attr("r", 12)
          .attr("stroke-width", 2);
        tooltip.transition().duration(120).style("opacity", 1);
        tooltip.html(describePoint(d));
      })
      .on("mousemove", (event) => {
        tooltip
          .style("left", event.pageX + 12 + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", function () {
        d3.select(this)
          .transition()
          .duration(120)
          .attr("r", 8)
          .attr("stroke-width", 1.2);
        tooltip.transition().duration(120).style("opacity", 0);
      });

    group.each(function (d, i) {
      const node = d3.select(this);
      const center = centers[i % centers.length];
      node.attr("transform", `translate(${center.x},${yScale(center.y)})`);
      const delay =
        (Math.abs(d.x - center.x) + Math.abs(d.y - center.y)) * 0.35 +
        Math.random() * 200;
      node
        .transition()
        .delay(delay)
        .duration(900)
        .attr("transform", `translate(${xScale(d.x)},${yScale(d.y)})`)
        .ease(d3.easeCubicOut);
      node
        .select("circle")
        .transition()
        .delay(delay)
        .duration(900)
        .attr("r", 8);
    });

    if (step === 2) {
      const example = data[Math.floor(data.length * 0.25)] || data[0];
      const epsR = 70;
      const epsG = svg.append("g").attr("class", "eps-group");
      epsG
        .append("circle")
        .attr("cx", xScale(example.x))
        .attr("cy", yScale(example.y))
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

      epsG
        .append("text")
        .attr("x", xScale(example.x))
        .attr("y", yScale(example.y) - epsR - 10)
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

    let labels = new Array(data.length).fill(-1);
    if (step >= 3) {
      labels = dbscan(data, epsCoord, minPts);
      for (let i = 0; i < data.length; i++) data[i]._label = labels[i];
    } else {
      for (let i = 0; i < data.length; i++) data[i]._label = undefined;
    }

    if (step >= 3) {
      const clusters = {};
      data.forEach((d, i) => {
        const l = labels[i];
        if (l === -1) return;
        clusters[l] = clusters[l] || [];
        clusters[l].push(d);
      });

      const clusterKeys = Object.keys(clusters)
        .map((k) => +k)
        .sort((a, b) => a - b);
      clusterKeys.forEach((ck, idx) => {
        const pts = clusters[ck];
        if (!pts || pts.length < 3) return;
        const hullPoints = d3.polygonHull(
          pts.map((p) => [xScale(p.x), yScale(p.y)])
        );
        if (!hullPoints) return;

        const hullPathGen = d3
          .line()
          .curve(d3.curveCatmullRomClosed.alpha(0.5));
        const path = svg
          .append("path")
          .attr("d", hullPathGen(hullPoints))
          .attr("fill", colors[idx % colors.length])
          .attr("fill-opacity", 0)
          .attr("stroke", colors[idx % colors.length])
          .attr("stroke-width", 2)
          .attr("opacity", 0.9);

        const len = path.node().getTotalLength();
        path
          .attr("stroke-dasharray", `${len} ${len}`)
          .attr("stroke-dashoffset", len)
          .transition()
          .duration(1200)
          .ease(d3.easeCubicOut)
          .attr("stroke-dashoffset", 0)
          .on("end", () =>
            path.transition().duration(900).attr("fill-opacity", 0.12)
          );

        const cx = d3.mean(pts, (p) => p.x);
        const cy = d3.mean(pts, (p) => p.y);
        svg
          .append("text")
          .attr("x", xScale(cx))
          .attr("y", yScale(cy) - 36)
          .attr("text-anchor", "middle")
          .attr("font-weight", 800)
          .attr("font-size", 14)
          .attr("fill", colors[idx % colors.length])
          .attr("opacity", 0)
          .text(`Cluster ${ck + 1}`)
          .transition()
          .delay(1000)
          .duration(600)
          .attr("opacity", 1);
      });

      svg
        .selectAll("g.pt")
        .select("circle")
        .transition()
        .delay((d, i) => 900 + (i % 8) * 30)
        .duration(700)
        .attr("fill", (d, i) => {
          const lab = d._label;
          if (lab === -1 || lab === undefined) return "#94a3b8";
          const idx = Object.keys(clusters).indexOf(String(lab));
          return colors[(idx === -1 ? lab : idx) % colors.length] ?? "#64748b";
        });
    }

    if (step >= 4) {
      const noisePts = data.filter((d) => d._label === -1);
      
      noisePts.forEach((n, idx) => {
        const nx = xScale(n.x);
        const ny = yScale(n.y);
        
        const pulse = svg
          .append("circle")
          .attr("cx", nx)
          .attr("cy", ny)
          .attr("r", 10)
          .attr("fill", "none")
          .attr("stroke", "#f97316")
          .attr("stroke-width", 2)
          .attr("opacity", 0);
        
        setTimeout(() => {
          (function repeat() {
            pulse
              .attr("r", 10)
              .attr("opacity", 0.95)
              .transition()
              .duration(900)
              .attr("r", 28)
              .attr("opacity", 0.15)
              .transition()
              .duration(900)
              .attr("r", 10)
              .attr("opacity", 0.9)
              .on("end", repeat);
          })();
        }, idx * 150);
        
        svg
          .append("circle")
          .attr("cx", nx)
          .attr("cy", ny)
          .attr("r", 8)
          .attr("fill", "#f97316")
          .attr("opacity", 0)
          .transition()
          .delay(idx * 150)
          .duration(700)
          .attr("opacity", 0.9)
          .attr("r", 11);
        
        if (idx === 0) {
          svg
            .append("text")
            .attr("x", nx + 18)
            .attr("y", ny - 8)
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
      });
    }

    svg
      .append("text")
      .attr("x", 18)
      .attr("y", 18)
      .attr("font-size", 12)
      .attr("fill", "#475569")
      .text(
        "Hover points to see details — clusters discovered via DBSCAN at Step 3."
      );

    return () => {
      tooltip.remove();
      svg.selectAll("*").interrupt();
      svg.selectAll("*").remove();
    };
  }, [step, profession, baseData, colors, epsCoord, minPts]);

  return (
    <div className="flex flex-col items-center">
      <svg
        ref={svgRef}
        width={900}
        height={440}
        className="rounded-xl shadow-lg bg-transparent"
      />
      {3 <= step && step !== 4 && (
        <div className="mt-5 flex gap-6 items-center">
          <label className="text-[13px] text-slate-700 flex items-center gap-3">
            ε (epsilon): {epsCoord}
            <input
              type="range"
              min="20"
              max="100"
              value={epsCoord}
              step="1"
              onChange={(e) => setepsCoord(+e.target.value)}
              className="accent-indigo-500 cursor-pointer"
            />
          </label>
          <label className="text-[13px] text-slate-700 flex items-center gap-3">
            minPts: {minPts}
            <input
              type="range"
              min="2"
              max="10"
              value={minPts}
              step="1"
              onChange={(e) => setminPts(+e.target.value)}
              className="accent-indigo-500 cursor-pointer"
            />
          </label>
        </div>
      )}
    </div>
  );
}