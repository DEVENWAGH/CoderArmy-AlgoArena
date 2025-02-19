import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import useAlgorithmStore from '../store/algorithmStore'

const Navbar = () => {
  const { speed, setSpeed, isRunning } = useAlgorithmStore()
  const navigate = useNavigate()
  const location = useLocation()

  const toggleRaceMode = () => {
    if (location.pathname === '/race') {
      navigate('/')
    } else {
      navigate('/race')
    }
  }

  return (
    <nav className="bg-slate-800 shadow-lg px-6 py-4 border-b border-slate-700">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-sky-400">Algorithm Arena</h1>
          <span className="text-sm text-slate-400">Feel the heartbeat of dynamic DSA</span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <label htmlFor="speed" className="text-sm text-slate-300">
              Speed:
            </label>
            <input
              id="speed"
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              disabled={isRunning}
              className="w-32 accent-sky-400"
            />
          </div>
          
          <button 
            onClick={toggleRaceMode}
            className={`btn-primary flex items-center gap-2 ${
              location.pathname === '/race' ? 'bg-red-600 hover:bg-red-700' : ''
            }`}
          >
            {location.pathname === '/race' ? (
              <>
                <span>Exit Race Mode</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"/>
                </svg>
              </>
            ) : (
              <>
                <span>Algorithm Race Mode</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 3a7 7 0 017 7v3a1 1 0 01-1 1h-1v-1a1 1 0 00-1-1H6a1 1 0 00-1 1v1H4a1 1 0 01-1-1v-3a7 7 0 017-7zm0 4a1 1 0 100 2 1 1 0 000-2z"/>
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
