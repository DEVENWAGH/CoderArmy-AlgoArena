import React, { useState } from 'react';
import { parseTreeInput, createBalancedTree } from '../../utils/treeParser';
import { createDefaultTree } from '../../utils/defaultTree';

const TreeInputForm = ({ onTreeChange }) => {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      const parsedTree = parseTreeInput(inputValue);
      if (!parsedTree) {
        setError('Invalid tree format. Please use comma-separated values like "1,2,3,null,4,5".');
        return;
      }
      onTreeChange(parsedTree);
      setError('');
    } catch (err) {
      setError('Error parsing tree input: ' + err.message);
    }
  };

  const handleUseDefault = () => {
    const defaultTree = createDefaultTree();
    onTreeChange(defaultTree);
    setInputValue('');
    setError('');
  };

  return (
    <div className="mb-4 p-4 bg-slate-800 rounded-lg">
      <h3 className="text-lg font-medium text-white mb-2">Tree Input</h3>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Enter values (e.g., 1,2,3,null,4,5)"
            className="flex-1 px-3 py-2 bg-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600"
          >
            Apply
          </button>
        </div>
        
        {error && (
          <p className="text-red-500 text-sm mt-1">{error}</p>
        )}
        
        <div className="flex justify-between mt-2">
          <button
            type="button"
            onClick={handleUseDefault}
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
          >
            Use Balanced BST
          </button>
          
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onTreeChange(createSampleTree('complete'))}
              className="px-3 py-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm"
            >
              Complete Tree
            </button>
            <button
              type="button"
              onClick={() => onTreeChange(createSampleTree('unbalanced'))}
              className="px-3 py-1 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm"
            >
              Unbalanced Tree
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

// Additional sample trees
const createSampleTree = (type) => {
  if (type === 'complete') {
    return {
      value: 1,
      left: {
        value: 2,
        left: { value: 4 },
        right: { value: 5 }
      },
      right: {
        value: 3,
        left: { value: 6 },
        right: { value: 7 }
      }
    };
  } else if (type === 'unbalanced') {
    return {
      value: 1,
      right: {
        value: 2,
        right: {
          value: 3,
          right: {
            value: 4,
            right: {
              value: 5
            }
          }
        }
      }
    };
  }
};

export default TreeInputForm;
