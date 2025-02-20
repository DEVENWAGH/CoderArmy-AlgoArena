import { create } from 'zustand'

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
  }
}));

export default useAlgorithmStore;
