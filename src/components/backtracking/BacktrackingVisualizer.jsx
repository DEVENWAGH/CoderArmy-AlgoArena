import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import useBacktrackingStore from "../../store/backtrackingStore";
import NQueensVisualizer from "./NQueensVisualizer";
import SudokuVisualizer from "./SudokuVisualizer";

const BacktrackingVisualizer = () => {
  const { algorithm } = useParams();
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
    currentStep,
  } = useBacktrackingStore();

  useEffect(() => {
    console.log("Current backtracking algorithm:", algorithm);
    if (algorithm) {
      startAlgorithm(algorithm);
    }

    // Cleanup function to ensure proper reset between algorithms
    return () => {
      resetAlgorithm();
    };
  }, [algorithm, startAlgorithm, resetAlgorithm]);

  // Effect to completely reinitialize when board size changes
  useEffect(() => {
    if (algorithm === "n-queens") {
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
      case "n-queens":
        return <NQueensVisualizer />;
      case "sudoku-solver":
        return <SudokuVisualizer />;
      default:
        return (
          <div className="flex items-center justify-center h-64 text-xl text-white">
            Algorithm not found or not implemented yet: "{algorithm}"
          </div>
        );
    }
  };

  const renderControls = () => {
    return (
      <div className="flex flex-col gap-4">
        {/* Standard Controls - Reorganized for responsive layout */}
        <div className="flex flex-col gap-3 mt-24 lg:mt-0 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <h2 className="text-xl font-bold text-white capitalize">
              {algorithm?.replace("-", " ")}
            </h2>
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

        {/* Algorithm Controls - Responsive layout with justify-between for buttons */}
        <div className="flex flex-wrap justify-between gap-y-3">
          {/* Control buttons with justify-between */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleStartPauseResume}
              className={`px-4 py-2 rounded ${
                isPlaying
                  ? "bg-red-500"
                  : isPaused
                  ? "bg-yellow-500"
                  : "bg-green-500"
              }`}
            >
              {isPlaying ? "Pause" : isPaused ? "Resume" : "Start"}
            </button>

            {/* Add board size selector next to start/reset buttons for N-Queens */}
            {algorithm === "n-queens" && (
              <div className="flex items-center px-2 py-1 rounded bg-slate-700">
                <span className="mr-2 text-sm text-gray-300">Size:</span>
                <select
                  value={boardSize}
                  onChange={(e) => setBoardSize(Number(e.target.value))}
                  className="px-2 py-1 text-white rounded bg-slate-700"
                  disabled={isPlaying}
                >
                  {[4, 5, 6, 7, 8].map((size) => (
                    <option key={size} value={size}>
                      {size}×{size}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={handleReset}
              className="px-4 py-2 bg-blue-500 rounded"
            >
              Reset
            </button>
          </div>

          {/* Navigation Controls - Only visible on desktop */}
          <div className="flex-wrap hidden gap-2 md:flex">
            {solutions.length > 0 && (
              <div className="flex items-center gap-1 px-2 rounded bg-slate-700">
                <button
                  onClick={previousSolution}
                  className="px-3 py-1.5 text-white hover:bg-slate-600 rounded touch-target"
                  disabled={isPlaying}
                >
                  &lt;
                </button>
                <span className="text-sm text-white min-w-[100px] text-center">
                  Solution {currentSolution + 1}/{solutions.length}
                </span>
                <button
                  onClick={nextSolution}
                  className="px-3 py-1.5 text-white hover:bg-slate-600 rounded touch-target"
                  disabled={isPlaying}
                >
                  &gt;
                </button>
              </div>
            )}

            {/* Step Navigation - Only visible on desktop */}
            {steps.length > 0 && (
              <div className="flex items-center gap-1 px-2 rounded bg-slate-700">
                <button
                  onClick={previousStep}
                  className="px-3 py-1.5 text-white hover:bg-slate-600 rounded touch-target"
                  disabled={isPlaying || currentStep === 0}
                >
                  &lt;
                </button>
                <span className="text-sm text-white min-w-[80px] text-center">
                  Step {currentStep + 1}/{steps.length}
                </span>
                <button
                  onClick={nextStep}
                  className="px-3 py-1.5 text-white hover:bg-slate-600 rounded touch-target"
                  disabled={isPlaying || currentStep === steps.length - 1}
                >
                  &gt;
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render bottom navigation controls for mobile and tablet
  const renderBottomControls = () => {
    if (!solutions.length && !steps.length) return null;
    
    return (
      <div className="fixed bottom-0 left-0 right-0 z-40 p-3 border-t shadow-lg md:hidden bg-slate-800 border-slate-700">
        <div className="flex flex-col gap-3">
          {solutions.length > 0 && (
            <div className="flex items-center justify-center w-full gap-2 px-2 py-2 rounded bg-slate-700">
              <button
                onClick={previousSolution}
                className="flex items-center justify-center w-10 h-10 text-white rounded-full bg-slate-600"
                disabled={isPlaying}
              >
                &lt;
              </button>
              <span className="text-sm text-white min-w-[120px] text-center">
                Solution {currentSolution + 1}/{solutions.length}
              </span>
              <button
                onClick={nextSolution}
                className="flex items-center justify-center w-10 h-10 text-white rounded-full bg-slate-600"
                disabled={isPlaying}
              >
                &gt;
              </button>
            </div>
          )}

          {steps.length > 0 && (
            <div className="flex items-center justify-center w-full gap-2 px-2 py-2 rounded bg-slate-700">
              <button
                onClick={previousStep}
                className="flex items-center justify-center w-10 h-10 text-white rounded-full bg-slate-600"
                disabled={isPlaying || currentStep === 0}
              >
                &lt;
              </button>
              <span className="text-sm text-white min-w-[100px] text-center">
                Step {currentStep + 1}/{steps.length}
              </span>
              <button
                onClick={nextStep}
                className="flex items-center justify-center w-10 h-10 text-white rounded-full bg-slate-600"
                disabled={isPlaying || currentStep === steps.length - 1}
              >
                &gt;
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Check if bottom controls are visible
  const hasBottomControls = solutions.length > 0 || steps.length > 0;

  return (
    <div className="flex flex-col w-full h-full bg-slate-800">
      {/* Controls Header - Responsive height and padding */}
      <div className="fixed left-0 right-0 z-40 p-2 border-b shadow-lg sm:p-4 top-16 md:left-64 bg-slate-800 border-slate-700">
        {renderControls()}
      </div>

      {/* Main Content - Adjusted margins for mobile responsiveness */}
      <div className={`flex-1 p-2 overflow-hidden sm:p-6 mt-36 sm:mt-32 md:mt-28 md:mb-0 ${hasBottomControls ? 'mb-24' : ''}`}>
        <div className="min-h-screen p-2 overflow-auto rounded-lg sm:p-4 bg-slate-900">
          {renderAlgorithmVisualizer()}
        </div>
      </div>
      
      {/* Bottom Controls for Mobile/Tablet */}
      {renderBottomControls()}
    </div>
  );
};

export default BacktrackingVisualizer;
