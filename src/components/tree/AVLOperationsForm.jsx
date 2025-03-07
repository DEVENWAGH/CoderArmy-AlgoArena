import React, { useState } from 'react';
import useTreeStore from '../../store/treeStore';

const AVLOperationsForm = () => {
  const [value, setValue] = useState('');
  const [currentOperation, setCurrentOperation] = useState(null);
  const { insertAVL, deleteAVL, searchBST, searchFound, bstTargetValue } = useTreeStore();

  const handleSubmit = async (e, operation) => {
    e.preventDefault();
    const numValue = parseInt(value);
    if (isNaN(numValue)) return;

    setCurrentOperation(operation);
    
    if (operation === 'search') {
      await searchBST(numValue);
    } else if (operation === 'insert') {
      await insertAVL(numValue);
    } else if (operation === 'delete') {
      await deleteAVL(numValue);
    }
    setValue('');
  };

  const getResultMessage = () => {
    if (searchFound === null || bstTargetValue === null) return null;
    
    if (searchFound) {
      if (currentOperation === 'delete') {
        return `Value ${bstTargetValue} removed from the tree`;
      } else if (currentOperation === 'insert') {
        return `Value ${bstTargetValue} inserted into the tree`;
      }
      return `Found value ${bstTargetValue} in the tree`;
    } else {
      if (currentOperation === 'delete') {
        return `Cannot delete: Value ${bstTargetValue} does not exist in the tree`;
      } else if (currentOperation === 'insert') {
        return `Value ${bstTargetValue} already exists in the tree`;
      }
      return `Value ${bstTargetValue} does not exist in the tree`;
    }
  };

  return (
    <div className="mb-4 p-4 bg-slate-800 rounded-lg">
      <h3 className="text-lg font-medium text-white mb-4">AVL Tree Operations</h3>
      
      <form className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter a value..."
            className="w-40 px-4 py-2 bg-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          <button
            onClick={(e) => handleSubmit(e, 'search')}
            type="button"
            className="px-6 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search
          </button>
          <button
            onClick={(e) => handleSubmit(e, 'insert')}
            type="button"
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Insert
          </button>
          <button
            onClick={(e) => handleSubmit(e, 'delete')}
            type="button"
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>

        {searchFound !== null && bstTargetValue !== null && (
          <div className={`px-6 py-3 rounded-lg text-center font-medium ${
            searchFound 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}>
            {getResultMessage()}
          </div>
        )}
      </form>
    </div>
  );
};

export default AVLOperationsForm;
