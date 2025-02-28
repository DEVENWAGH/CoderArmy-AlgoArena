import React from 'react';
import { motion } from "motion/react";

const LCSTable = ({ table, currentCell, str1, str2 }) => {
  if (!table || !table.length) return null;
  
  return (
    <div className="flex flex-col items-center">
      {/* Top header row with string2 characters */}
      <div className="flex">
        {/* Top-left empty cell */}
        <div className="w-12 h-12 flex items-center justify-center font-bold text-white bg-gray-700 border-b border-r border-gray-600">
          -
        </div>
        
        {/* Top row with dash and string2 chars */}
        <div className="flex">
          <div className="w-12 h-12 flex items-center justify-center font-bold text-white bg-gray-700 border-b border-r border-gray-600">
            -
          </div>
          {str2.split('').map((char, i) => (
            <div
              key={`col-${i}`}
              className="w-12 h-12 flex items-center justify-center font-bold text-white bg-gray-700 border-b border-r border-gray-600"
            >
              {char}
            </div>
          ))}
        </div>
      </div>
      
      {/* Main table rows */}
      <div className="flex">
        {/* Left column with string1 characters */}
        <div className="flex flex-col">
          <div className="w-12 h-12 flex items-center justify-center font-bold text-white bg-gray-700 border-b border-r border-gray-600">
            -
          </div>
          {str1.split('').map((char, i) => (
            <div
              key={`row-${i}`}
              className="w-12 h-12 flex items-center justify-center font-bold text-white bg-gray-700 border-b border-r border-gray-600"
            >
              {char}
            </div>
          ))}
        </div>
        
        {/* Cell values */}
        <div className="grid gap-1" style={{ 
          gridTemplateColumns: `repeat(${table[0]?.length || 1}, minmax(40px, 1fr))`,
          gridTemplateRows: `repeat(${table.length || 1}, minmax(40px, 1fr))`
        }}>
          {table.map((row, i) => (
            row.map((value, j) => (
              <motion.div
                key={`${i}-${j}`}
                className={`w-12 h-12 flex items-center justify-center rounded
                  ${currentCell?.[0] === i && currentCell?.[1] === j 
                    ? 'bg-yellow-500' 
                    : value !== 0 
                      ? 'bg-green-500'
                      : 'bg-blue-500'
                  }`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <span className="text-lg font-bold text-white">
                  {value}
                </span>
              </motion.div>
            ))
          ))}
        </div>
      </div>
    </div>
  );
};

export default LCSTable;
