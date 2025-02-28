import React, { useEffect } from 'react'
import { motion, AnimatePresence } from "motion/react"
import useBacktrackingStore from '../../store/backtrackingStore'

const NQueensVisualizer = () => {
  const { board, boardSize, solutions, currentSolution, isPlaying } = useBacktrackingStore()

  // Calculate cell size to ensure perfect squares
  const cellSize = Math.min(480 / boardSize, 60)
  
  // Handle empty board case gracefully
  const safeBoard = board && board.length === boardSize ? 
    board : 
    Array(boardSize).fill().map(() => Array(boardSize).fill(0))
  
  return (
    <div className="flex flex-col gap-6">
      {/* Algorithm explanation */}
      <div className="p-4 bg-slate-800 rounded-lg">
        <h3 className="text-lg font-bold text-white mb-2">N-Queens Problem</h3>
        <p className="text-gray-300 mb-2">
          The N-Queens problem asks how to place N queens on an N×N chessboard so that no queen 
          threatens any other. A queen can attack horizontally, vertically, or diagonally.
        </p>
        <div className="text-gray-300">
          <h4 className="font-semibold">Backtracking Approach:</h4>
          <ol className="list-decimal pl-5 mt-1">
            <li>Start with an empty board</li>
            <li>Place queens one by one in each column</li>
            <li>For each column, try placing a queen in each row</li>
            <li>Check if the position is safe (no attack possible)</li>
            <li>If safe, recursively try placing remaining queens</li>
            <li>If we cannot place all queens, backtrack and try another position</li>
          </ol>
        </div>
      </div>

      {/* Chessboard Visualization with proper border */}
      <div className="flex justify-center">
        <div 
          className="border-2 border-gray-600 rounded"
          style={{ 
            width: `${boardSize * cellSize + 2}px`, // Add 2px for border
            height: `${boardSize * cellSize + 2}px` // Add 2px for border
          }}
        >
          <div 
            key={`board-${boardSize}`}
            className="grid"
            style={{ 
              gridTemplateColumns: `repeat(${boardSize}, ${cellSize}px)`,
              gridTemplateRows: `repeat(${boardSize}, ${cellSize}px)`,
              width: `${boardSize * cellSize}px`,
              height: `${boardSize * cellSize}px`,
            }}
          >
            {safeBoard.map((row, rowIndex) => (
              row.map((cell, colIndex) => {
                const isDarkSquare = (rowIndex + colIndex) % 2 === 1;
                const cellKey = `cell-${boardSize}-${rowIndex}-${colIndex}`;
                
                return (
                  <div
                    key={cellKey}
                    className={`flex items-center justify-center ${
                      isDarkSquare ? 'bg-gray-700' : 'bg-gray-500'
                    } relative`}
                    style={{
                      width: `${cellSize}px`,
                      height: `${cellSize}px`
                    }}
                  >
                    <AnimatePresence mode="wait">
                      {cell === 1 && (
                        <motion.div
                          key={`queen-${boardSize}-${rowIndex}-${colIndex}`}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ 
                            type: "spring", 
                            stiffness: 500, 
                            damping: 20,
                            duration: 0.3
                          }}
                          className="flex items-center justify-center absolute"
                          style={{
                            width: `${cellSize * 0.7}px`,
                            height: `${cellSize * 0.7}px`,
                            borderRadius: '50%',
                            backgroundColor: '#FBBF24',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
                          }}
                        >
                          <span 
                            className="text-yellow-800"
                            style={{
                              fontSize: `${cellSize * 0.5}px`,
                              fontWeight: 'bold',
                              lineHeight: 1
                            }}
                          >
                            ♕
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })
            ))}
          </div>
        </div>
      </div>

      {/* Status indicator */}
      <div className="flex justify-center mt-2">
        <div className={`px-3 py-1 rounded-full text-white ${
          isPlaying ? 'bg-green-500' : 'bg-blue-500'
        }`}>
          {isPlaying ? 'Solving...' : solutions.length > 0 ? 'Solutions Found' : 'Ready'}
        </div>
      </div>

      {/* Results */}
      <div className="p-4 bg-slate-800 rounded-lg">
        <h3 className="text-lg font-bold text-white mb-2">Solutions</h3>
        {solutions && solutions.length > 0 ? (
          <div className="text-green-300">
            Found {solutions.length} solution(s) for {boardSize}×{boardSize} board
            {currentSolution !== undefined && (
              <p className="text-sm text-white mt-1">
                Currently viewing solution #{currentSolution + 1}
              </p>
            )}
          </div>
        ) : (
          <div className="text-gray-400">
            Run the algorithm to find solutions
          </div>
        )}
      </div>
      
      {/* Visual representation of the solution */}
      {solutions && solutions.length > 0 && (
        <div className="p-4 bg-slate-800 rounded-lg">
          <h3 className="text-lg font-bold text-white mb-2">Solution #{currentSolution + 1} Pattern</h3>
          <div className="font-mono text-green-300 whitespace-pre">
            {solutions[currentSolution]?.map(row => 
              row.map(cell => cell ? 'Q' : '.').join(' ')
            ).join('\n')}
          </div>
        </div>
      )}
    </div>
  )
}

export default NQueensVisualizer
