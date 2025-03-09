import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { motion } from "motion/react";
import useAlgorithmStore from "../../store/algorithmStore";

const SortingVisualizer = () => {
  const { algorithm } = useParams();
  const {
    array,
    generateNewArray,
    arraySize,
    setArraySize,
    isPlaying,
    setIsPlaying,
    currentIndex,
    compareIndex,
    speed,
    setSpeed,
    startSorting,
    pauseSorting,
    isSorted,
    resumeSorting,
    setCurrentAlgorithm,
    setCustomArray,
    isAscending,
    toggleSortOrder,
  } = useAlgorithmStore();

  const [isSorting, setIsSorting] = useState(false);
  const [customSize, setCustomSize] = useState(arraySize);
  const [customArrayInput, setCustomArrayInput] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const scrollContainerRef = useRef(null);
  const [showSettingsSidebar, setShowSettingsSidebar] = useState(false);

  useEffect(() => {
    if (algorithm) {
      const formattedAlgo = algorithm
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      setCurrentAlgorithm(formattedAlgo);
    }

    // Adjust array size for mobile devices when generating a new array
    const isMobile = window.innerWidth < 768;
    if (isMobile && arraySize > 26) {
      setArraySize(26); // Changed from 10 to 26 for mobile
    } else {
      generateNewArray();
    }

    setIsSorting(false);
  }, [algorithm]);

  useEffect(() => {
    return () => {
      pauseSorting();
      setIsSorting(false);
    };
  }, []);

  const handleSizeChange = (e) => {
    const value = Number(e.target.value);
    setCustomSize(value);
  };

  const handleSizeSubmit = () => {
    const size = Math.min(Math.max(5, customSize), 200);
    setIsSorting(false);
    setArraySize(size);
    setCustomSize(size);
    // Ensure current algorithm is set after size change
    if (algorithm) {
      const formattedAlgo = algorithm
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      setCurrentAlgorithm(formattedAlgo);
    }
  };

  const handleInputKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSizeSubmit();
    }
  };

  const handleSpeedChange = (e) => {
    const newSpeed = Number(e.target.value);
    setSpeed(newSpeed);
  };

  const getBarColor = (index) => {
    if (isSorted) return "bg-green-500 hover:bg-orange-500"; // Keep green for sorted
    if (index === currentIndex) return "bg-green-500 hover:bg-orange-500"; // Red for active comparison
    if (index === compareIndex) return "bg-red-500 hover:bg-orange-500"; // Red for comparing element
    return "bg-blue-500 hover:bg-orange-500"; // Blue by default
  };

  const handlePlayPause = () => {
    if (!array.length || !algorithm) return;

    if (isPlaying) {
      pauseSorting();
    } else if (isSorting) {
      resumeSorting();
      setIsPlaying(true);
    } else {
      setIsSorting(true);
      startSorting();
    }
  };

  const handleWheel = (e) => {
    if (scrollContainerRef.current) {
      e.preventDefault();
      scrollContainerRef.current.scrollLeft += e.deltaY;
    }
  };

  const handleMouseDown = (e) => {
    const ele = scrollContainerRef.current;
    if (!ele) return;

    let pos = { left: ele.scrollLeft, x: e.clientX };

    const mouseMoveHandler = (e) => {
      const dx = e.clientX - pos.x;
      ele.scrollLeft = pos.left - dx;
    };

    const mouseUpHandler = () => {
      document.removeEventListener("mousemove", mouseMoveHandler);
      document.removeEventListener("mouseup", mouseUpHandler);
    };

    document.addEventListener("mousemove", mouseMoveHandler);
    document.addEventListener("mouseup", mouseUpHandler);
  };

  // Calculate bar width based on array size and container width
  const getBarWidth = () => {
    if (arraySize <= 30) return "w-8";
    if (arraySize <= 50) return "w-6";
    if (arraySize <= 100) return "w-4";
    return "w-3";
  };

  // Calculate dynamic bar height scaling with increased max height
  const getBarHeight = (value) => {
    const maxHeight = 430; // Reduced from 450 to ensure bars fit better with indices
    const scale = maxHeight / Math.max(...array);
    return `h-[${value * scale}px]`;
  };

  // Calculate container width based on array size
  const getContainerWidth = () => {
    if (arraySize <= 30) return "w-4/5";
    if (arraySize <= 50) return "w-9/10";
    return `w-[${Math.max(100, array.length * 12)}%]`;
  };

  const handleGenerateNewArray = () => {
    generateNewArray();
    setIsSorting(false);
  };

  const handleCustomArraySubmit = () => {
    try {
      const values = customArrayInput
        .split(",")
        .map((num) => parseInt(num.trim()))
        .filter((num) => !isNaN(num));

      if (values.length > 0) {
        // Apply custom values directly
        setCustomArray(values);
        setShowCustomInput(false);
        setCustomArrayInput("");
        setCustomSize(values.length);
      }
    } catch (error) {
      console.error("Invalid input:", error);
    }
  };

  const getBarDimensions = () => {
    if (!array || array.length === 0) {
      return { barWidth: 0, gap: 0, containerWidth: "w-full" };
    }

    const isMobile = window.innerWidth < 768;

    // Adjust container width calculation for different screen sizes
    const containerWidth = window.innerWidth - (isMobile ? 20 : 300);
    const rightPadding = isMobile ? 40 : 200;
    const minGap = isMobile ? 1 : 3; // Reduced gap on mobile for more bars

    // Increased bar widths for mobile to make them more visible
    const maxBarWidth = isMobile ? 50 : 50;
    const minBarWidth = isMobile ? 25 : 20;

    // Calculate bar width based on container size and array length
    let barWidth =
      Math.floor((containerWidth - rightPadding) / array.length) - minGap;

    // Apply min/max constraints with preference for larger bars
    barWidth = Math.min(maxBarWidth, Math.max(minBarWidth, barWidth));

    // Add extra space to ensure last bar is fully visible when scrolling
    const totalWidth = array.length * (barWidth + minGap) + rightPadding + 100;

    return {
      barWidth,
      gap: minGap,
      containerWidth: totalWidth,
    };
  };

  const barVariants = {
    initial: {
      y: 500, // Start from below
      opacity: 0,
    },
    animate: (idx) => ({
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        delay: idx * 0.03, // Faster delay for smoother wave
        type: "spring",
        stiffness: 80,
        damping: 8,
      },
    }),
    exit: {
      y: 500,
      opacity: 0,
    },
  };

  const toggleSettingsSidebar = () => {
    setShowSettingsSidebar(!showSettingsSidebar);
  };

  return (
    <div className="flex flex-col w-full overflow-y-auto bg-slate-800">
      {/* Fixed Header Section - simplified for better mobile visibility */}
      <div className="fixed w-full right-0 z-40 p-2 border-b shadow-lg top-16 left-0 md:left-64 bg-slate-800 border-slate-700 mt-4 sm:mt-6 md:mt-8 pt-2 sm:pt-3 md:pt-3">
        {/* Algorithm Title and Settings - Combined in one line */}
        <div className="flex flex-row items-center justify-evenly">
          <div className="flex items-center">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-400 capitalize mr-3">
              {algorithm?.replace("-", " ")}
            </h2>
            {isSorted && (
              <span className="inline-block px-2 py-1 text-xs text-green-400 border border-green-400 rounded">
                Sorting Complete
              </span>
            )}
          </div>

          {/* Quick settings controls for larger screens - now in same line as algorithm name */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Array size control */}
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium text-gray-300">Size:</span>
              <input
                type="number"
                min="5"
                max="200"
                value={customSize}
                onChange={handleSizeChange}
                onKeyPress={handleInputKeyPress}
                className="w-12 px-1 py-1 text-white border rounded bg-slate-700 border-slate-600"
                disabled={isSorting}
              />
              <button
                onClick={handleSizeSubmit}
                className="px-1 py-1 text-xs bg-blue-500 rounded hover:bg-blue-600 disabled:opacity-50"
                disabled={isSorting}
              >
                Apply
              </button>
            </div>

            {/* Sort direction toggle */}
            <div className="flex items-center">
              <button
                onClick={toggleSortOrder}
                className="px-2 py-1 text-sm bg-indigo-600 rounded hover:bg-indigo-700 flex items-center gap-1"
                disabled={isSorting && isPlaying}
              >
                {isAscending ? (
                  <>
                    Ascending <span className="text-xs">▲</span>
                  </>
                ) : (
                  <>
                    Descending <span className="text-xs">▼</span>
                  </>
                )}
              </button>
            </div>

            {/* Speed control */}
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium text-gray-300">Speed:</span>
              <input
                type="range"
                min="1"
                max="100"
                value={speed}
                onChange={handleSpeedChange}
                className="w-24"
                disabled={isSorting && isPlaying}
              />
              <span className="text-xs text-gray-400 w-8">{speed}%</span>
            </div>
          </div>

          {/* Mobile settings button moved to footer only */}
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
                  value={customSize}
                  onChange={handleSizeChange}
                  onKeyPress={handleInputKeyPress}
                  className="w-20 px-2 py-1 text-white border rounded bg-slate-700 border-slate-600"
                  disabled={isSorting}
                />
                <button
                  onClick={handleSizeSubmit}
                  className="px-3 py-1 text-sm bg-blue-500 rounded hover:bg-blue-600 disabled:opacity-50"
                  disabled={isSorting}
                >
                  Apply
                </button>
              </div>
              <input
                type="range"
                min="5"
                max="200"
                value={customSize}
                onChange={handleSizeChange}
                className="w-full"
                disabled={isSorting}
              />
            </div>
          </div>

          {/* Sort Direction */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-400 mb-2">
              Sort Direction
            </h4>
            <button
              onClick={toggleSortOrder}
              className="w-full px-4 py-2 text-sm text-white bg-indigo-600 rounded hover:bg-indigo-700 flex items-center justify-center gap-2"
            >
              {isAscending ? (
                <>
                  <span>Ascending</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </>
              ) : (
                <>
                  <span>Descending</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </>
              )}
            </button>
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

          {/* Custom Array Input */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-400 mb-2">
              Custom Array
            </h4>
            <div className="flex flex-col gap-2">
              <textarea
                value={customArrayInput}
                onChange={(e) => setCustomArrayInput(e.target.value)}
                placeholder="Enter comma-separated numbers"
                className="w-full px-2 py-1 text-white border rounded bg-slate-700 border-slate-600 h-20"
                disabled={isSorting}
              />
              <button
                onClick={handleCustomArraySubmit}
                className="w-full px-3 py-2 text-sm bg-blue-500 rounded hover:bg-blue-600 disabled:opacity-50"
                disabled={isSorting}
              >
                Apply Custom Array
              </button>
            </div>
          </div>

          {/* Generate New Array Button */}
          <button
            onClick={handleGenerateNewArray}
            className="w-full px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 mb-4"
            disabled={isSorting && isPlaying}
          >
            Generate Random Array
          </button>
        </div>
      </motion.div>

      {/* Scrollable Content Section - using percentage-based margins for better mobile and tablet responsiveness */}
      <div className="pb-20 mt-[20%] sm:mt-[15%] md:mt-[12%] lg:mt-10">
        <div className="flex-1 p-2 sm:p-6 mx-2 sm:mx-4 rounded-lg bg-slate-900">
          <div
            ref={scrollContainerRef}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            className="h-[calc(100vh-170px)] sm:h-[calc(100vh-180px)] overflow-x-scroll overflow-y-hidden cursor-grab active:cursor-grabbing touch-pan-x scrollbar-thin scrollbar-track-slate-700 scrollbar-thumb-blue-500 hover:scrollbar-thumb-blue-400 pb-4"
          >
            <div className="relative flex items-end min-h-full pt-8 pr-[200px]">
              <div
                className="relative h-full w-full min-w-full"
                style={{ width: `${getBarDimensions().containerWidth}` }}
              >
                {array.map((value, idx) => {
                  const { barWidth, gap } = getBarDimensions();
                  const isSwapping =
                    idx === currentIndex || idx === compareIndex;
                  const position = idx * (barWidth + gap);

                  // Ensure value is a number
                  const numericValue =
                    typeof value === "object" ? value.value : value;

                  const maxHeight = 430;
                  const scale = maxHeight / Math.max(...array);
                  const barHeight = numericValue * scale;

                  return (
                    <motion.div
                      key={`bar-${idx}`}
                      className={`absolute ${getBarColor(
                        idx
                      )} transition-colors duration-200 bottom-[50px]`}
                      initial={!isSorting ? { y: 1000, opacity: 0 } : false}
                      animate={{
                        x: position,
                        ...(!isSorting && !isPlaying
                          ? {
                              y: 0,
                              opacity: 1,
                            }
                          : {}),
                        transition: {
                          y: {
                            duration: 0.5,
                            delay: idx * 0.02,
                            type: "spring",
                            stiffness: 50,
                            damping: 8,
                          },
                          x: {
                            type: "tween",
                            duration: 0.4,
                            ease: "easeInOut",
                          },
                        },
                      }}
                      style={{
                        height: `${barHeight}px`,
                        width: barWidth,
                      }}
                    >
                      {/* Value label with improved positioning */}
                      <motion.div
                        className={`absolute w-full text-center -top-8
                          text-[14px] sm:text-[15px] font-medium ${
                            isSwapping ? "text-orange-300" : "text-gray-300"
                          }`}
                        animate={{ scale: isSwapping ? 1.1 : 1 }}
                      >
                        {numericValue}
                      </motion.div>

                      {/* Index label with improved positioning */}
                      <motion.div
                        className={`absolute w-full text-center -bottom-6
                          text-[14px] sm:text-[15px] font-medium ${
                            isSwapping ? "text-orange-300" : "text-green-400"
                          }`}
                        animate={{ scale: isSwapping ? 1.1 : 1 }}
                      >
                        {idx}
                      </motion.div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Footer Section */}
      <div className="fixed bottom-0 right-0 z-40 flex flex-row justify-between items-center w-full p-3 sm:p-4 border-t shadow-lg left-0 md:left-64 bg-slate-800 border-slate-700">
        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleGenerateNewArray}
            className="px-3 sm:px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 text-sm sm:text-base"
          >
            {isSorted ? "New Array" : "Randomize"}
          </button>
          <button
            onClick={handlePlayPause}
            disabled={!array.length || isSorted}
            className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base ${
              isPlaying
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
            } disabled:opacity-50`}
          >
            {isPlaying ? "Pause" : isSorting ? "Resume" : "Start"}
          </button>
        </div>

        {/* Settings button in footer for quick access */}
        <button
          onClick={toggleSettingsSidebar}
          className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2 lg:hidden"
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
  );
};

export default SortingVisualizer;
