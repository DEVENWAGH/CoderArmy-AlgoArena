import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from "motion/react"
import useGraphStore from '../../store/graphStore'

const GraphVisualizer = () => {
  const [startVertex, setStartVertex] = useState('A')
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
    setGridVariant,
    parentNodes,
    setParentNodes
  } = useGraphStore()

  // Add animation state
  const [activeEdge, setActiveEdge] = useState(null)
  const [exploredEdges, setExploredEdges] = useState([])
  const [animationComplete, setAnimationComplete] = useState(false)

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

  useEffect(() => {
    if (algorithm) {
      const formattedAlgo = algorithm.split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
      setCurrentAlgorithm(formattedAlgo)
      generateGraph() // Generate new graph when algorithm changes
    }
  }, [algorithm])

  const renderEdge = (edge, nodes, allEdges, type = 'default') => {
    const sourceNode = nodes.find(n => n.id === edge.source)
    const targetNode = nodes.find(n => n.id === edge.target)
    
    if (!sourceNode || !targetNode) return null

    // Calculate edge points
    const dx = targetNode.x - sourceNode.x
    const dy = targetNode.y - sourceNode.y
    const angle = Math.atan2(dy, dx)
    const nodeRadius = 24

    // Start and end points adjusted by node radius
    const startX = sourceNode.x + nodeRadius * Math.cos(angle)
    const startY = sourceNode.y + nodeRadius * Math.sin(angle)
    const endX = targetNode.x - nodeRadius * Math.cos(angle)
    const endY = targetNode.y - nodeRadius * Math.sin(angle)

    // Edge color based on type
    const getEdgeColor = () => {
      switch (type) {
        case 'examining': return '#60A5FA' // Blue
        case 'tree': return '#FCD34D'      // Yellow
        case 'visited': return '#10B981'    // Green
        default: return '#4B5563'          // Gray
      }
    }

    // Arrow configuration
    const arrowProps = {
      length: 12,
      width: 8,
      angle: Math.PI / 6
    }

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
    )
  }

  const renderTraversalEdge = (sourceId, targetId) => {
    const sourceNode = nodes.find(n => n.id === sourceId)
    const targetNode = nodes.find(n => n.id === targetId)
    
    if (!sourceNode || !targetNode) return null

    const nodeRadius = 24
    const angle = Math.atan2(targetNode.y - sourceNode.y, targetNode.x - sourceNode.x)
    
    const startX = sourceNode.x + nodeRadius * Math.cos(angle)
    const startY = sourceNode.y + nodeRadius * Math.sin(angle)
    const endX = targetNode.x - nodeRadius * Math.cos(angle)
    const endY = targetNode.y - nodeRadius * Math.sin(angle)

    return (
      <motion.g key={`traversal-${sourceId}-${targetId}`}>
        <motion.path
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ 
            pathLength: 1,
            opacity: 1,
            strokeWidth: [2, 4, 2]
          }}
          transition={{ 
            duration: 0.5,
            strokeWidth: { duration: 1, repeat: Infinity }
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
              y: [0, -2, 0]
            }}
            transition={{ 
              duration: 0.3,
              delay: 0.2,
              y: { duration: 1, repeat: Infinity }
            }}
            points={`${endX},${endY} 
                    ${endX - 15 * Math.cos(angle - Math.PI/6)},${endY - 15 * Math.sin(angle - Math.PI/6)} 
                    ${endX - 15 * Math.cos(angle + Math.PI/6)},${endY - 15 * Math.sin(angle + Math.PI/6)}`}
            fill="#FCD34D"
          />
        )}
      </motion.g>
    )
  }

  // Modify handleStart to use selected vertex
  const handleStart = () => {
    if (isPlaying) {
      pauseTraversal()
    } else if (isPaused) {
      resumeTraversal()
    } else {
      setExploredEdges([])
      setAnimationComplete(false)
      const startNodeId = `node-${startVertex.charCodeAt(0) - 65}`
      startTraversal(startNodeId)
    }
  }

  // Add reset handler
  const handleGenerateNewGraph = () => {
    if (isPlaying || isPaused) {
      // Ask for confirmation if traversal is in progress
      if (window.confirm('Generating a new graph will reset the current traversal. Continue?')) {
        setActiveEdge(null)
        setExploredEdges([])
        setAnimationComplete(false)
        generateGraph()
      }
    } else {
      generateGraph()
    }
  }

  // Modify renderGraph for the logical view case
  const renderLogicalView = () => (
    <div className="flex items-center justify-center w-full h-[600px] bg-slate-900 rounded-lg relative">
      <svg className="absolute inset-0 w-full h-full">
        {/* Base edges */}
        {edges.map(edge => renderEdge(edge, nodes, edges))}
        
        {/* Parent relationships */}
        {Object.entries(parentNodes).map(([child, parent]) => (
          renderTraversalEdge(parent, child)
        ))}
      </svg>

      {/* Nodes with parent labels */}
      {nodes.map(node => (
        <motion.div
          key={node.id}
          className={`absolute w-12 h-12 flex items-center justify-center rounded-full 
            ${currentNode === node.id ? 'bg-yellow-500' : 'bg-blue-500'} 
            ${visitedNodes.includes(node.id) ? 'bg-green-500' : ''}
            ${node.label === startVertex ? 'ring-2 ring-white' : ''}`}
          style={{
            left: node.x,
            top: node.y,
            transform: 'translate(-50%, -50%)',
            zIndex: 10
          }}
        >
          <span className="text-lg font-bold text-white">{node.label}</span>
          {parentNodes[node.id] && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute px-2 py-1 text-xs text-white rounded -top-8 bg-slate-700"
            >
              Parent: {nodes.find(n => n.id === parentNodes[node.id])?.label}
            </motion.div>
          )}
        </motion.div>
      ))}
    </div>
  )

  // Add helper function for node colors
  const getNodeColor = (node) => {
    if (currentNode === node.id) return '#F59E0B' // yellow
    if (visitedNodes.includes(node.id)) return '#10B981' // green
    return '#3B82F6' // blue
  }

  const renderGraph = () => {
    switch(representationType) {
      case 'logical':
        return renderLogicalView()
      case 'adjacencyList':
        return <div>Adjacency List View Coming Soon</div>
      case 'adjacencyMatrix':
        return <div>Adjacency Matrix View Coming Soon</div>
      default:
        return null
    }
  }

  // Add Traversal Info Sidebar content
  const renderTraversalInfo = () => (
    <div className="w-64 p-4 mt-28 bg-slate-700">
      <h3 className="mb-4 text-lg font-bold text-blue-400">Traversal Info</h3>
      
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
                {`${index + 1}. Visit ${nodes.find(n => n.id === nodeId)?.label}`}
              </motion.li>
            ))}
          </ol>
        </div>
      </div>

      {/* Parent Relationships */}
      <div className="mb-6">
        <h4 className="mb-2 font-semibold text-gray-300 text-md">Parent Relationships:</h4>
        <div className="p-3 rounded bg-slate-800">
          {Object.entries(parentNodes).map(([child, parent], index) => (
            <motion.div
              key={child}
              className="flex items-center gap-2 mb-1 text-sm text-gray-300"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <span>{nodes.find(n => n.id === child)?.label}</span>
              <span className="text-gray-500">→</span>
              <span>{nodes.find(n => n.id === parent)?.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col w-full h-full bg-slate-800">
      {/* Controls Header - Simplified */}
      <div className="fixed right-0 z-40 p-4 border-b shadow-lg top-16 left-64 bg-slate-800 border-slate-700">
        <div className="flex items-center justify-between h-14">
          <h2 className="text-2xl font-bold text-blue-400 capitalize">
            {algorithm?.replace('-', ' ')}
          </h2>

          <div className="flex items-center gap-6">
            {/* Add Start Vertex Selection */}
            <div className="flex items-center gap-2">
              <label className="text-gray-300">Start:</label>
              <select
                value={startVertex}
                onChange={(e) => setStartVertex(e.target.value)}
                className="px-2 py-1 text-white border rounded bg-slate-700 border-slate-600"
              >
                {nodes.map(node => (
                  <option key={node.id} value={node.label}>
                    {node.label}
                  </option>
                ))}
              </select>
            </div>

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

      <div className="flex flex-1">
        {/* Graph Visualization Area */}
        <div className="flex-1 p-6 mx-4 mt-28">
          {renderGraph()}
        </div>

        {/* Sidebar for Parent and Visited Nodes */}
        {renderTraversalInfo()}
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
              onClick={handleGenerateNewGraph}
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
