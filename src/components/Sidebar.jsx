import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import useAlgorithmStore from '../store/algorithmStore'

const Sidebar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { algorithmCategories, setCurrentAlgorithm, generateNewArray } = useAlgorithmStore()

  const handleAlgorithmSelect = (category, algorithm) => {
    setCurrentAlgorithm(algorithm)
    generateNewArray()
    navigate(`/${category.toLowerCase()}/${algorithm.toLowerCase().replace(/\s+/g, '-')}`)
  }

  return (
    <aside className="fixed top-0 left-0 w-64 h-screen p-4 overflow-y-auto border-r shadow-lg bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 pt-28 border-sky-500/20 shadow-sky-500/10 scrollbar scrollbar-track-gray-900/40 scrollbar-thumb-sky-500/50 scrollbar-w-2 hover:scrollbar-thumb-sky-400">
      <h2 className="mb-4 text-xl font-bold text-blue-400">Algorithms</h2>
      {Object.entries(algorithmCategories).map(([category, algorithms]) => (
        <div key={category} className="mb-6">
          <h3 className="mb-2 text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-600">
            {category}
          </h3>
          <div className="space-y-1">
            {algorithms.map(algorithm => (
              <button
                key={algorithm}
                onClick={() => handleAlgorithmSelect(category, algorithm)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                  location.pathname.includes(algorithm.toLowerCase().replace(/\s+/g, '-'))
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
