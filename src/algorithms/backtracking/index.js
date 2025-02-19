export const nQueens = async (n, onStep) => {
  const board = Array(n).fill().map(() => Array(n).fill(0));
  
  const isSafe = (row, col) => {
    // Check row and column
    for (let i = 0; i < n; i++) {
      if (board[row][i] === 1 || board[i][col] === 1) return false;
    }
    
    // Check diagonals
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if ((i + j === row + col || i - j === row - col) && board[i][j] === 1) {
          return false;
        }
      }
    }
    
    return true;
  };
  
  const solve = async (col) => {
    if (col >= n) return true;
    
    for (let row = 0; row < n; row++) {
      if (isSafe(row, col)) {
        board[row][col] = 1;
        await onStep([...board]);
        
        if (await solve(col + 1)) return true;
        
        board[row][col] = 0;
        await onStep([...board]);
      }
    }
    
    return false;
  };
  
  await solve(0);
  return board;
};

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
