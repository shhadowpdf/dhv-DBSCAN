import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Plus, Minus, Zap } from 'lucide-react';

function LiveClusteringPage() {
  const canvasRef = useRef(null);
  const [points, setPoints] = useState([]);
  const [epsilon, setEpsilon] = useState(50);
  const [minPts, setMinPts] = useState(4);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1000);
  const [currentStep, setCurrentStep] = useState(0);
  const [clusters, setClusters] = useState([]);
  const [visitedPoints, setVisitedPoints] = useState(new Set());
  const [currentPoint, setCurrentPoint] = useState(null);
  const [neighbors, setNeighbors] = useState([]);
  const [stats, setStats] = useState({ clusters: 0, noise: 0, processed: 0 });
  const animationRef = useRef(null);
  const pointsRef = useRef([]);

  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788'
  ];

  useEffect(() => {
    generateRandomPoints();
  }, []);

  useEffect(() => {
    pointsRef.current = points;
    drawCanvas();
  }, [points, clusters, currentPoint, neighbors, visitedPoints, epsilon]);

  const generateRandomPoints = () => {
    const newPoints = [];
    const numClusters = 3;
    const pointsPerCluster = 20;

    // Generate clustered points
    for (let i = 0; i < numClusters; i++) {
      const centerX = 150 + Math.random() * 500;
      const centerY = 150 + Math.random() * 300;
      
      for (let j = 0; j < pointsPerCluster; j++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 60;
        newPoints.push({
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
          id: newPoints.length,
          cluster: -1,
          visited: false,
          isCore: false,
          isBorder: false,
          isNoise: false
        });
      }
    }

    // Add some noise points
    for (let i = 0; i < 10; i++) {
      newPoints.push({
        x: 100 + Math.random() * 600,
        y: 100 + Math.random() * 400,
        id: newPoints.length,
        cluster: -1,
        visited: false,
        isCore: false,
        isBorder: false,
        isNoise: false
      });
    }

    setPoints(newPoints);
    pointsRef.current = newPoints;
    resetClustering();
  };

  const resetClustering = () => {
    setIsAnimating(false);
    setCurrentStep(0);
    setClusters([]);
    setVisitedPoints(new Set());
    setCurrentPoint(null);
    setNeighbors([]);
    setStats({ clusters: 0, noise: 0, processed: 0 });
    if (animationRef.current) {
      clearTimeout(animationRef.current);
      animationRef.current = null;
    }
    setPoints(prev => prev.map(p => ({
      ...p,
      cluster: -1,
      visited: false,
      isCore: false,
      isBorder: false,
      isNoise: false
    })));
  };

  const distance = (p1, p2) => {
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
  };

  const getNeighbors = (point, pointsList) => {
    return pointsList.filter(p => p.id !== point.id && distance(point, p) <= epsilon);
  };

  const runDBSCAN = () => {
    setIsAnimating(true);
    const pointsCopy = JSON.parse(JSON.stringify(pointsRef.current));
    let clusterId = 0;
    const visited = new Set();
    
    const processQueue = (queue, currentClusterId, callback) => {
      if (queue.length === 0) {
        callback();
        return;
      }

      const currentIdx = queue.shift();
      
      if (visited.has(currentIdx)) {
        processQueue(queue, currentClusterId, callback);
        return;
      }

      visited.add(currentIdx);
      const current = pointsCopy[currentIdx];
      current.visited = true;
      
      setCurrentPoint(currentIdx);
      setVisitedPoints(new Set(visited));

      const currentNeighbors = getNeighbors(current, pointsCopy);
      setNeighbors(currentNeighbors.map(n => n.id));

      if (currentNeighbors.length >= minPts) {
        current.isCore = true;
        
        currentNeighbors.forEach(n => {
          if (pointsCopy[n.id].cluster === -1) {
            pointsCopy[n.id].cluster = currentClusterId;
          }
          if (!visited.has(n.id)) {
            queue.push(n.id);
          }
        });
      } else if (current.cluster !== -1) {
        current.isBorder = true;
      }

      setPoints([...pointsCopy]);
      setStats(prev => ({ ...prev, processed: visited.size }));

      animationRef.current = setTimeout(() => {
        processQueue(queue, currentClusterId, callback);
      }, animationSpeed / 2);
    };

    const processNextPoint = (pointIndex) => {
      // Find next unvisited point
      while (pointIndex < pointsCopy.length && visited.has(pointIndex)) {
        pointIndex++;
      }

      if (pointIndex >= pointsCopy.length) {
        // Mark remaining unvisited points as noise
        pointsCopy.forEach(p => {
          if (p.cluster === -1) {
            p.isNoise = true;
          }
        });
        setPoints([...pointsCopy]);
        setStats(prev => ({
          ...prev,
          clusters: clusterId,
          noise: pointsCopy.filter(p => p.isNoise).length
        }));
        setIsAnimating(false);
        setCurrentPoint(null);
        setNeighbors([]);
        return;
      }

      const point = pointsCopy[pointIndex];
      visited.add(pointIndex);
      point.visited = true;
      
      setCurrentPoint(pointIndex);
      setVisitedPoints(new Set(visited));

      const pointNeighbors = getNeighbors(point, pointsCopy);
      setNeighbors(pointNeighbors.map(n => n.id));

      if (pointNeighbors.length < minPts) {
        // Not enough neighbors - mark as potential noise
        point.cluster = -1;
        setPoints([...pointsCopy]);
        setStats(prev => ({ ...prev, processed: visited.size }));
        
        animationRef.current = setTimeout(() => {
          processNextPoint(pointIndex + 1);
        }, animationSpeed);
      } else {
        // Core point - start cluster expansion
        point.isCore = true;
        point.cluster = clusterId;
        
        const queue = pointNeighbors.map(n => n.id);
        pointNeighbors.forEach(n => {
          if (pointsCopy[n.id].cluster === -1) {
            pointsCopy[n.id].cluster = clusterId;
          }
        });
        
        setPoints([...pointsCopy]);
        setStats(prev => ({ ...prev, processed: visited.size, clusters: clusterId + 1 }));

        animationRef.current = setTimeout(() => {
          processQueue(queue, clusterId, () => {
            clusterId++;
            animationRef.current = setTimeout(() => {
              processNextPoint(pointIndex + 1);
            }, animationSpeed);
          });
        }, animationSpeed);
      }
    };

    processNextPoint(0);
  };

  const toggleAnimation = () => {
    if (isAnimating) {
      setIsAnimating(false);
      if (animationRef.current) {
        clearTimeout(animationRef.current);
        animationRef.current = null;
      }
    } else {
      resetClustering();
      setTimeout(runDBSCAN, 100);
    }
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw epsilon radius around current point
    if (currentPoint !== null) {
      const point = points[currentPoint];
      ctx.beginPath();
      ctx.arc(point.x, point.y, epsilon, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = 'rgba(255, 215, 0, 0.1)';
      ctx.fill();
    }

    // Draw lines to neighbors
    if (currentPoint !== null && neighbors.length > 0) {
      const point = points[currentPoint];
      neighbors.forEach(nId => {
        const neighbor = points[nId];
        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
        ctx.lineTo(neighbor.x, neighbor.y);
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    }

    // Draw points
    points.forEach((point, idx) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);

      if (idx === currentPoint) {
        ctx.fillStyle = '#FFD700';
        ctx.arc(point.x, point.y, 10, 0, Math.PI * 2);
      } else if (point.isNoise) {
        ctx.fillStyle = '#808080';
      } else if (point.cluster >= 0) {
        ctx.fillStyle = colors[point.cluster % colors.length];
      } else if (visitedPoints.has(idx)) {
        ctx.fillStyle = '#CCCCCC';
      } else {
        ctx.fillStyle = '#E0E0E0';
      }

      ctx.fill();

      // Draw border for core and border points
      if (point.isCore) {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (point.isBorder) {
        ctx.strokeStyle = '#666666';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Highlight neighbors
      if (neighbors.includes(idx)) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 8, 0, Math.PI * 2);
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });
  };

  const handleCanvasClick = (e) => {
    if (isAnimating) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newPoint = {
      x,
      y,
      id: points.length,
      cluster: -1,
      visited: false,
      isCore: false,
      isBorder: false,
      isNoise: false
    };

    setPoints([...points, newPoint]);
    pointsRef.current = [...points, newPoint];
    resetClustering();
  };

  return (
    <div className="min-h-screen bg-white p-5">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid gap-5" style={{ gridTemplateColumns: '1fr 350px' }}>
          <div className="bg-white rounded-2xl p-5 shadow-2xl">
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              onClick={handleCanvasClick}
              className={`border-2 border-slate-200 rounded-xl block w-full h-auto ${isAnimating?'cursor-not-allowed':'cursor-crosshair'}`}
            />
            <div className="mt-5 flex flex-wrap gap-3 items-center">
              <button
                onClick={toggleAnimation}
                className={`cursor-pointer px-6 py-3 rounded-lg font-light text-white flex items-center gap-2 transition ${isAnimating?'bg-red-500 hover:bg-red-600':'bg-green-500 hover:bg-green-600'}`}
              >
                {isAnimating ? <Pause size={20} /> : <Play size={20} />}
                {isAnimating ? 'Pause' : 'Start Clustering'}
              </button>
              <button
                onClick={resetClustering}
                disabled={isAnimating}
                className={`cursor-pointer px-6 py-3 rounded-lg font-light flex items-center gap-2 text-white transition ${isAnimating?'bg-slate-300 cursor-not-allowed':'bg-indigo-500 hover:bg-indigo-600'}`}
              >
                <RotateCcw size={20} />
                Reset
              </button>
              <button
                onClick={generateRandomPoints}
                disabled={isAnimating}
                className={`cursor-pointer px-6 py-3 rounded-lg font-light text-white transition ${isAnimating?'bg-slate-300 cursor-not-allowed':'bg-orange-500 hover:bg-orange-600'}`}
              >
                New Random Data
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-5">
            <div className="bg-white rounded-2xl p-5 shadow-2xl">
              <h3 className="text-slate-800 font-bold mb-5">Parameters</h3>
              <div className="mb-5">
                <label className="block mb-2 text-slate-600 font-semibold">Epsilon (ε): {epsilon}px</label>
                <input type="range" min="20" max="100" value={epsilon} onChange={(e)=>{setEpsilon(Number(e.target.value));resetClustering();}} disabled={isAnimating} className="w-full accent-indigo-500" />
                <p className="text-xs text-slate-500 mt-1">Maximum distance between points in a cluster</p>
              </div>
              <div className="mb-5">
                <label className="block mb-2 text-slate-600 font-semibold">MinPts: {minPts}</label>
                <input type="range" min="2" max="10" value={minPts} onChange={(e)=>{setMinPts(Number(e.target.value));resetClustering();}} disabled={isAnimating} className="w-full accent-indigo-500" />
                <p className="text-xs text-slate-500 mt-1">Minimum points to form a dense region</p>
              </div>
              <div>
                <label className="block mb-2 text-slate-600 font-semibold">Animation Speed</label>
                <input type="range" min="100" max="2000" value={animationSpeed} onChange={(e)=>setAnimationSpeed(Number(e.target.value))} className="w-full accent-indigo-500" />
                <div className="flex justify-between text-xs text-slate-500"><span>Slower</span><span>Faster</span></div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-2xl">
              <h3 className="text-slate-800 font-bold mb-5">Legend</h3>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3"><div className="w-5 h-5 rounded-full bg-yellow-400" /><span className="text-sm text-slate-600">Current Point</span></div>
                <div className="flex items-center gap-3"><div className="w-5 h-5 rounded-full bg-teal-400 border-2 border-black" /><span className="text-sm text-slate-600">Core Point</span></div>
                <div className="flex items-center gap-3"><div className="w-5 h-5 rounded-full bg-teal-400" /><span className="text-sm text-slate-600">Border Point</span></div>
                <div className="flex items-center gap-3"><div className="w-5 h-5 rounded-full bg-gray-500" /><span className="text-sm text-slate-600">Noise Point</span></div>
                <div className="flex items-center gap-3"><div className="w-5 h-5 rounded-full bg-gray-300" /><span className="text-sm text-slate-600">Unprocessed</span></div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-2xl">
              <h3 className="text-slate-800 font-bold mb-5">Statistics</h3>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between p-3 rounded-lg bg-indigo-50"><span className="text-indigo-900 font-semibold">Total Points:</span><span className="font-bold text-indigo-900">{points.length}</span></div>
                <div className="flex justify-between p-3 rounded-lg bg-green-100"><span className="text-green-900 font-semibold">Clusters Found:</span><span className="font-bold text-green-900">{stats.clusters}</span></div>
                <div className="flex justify-between p-3 rounded-lg bg-red-100"><span className="text-red-900 font-semibold">Noise Points:</span><span className="font-bold text-red-900">{stats.noise}</span></div>
                <div className="flex justify-between p-3 rounded-lg bg-yellow-100"><span className="text-yellow-900 font-semibold">Processed:</span><span className="font-bold text-yellow-900">{stats.processed} / {points.length}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LiveClusteringPage;