import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "motion/react";
import useGraphStore from "../../store/graphStore";

const GraphVisualizer = () => {
  const [startVertex, setStartVertex] = useState("A");
  const { algorithm } = useParams();
  const {
    nodes,
    edges,
    isDirected,
    isLarge,
    representationType,
    visitedNodes,
    currentNode,
    setGraphType,
    setGraphSize,
    generateGraph,
    startTraversal,
    pauseTraversal,
    resumeTraversal,
    speed,
    setSpeed,
    isPlaying,
    isPaused,
    currentAlgorithm,
    setCurrentAlgorithm,
    layoutType,
    setLayoutType,
    gridVariant,
    setGridVariant,
    parentNodes,
  } = useGraphStore();

  const [activeEdge, setActiveEdge] = useState(null);
  const [exploredEdges, setExploredEdges] = useState([]);
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    if (!currentAlgorithm) {
      generateGraph();
    }

    if (algorithm) {
      const formattedAlgo = algorithm
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      setCurrentAlgorithm(formattedAlgo);
    }
  }, [algorithm, currentAlgorithm]);

  useEffect(() => {
    if (algorithm) {
      const formattedAlgo = algorithm
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      setCurrentAlgorithm(formattedAlgo);
      generateGraph();
    }
  }, [algorithm]);

  const renderEdge = (edge, nodes, allEdges, type = "default") => {
    const sourceNode = nodes.find((n) => n.id === edge.source);
    const targetNode = nodes.find((n) => n.id === edge.target);

    if (!sourceNode || !targetNode) return null;

    const dx = targetNode.x - sourceNode.x;
    const dy = targetNode.y - sourceNode.y;
    const angle = Math.atan2(dy, dx);
    const nodeRadius = 24;

    const startX = sourceNode.x + nodeRadius * Math.cos(angle);
    const startY = sourceNode.y + nodeRadius * Math.sin(angle);
    const endX = targetNode.x - nodeRadius * Math.cos(angle);
    const endY = targetNode.y - nodeRadius * Math.sin(angle);

    const getEdgeColor = () => {
      switch (type) {
        case "examining":
          return "#60A5FA";
        case "tree":
          return "#FCD34D";
        case "visited":
          return "#10B981";
        default:
          return "#4B5563";
      }
    };

    const arrowProps = {
      length: 12,
      width: 8,
      angle: Math.PI / 6,
    };

    return (
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.line
          x1={startX}
          y1={startY}
          x2={endX}
          y2={endY}
          stroke={getEdgeColor()}
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5 }}
        />
        {isDirected && (
          <motion.polygon
            points={`
              ${endX},${endY}
              ${endX - arrowProps.length * Math.cos(angle - arrowProps.angle)},
              ${endY - arrowProps.length * Math.sin(angle - arrowProps.angle)}
              ${endX - arrowProps.length * Math.cos(angle + arrowProps.angle)},
              ${endY - arrowProps.length * Math.sin(angle + arrowProps.angle)}
            `}
            fill={getEdgeColor()}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          />
        )}
      </motion.g>
    );
  };

  const renderTraversalEdge = (sourceId, targetId) => {
    const sourceNode = nodes.find((n) => n.id === sourceId);
    const targetNode = nodes.find((n) => n.id === targetId);

    if (!sourceNode || !targetNode) return null;

    const nodeRadius = 24;
    const angle = Math.atan2(
      targetNode.y - sourceNode.y,
      targetNode.x - sourceNode.x
    );

    const startX = sourceNode.x + nodeRadius * Math.cos(angle);
    const startY = sourceNode.y + nodeRadius * Math.sin(angle);
    const endX = targetNode.x - nodeRadius * Math.cos(angle);
    const endY = targetNode.y - nodeRadius * Math.sin(angle);

    return (
      <motion.g key={`traversal-${sourceId}-${targetId}`}>
        <motion.path
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{
            pathLength: 1,
            opacity: 1,
            strokeWidth: [2, 4, 2],
          }}
          transition={{
            duration: 0.5,
            strokeWidth: { duration: 1, repeat: Infinity },
          }}
          d={`M ${startX} ${startY} L ${endX} ${endY}`}
          stroke="#FCD34D"
          strokeLinecap="round"
          fill="none"
        />
        {isDirected && (
          <motion.polygon
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              y: [0, -2, 0],
            }}
            transition={{
              duration: 0.3,
              delay: 0.2,
              y: { duration: 1, repeat: Infinity },
            }}
            points={`${endX},${endY} 
                    ${endX - 15 * Math.cos(angle - Math.PI / 6)},${
              endY - 15 * Math.sin(angle - Math.PI / 6)
            } 
                    ${endX - 15 * Math.cos(angle + Math.PI / 6)},${
              endY - 15 * Math.sin(angle + Math.PI / 6)
            }`}
            fill="#FCD34D"
          />
        )}
      </motion.g>
    );
  };

  const handleStart = () => {
    if (isPlaying) {
      pauseTraversal();
    } else if (isPaused) {
      resumeTraversal();
    } else {
      setExploredEdges([]);
      setAnimationComplete(false);
      const startNodeId = `node-${startVertex.charCodeAt(0) - 65}`;
      startTraversal(startNodeId);
    }
  };

  const handleGenerateNewGraph = () => {
    if (isPlaying || isPaused) {
      if (
        window.confirm(
          "Generating a new graph will reset the current traversal. Continue?"
        )
      ) {
        setActiveEdge(null);
        setExploredEdges([]);
        setAnimationComplete(false);
        generateGraph();
      }
    } else {
      generateGraph();
    }
  };

  const renderLogicalView = () => (
    <div className="flex items-center justify-center w-full h-full bg-slate-900 rounded-lg">
      <svg
        className="w-full h-full"
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Base edges */}
        {edges.map((edge) => renderEdge(edge, nodes, edges))}

        {/* Parent relationships */}
        {Object.entries(parentNodes).map(([child, parent]) =>
          renderTraversalEdge(parent, child)
        )}

        {/* Nodes */}
        {nodes.map((node) => (
          <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
            <circle
              r="24"
              className={`
                ${
                  currentNode === node.id ? "fill-yellow-500" : "fill-blue-500"
                } 
                ${visitedNodes.includes(node.id) ? "fill-green-500" : ""}
                ${node.label === startVertex ? "stroke-white stroke-2" : ""}
              `}
            />
            <text
              className="text-white font-bold text-base fill-white"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {node.label}
            </text>

            {parentNodes[node.id] && (
              <g transform="translate(0, -32)">
                <rect
                  x="-30"
                  y="-12"
                  width="60"
                  height="24"
                  rx="4"
                  className="fill-slate-700"
                />
                <text
                  className="text-xs fill-white"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  Parent:{" "}
                  {nodes.find((n) => n.id === parentNodes[node.id])?.label}
                </text>
              </g>
            )}
          </g>
        ))}

        {/* Mobile/Tablet Controls - Increased button size and text */}
        <g className="lg:hidden" transform="translate(400, 520)">
          <foreignObject x="-240" y="-60" width="480" height="120">
            <div className="flex items-center justify-center gap-6">
              <button
                onClick={handleStart}
                className={`px-5 py-4 text-4xl font-bold rounded-full shadow-xl transform hover:scale-105 transition-transform ${
                  isPlaying
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
                style={{ minWidth: "160px", minHeight: "80px" }}
              >
                {isPlaying ? "Pause" : isPaused ? "Resume" : "Start"}
              </button>
              <button
                onClick={handleGenerateNewGraph}
                className="px-5 py-4 text-3xl font-bold bg-blue-600 rounded-full shadow-xl hover:bg-blue-700 transform hover:scale-105 transition-transform"
                style={{ minWidth: "160px", minHeight: "80px" }}
              >
                New Graph
              </button>
            </div>
          </foreignObject>
        </g>
      </svg>
    </div>
  );

  const getNodeColor = (node) => {
    if (currentNode === node.id) return "#F59E0B";
    if (visitedNodes.includes(node.id)) return "#10B981";
    return "#3B82F6";
  };

  const renderGraph = () => {
    switch (representationType) {
      case "logical":
        return renderLogicalView();
      case "adjacencyList":
        return <div>Adjacency List View Coming Soon</div>;
      case "adjacencyMatrix":
        return <div>Adjacency Matrix View Coming Soon</div>;
      default:
        return null;
    }
  };

  const renderTraversalInfo = () => (
    <div className="w-64 p-4 mt-28 bg-slate-700">
      <h3 className="mb-4 text-lg font-bold text-blue-400">Traversal Info</h3>
      <div className="mb-6">
        <h4 className="mb-2 font-semibold text-gray-300 text-md">Steps:</h4>
        <div className="p-3 rounded bg-slate-800">
          <ol className="space-y-2 text-sm text-gray-300">
            {visitedNodes.map((nodeId, index) => (
              <motion.li
                key={nodeId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {`${index + 1}. Visit ${
                  nodes.find((n) => n.id === nodeId)?.label
                }`}
              </motion.li>
            ))}
          </ol>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="mb-2 font-semibold text-gray-300 text-md">
          Parent Relationships:
        </h4>
        <div className="p-3 rounded bg-slate-800">
          {Object.entries(parentNodes).map(([child, parent], index) => (
            <motion.div
              key={child}
              className="flex items-center gap-2 mb-1 text-sm text-gray-300"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <span>{nodes.find((n) => n.id === child)?.label}</span>
              <span className="text-gray-500">→</span>
              <span>{nodes.find((n) => n.id === parent)?.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col w-full h-full bg-slate-800">
      {/* Controls Header - Only visible on larger screens */}
      <div className="fixed right-0 z-40 p-2 sm:p-4 border-b shadow-lg top-16 left-0 md:left-64 bg-slate-800 border-slate-700 overflow-x-auto lg:block hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 py-2 mt-10">
          <h2 className="text-xl font-bold text-blue-400 capitalize">
            {algorithm?.replace("-", " ")}
          </h2>
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Add Start Vertex Selection */}
            <div className="flex items-center gap-2">
              <label className="text-gray-300">Start:</label>
              <div className="relative">
                <select
                  value={startVertex}
                  onChange={(e) => setStartVertex(e.target.value)}
                  className="px-3 py-1 text-white border rounded bg-slate-700 border-slate-600 appearance-none cursor-pointer pr-8 z-50"
                  style={{ position: "relative" }}
                >
                  {nodes.map((node) => (
                    <option key={node.id} value={node.label}>
                      {node.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-300">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a 1 1 0 01-1.414 0l-4-4a 1 1 0 010-1.414z"
                      clipRule="evenodd"
                      fillRule="evenodd"
                    ></path>
                  </svg>
                </div>
              </div>
            </div>

            {/* Graph Type */}
            <div className="flex items-center gap-2">
              <label className="text-gray-300">Type:</label>
              <div className="flex gap-3">
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    checked={!isDirected}
                    onChange={() => setGraphType(false)}
                    name="graphType"
                    className="text-blue-500"
                  />
                  <span className="text-gray-300 text-sm">Undirected</span>
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    checked={isDirected}
                    onChange={() => setGraphType(true)}
                    name="graphType"
                    className="text-blue-500"
                  />
                  <span className="text-gray-300 text-sm">Directed</span>
                </label>
              </div>
            </div>

            {/* Graph Size */}
            <div className="flex items-center gap-2">
              <label className="text-gray-300">Size:</label>
              <div className="flex gap-3">
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    checked={!isLarge}
                    onChange={() => setGraphSize(false)}
                    name="graphSize"
                    className="text-blue-500"
                  />
                  <span className="text-gray-300 text-sm">Small</span>
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    checked={isLarge}
                    onChange={() => setGraphSize(true)}
                    name="graphSize"
                    className="text-blue-500"
                  />
                  <span className="text-gray-300 text-sm">Large</span>
                </label>
              </div>
            </div>

            {/* Speed Control */}
            <div className="flex items-center gap-2">
              <label className="text-gray-300">Speed:</label>
              <input
                type="range"
                min="1"
                max="100"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-24"
              />
              <span className="w-8 text-center text-gray-300">{speed}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Small screen title bar */}
      <div className="fixed right-0 z-40 p-2 border-b shadow-lg top-16 left-0 md:left-64 bg-slate-800 border-slate-700 lg:hidden">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-blue-400 capitalize">
            {algorithm?.replace("-", " ")}
          </h2>
        </div>
      </div>

      {/* Content - Adjusted padding */}
      <div className="flex flex-col lg:flex-row flex-1 pt-24 lg:pt-28">
        {/* Graph Visualization Area - Made responsive */}
        <div className="flex-1 flex items-center justify-center p-2 sm:p-6 mx-2 sm:mx-4">
          {renderGraph()}
        </div>

        {/* Sidebar for Parent and Visited Nodes - Hide on smaller screens */}
        <div className="lg:w-64 p-4 bg-slate-700 hidden lg:block mt-20">
          <h3 className="mb-4 text-lg font-bold text-blue-400">
            Traversal Info
          </h3>

          {/* Algorithm Steps */}
          <div className="mb-6">
            <h4 className="mb-2 font-semibold text-gray-300 text-md">Steps:</h4>
            <div className="p-3 rounded bg-slate-800">
              <ol className="space-y-2 text-sm text-gray-300">
                {visitedNodes.map((nodeId, index) => (
                  <motion.li
                    key={nodeId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {`${index + 1}. Visit ${
                      nodes.find((n) => n.id === nodeId)?.label
                    }`}
                  </motion.li>
                ))}
              </ol>
            </div>
          </div>

          {/* Parent Relationships */}
          <div className="mb-6">
            <h4 className="mb-2 font-semibold text-gray-300 text-md">
              Parent Relationships:
            </h4>
            <div className="p-3 rounded bg-slate-800">
              {Object.entries(parentNodes).map(([child, parent], index) => (
                <motion.div
                  key={child}
                  className="flex items-center gap-2 mb-1 text-sm text-gray-300"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <span>{nodes.find((n) => n.id === child)?.label}</span>
                  <span className="text-gray-500">→</span>
                  <span>{nodes.find((n) => n.id === parent)?.label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Controls - Only visible on larger screens */}
      <div className="fixed bottom-0 right-0 z-40 p-2 sm:p-4 border-t shadow-lg left-0 md:left-64 bg-slate-800 border-slate-700 hidden lg:block">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Layout Controls */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-gray-300">Layout:</label>
              <div className="flex gap-3">
                {["circular", "grid", "random"].map((type) => (
                  <label key={type} className="flex items-center gap-1">
                    <input
                      type="radio"
                      checked={layoutType === type}
                      onChange={() => setLayoutType(type)}
                      name="layoutType"
                      className="text-blue-500"
                    />
                    <span className="text-gray-300 text-sm capitalize">
                      {type}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Grid Variant - Only show when grid layout is selected */}
            {layoutType === "grid" && (
              <div className="flex items-center gap-2">
                <label className="text-gray-300">Grid:</label>
                <div className="flex gap-2">
                  {["square", "hexagonal", "spiral"].map((variant) => (
                    <label key={variant} className="flex items-center gap-1">
                      <input
                        type="radio"
                        checked={gridVariant === variant}
                        onChange={() => setGridVariant(variant)}
                        name="gridVariant"
                        className="text-blue-500"
                      />
                      <span className="text-gray-300 text-sm capitalize">
                        {variant}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action buttons - moved to footer */}
          <div className="flex gap-2 ml-auto">
            <button
              onClick={handleGenerateNewGraph}
              className="px-4 py-2 text-base font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
            >
              New Graph
            </button>
            <button
              onClick={handleStart}
              className={`px-4 py-2 text-base font-medium text-white rounded ${
                isPlaying
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {isPlaying ? "Pause" : isPaused ? "Resume" : "Start"}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile-only settings (combined dropup menu) */}
      <div className="block lg:hidden fixed bottom-0 left-0 right-0 z-50 md:left-64">
        <details className="bg-slate-700 rounded-t-lg overflow-hidden">
          <summary className="p-4 font-bold text-blue-400 cursor-pointer text-lg border-t border-slate-600 flex items-center justify-between">
            <span>Settings & Info</span>
            <svg
              className="w-5 h-5 transform transition-transform duration-200"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </summary>
          <div className="p-4 bg-slate-700 max-h-[80vh] overflow-y-auto">
            {/* Graph & Layout Settings Section */}
            <div className="space-y-6">
              {/* Start Vertex Selection */}
              <div>
                <p className="font-semibold text-gray-300 mb-2 text-base">
                  Start Vertex
                </p>
                <div className="relative">
                  <select
                    value={startVertex}
                    onChange={(e) => setStartVertex(e.target.value)}
                    className="w-full px-4 py-3 text-white bg-slate-800 border border-slate-600 rounded appearance-none cursor-pointer text-lg"
                  >
                    {nodes.map((node) => (
                      <option key={node.id} value={node.label}>
                        {node.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Graph Type */}
              <div>
                <p className="font-semibold text-gray-300 mb-2 text-base">
                  Graph Type
                </p>
                <div className="flex gap-6">
                  {/* ...existing graph type radio buttons... */}
                </div>
              </div>

              {/* Graph Size */}
              <div>
                <p className="font-semibold text-gray-300 mb-2 text-base">
                  Graph Size
                </p>
                <div className="flex gap-6">
                  {/* ...existing graph size radio buttons... */}
                </div>
              </div>

              {/* Layout Type */}
              <div>
                <p className="font-semibold text-gray-300 mb-2 text-base">
                  Layout Type
                </p>
                <div className="flex flex-wrap gap-4">
                  {/* ...existing layout type radio buttons... */}
                </div>
              </div>

              {/* Grid Variant */}
              {layoutType === "grid" && (
                <div>
                  <p className="font-semibold text-gray-300 mb-2 text-base">
                    Grid Type
                  </p>
                  <div className="flex flex-wrap gap-4">
                    {/* ...existing grid variant radio buttons... */}
                  </div>
                </div>
              )}

              {/* Animation Speed */}
              <div>
                <p className="font-semibold text-gray-300 mb-2 text-base">
                  Animation Speed: {speed}%
                </p>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Traversal Info */}
              <div className="pt-4 border-t border-slate-600">
                <h3 className="font-semibold text-gray-300 mb-4 text-lg">
                  Traversal Info
                </h3>

                {/* Steps */}
                <div className="mb-4 bg-slate-800 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-300 mb-2">Steps:</h4>
                  <ol className="space-y-2 text-sm text-gray-300">
                    {visitedNodes.map((nodeId, index) => (
                      <li key={nodeId}>
                        {`${index + 1}. Visit ${
                          nodes.find((n) => n.id === nodeId)?.label
                        }`}
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Parent Relationships */}
                <div className="bg-slate-800 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-300 mb-2">
                    Parent Relationships:
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(parentNodes).map(([child, parent]) => (
                      <div
                        key={child}
                        className="flex items-center gap-2 text-sm text-gray-300"
                      >
                        <span>{nodes.find((n) => n.id === child)?.label}</span>
                        <span className="text-gray-500">→</span>
                        <span>{nodes.find((n) => n.id === parent)?.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
};

export default GraphVisualizer;

<style jsx global>{`
  select {
    -webkit-appearance: none;
    -moz-appearance: none;
    text-indent: 1px;
    text-overflow: "";
  }

  /* Fix for dropdown display on mobile */
  select option {
    position: relative;
    z-index: 9999;
    background-color: #334155; /* Matches slate-700 */
    color: white;
    padding: 8px;
  }
`}</style>;
