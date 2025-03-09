import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "motion/react";
import useAlgorithmStore from "../../store/algorithmStore";

const SearchVisualizer = () => {
  const { algorithm } = useParams();
  const {
    searchArray,
    generateSearchArray,
    currentSearchIndex,
    searchTarget,
    searchResult,
    isSearching,
    startSearch,
    setCurrentAlgorithm,
    searchArraySize,
    setSearchArraySize,
    isSearchPlaying,
    isSearchPaused,
    pauseSearch,
    resumeSearch,
    speed,
    setSpeed,
  } = useAlgorithmStore();

  const [targetValue, setTargetValue] = useState("");
  const [arraySize, setArraySize] = useState(searchArraySize);

  // Initialize on mount
  useEffect(() => {
    generateSearchArray();
    if (algorithm) {
      const formattedAlgo = algorithm
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      setCurrentAlgorithm(formattedAlgo);
    }
  }, [algorithm]);

  const handleSearch = () => {
    const target = parseInt(targetValue);
    if (!isNaN(target)) {
      startSearch(target);
    }
  };

  const handlePlayPause = () => {
    if (isSearchPlaying) {
      pauseSearch();
    } else if (isSearchPaused) {
      resumeSearch();
    }
  };

  const handleSizeChange = (e) => {
    const size = parseInt(e.target.value);
    setArraySize(size);
  };

  const handleSizeSubmit = () => {
    const size = Math.min(Math.max(5, arraySize), 200); // Increased max size to 200
    setSearchArraySize(size);
  };

  const handleSpeedChange = (e) => {
    const newSpeed = Number(e.target.value);
    setSpeed(newSpeed);
  };

  // Add handleKeyPress function
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="flex flex-col w-full h-full bg-slate-800">
      {/* Header Controls */}
      <div className="fixed right-0 z-40 p-4 border-b shadow-lg top-40 left-2 lg:top-24 md:left-0 bg-slate-800 border-slate-700">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between h-auto mx-auto">
          <div className="flex items-center mb-2 lg:mb-0">
            <h2 className="text-2xl font-bold text-blue-400 capitalize">
              {algorithm?.replace("-", " ")}
            </h2>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="flex flex-wrap items-center gap-4">
              {/* Array Size Controls */}
              <div className="flex items-center gap-2 sm:mr-50 md:mr-70 lg:mr-4">
                <label className="text-gray-300">Size:</label>
                <input
                  type="number"
                  min="5"
                  max="200"
                  value={arraySize}
                  onChange={handleSizeChange}
                  className="w-16 px-2 py-1 text-white border rounded bg-slate-700 border-slate-600"
                />
                <button
                  onClick={handleSizeSubmit}
                  className="px-2 py-1 text-sm bg-blue-500 rounded hover:bg-blue-600"
                >
                  Apply
                </button>
              </div>

              {/* Speed Control */}
              <div className="flex items-center gap-2">
                <label className="text-gray-300">Speed:</label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={speed}
                  onChange={handleSpeedChange}
                  className="w-24"
                />
                <span className="w-12 text-center text-gray-300">{speed}%</span>
              </div>
            </div>

            {/* Search Input - separate row below sm/md/lg screens, merged into main row on lg+ screens */}
            <div className="flex items-center w-full lg:w-auto lg:ml-4 gap-2">
              <input
                type="number"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter number"
                className="flex-1 px-3 py-1 text-white border rounded bg-slate-700 border-slate-600 lg:w-40 lg:flex-none"
              />
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="px-3 py-1 text-white bg-blue-500 rounded hover:bg-blue-600 whitespace-nowrap"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - Adjusted positioning for the new header height */}
      <div className="flex flex-col flex-1 mt-36 md:mt-32">
        <div className="flex-1 p-6 mx-4 rounded-lg bg-slate-900 flex items-center justify-center">
          <div className="flex flex-col items-center justify-center gap-8 w-full min-h-[calc(100vh-240px)]">
            {/* Result Message */}
            {searchResult !== null && (
              <div
                className={`px-4 py-2 text-lg font-medium rounded ${
                  searchResult
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "bg-red-500/20 text-red-400 border border-red-500/30"
                }`}
              >
                {searchResult
                  ? `Found ${searchTarget} at index ${currentSearchIndex}!`
                  : `${searchTarget} not found in array`}
              </div>
            )}

            {/* Array Visualization - Enhanced container */}
            <div className="flex flex-wrap items-center justify-center gap-4 p-8 overflow-y-auto max-h-[600px] w-full">
              {searchArray.map((num, idx) => (
                <motion.div
                  key={idx}
                  className={`flex flex-col items-center justify-center w-16 h-16 text-lg font-bold border-2 rounded-lg ${
                    idx === currentSearchIndex
                      ? "border-yellow-500 bg-yellow-500/20 text-yellow-400"
                      : searchResult && idx === currentSearchIndex
                      ? "border-green-500 bg-green-500/20 text-green-400"
                      : "border-blue-500 bg-blue-500/20 text-blue-400"
                  }`}
                  animate={{
                    scale: idx === currentSearchIndex ? 1.1 : 1,
                    transition: { duration: 0.3 },
                  }}
                >
                  <span className="text-xl">{num}</span>
                  <span className="mt-1 text-xs opacity-50">Index: {idx}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Footer Section */}
      <div className="fixed bottom-0 right-0 z-40 flex items-center gap-4 p-4 border-t shadow-lg left-0 sm:mb-6 lg:mb-auto 2xl:mb-6 bg-slate-800 border-slate-700">
        <button
          onClick={generateSearchArray}
          className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
        >
          New Array
        </button>
        <button
          onClick={handlePlayPause}
          disabled={!isSearching}
          className={`px-4 py-2 text-white rounded ${
            isSearchPlaying
              ? "bg-red-600 hover:bg-red-700"
              : "bg-green-600 hover:bg-green-700"
          } disabled:opacity-50`}
        >
          {isSearchPlaying
            ? "Pause"
            : isSearchPaused
            ? "Resume"
            : "Start Search"}
        </button>
      </div>
    </div>
  );
};

export default SearchVisualizer;
