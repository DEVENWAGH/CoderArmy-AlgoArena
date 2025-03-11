import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import useAlgorithmStore from "../store/algorithmStore";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Add useLocation hook to fix location reference
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
    navigate(urlPath);
  };

  return (
    <aside className="fixed top-0 left-0 w-64 h-screen p-4 overflow-y-auto border-r shadow-lg bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 pt-28 border-sky-500/20 shadow-sky-500/10 scrollbar scrollbar-track-gray-900/40 scrollbar-thumb-sky-500/50 scrollbar-w-2 hover:scrollbar-thumb-sky-400">
      {Object.entries(algorithmCategories).map(([category, algorithms]) => (
        <div key={category} className="mb-6">
          <h3 className="mb-2 text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-600">
            {category}
          </h3>
          <div className="space-y-1">
            {algorithms.map((algorithm) => (
              <button
                key={algorithm}
                onClick={() => handleAlgorithmSelect(category, algorithm)}
                className={`group relative w-full text-left px-3 py-2 rounded-lg transition-all overflow-hidden
                  ${
                    location.pathname.includes(
                      algorithm.toLowerCase().replace(/\s+/g, "-")
                    )
                      ? "bg-[linear-gradient(110deg,#041b36,45%,#0c7bb8,55%,#041b36)] text-white border-sky-500/40 shadow-lg shadow-sky-500/10"
                      : "bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] text-slate-400 border-slate-800"
                  } border font-medium focus:outline-none focus:ring-2 focus:ring-slate-400`}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  initial={{ x: "-100%" }}
                  animate={{ 
                    x: "100%",
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
                <span className="relative z-10">{algorithm}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </aside>
  );
};

export default Sidebar;
