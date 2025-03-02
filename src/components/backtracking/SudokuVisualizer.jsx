import React, { useState } from 'react'
import { motion, AnimatePresence } from "motion/react"
import useBacktrackingStore from '../../store/backtrackingStore'
import SudokuCodeView from './SudokuCodeView'

const SudokuVisualizer = () => {
  const { 
    board, 
    solutions, 
    steps,
    currentStep,
    currentSolution, 
    isPlaying,
    isPaused,
    difficulty,
    setCellValue,
    setDifficulty
  } = useBacktrackingStore()
  
  const [showCode, setShowCode] = useState(false);
  
  // Cell size calculation for responsive design
  const cellSize = 40
  const gridSize = cellSize * 9
  
  // Cell highlight handlers
  const handleCellClick = (row, col) => {
    // Prevent editing during algorithm execution
    if (isPlaying || isPaused) return
    
    // Get current value
    const currentValue = board[row][col]
    
    // If it's an original cell (negative value), don't allow changes
    if (currentValue < 0) return
    
    // Cycle through values 0-9 (0 = empty)
    const newValue = (currentValue + 1) % 10
    setCellValue(row, col, newValue)
  }
  
  // Safe access to board
  const safeBoard = Array.isArray(board) && board.length === 9 && board[0].length === 9 
    ? board 
    : Array(9).fill().map(() => Array(9).fill(0))
  
  // Create UI grid from board data
  const renderGrid = () => {
    return (
      <div 
        className="grid grid-cols-9 gap-[1px] border-2 border-gray-800"
        style={{ width: gridSize + 18, height: gridSize + 18 }}
      >
        {safeBoard.map((row, rowIndex) => (
          row.map((cell, colIndex) => {
            // Original cells have negative values for tracking
            const isOriginal = cell < 0
            const displayValue = Math.abs(cell)
            const isEmpty = displayValue === 0
            
            // Check if cell is in the active box
            const boxRow = Math.floor(rowIndex / 3)
            const boxCol = Math.floor(colIndex / 3)
            const boxIndex = boxRow * 3 + boxCol
            const isBoxShaded = (boxIndex % 2) === 1
            
            return (
              <motion.div
                key={`cell-${rowIndex}-${colIndex}`}
                className={`
                  flex items-center justify-center
                  ${isBoxShaded ? 'bg-slate-700' : 'bg-slate-800'}
                  ${isOriginal ? 'text-white font-bold' : 'text-blue-300'}
                  cursor-pointer select-none
                `}
                style={{ width: cellSize, height: cellSize }}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <AnimatePresence mode="wait">
                  {!isEmpty && (
                    <motion.span
                      key={`num-${displayValue}`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="text-lg"
                    >
                      {displayValue}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })
        ))}
      </div>
    )
  }
  
  // Difficulty selector
  const renderDifficultySelector = () => (
    <div className="flex gap-2 mt-4">
      <span className="text-white">Difficulty:</span>
      {['easy', 'medium', 'hard'].map(level => (
        <button
          key={level}
          onClick={() => setDifficulty(level)}
          className={`px-3 py-1 rounded ${
            difficulty === level 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-700 text-gray-300'
          }`}
          disabled={isPlaying || isPaused}
        >
          {level.charAt(0).toUpperCase() + level.slice(1)}
        </button>
      ))}
    </div>
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Algorithm explanation */}
      <div className="p-4 bg-slate-800 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold text-white">Sudoku Solver</h3>
          <button 
            onClick={() => setShowCode(!showCode)}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-full"
          >
            {showCode ? "Hide Code" : "Show Code"}
          </button>
        </div>
        <p className="text-gray-300 mb-2">
          Sudoku is a 9×9 grid that must be filled with digits 1-9 so that each row, column, and
          3×3 subgrid contains all numbers from 1 to 9 without repetition.
        </p>
        <div className="text-gray-300">
          <h4 className="font-semibold">Backtracking Approach:</h4>
          <ol className="list-decimal pl-5 mt-1">
            <li>Find an empty cell in the grid</li>
            <li>Try placing digits 1-9 in the empty cell</li>
            <li>Check if the digit is valid in the current position</li>
            <li>If valid, recursively solve the rest of the puzzle</li>
            <li>If we get stuck, backtrack and try another digit</li>
            <li>Repeat until the entire grid is filled</li>
          </ol>
        </div>
      </div>

      {/* Main Content - Splits into Code + Visualization when code view is active */}
      <div className={`flex ${showCode ? 'space-x-4' : ''}`}>
        {/* Code View - Only shows when toggled on */}
        {showCode && (
          <div className="w-1/2 h-[500px]">
            <SudokuCodeView 
              isPlaying={isPlaying} 
              currentStep={currentStep}
            />
          </div>
        )}

        {/* Sudoku Grid */}
        <div className={`flex justify-center items-center flex-col ${showCode ? 'w-1/2' : 'w-full'}`}>
          <div className="flex flex-col items-center">
            {/* Sudoku board */}
            {renderGrid()}
            
            {/* Difficulty selector */}
            {renderDifficultySelector()}
            
            {/* Help text */}
            <p className="text-gray-400 mt-4 text-sm">
              Click on empty cells to manually enter numbers before solving.
            </p>
            
            {/* Steps counter - Added for visibility */}
            {steps.length > 0 && (
              <div className="mt-3 text-blue-300">
                Solving progress: Step {currentStep + 1} of {steps.length}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status indicator */}
      <div className="flex justify-center mt-2">
        <div className={`px-3 py-1 rounded-full text-white ${
          isPlaying ? 'bg-green-500' : isPaused ? 'bg-yellow-500' : 'bg-blue-500'
        }`}>
          {isPlaying ? 'Solving...' : isPaused ? 'Paused' : 
           solutions.length > 0 ? 'Solution Found' : 'Ready'}
        </div>
      </div>
      
      {/* Solution statistics */}
      {solutions.length > 0 && (
        <div className="p-4 bg-slate-800 rounded-lg">
          <h3 className="text-lg font-bold text-white mb-2">Solution</h3>
          <div className="text-green-300">
            <p>Sudoku solved successfully!</p>
            <p className="text-sm mt-1">
              {steps.length > 0 ? `Took ${steps.length} steps to find a valid solution.` : ''}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default SudokuVisualizer
