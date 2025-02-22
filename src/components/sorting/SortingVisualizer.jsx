import React, { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from "motion/react"
import useAlgorithmStore from '../../store/algorithmStore'
import { nanoid } from 'nanoid';

const SortingVisualizer = () => {
  const { algorithm } = useParams()
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
    setCustomArray,  // Add this
    isAscending, 
    toggleSortOrder 
  } = useAlgorithmStore()

  const [isSorting, setIsSorting] = useState(false)
  const [customSize, setCustomSize] = useState(arraySize)
  const [customArrayInput, setCustomArrayInput] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)
  const scrollContainerRef = useRef(null)

  useEffect(() => {
    if (algorithm) {
      const formattedAlgo = algorithm.split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
      setCurrentAlgorithm(formattedAlgo)
    }
    generateNewArray()
    setIsSorting(false)
  }, [algorithm])

  useEffect(() => {
    return () => {
      pauseSorting()
      setIsSorting(false)
    }
  }, [])

  const handleSizeChange = (e) => {
    const value = Number(e.target.value)
    setCustomSize(value)
  }

  const handleSizeSubmit = () => {
    const size = Math.min(Math.max(5, customSize), 200)
    setIsSorting(false)
    setArraySize(size)
    setCustomSize(size)
    // Ensure current algorithm is set after size change
    if (algorithm) {
      const formattedAlgo = algorithm.split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
      setCurrentAlgorithm(formattedAlgo)
    }
  }

  const handleInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSizeSubmit()
    }
  }

  const handleSpeedChange = (e) => {
    const newSpeed = Number(e.target.value)
    setSpeed(newSpeed)
  }

  const getBarColor = (index) => {
    if (isSorted) return 'bg-green-500 hover:bg-orange-500' // Keep green for sorted
    if (index === currentIndex) return 'bg-green-500 hover:bg-orange-500' // Red for active comparison
    if (index === compareIndex) return 'bg-red-500 hover:bg-orange-500' // Red for comparing element
    return 'bg-blue-500 hover:bg-orange-500' // Blue by default
  }

  const handlePlayPause = () => {
    if (!array.length || !algorithm) return

    if (isPlaying) {
      pauseSorting()
    } else if (isSorting) {
      resumeSorting()
      setIsPlaying(true)
    } else {
      setIsSorting(true)
      startSorting()
    }
  }

  const handleWheel = (e) => {
    if (scrollContainerRef.current) {
      e.preventDefault()
      scrollContainerRef.current.scrollLeft += e.deltaY
    }
  }

  const handleMouseDown = (e) => {
    const ele = scrollContainerRef.current
    if (!ele) return

    let pos = { left: ele.scrollLeft, x: e.clientX }

    const mouseMoveHandler = (e) => {
      const dx = e.clientX - pos.x
      ele.scrollLeft = pos.left - dx
    }

    const mouseUpHandler = () => {
      document.removeEventListener('mousemove', mouseMoveHandler)
      document.removeEventListener('mouseup', mouseUpHandler)
    }

    document.addEventListener('mousemove', mouseMoveHandler)
    document.addEventListener('mouseup', mouseUpHandler)
  }

  // Calculate bar width based on array size and container width
  const getBarWidth = () => {
    if (arraySize <= 30) return 'w-8'
    if (arraySize <= 50) return 'w-6'
    if (arraySize <= 100) return 'w-4'
    return 'w-3'
  }

  // Calculate dynamic bar height scaling with increased max height
  const getBarHeight = (value) => {
    const maxHeight = 500 // Increased maximum height
    const scale = maxHeight / Math.max(...array)
    return `${value * scale}px`
  }

  // Calculate container width based on array size
  const getContainerWidth = () => {
    if (arraySize <= 30) return '80%'
    if (arraySize <= 50) return '90%'
    return `${Math.max(100, array.length * 12)}%`
  }

  const handleGenerateNewArray = () => {
    generateNewArray()
    setIsSorting(false)
  }

  const handleCustomArraySubmit = () => {
    try {
      const values = customArrayInput
        .split(',')
        .map(num => parseInt(num.trim()))
        .filter(num => !isNaN(num))
      
      if (values.length > 0) {
        // Apply custom values directly
        setCustomArray(values)
        setShowCustomInput(false)
        setCustomArrayInput('')
        setCustomSize(values.length)
      }
    } catch (error) {
      console.error('Invalid input:', error)
    }
  }

  const getBarDimensions = () => {
    if (!array || array.length === 0) {
      return { barWidth: 0, gap: 0, containerWidth: '100%' };
    }

    const containerWidth = window.innerWidth - 300; // Account for sidebar
    const rightPadding = 200; // Increased padding for better scrolling
    const minGap = 4; // Increased gap between bars
    const maxBarWidth = 40;
    const minBarWidth = 15;

    let barWidth = Math.floor((containerWidth - rightPadding) / array.length) - minGap;
    barWidth = Math.min(maxBarWidth, Math.max(minBarWidth, barWidth));
    
    // Add extra space to ensure last bar is fully visible when scrolling
    const totalWidth = (array.length * (barWidth + minGap)) + rightPadding + 100;
    
    return {
      barWidth,
      gap: minGap,
      containerWidth: `${totalWidth}px`
    };
  };

  const barVariants = {
    initial: { 
      y: 500, // Start from below
      opacity: 0
    },
    animate: (idx) => ({
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        delay: idx * 0.03, // Faster delay for smoother wave
        type: "spring",
        stiffness: 80,
        damping: 8
      }
    }),
    exit: {
      y: 500,
      opacity: 0
    }
  }

  return (
    <div className="flex flex-col w-full overflow-y-auto bg-slate-800">
      {/* Fixed Header Section */}
      <div className="fixed right-0 z-40 p-4 border-b shadow-lg top-16 left-64 bg-slate-800 border-slate-700">
        <div className="flex items-center justify-between h-14"> {/* Added h-14 for fixed height */}
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-blue-400 capitalize">
              {algorithm?.replace('-', ' ')}
            </h2>
            {isSorted && (
              <span className="px-3 py-1 text-sm text-green-400 border border-green-400 rounded">
                Sorting Complete
              </span>
            )}
          </div>

          <div className="flex items-center justify-center h-full gap-4"> {/* Added justify-center and h-full */}
            {/* Array Size Input */}
            <div className="flex items-center gap-2">
              <label className="text-gray-300">Size:</label>
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
                className="px-2 py-1 text-sm bg-blue-500 rounded hover:bg-blue-600 disabled:opacity-50"
                disabled={isSorting}
              >
                Apply
              </button>
            </div>

            {/* Custom Array Input */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCustomInput(!showCustomInput)}
                className="px-3 py-1 text-sm text-white bg-purple-600 rounded hover:bg-purple-700"
              >
                {showCustomInput ? 'Hide' : 'Custom'}
              </button>
              
              {showCustomInput && (
                <>
                  <input
                    type="text"
                    value={customArrayInput}
                    onChange={(e) => setCustomArrayInput(e.target.value)}
                    placeholder="Enter numbers separated by commas"
                    className="w-64 px-2 py-1 text-white border rounded bg-slate-700 border-slate-600"
                  />
                  <button
                    onClick={handleCustomArraySubmit}
                    className="px-3 py-1 text-sm bg-blue-500 rounded hover:bg-blue-600"
                  >
                    Apply
                  </button>
                </>
              )}
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
              <span className="w-12 text-center text-gray-300">
                {speed}%
              </span>
            </div>

            {/* Sort Direction */}
            <button
              onClick={toggleSortOrder}
              className="px-3 py-1 text-sm text-white bg-indigo-600 rounded hover:bg-indigo-700"
            >
              {isAscending ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Content Section */}
      <div className="pb-24 mt-24">
        <div className="flex-1 p-6 mx-4 rounded-lg bg-slate-900">
          <div 
            ref={scrollContainerRef}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            className="h-[calc(100vh-180px)] overflow-x-scroll overflow-y-hidden cursor-grab active:cursor-grabbing touch-pan-x scrollbar-thin scrollbar-track-slate-700 scrollbar-thumb-blue-500 hover:scrollbar-thumb-blue-400"
          >
            <div 
              className="relative flex items-end min-h-full"
              style={{ 
                minWidth: getBarDimensions().containerWidth,
                height: '100%',
                paddingTop: '2rem',
                paddingBottom: '1rem',
                paddingRight: '200px' // Add right padding
              }}
            >
              <div
                className="relative h-full"
                style={{
                  width: getBarDimensions().containerWidth,
                  minWidth: '100%'
                }}
              >
                {array.map((value, idx) => {
                  const { barWidth, gap } = getBarDimensions();
                  const isSwapping = idx === currentIndex || idx === compareIndex;
                  const position = idx * (barWidth + gap);
                  
                  // Ensure value is a number
                  const numericValue = typeof value === 'object' ? value.value : value;
                  
                  return (
                    <motion.div
                      key={`bar-${idx}`}
                      className={`absolute ${getBarColor(idx)} transition-colors duration-200`}
                      initial={!isSorting ? { y: 1000, opacity: 0 } : false}
                      animate={{
                        x: position,
                        ...((!isSorting && !isPlaying) ? {
                          y: 0,
                          opacity: 1,
                        } : {}),
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
                            ease: "easeInOut"
                          }
                        }
                      }}
                      style={{ 
                        height: getBarHeight(numericValue),
                        width: barWidth,
                        bottom: '24px', // Added bottom margin for index numbers
                      }}
                    >
                      {/* Value label */}
                      <motion.div 
                        className={`absolute w-full text-center -top-6
                          text-[11px] font-medium ${isSwapping ? 'text-orange-300' : 'text-gray-300'}`}
                        animate={{ scale: isSwapping ? 1.1 : 1 }}
                      >
                        {numericValue}
                      </motion.div>

                      {/* Index label */}
                      <motion.div 
                        className={`absolute w-full text-center -bottom-6
                          text-[11px] font-medium ${isSwapping ? 'text-orange-300' : 'text-green-400'}`}
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
      <div className="fixed bottom-0 right-0 z-40 flex gap-4 p-4 border-t shadow-lg left-64 bg-slate-800 border-slate-700">
        <button 
          onClick={handleGenerateNewArray}
          className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
        >
          {isSorted ? 'Generate New Array' : 'Randomize Array'}
        </button>
        <button 
          onClick={handlePlayPause}
          disabled={!array.length || isSorted}
          className={`px-4 py-2 rounded ${
            isPlaying 
              ? 'bg-red-600 hover:bg-red-700' 
              : 'bg-green-600 hover:bg-green-700'
          } disabled:opacity-50`}
        >
          {isPlaying ? 'Pause' : isSorting ? 'Resume' : 'Start Sorting'}
        </button>
      </div>
    </div>
  )
}

export default SortingVisualizer
