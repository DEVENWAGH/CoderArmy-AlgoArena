import { create } from "zustand";
import { getSortingAlgorithm } from "../algorithms/sorting/index.jsx";
import { getSearchAlgorithm } from "../algorithms/searching/index.jsx";

const useAlgorithmStore = create((set, get) => ({
  currentAlgorithm: null,
  currentCategory: null,
  searchQuery: "",
  searchResults: [], // Add this line
  algorithmCategories: {
    Sorting: [
      "Bubble Sort",
      "Selection Sort",
      "Insertion Sort",
      "Merge Sort",
      "Quick Sort",
    ],
    Searching: ["Linear Search", "Binary Search"],
    Graph: [
      "BFS",
      "DFS",
      "Dijkstra's Algorithm",
      "Prim's Algorithm",
      "Kruskal's Algorithm",
    ],
    "Dynamic Programming": ["Fibonacci", "Knapsack", "LIS", "LCS"],
    "Greedy Algorithm": ["Activity Selection", "Huffman Coding"],
    Backtracking: ["N-Queens", "Sudoku Solver"],
    "Tree Algorithms": [
      "Tree Traversals",
      "Binary Search Tree",
      "AVL Tree",
      "Red-Black Tree",
    ],
    "Mathematical Algorithms": [
      "GCD (Euclidean)",
      "Sieve of Eratosthenes",
      "Prime Factorization",
    ],
  },

  array: [],
  // Fixed default sizes to ensure consistency
  arraySize: (() => {
    const screenWidth = window.innerWidth;
    if (screenWidth < 1024) return 16; // Mobile and tablet
    return 36; // Desktop
  })(),
  defaultArraySize: (() => {
    const screenWidth = window.innerWidth;
    if (screenWidth < 1024) return 16; // Mobile and tablet
    return 36; // Desktop
  })(),
  isSorting: false,
  isPlaying: false,
  speed: 50, // Set initial speed to middle value
  currentSpeed: 50, // Add current speed state
  currentIndex: -1,
  compareIndex: -1,
  isSorted: false,
  isPaused: false, // Add this state
  isAscending: true, // Add this line

  // Add new search-specific state
  searchArray: [],
  currentSearchIndex: -1,
  searchTarget: null,
  searchResult: null,
  isSearching: false,
  searchArraySize: window.innerWidth < 640 ? 10 : 15, // Smaller default for mobile
  isSearchPlaying: false,
  isSearchPaused: false,

  // Fixed setArraySize to prevent unwanted resets
  setArraySize: (size) => {
    const { currentAlgorithm } = get();
    // Update size limits based on device
    const screenWidth = window.innerWidth;
    let maxSize;
    let minSize;

    if (screenWidth < 640) {
      minSize = 10;
      maxSize = 30; // More restrictive for mobile
    } else if (screenWidth < 1024) {
      minSize = 16;
      maxSize = 50; // Medium restriction for tablet
    } else {
      minSize = 20;
      maxSize = 200; // Large limit for desktop
    }

    const adjustedSize = Math.min(Math.max(size, minSize), maxSize);

    // Store the size first, but DON'T generate a new array automatically
    set((state) => ({
      ...state,
      arraySize: adjustedSize,
      // Don't reset sorting state here - this caused the issue
      currentAlgorithm, // Maintain current algorithm
    }));

    // Generate new array with the updated size
    get().generateNewArray();

    // Return the adjusted size so component state can be updated if needed
    return adjustedSize;
  },

  // Modified to respect the current arraySize in state
  generateNewArray: () => {
    const { arraySize } = get();

    // Ensure we have a valid size (prevent using 0 or undefined)
    const sizeToUse =
      arraySize ||
      (() => {
        const screenWidth = window.innerWidth;
        return screenWidth < 1024 ? 16 : 36;
      })();

    // Remove unused heightMultiplier variable and only keep baseHeight
    const screenWidth = window.innerWidth;
    let baseHeight;

    if (screenWidth < 640) {
      // Mobile
      baseHeight = 20;
    } else if (screenWidth < 1024) {
      // Tablet
      baseHeight = 15;
    } else {
      // Desktop
      baseHeight = 10;
    }

    // Use the current arraySize explicitly
    const newArray = Array.from({ length: sizeToUse }, () =>
      Math.floor(Math.random() * (200 - baseHeight) + baseHeight)
    );

    set((state) => ({
      ...state,
      array: newArray,
      arraySize: sizeToUse, // Ensure arraySize is consistent
      currentIndex: -1,
      compareIndex: -1,
      isPlaying: false,
      isSorting: false,
      isSorted: false,
      isPaused: false,
      // Don't change the arraySize here
    }));

    // Return array size for sync purposes
    return sizeToUse;
  },

  generateSearchArray: () => {
    const { searchArraySize, currentAlgorithm } = get();
    const newArray = Array.from(
      { length: searchArraySize },
      () => Math.floor(Math.random() * 999) + 1 // Increased range for larger numbers
    );
    // Only sort for binary search
    const shouldSort = currentAlgorithm?.toLowerCase().includes("binary");
    if (shouldSort) {
      newArray.sort((a, b) => a - b);
    }

    set({
      searchArray: newArray,
      currentSearchIndex: -1,
      searchResult: null,
      searchTarget: null,
      isSearching: false,
      isSearchPlaying: false,
      isSearchPaused: false,
    });
  },

  setCurrentAlgorithm: (algorithm) => {
    // Only get the defaultArraySize, not any other state
    const screenWidth = window.innerWidth;
    const defaultSize = screenWidth < 1024 ? 16 : 36;

    // Reset to consistent default size when changing algorithms
    set((state) => ({
      ...state,
      currentAlgorithm: algorithm,
      arraySize: defaultSize, // Always use the calculated default size
      isSorting: false,
      isPlaying: false,
      isSorted: false,
    }));

    // Generate new array with correct default size
    get().generateNewArray();
  },

  // Search functionality
  searchAlgorithms: (query) => {
    const { algorithmCategories } = get();
    const results = [];
    Object.entries(algorithmCategories).forEach(([category, algorithms]) => {
      algorithms.forEach((algo) => {
        if (algo.toLowerCase().includes(query.toLowerCase())) {
          results.push({ category, name: algo });
        }
      });
    });
    set({ searchResults: results }); // Update search results state
  },

  setSearchQuery: (query) => set({ searchQuery: query }),

  setSpeed: (speed) => {
    set({ speed, currentSpeed: speed });
  },
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setCurrentIndex: (index) => set({ currentIndex: index }),
  setCompareIndex: (index) => set({ compareIndex: index }),

  reset: () => {
    set({
      isPlaying: false,
      currentIndex: -1,
      compareIndex: -1,
    });
  },

  startSorting: async () => {
    const { array, currentAlgorithm, isAscending } = get();

    if (!array.length || !currentAlgorithm) return;

    // Reset states before starting new sort
    set({
      isSorting: true,
      isPlaying: true,
      isPaused: false,
      isSorted: false,
      currentIndex: -1,
      compareIndex: -1,
    });

    try {
      const algorithm = getSortingAlgorithm(
        currentAlgorithm?.toLowerCase().replace(/\s+/g, "-")
      );

      if (algorithm) {
        await algorithm(
          array,
          (newArray, currentIdx = -1, compareIdx = -1) => {
            set({
              array: newArray,
              currentIndex:
                currentIdx !== undefined ? currentIdx : get().currentIndex,
              compareIndex:
                compareIdx !== undefined ? compareIdx : get().compareIndex,
            });
          },
          (index) => set({ currentIndex: index }),
          (index) => set({ compareIndex: index }),
          () => get().speed,
          () => get().isPlaying,
          isAscending // Pass sort order to algorithm
        );
        set({
          isSorting: false,
          isPlaying: false,
          currentIndex: -1,
          compareIndex: -1,
          isSorted: true,
        });
      }
    } catch (error) {
      console.error("Sorting error:", error);
      set({
        isSorting: false,
        isPlaying: false,
        isPaused: false,
        isSorted: false,
      });
    }
  },

  startSearch: async (target) => {
    const { searchArray, currentAlgorithm } = get();
    if (!currentAlgorithm) return;

    const algorithm = getSearchAlgorithm(
      currentAlgorithm.toLowerCase().replace(/\s+/g, "-")
    );

    if (!algorithm) return;

    set({
      isSearching: true,
      isSearchPlaying: true,
      isSearchPaused: false,
      searchTarget: target,
      searchResult: null,
      currentSearchIndex: -1,
    });

    try {
      const result = await algorithm(
        searchArray,
        parseInt(target),
        (index) => set({ currentSearchIndex: index }),
        () => get().isSearchPlaying,
        () => get().speed // Pass speed getter
      );

      set({
        searchResult: result !== -1,
        currentSearchIndex: result,
        isSearching: false,
        isSearchPlaying: false,
      });
    } catch (error) {
      console.error("Search error:", error);
      set({
        isSearching: false,
        isSearchPlaying: false,
      });
    }
  },

  pauseSorting: () => {
    set({
      isPlaying: false,
      isPaused: true, // Add this state
    });
  },

  resumeSorting: () => {
    const { isSorting } = get();
    if (isSorting) {
      set({
        isPlaying: true,
        isPaused: false,
      });
    }
  },

  setCustomArray: (values) => {
    // Ensure we're working with simple numbers
    const processedValues = values.map((value) =>
      typeof value === "object" ? value.value : Number(value)
    );

    // Update state with new array
    set({
      array: processedValues,
      arraySize: processedValues.length,
      currentIndex: -1,
      compareIndex: -1,
      isPlaying: false,
      isSorting: false,
      isSorted: false,
      isPaused: false,
    });

    // Return the length so it can be used to update local state if needed
    return processedValues.length;
  },

  toggleSortOrder: () => {
    set((state) => ({ isAscending: !state.isAscending }));
  },

  setSearchArraySize: (size) => {
    set({ searchArraySize: size });
    get().generateSearchArray();
  },

  pauseSearch: () => set({ isSearchPlaying: false, isSearchPaused: true }),
  resumeSearch: () => set({ isSearchPlaying: true, isSearchPaused: false }),

  setCustomSearchArray: (array) => {
    // Make sure the array contains only numbers
    const processedArray = array.map((num) => Number(num));

    // Sort the array if we're using binary search
    const { currentAlgorithm } = get();
    const shouldSort = currentAlgorithm?.toLowerCase().includes("binary");

    if (shouldSort) {
      processedArray.sort((a, b) => a - b);
    }

    set({
      searchArray: processedArray,
      searchArraySize: processedArray.length,
      currentSearchIndex: -1,
      searchResult: null,
      searchTarget: null,
      isSearching: false,
      isSearchPlaying: false,
      isSearchPaused: false,
    });

    return processedArray.length;
  },

  // Add method to handle window resize and recalculate default sizes
  updateSizeBasedOnScreen: () => {
    const screenWidth = window.innerWidth;
    const defaultSize = screenWidth < 1024 ? 16 : 36;

    set({
      defaultArraySize: defaultSize,
    });

    // Only update current size if not actively sorting
    if (!get().isSorting) {
      set({ arraySize: defaultSize });
      get().generateNewArray();
    }
  },

  // Add a simpler update function that doesn't automatically regenerate arrays
  updateDefaultSizes: () => {
    const screenWidth = window.innerWidth;
    const defaultSize = screenWidth < 1024 ? 16 : 36;

    set({
      defaultArraySize: defaultSize,
    });

    // Note: We're NOT setting arraySize or regenerating arrays here
  },
}));

export default useAlgorithmStore;
