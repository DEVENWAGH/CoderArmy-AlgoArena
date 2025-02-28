// Helper function to control animation speed
const wait = (speed) => new Promise(resolve => {
  setTimeout(resolve, Math.floor(800 - ((speed/100) * 750)))
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
}

// Improved N-Queens solver with better animation, pause support, and abort handling
export const nQueens = async (n, onUpdate, getSpeed, isPlaying, abortSignal) => {
  // Initialize board with zeros
  const board = Array(n).fill().map(() => Array(n).fill(0));
  const solutions = [];
  const steps = [];
  
  // Add initial state to steps
  steps.push(board.map(row => [...row]));
  await onUpdate(board, steps, solutions);
  
  // Function to check if we should abort
  const checkAbort = () => {
    if (abortSignal && abortSignal.aborted) {
      throw new DOMException('Algorithm aborted by user', 'AbortError');
    }
  };
  
  // Improved pause checking function
  const checkPause = async () => {
    checkAbort();
    
    // Check if we should be playing right now
    if (!isPlaying()) {
      console.log('Algorithm detected pause');
      
      // Wait in a loop until unpaused or aborted - more responsive polling
      let pauseStart = Date.now();
      while (!isPlaying()) {
        await new Promise(r => setTimeout(r, 50)); // Faster polling interval
        checkAbort();
        
        // Log periodically to show we're still in pause state
        if (Date.now() - pauseStart > 3000) {
          console.log('Still paused...');
          pauseStart = Date.now();
        }
      }
      console.log('Algorithm detected resume');
    }
  };
  
  // Recursive solver function with more frequent pause checks
  const solveNQueensUtil = async (col) => {
    // Check for abort/pause at each step
    await checkPause();
    
    // Base case: If all queens are placed
    if (col >= n) {
      // Create a copy of the board and add to solutions
      const solution = board.map(row => [...row]);
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
        steps.push(board.map(row => [...row]));
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
        steps.push(board.map(row => [...row]));
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
    if (error.name === 'AbortError') {
      console.log('N-Queens algorithm execution aborted');
    }
    throw error; // Re-throw to handle in the caller
  }
  
  return { solutions, steps };
}

// Other backtracking algorithms can be added here

export const sudokuSolver = async (board, onStep) => {
  const isEmpty = (board) => {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (board[i][j] === 0) return [i, j];
      }
    }
    return null;
  };
  
  const isValid = (board, num, pos) => {
    // Check row
    for (let j = 0; j < 9; j++) {
      if (board[pos[0]][j] === num) return false;
    }
    
    // Check column
    for (let i = 0; i < 9; i++) {
      if (board[i][pos[1]] === num) return false;
    }
    
    // Check 3x3 box
    const boxRow = Math.floor(pos[0] / 3) * 3;
    const boxCol = Math.floor(pos[1] / 3) * 3;
    
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[boxRow + i][boxCol + j] === num) return false;
      }
    }
    
    return true;
  };
  
  const solve = async () => {
    const empty = isEmpty(board);
    if (!empty) return true;
    
    const [row, col] = empty;
    
    for (let num = 1; num <= 9; num++) {
      if (isValid(board, num, [row, col])) {
        board[row][col] = num;
        await onStep([...board]);
        
        if (await solve()) return true;
        
        board[row][col] = 0;
        await onStep([...board]);
      }
    }
    
    return false;
  };
  
  await solve();
  return board;
};
