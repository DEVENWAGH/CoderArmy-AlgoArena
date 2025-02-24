import React, { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import useDPStore from '../../store/dpStore'
import DPTreeVisualizer from './DPTreeVisualizer'
import { algorithmInfo } from '../../store/algorithmData'

const DPVisualizer = () => {
  const { algorithm } = useParams()
  const scrollRef = useRef()
  const {
    table,
    currentCell,
    speed,
    isPlaying,
    input,
    setSpeed,
    startAlgorithm,
    setInput,
    isPaused,
    pauseAlgorithm,
    resumeAlgorithm,
    setCurrentAlgorithm, // Add this
    setTable,           // Add this
    setCurrentCell,     // Add this
    runAlgorithm,       // Add this
  } = useDPStore()

  const [showExplanation, setShowExplanation] = useState(true)

  // Algorithm explanations
  const explanations = {
    fibonacci: {
      title: "Fibonacci Sequence",
      formula: "F(n) = F(n-1) + F(n-2)",
      description: "Builds the sequence by adding the two previous numbers",
      steps: [
        "Initialize array with F(0)=0, F(1)=1",
        "For each position i, calculate F(i) = F(i-1) + F(i-2)",
        "Store result in table to avoid recalculation"
      ]
    },
    // Add other algorithm explanations...
  }

  useEffect(() => {
    // Don't autoplay, just setup initial state
    if (algorithm) {
      const algoName = algorithm
        .toLowerCase()
        .replace(/[^a-z]/g, '')
      
      // Initialize state properly using individual setters
      setCurrentAlgorithm(algoName)
      setTable([])
      setCurrentCell(null)
    }
  }, [algorithm])

  useEffect(() => {
    const container = scrollRef.current
    if (container) {
      // Set scroll to 60% of total scrollable width
      requestAnimationFrame(() => {
        const maxScroll = container.scrollWidth - container.clientWidth
        container.scrollLeft = maxScroll * 0.6
      })
    }
  }, [table]) // Re-run when table updates

  const renderControls = () => (
    <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-700">
      {/* Input Controls */}
      <div className="flex gap-4">
        {algorithm?.includes('fibonacci') && (
          <div className="flex items-center gap-2">
            <label className="text-gray-300">N:</label>
            <input
              type="number"
              min="1"
              max="20" // Changed from 36 to 20
              value={input.fibonacci.n}
              onChange={(e) => {
                const value = Math.max(1, Math.min(20, parseInt(e.target.value) || 1))
                setInput('fibonacci', { n: value })
              }}
              className="w-20 px-2 py-1 text-white rounded bg-slate-600"
            />
            <span className="text-xs text-gray-400">(1-20)</span>
          </div>
        )}
        {/* Add other algorithm inputs... */}
      </div>

      {/* Playback Controls */}
      <div className="flex gap-2">
        <button
          onClick={() => isPlaying ? pauseAlgorithm() : runAlgorithm()}
          className={`px-4 py-2 rounded ${
            isPlaying ? 'bg-red-500' : 'bg-green-500'
          }`}
        >
          {isPlaying ? 'Pause' : 'Start'}
        </button>
        <button
          onClick={() => startAlgorithm(algorithm)}
          className="px-4 py-2 bg-blue-500 rounded"
        >
          Reset
        </button>
      </div>

      {/* Speed Control */}
      <div className="flex items-center gap-2">
        <label>Speed:</label>
        <input
          type="range"
          min="1"
          max="100"
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="w-24"
        />
      </div>
    </div>
  )

  const renderTable = () => {
    if (!table || !table.length) {
      return (
        <div className="text-xl text-white">
          Loading visualization...
        </div>
      )
    }

    // Handle 1D arrays (Fibonacci, LIS)
    if (!Array.isArray(table[0])) {
      return (
        <div className="flex gap-2">
          {table.map((value, i) => (
            <motion.div
              key={i}
              className={`w-12 h-12 flex items-center justify-center rounded
                ${currentCell === i ? 'bg-yellow-500' : value !== 0 ? 'bg-green-500' : 'bg-blue-500'}
              `}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <span className="text-lg font-bold text-white">
                {value}
              </span>
            </motion.div>
          ))}
        </div>
      )
    }

    // Handle 2D arrays (Knapsack, LCS)
    return (
      <div className="flex flex-col items-center gap-4">
        {/* Input headers */}
        {algorithm?.includes('knapsack') && (
          <div className="flex gap-4 text-white">
            <div>Values: [{input.knapsack.values.join(', ')}]</div>
            <div>Weights: [{input.knapsack.weights.join(', ')}]</div>
            <div>Capacity: {input.knapsack.capacity}</div>
          </div>
        )}
        {algorithm?.includes('lcs') && (
          <div className="flex gap-4 text-white">
            <div>String 1: {input.lcs.str1}</div>
            <div>String 2: {input.lcs.str2}</div>
          </div>
        )}

        {/* Table visualization */}
        <div className="grid gap-1" 
          style={{ 
            gridTemplateColumns: `repeat(${table[0].length}, minmax(40px, 1fr))`
          }}
        >
          {table.map((row, i) => (
            row.map((value, j) => (
              <motion.div
                key={`${i}-${j}`}
                className={`w-12 h-12 flex items-center justify-center rounded
                  ${currentCell?.[0] === i && currentCell?.[1] === j 
                    ? 'bg-yellow-500' 
                    : value !== 0 
                      ? 'bg-green-500'
                      : 'bg-blue-500'
                  }`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <span className="text-lg font-bold text-white">
                  {value}
                </span>
              </motion.div>
            ))
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full h-full bg-slate-800">
      {/* Fixed Header */}
      <div className="fixed right-0 z-40 p-4 border-b shadow-lg top-16 left-64 bg-slate-800 border-slate-700">
        {renderControls()}
      </div>

      {/* Main Content with Initial Scroll Position */}
      <div className="p-4 mt-32 flex flex-col h-[calc(100vh-12rem)]">
        <div 
          ref={scrollRef}
          className="flex-1 p-4 overflow-x-auto rounded-lg bg-slate-900"
          style={{ scrollBehavior: 'smooth' }}
        >
          <div className="min-w-max">
            <DPTreeVisualizer 
              data={table}
              currentCell={currentCell}
              type={algorithm?.toLowerCase().replace(/[^a-z]/g, '')}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default DPVisualizer
