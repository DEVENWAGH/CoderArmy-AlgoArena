import React from 'react'
import useAlgorithmStore from '../store/algorithmStore'

const Navbar = () => {
  const { 
    currentAlgorithm, 
    searchQuery, 
    setSearchQuery, 
    searchAlgorithms 
  } = useAlgorithmStore()

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
  }

  return (
    <nav className="w-full bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 fixed top-0 left-0 z-10 p-4 border-b border-sky-500/20 shadow-lg shadow-sky-500/10">
      <div className="container mx-auto flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-600">
            Algorithm Arena
          </h1>
          <p className="text-sky-400/80 text-sm italic animate-pulse">
            Feel the heartbeat of dynamic DSA
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search algorithms..."
              value={searchQuery}
              onChange={handleSearch}
              className="bg-gray-900/50 text-white px-4 py-2 rounded-lg pl-10 w-64 
                focus:outline-none focus:ring-2 focus:ring-sky-500 
                border border-sky-500/20 shadow-lg shadow-sky-500/10
                backdrop-blur-sm"
            />
            <svg
              className="absolute left-3 top-3 h-4 w-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          
          <span className="text-sky-400 font-medium px-4 py-2 rounded-lg 
            bg-sky-500/10 border border-sky-500/20">
            {currentAlgorithm || 'Select Algorithm'}
          </span>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
