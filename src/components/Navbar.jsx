import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // Import useLocation
import { motion, AnimatePresence } from "framer-motion"; // Import AnimatePresence
import useAlgorithmStore from "../store/algorithmStore";
import MobileSidebar from "./MobileSidebar";
import Sidebar from "./Sidebar"; // Import Sidebar component

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Use useLocation to get the current route
  const isHomePage = location.pathname === "/"; // Check if the current route is the home page
  const isRaceModePage = location.pathname === "/race-mode"; // Check if the current route is the race mode page
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false); // Add state for sidebar visibility
  const {
    currentAlgorithm,
    searchQuery,
    setSearchQuery,
    searchAlgorithms,
    searchResults,
    setCurrentAlgorithm,
    algorithmCategories,
  } = useAlgorithmStore();

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchAlgorithms(query);
  };

  const handleAlgorithmClick = (algorithm) => {
    const category = Object.keys(algorithmCategories).find((cat) =>
      algorithmCategories[cat].includes(algorithm)
    );
    if (category) {
      const categoryPath = category.toLowerCase().replace(/\s+/g, "-");
      const algorithmPath = algorithm.toLowerCase().replace(/\s+/g, "-");
      const urlPath = `/${categoryPath}/${algorithmPath}`;
      setCurrentAlgorithm(algorithm);
      setSearchQuery("");
      setShowMobileSidebar(false); // Hide sidebar after selection
      setShowSidebar(false); // Hide sidebar after selection on larger devices
      navigate(urlPath);
    }
  };

  return (
    <>
      <nav className="fixed h-38 md:h-auto top-0 left-0 right-0 bg-slate-900 border-b border-sky-500/20 shadow-lg z-50">
        <div className="container flex flex-col md:flex-row items-center justify-between mx-auto p-4">
          <div>
            <a href="/">
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-600">
                Algorithm Arena
              </h1>
            </a>
            <p className="text-sm italic text-sky-400/80 animate-pulse">
              Feel the heartbeat of dynamic DSA
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 mt-2 md:mt-0">
            <div className="relative">
              <input
                type="text"
                placeholder="Search algorithms..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-64 px-4 py-2 pl-10 text-white border rounded-lg shadow-lg bg-gray-900/50 focus:outline-none focus:ring-2 focus:ring-sky-500 border-sky-500/20 shadow-sky-500/10 backdrop-blur-sm"
              />
              <svg
                className="absolute w-4 h-4 text-gray-400 left-3 top-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              {searchQuery && (
                <div className="absolute z-10 w-full mt-2 bg-gray-800 rounded-lg shadow-lg">
                  {searchResults.map((result, index) => (
                    <button
                      key={index}
                      onClick={() => handleAlgorithmClick(result.name)}
                      className="block w-full px-4 py-2 text-left text-white hover:bg-gray-700"
                    >
                      {result.name}{" "}
                      <span className="text-sm text-gray-400">
                        ({result.category})
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setShowMobileSidebar(true)}
              className="px-4 py-2 font-medium border rounded-lg text-sky-400 bg-sky-500/10 border-sky-500/20 xl:hidden"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-code-xml h-5 w-5 mr-2 inline-block"
              >
                <path d="m18 16 4-4-4-4"></path>
                <path d="m6 8-4 4 4 4"></path>
                <path d="m14.5 4-5 16"></path>
              </svg>
              {currentAlgorithm || "Explore Algorithms"}
            </button>

            {(isHomePage || isRaceModePage) && ( // Conditionally render the button based on the current route
              <button
                onClick={() => setShowSidebar(!showSidebar)} // Toggle sidebar visibility
                className="mt-2 md:mt-0 px-4 py-2 font-medium border rounded-lg text-sky-400 bg-sky-500/10 border-sky-500/20 hidden xl:block"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-code-xml h-5 w-5 mr-2 inline-block"
                >
                  <path d="m18 16 4-4-4-4"></path>
                  <path d="m6 8-4 4 4 4"></path>
                  <path d="m14.5 4-5 16"></path>
                </svg>
                {currentAlgorithm || "Explore Algorithms"}
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Use the separate MobileSidebar component */}
      <MobileSidebar
        isOpen={showMobileSidebar}
        onClose={() => setShowMobileSidebar(false)}
      />

      {/* Sidebar for larger devices */}
      <AnimatePresence>
        {showSidebar && (
          <div className="fixed inset-0 z-40 flex">
            <div
              className="fixed inset-0 bg-black opacity-50"
              onClick={() => setShowSidebar(false)}
            ></div>
            <motion.div
              className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-900"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <button
                className="absolute top-0 right-0 mt-4 mr-4 text-white"
                onClick={() => setShowSidebar(false)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-x h-6 w-6"
                >
                  <path d="M18 6L6 18M6 6l12 12"></path>
                </svg>
              </button>
              <Sidebar />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
