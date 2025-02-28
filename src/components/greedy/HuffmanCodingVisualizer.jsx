import React, { useEffect, useRef, useState } from 'react'
import { motion } from "motion/react"
import useGreedyStore from '../../store/greedyStore'

const HuffmanCodingVisualizer = () => {
  const {
    frequencies,
    huffmanTree,
    huffmanCodes
  } = useGreedyStore()
  
  // Ref for the SVG container
  const svgContainerRef = useRef(null)
  // State to control animation sequence
  const [animatedNodes, setAnimatedNodes] = useState(new Set())
  
  // Calculate tree depth and width
  const calculateTreeDepth = (node) => {
    if (!node) return 0
    return 1 + Math.max(
      calculateTreeDepth(node.left),
      calculateTreeDepth(node.right)
    )
  }

  const countLeaves = (node) => {
    if (!node) return 0
    if (!node.left && !node.right) return 1
    return countLeaves(node.left) + countLeaves(node.right)
  }

  // Calculate tree dimensions
  const treeDepth = calculateTreeDepth(huffmanTree)
  const leafCount = countLeaves(huffmanTree)
  const svgHeight = Math.max(400, treeDepth * 100)
  const svgWidth = Math.max(800, leafCount * 150)

  // Collect all node IDs in the tree for animation sequencing
  useEffect(() => {
    if (!huffmanTree) {
      setAnimatedNodes(new Set())
      return
    }
    
    const nodeIds = new Set()
    
    // Start animation timers for sequential appearance
    const animateNodesSequentially = (node, nodeId = 'root') => {
      if (!node) return
      
      // Animate current node
      setTimeout(() => {
        setAnimatedNodes(prev => {
          const updated = new Set(prev)
          updated.add(nodeId)
          return updated
        })
      }, nodeIds.size * 300) // Stagger animation by 300ms per node
      
      nodeIds.add(nodeId)
      
      // Animate children
      if (node.left) animateNodesSequentially(node.left, `${nodeId}-left`)
      if (node.right) animateNodesSequentially(node.right, `${nodeId}-right`)
    }
    
    // Start animation sequence
    animateNodesSequentially(huffmanTree)
  }, [huffmanTree])

  // Render Huffman codes
  const renderHuffmanCodes = () => {
    if (!huffmanCodes || Object.keys(huffmanCodes).length === 0) {
      return <p className="text-gray-400">Codes will appear as the algorithm runs</p>
    }

    return (
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {Object.entries(huffmanCodes).map(([char, code], index) => (
          <motion.div
            key={char}
            className="flex justify-between p-3 bg-blue-600 rounded-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <span className="text-lg font-bold text-white">{char}</span>
            <span className="font-mono text-sm text-white">{code}</span>
          </motion.div>
        ))}
      </div>
    )
  }

  // Improved animated tree node rendering
  const renderNode = (node, x, y, width, nodeId = 'root') => {
    if (!node) return null
    const nodeSize = 40
    const isAnimated = animatedNodes.has(nodeId)
    
    return (
      <g key={nodeId}>
        {/* Edge to left child */}
        {node.left && isAnimated && (
          <>
            <motion.line
              x1={x}
              y1={y + nodeSize/2}
              x2={x - width/2}
              y2={y + 80}
              stroke="#4B5563"
              strokeWidth="2"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
            <motion.text
              x={x - width/4}
              y={y + 40}
              textAnchor="middle"
              className="text-xs fill-gray-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            >
              0
            </motion.text>
          </>
        )}
        
        {/* Edge to right child */}
        {node.right && isAnimated && (
          <>
            <motion.line
              x1={x}
              y1={y + nodeSize/2}
              x2={x + width/2}
              y2={y + 80}
              stroke="#4B5563"
              strokeWidth="2"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
            <motion.text
              x={x + width/4}
              y={y + 40}
              textAnchor="middle"
              className="text-xs fill-gray-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            >
              1
            </motion.text>
          </>
        )}
        
        {/* Node circle with animation */}
        <motion.circle
          cx={x}
          cy={y}
          r={nodeSize/2}
          className={node.char ? 'fill-green-500 stroke-white stroke-2' : 'fill-blue-500 stroke-white stroke-2'}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: isAnimated ? 1 : 0, opacity: isAnimated ? 1 : 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 15,
            duration: 0.5
          }}
        />
        
        {/* Node text with animation */}
        {isAnimated && (
          <motion.text
            x={x}
            y={y}
            textAnchor="middle"
            dy=".3em"
            className="text-sm font-bold fill-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            {node.char || node.freq}
          </motion.text>
        )}
        
        {/* Render children recursively */}
        {node.left && renderNode(node.left, x - width/2, y + 80, width/2, `${nodeId}-left`)}
        {node.right && renderNode(node.right, x + width/2, y + 80, width/2, `${nodeId}-right`)}
      </g>
    )
  }

  return (
    <div className="flex flex-col gap-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
      {/* Algorithm explanation */}
      <div className="p-4 rounded-lg bg-slate-800">
        <h3 className="mb-2 text-lg font-bold text-white">Huffman Coding Algorithm</h3>
        <p className="text-gray-300">
          Huffman coding is a lossless data compression algorithm that assigns variable-length codes to 
          characters based on their frequencies. Characters that occur more frequently get shorter codes.
        </p>
        <ul className="pl-5 mt-2 text-gray-300 list-disc">
          <li>Create leaf nodes for each character and their frequency</li>
          <li>Build a min-heap of nodes based on frequency</li>
          <li>Extract two nodes with lowest frequencies and create a new internal node</li>
          <li>Repeat until only one node remains (the root)</li>
          <li>Assign 0 for left edge and 1 for right edge to generate codes</li>
        </ul>
      </div>

      {/* Character frequencies */}
      <div className="p-4 rounded-lg bg-slate-800">
        <h3 className="mb-2 text-lg font-bold text-white">Character Frequencies</h3>
        <div className="flex flex-wrap gap-3">
          {Object.entries(frequencies).map(([char, freq], index) => (
            <motion.div
              key={char}
              className="flex flex-col items-center px-4 py-2 bg-blue-500 rounded-lg"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="text-xl font-bold text-white">{char}</div>
              <div className="text-sm text-white">Freq: {freq}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Huffman Tree with animation */}
      <div className="p-4 rounded-lg bg-slate-800">
        <h3 className="mb-2 text-lg font-bold text-white">Huffman Tree</h3>
        {huffmanTree ? (
          <div 
            className="overflow-auto rounded-lg bg-slate-900" 
            ref={svgContainerRef}
            style={{ 
              maxHeight: '500px',
              overflowX: 'auto',
              overflowY: 'auto'
            }}
          >
            <svg 
              width={svgWidth} 
              height={svgHeight} 
              viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
              preserveAspectRatio="xMidYMid meet"
            >
              {renderNode(huffmanTree, svgWidth / 2, 50, svgWidth / 3)}
            </svg>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-400">
            Tree will be built as the algorithm runs
          </div>
        )}
      </div>

      {/* Generated Codes */}
      <div className="p-4 rounded-lg bg-slate-800">
        <h3 className="mb-2 text-lg font-bold text-white">Generated Huffman Codes</h3>
        {renderHuffmanCodes()}
      </div>
    </div>
  )
}

export default HuffmanCodingVisualizer
