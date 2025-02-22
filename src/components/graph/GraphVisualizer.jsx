import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import useGraphStore from '../../store/graphStore'

const GraphVisualizer = () => {
  const { algorithm } = useParams()
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
    setRepresentation,
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
    setGridVariant
  } = useGraphStore()

  // Initialize on mount
  useEffect(() => {
    if (!currentAlgorithm) {
      generateGraph()
    }
    
    if (algorithm) {
      const formattedAlgo = algorithm.split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
      setCurrentAlgorithm(formattedAlgo)
    }
  }, [algorithm, currentAlgorithm])

  const renderEdge = (edge, nodes, allEdges) => {
    const sourceNode = nodes.find(n => n.id === edge.source)
    const targetNode = nodes.find(n => n.id === edge.target)
    
    if (!sourceNode || !targetNode) return null

    // Check if there's a reverse edge
    const hasReverseEdge = allEdges.some(e => 
      e.source === edge.target && e.target === edge.source
    )

    const nodeRadius = 24 // Base node radius
    const dx = targetNode.x - sourceNode.x
    const dy = targetNode.y - sourceNode.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    // Add padding to ensure arrows stay within bounds
    const padding = 20
    const boundedX1 = Math.max(padding, Math.min(800 - padding, sourceNode.x))
    const boundedY1 = Math.max(padding, Math.min(600 - padding, sourceNode.y))
    const boundedX2 = Math.max(padding, Math.min(800 - padding, targetNode.x))
    const boundedY2 = Math.max(padding, Math.min(600 - padding, targetNode.y))

    if (isDirected && hasReverseEdge) {
      // Draw curved path for bidirectional edges
      const curvature = Math.min(distance * 0.2, 40) // Reduced max curvature
      const angle = Math.atan2(boundedY2 - boundedY1, boundedX2 - boundedX1)
      const isForward = edge.source < edge.target

      // Calculate midpoint and control points
      const mx = (boundedX1 + boundedX2) / 2
      const my = (boundedY1 + boundedY2) / 2
      const perpX = -Math.sin(angle) * curvature
      const perpY = Math.cos(angle) * curvature
      const controlX = mx + (isForward ? perpX : -perpX)
      const controlY = my + (isForward ? perpY : -perpY)

      // Calculate arrow points with bounded coordinates
      const endAngle = Math.atan2(boundedY2 - controlY, boundedX2 - controlX)
      const arrowLength = 12 // Reduced arrow size
      const arrowWidth = 8 // Added arrow width control
      const arrowAngle = Math.atan2(arrowWidth, arrowLength)

      const endX = boundedX2 - nodeRadius * Math.cos(endAngle)
      const endY = boundedY2 - nodeRadius * Math.sin(endAngle)
      const startX = boundedX1 + nodeRadius * Math.cos(endAngle - Math.PI)
      const startY = boundedY1 + nodeRadius * Math.sin(endAngle - Math.PI)

      // Calculate arrow points
      const arrowPoint1X = endX - arrowLength * Math.cos(endAngle - arrowAngle)
      const arrowPoint1Y = endY - arrowLength * Math.sin(endAngle - arrowAngle)
      const arrowPoint2X = endX - arrowLength * Math.cos(endAngle + arrowAngle)
      const arrowPoint2Y = endY - arrowLength * Math.sin(endAngle + arrowAngle)

      return (
        <g key={edge.id}>
          <path
            d={`M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`}
            fill="none"
            stroke="#4B5563"
            strokeWidth="2"
          />
          <polygon
            points={`${endX},${endY} ${arrowPoint1X},${arrowPoint1Y} ${arrowPoint2X},${arrowPoint2Y}`}
            fill="#4B5563"
          />
          <text
            x={controlX}
            y={controlY}
            dy={isForward ? "-5" : "15"}
            fill="#9CA3AF"
            textAnchor="middle"
            fontSize="12"
          >
            {edge.weight}
          </text>
        </g>
      )
    }

    // Straight edge rendering with bounds checking
    const angle = Math.atan2(boundedY2 - boundedY1, boundedX2 - boundedX1)
    const startX = boundedX1 + nodeRadius * Math.cos(angle)
    const startY = boundedY1 + nodeRadius * Math.sin(angle)
    const endX = boundedX2 - nodeRadius * Math.cos(angle)
    const endY = boundedY2 - nodeRadius * Math.sin(angle)

    // Smaller arrow for straight edges
    const arrowLength = 12
    const arrowWidth = 8
    const arrowAngle = Math.atan2(arrowWidth, arrowLength)

    const arrowPoint1X = endX - arrowLength * Math.cos(angle - arrowAngle)
    const arrowPoint1Y = endY - arrowLength * Math.sin(angle - arrowAngle)
    const arrowPoint2X = endX - arrowLength * Math.cos(angle + arrowAngle)
    const arrowPoint2Y = endY - arrowLength * Math.sin(angle + arrowAngle)

    return (
      <g key={edge.id}>
        <line
          x1={startX}
          y1={startY}
          x2={endX}
          y2={endY}
          stroke={isDirected ? '#4B5563' : '#6B7280'}
          strokeWidth="2"
        />
        {isDirected && (
          <polygon
            points={`${endX},${endY} ${arrowPoint1X},${arrowPoint1Y} ${arrowPoint2X},${arrowPoint2Y}`}
            fill="#4B5563"
          />
        )}
        <text
          x={(startX + endX) / 2}
          y={(startY + endY) / 2}
          dy="-5"
          fill="#9CA3AF"
          textAnchor="middle"
          fontSize="12"
        >
          {edge.weight}
        </text>
      </g>
    )
  }

  // Add basic graph rendering
  const renderGraph = () => {
    switch(representationType) {
      case 'logical':
        return (
          <div className="flex items-center justify-center w-full h-[600px] bg-slate-900 rounded-lg relative">
            <svg className="absolute inset-0 w-full h-full">
              {edges.map(edge => renderEdge(edge, nodes, edges))}
            </svg>
            {nodes.map(node => (
              <motion.div
                key={node.id}
                className={`absolute w-12 h-12 flex items-center justify-center rounded-full 
                  ${currentNode === node.id ? 'bg-yellow-500' : 'bg-blue-500'} 
                  ${visitedNodes.includes(node.id) ? 'bg-green-500' : ''}`}
                style={{
                  left: node.x,
                  top: node.y,
                  transform: 'translate(-50%, -50%)', // Center the node
                  transition: 'background-color 0.3s'
                }}
              >
                <span className="text-lg font-bold text-white">{node.label}</span>
              </motion.div>
            ))}
          </div>
        )
      case 'adjacencyList':
        return <div>Adjacency List View Coming Soon</div>
      case 'adjacencyMatrix':
        return <div>Adjacency Matrix View Coming Soon</div>
      default:
        return null
    }
  }

  const handleStart = () => {
    if (isPlaying) {
      pauseTraversal()
    } else if (isPaused) {
      resumeTraversal()
    } else {
      startTraversal()
    }
  }

  return (
    <div className="flex flex-col w-full h-full bg-slate-800">
      {/* Controls Header - Simplified */}
      <div className="fixed right-0 z-40 p-4 border-b shadow-lg top-16 left-64 bg-slate-800 border-slate-700">
        <div className="flex items-center justify-between h-14">
          <h2 className="text-2xl font-bold text-blue-400 capitalize">
            {algorithm?.replace('-', ' ')}
          </h2>

          <div className="flex items-center gap-6">
            {/* Graph Type */}
            <div className="flex items-center gap-4">
              <label className="text-gray-300">Type:</label>
              <div className="flex gap-3">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={!isDirected}
                    onChange={() => setGraphType(false)}
                    name="graphType"
                    className="text-blue-500"
                  />
                  <span className="text-gray-300">Undirected</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={isDirected}
                    onChange={() => setGraphType(true)}
                    name="graphType"
                    className="text-blue-500"
                  />
                  <span className="text-gray-300">Directed</span>
                </label>
              </div>
            </div>

            {/* Graph Size */}
            <div className="flex items-center gap-4">
              <label className="text-gray-300">Size:</label>
              <div className="flex gap-3">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={!isLarge}
                    onChange={() => setGraphSize(false)}
                    name="graphSize"
                    className="text-blue-500"
                  />
                  <span className="text-gray-300">Small</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={isLarge}
                    onChange={() => setGraphSize(true)}
                    name="graphSize"
                    className="text-blue-500"
                  />
                  <span className="text-gray-300">Large</span>
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
              <span className="w-12 text-center text-gray-300">
                {speed}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Graph Visualization Area */}
      <div className="flex-1 p-6 mx-4 mt-28">
        {renderGraph()}
      </div>

      {/* Footer Controls - Updated */}
      <div className="fixed bottom-0 right-0 z-40 p-4 border-t shadow-lg left-64 bg-slate-800 border-slate-700">
        <div className="flex items-center justify-between">
          {/* Layout Controls */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <label className="text-gray-300">Layout:</label>
              <div className="flex gap-3">
                {['circular', 'grid', 'random'].map(type => (
                  <label key={type} className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={layoutType === type}
                      onChange={() => setLayoutType(type)}
                      name="layoutType"
                      className="text-blue-500"
                    />
                    <span className="text-gray-300 capitalize">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Grid Variant - Only show when grid layout is selected */}
            {layoutType === 'grid' && (
              <div className="flex items-center gap-4">
                <label className="text-gray-300">Grid Type:</label>
                <div className="flex gap-3">
                  {['square', 'hexagonal', 'spiral'].map(variant => (
                    <label key={variant} className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={gridVariant === variant}
                        onChange={() => setGridVariant(variant)}
                        name="gridVariant"
                        className="text-blue-500"
                      />
                      <span className="text-gray-300 capitalize">{variant}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={generateGraph}
              className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
            >
              Generate New Graph
            </button>
            <button
              onClick={handleStart}
              className={`px-4 py-2 text-white rounded ${
                isPlaying ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isPlaying ? 'Pause' : isPaused ? 'Resume' : 'Start'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GraphVisualizer
