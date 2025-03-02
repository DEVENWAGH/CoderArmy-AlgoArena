// Helper function to control animation speed
const wait = (speed) =>
  new Promise((resolve) => {
    setTimeout(resolve, Math.floor(800 - (speed / 100) * 750));
  });

// Check if it's safe to place a queen at board[row][col]
const isSafe = (board, row, col, n) => {
  // Check this row on left side
  for (let i = 0; i < col; i++) {
    if (board[row][i] === 1) return false;
  }

  // Check upper diagonal on left side
  for (let i = row, j = col; i >= 0 && j >= 0; i--, j--) {
    if (board[i][j] === 1) return false;
  }

  // Check lower diagonal on left side
  for (let i = row, j = col; i < n && j >= 0; i++, j--) {
    if (board[i][j] === 1) return false;
  }

  return true;
};

// Improved N-Queens solver with better animation, pause support, and abort handling
export const nQueens = async (
  n,
  onUpdate,
  getSpeed,
  isPlaying,
  abortSignal
) => {
  // Initialize board with zeros
  const board = Array(n)
    .fill()
    .map(() => Array(n).fill(0));
  const solutions = [];
  const steps = [];

  // Add initial state to steps
  steps.push(board.map((row) => [...row]));
  await onUpdate(board, steps, solutions);

  // Function to check if we should abort
  const checkAbort = () => {
    if (abortSignal && abortSignal.aborted) {
      throw new DOMException("Algorithm aborted by user", "AbortError");
    }
  };

  // Improved pause checking function
  const checkPause = async () => {
    checkAbort();

    // Check if we should be playing right now
    if (!isPlaying()) {
      console.log("Algorithm detected pause");

      // Wait in a loop until unpaused or aborted - more responsive polling
      let pauseStart = Date.now();
      while (!isPlaying()) {
        await new Promise((r) => setTimeout(r, 50)); // Faster polling interval
        checkAbort();

        // Log periodically to show we're still in pause state
        if (Date.now() - pauseStart > 3000) {
          console.log("Still paused...");
          pauseStart = Date.now();
        }
      }
      console.log("Algorithm detected resume");
    }
  };

  // Recursive solver function with more frequent pause checks
  const solveNQueensUtil = async (col) => {
    // Check for abort/pause at each step
    await checkPause();

    // Base case: If all queens are placed
    if (col >= n) {
      // Create a copy of the board and add to solutions
      const solution = board.map((row) => [...row]);
      solutions.push(solution);
      await onUpdate(board, steps, solutions);
      return;
    }

    // Try placing queen in each row of this column
    for (let row = 0; row < n; row++) {
      // Check for abort/pause before each placement - more frequent checking
      await checkPause();

      // Check if we can place a queen here
      if (isSafe(board, row, col, n)) {
        // Place the queen
        board[row][col] = 1;

        // Save current state to steps
        steps.push(board.map((row) => [...row]));
        await onUpdate(board, steps, solutions);

        // Check pause again before waiting
        await checkPause();
        await wait(getSpeed());

        // Recur to place rest of the queens
        await solveNQueensUtil(col + 1);

        // Check for abort/pause before backtracking
        await checkPause();

        // Backtrack: Remove the queen from current position
        board[row][col] = 0;

        // Save backtracked state
        steps.push(board.map((row) => [...row]));
        await onUpdate(board, steps, solutions);

        // Check pause again before waiting
        await checkPause();
        await wait(getSpeed());
      }
    }
  };

  // Start the solving process
  try {
    await solveNQueensUtil(0);
  } catch (error) {
    if (error.name === "AbortError") {
      console.log("N-Queens algorithm execution aborted");
    }
    throw error; // Re-throw to handle in the caller
  }

  return { solutions, steps };
};

// Optimized sudoku solver with animation, pause and abort support
export const sudokuSolver = async (
  board,
  onUpdate,
  getSpeed,
  isPlaying,
  abortSignal
) => {
  const steps = [];
  const solutions = [];

  // Deep copy the initial board
  const initialBoard = JSON.parse(JSON.stringify(board));

  // Add initial state to steps
  steps.push(JSON.parse(JSON.stringify(board)));
  await onUpdate(board, steps, solutions);

  // Function to check if we should abort
  const checkAbort = () => {
    if (abortSignal && abortSignal.aborted) {
      throw new DOMException("Algorithm aborted by user", "AbortError");
    }
  };

  // Pause checking function
  const checkPause = async () => {
    checkAbort();

    if (!isPlaying()) {
      console.log("Sudoku solver paused");

      // Wait until unpaused or aborted
      let pauseStart = Date.now();
      while (!isPlaying()) {
        await new Promise((r) => setTimeout(r, 50));
        checkAbort();

        if (Date.now() - pauseStart > 3000) {
          console.log("Still paused...");
          pauseStart = Date.now();
        }
      }
      console.log("Sudoku solver resumed");
    }
  };

  // Count filled cells to determine difficulty
  const countFilledCells = () => {
    let count = 0;
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (board[i][j] !== 0) count++;
      }
    }
    return count;
  };

  // Adjust animation speed based on difficulty
  const filledCells = countFilledCells();
  const isDifficult = filledCells < 25; // Adjust threshold as needed
  const animationFrequency = isDifficult ? 1 : filledCells > 35 ? 10 : 5;
  let stepCount = 0;

  // Find empty cell - prioritize cells with fewer possibilities
  const findBestEmptyCell = (board) => {
    let bestCell = null;
    let minOptions = 10;

    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0) {
          // Count valid options for this cell
          let options = 0;
          for (let num = 1; num <= 9; num++) {
            if (isValid(board, row, col, num)) options++;
          }

          // If this cell has fewer options, it's a better candidate
          if (options < minOptions) {
            minOptions = options;
            bestCell = [row, col];

            // If cell has only one option, return it immediately
            if (options === 1) return bestCell;
          }
        }
      }
    }

    // If no cell with constraints found, return first empty cell
    if (!bestCell) {
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (board[row][col] === 0) return [row, col];
        }
      }
    }

    return bestCell;
  };

  // Check if number is valid in position
  const isValid = (board, row, col, num) => {
    // Check row
    for (let x = 0; x < 9; x++) {
      if (Math.abs(board[row][x]) === num) {
        return false;
      }
    }

    // Check column
    for (let x = 0; x < 9; x++) {
      if (Math.abs(board[x][col]) === num) {
        return false;
      }
    }

    // Check 3x3 box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (Math.abs(board[boxRow + i][boxCol + j]) === num) {
          return false;
        }
      }
    }

    return true;
  };

  // Recursive solver function
  const solve = async () => {
    await checkPause();
    stepCount++;

    const emptyCell = findBestEmptyCell(board);

    // If no empty cell, puzzle is solved
    if (!emptyCell) {
      // Add solution
      solutions.push(JSON.parse(JSON.stringify(board)));
      await onUpdate(board, steps, solutions);
      return true;
    }

    const [row, col] = emptyCell;

    // Get valid numbers for this cell - sort by most constrained
    const validNumbers = [];
    for (let num = 1; num <= 9; num++) {
      if (isValid(board, row, col, num)) {
        validNumbers.push(num);
      }
    }

    // Try each valid number
    for (const num of validNumbers) {
      await checkPause();

      // Place number
      board[row][col] = num;

      // Add step (but not too frequently for easier puzzles)
      if (stepCount % animationFrequency === 0) {
        steps.push(JSON.parse(JSON.stringify(board)));
        await onUpdate(board, steps, solutions);
        await wait(getSpeed());
      }

      // Continue solving
      if (await solve()) {
        return true;
      }

      // If we reach here, this number didn't work
      // Backtrack: remove number
      board[row][col] = 0;

      // Add backtracking step (less frequently)
      if (stepCount % animationFrequency === 0) {
        steps.push(JSON.parse(JSON.stringify(board)));
        await onUpdate(board, steps, solutions);
        await wait(getSpeed());
      }
    }

    return false;
  };

  try {
    await solve();

    // Ensure final solution is added to steps
    if (steps[steps.length - 1] !== solutions[0]) {
      steps.push(JSON.parse(JSON.stringify(solutions[0])));
      await onUpdate(board, steps, solutions);
    }
  } catch (error) {
    if (error.name === "AbortError") {
      console.log("Sudoku solver execution aborted");
    }
    throw error;
  }

  return { solutions, steps, initialBoard };
};
