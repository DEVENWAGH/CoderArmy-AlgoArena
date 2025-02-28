import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './components/Home'
import SortingVisualizer from './components/sorting/SortingVisualizer'
import SearchVisualizer from './components/searching/SearchVisualizer'
import GraphVisualizer from './components/graph/GraphVisualizer'
import DPVisualizer from './components/dp/DPVisualizer'
import GreedyVisualizer from './components/greedy/GreedyVisualizer'
import BacktrackingVisualizer from './components/backtracking/BacktrackingVisualizer'
import ErrorBoundary from './components/ErrorBoundary'

const App = () => {
  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden">
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="sorting/:algorithm" element={<SortingVisualizer />} />
            <Route path="searching/:algorithm" element={<SearchVisualizer />} />
            <Route path="graph/:algorithm" element={<GraphVisualizer />} />
            <Route path="dynamic-programming/:algorithm" element={<DPVisualizer />} />
            <Route path="greedy-algorithm/:algorithm" element={<GreedyVisualizer />} />
            <Route path="backtracking/:algorithm" element={<BacktrackingVisualizer />} />
          </Route>
        </Routes>
      </ErrorBoundary>
    </div>
  )
}

export default App
