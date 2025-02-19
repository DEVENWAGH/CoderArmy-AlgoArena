import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import AlgorithmVisualizer from './components/AlgorithmVisualizer'
import RaceMode from './components/RaceMode'
import { motion } from 'framer-motion'

const App = () => {
  return (
    <BrowserRouter>
      <div className="flex w-screen min-h-screen bg-slate-900">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar />
          <motion.main 
            className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-800 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Routes>
              <Route path="/" element={<AlgorithmVisualizer />} />
              <Route path="/race" element={<RaceMode />} />
            </Routes>
          </motion.main>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
