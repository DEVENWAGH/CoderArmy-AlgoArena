import React from 'react'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Home from './components/Home'

const App = () => {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      <Navbar />
      <div className="flex flex-1 w-full">
        <aside className="w-64 flex-shrink-0">
          <Sidebar />
        </aside>
        <main className="flex-1 w-full">
          <Home />
        </main>
      </div>
    </div>
  )
}

export default App
