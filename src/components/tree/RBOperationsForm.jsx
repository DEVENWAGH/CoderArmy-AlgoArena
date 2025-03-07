import React, { useState } from 'react'
import useTreeStore from '../../store/treeStore'

const RBOperationsForm = () => {
  const [value, setValue] = useState('')
  const { insertRB, deleteRB, searchBST, searchFound } = useTreeStore()
  const [loading, setLoading] = useState(false)
  const [operation, setOperation] = useState(null)
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!value || isNaN(parseInt(value))) {
      alert('Please enter a valid number')
      return
    }
    
    setLoading(true)
    setOperation('processing')
    
    try {
      const numValue = parseInt(value)
      
      if (e.target.id === 'insert-form') {
        await insertRB(numValue)
        setOperation('insert')
      } else if (e.target.id === 'delete-form') {
        await deleteRB(numValue)
        setOperation('delete')
      } else if (e.target.id === 'search-form') {
        await searchBST(numValue)
        setOperation('search')
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }
  
  // Display message based on operation result
  const getMessage = () => {
    if (operation === 'processing') return 'Processing...'
    if (operation === 'insert') {
      return searchFound === true 
        ? `Value ${value} inserted successfully` 
        : `Value ${value} already exists`
    }
    if (operation === 'delete') {
      return searchFound === true 
        ? `Value ${value} deleted successfully` 
        : `Value ${value} not found`
    }
    if (operation === 'search') {
      return searchFound === true 
        ? `Value ${value} found` 
        : `Value ${value} not found`
    }
    return ''
  }

  return (
    <div className="p-4 mb-4 bg-slate-800 rounded-lg">
      <h3 className="mb-4 text-lg font-bold text-white">Red-Black Tree Operations</h3>
      
      {/* Common input field for all operations */}
      <div className="mb-4">
        <div className="flex items-center rounded overflow-hidden">
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="flex-1 p-2 text-white bg-slate-700"
            placeholder="Enter value"
          />
        </div>
      </div>
      
      {/* Better aligned operation buttons */}
      <div className="grid grid-cols-3 gap-3">
        <form id="search-form" onSubmit={handleSubmit}>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Search
          </button>
        </form>
        
        <form id="insert-form" onSubmit={handleSubmit}>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 font-bold text-white bg-green-500 rounded hover:bg-green-600 disabled:opacity-50"
          >
            Insert
          </button>
        </form>
        
        <form id="delete-form" onSubmit={handleSubmit}>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 font-bold text-white bg-red-500 rounded hover:bg-red-600 disabled:opacity-50"
          >
            Delete
          </button>
        </form>
      </div>
      
      {operation && (
        <div className={`mt-4 p-2 rounded text-center ${
          loading ? 'bg-yellow-800 text-yellow-200' : 
          searchFound ? 'bg-green-800 text-green-200' : 'bg-red-800 text-red-200'
        }`}>
          {getMessage()}
        </div>
      )}
    </div>
  )
}

export default RBOperationsForm
