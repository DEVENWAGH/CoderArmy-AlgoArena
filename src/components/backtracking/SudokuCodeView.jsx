import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

const SudokuCodeView = ({ isPlaying, currentStep }) => {
  const [highlightedLines, setHighlightedLines] = useState([]);
  const [explanation, setExplanation] = useState('');
  
  // Code snippet for Sudoku solver with line numbers - explicitly showing backtracking
  const codeSnippet = `function solveSudokuWithBacktracking(board) {
  // Find an empty cell
  const emptyCell = findEmptyCell(board);
  
  // Base case: If no empty cell, puzzle is solved
  if (!emptyCell) {
    return true; // Solution found!
  }
  
  const [row, col] = emptyCell;
  
  // Try digits 1-9 for this cell (explore paths)
  for (let num = 1; num <= 9; num++) {
    // Check if it's valid to place this number
    if (isValid(board, row, col, num)) {
      // Place the number (make a choice)
      board[row][col] = num;
      
      // Recursively solve the rest (explore this path)
      if (solveSudokuWithBacktracking(board)) {
        return true; // Solution found!
      }
      
      // BACKTRACKING: This choice led to no solution
      // Undo the choice and try another number
      board[row][col] = 0;
    }
  }
  
  // Trigger backtracking in caller - no valid number works
  return false;
}

function isValid(board, row, col, num) {
  // Check row for duplicates
  for (let x = 0; x < 9; x++) {
    if (board[row][x] === num) return false;
  }
  
  // Check column for duplicates
  for (let x = 0; x < 9; x++) {
    if (board[x][col] === num) return false;
  }
  
  // Check 3x3 box for duplicates
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[boxRow + i][boxCol + j] === num) {
        return false;
      }
    }
  }
  
  return true; // Valid placement
}`;

  const codeLines = codeSnippet.split('\n');

  // Update highlighted lines based on step
  useEffect(() => {
    if (!isPlaying || currentStep === undefined) {
      setHighlightedLines([]);
      setExplanation('');
      return;
    }
    
    // Determine which part of the algorithm we're in based on step count
    const step = currentStep % 10; // Simple way to cycle through phases
    
    if (step < 3) {
      // Finding empty cell phase
      setHighlightedLines([2, 3, 4, 5, 6]);
      setExplanation('Finding the next empty cell to fill in the board.');
    } else if (step < 5) {
      // Trying numbers phase
      setHighlightedLines([10, 11, 12, 13]);
      setExplanation('Trying valid digits (1-9) for the current empty cell.');
    } else if (step < 7) {
      // Checking validity phase
      setHighlightedLines([27, 28, 29, 30, 31, 32, 33]);
      setExplanation('Checking if placing the number violates Sudoku rules (row, column, box).');
    } else if (step < 8) {
      // Placement phase
      setHighlightedLines([14, 15, 16, 17]);
      setExplanation('Placing a valid number and recursively solving the rest of the puzzle.');
    } else {
      // Backtracking phase - highlight this specifically
      setHighlightedLines([21, 22]);
      setExplanation('BACKTRACKING: Current placement led to no solution. Removing the number and trying another option.');
    }
  }, [isPlaying, currentStep]);

  return (
    <div className="flex flex-col w-full h-full bg-gray-900 rounded-lg p-4 overflow-hidden">
      {/* Code container */}
      <div className="flex-1 overflow-y-auto mb-4 font-mono text-sm">
        {codeLines.map((line, index) => (
          <div
            key={index}
            className={`py-1 ${
              highlightedLines.includes(index + 1)
                ? 'bg-yellow-500 bg-opacity-20 text-white'
                : 'text-gray-300'
            }${line.includes('BACKTRACKING') ? ' bg-red-500 bg-opacity-10' : ''}`}
          >
            <span className="text-gray-500 mr-4 inline-block w-6 text-right">{index + 1}</span>
            <span>{line}</span>
          </div>
        ))}
      </div>
      
      {/* Explanation panel with emphasis on backtracking */}
      <motion.div
        className="bg-gray-800 p-3 rounded-lg"
        animate={{ 
          backgroundColor: explanation ? 
            (explanation.includes('BACKTRACKING') ? 
              'rgba(239, 68, 68, 0.2)' : 'rgba(30, 64, 175, 0.3)') : 
            'rgba(31, 41, 55, 0.5)'
        }}
      >
        <h3 className="text-white text-sm font-bold mb-1">Explanation:</h3>
        <p className="text-gray-300 text-sm">
          {explanation || "Run the algorithm to see step-by-step explanations."}
        </p>
      </motion.div>
      
      {/* Key concepts with emphasis on backtracking */}
      <div className="mt-3 p-3 bg-gray-800 bg-opacity-50 rounded-lg">
        <h3 className="text-blue-300 text-sm font-bold">Backtracking Key Concepts:</h3>
        <ul className="mt-1 text-xs text-gray-300 list-disc pl-5 space-y-1">
          <li><span className="font-bold">Explore:</span> Try each possible value for the current cell</li>
          <li><span className="font-bold">Advance:</span> If valid, move to the next empty cell</li>
          <li><span className="font-bold">Backtrack:</span> If stuck, undo last choice and try another option</li>
          <li><span className="font-bold">Solution:</span> Found when all cells are successfully filled</li>
          <li><span className="text-yellow-400">Backtracking is efficient because it abandons invalid paths early</span></li>
        </ul>
      </div>
    </div>
  );
};

export default SudokuCodeView;
