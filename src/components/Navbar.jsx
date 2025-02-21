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
    <nav className="fixed top-0 left-0 z-10 w-full p-4 border-b shadow-lg bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-sky-500/20 shadow-sky-500/10">
      <div className="container flex items-center justify-between mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-600">
            Algorithm Arena
          </h1>
          <p className="text-sm italic text-sky-400/80 animate-pulse">
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
              className="w-64 px-4 py-2 pl-10 text-white border rounded-lg shadow-lg bg-gray-900/50 focus:outline-none focus:ring-2 focus:ring-sky-500 border-sky-500/20 shadow-sky-500/10 backdrop-blur-sm"
            />
            <svg
              className="absolute w-4 h-4 text-gray-400 left-3 top-3"
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
          
          <span className="px-4 py-2 font-medium border rounded-lg text-sky-400 bg-sky-500/10 border-sky-500/20">
            {currentAlgorithm || 'Select Algorithm'}
          </span>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
