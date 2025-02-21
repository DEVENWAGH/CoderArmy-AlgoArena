import { create } from 'zustand'
import { getSortingAlgorithm } from '../algorithms/sorting/index.jsx'

const useAlgorithmStore = create((set, get) => ({
  currentAlgorithm: null,
  currentCategory: null,
  searchQuery: '',
  algorithmCategories: {
    'Sorting': [
      'Bubble Sort',
      'Selection Sort',
      'Insertion Sort',
      'Merge Sort',
      'Quick Sort'
    ],
    'Searching': [
      'Linear Search',
      'Binary Search'
    ],
    'Graph': [
      'BFS',
      'DFS',
      "Dijkstra's Algorithm"
    ],
    'Dynamic Programming': [
      'Fibonacci',
      'Knapsack'
    ],
    'Tree': [
      'Tree Traversals',
      'BST Operations'
    ]
  },

  array: [],
  arraySize: 50,
  isSorting: false,
  isPlaying: false,
  speed: 50, // Set initial speed to middle value
  currentSpeed: 50,  // Add current speed state
  currentIndex: -1,
  compareIndex: -1,
  isSorted: false,
  isPaused: false,  // Add this state

  setArraySize: (size) => {
    const { currentAlgorithm } = get()
    set({ 
      arraySize: size,
      isSorting: false,
      isPlaying: false,
      isSorted: false,
      currentIndex: -1,
      compareIndex: -1,
      // Maintain current algorithm
      currentAlgorithm: currentAlgorithm
    })
    get().generateNewArray()
  },
  
  generateNewArray: () => {
    const { arraySize, currentAlgorithm } = get()
    const newArray = Array.from({ length: arraySize }, () => 
      Math.floor(Math.random() * 300) + 10
    )
    set({ 
      array: newArray,
      currentIndex: -1,
      compareIndex: -1,
      isPlaying: false,
      isSorting: false,
      isSorted: false,
      isPaused: false,
      currentAlgorithm // Maintain current algorithm
    })
    // Force a UI update
    setTimeout(() => set({ array: [...newArray] }), 0)
  },

  setCurrentAlgorithm: (algorithm) => {
    set({ 
      currentAlgorithm: algorithm,
      isSorting: false,
      isPlaying: false,
      isSorted: false
    })
  },

  // Search functionality
  searchAlgorithms: (query) => {
    const { algorithmCategories } = get();
    const results = [];
    Object.entries(algorithmCategories).forEach(([category, algorithms]) => {
      algorithms.forEach(algo => {
        if (algo.toLowerCase().includes(query.toLowerCase())) {
          results.push({ category, name: algo });
        }
      });
    });
    return results;
  },

  setSpeed: (speed) => {
    set({ speed, currentSpeed: speed })
  },
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setCurrentIndex: (index) => set({ currentIndex: index }),
  setCompareIndex: (index) => set({ compareIndex: index }),

  reset: () => {
    set({
      isPlaying: false,
      currentIndex: -1,
      compareIndex: -1
    })
  },

  startSorting: async () => {
    const { array, currentAlgorithm } = get()

    if (!array.length || !currentAlgorithm) return

    // Reset states before starting new sort
    set({ 
      isSorting: true, 
      isPlaying: true,
      isPaused: false,
      isSorted: false,
      currentIndex: -1,
      compareIndex: -1
    })
    
    try {
      const algorithm = getSortingAlgorithm(
        currentAlgorithm?.toLowerCase().replace(/\s+/g, '-')
      )

      if (algorithm) {
        await algorithm(
          array,
          (newArray) => set({ array: newArray }),
          (index) => set({ currentIndex: index }),
          (index) => set({ compareIndex: index }),
          () => get().speed,
          () => get().isPlaying
        )
        set({ 
          isSorting: false, 
          isPlaying: false,
          currentIndex: -1,
          compareIndex: -1,
          isSorted: true
        })
      }
    } catch (error) {
      console.error('Sorting error:', error)
      set({ 
        isSorting: false, 
        isPlaying: false,
        isPaused: false,
        isSorted: false
      })
    }
  },

  pauseSorting: () => {
    set({ 
      isPlaying: false,
      isPaused: true  // Add this state
    })
  },
  
  resumeSorting: () => {
    const { isSorting } = get()
    if (isSorting) {
      set({ 
        isPlaying: true,
        isPaused: false
      })
    }
  }
}))

export default useAlgorithmStore
