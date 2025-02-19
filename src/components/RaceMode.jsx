import React from 'react'
import useAlgorithmStore from '../store/algorithmStore'

const RaceMode = () => {
  const { raceResults, startRace, isRunning } = useAlgorithmStore()

  const handleStartRace = () => {
    const selectedAlgorithms = ['Bubble Sort', 'Quick Sort', 'Merge Sort']
    startRace(selectedAlgorithms)
  }

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-sky-400">Algorithm Race Mode</h2>
        <button 
          onClick={handleStartRace}
          className="btn-primary"
          disabled={isRunning}
        >
          Start Race
        </button>
      </div>
      
      <div className="space-y-4">
        {raceResults.map((result, idx) => (
          <div key={idx} className="flex justify-between items-center">
            <span className="text-slate-300">{result.name}</span>
            <span className="text-sky-400">{result.time.toFixed(2)} ms</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RaceMode
