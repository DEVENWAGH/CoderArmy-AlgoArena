import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import PropTypes from "prop-types";
import Footer from "./Footer";

// Define SVG icon components outside of the main component
const SortIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
    />
  </svg>
);

const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const GraphIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
    />
  </svg>
);

const DPIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
    />
  </svg>
);

const RaceIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 10V3L4 14h7v7l9-11h-7z"
    />
  </svg>
);

// Create the AlgorithmCategory component with PropTypes
const AlgorithmCategory = ({
  title,
  description,
  icon,
  path,
  color,
  algorithms,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-slate-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div
        className="p-5 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
      >
        <div className="flex items-center mb-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center mr-3 text-white"
            style={{ backgroundColor: color }}
          >
            {icon}
          </div>
          <h3 className="text-xl font-bold text-white">{title}</h3>
        </div>
        <p className="text-gray-300 text-sm md:text-base mb-3">{description}</p>

        <div className="flex justify-between items-center">
          {path.includes(":algorithm") && algorithms.length > 0 ? (
            <Link
              to={path.replace(":algorithm", algorithms[0].id)}
              className="text-blue-400 text-sm font-medium hover:text-blue-300"
              onClick={(e) => e.stopPropagation()}
            >
              View Algorithms
            </Link>
          ) : (
            <Link
              to={path}
              className="text-blue-400 text-sm font-medium hover:text-blue-300"
              onClick={(e) => e.stopPropagation()}
            >
              Try {title}
            </Link>
          )}
          {algorithms.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="text-gray-400 hover:text-white"
              aria-label={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Expanded algorithm list */}
      {isExpanded && algorithms.length > 0 && (
        <div className="bg-slate-700 px-5 py-3">
          <h4 className="text-sm font-medium text-gray-300 mb-2">
            Popular algorithms:
          </h4>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {algorithms.map((algo) => (
              <li key={algo.id}>
                <Link
                  to={path.replace(":algorithm", algo.id)}
                  className="text-white hover:text-blue-300 text-sm flex items-center py-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span
                    className="w-2 h-2 rounded-full mr-2"
                    style={{ backgroundColor: color }}
                  ></span>
                  {algo.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Add PropTypes validation
AlgorithmCategory.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  icon: PropTypes.node.isRequired,
  path: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  algorithms: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
};

const Home = () => {
  const navigate = useNavigate();

  const handleRaceModeClick = () => {
    navigate("/race-mode");
  };

  // Sample algorithms for each category
  const sortingAlgorithms = [
    { id: "bubble", name: "Bubble Sort" },
    { id: "merge", name: "Merge Sort" },
    { id: "quick", name: "Quick Sort" },
    { id: "heap", name: "Heap Sort" },
  ];

  const searchingAlgorithms = [
    { id: "linear", name: "Linear Search" },
    { id: "binary", name: "Binary Search" },
    { id: "jump", name: "Jump Search" },
    { id: "interpolation", name: "Interpolation Search" },
  ];

  const graphAlgorithms = [
    { id: "bfs", name: "Breadth First Search" },
    { id: "dfs", name: "Depth First Search" },
    { id: "dijkstra", name: "Dijkstra's Algorithm" },
    { id: "kruskal", name: "Kruskal's Algorithm" },
  ];

  const dpAlgorithms = [
    { id: "fibonacci", name: "Fibonacci Sequence" },
    { id: "knapsack", name: "0/1 Knapsack" },
    { id: "lcs", name: "Longest Common Subsequence" },
    { id: "edit-distance", name: "Edit Distance" },
  ];

  const categories = [
    {
      title: "Sorting Algorithms",
      description:
        "Visualize and learn how different sorting algorithms work and compare their efficiencies.",
      icon: <SortIcon />,
      path: "/sorting/:algorithm",
      color: "#4C1D95",
      algorithms: sortingAlgorithms,
    },
    {
      title: "Searching Algorithms",
      description:
        "Explore various techniques to find elements in data structures.",
      icon: <SearchIcon />,
      path: "/searching/:algorithm",
      color: "#065F46",
      algorithms: searchingAlgorithms,
    },
    {
      title: "Graph Algorithms",
      description:
        "Understand the fundamental algorithms used in graph theory.",
      icon: <GraphIcon />,
      path: "/graph/:algorithm",
      color: "#1E40AF",
      algorithms: graphAlgorithms,
    },
    {
      title: "Dynamic Programming",
      description:
        "Learn optimization techniques by breaking problems down into simpler subproblems.",
      icon: <DPIcon />,
      path: "/dynamic-programming/:algorithm",
      color: "#9D174D",
      algorithms: dpAlgorithms,
    },
    {
      title: "Race Mode",
      description:
        "Compare different algorithms head-to-head in an interactive race visualization.",
      icon: <RaceIcon />,
      path: "/race-mode",
      color: "#B45309",
      algorithms: [],
    },
  ];

  return (
    <div className="flex flex-col min-h-screen w-full bg-slate-900 text-white">
      <div className="container mx-auto px-4 pt-24 pb-12 flex-grow overflow-x-hidden">
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
      </div>
      <Footer />
    </div>
  );
};

export default Home;
