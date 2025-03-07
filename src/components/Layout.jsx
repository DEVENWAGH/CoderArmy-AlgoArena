import React from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import { Outlet } from 'react-router-dom'

const Layout = () => {
  return (
    <>
      <Navbar />
      <div className="flex flex-1 w-full">
        <aside className="hidden md:block md:w-64 flex-shrink-0">
          <Sidebar />
        </aside>
        <main className="flex-1 w-full">
          <Outlet />
        </main>
      </div>
    </>
  )
}

export default Layout
