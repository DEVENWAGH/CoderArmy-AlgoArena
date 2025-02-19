import React from 'react'
import useAlgorithmStore from '../store/algorithmStore'

const algorithms = {
  'Sorting': ['Bubble Sort', 'Selection Sort', 'Insertion Sort', 'Merge Sort', 'Quick Sort'],
  'Searching': ['Linear Search', 'Binary Search'],
  'Graph': ['BFS', 'DFS', "Dijkstra's", "Prim's", "Kruskal's"],
  'Dynamic Programming': ['Fibonacci', 'Knapsack', 'LCS', 'LIS'],
  'Tree': ['Tree Traversals', 'BST Operations', 'AVL Rotations'],
}

const Sidebar = () => {
  const { currentAlgorithm, setCurrentAlgorithm, isRunning } = useAlgorithmStore()

  return (
    <div className="w-64 bg-slate-800 shadow-xl border-r border-slate-700">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4 text-sky-400">Algorithms</h2>
        <div className="space-y-4">
          {Object.entries(algorithms).map(([category, algs]) => (
            <div key={category}>
              <h3 className="text-sm font-medium text-slate-400 mb-2">{category}</h3>
              <ul className="space-y-1">
                {algs.map((algorithm) => (
                  <li key={algorithm}>
                    <button
                      className={`w-full text-left px-3 py-2 text-sm rounded transition-colors
                        ${currentAlgorithm === algorithm 
                          ? 'bg-blue-600 text-white' 
                          : 'text-slate-300 hover:bg-slate-700'}`}
                      onClick={() => setCurrentAlgorithm(algorithm)}
                      disabled={isRunning}
                    >
                      {algorithm}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Sidebar
