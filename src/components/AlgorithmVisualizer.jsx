import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import useAlgorithmStore from '../store/algorithmStore'

const AlgorithmVisualizer = () => {
  const { array, setArray, isRunning, currentAlgorithm } = useAlgorithmStore()

  const generateRandomArray = () => {
    const newArray = Array.from({ length: 50 }, () => 
      Math.floor(Math.random() * 100) + 1
    )
    setArray(newArray)
  }

  useEffect(() => {
    generateRandomArray()
  }, [])

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-sky-400">
          {currentAlgorithm || 'Select an Algorithm'}
        </h2>
        <button 
          onClick={generateRandomArray}
          className="btn-primary"
          disabled={isRunning}
        >
          Generate New Array
        </button>
      </div>
      
      <div className="flex items-end h-[400px] gap-1 bg-slate-900 rounded-lg p-4">
        {array.map((value, idx) => (
          <motion.div
            key={idx}
            className="w-2 bg-sky-400"
            style={{ height: `${value * 3}px` }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.01 }}
          />
        ))}
      </div>
    </div>
  )
}

export default AlgorithmVisualizer
