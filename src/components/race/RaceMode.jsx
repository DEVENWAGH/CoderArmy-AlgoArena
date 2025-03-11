import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import Footer from "../Footer";

// Move PlayIcon component outside of the main component to avoid nesting issue
const PlayIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    className="mr-2 bi bi-play-fill"
    viewBox="0 0 16 16"
  >
    <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z" />
  </svg>
);

// Helper function to process race results to avoid deep nesting
const processRaceResults = (raceResults) => {
  const sortedResults = [...raceResults].sort(
    (a, b) => a.timeElapsed - b.timeElapsed
  );
  const bestTime = sortedResults[0].timeElapsed;

  return sortedResults.map((result, i) => {
    // Calculate efficiency ratio - lower is better
    const relativePerfPercent = Math.round(
      (bestTime / result.timeElapsed) * 100
    );

    // Add medal colors for top 3 positions
    let rowClass = "";
    let medal = "";

    if (i === 0) {
      rowClass = "bg-gradient-to-r from-green-900/30 to-green-800/20";
      medal = "🥇";
    } else if (i === 1) {
      rowClass = "bg-gradient-to-r from-slate-600/30 to-slate-600/20";
      medal = "🥈";
    } else if (i === 2) {
      rowClass = "bg-gradient-to-r from-amber-900/30 to-amber-800/20";
      medal = "🥉";
    } else if (i === raceResults.length - 1) {
      rowClass = "bg-red-900/20";
    }

    return {
      ...result,
      rowClass,
      medal,
      relativePerfPercent,
      formattedTime: (result.timeElapsed / 1000).toFixed(2),
    };
  });
};

const RaceMode = () => {
  const [algorithms, setAlgorithms] = useState([]);
  const [selectedAlgorithms, setSelectedAlgorithms] = useState([]);
  const [raceStarted, setRaceStarted] = useState(false);
  const [raceFinished, setRaceFinished] = useState(false);
  const [raceResults, setRaceResults] = useState([]);
  const [arraySize, setArraySize] = useState(50);
  const [algorithmType, setAlgorithmType] = useState("sorting");
  const [originalArray, setOriginalArray] = useState([]);
  const [targetValue, setTargetValue] = useState(null);
  const raceTimerRef = useRef(null);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customArrayInput, setCustomArrayInput] = useState("");
  const [useCustomArray, setUseCustomArray] = useState(false);

  // Extended algorithm collections
  const sortingAlgorithms = useMemo(
    () => [
      { name: "Bubble Sort", id: "bubble", color: "#FF5733" },
      { name: "Selection Sort", id: "selection", color: "#33FF57" },
      { name: "Insertion Sort", id: "insertion", color: "#3357FF" },
      { name: "Merge Sort", id: "merge", color: "#F033FF" },
      { name: "Quick Sort", id: "quick", color: "#FF33A8" },
      { name: "Heap Sort", id: "heap", color: "#33FFF3" },
      { name: "Radix Sort", id: "radix", color: "#FF9433" },
      { name: "Counting Sort", id: "counting", color: "#33BCFF" },
      { name: "Shell Sort", id: "shell", color: "#A233FF" },
    ],
    []
  );

  const searchingAlgorithms = useMemo(
    () => [
      { name: "Linear Search", id: "linear", color: "#FF5733" },
      { name: "Binary Search", id: "binary", color: "#33FF57" },
      { name: "Jump Search", id: "jump", color: "#3357FF" },
      { name: "Interpolation Search", id: "interpolation", color: "#F033FF" },
      { name: "Exponential Search", id: "exponential", color: "#A233FF" },
      { name: "Fibonacci Search", id: "fibonacci", color: "#33BCFF" },
    ],
    []
  );

  const graphAlgorithms = useMemo(
    () => [
      { name: "Breadth First Search", id: "bfs", color: "#FF5733" },
      { name: "Depth First Search", id: "dfs", color: "#33FF57" },
      { name: "Dijkstra's Algorithm", id: "dijkstra", color: "#3357FF" },
      { name: "Kruskal's Algorithm", id: "kruskal", color: "#F033FF" },
      { name: "Prim's Algorithm", id: "prim", color: "#FF33A8" },
    ],
    []
  );

  const dpAlgorithms = useMemo(
    () => [
      { name: "Fibonacci", id: "dp_fibonacci", color: "#FF5733" },
      { name: "Knapsack Problem", id: "knapsack", color: "#33FF57" },
      { name: "Longest Common Subsequence", id: "lcs", color: "#3357FF" },
      {
        name: "Matrix Chain Multiplication",
        id: "matrix-chain",
        color: "#F033FF",
      },
    ],
    []
  );

  const algorithmCategories = useMemo(
    () => [
      { name: "Sorting", value: "sorting", algorithms: sortingAlgorithms },
      {
        name: "Searching",
        value: "searching",
        algorithms: searchingAlgorithms,
      },
      { name: "Graph", value: "graph", algorithms: graphAlgorithms },
      { name: "Dynamic Programming", value: "dp", algorithms: dpAlgorithms },
    ],
    [sortingAlgorithms, searchingAlgorithms, graphAlgorithms, dpAlgorithms]
  );

  const generateArray = useCallback(() => {
    if (useCustomArray && customArrayInput.trim()) {
      try {
        // Parse custom input - supports comma or space separated numbers
        const parsedArray = customArrayInput
          .split(/[\s,]+/)
          .map((val) => parseInt(val.trim()))
          .filter((num) => !isNaN(num));

        if (parsedArray.length > 0) {
          setOriginalArray(parsedArray);

          // For searching algorithms, set a target value from the custom array
          if (algorithmType === "searching") {
            const randomIndex = Math.floor(Math.random() * parsedArray.length);
            setTargetValue(parsedArray[randomIndex]);
          }
          return;
        }
      } catch (e) {
        console.error("Error parsing custom array:", e);
      }
    }

    // Default random array generation if custom input isn't valid
    const newArray = Array.from(
      { length: arraySize },
      () => Math.floor(Math.random() * 1000) + 1
    );

    // Sort the array for certain algorithms that require sorted input
    if (algorithmType === "searching") {
      newArray.sort((a, b) => a - b);
    }

    setOriginalArray(newArray);

    // For searching algorithms, set a target value
    if (algorithmType === "searching") {
      // 50% chance to pick a value from the array, 50% chance for a random value
      const pickFromArray = Math.random() > 0.5;
      if (pickFromArray) {
        const randomIndex = Math.floor(Math.random() * newArray.length);
        setTargetValue(newArray[randomIndex]);
      } else {
        setTargetValue(Math.floor(Math.random() * 1000) + 1);
      }
    }
  }, [arraySize, algorithmType, customArrayInput, useCustomArray]);

  useEffect(() => {
    // Set the algorithms based on selected algorithm type
    const category = algorithmCategories.find(
      (cat) => cat.value === algorithmType
    );
    if (category) {
      setAlgorithms(category.algorithms);
    }

    setSelectedAlgorithms([]);
    setRaceResults([]);
    setRaceStarted(false);
    setRaceFinished(false);
  }, [algorithmType, algorithmCategories]);

  useEffect(() => {
    generateArray();
  }, [arraySize, algorithmType, generateArray]);

  const toggleAlgorithmSelection = (algorithm) => {
    if (selectedAlgorithms.some((alg) => alg.id === algorithm.id)) {
      setSelectedAlgorithms(
        selectedAlgorithms.filter((alg) => alg.id !== algorithm.id)
      );
    } else if (selectedAlgorithms.length < 5) {
      // Limit to 5 algorithms - fixed the if-else nesting
      setSelectedAlgorithms([...selectedAlgorithms, algorithm]);
    }
  };

  const startRace = () => {
    if (selectedAlgorithms.length < 2) {
      alert("Please select at least 2 algorithms for the race");
      return;
    }

    setRaceStarted(true);
    setRaceFinished(false);
    setRaceResults([]);

    // Simulate race with different speeds for algorithms
    const results = selectedAlgorithms.map((alg) => ({
      ...alg,
      progress: 0,
      steps: 0,
      timeElapsed: 0,
      finished: false,
    }));

    setRaceResults(results);

    const startTime = Date.now();

    // Simulate race progress
    raceTimerRef.current = setInterval(() => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;

      let allFinished = true;

      setRaceResults((prevResults) => {
        const newResults = prevResults.map((result) => {
          if (result.finished) return result;

          // Speed factor based on algorithm efficiency and type
          let speedFactor = 1;

          if (algorithmType === "sorting") {
            // Sorting algorithms
            switch (result.id) {
              case "quick":
              case "merge":
              case "heap":
                speedFactor = 1.8; // O(n log n)
                break;
              case "shell":
                speedFactor = 1.4; // Between O(n log n) and O(n²)
                break;
              case "radix":
              case "counting":
                speedFactor = 2.0; // O(n) for specific inputs
                break;
              case "insertion":
                speedFactor = 0.9; // O(n²) but can be fast for small arrays
                break;
              case "selection":
              case "bubble":
                speedFactor = 0.6; // O(n²)
                break;
              // No default needed as speedFactor is already initialized
            }
          } else if (algorithmType === "searching") {
            // Search algorithms
            switch (result.id) {
              case "binary":
              case "interpolation":
              case "fibonacci":
              case "exponential":
                speedFactor = 1.8; // O(log n)
                break;
              case "jump":
                speedFactor = 1.2; // O(√n)
                break;
              case "linear":
                speedFactor = 0.8; // O(n)
                break;
              // No default needed as speedFactor is already initialized
            }
          } else if (algorithmType === "graph") {
            // Graph algorithms
            switch (result.id) {
              case "bfs":
              case "dfs":
                speedFactor = 1.5; // O(V+E)
                break;
              case "dijkstra":
                speedFactor = 1.2; // O(V²) or O(E log V)
                break;
              case "kruskal":
                speedFactor = 1.3; // O(E log E)
                break;
              case "prim":
                speedFactor = 1.4; // O(V²) or O(E log V)
                break;
              // No default needed as speedFactor is already initialized
            }
          } else if (algorithmType === "dp") {
            // Dynamic programming algorithms
            switch (result.id) {
              case "dp_fibonacci":
                speedFactor = 2.0; // O(n)
                break;
              case "lcs":
              case "knapsack":
                speedFactor = 1.3; // O(n*m)
                break;
              case "matrix-chain":
                speedFactor = 1.1; // O(n³)
                break;
              // No default needed as speedFactor is already initialized
            }
          }

          // Add some randomness to make it interesting
          speedFactor *= 0.8 + Math.random() * 0.4;

          // Calculate progress
          let progress = Math.min((elapsed * speedFactor) / 5000, 1);

          // Add steps based on algorithm and dataset size
          const steps = Math.floor(
            progress *
              (arraySize *
                (algorithmType === "sorting" ? Math.log2(arraySize) : 1))
          );

          const finished = progress >= 1;

          if (!finished) allFinished = false;

          return {
            ...result,
            progress,
            steps,
            timeElapsed: elapsed,
            finished,
          };
        });

        return newResults.sort((a, b) => b.progress - a.progress);
      });

      if (allFinished) {
        clearInterval(raceTimerRef.current);
        setRaceFinished(true);
      }
    }, 100);
  };

  const resetRace = () => {
    if (raceTimerRef.current) {
      clearInterval(raceTimerRef.current);
    }
    setRaceStarted(false);
    setRaceFinished(false);
    setRaceResults([]);
    generateArray();
  };

  const toggleCustomInput = () => {
    setShowCustomInput(!showCustomInput);
  };

  const applyCustomArray = () => {
    setUseCustomArray(true);
    generateArray();
    setShowCustomInput(false);
  };

  const cancelCustomArray = () => {
    setShowCustomInput(false);
  };

  const resetToRandomArray = () => {
    setUseCustomArray(false);
    setCustomArrayInput("");
    generateArray();
  };

  // Get algorithm description based on ID
  const getAlgorithmDescription = (id) => {
    const descriptions = {
      // Sorting
      bubble: "O(n²) - Simple but inefficient",
      selection: "O(n²) - Simple selection method",
      insertion: "O(n²) - Good for small arrays",
      merge: "O(n log n) - Divide and conquer",
      quick: "O(n log n) - Fast but unstable",
      heap: "O(n log n) - Uses heap data structure",
      radix: "O(nk) - Non-comparative integer sort",
      counting: "O(n+k) - Integer sorting with fixed range",
      shell: "O(n log² n) - Improved insertion sort",

      // Searching
      linear: "O(n) - Checks every element",
      binary: "O(log n) - Requires sorted array",
      jump: "O(√n) - Block jumping search",
      interpolation: "O(log log n) - Position estimation",
      exponential: "O(log n) - For unbounded searches",
      fibonacci: "O(log n) - Uses Fibonacci numbers",

      // Graph
      bfs: "O(V+E) - Level by level traversal",
      dfs: "O(V+E) - Explore as far as possible",
      dijkstra: "O(V²) or O(E log V) - Shortest path",
      kruskal: "O(E log E) - Minimum spanning tree",
      prim: "O(V²) - Minimum spanning tree",

      // DP
      dp_fibonacci: "O(n) - Classic DP problem",
      knapsack: "O(nW) - Optimal item selection",
      lcs: "O(mn) - String subsequence matching",
      "matrix-chain": "O(n³) - Matrix multiplication order",
    };

    return descriptions[id] || "Algorithm details";
  };

  // Show array size control only for sorting and searching algorithms
  const showArraySizeControl = ["sorting", "searching"].includes(algorithmType);

  // Process race results for render to avoid nesting function in JSX
  const processedRaceResults = useMemo(() => {
    if (!raceFinished || raceResults.length === 0) return [];
    return processRaceResults(raceResults);
  }, [raceFinished, raceResults]);

  return (
    <div className="flex flex-col w-full min-h-screen overflow-hidden text-white bg-slate-900">
      <div className="flex flex-col items-center justify-center p-4 mt-16 mb-12 md:p-8 md:mt-20">
        <h1 className="text-3xl font-bold text-transparent md:text-4xl bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
          Algorithm Race Mode
        </h1>
        <p className="px-2 mt-4 text-sm text-center text-gray-300 md:text-lg md:px-0">
          Compare algorithm performance in real-time with our unique Race Mode.
        </p>

        <div className="w-full max-w-4xl mt-6 md:mt-8">
          {/* Algorithm Type Selection - Responsive scrollable tab bar */}
          <div className="mb-6 overflow-x-auto hide-scrollbar">
            <div className="flex p-1 space-x-2 md:space-x-4 min-w-min">
              {algorithmCategories.map((category) => (
                <button
                  key={category.value}
                  className={`px-3 md:px-4 py-2 rounded-lg text-sm md:text-base whitespace-nowrap
                    ${
                      algorithmType === category.value
                        ? "bg-blue-600"
                        : "bg-gray-700"
                    }`}
                  onClick={() => setAlgorithmType(category.value)}
                  disabled={raceStarted}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-between mb-6 md:flex-row">
            {/* Only show array size controls for sorting and searching */}
            {showArraySizeControl && (
              <div className="flex items-center mb-4 space-x-2 md:space-x-4 md:mb-0">
                <label
                  htmlFor="array-size-input"
                  className="text-sm text-gray-300 md:text-base"
                >
                  Array Size:
                </label>
                <input
                  id="array-size-input"
                  type="range"
                  min="10"
                  max="1000"
                  value={arraySize}
                  onChange={(e) => setArraySize(Number(e.target.value))}
                  className="w-24 md:w-32"
                  disabled={raceStarted || useCustomArray}
                />
                <span className="text-sm md:text-base">{arraySize}</span>
              </div>
            )}

            {/* Show custom array option only for sorting and searching */}
            {showArraySizeControl && (
              <div className="flex space-x-2">
                <button
                  onClick={toggleCustomInput}
                  className="px-3 py-2 text-sm bg-indigo-600 rounded-lg md:text-base hover:bg-indigo-700"
                  disabled={raceStarted}
                >
                  {useCustomArray ? "Edit Custom Array" : "Use Custom Array"}
                </button>

                {useCustomArray && (
                  <button
                    onClick={resetToRandomArray}
                    className="px-3 py-2 text-sm bg-gray-600 rounded-lg md:text-base hover:bg-gray-700"
                    disabled={raceStarted}
                  >
                    Reset to Random
                  </button>
                )}
              </div>
            )}
          </div>

          {showCustomInput && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-slate-900/50">
              <div className="w-full max-w-2xl p-4 rounded-lg shadow-xl bg-slate-800 md:p-6">
                <h3 className="mb-4 text-lg font-bold md:text-xl">
                  Custom Array Input
                </h3>
                <p className="mb-2 text-sm text-gray-300 md:text-base">
                  Enter numbers separated by spaces or commas:
                </p>
                <textarea
                  className="w-full h-24 p-3 text-white rounded-lg resize-none md:h-32 bg-slate-700"
                  value={customArrayInput}
                  onChange={(e) => setCustomArrayInput(e.target.value)}
                  placeholder="Example: 45, 23, 78, 12, 56"
                ></textarea>
                <div className="flex justify-end mt-4 space-x-4">
                  <button
                    className="px-3 py-2 text-sm bg-gray-600 rounded-lg md:px-4 md:text-base hover:bg-gray-700"
                    onClick={cancelCustomArray}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-3 py-2 text-sm bg-green-600 rounded-lg md:px-4 md:text-base hover:bg-green-700"
                    onClick={applyCustomArray}
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}

          {useCustomArray && showArraySizeControl && (
            <div className="p-3 mb-4 rounded-lg md:p-4 bg-slate-800">
              <h3 className="mb-1 text-sm font-bold md:text-base md:mb-2">
                Custom Array:
              </h3>
              <div className="pb-2 overflow-x-auto text-xs text-yellow-400 md:text-sm whitespace-nowrap">
                [{originalArray.join(", ")}]
              </div>
            </div>
          )}

          {algorithmType === "searching" && targetValue !== null && (
            <div className="p-3 mb-4 rounded-lg md:p-4 bg-slate-800">
              <span className="text-sm font-bold md:text-base">
                Target Value to Search:{" "}
              </span>
              <span className="text-yellow-400">{targetValue}</span>
            </div>
          )}

          {/* Race Parameters Card */}
          <div className="p-4 mb-6 border rounded-lg bg-slate-800 border-slate-700">
            <h3 className="mb-3 text-lg font-bold text-blue-400">
              Race Parameters
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-gray-300">
                  <span className="font-semibold">Algorithm Type:</span>{" "}
                  {
                    algorithmCategories.find(
                      (cat) => cat.value === algorithmType
                    )?.name
                  }
                </p>
                {showArraySizeControl && (
                  <p className="mt-1 text-sm text-gray-300">
                    <span className="font-semibold">Data Size:</span>{" "}
                    {arraySize} elements
                  </p>
                )}
                {algorithmType === "searching" && targetValue !== null && (
                  <p className="mt-1 text-sm text-gray-300">
                    <span className="font-semibold">Target Value:</span>{" "}
                    {targetValue}
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-300">
                  <span className="font-semibold">Selected Algorithms:</span>{" "}
                  {selectedAlgorithms.length}/5
                </p>
                <p className="mt-1 text-sm text-gray-300">
                  <span className="font-semibold">Data Source:</span>{" "}
                  {useCustomArray ? "Custom Input" : "Random Generation"}
                </p>
              </div>
            </div>
          </div>

          {/* Selected algorithms count indicator - inside the parameters card */}
          <div className="mb-3 text-sm md:text-base">
            <span className="text-gray-300">
              Select algorithms to compare (up to 5):
            </span>
            {selectedAlgorithms.length === 5 && (
              <span className="ml-2 text-yellow-400">(Maximum reached)</span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 mb-6 sm:grid-cols-2 lg:grid-cols-3 md:gap-4">
            {algorithms.map((algorithm) => (
              <button
                key={algorithm.id}
                className={`p-3 md:p-4 rounded-lg cursor-pointer border-2 transition-colors text-left
                  ${
                    selectedAlgorithms.some((alg) => alg.id === algorithm.id)
                      ? `border-${algorithm.color.substring(1)} bg-slate-700`
                      : "border-gray-700 bg-slate-800"
                  }
                  ${
                    raceStarted
                      ? "cursor-not-allowed opacity-80"
                      : "hover:border-gray-500"
                  }
                `}
                onClick={() =>
                  !raceStarted && toggleAlgorithmSelection(algorithm)
                }
                disabled={raceStarted}
                style={{
                  borderColor: selectedAlgorithms.some(
                    (alg) => alg.id === algorithm.id
                  )
                    ? algorithm.color
                    : undefined,
                }}
              >
                <h3 className="text-base font-semibold md:text-xl">
                  {algorithm.name}
                </h3>
                <p className="text-xs text-gray-400 md:text-sm">
                  {getAlgorithmDescription(algorithm.id)}
                </p>
              </button>
            ))}
          </div>

          <div className="flex justify-center mb-8">
            {!raceStarted ? (
              <button
                className="flex items-center px-5 py-2 text-sm bg-green-600 rounded-lg md:px-6 md:py-3 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed md:text-base"
                onClick={startRace}
                disabled={selectedAlgorithms.length < 2}
              >
                <PlayIcon />
                Start Race
              </button>
            ) : (
              <button
                className="px-5 py-2 text-sm bg-red-600 rounded-lg md:px-6 md:py-3 hover:bg-red-700 md:text-base"
                onClick={resetRace}
              >
                Reset Race
              </button>
            )}
          </div>

          {raceStarted && (
            <div className="w-full p-4 rounded-lg md:p-6 bg-slate-800">
              <h2 className="mb-4 text-xl font-bold md:text-2xl">
                Race Progress
              </h2>

              {raceResults.map((result, index) => (
                <div key={result.id} className="mb-4 md:mb-6">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      <span
                        className="w-2 h-2 mr-2 rounded-full md:w-3 md:h-3"
                        style={{ backgroundColor: result.color }}
                      ></span>
                      <span className="text-sm font-semibold md:text-base">
                        {result.name}
                      </span>
                    </div>
                    <span className="text-xs md:text-sm">
                      {Math.floor(result.progress * 100)}%
                      {result.finished &&
                        ` - ${(result.timeElapsed / 1000).toFixed(2)}s`}
                      {index === 0 && raceFinished && " 🏆"}
                    </span>
                  </div>
                  <div className="w-full h-3 overflow-hidden bg-gray-700 rounded-full md:h-4">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: result.color,
                        width: `${result.progress * 100}%`,
                      }}
                      initial={{ width: "0%" }}
                      animate={{ width: `${result.progress * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-gray-400 md:text-sm">
                    <span>Steps: {result.steps.toLocaleString()}</span>
                    <span>{(result.timeElapsed / 1000).toFixed(2)}s</span>
                  </div>
                </div>
              ))}

              {raceFinished && (
                <div className="p-3 mt-6 rounded-lg md:mt-8 md:p-4 bg-slate-700">
                  <h3 className="flex items-center mb-3 text-lg font-bold text-blue-300 md:text-xl">
                    <span className="mr-2">🏆</span> Race Results Leaderboard
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs md:text-sm">
                      <thead>
                        <tr className="border-b border-gray-600">
                          <th className="px-1 py-2 text-left md:px-2">Rank</th>
                          <th className="px-1 py-2 text-left md:px-2">
                            Algorithm
                          </th>
                          <th className="px-1 py-2 text-right md:px-2">
                            Time (s)
                          </th>
                          <th className="px-1 py-2 text-right md:px-2">
                            Steps
                          </th>
                          <th className="px-1 py-2 text-right md:px-2">
                            Efficiency
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {processedRaceResults.map((result, i) => (
                          <tr
                            key={result.id}
                            className={`${result.rowClass} border-b border-gray-700 hover:bg-slate-600/20`}
                          >
                            <td className="px-1 py-1 font-medium md:py-2 md:px-2">
                              {i + 1}
                              {result.medal && (
                                <span className="ml-1">{result.medal}</span>
                              )}
                            </td>
                            <td className="px-1 py-1 font-medium md:py-2 md:px-2">
                              <div className="flex items-center">
                                <span
                                  className="w-2 h-2 mr-1 rounded-full md:w-3 md:h-3 md:mr-2"
                                  style={{ backgroundColor: result.color }}
                                ></span>
                                {result.name}
                              </div>
                            </td>
                            <td className="px-1 py-1 text-right md:py-2 md:px-2">
                              {result.formattedTime}
                            </td>
                            <td className="px-1 py-1 text-right md:py-2 md:px-2">
                              {result.steps.toLocaleString()}
                            </td>
                            <td className="px-1 py-1 text-right md:py-2 md:px-2">
                              {i === 0 ? (
                                <span className="font-bold text-green-400">
                                  100%
                                </span>
                              ) : (
                                <span className="text-yellow-300">
                                  {result.relativePerfPercent}%
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="p-3 mt-4 text-xs text-gray-300 rounded-lg bg-slate-800/50">
                    <h4 className="mb-1 font-bold text-blue-400">
                      Interpreting Results
                    </h4>
                    <p>
                      <span className="font-bold text-green-400">
                        Efficiency
                      </span>
                      : Shows relative performance compared to the fastest
                      algorithm (100%).
                    </p>
                    <p className="mt-1">
                      <span className="font-bold text-yellow-300">Steps</span>:
                      Total operations performed by the algorithm during
                      execution.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add a global CSS class for hiding scrollbars */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <Footer />
    </div>
  );
};

export default RaceMode;
