import React from "react";
import { motion } from "motion/react";
import useAlgorithmStore from "../store/algorithmStore";
import { useNavigate } from "react-router-dom";

const MobileSidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const {
    algorithmCategories,
    currentAlgorithm,
    setCurrentAlgorithm,
    setArraySize,
    generateNewArray,
  } = useAlgorithmStore();

  const handleAlgorithmSelect = (category, algorithm) => {
    const categoryPath = category.toLowerCase().replace(/\s+/g, "-");
    const algorithmPath = algorithm.toLowerCase().replace(/\s+/g, "-");
    const urlPath = `/${categoryPath}/${algorithmPath}`;
    setCurrentAlgorithm(algorithm);
    setArraySize(50); // Reset array size
    generateNewArray(); // Generate fresh array
    onClose(); // Close sidebar after selection
    navigate(urlPath);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center" // Removed xl:hidden
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-11/12 max-h-[85vh] max-w-md bg-slate-900 rounded-xl p-5 overflow-y-auto"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{
          type: "spring",
          damping: 25,
          stiffness: 300,
          duration: 0.3,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6 border-b border-sky-500/20 pb-4">
          <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-600">
            Algorithm Categories
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-800"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-8 pb-2">
          {Object.entries(algorithmCategories).map(
            ([category, algorithms], categoryIndex) => (
              <motion.div
                key={category}
                className="mb-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.05 * categoryIndex }}
              >
                <h4 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-600 mb-2 hover:from-sky-300 hover:to-blue-500 cursor-default">
                  {category}
                </h4>

                <div className="relative">
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-sky-400 to-blue-600 rounded-full"></div>

                  <div className="pl-4">
                    {algorithms.map((algorithm, algoIndex) => (
                      <div
                        key={algorithm}
                        onClick={() =>
                          handleAlgorithmSelect(category, algorithm)
                        }
                        className={`cursor-pointer transition-colors text-white py-1.5
                        ${
                          currentAlgorithm === algorithm
                            ? "font-medium text-sky-300"
                            : "hover:text-sky-400"
                        }`}
                      >
                        {algorithm}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MobileSidebar;
