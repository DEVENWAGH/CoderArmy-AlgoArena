import React from 'react'
import { Routes, Route, Outlet } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './components/Home'
import SortingVisualizer from './components/sorting/SortingVisualizer'
import SearchVisualizer from './components/searching/SearchVisualizer'

const App = () => {
  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="sorting/:algorithm" element={<SortingVisualizer />} />
          <Route path="searching/:algorithm" element={<SearchVisualizer />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App
