import React from "react";
import { useNavigate } from "react-router-dom";
import Footer from "./Footer"; // Import the Footer component

const Home = () => {
  const navigate = useNavigate();

  const handleRaceModeClick = () => {
    navigate("/race-mode");
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-slate-900 text-white overflow-y-auto">
      <div className="container mx-auto px-4 pt-24 pb-12 flex-grow">
        <div className="flex flex-col items-center justify-center flex-1 p-8 mt-20">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">
            Visualize Data Structures & Algorithms
          </h1>
          <p className="mt-4 text-lg text-center text-gray-300">
            Explore, understand, and master algorithms through interactive
            visualizations. Compare algorithm performance in real-time with our
            unique Race Mode.
          </p>
          <div className="flex mt-8 space-x-4">
            <button
              className="flex items-center px-6 py-3 text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              onClick={handleRaceModeClick}
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
                className="lucide lucide-zap h-5 w-5 mr-2"
              >
                <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path>
              </svg>
              Try Race Mode
            </button>
          </div>
        </div>
        <div className="w-full max-w-4xl p-8 mt-12 bg-slate-800 rounded-lg">
          <h2 className="text-2xl font-bold text-center text-white">
            Algorithm Categories
          </h2>
          <div className="grid grid-cols-1 gap-8 mt-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="p-6 bg-slate-700 rounded-lg">
              <h3 className="text-xl font-semibold text-white">
                Sorting Algorithms
              </h3>
              <p className="mt-2 text-gray-400">
                Visualize and compare different sorting techniques
              </p>
              <div className="mt-4 space-y-2">
                <span className="inline-block px-3 py-1 text-sm text-white bg-blue-600 rounded">
                  Bubble Sort
                </span>
                <span className="inline-block px-3 py-1 text-sm text-white bg-blue-600 rounded">
                  Selection Sort
                </span>
                <span className="inline-block px-3 py-1 text-sm text-white bg-blue-600 rounded">
                  Insertion Sort
                </span>
                <span className="inline-block px-3 py-1 text-sm text-white bg-blue-600 rounded">
                  Merge Sort
                </span>
                <span className="inline-block px-3 py-1 text-sm text-white bg-blue-600 rounded">
                  Quick Sort
                </span>
              </div>
              <a
                href="#"
                className="flex items-center mt-4 text-purple-500 hover:underline"
              >
                Explore Sorting Algorithms
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
                  className="lucide lucide-arrow-right h-4 w-4 ml-1"
                >
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </a>
            </div>
            <div className="p-6 bg-slate-700 rounded-lg">
              <h3 className="text-xl font-semibold text-white">
                Searching Algorithms
              </h3>
              <p className="mt-2 text-gray-400">
                Explore efficient ways to find elements in data structures
              </p>
              <div className="mt-4 space-y-2">
                <span className="inline-block px-3 py-1 text-sm text-white bg-blue-600 rounded">
                  Linear Search
                </span>
                <span className="inline-block px-3 py-1 text-sm text-white bg-blue-600 rounded">
                  Binary Search
                </span>
              </div>
              <a
                href="#"
                className="flex items-center mt-4 text-purple-500 hover:underline"
              >
                Explore Searching Algorithms
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
                  className="lucide lucide-arrow-right h-4 w-4 ml-1"
                >
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </a>
            </div>
            <div className="p-6 bg-slate-700 rounded-lg">
              <h3 className="text-xl font-semibold text-white">
                Graph Algorithms
              </h3>
              <p className="mt-2 text-gray-400">
                Visualize traversal and pathfinding techniques
              </p>
              <div className="mt-4 space-y-2">
                <span className="inline-block px-3 py-1 text-sm text-white bg-blue-600 rounded">
                  BFS
                </span>
                <span className="inline-block px-3 py-1 text-sm text-white bg-blue-600 rounded">
                  DFS
                </span>
                <span className="inline-block px-3 py-1 text-sm text-white bg-blue-600 rounded">
                  Dijkstra's
                </span>
                <span className="inline-block px-3 py-1 text-sm text-white bg-blue-600 rounded">
                  Prim's
                </span>
                <span className="inline-block px-3 py-1 text-sm text-white bg-blue-600 rounded">
                  Kruskal's
                </span>
              </div>
              <a
                href="#"
                className="flex items-center mt-4 text-purple-500 hover:underline"
              >
                Explore Graph Algorithms
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
                  className="lucide lucide-arrow-right h-4 w-4 ml-1"
                >
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Home;
