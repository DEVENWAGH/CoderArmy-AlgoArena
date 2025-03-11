import { useState, useEffect } from "react";
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
    setCustomSearchArray,
  } = useAlgorithmStore();

  const [targetValue, setTargetValue] = useState("");
  const [arraySize, setArraySize] = useState(searchArraySize);
  const [showSettingsSidebar, setShowSettingsSidebar] = useState(false);
  const [customArrayInput, setCustomArrayInput] = useState("");
  const [showCustomArrayModal, setShowCustomArrayModal] = useState(false);

  // Initialize on mount - Fixed dependency array issue
  useEffect(() => {
    generateSearchArray();
    if (algorithm) {
      const formattedAlgo = algorithm
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      setCurrentAlgorithm(formattedAlgo);
    }
  }, [algorithm, generateSearchArray, setCurrentAlgorithm]);

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
    } else {
      handleSearch();
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

  // Handle key press function updated to use onKeyDown instead of deprecated onKeyPress
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleCustomArraySubmit = () => {
    try {
      // Get input and clean it up
      const rawInput = customArrayInput.trim();

      if (!rawInput) {
        alert("Please enter numbers separated by commas or spaces");
        return;
      }

      // Split by commas or spaces (much simpler approach)
      const inputArray = rawInput
        .split(/[,\s]+/)
        .filter((item) => item.trim() !== "")
        .map((item) => parseInt(item.trim(), 10));

      // Validate all entries are numbers
      if (inputArray.some(isNaN)) {
        alert("Please ensure all entries are valid numbers");
        return;
      }

      // Check if array is empty after parsing
      if (inputArray.length === 0) {
        alert(
          "No valid numbers found. Please enter valid numbers separated by commas or spaces."
        );
        return;
      }

      // Add message to notify that for Binary Search, array will be sorted
      if (algorithm.toLowerCase().includes("binary")) {
        alert(
          "Note: For Binary Search, your array will be automatically sorted."
        );
      }

      // Apply the custom array - this calls the function from the store
      setCustomSearchArray(inputArray);
      setShowCustomArrayModal(false);
    } catch (error) {
      console.error("Error in custom array input:", error);
      alert("Error parsing array input. Please check your format.");
    }
  };

  const closeModal = () => {
    setShowCustomArrayModal(false);
  };

  const toggleSettingsSidebar = () => {
    setShowSettingsSidebar(!showSettingsSidebar);
  };

  // Helper function to determine the CSS class for array elements (extracted from nested ternary)
  const getArrayElementClass = (idx) => {
    if (idx === currentSearchIndex) {
      return "border-yellow-500 bg-yellow-500/20 text-yellow-400";
    }
    if (searchResult && idx === currentSearchIndex) {
      return "border-green-500 bg-green-500/20 text-green-400";
    }
    return "border-blue-500 bg-blue-500/20 text-blue-400";
  };

  // Helper function for the play/pause button content (extracted from nested ternary)
  const renderPlayPauseButton = () => {
    if (isSearchPlaying) {
      return (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          Pause
        </>
      );
    }

    if (isSearchPaused) {
      return (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
              clipRule="evenodd"
            />
          </svg>
          Resume
        </>
      );
    }

    return (
      <>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
            clipRule="evenodd"
          />
        </svg>
        Search
      </>
    );
  };

  return (
    <div className="flex flex-col w-full h-full bg-slate-800">
      {/* Header Controls - Add quick controls for desktop */}
      <div className="fixed right-0 z-40 p-4 border-b shadow-lg top-40 left-2 lg:top-24 md:left-[16rem] bg-slate-800 border-slate-700">
        <div className="flex flex-col items-center justify-between h-auto gap-4 mx-auto lg:mt-2 md:flex-row">
          <div className="flex items-center">
            <h2 className="text-2xl font-bold text-blue-400 capitalize">
              {algorithm?.replace("-", " ")}
            </h2>
          </div>

          {/* Desktop Quick Controls - Only visible on larger screens */}
          <div className="items-center hidden gap-4 lg:flex">
            <div className="flex items-center gap-2">
              <label
                htmlFor="desktop-size-input"
                className="text-sm text-gray-300"
              >
                Size:
              </label>
              <input
                id="desktop-size-input"
                type="number"
                min="5"
                max="200"
                value={arraySize}
                onChange={handleSizeChange}
                className="w-16 px-2 py-1 text-white border rounded bg-slate-700 border-slate-600"
                disabled={isSearching}
              />
              <button
                onClick={handleSizeSubmit}
                className="px-2 py-1 text-xs bg-blue-500 rounded hover:bg-blue-600 disabled:opacity-50"
                disabled={isSearching}
              >
                Apply
              </button>
            </div>

            <div className="flex items-center gap-2">
              <label
                htmlFor="desktop-speed-slider"
                className="text-sm text-gray-300"
              >
                Speed:
              </label>
              <input
                id="desktop-speed-slider"
                type="range"
                min="1"
                max="100"
                value={speed}
                onChange={handleSpeedChange}
                className="w-32"
              />
              <span className="text-sm text-gray-300">{speed}%</span>
            </div>

            {/* Custom Array Button for Desktop */}
            <button
              onClick={() => setShowCustomArrayModal(true)}
              className="px-3 py-1 text-sm bg-indigo-600 rounded hover:bg-indigo-700 disabled:opacity-50"
              disabled={isSearching}
            >
              Custom Array
            </button>
          </div>

          {/* Settings button - Only visible on mobile/tablet */}
          <button
            onClick={toggleSettingsSidebar}
            className="flex items-center gap-2 px-3 py-2 text-white bg-blue-600 rounded-lg lg:hidden hover:bg-blue-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
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
        className="fixed top-0 right-0 z-50 h-full overflow-y-auto border-l shadow-xl bg-slate-900 border-slate-700"
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
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-blue-400">Settings</h3>
            <button
              onClick={toggleSettingsSidebar}
              className="text-gray-400 hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
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

          {/* Custom Array Button - Moved to top of sidebar for all screens */}
          <button
            onClick={() => setShowCustomArrayModal(true)}
            className="w-full px-4 py-2 mb-6 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            disabled={isSearching && isSearchPlaying}
          >
            Use Custom Array
          </button>

          {/* Array Size Control */}
          <div className="mb-6">
            <h4 className="mb-2 text-sm font-semibold text-gray-400">
              Array Size
            </h4>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <input
                  id="mobile-size-input"
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
              <label htmlFor="mobile-size-slider" className="sr-only">
                Array Size Slider
              </label>
              <input
                id="mobile-size-slider"
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

          {/* Target Value Input - Updated to use onKeyDown instead of onKeyPress */}
          <div className="mb-6">
            <h4 className="mb-2 text-sm font-semibold text-gray-400">
              Search Value
            </h4>
            <div className="flex items-center gap-2">
              <input
                id="mobile-search-value"
                type="number"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter number to search"
                className="w-full px-3 py-2 text-white border rounded bg-slate-700 border-slate-600"
                disabled={isSearching && isSearchPlaying}
              />
            </div>
          </div>

          {/* Animation Speed Control */}
          <div className="mb-6">
            <h4 className="mb-2 text-sm font-semibold text-gray-400">
              Animation Speed
            </h4>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="mobile-speed-slider"
                  className="text-xs text-gray-400"
                >
                  Slow
                </label>
                <span className="text-xs text-gray-400">Fast</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSpeed(Math.max(1, speed - 10))}
                  className="px-2 py-1 text-white bg-blue-600 rounded-l hover:bg-blue-700"
                >
                  <span className="font-bold">-</span>
                </button>
                <input
                  id="mobile-speed-slider"
                  type="range"
                  min="1"
                  max="100"
                  value={speed}
                  onChange={handleSpeedChange}
                  className="w-full"
                />
                <button
                  onClick={() => setSpeed(Math.min(100, speed + 10))}
                  className="px-2 py-1 text-white bg-blue-600 rounded-r hover:bg-blue-700"
                >
                  <span className="font-bold">+</span>
                </button>
              </div>
              <div className="mt-1 text-sm text-center text-gray-300">
                {speed}%
              </div>
            </div>
          </div>

          {/* Generate New Array Button */}
          <button
            onClick={generateSearchArray}
            className="w-full px-4 py-2 mb-4 text-white bg-green-600 rounded-lg hover:bg-green-700"
            disabled={isSearching && isSearchPlaying}
          >
            Generate Random Array
          </button>
        </div>
      </motion.div>

      {/* Custom Array Modal */}
      {showCustomArrayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-slate-900/50">
          <div className="w-full max-w-lg p-6 rounded-lg shadow-xl bg-slate-800">
            <h3 className="mb-4 text-xl font-bold text-blue-400">
              Custom Array Input
            </h3>
            <p className="mb-2 text-sm text-gray-300">
              Enter numbers separated by commas or spaces:
            </p>
            <textarea
              className="w-full h-32 p-3 mb-4 text-white rounded-lg resize-none bg-slate-700"
              value={customArrayInput}
              onChange={(e) => setCustomArrayInput(e.target.value)}
              placeholder="Example: 45, 23, 78, 12, 56"
            ></textarea>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 text-sm text-white bg-gray-600 rounded-lg hover:bg-gray-700"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700"
                onClick={handleCustomArraySubmit}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 mt-36 md:mt-32">
        <div className="flex items-center justify-center flex-1 p-6 mx-4 rounded-lg bg-slate-900">
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
                  key={`array-item-${num}-${idx}`} // Fixed array key warning
                  className={`flex flex-col items-center justify-center w-16 h-16 text-lg font-bold border-2 rounded-lg ${getArrayElementClass(
                    idx
                  )}`}
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

      {/* Fixed Footer Section - Improved spacing for mobile and tablet */}
      <div className="fixed bottom-0 z-40 w-full p-4 shadow-lg bg-slate-800 border-slate-700">
        <div className="flex items-center justify-between w-full gap-2 md:justify-start sm:gap-3">
          {/* Left side with New Array button */}
          <button
            onClick={generateSearchArray}
            className="px-3 py-2 text-sm text-white bg-blue-600 rounded md:text-base hover:bg-blue-700 shrink-0"
          >
            New Array
          </button>

          {/* Middle - Search input with responsive sizing */}
          <div className="w-[120px] xs:w-[150px] sm:w-[180px] md:w-[300px] md:ml-4 md:mr-4">
            <input
              id="footer-search-input"
              type="number"
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search value"
              className="w-full px-2 py-1 text-white border rounded bg-slate-700 border-slate-600"
              disabled={isSearching && isSearchPlaying}
            />
          </div>

          {/* Right side - Search/Pause/Resume button */}
          <button
            onClick={handlePlayPause}
            disabled={
              targetValue === "" ||
              (isSearching && !isSearchPaused && !isSearchPlaying)
            }
            className={`px-3 sm:px-4 py-2 text-white rounded flex items-center gap-1 sm:gap-2 text-sm sm:text-base min-w-[80px] sm:min-w-[100px] md:min-w-[120px] justify-center shrink-0 ${
              isSearchPlaying
                ? "bg-red-600 hover:bg-red-700"
                : isSearchPaused
                ? "bg-yellow-600 hover:bg-yellow-700"
                : "bg-green-600 hover:bg-green-700"
            } disabled:opacity-50 md:ml-2`}
          >
            {renderPlayPauseButton()}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchVisualizer;
