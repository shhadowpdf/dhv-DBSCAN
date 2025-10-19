import React, { useState, useMemo } from 'react';
import './App.css';

// --- Constants ---
const SVG_WIDTH = 800; // Increased SVG width
const SVG_HEIGHT = 500; // Increased SVG height
const POINT_RADIUS = 6;
const HOVER_RADIUS_INCREASE = 3;
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
const NOISE_COLOR = '#888'; // Slightly darker grey for noise
const BG_GRADIENT_START = '#282C34';
const BG_GRADIENT_END = '#1C1F26';

// --- Helper Functions (Same as before) ---

/**
 * Generates some sample data with distinct clusters and noise.
 */
function generateSampleData() {
  const data = [];
  // Cluster 1
  for (let i = 0; i < 60; i++) {
    data.push({
      x: Math.random() * 120 + 80,
      y: Math.random() * 120 + 80,
    });
  }
  // Cluster 2
  for (let i = 0; i < 60; i++) {
    data.push({
      x: Math.random() * 120 + 550,
      y: Math.random() * 120 + 300,
    });
  }
  // Cluster 3
  for (let i = 0; i < 40; i++) {
    data.push({
      x: Math.random() * 100 + 300,
      y: Math.random() * 100 + 150,
    });
  }
  // Noise
  for (let i = 0; i < 30; i++) {
    data.push({
      x: Math.random() * SVG_WIDTH,
      y: Math.random() * SVG_HEIGHT,
    });
  }
  // Add a unique ID to each point
  return data.map((d, i) => ({ ...d, id: i }));
}

/**
 * Calculates Euclidean distance between two points.
 */
function getDistance(p1, p2) {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

/**
 * Finds all points within epsilon distance of a given point.
 */
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

// --- DBSCAN Algorithm (Same as before) ---

/**
 * A simple implementation of the DBSCAN algorithm.
 * @param {Array} points - Array of {id, x, y} objects.
 * @param {number} epsilon - The radius to search for neighbors.
 * @param {number} minPts - The minimum number of points to form a cluster.
 * @returns {Array} The original points array, with 'cluster' and 'type' properties.
 */
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
      // Mark as noise (for now), might become a border point later
      point.type = 'noise';
    } else {
      // This is a core point, start a new cluster
      clusterId++;
      expandCluster(point, neighbors);
    }
  }

  // Final pass to ensure all unclustered points are noise
  for(const point of pointsWithCluster) {
    if(point.cluster === undefined) {
      point.type = 'noise';
    }
  }


  return pointsWithCluster;
}

// --- React Component ---

export default function App() {
  const [epsilon, setEpsilon] = useState(60); // Default adjusted for new data
  const [minPts, setMinPts] = useState(5);    // Default adjusted for new data
  const [hoveredPointId, setHoveredPointId] = useState(null);

  // Generate initial data only once
  const [rawPoints] = useState(() => generateSampleData());

  // Re-run DBSCAN only when parameters or data change
  const clusteredPoints = useMemo(() => {
    return dbscan(rawPoints, epsilon, minPts);
  }, [rawPoints, epsilon, minPts]);

  // Get color based on cluster ID
  const getPointColor = (point) => {
    if (point.cluster === undefined || point.type === 'noise') return NOISE_COLOR;
    return COLORS[(point.cluster - 1) % COLORS.length]; // -1 because cluster IDs start from 1
  };
  
  const corePoints = clusteredPoints.filter(p => p.type === 'core').length;
  const borderPoints = clusteredPoints.filter(p => p.type === 'border' && p.cluster !== undefined).length;
  const noisePoints = clusteredPoints.filter(p => p.type === 'noise').length;
  const numClusters = new Set(clusteredPoints.filter(p => p.cluster !== undefined).map(p => p.cluster)).size;

  const hoveredPoint = hoveredPointId !== null ? clusteredPoints.find(p => p.id === hoveredPointId) : null;

  return (
    <div className="App">
      <div className="container">
        <h1>DBSCAN Algorithm Visualization</h1>
        
        <div className="controls-and-stats">
          <div className="controls">
            <div className="control-group">
              <label htmlFor="epsilon">Epsilon (ε): <span>{epsilon}</span></label>
              <input
                type="range"
                id="epsilon"
                min="10"
                max="150"
                step="1"
                value={epsilon}
                onChange={(e) => setEpsilon(Number(e.target.value))}
              />
            </div>
            <div className="control-group">
              <label htmlFor="minPts">MinPts: <span>{minPts}</span></label>
              <input
                type="range"
                id="minPts"
                min="2"
                max="25"
                step="1"
                value={minPts}
                onChange={(e) => setMinPts(Number(e.target.value))}
              />
            </div>
          </div>
          
          <div className="stats">
            <p><strong>Clusters:</strong> {numClusters}</p>
            <p><strong>Core:</strong> {corePoints}</p>
            <p><strong>Border:</strong> {borderPoints}</p>
            <p><strong>Noise:</strong> {noisePoints}</p>
          </div>
        </div>

        <svg
          width={SVG_WIDTH}
          height={SVG_HEIGHT}
          className="visualization-svg"
        >
          {/* Background Gradient */}
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


          {/* Epsilon radius for hovered point */}
          {hoveredPoint && (
            <>
              <circle
                cx={hoveredPoint.x}
                cy={hoveredPoint.y}
                r={epsilon}
                className="epsilon-circle"
                fill={getPointColor(hoveredPoint)}
                opacity="0.1"
              />
              <circle
                cx={hoveredPoint.x}
                cy={hoveredPoint.y}
                r={epsilon}
                className="epsilon-circle-stroke"
                stroke={getPointColor(hoveredPoint)}
                opacity="0.4"
              />
            </>
          )}

          {/* Data Points */}
          {clusteredPoints.map((point) => (
            <circle
              key={point.id}
              cx={point.x}
              cy={point.y}
              r={hoveredPointId === point.id ? SELECTED_POINT_RADIUS : POINT_RADIUS}
              fill={getPointColor(point)}
              className={`point ${point.type || 'noise'}`}
              onMouseEnter={() => setHoveredPointId(point.id)}
              onMouseLeave={() => setHoveredPointId(null)}
              filter={point.type === 'core' ? 'url(#glow)' : ''}
              stroke={point.type === 'core' ? getPointColor(point) : 'none'}
              strokeWidth={point.type === 'core' ? '1.5' : '0'}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}