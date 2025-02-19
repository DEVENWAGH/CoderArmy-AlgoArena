import { create } from 'zustand'
import { 
  bubbleSort, 
  selectionSort, 
  insertionSort, 
  mergeSort, 
  quickSort 
} from '../algorithms/sorting'
import { 
  linearSearch, 
  binarySearch 
} from '../algorithms/searching'
import { 
  activitySelection, 
  huffmanCoding 
} from '../algorithms/greedy'
import { 
  sudokuSolver, 
  nQueens 
} from '../algorithms/backtracking'
import { 
  fibonacci,
  factorial,
  gcd,
  sieveOfEratosthenes,
  primeFactorization 
} from '../algorithms/mathematical'
import { 
  treeTraversals, 
  bstOperations,
  avlRotations,
  findLCA 
} from '../algorithms/tree'

const useAlgorithmStore = create((set, get) => ({
  currentAlgorithm: null,
  array: [],
  speed: 1,
  isRunning: false,
  comparisonMode: false,
  treeData: null,
  raceMode: false,
  raceResults: [],
  algorithms: {
    'Bubble Sort': bubbleSort,
    'Selection Sort': selectionSort,
    'Insertion Sort': insertionSort,
    'Merge Sort': mergeSort,
    'Quick Sort': quickSort,
    'Linear Search': linearSearch,
    'Binary Search': binarySearch,
    'Activity Selection': activitySelection,
    'Huffman Coding': huffmanCoding,
    'N-Queens': nQueens,
    'Sudoku Solver': sudokuSolver,
    'Fibonacci': fibonacci,
    'Factorial': factorial,
    'GCD (Euclidean)': gcd,
    'Sieve of Eratosthenes': sieveOfEratosthenes,
    'Prime Factorization': primeFactorization,
    'Tree Traversals': treeTraversals,
    'BST Operations': bstOperations,
    'AVL Rotations': avlRotations,
    'LCA': findLCA
  },
  
  setCurrentAlgorithm: (algorithm) => set({ currentAlgorithm: algorithm }),
  setArray: (array) => set({ array }),
  setSpeed: (speed) => set({ speed }),
  setIsRunning: (isRunning) => set({ isRunning }),
  setComparisonMode: (comparisonMode) => set({ comparisonMode }),
  setTreeData: (data) => set({ treeData: data }),
  setRaceMode: (enabled) => set({ raceMode: enabled }),
  setRaceResults: (results) => set({ raceResults: results }),
  
  executeAlgorithm: async () => {
    const { currentAlgorithm, array, algorithms, setIsRunning } = get();
    if (!currentAlgorithm || !algorithms[currentAlgorithm]) return;
    
    setIsRunning(true);
    try {
      const result = await algorithms[currentAlgorithm](array, (newArray, activeIndices) => {
        set({ array: newArray, activeIndices });
        return new Promise(resolve => setTimeout(resolve, 1000 / get().speed));
      });
      set({ array: result });
    } finally {
      setIsRunning(false);
    }
  },
  
  startRace: async (selectedAlgorithms) => {
    const { setIsRunning, algorithms, speed } = get()
    setIsRunning(true)
    
    try {
      const initialArray = Array.from({ length: 50 }, () => Math.floor(Math.random() * 100) + 1)
      const results = await Promise.all(
        selectedAlgorithms.map(async (algo) => {
          const startTime = performance.now()
          const arrayCopy = [...initialArray]
          await algorithms[algo](arrayCopy, () => {
            return new Promise(resolve => setTimeout(resolve, 1000 / speed))
          })
          const endTime = performance.now()
          return { name: algo, time: endTime - startTime }
        })
      )
      set({ raceResults: results.sort((a, b) => a.time - b.time) })
    } finally {
      setIsRunning(false)
    }
  },
  
  resetState: () => set({
    currentAlgorithm: null,
    array: [],
    speed: 1,
    isRunning: false,
    comparisonMode: false,
  }),
}))

export default useAlgorithmStore
