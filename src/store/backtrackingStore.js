import { create } from 'zustand'
import { nQueens } from '../algorithms/backtracking'

const useBacktrackingStore = create((set, get) => ({
  // General state
  algorithm: null,
  isPlaying: false,
  isPaused: false,
  speed: 50,
  boardSize: 4, // Default size for n-queens
  
  // Add an abort controller for interrupting running algorithms
  abortController: null,

  // N-Queens specific state
  board: [],
  solutions: [],
  currentSolution: 0,
  currentStep: 0,
  steps: [],
  
  // Setters and actions
  setSpeed: (speed) => set({ speed }),
  
  setBoardSize: (size) => {
    // Abort any running algorithm first
    const { abortController } = get();
    if (abortController) abortController.abort();
    
    // Completely reset state when board size changes
    const initialBoard = Array(size).fill().map(() => Array(size).fill(0));
    
    set({ 
      boardSize: size,
      board: initialBoard,
      solutions: [],
      currentSolution: 0,
      currentStep: 0,
      steps: [],
      isPlaying: false,
      isPaused: false,
      abortController: null
    });
  },
  
  startAlgorithm: (algorithm) => {
    // Abort any running algorithm first
    const { abortController } = get();
    if (abortController) abortController.abort();
    
    const { boardSize } = get();
    
    if (algorithm === 'n-queens') {
      // Create a fresh board with the current size
      const initialBoard = Array(boardSize).fill().map(() => Array(boardSize).fill(0));
      
      // Complete reset of all state
      set({
        algorithm,
        board: initialBoard,
        solutions: [],
        currentSolution: 0,
        currentStep: 0,
        steps: [],
        isPlaying: false,
        isPaused: false,
        abortController: null
      });
    }
  },
  
  resetAlgorithm: () => {
    // Abort any running algorithm first
    const { abortController } = get();
    if (abortController) {
      abortController.abort();
    }
    
    const { algorithm, boardSize } = get();
    
    if (algorithm === 'n-queens') {
      // Create a fresh board with the current size
      const initialBoard = Array(boardSize).fill().map(() => Array(boardSize).fill(0));
      
      // Reset everything except boardSize and algorithm
      set({
        board: initialBoard,
        solutions: [],
        currentSolution: 0,
        currentStep: 0,
        steps: [],
        isPlaying: false,
        isPaused: false,
        abortController: null
      });
    }
  },
  
  runAlgorithm: async (algorithm) => {
    // First reset any existing state and abort any running algorithm
    get().resetAlgorithm();
    
    // Create a new AbortController for this run
    const abortController = new AbortController();
    
    set({ 
      isPlaying: true, 
      isPaused: false,
      abortController 
    });
    
    if (algorithm === 'n-queens') {
      const { boardSize } = get();
      
      try {
        // Run the algorithm with proper update handlers and abort signal
        const result = await nQueens(
          boardSize,
          // Create a fresh callback every time to avoid stale closures
          (currentBoard, steps, solutions) => {
            set(state => ({ 
              board: JSON.parse(JSON.stringify(currentBoard)),
              steps: steps.map(step => JSON.parse(JSON.stringify(step))),
              solutions: solutions.map(sol => JSON.parse(JSON.stringify(sol))),
              currentStep: steps.length - 1
            }));
          },
          () => get().speed,
          // Fix here: Changed to a callback that returns the correct playing state
          () => get().isPlaying && !get().isPaused,
          abortController.signal
        );
        
        // After completion, set final state
        if (!abortController.signal.aborted) {
          set({ 
            isPlaying: false,
            currentStep: get().steps.length - 1,
            currentSolution: get().solutions.length > 0 ? 0 : 0
          });
          
          // If solutions found, display the first one
          if (get().solutions.length > 0) {
            get().showSolution(0);
          }
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('Algorithm execution was aborted');
        } else {
          console.error('Error running N-Queens:', error);
        }
        set({ isPlaying: false });
      }
    }
  },
  
  showSolution: (index) => {
    const { solutions } = get();
    if (solutions && solutions.length > 0 && index >= 0 && index < solutions.length) {
      set({
        currentSolution: index,
        board: JSON.parse(JSON.stringify(solutions[index])),
        isPlaying: false,
        isPaused: false
      });
    }
  },
  
  showStep: (index) => {
    const { steps } = get();
    if (steps && steps.length > 0 && index >= 0 && index < steps.length) {
      set({
        currentStep: index,
        board: JSON.parse(JSON.stringify(steps[index])),
        isPlaying: false,
        isPaused: false
      });
    }
  },
  
  nextSolution: () => {
    const { currentSolution, solutions } = get();
    const nextIndex = (currentSolution + 1) % solutions.length;
    get().showSolution(nextIndex);
  },
  
  previousSolution: () => {
    const { currentSolution, solutions } = get();
    const prevIndex = (currentSolution - 1 + solutions.length) % solutions.length;
    get().showSolution(prevIndex);
  },
  
  nextStep: () => {
    const { currentStep, steps } = get();
    if (currentStep < steps.length - 1) {
      get().showStep(currentStep + 1);
    }
  },
  
  previousStep: () => {
    const { currentStep } = get();
    if (currentStep > 0) {
      get().showStep(currentStep - 1);
    }
  },
  
  pauseAlgorithm: () => {
    console.log("Algorithm paused by user"); // Add logging
    set({ isPaused: true, isPlaying: false });
  },
  
  resumeAlgorithm: () => {
    console.log("Algorithm resumed by user"); // Add logging
    set({ isPaused: false, isPlaying: true });
  },
}));

export default useBacktrackingStore;
