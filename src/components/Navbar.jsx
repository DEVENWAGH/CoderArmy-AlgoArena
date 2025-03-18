import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAlgorithmStore from "../store/algorithmStore";
import MobileSidebar from "./MobileSidebar";

const Navbar = () => {
  const navigate = useNavigate();
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
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
      setShowMobileSidebar(false);
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
              Feel the heartbeat of Visualize DSA
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
                  {searchResults.map((result) => (
                    <button
                      key={result.name}
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
              className="px-4 py-2 font-medium border rounded-lg text-sky-400 
              bg-[linear-gradient(110deg,#041b36,45%,#0c7bb8,55%,#041b36)] 
              bg-[length:200%_100%] animate-shimmer 
              border-sky-500/30 hover:border-sky-500/80
              hover:bg-[linear-gradient(110deg,#052243,45%,#0e96e0,55%,#052243)]
              hover:shadow-[0_0_15px_rgba(14,150,224,0.5)]
              transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
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
          </div>
        </div>
      </nav>

      <MobileSidebar
        isOpen={showMobileSidebar}
        onClose={() => setShowMobileSidebar(false)}
      />
    </>
  );
};

export default Navbar;
