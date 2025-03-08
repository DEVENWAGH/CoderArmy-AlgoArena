import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { motion } from "motion/react";
import useAlgorithmStore from "../../store/algorithmStore";
import { nanoid } from "nanoid";

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
    const maxHeight = 450; // Reduced from 500 to ensure bars fit better on mobile
    const scale = maxHeight / Math.max(...array);
    return `${value * scale}px`;
  };

  // Calculate container width based on array size
  const getContainerWidth = () => {
    if (arraySize <= 30) return "80%";
    if (arraySize <= 50) return "90%";
    return `${Math.max(100, array.length * 12)}%`;
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
      return { barWidth: 0, gap: 0, containerWidth: "100%" };
    }

    const isMobile = window.innerWidth < 768;

    // Adjust container width calculation for different screen sizes
    const containerWidth = window.innerWidth - (isMobile ? 20 : 300);
    const rightPadding = isMobile ? 40 : 200;
    const minGap = isMobile ? 2 : 3; // Reduced gap on mobile for more bars

    // Slightly smaller bars for mobile to fit 26 bars
    const maxBarWidth = isMobile ? 40 : 50; // Reduced from 60 to 40 on mobile
    const minBarWidth = isMobile ? 20 : 20; // Reduced from 30 to 20 on mobile

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
      containerWidth: `${totalWidth}px`,
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

  return (
    <div className="flex flex-col w-full overflow-y-auto bg-slate-800">
      {/* Fixed Header Section - completely redesigned for better mobile visibility */}
      <div className="fixed right-0 z-40 p-2 pb-3 border-b shadow-lg top-16 left-0 md:left-64 bg-slate-800 border-slate-700 mt-4 sm:mt-6 md:mt-8 pt-4 sm:pt-6 md:pt-8 lg:pt-auto lg:mt-2">
        {/* Algorithm Title - Separate section for cleaner mobile layout */}
        <div className="mb-2 pt-2">
          <h2 className="text-xl sm:text-2xl font-bold text-blue-400 capitalize">
            {algorithm?.replace("-", " ")}
          </h2>
          {isSorted && (
            <span className="inline-block mt-1 px-3 py-1 text-xs sm:text-sm text-green-400 border border-green-400 rounded">
              Sorting Complete
            </span>
          )}
        </div>

        {/* Controls - Stacked vertically on mobile for better spacing */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Array Size Input */}
          <div className="flex items-center gap-2">
            <label className="text-gray-300 text-sm sm:text-base w-12">
              Size:
            </label>
            <input
              type="number"
              min="5"
              max="200"
              value={customSize}
              onChange={handleSizeChange}
              onKeyPress={handleInputKeyPress}
              className="w-16 px-2 py-1 text-white border rounded bg-slate-700 border-slate-600"
              disabled={isSorting}
            />
            <button
              onClick={handleSizeSubmit}
              className="px-3 py-1 text-xs sm:text-sm bg-blue-500 rounded hover:bg-blue-600 disabled:opacity-50"
              disabled={isSorting}
            >
              Apply
            </button>
          </div>

          {/* Speed Control */}
          <div className="flex items-center gap-2">
            <label className="text-gray-300 text-sm sm:text-base w-12">
              Speed:
            </label>
            <input
              type="range"
              min="1"
              max="100"
              value={speed}
              onChange={handleSpeedChange}
              className="flex-grow min-w-[100px]"
            />
            <span className="w-10 text-center text-gray-300 text-sm sm:text-base">
              {speed}%
            </span>
          </div>

          {/* Sort Direction */}
          <div className="flex items-center">
            <label className="text-gray-300 text-sm sm:text-base w-12">
              Order:
            </label>
            <button
              onClick={toggleSortOrder}
              className="px-4 py-1 text-sm text-white bg-indigo-600 rounded hover:bg-indigo-700"
            >
              {isAscending ? "Ascending ↑" : "Descending ↓"}
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Content Section - using percentage-based margins for better mobile and tablet responsiveness */}
      <div className="pb-20 mt-[40%] sm:mt-[5%] md:mt-[0%] lg:mt-16">
        <div className="flex-1 p-2 sm:p-6 mx-2 sm:mx-4 rounded-lg bg-slate-900">
          <div
            ref={scrollContainerRef}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            className="h-[calc(100vh-170px)] sm:h-[calc(100vh-180px)] overflow-x-scroll overflow-y-hidden cursor-grab active:cursor-grabbing touch-pan-x scrollbar-thin scrollbar-track-slate-700 scrollbar-thumb-blue-500 hover:scrollbar-thumb-blue-400"
          >
            <div
              className="relative flex items-end min-h-full"
              style={{
                minWidth: getBarDimensions().containerWidth,
                height: "100%",
                paddingTop: "2rem",
                paddingBottom: "2.5rem", // Increased padding for better visibility
                paddingRight: "200px",
              }}
            >
              <div
                className="relative h-full"
                style={{
                  width: getBarDimensions().containerWidth,
                  minWidth: "100%",
                }}
              >
                {array.map((value, idx) => {
                  const { barWidth, gap } = getBarDimensions();
                  const isSwapping =
                    idx === currentIndex || idx === compareIndex;
                  const position = idx * (barWidth + gap);

                  // Ensure value is a number
                  const numericValue =
                    typeof value === "object" ? value.value : value;

                  return (
                    <motion.div
                      key={`bar-${idx}`}
                      className={`absolute ${getBarColor(
                        idx
                      )} transition-colors duration-200`}
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
                        height: getBarHeight(numericValue),
                        width: barWidth,
                        bottom: "36px", // Increased bottom margin for index numbers
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
                        className={`absolute w-full text-center -bottom-8
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
      <div className="fixed bottom-0 right-0 z-40 flex flex-row justify-center md:justify-start w-full gap-4 p-3 sm:p-4 border-t shadow-lg left-0 md:left-64 bg-slate-800 border-slate-700">
        {" "}
        {/* Changed to flex-row and centered on mobile */}
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
    </div>
  );
};

export default SortingVisualizer;
