import React from 'react'
import { Routes, Route, Outlet } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './components/Home'
import SortingVisualizer from './components/sorting/SortingVisualizer'

const App = () => {
  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="sorting">
            <Route path=":algorithm" element={<SortingVisualizer />} />
          </Route>
        </Route>
      </Routes>
    </div>
  )
}

export default App
