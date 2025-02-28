import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import useBacktrackingStore from '../../store/backtrackingStore'
import NQueensVisualizer from './NQueensVisualizer'

const BacktrackingVisualizer = () => {
  const { algorithm } = useParams()
  const {
    isPlaying,
    isPaused,
    speed,
    boardSize,
    setSpeed,
    setBoardSize,
    startAlgorithm,
    runAlgorithm,
    pauseAlgorithm,
    resumeAlgorithm,
    resetAlgorithm,
    nextSolution,
    previousSolution,
    nextStep,
    previousStep,
    solutions,
    steps,
    currentSolution,
    currentStep
  } = useBacktrackingStore()

  useEffect(() => {
    console.log("Current backtracking algorithm:", algorithm)
    if (algorithm) {
      startAlgorithm(algorithm)
    }
    
    // Cleanup function to ensure proper reset between algorithms
    return () => {
      resetAlgorithm();
    };
  }, [algorithm, startAlgorithm, resetAlgorithm])

  // Effect to completely reinitialize when board size changes
  useEffect(() => {
    if (algorithm === 'n-queens') {
      startAlgorithm(algorithm);
    }
  }, [boardSize, algorithm, startAlgorithm]);

  const handleStartPauseResume = () => {
    if (isPlaying) {
      console.log("Pause button clicked");
      pauseAlgorithm();
    } else if (isPaused) {
      console.log("Resume button clicked");
      resumeAlgorithm();
    } else {
      console.log("Start button clicked");
      runAlgorithm(algorithm);
    }
  };

  const handleReset = () => {
    console.log("Reset button clicked");
    resetAlgorithm();
  };

  const renderAlgorithmVisualizer = () => {
    switch (algorithm) {
      case 'n-queens':
        return <NQueensVisualizer />
      default:
        return (
          <div className="flex items-center justify-center h-64 text-xl text-white">
            Algorithm not found or not implemented yet: "{algorithm}"
          </div>
        )
    }
  }

  const renderControls = () => {
    return (
      <div className="flex flex-col gap-4">
        {/* Standard Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-white capitalize">
              {algorithm?.replace('-', ' ')}
            </h2>
            
            {algorithm === 'n-queens' && (
              <div className="flex items-center gap-2">
                <label className="text-gray-300">Board Size:</label>
                <select
                  value={boardSize}
                  onChange={(e) => setBoardSize(Number(e.target.value))}
                  className="px-2 py-1 bg-slate-700 text-white rounded"
                  disabled={isPlaying}
                >
                  {[4, 5, 6, 7, 8].map(size => (
                    <option key={size} value={size}>{size}x{size}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

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
        </div>

        {/* Algorithm Controls - with improved handlers */}
        <div className="flex justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleStartPauseResume}
              className={`px-4 py-2 rounded ${
                isPlaying ? 'bg-red-500' : isPaused ? 'bg-yellow-500' : 'bg-green-500'
              }`}
            >
              {isPlaying ? 'Pause' : isPaused ? 'Resume' : 'Start'}
            </button>
            
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-blue-500 rounded"
            >
              Reset
            </button>
          </div>

          {/* Navigation Controls */}
          {solutions.length > 0 && (
            <div className="flex gap-2">
              <div className="flex items-center gap-1 px-2 bg-slate-700 rounded">
                <button
                  onClick={previousSolution}
                  className="px-2 py-1 text-white hover:bg-slate-600 rounded"
                  disabled={isPlaying}
                >
                  &lt;
                </button>
                <span className="text-sm text-white">
                  Solution {currentSolution + 1}/{solutions.length}
                </span>
                <button
                  onClick={nextSolution}
                  className="px-2 py-1 text-white hover:bg-slate-600 rounded"
                  disabled={isPlaying}
                >
                  &gt;
                </button>
              </div>
            </div>
          )}

          {/* Step Navigation */}
          {steps.length > 0 && (
            <div className="flex gap-2">
              <div className="flex items-center gap-1 px-2 bg-slate-700 rounded">
                <button
                  onClick={previousStep}
                  className="px-2 py-1 text-white hover:bg-slate-600 rounded"
                  disabled={isPlaying || currentStep === 0}
                >
                  &lt;
                </button>
                <span className="text-sm text-white">
                  Step {currentStep + 1}/{steps.length}
                </span>
                <button
                  onClick={nextStep}
                  className="px-2 py-1 text-white hover:bg-slate-600 rounded"
                  disabled={isPlaying || currentStep === steps.length - 1}
                >
                  &gt;
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full h-full bg-slate-800">
      {/* Controls Header */}
      <div className="fixed right-0 z-40 p-4 border-b shadow-lg top-16 left-64 bg-slate-800 border-slate-700">
        {renderControls()}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 mt-32 overflow-hidden">
        <div className="p-4 rounded-lg bg-slate-900 h-[calc(100vh-180px)] overflow-auto">
          {renderAlgorithmVisualizer()}
        </div>
      </div>
    </div>
  )
}

export default BacktrackingVisualizer
