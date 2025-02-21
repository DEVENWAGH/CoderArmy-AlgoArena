import React, { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import useAlgorithmStore from '../../store/algorithmStore'

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
    setCurrentAlgorithm  // Add this
  } = useAlgorithmStore()

  const [isSorting, setIsSorting] = useState(false)
  const [customSize, setCustomSize] = useState(arraySize)
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
    if (isSorted) return 'bg-green-400'
    if (index === currentIndex) return 'bg-green-500'
    if (index === compareIndex) return 'bg-red-500'
    return 'bg-blue-500'
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

  return (
    <div className="flex flex-col w-full p-6 mt-30 bg-slate-800">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-blue-400 capitalize">
          {algorithm?.replace('-', ' ')}
        </h2>
        {isSorted && (
          <span className="px-3 py-1 text-sm text-green-400 border border-green-400 rounded">
            Sorting Complete
          </span>
        )}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-gray-300">Array Size:</label>
            <input 
              type="number"
              min="5"
              max="200"
              value={customSize}
              onChange={handleSizeChange}
              onKeyPress={handleInputKeyPress}
              className="w-20 px-2 py-1 text-white border rounded bg-slate-700 border-slate-600"
              disabled={isSorting}  // Disable input during sorting
            />
            <button
              onClick={handleSizeSubmit}
              className="px-2 py-1 text-sm bg-blue-500 rounded hover:bg-blue-600 disabled:opacity-50"
              disabled={isSorting}  // Disable button during sorting
            >
              Apply
            </button>
          </div>
          
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
            <span className="text-gray-300 w-16">
              {speed}%
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 rounded-lg bg-slate-900">
        <div 
          ref={scrollContainerRef}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          className="h-[600px] overflow-x-auto overflow-y-hidden cursor-grab active:cursor-grabbing touch-pan-x scrollbar-thin scrollbar-track-slate-700 scrollbar-thumb-blue-500 hover:scrollbar-thumb-blue-400"
        >
          <div 
            className="h-full flex items-center justify-center"
          >
            <div 
              className="h-full flex items-end gap-1" 
              style={{ 
                width: getContainerWidth(),
                paddingBottom: '2rem'
              }}
            >
              {array.map((value, idx) => (
                <div
                  key={idx}
                  className={`${getBarWidth()} transition-all duration-150 ${getBarColor(idx)} hover:bg-yellow-500 relative group min-w-[4px]`}
                  style={{ height: getBarHeight(value) }}
                >
                  <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 
                    text-[10px] text-gray-400 whitespace-nowrap">
                    {value}
                  </span>
                  <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 
                    text-[10px] text-gray-400 whitespace-nowrap">
                    {idx}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mt-4">
        <button 
          onClick={handleGenerateNewArray}
          className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 text-white"
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
