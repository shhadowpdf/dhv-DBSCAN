import React, { useState, useMemo, useRef } from 'react';

// --- Constants ---
const SVG_WIDTH = 600;
const SVG_HEIGHT = 400;
const POINT_RADIUS = 3;
const HOVER_RADIUS_INCREASE = 2;
const SELECTED_POINT_RADIUS = POINT_RADIUS + HOVER_RADIUS_INCREASE;

// A more vibrant and modern color palette
const COLORS = [
  '#66D9EF', '#A6E22E', '#FD971F', '#AE81FF', '#F92672',
  '#E6DB74', '#52607A', '#75715E', '#273C4E', '#48A9A6',
];
const NOISE_COLOR = '#888';
const BG_GRADIENT_START = '#282C34';
const BG_GRADIENT_END = '#1C1F26';

// Best settings for Real Estate dataset
const BEST_EPS = 35;
const BEST_MIN_PTS = 5;

// Real Estate dataset: [Price (₹ lakhs), Area (sq ft), Bedrooms, Age (years)]


// --- Helper Functions ---
function scalePoints(dataArr) {
  // dataArr items are of shape: [price, area, bedrooms, age]
  const prices = dataArr.map(d => d[0]);
  const areas = dataArr.map(d => d[1]);

  const minX = Math.min(...prices);
  const maxX = Math.max(...prices);
  const minY = Math.min(...areas);
  const maxY = Math.max(...areas);

  const padding = 50;
  return dataArr.map((point, i) => ({
    id: i,
    x: ((point[0] - minX) / (maxX - minX || 1)) * (SVG_WIDTH - 2 * padding) + padding,
    y: SVG_HEIGHT - (((point[1] - minY) / (maxY - minY || 1)) * (SVG_HEIGHT - 2 * padding) + padding),
    price: point[0],
    area: point[1],
    bedrooms: point[2],
    age: point[3],
  }));
}

function getDistance(p1, p2) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.hypot(dx, dy);
}

function getNeighbors(points, point, epsilon) {
  const neighbors = [];
  for (const p of points) {
    if (point.id === p.id) continue;
    if (getDistance(point, p) < epsilon) {
      neighbors.push(p);
    }
  }
  return neighbors;
}

// --- Grid-based reduction to preserve spatial distribution ---
function reduceByGrid(dataArr, maxPoints = 400) {
  if (dataArr.length <= maxPoints) return dataArr;

  // Normalize to [0,1] for grid binning using price (x) and area (y)
  const px = dataArr.map(d => d[0]);
  const py = dataArr.map(d => d[1]);
  const minX = Math.min(...px), maxX = Math.max(...px);
  const minY = Math.min(...py), maxY = Math.max(...py);

  const gridSide = Math.ceil(Math.sqrt(maxPoints)); // gridSide^2 bins ~ maxPoints
  const bins = new Map();

  for (const row of dataArr) {
    const xn = (row[0] - minX) / (maxX - minX || 1);
    const yn = (row[1] - minY) / (maxY - minY || 1);
    const gx = Math.min(gridSide - 1, Math.max(0, Math.floor(xn * gridSide)));
    const gy = Math.min(gridSide - 1, Math.max(0, Math.floor(yn * gridSide)));
    const key = `${gx},${gy}`;
    if (!bins.has(key)) bins.set(key, []);
    bins.get(key).push(row);
  }

  // Representative: mean of each occupied bin
  const reduced = [];
  for (const [, rows] of bins.entries()) {
    const n = rows.length;
    const sum = rows.reduce((acc, r) => {
      acc[0] += r[0]; acc[1] += r[1]; acc[2] += (r[2] ?? 0); acc[3] += (r[3] ?? 0);
      return acc;
    }, [0,0,0,0]);
    reduced.push([sum[0]/n, sum[1]/n, sum[2]/n, sum[3]/n]);
  }
  return reduced;
}

// --- Minimal CSV parser (no external deps) ---
function parseCSV(text) {
  // Split into lines, handle simple quoted fields, trim blanks
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length === 0) return [];

  const first = lines[0];
  const hasHeader = /[a-zA-Z]/.test(first);
  const rows = lines.map(line => {
    // Very light CSV splitting (handles commas inside simple quotes)
    const result = [];
    let cur = '', inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        result.push(cur);
        cur = '';
      } else {
        cur += ch;
      }
    }
    result.push(cur);
    return result.map(s => s.trim());
  });

  if (hasHeader) {
    const header = rows[0].map(h => h.toLowerCase());
    const body = rows.slice(1);
    return { header, body };
  }
  return { header: null, body: rows };
}

function toDataArrayFromCSV({ header, body }) {
  // Try to map columns: price, area, bedrooms, age
  const idx = { price: 0, area: 1, bedrooms: 2, age: 3 };

  if (header) {
    const findIdx = (names) => {
      for (const n of names) {
        const i = header.indexOf(n);
        if (i >= 0) return i;
      }
      return -1;
    };
    const priceI = findIdx(['price','price_lakhs','price (₹ lakhs)','price_in_lakhs','cost','amount']);
    const areaI  = findIdx(['area','sqft','sq_ft','square_feet','squarefoot','size']);
    const bedI   = findIdx(['bedrooms','beds','bhk']);
    const ageI   = findIdx(['age','years','age_years','property_age']);

    if (priceI >= 0) idx.price = priceI;
    if (areaI  >= 0) idx.area = areaI;
    if (bedI   >= 0) idx.bedrooms = bedI;
    if (ageI   >= 0) idx.age = ageI;
  }

  const out = [];
  for (const row of body) {
    // Accept rows with at least 2 numeric columns
    const p = Number(row[idx.price]);
    const a = Number(row[idx.area]);
    const b = Number(row[idx.bedrooms] ?? 0);
    const g = Number(row[idx.age] ?? 0);
    if (Number.isFinite(p) && Number.isFinite(a)) {
      out.push([p, a, Number.isFinite(b) ? b : 0, Number.isFinite(g) ? g : 0]);
    }
  }
  return out;
}

function toDataArrayFromJSON(jsonVal) {
  // Accept:
  // 1) Array of objects with keys: price, area, bedrooms, age (case-insensitive)
  // 2) Array of arrays length >= 2 (we'll coerce to [p,a,b,a])
  if (!Array.isArray(jsonVal)) return [];
  const out = [];

  for (const item of jsonVal) {
    if (Array.isArray(item)) {
      const p = Number(item[0]);
      const a = Number(item[1]);
      const b = Number(item[2] ?? 0);
      const g = Number(item[3] ?? 0);
      if (Number.isFinite(p) && Number.isFinite(a)) {
        out.push([p, a, Number.isFinite(b) ? b : 0, Number.isFinite(g) ? g : 0]);
      }
    } else if (item && typeof item === 'object') {
      const keys = Object.keys(item).reduce((acc, k) => { acc[k.toLowerCase()] = k; return acc; }, {});
      const pick = (nameList) => {
        for (const n of nameList) if (keys[n] != null) return item[keys[n]];
        return undefined;
      };
      const p = Number(pick(['price','price_lakhs','price (₹ lakhs)','price_in_lakhs','cost','amount']));
      const a = Number(pick(['area','sqft','sq_ft','square_feet','squarefoot','size']));
      const b = Number(pick(['bedrooms','beds','bhk']));
      const g = Number(pick(['age','years','age_years','property_age']));
      if (Number.isFinite(p) && Number.isFinite(a)) {
        out.push([p, a, Number.isFinite(b) ? b : 0, Number.isFinite(g) ? g : 0]);
      }
    }
  }
  return out;
}

// --- DBSCAN Algorithm ---
function dbscan(points, epsilon, minPts) {
  const pointsWithCluster = points.map(p => ({ ...p, cluster: undefined, type: 'noise', visited: false }));
  let clusterId = 0;

  function expandCluster(point, neighbors) {
    point.cluster = clusterId;
    point.type = 'core';
    point.visited = true;

    let queue = [...neighbors];

    for (let i = 0; i < queue.length; i++) {
      const currentPoint = queue[i];

      if (!currentPoint.visited) {
        currentPoint.visited = true;
        const currentNeighbors = getNeighbors(pointsWithCluster, currentPoint, epsilon);

        if (currentNeighbors.length >= minPts) {
          queue = [...queue, ...currentNeighbors.filter(p => !p.visited)];
        }
      }

      if (currentPoint.cluster === undefined) {
        currentPoint.cluster = clusterId;
        currentPoint.type = (getNeighbors(pointsWithCluster, currentPoint, epsilon).length >= minPts) ? 'core' : 'border';
      }
    }
  }

  for (const point of pointsWithCluster) {
    if (point.visited) continue;
    point.visited = true;

    const neighbors = getNeighbors(pointsWithCluster, point, epsilon);

    if (neighbors.length < minPts) {
      point.type = 'noise';
    } else {
      clusterId++;
      expandCluster(point, neighbors);
    }
  }

  for (const point of pointsWithCluster) {
    if (point.cluster === undefined) point.type = 'noise';
  }

  return pointsWithCluster;
}

// --- React Component ---
const DBSCANViz = ({epsilon, minPt}) => {
  const [eps, setEps] = useState(epsilon);
  const [minPts, setMinPts] = useState(minPt);
  const [hoveredPointId, setHoveredPointId] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Upload-related state
  const [uploadedFileName, setUploadedFileName] = useState(null);
  const [useReduction, setUseReduction] = useState(true);
  const [maxPoints, setMaxPoints] = useState(400);
  const [parseError, setParseError] = useState(null);
  const fileInputRef = useRef(null);

  // Raw data (array of arrays: [price, area, bedrooms, age])
  const [rawData, setRawData] = useState(realEstateData);

  // Derived (reduced if enabled) data before scaling
  const reducedData = useMemo(() => {
    const base = rawData || [];
    if (useReduction) return reduceByGrid(base, Math.max(50, Math.min(5000, maxPoints)));
    return base;
  }, [rawData, useReduction, maxPoints]);

  // Scale into points for plotting
  const rawPoints = useMemo(() => {
    return scalePoints(reducedData);
  }, [reducedData]);

  const clusteredPoints = useMemo(() => {
    return dbscan(rawPoints, eps, minPts);
  }, [rawPoints, eps, minPts]);

  const getPointColor = (point) => {
    if (point.cluster === undefined || point.type === 'noise') return NOISE_COLOR;
    return COLORS[(point.cluster - 1) % COLORS.length];
  };

  const corePoints = clusteredPoints.filter(p => p.type === 'core').length;
  const borderPoints = clusteredPoints.filter(p => p.type === 'border' && p.cluster !== undefined).length;
  const noisePoints = clusteredPoints.filter(p => p.type === 'noise').length;
  const numClusters = new Set(clusteredPoints.filter(p => p.cluster !== undefined).map(p => p.cluster)).size;

  const hoveredPoint = hoveredPointId !== null ? clusteredPoints.find(p => p.id === hoveredPointId) : null;
  const hoveredNeighbors = hoveredPoint ? getNeighbors(clusteredPoints, hoveredPoint, eps).length : 0;

  const resetToDefaults = () => {
    setEps(BEST_EPS);
    setMinPts(BEST_MIN_PTS);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleWheel = (e) => {
    // e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prevZoom => Math.min(Math.max(prevZoom * delta, 0.5), 5));
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFileName(file.name);
    setParseError(null);

    try {
      const text = await file.text();
      let arr = [];

      if (file.name.toLowerCase().endsWith('.csv')) {
        const parsed = parseCSV(text);
        arr = toDataArrayFromCSV(parsed);
      } else if (file.name.toLowerCase().endsWith('.json')) {
        const json = JSON.parse(text);
        arr = toDataArrayFromJSON(json);
      } else {
        // Try CSV first; if fails, try JSON
        try {
          const parsed = parseCSV(text);
          arr = toDataArrayFromCSV(parsed);
          if (arr.length === 0) {
            const json = JSON.parse(text);
            arr = toDataArrayFromJSON(json);
          }
        } catch {
          const json = JSON.parse(text);
          arr = toDataArrayFromJSON(json);
        }
      }

      if (!arr || arr.length === 0) {
        throw new Error('No valid rows found. Expecting columns/fields for price and area at minimum.');
      }
      setRawData(arr);
      setZoom(1);
      setPan({ x: 0, y: 0 });
    } catch (err) {
      setParseError(err?.message || 'Failed to parse file. Ensure CSV/JSON with price and area columns.');
      // Revert file input so re-uploading the same file triggers change
      if (fileInputRef.current) fileInputRef.current.value = '';
      setUploadedFileName(null);
    }
  };

  const clearUpload = () => {
    setRawData(realEstateData);
    setUploadedFileName(null);
    setParseError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const originalCount = rawData.length;
  const reducedCount = reducedData.length;

  return (
    <div>
      <style>{`
        body { margin: 0; padding: 0; background: #1e293b; }
        .btn { padding: 0.5rem 1rem; border: none; border-radius: 6px; cursor: pointer; font-size: 0.875rem; font-weight: 500; }
        .btn-primary { background: #3b82f6; color: white; }
        .btn-muted { background: #64748b; color: white; }
        .btn-success { background: #10b981; color: white; }
        .btn-warn { background: #f59e0b; color: white; }
        .card { background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
        .label { display:block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem; color:#1e293b; }
        .muted { color: #64748b; font-size: 0.75rem; }
      `}</style>

      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: 'white', fontFamily: 'system-ui, -apple-system, sans-serif', padding: '2rem' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>
              DBSCAN Clustering Algorithm
            </h1>
            <p style={{ color: '#94a3b8', margin: 0 }}>
              Interactive visualization with upload & smart reduction
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {/* Left: Visualization */}
            <div className="card" style={{ gridColumn: 'span 2' }}>
              <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 600, margin: '0 0 0.5rem 0', color: '#1e293b' }}>
                    Cluster Visualization
                  </h2>
                  <p className="muted" style={{ margin: 0 }}>
                    Price (₹ lakhs) vs Area (sq ft) — Scroll to zoom, drag to pan
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button className="btn btn-primary" onClick={() => setZoom(z => Math.min(z * 1.2, 5))}>Zoom In</button>
                  <button className="btn btn-muted" onClick={() => setZoom(z => Math.max(z * 0.8, 0.5))}>Zoom Out</button>
                  <button className="btn btn-success" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}>Reset View</button>
                </div>
              </div>

              <div style={{ overflow: 'hidden', borderRadius: '8px' }}>
                <svg
                  width={SVG_WIDTH}
                  height={SVG_HEIGHT}
                  style={{ display: 'block', margin: '0 auto', cursor: isDragging ? 'grabbing' : 'grab' }}
                  onWheel={handleWheel}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  <defs>
                    <linearGradient id="svgBackgroundGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: BG_GRADIENT_START, stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: BG_GRADIENT_END, stopOpacity: 1 }} />
                    </linearGradient>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#svgBackgroundGradient)" />

                  <g transform={`translate(${SVG_WIDTH/2 + pan.x}, ${SVG_HEIGHT/2 + pan.y}) scale(${zoom}) translate(${-SVG_WIDTH/2}, ${-SVG_HEIGHT/2})`}>
                    {hoveredPoint && (
                      <>
                        <circle cx={hoveredPoint.x} cy={hoveredPoint.y} r={eps} fill={getPointColor(hoveredPoint)} opacity="0.1" />
                        <circle cx={hoveredPoint.x} cy={hoveredPoint.y} r={eps} stroke={getPointColor(hoveredPoint)} strokeDasharray="5,5" fill="none" opacity="0.4" />
                        {getNeighbors(clusteredPoints, hoveredPoint, eps).map((neighbor) => (
                          <line key={`line-${neighbor.id}`} x1={hoveredPoint.x} y1={hoveredPoint.y} x2={neighbor.x} y2={neighbor.y} stroke={getPointColor(hoveredPoint)} strokeWidth="1" opacity="0.5" />
                        ))}
                      </>
                    )}

                    {clusteredPoints.map((point) => (
                      <circle
                        key={point.id}
                        cx={point.x}
                        cy={point.y}
                        r={hoveredPointId === point.id ? SELECTED_POINT_RADIUS : POINT_RADIUS}
                        fill={getPointColor(point)}
                        onMouseEnter={() => setHoveredPointId(point.id)}
                        onMouseLeave={() => setHoveredPointId(null)}
                        stroke={point.type === 'core' ? getPointColor(point) : 'none'}
                        strokeWidth={point.type === 'core' ? '1.5' : '0'}
                        style={{ cursor: 'pointer' }}
                      />
                    ))}
                  </g>
                </svg>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                {Array.from(new Set(clusteredPoints.map(p => p.cluster))).sort().map(c => {
                  const count = clusteredPoints.filter(p => p.cluster === c).length;
                  if (count === 0 || c === undefined) return null;
                  return (
                    <div key={c} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: getPointColor({ cluster: c, type: 'core' }) }} />
                      <span style={{ fontSize: '0.875rem', color: '#1e293b' }}>
                        Cluster {c} ({count})
                      </span>
                    </div>
                  );
                })}
                {noisePoints > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: NOISE_COLOR }} />
                    <span style={{ fontSize: '0.875rem', color: '#1e293b' }}>
                      Noise ({noisePoints})
                    </span>
                  </div>
                )}
              </div>

              {hoveredPoint && (
                <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#f1f5f9', borderRadius: 8, fontSize: '0.875rem', color: '#1e293b', textAlign: 'center' }}>
                  <p style={{ fontWeight: 600, margin: '0 0 0.25rem 0' }}>Property #{hoveredPoint.id}</p>
                  <p style={{ margin: '0.25rem 0' }}>Price: ₹{hoveredPoint.price.toFixed(2)} lakhs</p>
                  <p style={{ margin: '0.25rem 0' }}>Area: {hoveredPoint.area.toFixed(2)} sq ft</p>
                  <p style={{ margin: '0.25rem 0' }}>Bedrooms: {hoveredPoint.bedrooms.toFixed(2)}</p>
                  <p style={{ margin: '0.25rem 0' }}>Age: {hoveredPoint.age.toFixed(2)} years</p>
                  <p style={{ margin: '0.25rem 0' }}>Type: <span style={{ fontWeight: 600 }}>{hoveredPoint.type.toUpperCase()}</span></p>
                  {hoveredPoint.cluster !== undefined && <p style={{ margin: '0.25rem 0' }}>Cluster: {hoveredPoint.cluster}</p>}
                  <p style={{ margin: '0.25rem 0' }}>Neighbors: {hoveredNeighbors} (MinPts: {minPts})</p>
                </div>
              )}
            </div>

            {/* Right: Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>


              {/* Parameters */}
              <div className="card">
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: '0 0 1rem 0', color: '#1e293b' }}>
                  Parameters
                </h3>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="label">
                    Epsilon (ε): <span style={{ color: '#3b82f6' }}>{eps.toFixed(0)}</span>
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="150"
                    step="5"
                    value={eps}
                    onChange={(e) => setEps(parseFloat(e.target.value))}
                    style={{ width: '100%' }}
                  />
                  <p className="muted" style={{ marginTop: '0.25rem' }}>
                    Maximum distance between two points to be neighbors
                  </p>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label className="label">
                    Min Points: <span style={{ color: '#10b981' }}>{minPts}</span>
                  </label>
                  <input
                    type="range"
                    min="2"
                    max="15"
                    step="1"
                    value={minPts}
                    onChange={(e) => setMinPts(parseInt(e.target.value))}
                    style={{ width: '100%' }}
                  />
                  <p className="muted" style={{ marginTop: '0.25rem' }}>
                    Minimum points needed to form a dense region
                  </p>
                </div>

                <button
                  className="btn btn-warn"
                  onClick={resetToDefaults}
                  onMouseOver={(e) => e.currentTarget.style.background = '#d97706'}
                  onMouseOut={(e) => e.currentTarget.style.background = '#f59e0b'}
                  style={{ width: '100%' }}
                >
                  🔄 Reset to Best Settings
                </button>
              </div>

              {/* Explainer */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: '0 0 0.8rem 0', color: '#1e293b' }}>
                      How DBSCAN Works
                    </h3>
                    <ul style={{ listStyleType: 'none', fontSize: '0.875rem', color: '#334155', paddingLeft: '0.7rem', margin: 0 }}>
                      <li style={{ marginBottom: '0.5rem' }}><strong>1. Select a point</strong> — Start with an unvisited point</li>
                      <li style={{ marginBottom: '0.5rem' }}><strong>2. Find neighbors</strong> — Get all points within ε distance</li>
                      <li style={{ marginBottom: '0.5rem' }}><strong>3. Core point?</strong> — If neighbors ≥ minPts, it's a core point</li>
                      <li style={{ marginBottom: '0.5rem' }}><strong>4. Expand cluster</strong> — Add neighbors and their neighbors recursively</li>
                      <li><strong>5. Mark noise</strong> — Points with few neighbors are noise</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="card">
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: '0 0 0.5rem 0', color: '#1e293b' }}>
                  Statistics
                </h3>
                <div style={{ fontSize: '0.875rem', color: '#1e293b' }}>
                  <p style={{ margin: '0.5rem 0' }}>Total Rows (current): <strong>{reducedCount}</strong> {useReduction && <span className="muted"> (from {originalCount})</span>}</p>
                  <p style={{ margin: '0.5rem 0' }}>Clusters Found: <strong>{numClusters}</strong></p>
                  <p style={{ margin: '0.5rem 0' }}>Core Points: <strong>{corePoints}</strong></p>
                  <p style={{ margin: '0.5rem 0' }}>Border Points: <strong>{borderPoints}</strong></p>
                  <p style={{ margin: '0.5rem 0' }}>Noise Points: <strong>{noisePoints}</strong></p>
                </div>
              </div>
                            {/* Upload Card */}
              <div className="card">
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: '0 0 1rem 0', color: '#1e293b' }}>
                  Upload Dataset
                </h3>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.json,text/csv,application/json"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                  <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()}>📤 Choose CSV/JSON</button>
                  <button className="btn btn-muted" onClick={clearUpload} disabled={!uploadedFileName}>
                    Reset to Sample
                  </button>
                </div>

                <div style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: '#1e293b' }}>
                  <p style={{ margin: '0.25rem 0' }}>
                    {uploadedFileName ? <><strong>File:</strong> {uploadedFileName}</> : 'Using built-in sample data'}
                  </p>
                  <p style={{ margin: '0.25rem 0' }}>
                    <strong>Rows:</strong> original {originalCount}{useReduction ? ` → reduced ${reducedCount}` : ''}
                  </p>
                  {parseError && (
                    <p style={{ margin: '0.25rem 0', color: '#b91c1c' }}>
                      ⚠️ {parseError}
                    </p>
                  )}
                  <p className="muted" style={{ margin: '0.25rem 0' }}>
                    CSV headers auto-map (price, area, bedrooms, age). JSON can be array of objects or 4-tuples.
                  </p>
                </div>

                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                  <label className="label">Reduction</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input type="checkbox" checked={useReduction} onChange={(e) => setUseReduction(e.target.checked)} />
                    <span style={{ color: '#1e293b', fontSize: '0.9rem' }}>Enable grid-based thinning for smoother visualization</span>
                  </div>
                  <div style={{ opacity: useReduction ? 1 : 0.5 }}>
                    <label className="label">
                      Target Max Points: <span style={{ color: '#3b82f6' }}>{maxPoints}</span>
                    </label>
                    <input
                      type="range"
                      min="50"
                      max="5000"
                      step="50"
                      value={maxPoints}
                      onChange={(e) => setMaxPoints(parseInt(e.target.value))}
                      style={{ width: '100%' }}
                      disabled={!useReduction}
                    />
                    <p className="muted" style={{ marginTop: '0.25rem' }}>
                      Uses a 2D grid to keep the distribution (not random sampling).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> 
    </div>
  );
};
export const realEstateData = [
  // --- Cluster 1: Budget Apartments (₹25-45 lakhs, 450-700 sq ft)
  [28, 480, 1, 22], [30, 520, 1, 20], [32, 550, 1, 18], [35, 600, 2, 19],
  [33, 570, 1, 21], [31, 540, 1, 23], [36, 620, 2, 17], [34, 590, 2, 20],
  [29, 500, 1, 24], [38, 650, 2, 16], [37, 630, 2, 18], [32, 560, 1, 22],
  [40, 680, 2, 15], [35, 610, 2, 19], [42, 700, 2, 14], [39, 660, 2, 17],
  [31, 530, 1, 21], [33, 580, 1, 20], [41, 690, 2, 15], [27, 470, 1, 25],

  // --- Cluster 2: Mid-Range Homes (₹80-120 lakhs, 1200-1600 sq ft)
  [85, 1250, 3, 12], [88, 1300, 3, 11], [92, 1350, 3, 10], [95, 1400, 3, 9],
  [98, 1450, 3, 8], [102, 1500, 3, 8], [90, 1320, 3, 11], [93, 1370, 3, 10],
  [87, 1280, 3, 12], [100, 1480, 3, 9], [105, 1530, 3, 7], [97, 1420, 3, 9],
  [91, 1340, 3, 10], [103, 1510, 3, 8], [96, 1410, 3, 9], [89, 1310, 3, 11],
  [108, 1560, 3, 7], [94, 1390, 3, 10], [110, 1580, 4, 7], [86, 1270, 3, 12],

  // --- Cluster 3: Premium Properties (₹180-280 lakhs, 2200-3200 sq ft)
  [185, 2250, 4, 6], [195, 2350, 4, 5], [205, 2450, 4, 5], [215, 2550, 4, 4],
  [225, 2650, 5, 4], [235, 2750, 5, 3], [245, 2850, 5, 3], [190, 2300, 4, 6],
  [200, 2400, 4, 5], [210, 2500, 4, 5], [220, 2600, 5, 4], [230, 2700, 5, 4],
  [240, 2800, 5, 3], [250, 2900, 5, 3], [260, 3000, 5, 2], [270, 3100, 5, 2],
  [180, 2200, 4, 7], [255, 2950, 5, 2], [265, 3050, 5, 2], [275, 3150, 5, 2],

  // --- Outliers/Noise
  [55, 900, 2, 28], [130, 1100, 2, 18], [48, 1400, 4, 5],
  [160, 2800, 5, 10], [70, 700, 1, 30], [145, 1800, 3, 15],
];
export default DBSCANViz;
