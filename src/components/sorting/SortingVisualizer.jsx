import { useEffect, useState, useRef } from "react"; // Removed unused React import
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
  // Removed unused showCustomInput state
  const scrollContainerRef = useRef(null);
  const [showSettingsSidebar, setShowSettingsSidebar] = useState(false);

  // Store the user's last manually set size using ref
  const userSelectedSizeRef = useRef(arraySize);

  // First effect - for algorithm setup
  useEffect(() => {
    if (algorithm) {
      const formattedAlgo = algorithm
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      setCurrentAlgorithm(formattedAlgo);
    }

    // Only generate a new array if this is the initial mount
    // Don't reset array size or generate new array on re-renders
    if (!array.length) {
      generateNewArray();
    }

    setIsSorting(false);
    // Keep customSize synced with arraySize
    setCustomSize(arraySize);
  }, [
    algorithm,
    setCurrentAlgorithm,
    generateNewArray,
    array.length,
    arraySize,
  ]);

  // Update ref when array size changes
  useEffect(() => {
    userSelectedSizeRef.current = arraySize;
    setCustomSize(arraySize); // Keep customSize synced with actual array size
  }, [arraySize]);

  // Separate effect for window resize
  useEffect(() => {
    const handleResize = () => {
      // Only change size automatically if window size category changes dramatically
      const width = window.innerWidth;

      // If user has manually set a size, don't override it on minor resize events
      if (
        (width < 640 && arraySize > 40) ||
        (width >= 640 && width < 1024 && arraySize > 80) ||
        (width >= 1024 && arraySize > 150)
      ) {
        // Only adjust for major device category changes (like desktop to mobile)
        let newSize;
        if (width < 640) newSize = 16;
        else if (width < 1024) newSize = 26;
        else newSize = 36;

        setArraySize(newSize);
        setCustomSize(newSize);
      }
    };

    // Use a debounced version of the resize handler to prevent frequent updates
    let resizeTimeout;
    const debouncedHandleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(handleResize, 500);
    };

    window.addEventListener("resize", debouncedHandleResize);
    return () => {
      window.removeEventListener("resize", debouncedHandleResize);
      clearTimeout(resizeTimeout);
    };
  }, [arraySize, setArraySize]);

  // Clean up effect
  useEffect(() => {
    return () => {
      pauseSorting();
      setIsSorting(false);
    };
  }, [pauseSorting]); // Added missing dependency

  const handleSizeChange = (e) => {
    const value = Number(e.target.value);
    setCustomSize(value);
  };

  // Modified to prevent immediate array size reset
  const handleSizeSubmit = () => {
    if (isSorting) return; // Don't change during active sorting

    // Ensure size is within allowed limits
    const minSize = getMinSize();
    const maxSize = getMaxSize();

    const size = Math.min(Math.max(minSize, customSize), maxSize);

    // Update both local and global state
    setCustomSize(size);

    // Apply the size directly without relying on the store to reset it
    const arrayLength = setArraySize(size);

    // Ensure our local customSize stays in sync
    if (arrayLength && arrayLength !== size) {
      setCustomSize(arrayLength);
    }
  };

  // Helper function to get minimum size based on device
  const getMinSize = () => {
    if (window.innerWidth < 640) return 10; // Mobile
    if (window.innerWidth < 1024) return 16; // Tablet
    return 20; // Desktop
  };

  // Get maximum size based on device
  const getMaxSize = () => {
    if (window.innerWidth < 640) return 30; // Mobile
    if (window.innerWidth < 1024) return 50; // Tablet
    return 200; // Desktop
  };

  // Replace deprecated onKeyPress with onKeyDown
  const handleKeyDown = (e) => {
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
        setCustomArrayInput(""); // Clear input field after applying
        setCustomSize(values.length); // Update customSize to match the new array length
      }
    } catch (error) {
      console.error("Invalid input:", error);
    }
  };

  const getBarDimensions = () => {
    if (!array || array.length === 0) {
      return { barWidth: 0, gap: 0, containerWidth: "w-full" };
    }

    const screenWidth = window.innerWidth;
    const isMobile = screenWidth < 640;
    const isTablet = screenWidth >= 640 && screenWidth < 1024;

    // Calculate container width based on screen size
    const containerWidth = screenWidth - (isMobile ? 20 : isTablet ? 60 : 300);
    const rightPadding = isMobile ? 40 : 200;

    // Adjust gap size based on array length and device
    let minGap;
    if (isMobile) {
      minGap = array.length <= 20 ? 2 : 1;
    } else if (isTablet) {
      minGap = array.length <= 30 ? 3 : 2;
    } else {
      minGap = array.length <= 40 ? 4 : 2;
    }

    // Calculate bar width based on available space
    let barWidth = Math.max(
      8, // Minimum width for visibility
      Math.floor(
        (containerWidth - rightPadding - array.length * minGap) / array.length
      )
    );

    // Ensure bars aren't too wide on devices
    if (isMobile) {
      barWidth = Math.min(barWidth, 30);
    } else if (isTablet) {
      barWidth = Math.min(barWidth, 40);
    }

    // Calculate total width needed
    const totalWidth = (barWidth + minGap) * array.length + rightPadding + 100;

    return {
      barWidth,
      gap: minGap,
      containerWidth: totalWidth,
    };
  };

  const toggleSettingsSidebar = () => {
    setShowSettingsSidebar(!showSettingsSidebar);
  };

  // Add real-time size change handler for range slider
  // Modified slider handler to use a debounce pattern
  const handleSliderSizeChange = (e) => {
    const value = Number(e.target.value);
    setCustomSize(value);

    if (sliderTimeoutRef.current) {
      clearTimeout(sliderTimeoutRef.current);
    }

    // Use ref to store the timeout ID
    sliderTimeoutRef.current = setTimeout(() => {
      if (!isSorting) {
        // Apply the size directly like handleSizeSubmit
        const arrayLength = setArraySize(value);

        // Ensure our local customSize stays in sync
        if (arrayLength && arrayLength !== value) {
          setCustomSize(arrayLength);
        }
      }
    }, 300); // 300ms debounce
  };

  // Create a ref to store the timeout ID for the slider
  const sliderTimeoutRef = useRef(null);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (sliderTimeoutRef.current) {
        clearTimeout(sliderTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col w-full overflow-y-auto bg-slate-800">
      {/* Fixed Header Section - simplified for better mobile visibility */}
      <div className="fixed left-0 right-0 z-40 w-full p-2 pt-2 mt-4 border-b shadow-lg top-16 md:left-64 bg-slate-800 border-slate-700 sm:mt-6 md:mt-8 sm:pt-3 md:pt-3">
        {/* Algorithm Title and Settings - Combined in one line with tighter spacing */}
        <div className="flex flex-row items-center px-1 lg:mt-2 justify-evenly">
          <div className="flex items-center">
            <h2 className="mr-2 text-lg font-bold text-blue-400 capitalize sm:text-xl lg:text-2xl">
              {algorithm?.replace("-", " ")}
            </h2>
            {isSorted && (
              <span className="inline-block px-2 py-1 text-xs text-green-400 border border-green-400 rounded">
                Sorting Complete
              </span>
            )}
          </div>

          {/* Quick settings controls with tighter spacing */}
          <div className="items-center hidden gap-2 lg:flex">
            {/* Array size control with more compact layout */}
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium text-gray-300">Size:</span>
              <input
                type="number"
                min="5"
                max="200"
                value={customSize}
                onChange={handleSizeChange}
                onKeyDown={handleKeyDown}
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

            {/* Custom Array Input - more compact */}
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={customArrayInput}
                onChange={(e) => setCustomArrayInput(e.target.value)}
                placeholder="Custom array (e.g., 5,3,8,1)"
                className="w-48 px-2 py-1 text-sm text-white border rounded bg-slate-700 border-slate-600"
                disabled={isSorting}
                onKeyDown={(e) =>
                  e.key === "Enter" && handleCustomArraySubmit()
                }
              />
              <button
                onClick={handleCustomArraySubmit}
                className="px-1 py-1 text-xs bg-blue-500 rounded hover:bg-blue-600 disabled:opacity-50"
                disabled={isSorting}
                title="Apply custom array"
              >
                Apply
              </button>
            </div>

            {/* Sort direction toggle - more compact */}
            <button
              onClick={toggleSortOrder}
              className="flex items-center gap-1 px-2 py-1 text-sm bg-indigo-600 rounded hover:bg-indigo-700"
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

            {/* Speed control - more compact */}
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium text-gray-300">Speed:</span>
              <input
                type="range"
                min="1"
                max="100"
                value={speed}
                onChange={handleSpeedChange}
                className="w-20"
                disabled={isSorting && isPlaying}
              />
              <span className="w-6 text-xs text-gray-400">{speed}%</span>
            </div>
          </div>
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
                className="w-8 h-8"
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
            <h4 className="mb-2 text-sm font-semibold text-gray-400">
              Array Size
            </h4>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="5"
                  max={getMaxSize()}
                  value={customSize}
                  onChange={handleSizeChange}
                  onKeyDown={handleKeyDown}
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
                max={getMaxSize()}
                value={customSize}
                onChange={handleSliderSizeChange}
                className="w-full"
                disabled={isSorting}
              />
              <div className="text-xs text-center text-gray-400">
                Current size: {arraySize}
              </div>
            </div>
          </div>

          {/* Sort Direction */}
          <div className="mb-6">
            <h4 className="mb-2 text-sm font-semibold text-gray-400">
              Sort Direction
            </h4>
            <button
              onClick={toggleSortOrder}
              className="flex items-center justify-center w-full gap-2 px-4 py-2 text-sm text-white bg-indigo-600 rounded hover:bg-indigo-700"
            >
              {isAscending ? (
                <>
                  <span>Ascending</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
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
                    className="w-4 h-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 011.414 1.414l-4 4a1 1 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </>
              )}
            </button>
          </div>

          {/* Animation Speed Control */}
          <div className="mb-6">
            <h4 className="mb-2 text-sm font-semibold text-gray-400">
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
                  className="px-2 py-1 text-white bg-blue-600 rounded-l hover:bg-blue-700"
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

          {/* Custom Array Input */}
          <div className="mb-6">
            <h4 className="mb-2 text-sm font-semibold text-gray-400">
              Custom Array
            </h4>
            <div className="flex flex-col gap-2">
              <textarea
                value={customArrayInput}
                onChange={(e) => setCustomArrayInput(e.target.value)}
                placeholder="Enter comma-separated numbers"
                className="w-full h-20 px-2 py-1 text-white border rounded bg-slate-700 border-slate-600"
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
            className="w-full px-4 py-2 mb-4 text-white bg-green-600 rounded-lg hover:bg-green-700"
            disabled={isSorting && isPlaying}
          >
            Generate Random Array
          </button>
        </div>
      </motion.div>

      {/* Scrollable Content Section - using percentage-based margins for better mobile and tablet responsiveness */}
      <div className="pb-20 mt-[20%] sm:mt-[15%] md:mt-[12%] lg:mt-10">
        <div className="flex-1 p-2 mx-2 rounded-lg sm:p-6 sm:mx-4 bg-slate-900">
          <div
            ref={scrollContainerRef}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            className="h-[calc(100vh-170px)] sm:h-[calc(100vh-180px)] overflow-x-scroll overflow-y-hidden cursor-grab active:cursor-grabbing touch-pan-x scrollbar-thin scrollbar-track-slate-700 scrollbar-thumb-blue-500 hover:scrollbar-thumb-blue-400 pb-4"
          >
            <div className="relative flex items-end min-h-full pt-8 pr-[200px]">
              <div
                className="relative w-full h-full min-w-full"
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
      <div className="fixed bottom-0 left-0 right-0 z-40 flex flex-row items-center justify-between w-full p-3 border-t shadow-lg sm:p-4 md:left-64 bg-slate-800 border-slate-700">
        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleGenerateNewArray}
            className="px-3 py-2 text-sm text-white bg-blue-600 rounded-lg sm:px-4 hover:bg-blue-700 sm:text-base"
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
          className="flex items-center gap-2 px-3 py-2 text-white bg-gray-600 rounded-lg hover:bg-gray-700 lg:hidden"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          Settings
        </button>
      </div>
    </div>
  );
};

export default SortingVisualizer;
