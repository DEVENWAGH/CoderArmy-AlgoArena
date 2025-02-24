import { create } from 'zustand'
import { getDPAlgorithm } from '../algorithms/dp'

const useDPStore = create((set, get) => ({
  // Visualization state
  table: [],
  currentCell: null,
  speed: 50,
  isPlaying: false,
  isPaused: false,
  
  // Algorithm inputs
  input: {
    fibonacci: { n: 6 }, // Changed default from 10 to 6
    knapsack: {
      weights: [2, 3, 4, 5],
      values: [3, 4, 5, 6],
      capacity: 10
    },
    lcs: {
      str1: "ABCDGH",
      str2: "AEDFHR"
    },
    lis: {
      array: [10, 22, 9, 33, 21, 50, 41, 60, 80]
    }
  },

  setSpeed: (speed) => set({ speed }),
  setTable: (table) => set({ table }),
  setCurrentCell: (cell) => set({ currentCell: cell }),
  setCurrentAlgorithm: (algorithm) => set({ currentAlgorithm: algorithm }),

  setInput: (algorithm, newInput) => {
    if (algorithm === 'fibonacci') {
      // Updated validation for n<=12
      newInput.n = Math.max(1, Math.min(12, newInput.n))
    }
    
    set(state => ({
      input: {
        ...state.input,
        [algorithm]: newInput
      }
    }))
  },
  
  startAlgorithm: async (name) => {
    console.log('Starting DP algorithm:', name)
    const { input } = get()
    
    // Reset state but don't auto-start
    set({ 
      isPlaying: false,  // Changed from true to false
      isPaused: false,
      table: [],
      currentCell: null
    })

    const algorithm = getDPAlgorithm(name)
    if (!algorithm) {
      console.error('Algorithm not found:', name)
      return
    }

    try {
      // Initialize table without running algorithm
      switch (name) {
        case 'fibonacci':
          set({ table: new Array(input.fibonacci.n + 1).fill(0) })
          break
        // ...other cases...
      }
    } catch (error) {
      console.error('DP algorithm initialization error:', error)
    }
  },

  runAlgorithm: async () => {
    const { input, currentAlgorithm } = get()
    
    set({ isPlaying: true })

    try {
      const algorithm = getDPAlgorithm(currentAlgorithm)
      if (!algorithm) return

      let params = []
      switch (currentAlgorithm) {
        case 'fibonacci':
          params = [input.fibonacci.n]
          break
        // ...existing cases...
      }

      await algorithm(
        ...params,
        (table) => set({ table: table.map(row => Array.isArray(row) ? [...row] : row) }),
        (cell) => set({ currentCell: cell }),
        () => get().speed,
        () => get().isPlaying
      )
    } catch (error) {
      console.error('DP algorithm error:', error)
    } finally {
      set({ isPlaying: false })
    }
  }
}))

export default useDPStore
