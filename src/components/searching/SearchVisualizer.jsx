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
  const [showSettingsSidebar, setShowSettingsSidebar] = useState(false);

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

  const toggleSettingsSidebar = () => {
    setShowSettingsSidebar(!showSettingsSidebar);
  };

  return (
    <div className="flex flex-col w-full h-full bg-slate-800">
      {/* Header Controls - Simplified with Settings button */}
      <div className="fixed right-0 z-40 p-4 border-b shadow-lg top-40 left-2 lg:top-24 md:left-[16rem] bg-slate-800 border-slate-700">
        <div className="flex flex-row items-center justify-between h-auto mx-auto">
          <div className="flex items-center">
            <h2 className="text-2xl font-bold text-blue-400 capitalize">
              {algorithm?.replace("-", " ")}
            </h2>
          </div>

          {/* Settings button to toggle sidebar */}
          <button
            onClick={toggleSettingsSidebar}
            className="px-3 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 lg:mt-4"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                clipRule="evenodd"
              />
            </svg>
            Settings
          </button>
        </div>
      </div>

      {/* Settings Sidebar */}
      <motion.div
        className="fixed right-0 top-0 h-full bg-slate-900 z-50 border-l border-slate-700 shadow-xl overflow-y-auto"
        initial={{ width: 0, opacity: 0 }}
        animate={{
          width: showSettingsSidebar ? 300 : 0,
          opacity: showSettingsSidebar ? 1 : 0,
          transition: {
            duration: 0.3,
            ease: "easeInOut",
          },
        }}
      >
        {/* Settings Content */}
        <div className="p-6 pt-20">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-blue-400">Settings</h3>
            <button
              onClick={toggleSettingsSidebar}
              className="text-gray-400 hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Array Size Control */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-400 mb-2">
              Array Size
            </h4>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="5"
                  max="200"
                  value={arraySize}
                  onChange={handleSizeChange}
                  className="w-20 px-2 py-1 text-white border rounded bg-slate-700 border-slate-600"
                  disabled={isSearching}
                />
                <button
                  onClick={handleSizeSubmit}
                  className="px-3 py-1 text-sm bg-blue-500 rounded hover:bg-blue-600 disabled:opacity-50"
                  disabled={isSearching}
                >
                  Apply
                </button>
              </div>
              <input
                type="range"
                min="5"
                max="200"
                value={arraySize}
                onChange={handleSizeChange}
                className="w-full"
                disabled={isSearching}
              />
            </div>
          </div>

          {/* Target Value Input */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-400 mb-2">
              Search Value
            </h4>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter number to search"
                className="w-full px-3 py-2 text-white border rounded bg-slate-700 border-slate-600"
                disabled={isSearching && isSearchPlaying}
              />
            </div>
          </div>

          {/* Animation Speed Control */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-400 mb-2">
              Animation Speed
            </h4>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Slow</span>
                <span className="text-xs text-gray-400">Fast</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSpeed(Math.max(1, speed - 10))}
                  className="px-2 py-1 bg-blue-600 text-white rounded-l hover:bg-blue-700"
                >
                  <span className="font-bold">-</span>
                </button>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={speed}
                  onChange={handleSpeedChange}
                  className="w-full"
                />
                <button
                  onClick={() => setSpeed(Math.min(100, speed + 10))}
                  className="px-2 py-1 bg-blue-600 text-white rounded-r hover:bg-blue-700"
                >
                  <span className="font-bold">+</span>
                </button>
              </div>
              <div className="text-center text-sm text-gray-300 mt-1">
                {speed}%
              </div>
            </div>
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            disabled={isSearching && isSearchPlaying}
            className="w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 mb-6 disabled:opacity-50"
          >
            Search
          </button>

          {/* Generate New Array Button */}
          <button
            onClick={generateSearchArray}
            className="w-full px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 mb-4"
            disabled={isSearching && isSearchPlaying}
          >
            Generate Random Array
          </button>
        </div>
      </motion.div>

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
      <div className="fixed bottom-0 lg:left-[16rem]  z-40 flex items-center justify-evenly lg:justify-between w-full p-4 shadow-lg bg-slate-800 border-slate-700">
        <div className="flex items-center gap-4">
          <button
            onClick={generateSearchArray}
            className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            New Array
          </button>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter value to search"
              className="w-40 px-3 py-2 text-white border rounded bg-slate-700 border-slate-600"
              disabled={isSearching && isSearchPlaying}
            />
          </div>
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
    </div>
  );
};

export default SearchVisualizer;
