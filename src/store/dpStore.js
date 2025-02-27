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
      values: [4, 2, 10, 1, 2],  // Example values from your code
      weights: [12, 1, 4, 1, 2], // Example weights from your code
      capacity: 15               // Example capacity from your code
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
    // Apply validation for different algorithms
    let validatedInput = { ...newInput }
    
    if (algorithm === 'fibonacci') {
      validatedInput.n = Math.max(1, Math.min(12, newInput.n))
    }
    
    if (algorithm === 'knapsack') {
      // Ensure arrays have valid values
      if (validatedInput.weights && Array.isArray(validatedInput.weights)) {
        validatedInput.weights = validatedInput.weights.filter(val => !isNaN(val) && val >= 0)
      }
      if (validatedInput.values && Array.isArray(validatedInput.values)) {
        validatedInput.values = validatedInput.values.filter(val => !isNaN(val) && val >= 0)
      }
      // Ensure capacity is valid
      validatedInput.capacity = Math.max(1, validatedInput.capacity || 1)
      
      // Ensure arrays are the same length
      if (validatedInput.weights.length !== validatedInput.values.length) {
        console.warn("Weights and values arrays should be the same length")
        // Adjust to the shorter length
        const minLength = Math.min(validatedInput.weights.length, validatedInput.values.length)
        validatedInput.weights = validatedInput.weights.slice(0, minLength)
        validatedInput.values = validatedInput.values.slice(0, minLength)
      }
    }
    
    // Update the state with validated input
    set(state => ({
      input: {
        ...state.input,
        [algorithm]: validatedInput
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
      let result
      
      switch (currentAlgorithm) {
        case 'fibonacci':
          params = [input.fibonacci.n]
          break
        case 'knapsack':
          params = [
            input.knapsack.weights,
            input.knapsack.values,
            input.knapsack.capacity
          ]
          break
        // ...other cases...
      }

      result = await algorithm(
        ...params,
        (table) => set({ table: Array.isArray(table) ? [...table] : table }),
        (cell) => set({ currentCell: cell }),
        () => get().speed,
        () => get().isPlaying
      )
      
      // Store additional result data if returned
      if (result && typeof result === 'object') {
        set({ algorithmResult: result })
      }
      
      return result
    } catch (error) {
      console.error('DP algorithm error:', error)
    } finally {
      set({ isPlaying: false })
    }
  },
  
  // Add algorithm result state
  algorithmResult: null
}))

export default useDPStore
