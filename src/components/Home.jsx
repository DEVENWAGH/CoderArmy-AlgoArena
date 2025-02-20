import React from 'react'

const Home = () => {
  return (
    <div className="flex flex-col w-full h-full bg-slate-700">
      <div className="flex-1 p-8 bg-slate-600">
        <h1 className="mb-4 text-3xl font-bold text-blue-500">
          Welcome to AlgoArena
        </h1>
        <p className="text-gray-300">
          Explore and learn different algorithms through interactive visualizations
        </p>
      </div>
    </div>
  )
}

export default Home
