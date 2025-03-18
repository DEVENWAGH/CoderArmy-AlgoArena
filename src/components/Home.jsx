import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import PropTypes from "prop-types";
import Footer from "./Footer";
import { Cover } from "./ui/cover";
import { TextGenerateEffect } from "./ui/text-generate-effect";
import { WavyBackground } from "./ui/wavy-background";
import { HoverBorderGradient } from "./ui/hover-border-gradient";
import Seo from "./Seo";
import { motion } from "motion/react";
import { CardBody, CardContainer, CardItem } from "./ui/3d-card";

// Define SVG icon components outside of the main component
const SortIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-6 h-6"
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
    className="w-6 h-6"
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
    className="w-6 h-6"
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
    className="w-6 h-6"
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
    className="w-6 h-6"
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

const GreedyIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-6 h-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const BacktrackingIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-6 h-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z"
    />
  </svg>
);

const TreeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-6 h-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <circle cx="12" cy="5" r="2" strokeWidth="2" />
    <circle cx="6" cy="12" r="2" strokeWidth="2" />
    <circle cx="18" cy="12" r="2" strokeWidth="2" />
    <circle cx="6" cy="19" r="2" strokeWidth="2" />
    <circle cx="18" cy="19" r="2" strokeWidth="2" />
    <line x1="12" y1="7" x2="6" y2="10" strokeWidth="2" />
    <line x1="12" y1="7" x2="18" y2="10" strokeWidth="2" />
    <line x1="6" y1="14" x2="6" y2="17" strokeWidth="2" />
    <line x1="18" y1="14" x2="18" y2="17" strokeWidth="2" />
  </svg>
);

const MathIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-6 h-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
    />
  </svg>
);

// Simplified AlgorithmCategory component without dropdown functionality
const AlgorithmCategory = ({
  title,
  description,
  icon,
  path,
  color,
  algorithms,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Generate lighter shade of the primary color
  const getLighterColor = (hexColor) => {
    // Remove the # if present
    const hex = hexColor.replace("#", "");

    // Convert to RGB
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    // Make it lighter
    r = Math.min(255, r + 40);
    g = Math.min(255, g + 40);
    b = Math.min(255, b + 40);

    // Convert back to hex
    return `#${r.toString(16).padStart(2, "0")}${g
      .toString(16)
      .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  };

  const lighterColor = getLighterColor(color);
  const glowColor = color + "40"; // 40 is hex for 25% opacity

  // Determine the link path - direct to first algorithm if available
  const linkPath =
    algorithms.length > 0 ? path.replace(":algorithm", algorithms[0].id) : path;

  return (
    <CardContainer className="h-full">
      <CardBody
        className="bg-slate-800 relative group/card hover:shadow-2xl border-slate-700 border w-auto h-full rounded-xl overflow-visible"
        style={{
          boxShadow: isHovered ? `0 0 20px 5px ${glowColor}` : "none",
        }}
      >
        {/* Add role and tabIndex for accessibility */}
        <div
          className="p-6 cursor-pointer flex-1 flex flex-col h-full"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            background: isHovered
              ? `linear-gradient(135deg, ${color}15, ${lighterColor}30)`
              : "transparent",
          }}
          role="button"
          tabIndex={0}
          aria-label={`Explore ${title}`}
        >
          <CardItem translateZ="40" className="flex items-center mb-4">
            <div
              className={`flex items-center justify-center w-12 h-12 mr-4 text-white rounded-lg transition-all duration-300 ${
                isHovered ? "scale-110" : ""
              }`}
              style={{
                backgroundColor: color,
                boxShadow: isHovered ? `0 0 15px ${color}80` : "none",
              }}
            >
              {icon}
            </div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
          </CardItem>

          <CardItem translateZ="50" className="flex-grow">
            <p className="mb-6 text-sm text-gray-300 md:text-base">
              {description}
            </p>
          </CardItem>

          <CardItem translateZ="30" className="w-full">
            <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-700">
              <Link
                to={linkPath}
                className={`text-sm font-medium transition-colors duration-300 flex items-center ${
                  isHovered ? "text-blue-300" : "text-blue-400"
                }`}
              >
                <span>
                  {algorithms.length > 0
                    ? `Try ${algorithms[0].name}`
                    : `Try ${title}`}
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`w-4 h-4 ml-1 transition-transform duration-300 ${
                    isHovered ? "translate-x-1" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5-5 5M5 12h13"
                  />
                </svg>
              </Link>
            </div>
          </CardItem>
        </div>
      </CardBody>
    </CardContainer>
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

  const greedyAlgorithms = [
    { id: "activity-selection", name: "Activity Selection" },
    { id: "huffman-coding", name: "Huffman Coding" },
  ];

  const backtrackingAlgorithms = [
    { id: "n-queens", name: "N-Queens" },
    { id: "sudoku-solver", name: "Sudoku Solver" },
  ];

  const treeAlgorithms = [
    { id: "tree-traversals", name: "Tree Traversals" },
    { id: "binary-search-tree", name: "Binary Search Tree" },
    { id: "avl-tree", name: "AVL Tree" },
    { id: "red-black-tree", name: "Red-Black Tree" },
  ];

  const mathAlgorithms = [
    { id: "gcd-euclidean", name: "GCD (Euclidean)" },
    { id: "sieve-of-eratosthenes", name: "Sieve of Eratosthenes" },
    { id: "prime-factorization", name: "Prime Factorization" },
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
      title: "Greedy Algorithms",
      description:
        "Learn optimization algorithms that make locally optimal choices at each step to find a global optimum.",
      icon: <GreedyIcon />,
      path: "/greedy-algorithm/:algorithm",
      color: "#166534",
      algorithms: greedyAlgorithms,
    },
    {
      title: "Backtracking",
      description:
        "Explore recursive algorithms that build solutions incrementally and abandon paths that fail to satisfy constraints.",
      icon: <BacktrackingIcon />,
      path: "/backtracking/:algorithm",
      color: "#7E22CE",
      algorithms: backtrackingAlgorithms,
    },
    {
      title: "Tree Algorithms",
      description:
        "Discover algorithms that create, traverse and manipulate hierarchical tree data structures.",
      icon: <TreeIcon />,
      path: "/tree-algorithms/:algorithm",
      color: "#0E7490",
      algorithms: treeAlgorithms,
    },
    {
      title: "Mathematical Algorithms",
      description:
        "Implement fundamental mathematical algorithms for computations like prime numbers, GCD and factorization.",
      icon: <MathIcon />,
      path: "/mathematical-algorithms/:algorithm",
      color: "#C2410C",
      algorithms: mathAlgorithms,
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
    <div className="flex flex-col w-full min-h-screen text-white bg-slate-900">
      <Seo
        title="Algorithm Visualization Platform"
        description="Interactive platform to visualize and learn algorithms through animations. Compare algorithm performances in real-time with Race Mode."
        keywords="algorithm visualization, sorting algorithms, searching algorithms, data structures, algorithm race"
      />

      <WavyBackground
        containerClassName="w-full min-h-screen absolute inset-0"
        className="relative w-full"
        colors={["#2563eb", "#4f46e5", "#7e22ce", "#a21caf"]}
        waveWidth={50}
        backgroundFill="#0f172a"
        blur={10}
        waveOpacity={0.5}
      />

      <div className="container relative z-10 flex-grow px-4 pt-24 pb-12 mx-auto">
        {/* Hero section without animations */}
        <div className="flex flex-col items-center justify-center flex-1 p-8 mt-20">
          {/* Static heading without motion animations */}
          <Cover>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">
              Visualize Data Structures & Algorithms
            </h1>
          </Cover>

          {/* Static text without motion animations */}
          <TextGenerateEffect
            words="Explore, understand, and master algorithms through interactive visualizations. Compare algorithm performance in real-time with our unique Race Mode."
            className="mt-4 text-center text-gray-300"
          />

          {/* Static button without motion animations */}
          <div className="flex mt-8 space-x-4">
            <HoverBorderGradient
              onClick={handleRaceModeClick}
              containerClassName="rounded-full"
              className="flex items-center space-x-3 text-base text-white dark:bg-slate-800/95 bg-slate-900/95 md:text-lg"
              duration={1.5}
              id="race"
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
                className="w-6 h-6 text-blue-500"
              >
                <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path>
              </svg>
              <span>Try Race Mode</span>
            </HoverBorderGradient>
          </div>
        </div>

        {/* Fixed scroll-based animations for algorithm category cards with reduced vertical gaps */}
        <div
          className="grid grid-cols-1 gap-x-4 gap-y-1 mt-16 sm:grid-cols-2 lg:grid-cols-3 auto-rows-auto sm:gap-x-5 sm:gap-y-1 lg:mt-24"
          style={{ alignItems: "start" }}
        >
          {categories.map((category, index) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{
                margin: "-50px 0px",
                amount: 0.2,
              }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 15,
                delay: index * 0.05,
                duration: 0.5,
              }}
              className="h-full mb-1"
            >
              <AlgorithmCategory
                title={category.title}
                description={category.description}
                icon={category.icon}
                path={category.path}
                color={category.color}
                algorithms={category.algorithms}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;
