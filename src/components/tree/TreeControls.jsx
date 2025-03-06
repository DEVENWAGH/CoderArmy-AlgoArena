import React from 'react'
import useTreeStore from '../../store/treeStore'

const TreeControls = () => {
  const { 
    isPlaying,
    isPaused,
    traversalType,
    traversalSpeed,
    setTraversalType,
    setTraversalSpeed,
    startTraversal,
    pauseTraversal,
    resumeTraversal,
    resetTraversal
  } = useTreeStore()

  const traversalTypes = [
    { value: 'inorder', label: 'Inorder (Left → Root → Right)' },
    { value: 'preorder', label: 'Preorder (Root → Left → Right)' },
    { value: 'postorder', label: 'Postorder (Left → Right → Root)' },
    { value: 'levelorder', label: 'Level Order (Breadth-First)' }
  ]

  return (
    <div className="flex flex-col gap-3 p-4 bg-slate-800 rounded-lg">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[250px]">
          <label className="block text-sm font-medium text-gray-300 mb-1">Traversal Algorithm</label>
          <select
            value={traversalType}
            onChange={(e) => setTraversalType(e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            {traversalTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 flex flex-col min-w-[180px]">
          <label className="block text-sm font-medium text-gray-300 mb-1">Animation Speed</label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Fast</span>
            <input
              type="range"
              min="100"
              max="2000"
              step="100"
              value={traversalSpeed}
              onChange={(e) => setTraversalSpeed(Number(e.target.value))}
              className="w-full"
            />
            <span className="text-xs text-gray-400">Slow</span>
          </div>
          <span className="text-xs text-gray-400 self-center mt-1">{traversalSpeed}ms</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        {!isPlaying && !isPaused ? (
          <button
            onClick={startTraversal}
            className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 flex-1"
          >
            <span className="flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Start Traversal
            </span>
          </button>
        ) : isPaused ? (
          <button
            onClick={resumeTraversal}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex-1"
          >
            <span className="flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Resume
            </span>
          </button>
        ) : (
          <button
            onClick={pauseTraversal}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 flex-1"
          >
            <span className="flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Pause
            </span>
          </button>
        )}

        <button
          onClick={resetTraversal}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          <span className="flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
            </svg>
            Reset
          </span>
        </button>
      </div>

      <div className="mt-2 text-xs text-gray-400">
        <p>Current animation delay: <span className="font-semibold text-sky-300">{traversalSpeed}ms</span> between steps.</p>
      </div>
    </div>
  )
}

export default TreeControls
