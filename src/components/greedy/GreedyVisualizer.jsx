import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import useGreedyStore from '../../store/greedyStore'
import ActivitySelectionVisualizer from './ActivitySelectionVisualizer'
import HuffmanCodingVisualizer from './HuffmanCodingVisualizer'

const GreedyVisualizer = () => {
  const { algorithm } = useParams()
  const {
    isPlaying,
    isPaused,
    speed,
    setSpeed,
    startAlgorithm,
    runAlgorithm,
    pauseAlgorithm,
    resumeAlgorithm
  } = useGreedyStore()

  useEffect(() => {
    console.log("Current algorithm from URL:", algorithm);
    if (algorithm) {
      startAlgorithm(algorithm)
    }
  }, [algorithm])

  const renderAlgorithmVisualizer = () => {
    console.log("Rendering visualizer for:", algorithm);
    switch (algorithm) {
      case 'activity-selection':
        return <ActivitySelectionVisualizer />
      case 'huffman-coding':
        return <HuffmanCodingVisualizer />
      default:
        return (
          <div className="flex items-center justify-center h-64 text-xl text-white">
            Algorithm not found or not implemented yet: "{algorithm}"
          </div>
        )
    }
  }

  return (
    <div className="flex flex-col w-full h-full bg-slate-800">
      {/* Controls Header */}
      <div className="fixed right-0 z-40 p-4 border-b shadow-lg top-16 left-64 bg-slate-800 border-slate-700">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white capitalize">
            {algorithm?.replace('-', ' ')}
          </h2>

          <div className="flex items-center gap-4">
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

            <button
              onClick={() => isPlaying ? pauseAlgorithm() : isPaused ? resumeAlgorithm() : runAlgorithm(algorithm)}
              className={`px-4 py-2 rounded ${
                isPlaying ? 'bg-red-500' : 'bg-green-500'
              }`}
            >
              {isPlaying ? 'Pause' : isPaused ? 'Resume' : 'Start'}
            </button>
            
            <button
              onClick={() => startAlgorithm(algorithm)}
              className="px-4 py-2 bg-blue-500 rounded"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Make this scrollable */}
      <div className="flex-1 p-6 mt-24 overflow-hidden">
        <div className="p-4 rounded-lg bg-slate-900 h-[calc(100vh-180px)] overflow-auto">
          {renderAlgorithmVisualizer()}
        </div>
      </div>
    </div>
  )
}

export default GreedyVisualizer
