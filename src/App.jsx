import React, { useState, useMemo } from 'react';

// --- Constants ---
const SVG_WIDTH = 600;
const SVG_HEIGHT = 400;
const POINT_RADIUS = 3;
const HOVER_RADIUS_INCREASE = 2;
const SELECTED_POINT_RADIUS = POINT_RADIUS + HOVER_RADIUS_INCREASE;

// A more vibrant and modern color palette
const COLORS = [
  '#66D9EF', // Light Blue
  '#A6E22E', // Light Green
  '#FD971F', // Orange
  '#AE81FF', // Purple
  '#F92672', // Pink/Red
  '#E6DB74', // Yellow
  '#52607A', // Dark Blue-Grey
  '#75715E', // Grey
  '#273C4E', // Darker Blue-Grey
  '#48A9A6', // Teal
];
const NOISE_COLOR = '#888';
const BG_GRADIENT_START = '#282C34';
const BG_GRADIENT_END = '#1C1F26';

// Iris dataset
const irisData = [
  [5.1, 3.5, 1.4, 0.2], [4.9, 3.0, 1.4, 0.2], [4.7, 3.2, 1.3, 0.2], [4.6, 3.1, 1.5, 0.2],
  [5.0, 3.6, 1.4, 0.2], [5.4, 3.9, 1.7, 0.4], [4.6, 3.4, 1.4, 0.3], [5.0, 3.4, 1.5, 0.2],
  [4.4, 2.9, 1.4, 0.2], [4.9, 3.1, 1.5, 0.1], [5.4, 3.7, 1.5, 0.2], [4.8, 3.4, 1.6, 0.2],
  [4.8, 3.0, 1.4, 0.1], [4.3, 3.0, 1.1, 0.1], [5.8, 4.0, 1.2, 0.2], [5.7, 4.4, 1.5, 0.4],
  [5.4, 3.9, 1.3, 0.4], [5.1, 3.5, 1.4, 0.3], [5.7, 3.8, 1.7, 0.3], [5.1, 3.8, 1.5, 0.3],
  [7.0, 3.2, 4.7, 1.4], [6.4, 3.2, 4.5, 1.5], [6.9, 3.1, 4.9, 1.5], [5.5, 2.3, 4.0, 1.3],
  [6.5, 2.8, 4.6, 1.5], [5.7, 2.8, 4.5, 1.3], [6.3, 3.3, 4.7, 1.6], [4.9, 2.4, 3.3, 1.0],
  [6.6, 2.9, 4.6, 1.3], [5.2, 2.7, 3.9, 1.4], [5.0, 2.0, 3.5, 1.0], [5.9, 3.0, 4.2, 1.5],
  [6.0, 2.2, 4.0, 1.0], [6.1, 2.9, 4.7, 1.4], [5.6, 2.9, 3.6, 1.3], [6.7, 3.1, 4.4, 1.4],
  [5.6, 3.0, 4.5, 1.5], [5.8, 2.7, 4.1, 1.0], [6.2, 2.2, 4.5, 1.5], [5.6, 2.5, 3.9, 1.1],
  [6.3, 3.3, 6.0, 2.5], [5.8, 2.7, 5.1, 1.9], [7.1, 3.0, 5.9, 2.1], [6.3, 2.9, 5.6, 1.8],
  [6.5, 3.0, 5.8, 2.2], [7.6, 3.0, 6.6, 2.1], [4.9, 2.5, 4.5, 1.7], [7.3, 2.9, 6.3, 1.8],
  [6.7, 2.5, 5.8, 1.8], [7.2, 3.6, 6.1, 2.5], [6.5, 3.2, 5.1, 2.0], [6.4, 2.7, 5.3, 1.9],
  [6.8, 3.0, 5.5, 2.1], [5.7, 2.5, 5.0, 2.0], [5.8, 2.8, 5.1, 2.4], [6.4, 3.2, 5.3, 2.3],
  [6.5, 3.0, 5.5, 1.8], [7.7, 3.8, 6.7, 2.2], [7.7, 2.6, 6.9, 2.3], [6.0, 2.2, 5.0, 1.5],
  [6.9, 3.2, 5.7, 2.3], [5.6, 2.8, 4.9, 2.0], [7.7, 2.8, 6.7, 2.0], [6.3, 2.7, 4.9, 1.8],
  [6.7, 3.3, 5.7, 2.1], [7.2, 3.2, 6.0, 1.8], [6.2, 2.8, 4.8, 1.8], [6.1, 3.0, 4.9, 1.8],
  [6.4, 2.8, 5.6, 2.1], [7.2, 3.0, 5.8, 1.6], [7.4, 2.8, 6.1, 1.9], [7.9, 3.8, 6.4, 2.0],
  [6.4, 2.8, 5.6, 2.2], [6.3, 2.8, 5.1, 1.5], [6.1, 2.6, 5.6, 1.4], [7.7, 3.0, 6.1, 2.3],
  [6.3, 3.4, 5.6, 2.4], [6.4, 3.1, 5.5, 1.8], [6.0, 3.0, 4.8, 1.8], [6.9, 3.1, 5.4, 2.1],
];

// --- Helper Functions ---

function prepareIrisData() {
  const sepalLengths = irisData.map(d => d[0]);
  const sepalWidths = irisData.map(d => d[1]);
  
  const minX = Math.min(...sepalLengths);
  const maxX = Math.max(...sepalLengths);
  const minY = Math.min(...sepalWidths);
  const maxY = Math.max(...sepalWidths);
  
  const padding = 50;
  return irisData.map((point, i) => ({
    id: i,
    x: ((point[0] - minX) / (maxX - minX)) * (SVG_WIDTH - 2 * padding) + padding,
    y: SVG_HEIGHT - (((point[1] - minY) / (maxY - minY)) * (SVG_HEIGHT - 2 * padding) + padding),
    sepalLength: point[0],
    sepalWidth: point[1],
    petalLength: point[2],
    petalWidth: point[3],
  }));
}

function getDistance(p1, p2) {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
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
    if (point.visited) {
      continue;
    }
    point.visited = true;

    const neighbors = getNeighbors(pointsWithCluster, point, epsilon);

    if (neighbors.length < minPts) {
      point.type = 'noise';
    } else {
      clusterId++;
      expandCluster(point, neighbors);
    }
  }

  for(const point of pointsWithCluster) {
    if(point.cluster === undefined) {
      point.type = 'noise';
    }
  }

  return pointsWithCluster;
}

// --- React Component ---

const DBSCANViz = () => {
  const [eps, setEps] = useState(40);
  const [minPts, setMinPts] = useState(4);
  const [hoveredPointId, setHoveredPointId] = useState(null);

  const [rawPoints] = useState(() => prepareIrisData());

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

  return (
    <div>
      <style>{`
        body {
          margin: 0;
          padding: 0;
          background: #1e293b;
        }
      `}</style>
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '2rem',
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold', 
            marginBottom: '0.5rem',
            margin: '0 0 0.5rem 0'
          }}>
            DBSCAN Clustering Algorithm
          </h1>
          <p style={{ 
            color: '#94a3b8', 
            margin: 0
          }}>
            Interactive visualization using the Iris dataset
          </p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ 
            gridColumn: 'span 2',
            background: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ marginBottom: '1rem' }}>
              <h2 style={{ 
                fontSize: '1.5rem', 
                fontWeight: '600', 
                marginBottom: '0.5rem',
                margin: '0 0 0.5rem 0',
                color: '#1e293b'
              }}>
                Cluster Visualization
              </h2>
              <p style={{ 
                fontSize: '0.875rem', 
                color: '#64748b',
                margin: 0
              }}>
                Sepal Length vs Sepal Width
              </p>
            </div>
            
            <svg
              width={SVG_WIDTH}
              height={SVG_HEIGHT}
              style={{ display: 'block', margin: '0 auto' }}
            >
              <defs>
                <linearGradient id="svgBackgroundGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor: BG_GRADIENT_START, stopOpacity: 1}} />
                  <stop offset="100%" style={{stopColor: BG_GRADIENT_END, stopOpacity: 1}} />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <rect width="100%" height="100%" fill="url(#svgBackgroundGradient)" />

              {hoveredPoint && (
                <>
                  <circle
                    cx={hoveredPoint.x}
                    cy={hoveredPoint.y}
                    r={eps}
                    fill={getPointColor(hoveredPoint)}
                    opacity="0.1"
                  />
                  <circle
                    cx={hoveredPoint.x}
                    cy={hoveredPoint.y}
                    r={eps}
                    stroke={getPointColor(hoveredPoint)}
                    strokeDasharray="5,5"
                    fill="none"
                    opacity="0.4"
                  />
                </>
              )}

              {hoveredPoint && (
                <>
                  {getNeighbors(clusteredPoints, hoveredPoint, eps).map((neighbor) => (
                    <line
                      key={`line-${neighbor.id}`}
                      x1={hoveredPoint.x}
                      y1={hoveredPoint.y}
                      x2={neighbor.x}
                      y2={neighbor.y}
                      stroke={getPointColor(hoveredPoint)}
                      strokeWidth="1"
                      opacity="0.5"
                      // strokeDasharray="3,3"
                    />
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
                  filter=""
                  stroke={point.type === 'core' ? getPointColor(point) : 'none'}
                  strokeWidth={point.type === 'core' ? '1.5' : '0'}
                  style={{ cursor: 'pointer' }}
                />
              ))}
            </svg>

            {hoveredPoint && (
              <div style={{ 
                marginTop: '1rem', 
                padding: '0.75rem', 
                background: '#f1f5f9', 
                borderRadius: '8px',
                fontSize: '0.875rem',
                color: '#1e293b',
                textAlign: 'center'
              }}>
                <p style={{ fontWeight: '600', margin: '0 0 0.25rem 0' }}>Point #{hoveredPoint.id}</p>
                <p style={{ margin: '0.25rem 0' }}>Sepal Length: {hoveredPoint.sepalLength.toFixed(2)} cm</p>
                <p style={{ margin: '0.25rem 0' }}>Sepal Width: {hoveredPoint.sepalWidth.toFixed(2)} cm</p>
                <p style={{ margin: '0.25rem 0' }}>Type: <span style={{ fontWeight: '600' }}>{hoveredPoint.type.toUpperCase()}</span></p>
                {hoveredPoint.cluster !== undefined && <p style={{ margin: '0.25rem 0' }}>Cluster: {hoveredPoint.cluster}</p>}
                <p style={{ margin: '0.25rem 0' }}>Neighbors: {hoveredNeighbors} (MinPts: {minPts})</p>
              </div>
            )}

            <div style={{ 
              display: 'flex', 
              gap: '1rem', 
              marginTop: '1rem',
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}>
              {Array.from(new Set(clusteredPoints.map(p => p.cluster))).sort().map(c => {
                const count = clusteredPoints.filter(p => p.cluster === c).length;
                if (count === 0 || c === undefined) return null;
                return (
                  <div key={c} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div 
                      style={{ 
                        width: '16px', 
                        height: '16px', 
                        borderRadius: '50%',
                        backgroundColor: getPointColor({ cluster: c, type: 'core' })
                      }}
                    />
                    <span style={{ fontSize: '0.875rem', color: '#1e293b' }}>
                      Cluster {c} ({count})
                    </span>
                  </div>
                );
              })}
              {noisePoints > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div 
                    style={{ 
                      width: '16px', 
                      height: '16px', 
                      borderRadius: '50%',
                      backgroundColor: NOISE_COLOR
                    }}
                  />
                  <span style={{ fontSize: '0.875rem', color: '#1e293b' }}>
                    Noise ({noisePoints})
                  </span>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ 
              background: 'white',
              padding: '1.5rem',
              borderRadius: '12px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ 
                fontSize: '1.125rem', 
                fontWeight: '600', 
                marginBottom: '1rem',
                margin: '0 0 1rem 0',
                color: '#1e293b'
              }}>
                Parameters
              </h3>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  marginBottom: '0.5rem',
                  color: '#1e293b'
                }}>
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
                <p style={{ 
                  fontSize: '0.75rem', 
                  color: '#64748b',
                  marginTop: '0.25rem',
                  margin: '0.25rem 0 0 0'
                }}>
                  Maximum distance between two points to be neighbors
                </p>
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  marginBottom: '0.5rem',
                  color: '#1e293b'
                }}>
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
                <p style={{ 
                  fontSize: '0.75rem', 
                  color: '#64748b',
                  marginTop: '0.25rem',
                  margin: '0.25rem 0 0 0'
                }}>
                  Minimum points needed to form a dense region
                </p>
              </div>
            </div>

            <div style={{ 
              background: '#ffffffff',
              padding: '1.5rem',
              borderRadius: '12px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <div>
                  <h3 style={{ 
                    fontSize: '1.125rem', 
                    fontWeight: '600', 
                    marginBottom: '0.5rem',
                    margin: '0 0 0.8rem 0',
                    color: '#1e293b'
                  }}>
                    How DBSCAN Works
                  </h3>
                  <ul style={{ 
                    listStyleType: 'none',
                    fontSize: '0.875rem',
                    color: '#334155',
                    paddingLeft: '0.7rem',
                    margin: 0
                  }}>
                    <li style={{ marginBottom: '0.5rem' }}><strong>1. Select a point</strong> - Start with an unvisited point</li>
                    <li style={{ marginBottom: '0.5rem' }}><strong>2. Find neighbors</strong> - Get all points within ε distance</li>
                    <li style={{ marginBottom: '0.5rem' }}><strong>3. Core point?</strong> - If neighbors ≥ minPts, it's a core point</li>
                    <li style={{ marginBottom: '0.5rem' }}><strong>4. Expand cluster</strong> - Add neighbors and their neighbors recursively</li>
                    <li><strong>5. Mark noise</strong> - Points with few neighbors are noise</li>
                  </ul>
                </div>
              </div>
            </div>

            <div style={{ 
              background: 'white',
              padding: '1.5rem',
              borderRadius: '12px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ 
                fontSize: '1.125rem', 
                fontWeight: '600', 
                marginBottom: '0.5rem',
                margin: '0 0 0.5rem 0',
                color: '#1e293b'
              }}>
                Statistics
              </h3>
              <div style={{ fontSize: '0.875rem', color: '#1e293b' }}>
                <p style={{ margin: '0.5rem 0' }}>Total Points: <strong>{irisData.length}</strong></p>
                <p style={{ margin: '0.5rem 0' }}>Clusters Found: <strong>{numClusters}</strong></p>
                <p style={{ margin: '0.5rem 0' }}>Core Points: <strong>{corePoints}</strong></p>
                <p style={{ margin: '0.5rem 0' }}>Border Points: <strong>{borderPoints}</strong></p>
                <p style={{ margin: '0.5rem 0' }}>Noise Points: <strong>{noisePoints}</strong></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default DBSCANViz;