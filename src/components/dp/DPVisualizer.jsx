import React, { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from "motion/react"
import useDPStore from '../../store/dpStore'
import DPTreeVisualizer from './DPTreeVisualizer'
import CodeView from './CodeView'

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
    setCurrentAlgorithm,
    setTable,
    setCurrentCell,
    runAlgorithm,
    algorithmResult,  // Add this new state variable
  } = useDPStore()

  const [showExplanation, setShowExplanation] = useState(true)
  const [visualizationType, setVisualizationType] = useState('table') // 'table', 'tree', or 'code'
  const [useCustomInput, setUseCustomInput] = useState(false)
  const [customInputs, setCustomInputs] = useState({
    fibonacci: { n: 6 },
    knapsack: {
      values: [4, 2, 10, 1, 2],
      weights: [12, 1, 4, 1, 2],
      capacity: 15
    },
    lcs: {
      str1: "ABCDGH",
      str2: "AEDFHR"
    },
    lis: {
      array: [10, 22, 9, 33, 21, 50, 41, 60, 80]
    }
  })

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

  const handleRunAlgorithm = async () => {
    if (isPlaying) return
    
    await runAlgorithm()
  }

  const handleCustomInputChange = (algo, field, value) => {
    setCustomInputs(prev => ({
      ...prev,
      [algo]: {
        ...prev[algo],
        [field]: value
      }
    }))
  }

  const handleArrayInputChange = (algo, field, value) => {
    // Parse comma-separated values into array
    try {
      const array = value.split(',').map(val => {
        const num = Number(val.trim())
        if (isNaN(num)) throw new Error("Invalid number")
        return num
      })
      handleCustomInputChange(algo, field, array)
    } catch (error) {
      console.error("Invalid array input", error)
      // Could show an error message to the user here
    }
  }

  const handleApplyCustomInput = () => {
    // Apply custom inputs to the algorithm
    const algoName = algorithm?.toLowerCase().replace(/[^a-z]/g, '')
    if (!algoName) return
    
    setInput(algoName, customInputs[algoName])
    startAlgorithm(algorithm) // Reset with new input
  }

  const handleUseDefaultInput = () => {
    // Reset to default inputs from store
    startAlgorithm(algorithm)
    setUseCustomInput(false)
  }

  const renderVisualizationToggle = () => (
    <div className="flex items-center gap-2 ml-4">
      <button
        onClick={() => setVisualizationType('table')}
        className={`px-3 py-1 text-sm rounded ${
          visualizationType === 'table' ? 'bg-blue-600' : 'bg-slate-600'
        }`}
      >
        Table View
      </button>
      <button
        onClick={() => setVisualizationType('tree')}
        className={`px-3 py-1 text-sm rounded ${
          visualizationType === 'tree' ? 'bg-blue-600' : 'bg-slate-600'
        }`}
      >
        Tree View
      </button>
      <button
        onClick={() => setVisualizationType('code')}
        className={`px-3 py-1 text-sm rounded ${
          visualizationType === 'code' ? 'bg-blue-600' : 'bg-slate-600'
        }`}
      >
        Code View
      </button>
    </div>
  )

  const renderControls = () => (
    <div className="flex flex-col gap-2 p-4 rounded-lg bg-slate-700">
      <div className="flex items-center justify-between mb-2">
        {/* Algorithm title and input toggle */}
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-white capitalize">
            {algorithm?.replace('-', ' ')}
          </h2>
          
          {/* Toggle between default and custom inputs */}
          <div className="flex items-center gap-2">
            <span className="text-gray-300">Custom Input:</span>
            <div 
              className={`relative inline-block w-12 h-6 rounded-full cursor-pointer ${
                useCustomInput ? 'bg-blue-600' : 'bg-gray-600'
              }`}
              onClick={() => setUseCustomInput(!useCustomInput)}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform 
                ${useCustomInput ? 'translate-x-7' : 'translate-x-1'}`} 
              />
            </div>
          </div>
        </div>
        
        {/* Input Controls for all algorithms (conditionally shown) */}
        <div className="flex gap-2">
          {useCustomInput && (
            <button
              onClick={handleApplyCustomInput}
              className="px-3 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
            >
              Apply Custom Input
            </button>
          )}
          <button
            onClick={handleUseDefaultInput}
            className="px-3 py-1 text-sm text-white bg-gray-500 rounded hover:bg-gray-600"
          >
            Use Default Input
          </button>
        </div>
      </div>

      {/* Custom Input UI, shown when useCustomInput is true */}
      {useCustomInput && (
        <div className="p-3 mb-3 border rounded border-slate-600 bg-slate-800">
          {algorithm?.includes('fibonacci') && (
            <div className="flex items-center gap-2">
              <label className="text-gray-300">N:</label>
              <input
                type="number"
                min="1"
                max="20"
                value={customInputs.fibonacci.n}
                onChange={(e) => handleCustomInputChange('fibonacci', 'n', 
                  Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                className="w-20 px-2 py-1 text-white rounded bg-slate-600"
              />
            </div>
          )}

          {algorithm?.includes('knapsack') && (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="flex flex-col gap-1">
                <label className="text-gray-300">Values (comma-separated):</label>
                <input
                  type="text"
                  value={customInputs.knapsack.values.join(', ')}
                  onChange={(e) => handleArrayInputChange('knapsack', 'values', e.target.value)}
                  className="px-2 py-1 text-white rounded bg-slate-600"
                  placeholder="e.g. 4, 2, 10, 1, 2"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-gray-300">Weights (comma-separated):</label>
                <input
                  type="text"
                  value={customInputs.knapsack.weights.join(', ')}
                  onChange={(e) => handleArrayInputChange('knapsack', 'weights', e.target.value)}
                  className="px-2 py-1 text-white rounded bg-slate-600"
                  placeholder="e.g. 12, 1, 4, 1, 2"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-gray-300">Capacity:</label>
                <input
                  type="number"
                  min="1"
                  value={customInputs.knapsack.capacity}
                  onChange={(e) => handleCustomInputChange('knapsack', 'capacity', 
                    Math.max(1, parseInt(e.target.value) || 1))}
                  className="px-2 py-1 text-white rounded bg-slate-600"
                />
              </div>
            </div>
          )}

          {algorithm?.includes('lcs') && (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label className="text-gray-300">String 1:</label>
                <input
                  type="text"
                  value={customInputs.lcs.str1}
                  onChange={(e) => handleCustomInputChange('lcs', 'str1', e.target.value)}
                  className="px-2 py-1 text-white rounded bg-slate-600"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-gray-300">String 2:</label>
                <input
                  type="text"
                  value={customInputs.lcs.str2}
                  onChange={(e) => handleCustomInputChange('lcs', 'str2', e.target.value)}
                  className="px-2 py-1 text-white rounded bg-slate-600"
                />
              </div>
            </div>
          )}

          {algorithm?.includes('lis') && (
            <div className="flex flex-col gap-1">
              <label className="text-gray-300">Array (comma-separated):</label>
              <input
                type="text"
                value={customInputs.lis.array.join(', ')}
                onChange={(e) => handleArrayInputChange('lis', 'array', e.target.value)}
                className="px-2 py-1 text-white rounded bg-slate-600"
                placeholder="e.g. 10, 22, 9, 33, 21"
              />
              <small className="text-gray-400">Enter numbers separated by commas</small>
            </div>
          )}
        </div>
      )}

      {/* Standard controls - unchanged */}
      <div className="flex items-center justify-between">
        {/* Speed Control */}
        <div className="flex items-center gap-2">
          <label className="text-gray-300">Speed:</label>
          <input
            type="range"
            min="1"
            max="100"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-32"
          />
          <span className="text-gray-300">{speed}%</span>
        </div>

        {/* Playback Controls */}
        <div className="flex gap-2">
          <button
            onClick={() => isPlaying ? pauseAlgorithm() : handleRunAlgorithm()}
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
        
        {/* Visualization Toggle */}
        {renderVisualizationToggle()}
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

    // Handle 2D arrays (Knapsack, LCS) with improved rendering
    return (
      <div className="flex flex-col items-center gap-4">
        {/* Input headers */}
        {algorithm?.includes('knapsack') && (
          <div className="flex flex-col gap-2 text-white">
            <div className="grid grid-cols-2 gap-4">
              <div>Values: [{input.knapsack.values.join(', ')}]</div>
              <div>Weights: [{input.knapsack.weights.join(', ')}]</div>
            </div>
            <div>Capacity: {input.knapsack.capacity}</div>
          </div>
        )}
        
        {/* LCS headers */}
        {algorithm?.includes('lcs') && (
          <div className="flex gap-4 text-white">
            <div>String 1: {input.lcs.str1}</div>
            <div>String 2: {input.lcs.str2}</div>
          </div>
        )}

        {/* Table headers for Knapsack */}
        {algorithm?.includes('knapsack') && (
          <div className="flex mt-2 mb-4">
            <div className="flex items-center justify-center w-12 h-12 font-bold text-white bg-gray-700 border-b border-r border-gray-600">
              w/i
            </div>
            {Array.from({ length: table[0]?.length || 0 }).map((_, w) => (
              <div 
                key={`header-${w}`}
                className="flex items-center justify-center w-12 h-12 font-bold text-white bg-gray-700 border-b border-r border-gray-600"
              >
                {w}
              </div>
            ))}
          </div>
        )}

        {/* Table grid with row headers for 2D data */}
        <div className="flex">
          {/* Row headers for knapsack */}
          {algorithm?.includes('knapsack') && (
            <div className="flex flex-col">
              {table.map((row, i) => (
                <div 
                  key={`row-header-${i}`}
                  className="flex items-center justify-center w-12 h-12 font-bold text-white bg-gray-700 border-b border-r border-gray-600"
                >
                  {i}
                </div>
              ))}
            </div>
          )}

          {/* Table cells */}
          <div className="grid gap-1" 
            style={{ 
              gridTemplateColumns: `repeat(${table[0]?.length || 1}, minmax(40px, 1fr))`
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
        {visualizationType === 'table' && (
          <div className="flex-1 p-4 overflow-auto rounded-lg bg-slate-900">
            <div className="flex items-center justify-center min-h-full">
              {renderTable()}
            </div>
          </div>
        )}
        
        {visualizationType === 'tree' && (
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
                algorithmResult={algorithmResult}
              />
            </div>
          </div>
        )}
        
        {visualizationType === 'code' && (
          <div className="flex-1 p-4 rounded-lg bg-slate-900">
            <CodeView
              algorithm={algorithm?.toLowerCase().replace(/[^a-z]/g, '')}
              currentCell={currentCell}
              isPlaying={isPlaying}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default DPVisualizer
