import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import useBacktrackingStore from "../../store/backtrackingStore";

const NQueensVisualizer = () => {
  const {
    board,
    boardSize,
    solutions,
    currentSolution,
    isPlaying,
    speed,
    setSpeed,
  } = useBacktrackingStore();
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);

  // Add responsive viewport tracking
  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Calculate responsive cell size
  const calculateCellSize = () => {
    // Mobile devices
    if (viewportWidth < 640) {
      return Math.min(280 / boardSize, 40);
    }
    // Tablets
    else if (viewportWidth < 1024) {
      return Math.min(380 / boardSize, 50);
    }
    // Desktops
    return Math.min(480 / boardSize, 60);
  };

  const cellSize = calculateCellSize();

  // Handle empty board case gracefully
  const safeBoard =
    board && board.length === boardSize
      ? board
      : Array(boardSize)
          .fill()
          .map(() => Array(boardSize).fill(0));

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      {/* Algorithm explanation - simplified for mobile */}
      <div className="p-3 mt-30 md:mt-20 lg:mt-12 rounded-lg sm:p-4 bg-slate-800">
        <div className="flex flex-wrap justify-between items-center mb-2">
          <h3 className="mb-2 text-lg font-bold text-white">
            N-Queens Problem
          </h3>

          {/* Add speed control for desktop view */}
          <div className="hidden lg:flex items-center gap-2 mt-2 md:mt-0">
            <label className="text-gray-300 whitespace-nowrap">Speed:</label>
            <input
              type="range"
              min="1"
              max="100"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-24 md:w-32"
            />
            <span className="text-gray-300 min-w-[2rem] text-center">
              {speed}%
            </span>
          </div>
        </div>

        <p className="hidden mb-2 text-sm text-gray-300 lg:flex sm:text-base">
          Place N queens on an N×N chessboard so that no queen threatens any
          other queen horizontally, vertically, or diagonally.
        </p>
        <div className="mt-4 text-sm text-gray-300 lg:mt-0 sm:text-base">
          <h4 className="font-semibold">Backtracking Approach:</h4>
          <ol className="pl-4 mt-1 list-decimal sm:pl-5">
            <li>Start with an empty board</li>
            <li>Place queens one by one in each column</li>
            <li>For each column, try each row</li>
            <li>Check if the position is safe</li>
            <li>If safe, recursively try remaining queens</li>
            <li>If we cannot place all queens, backtrack</li>
          </ol>
        </div>
      </div>

      {/* Chessboard Visualization - centered and responsive */}
      <div className="flex justify-center">
        <div
          className="border-2 border-gray-600 rounded"
          style={{
            width: `${boardSize * cellSize + 2}px`, // Add 2px for border
            height: `${boardSize * cellSize + 2}px`, // Add 2px for border
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
            {safeBoard.map((row, rowIndex) =>
              row.map((cell, colIndex) => {
                const isDarkSquare = (rowIndex + colIndex) % 2 === 1;
                const cellKey = `cell-${boardSize}-${rowIndex}-${colIndex}`;

                return (
                  <div
                    key={cellKey}
                    className={`flex items-center justify-center ${
                      isDarkSquare ? "bg-gray-700" : "bg-gray-500"
                    } relative`}
                    style={{
                      width: `${cellSize}px`,
                      height: `${cellSize}px`,
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
                            duration: 0.3,
                          }}
                          className="absolute flex items-center justify-center"
                          style={{
                            width: `${cellSize * 0.7}px`,
                            height: `${cellSize * 0.7}px`,
                            borderRadius: "50%",
                            backgroundColor: "#FBBF24",
                            boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
                          }}
                        >
                          <span
                            className="text-yellow-800"
                            style={{
                              fontSize: `${cellSize * 0.5}px`,
                              fontWeight: "bold",
                              lineHeight: 1,
                            }}
                          >
                            ♕
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Status indicator - more touch-friendly on mobile */}
      <div className="flex justify-center mt-2">
        <div
          className={`px-3 py-1.5 rounded-full text-white ${
            isPlaying ? "bg-green-500" : "bg-blue-500"
          }`}
        >
          {isPlaying
            ? "Solving..."
            : solutions.length > 0
            ? "Solutions Found"
            : "Ready"}
        </div>
      </div>

      {/* Results - More mobile-friendly layout */}
      <div className="p-3 rounded-lg sm:p-4 bg-slate-800">
        <h3 className="mb-2 text-base font-bold text-white sm:text-lg">
          Solutions
        </h3>
        {solutions && solutions.length > 0 ? (
          <div className="text-sm text-green-300 sm:text-base">
            Found {solutions.length} solution(s) for {boardSize}×{boardSize}{" "}
            board
            {currentSolution !== undefined && (
              <p className="mt-1 text-xs text-white sm:text-sm">
                Currently viewing solution #{currentSolution + 1}
              </p>
            )}
          </div>
        ) : (
          <div className="text-sm text-gray-400 sm:text-base">
            Run the algorithm to find solutions
          </div>
        )}
      </div>

      {/* Visual representation of the solution - Scrollable on mobile */}
      {solutions && solutions.length > 0 && (
        <div className="p-3 rounded-lg sm:p-4 bg-slate-800">
          <h3 className="mb-2 text-base font-bold text-white sm:text-lg">
            Solution #{currentSolution + 1} Pattern
          </h3>
          <div className="p-1 mb-10 overflow-x-auto font-mono text-xs text-green-300 whitespace-pre sm:text-sm">
            {solutions[currentSolution]
              ?.map((row) => row.map((cell) => (cell ? "Q" : ".")).join(" "))
              .join("\n")}
          </div>
        </div>
      )}
    </div>
  );
};

export default NQueensVisualizer;
