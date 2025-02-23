import React from 'react'
import { useNavigate } from 'react-router-dom'
import useAlgorithmStore from '../store/algorithmStore'

const Sidebar = () => {
  const navigate = useNavigate()
  const { 
    algorithmCategories, 
    currentAlgorithm,
    setCurrentAlgorithm,
    setArraySize,
    generateNewArray
  } = useAlgorithmStore()

  const handleAlgorithmSelect = (category, algorithm) => {
    const urlPath = `/${category.toLowerCase()}/${algorithm.toLowerCase().replace(/\s+/g, '-')}`
    setCurrentAlgorithm(algorithm)
    setArraySize(50) // Reset array size
    generateNewArray() // Generate fresh array
    navigate(urlPath)
  }

  return (
    <aside className="w-64 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 
      h-screen fixed left-0 top-0 p-4 overflow-y-auto pt-28
      border-r border-sky-500/20 shadow-lg shadow-sky-500/10
      scrollbar scrollbar-track-gray-900/40 scrollbar-thumb-sky-500/50
      scrollbar-w-2 hover:scrollbar-thumb-sky-400">
      {Object.entries(algorithmCategories).map(([category, algorithms]) => (
        <div key={category} className="mb-6">
          <h3 className="text-sm font-semibold text-transparent bg-clip-text 
            bg-gradient-to-r from-sky-400 to-blue-600 mb-2">
            {category}
          </h3>
          <div className="space-y-1">
            {algorithms.map(algorithm => (
              <button
                key={algorithm}
                onClick={() => handleAlgorithmSelect(category, algorithm)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-all
                  ${location.pathname.includes(algorithm.toLowerCase().replace(/\s+/g, '-'))
                    ? 'bg-sky-500/20 text-white border border-sky-500/40 shadow-lg shadow-sky-500/10' 
                    : 'text-gray-300 hover:bg-sky-500/10 hover:border hover:border-sky-500/20'
                  }`}
              >
                {algorithm}
              </button>
            ))}
          </div>
        </div>
      ))}
    </aside>
  )
}

export default Sidebar
