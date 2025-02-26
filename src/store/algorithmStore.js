import { create } from 'zustand'
import { getSortingAlgorithm } from '../algorithms/sorting/index.jsx'
import { getSearchAlgorithm } from '../algorithms/searching/index.jsx'

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
      "Dijkstra's Algorithm",
      "Prim's Algorithm",
      "Kruskal's Algorithm"
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
  arraySize: 36, // Changed from 50 to 36
  isSorting: false,
  isPlaying: false,
  speed: 50, // Set initial speed to middle value
  currentSpeed: 50,  // Add current speed state
  currentIndex: -1,
  compareIndex: -1,
  isSorted: false,
  isPaused: false,  // Add this state
  isAscending: true, // Add this line

  // Add new search-specific state
  searchArray: [],
  currentSearchIndex: -1,
  searchTarget: null,
  searchResult: null,
  isSearching: false,
  searchArraySize: 15,
  isSearchPlaying: false,
  isSearchPaused: false,

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
  },

  generateSearchArray: () => {
    const { searchArraySize, currentAlgorithm } = get()
    const newArray = Array.from({ length: searchArraySize }, () => 
      Math.floor(Math.random() * 999) + 1 // Increased range for larger numbers
    )
    // Only sort for binary search
    const shouldSort = currentAlgorithm?.toLowerCase().includes('binary')
    if (shouldSort) {
      newArray.sort((a, b) => a - b)
    }
    
    set({ 
      searchArray: newArray,
      currentSearchIndex: -1,
      searchResult: null,
      searchTarget: null,
      isSearching: false,
      isSearchPlaying: false,
      isSearchPaused: false
    })
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
    const { array, currentAlgorithm, isAscending } = get()

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
          () => get().isPlaying,
          isAscending // Pass sort order to algorithm
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

  startSearch: async (target) => {
    const { searchArray, currentAlgorithm } = get()
    if (!currentAlgorithm) return

    const algorithm = getSearchAlgorithm(
      currentAlgorithm.toLowerCase().replace(/\s+/g, '-')
    )

    if (!algorithm) return

    set({ 
      isSearching: true,
      isSearchPlaying: true,
      isSearchPaused: false,
      searchTarget: target,
      searchResult: null,
      currentSearchIndex: -1
    })

    try {
      const result = await algorithm(
        searchArray,
        parseInt(target),
        (index) => set({ currentSearchIndex: index }),
        () => get().isSearchPlaying,
        () => get().speed // Pass speed getter
      )
      
      set({ 
        searchResult: result !== -1,
        currentSearchIndex: result,
        isSearching: false,
        isSearchPlaying: false
      })
    } catch (error) {
      console.error('Search error:', error)
      set({ 
        isSearching: false,
        isSearchPlaying: false 
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
  },

  setCustomArray: (values) => {
    // Ensure we're working with simple numbers
    const processedValues = values.map(value => 
      typeof value === 'object' ? value.value : Number(value)
    )
    
    set({ 
      array: processedValues,
      arraySize: processedValues.length,
      currentIndex: -1,
      compareIndex: -1,
      isPlaying: false,
      isSorting: false,
      isSorted: false,
      isPaused: false
    })
  },

  toggleSortOrder: () => {
    set(state => ({ isAscending: !state.isAscending }))
  },

  setSearchArraySize: (size) => {
    set({ searchArraySize: size })
    get().generateSearchArray()
  },

  pauseSearch: () => set({ isSearchPlaying: false, isSearchPaused: true }),
  resumeSearch: () => set({ isSearchPlaying: true, isSearchPaused: false })
}))

export default useAlgorithmStore
