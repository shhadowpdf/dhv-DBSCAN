/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from 'react';
import './DBSCANExplain.css';

// Iris dataset - limited to 80 samples
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

const speciesNames = ['Setosa', 'Versicolor', 'Virginica'];

// Convert iris data to 2D visualization using petal length and petal width
const normalizeData = (data) => {
  const petalLengths = data.map(d => d[2]);
  const petalWidths = data.map(d => d[3]);
  
  const minLength = Math.min(...petalLengths);
  const maxLength = Math.max(...petalLengths);
  const minWidth = Math.min(...petalWidths);
  const maxWidth = Math.max(...petalWidths);
  
  return data.map((d, i) => ({
    x: ((d[2] - minLength) / (maxLength - minLength)) * 650 + 75,
    y: 550 - ((d[3] - minWidth) / (maxWidth - minWidth)) * 450 - 75,
    sepalLength: d[0],
    sepalWidth: d[1],
    petalLength: d[2],
    petalWidth: d[3],
    actualSpecies: speciesNames[d[4]],
    id: i,
    cluster: -1,
    type: 'unvisited',
    neighbors: []
  }));
};

function DBSCANExplain() {
  const [points, setPoints] = useState(normalizeData(irisRaw));
  const [epsilon, setEpsilon] = useState(50);
  const [minPts, setMinPts] = useState(4);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [clusterColors] = useState(['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']);
  const [explanation, setExplanation] = useState('Click "Start DBSCAN" to begin clustering');
  const [showTrueLabels, setShowTrueLabels] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(150);
  const canvasRef = useRef(null);

  // Calculate distance between two points
  const distance = (p1, p2) => {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  };

  // Find neighbors within epsilon
  const findNeighbors = (point, allPoints) => {
    return allPoints.filter(p => p.id !== point.id && distance(point, p) <= epsilon);
  };

  // DBSCAN Algorithm - Streamlined Version (Direct Clustering)
  const runDBSCAN = async () => {
    setIsAnimating(true);
    setShowTrueLabels(false);
    let currentPoints = normalizeData(irisRaw);
    let currentCluster = 0;

    setExplanation('🔍 Finding neighbors for all points...');
    
    // Pre-compute all neighbors (no animation for this step)
    for (let i = 0; i < currentPoints.length; i++) {
      currentPoints[i].neighbors = findNeighbors(currentPoints[i], currentPoints);
      // Classify as core or not
      if (currentPoints[i].neighbors.length >= minPts) {
        currentPoints[i].type = 'core';
      }
    }
    
    setPoints([...currentPoints]);
    await sleep(500);

    setExplanation('🌟 Building clusters from dense regions...');
    await sleep(500);

    // Build clusters directly - skip individual core point animation
    for (let point of currentPoints) {
      if (point.type === 'core' && point.cluster === -1) {
        // Start new cluster
        point.cluster = currentCluster;
        const queue = [point];

        while (queue.length > 0) {
          const current = queue.shift();
          setSelectedPoint(current);
          
          for (let neighbor of current.neighbors) {
            if (neighbor.cluster === -1) {
              neighbor.cluster = currentCluster;
              
              if (neighbor.type === 'core') {
                queue.push(neighbor);
              } else {
                neighbor.type = 'border';
              }
              
              setPoints([...currentPoints]);
              await sleep(animationSpeed);
            }
          }
        }
        
        currentCluster++;
        await sleep(300);
      }
    }

    setExplanation('🔴 Marking noise points...');
    await sleep(500);

    // Mark noise points
    for (let point of currentPoints) {
      if (point.cluster === -1) {
        point.type = 'noise';
      }
    }
    
    setPoints([...currentPoints]);
    await sleep(500);

    const clusterCount = currentCluster;
    const noiseCount = currentPoints.filter(p => p.type === 'noise').length;
    setExplanation(`✅ Complete! Found ${clusterCount} clusters and ${noiseCount} noise points. Toggle "Show True Labels" to compare!`);
    setIsAnimating(false);
    setSelectedPoint(null);
  };

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const resetClustering = () => {
    setPoints(normalizeData(irisRaw));
    setSelectedPoint(null);
    setShowTrueLabels(false);
    setExplanation('Click "Start DBSCAN" to begin clustering');
  };

  // Draw on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw axes labels
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('Petal Length (cm) →', 320, 590);
    ctx.save();
    ctx.translate(20, 300);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Petal Width (cm) →', 0, 0);
    ctx.restore();

    // Draw epsilon circle around selected point
    if (selectedPoint && !showTrueLabels) {
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.arc(selectedPoint.x, selectedPoint.y, epsilon, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw connections to neighbors being processed
      ctx.strokeStyle = '#fbbf2440';
      ctx.lineWidth = 1;
      selectedPoint.neighbors.forEach(neighbor => {
        if (neighbor.cluster === selectedPoint.cluster) {
          ctx.beginPath();
          ctx.moveTo(selectedPoint.x, selectedPoint.y);
          ctx.lineTo(neighbor.x, neighbor.y);
          ctx.stroke();
        }
      });
    }

    // Draw points
    points.forEach(point => {
      // Determine color based on mode
      let fillColor;
      if (showTrueLabels) {
        const speciesColors = ['#ef4444', '#3b82f6', '#10b981'];
        fillColor = speciesColors[speciesNames.indexOf(point.actualSpecies)];
      } else {
        if (point.cluster !== -1) {
          fillColor = clusterColors[point.cluster % clusterColors.length];
        } else if (point.type === 'noise') {
          fillColor = '#64748b';
        } else {
          fillColor = '#94a3b8';
        }
      }

      // Draw point
      ctx.beginPath();
      ctx.arc(point.x, point.y, 7, 0, 2 * Math.PI);
      ctx.fillStyle = fillColor;
      ctx.fill();

      // Highlight selected point
      if (selectedPoint && selectedPoint.id === point.id && !showTrueLabels) {
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    });
  }, [points, selectedPoint, epsilon, showTrueLabels, clusterColors]);

  return (
    <div className="app">
      <h1>🌸 DBSCAN Clustering on Iris Flowers</h1>
      <p className="subtitle">Visualizing how DBSCAN groups iris flowers by petal measurements</p>
      
      <div className="container">
        {/* Control Panel */}
        <div className="control-panel">
          <h2>Controls</h2>
          
          <div className="parameter">
            <label>
              Epsilon (ε) - Neighborhood Radius: {epsilon}
              <input
                type="range"
                min="20"
                max="100"
                value={epsilon}
                onChange={(e) => setEpsilon(Number(e.target.value))}
                disabled={isAnimating}
              />
            </label>
            <p className="help-text">How close flowers must be to be neighbors</p>
          </div>

          <div className="parameter">
            <label>
              MinPts - Minimum Points: {minPts}
              <input
                type="range"
                min="2"
                max="8"
                value={minPts}
                onChange={(e) => setMinPts(Number(e.target.value))}
                disabled={isAnimating}
              />
            </label>
            <p className="help-text">Min neighbors to form a cluster core</p>
          </div>

          <div className="parameter">
            <label>
              Animation Speed: {animationSpeed}ms
              <input
                type="range"
                min="50"
                max="500"
                step="50"
                value={animationSpeed}
                onChange={(e) => setAnimationSpeed(Number(e.target.value))}
                disabled={isAnimating}
              />
            </label>
            <p className="help-text">Faster ← → Slower</p>
          </div>

          <div className="buttons">
            <button onClick={runDBSCAN} disabled={isAnimating}>
              {isAnimating ? '⏸️ Animating...' : '▶️ Start DBSCAN'}
            </button>
            <button onClick={resetClustering} disabled={isAnimating}>
              🔄 Reset
            </button>
            <button 
              onClick={() => setShowTrueLabels(!showTrueLabels)}
              disabled={isAnimating}
              style={{ background: showTrueLabels ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}
            >
              {showTrueLabels ? '✓ True Labels' : '👁️ Show True Labels'}
            </button>
          </div>

          <div className="legend">
            <h3>{showTrueLabels ? 'Actual Species' : 'DBSCAN Results'}</h3>
            {showTrueLabels ? (
              <>
                <div className="legend-item">
                  <span className="dot" style={{ backgroundColor: '#ef4444' }}></span>
                  <span>Setosa</span>
                </div>
                <div className="legend-item">
                  <span className="dot" style={{ backgroundColor: '#3b82f6' }}></span>
                  <span>Versicolor</span>
                </div>
                <div className="legend-item">
                  <span className="dot" style={{ backgroundColor: '#10b981' }}></span>
                  <span>Virginica</span>
                </div>
              </>
            ) : (
              <>
                <div className="legend-item">
                  <span className="dot noise"></span>
                  <span>Noise/Outlier</span>
                </div>
                {[0, 1, 2, 3].map(i => (
                  <div className="legend-item" key={i}>
                    <span className="dot" style={{ backgroundColor: clusterColors[i] }}></span>
                    <span>Cluster {i + 1}</span>
                  </div>
                ))}
              </>
            )}
          </div>

          <div className="dataset-info">
            <h3>Dataset Info</h3>
            <p><strong>Flowers:</strong> 150 iris samples</p>
            <p><strong>X-axis:</strong> Petal Length</p>
            <p><strong>Y-axis:</strong> Petal Width</p>
            <p><strong>Species:</strong> Setosa, Versicolor, Virginica</p>
          </div>
        </div>

        {/* Visualization Canvas */}
        <div className="visualization">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            onClick={(e) => {
              if (showTrueLabels) return;
              const rect = canvasRef.current.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              
              const clicked = points.find(p => 
                Math.sqrt(Math.pow(p.x - x, 2) + Math.pow(p.y - y, 2)) < 10
              );
              
              if (clicked) setSelectedPoint(clicked);
            }}
          />
          
          {selectedPoint && (
            <div className="point-info">
              <h3>Flower #{selectedPoint.id + 1}</h3>
              <p><strong>Species:</strong> {selectedPoint.actualSpecies}</p>
              <p><strong>Petal Length:</strong> {selectedPoint.petalLength} cm</p>
              <p><strong>Petal Width:</strong> {selectedPoint.petalWidth} cm</p>
              <p><strong>Sepal Length:</strong> {selectedPoint.sepalLength} cm</p>
              <p><strong>Sepal Width:</strong> {selectedPoint.sepalWidth} cm</p>
              {!showTrueLabels && (
                <>
                  <hr style={{ margin: '10px 0', border: '1px solid #e5e7eb' }} />
                  <p><strong>Type:</strong> {selectedPoint.type}</p>
                  <p><strong>Neighbors:</strong> {selectedPoint.neighbors.length}</p>
                  {selectedPoint.cluster !== -1 && <p><strong>Cluster:</strong> {selectedPoint.cluster + 1}</p>}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Explanation Panel */}
      {/* How it Works */}
      <div className="how-it-works">
        <h2>📚 How DBSCAN Works (Simple Explanation)</h2>
        <div className="steps-grid">
          <div className="step-card">
            <h3>1️⃣ Find Neighbors</h3>
            <p>For each flower, count how many other flowers are within epsilon distance. These are its neighbors!</p>
          </div>
          <div className="step-card">
            <h3>2️⃣ Build Clusters</h3>
            <p>Start from flowers with enough neighbors (core points) and connect all nearby flowers to form clusters!</p>
          </div>
          <div className="step-card">
            <h3>3️⃣ Expand Clusters</h3>
            <p>Keep adding connected neighbors recursively until no more flowers can be added to the cluster!</p>
          </div>
          <div className="step-card">
            <h3>4️⃣ Find Outliers</h3>
            <p>Flowers that don't fit any cluster are marked as "noise" - they're unique outliers!</p>
          </div>
        </div>
      </div>

      <div className="about-iris">
        <h2>🌺 About the Iris Dataset</h2>
        <p>
          The Iris dataset contains measurements of 150 iris flowers from three species: <strong>Setosa</strong>, 
          <strong> Versicolor</strong>, and <strong>Virginica</strong>. Each flower has four features measured in centimeters: 
          sepal length, sepal width, petal length, and petal width. This visualization uses <strong>petal measurements</strong> 
          (length and width) to create a 2D plot where DBSCAN can discover natural groupings based on flower similarity.
        </p>
        <p>
          By comparing DBSCAN clusters with true species labels, you can see how well density-based clustering identifies 
          natural patterns in the data without being told the actual species names!
        </p>
      </div>
    </div>
  );
}

export default DBSCANExplain;
