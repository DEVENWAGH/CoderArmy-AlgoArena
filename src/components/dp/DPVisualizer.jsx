import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { motion } from "motion/react";
import useDPStore from "../../store/dpStore";
import DPTreeVisualizer from "./DPTreeVisualizer";
import CodeView from "./CodeView";

const DPVisualizer = () => {
  const { algorithm } = useParams();
  const scrollRef = useRef();
  const {
    table,
    currentCell,
    speed,
    isPlaying,
    input,
    setSpeed,
    startAlgorithm,
    setInput,
    isPaused,
    pauseAlgorithm,
    resumeAlgorithm,
    setCurrentAlgorithm,
    setTable,
    setCurrentCell,
    runAlgorithm,
    algorithmResult,
  } = useDPStore();

  const [showExplanation, setShowExplanation] = useState(true);
  const [visualizationType, setVisualizationType] = useState("table"); // 'table', 'tree', or 'code'
  const [useCustomInput, setUseCustomInput] = useState(false);
  const [customInputs, setCustomInputs] = useState({
    fibonacci: { n: 6 },
    knapsack: {
      values: [4, 2, 10, 1, 2],
      weights: [12, 1, 4, 1, 2],
      capacity: 15,
    },
    lcs: {
      str1: "ABCDGH",
      str2: "AEDFHR",
    },
    lis: {
      array: [10, 22, 9, 33, 21, 50, 41, 60, 80],
    },
  });

  // Add state to control settings sidebar visibility
  const [showSettingsSidebar, setShowSettingsSidebar] = useState(false);

  // Enhanced explanations with key concepts
  const explanations = {
    fibonacci: {
      title: "Fibonacci Sequence",
      formula: "F(n) = F(n-1) + F(n-2)",
      description: "Builds the sequence by adding the two previous numbers",
      keyConcept:
        "Uses a 1D array to store previously calculated values to avoid recalculation.",
      steps: [
        "Initialize array with F(0)=0, F(1)=1",
        "For each position i, calculate F(i) = F(i-1) + F(i-2)",
        "Store result in table to avoid recalculation",
      ],
    },
    knapsack: {
      title: "0/1 Knapsack",
      formula: "dp[i][w] = max(dp[i-1][w], dp[i-1][w-weights[i]] + values[i])",
      description:
        "Determines the maximum value that can be obtained with a given weight capacity",
      keyConcept:
        "Knapsack problem uses a 2D table to track optimal value for each weight capacity.",
      steps: [
        "Create a 2D table with items as rows and weights as columns",
        "For each item and weight, decide whether to include the item or not",
        "Take the maximum of including or excluding the current item",
      ],
    },
    lcs: {
      title: "Longest Common Subsequence",
      formula:
        "If chars match: dp[i][j] = dp[i-1][j-1] + 1, else: dp[i][j] = max(dp[i-1][j], dp[i][j-1])",
      description: "Finds the longest subsequence present in both strings",
      keyConcept:
        "Uses a 2D table where each cell represents the LCS length for substrings ending at respective indices.",
      steps: [
        "Create a 2D table with first string chars as rows and second string chars as columns",
        "If characters match, take diagonal value + 1",
        "If they don't match, take maximum of left and top values",
      ],
    },
    lis: {
      title: "Longest Increasing Subsequence",
      formula: "dp[i] = max(dp[j] + 1) for all j < i where arr[j] < arr[i]",
      description:
        "Finds the length of the longest subsequence where elements are in ascending order",
      keyConcept:
        "Each position stores the length of the longest increasing subsequence ending at that position.",
      steps: [
        "Initialize dp array with 1 for each position (minimum LIS length is 1)",
        "For each position, check all previous positions to find increasing sequences",
        "Update current position with maximum possible length",
      ],
    },
  };

  useEffect(() => {
    // Don't autoplay, just setup initial state
    if (algorithm) {
      const algoName = algorithm.toLowerCase().replace(/[^a-z]/g, "");

      // Initialize state properly using individual setters
      setCurrentAlgorithm(algoName);
      setTable([]);
      setCurrentCell(null);
    }
  }, [algorithm]);

  useEffect(() => {
    const container = scrollRef.current;
    if (container) {
      // Set scroll to 60% of total scrollable width
      requestAnimationFrame(() => {
        const maxScroll = container.scrollWidth - container.clientWidth;
        container.scrollLeft = maxScroll * 0.6;
      });
    }
  }, [table]); // Re-run when table updates

  const handleRunAlgorithm = async () => {
    if (isPlaying) return;

    await runAlgorithm();
  };

  const handleCustomInputChange = (algo, field, value) => {
    setCustomInputs((prev) => ({
      ...prev,
      [algo]: {
        ...prev[algo],
        [field]: value,
      },
    }));
  };

  const handleArrayInputChange = (algo, field, value) => {
    // Parse comma-separated values into array
    try {
      const array = value.split(",").map((val) => {
        const num = Number(val.trim());
        if (isNaN(num)) throw new Error("Invalid number");
        return num;
      });
      handleCustomInputChange(algo, field, array);
    } catch (error) {
      console.error("Invalid array input", error);
      // Could show an error message to the user here
    }
  };

  const handleApplyCustomInput = () => {
    // Apply custom inputs to the algorithm
    const algoName = algorithm?.toLowerCase().replace(/[^a-z]/g, "");
    if (!algoName) return;

    setInput(algoName, customInputs[algoName]);
    startAlgorithm(algorithm); // Reset with new input
  };

  const handleUseDefaultInput = () => {
    // Reset to default inputs from store
    startAlgorithm(algorithm);
    setUseCustomInput(false);
  };

  const renderVisualizationToggle = () => (
    <div className="flex items-center gap-2 ml-4">
      <button
        onClick={() => setVisualizationType("table")}
        className={`px-3 py-1 text-sm rounded ${
          visualizationType === "table" ? "bg-blue-600" : "bg-slate-600"
        }`}
      >
        Table View
      </button>
      <button
        onClick={() => setVisualizationType("tree")}
        className={`px-3 py-1 text-sm rounded ${
          visualizationType === "tree" ? "bg-blue-600" : "bg-slate-600"
        }`}
      >
        Tree View
      </button>
      <button
        onClick={() => setVisualizationType("code")}
        className={`px-3 py-1 text-sm rounded ${
          visualizationType === "code" ? "bg-blue-600" : "bg-slate-600"
        }`}
      >
        Code View
      </button>
    </div>
  );

  const renderControls = () => (
    <div className="fixed lg:left-[16rem] w-full flex flex-col gap-2 p-4 rounded-lg bg-slate-700">
      <div className="flex flex-col md:flex-row md:items-center m-4 gap-2">
        {/* Algorithm title and input toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <h2 className="text-xl font-bold text-white capitalize">
            {algorithm?.replace("-", " ")}
          </h2>

          {/* Toggle between default and custom inputs */}
          <div className="flex items-center gap-2">
            <span className="text-gray-300">Custom Input:</span>
            <div
              className={`relative inline-block w-12 h-6 rounded-full cursor-pointer ${
                useCustomInput ? "bg-blue-600" : "bg-gray-600"
              }`}
              onClick={() => setUseCustomInput(!useCustomInput)}
            >
              <div
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform 
                ${useCustomInput ? "translate-x-7" : "translate-x-1"}`}
              />
            </div>
          </div>
        </div>

        {/* Input Controls for all algorithms (conditionally shown) */}
        <div className="flex gap-2">
          {useCustomInput && (
            <button
              onClick={handleApplyCustomInput}
              className="px-3 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
            >
              Apply Custom Input
            </button>
          )}
          <button
            onClick={handleUseDefaultInput}
            className="px-3 py-1 text-sm text-white bg-gray-500 rounded hover:bg-gray-600"
          >
            Use Default Input
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
        {/* Custom Input UI, shown when useCustomInput is true */}
        {useCustomInput && (
          <div className="p-3 mb-3 border rounded border-slate-600 bg-slate-800">
            {algorithm?.includes("fibonacci") && (
              <div className="flex items-center gap-2">
                <label className="text-gray-300">N:</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={customInputs.fibonacci.n}
                  onChange={(e) =>
                    handleCustomInputChange(
                      "fibonacci",
                      "n",
                      Math.max(1, Math.min(20, parseInt(e.target.value) || 1))
                    )
                  }
                  className="w-20 px-2 py-1 text-white rounded bg-slate-600"
                />
              </div>
            )}

            {algorithm?.includes("knapsack") && (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="flex flex-col gap-1">
                  <label className="text-gray-300">
                    Values (comma-separated):
                  </label>
                  <input
                    type="text"
                    value={customInputs.knapsack.values.join(", ")}
                    onChange={(e) =>
                      handleArrayInputChange(
                        "knapsack",
                        "values",
                        e.target.value
                      )
                    }
                    className="px-2 py-1 text-white rounded bg-slate-600"
                    placeholder="e.g. 4, 2, 10, 1, 2"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-gray-300">
                    Weights (comma-separated):
                  </label>
                  <input
                    type="text"
                    value={customInputs.knapsack.weights.join(", ")}
                    onChange={(e) =>
                      handleArrayInputChange(
                        "knapsack",
                        "weights",
                        e.target.value
                      )
                    }
                    className="px-2 py-1 text-white rounded bg-slate-600"
                    placeholder="e.g. 12, 1, 4, 1, 2"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-gray-300">Capacity:</label>
                  <input
                    type="number"
                    min="1"
                    value={customInputs.knapsack.capacity}
                    onChange={(e) =>
                      handleCustomInputChange(
                        "knapsack",
                        "capacity",
                        Math.max(1, parseInt(e.target.value) || 1)
                      )
                    }
                    className="px-2 py-1 text-white rounded bg-slate-600"
                  />
                </div>
              </div>
            )}

            {algorithm?.includes("lcs") && (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <label className="text-gray-300">String 1:</label>
                  <input
                    type="text"
                    value={customInputs.lcs.str1}
                    onChange={(e) =>
                      handleCustomInputChange("lcs", "str1", e.target.value)
                    }
                    className="px-2 py-1 text-white rounded bg-slate-600"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-gray-300">String 2:</label>
                  <input
                    type="text"
                    value={customInputs.lcs.str2}
                    onChange={(e) =>
                      handleCustomInputChange("lcs", "str2", e.target.value)
                    }
                    className="px-2 py-1 text-white rounded bg-slate-600"
                  />
                </div>
              </div>
            )}

            {algorithm?.includes("lis") && (
              <div className="flex flex-col gap-1">
                <label className="text-gray-300">
                  Array (comma-separated):
                </label>
                <input
                  type="text"
                  value={customInputs.lis.array.join(", ")}
                  onChange={(e) =>
                    handleArrayInputChange("lis", "array", e.target.value)
                  }
                  className="px-2 py-1 text-white rounded bg-slate-600"
                  placeholder="e.g. 10, 22, 9, 33, 21"
                />
                <small className="text-gray-400">
                  Enter numbers separated by commas
                </small>
              </div>
            )}
          </div>
        )}

        {/* Standard controls - unchanged */}
        <div className="flex items-center justify-between">
          {/* Speed Control */}
          <div className="flex items-center gap-2">
            <label className="text-gray-300">Speed:</label>
            <input
              type="range"
              min="1"
              max="100"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-32"
            />
            <span className="text-gray-300">{speed}%</span>
          </div>

          {/* Playback Controls */}
          <div className="flex gap-2">
            <button
              onClick={() =>
                isPlaying ? pauseAlgorithm() : handleRunAlgorithm()
              }
              className={`px-4 py-2 rounded ${
                isPlaying ? "bg-red-500" : "bg-green-500"
              }`}
            >
              {isPlaying ? "Pause" : "Start"}
            </button>
            <button
              onClick={() => startAlgorithm(algorithm)}
              className="px-4 py-2 bg-blue-500 rounded"
            >
              Reset
            </button>
          </div>

          {/* Visualization Toggle */}
          {renderVisualizationToggle()}
        </div>
      </div>
    </div>
  );

  const renderTable = () => {
    if (!table || !table.length) {
      return <div className="text-xl text-white">Loading visualization...</div>;
    }

    // Handle 1D arrays (Fibonacci, LIS)
    if (!Array.isArray(table[0])) {
      return (
        <div className="flex gap-2">
          {table.map((value, i) => (
            <motion.div
              key={i}
              className={`w-12 h-12 flex items-center justify-center rounded
                ${
                  currentCell === i
                    ? "bg-yellow-500"
                    : value !== 0
                    ? "bg-green-500"
                    : "bg-blue-500"
                }
              `}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <span className="text-lg font-bold text-white">{value}</span>
            </motion.div>
          ))}
        </div>
      );
    }

    // Handle 2D arrays (Knapsack, LCS) with improved rendering
    return (
      <div className="flex flex-col items-center gap-4">
        {/* Input headers */}
        {algorithm?.includes("knapsack") && (
          <div className="flex flex-col gap-2 text-white">
            <div className="grid grid-cols-2 gap-4">
              <div>Values: [{input.knapsack.values.join(", ")}]</div>
              <div>Weights: [{input.knapsack.weights.join(", ")}]</div>
            </div>
            <div>Capacity: {input.knapsack.capacity}</div>
          </div>
        )}

        {/* LCS headers */}
        {algorithm?.includes("lcs") && (
          <div className="flex gap-4 text-white">
            <div>String 1: {input.lcs.str1}</div>
            <div>String 2: {input.lcs.str2}</div>
          </div>
        )}

        {/* Table grid with row headers for 2D data */}
        <div className="flex flex-col">
          {/* Table headers for Knapsack - Match the gap and style of cells */}
          {algorithm?.includes("knapsack") && (
            <div className="flex gap-1">
              <div className="flex items-center justify-center w-12 h-12 font-bold text-white bg-gray-700 rounded">
                w/i
              </div>
              {Array.from({ length: table[0]?.length || 0 }).map((_, w) => (
                <div
                  key={`header-${w}`}
                  className="flex items-center justify-center w-12 h-12 font-bold text-white bg-gray-700 rounded"
                >
                  {w}
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-1 mt-1">
            {/* Row headers for knapsack */}
            {algorithm?.includes("knapsack") && (
              <div className="flex flex-col gap-1">
                {table.map((row, i) => (
                  <div
                    key={`row-header-${i}`}
                    className="flex items-center justify-center w-12 h-12 font-bold text-white bg-gray-700 rounded"
                  >
                    {i}
                  </div>
                ))}
              </div>
            )}

            {/* LCS row headers with string characters */}
            {algorithm?.includes("lcs") && (
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-center w-12 h-12 font-bold text-white bg-gray-700 rounded">
                  -
                </div>
                {input.lcs.str1.split("").map((char, i) => (
                  <div
                    key={`row-header-${i}`}
                    className="flex items-center justify-center w-12 h-12 font-bold text-white bg-gray-700 rounded"
                  >
                    {char}
                  </div>
                ))}
              </div>
            )}

            {/* Table cells - restore gap-1 for consistent spacing */}
            <div
              className="grid gap-1"
              style={{
                gridTemplateColumns: `repeat(${
                  table[0]?.length || 1
                }, minmax(48px, 1fr))`,
              }}
            >
              {table.map((row, i) =>
                row.map((value, j) => (
                  <motion.div
                    key={`${i}-${j}`}
                    className={`w-12 h-12 flex items-center justify-center rounded
                      ${
                        currentCell?.[0] === i && currentCell?.[1] === j
                          ? "bg-yellow-500"
                          : value !== 0
                          ? "bg-green-500"
                          : "bg-blue-500"
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
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const toggleSettingsSidebar = () => {
    setShowSettingsSidebar(!showSettingsSidebar);
  };

  const getAlgorithmStatus = () => {
    if (!table || !table.length) {
      return "Algorithm not started yet.";
    }

    if (isPlaying) {
      return "Algorithm is running...";
    }

    if (algorithmResult !== undefined) {
      return `Algorithm completed. Result: ${algorithmResult}`;
    }

    return "Algorithm is ready to run.";
  };

  // Add this function to get the dynamic explanation based on algorithm state and current cell
  const getDynamicExplanation = () => {
    const algoName = algorithm?.toLowerCase().replace(/[^a-z]/g, "");

    if (!algoName || !table || !table.length) {
      return "Algorithm not started yet.";
    }

    // Dynamic explanation based on the algorithm and current state
    if (algoName === "fibonacci" && currentCell !== null) {
      return `Computing F(${currentCell}) = ${
        currentCell > 1 ? `F(${currentCell - 1}) + F(${currentCell - 2})` : ""
      } = ${table[currentCell] || "null"}`;
    }

    if (algoName === "knapsack" && currentCell !== null) {
      const [i, w] = currentCell;
      if (i > 0 && w >= input.knapsack.weights[i - 1]) {
        return `Considering item ${i} (value: ${
          input.knapsack.values[i - 1]
        }, weight: ${input.knapsack.weights[i - 1]})
                for capacity ${w}. Take max of including or excluding the item.`;
      } else if (i > 0) {
        return `Item ${i} (weight: ${
          input.knapsack.weights[i - 1]
        }) is too heavy for capacity ${w}.`;
      }
    }

    if (algoName === "lcs" && currentCell !== null) {
      const [i, j] = currentCell;
      if (i > 0 && j > 0) {
        const char1 = input.lcs.str1[i - 1];
        const char2 = input.lcs.str2[j - 1];
        return char1 === char2
          ? `Characters match: '${char1}'. Adding 1 to diagonal value.`
          : `Characters don't match: '${char1}' vs '${char2}'. Taking max of top and left.`;
      }
    }

    if (algoName === "lis" && currentCell !== null) {
      return `Finding longest increasing subsequence ending at position ${currentCell}.`;
    }

    return "";
  };

  return (
    <div className="flex flex-col w-full h-full bg-slate-800">
      {/* Mobile/Tablet Header - Simplified with settings button */}
      <div className="fixed right-0 z-40 p-4 border-b shadow-lg top-16 left-0 bg-slate-800 border-slate-700 lg:hidden">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-blue-400 capitalize">
            {algorithm?.replace("-", " ")}
          </h2>
          <button
            onClick={toggleSettingsSidebar}
            className="p-2 text-gray-400 hover:text-white"
          >
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
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Settings Sidebar - Mobile/Tablet only */}
      <div
        className={`fixed right-0 top-0 h-full w-80 bg-slate-900 z-50 transform transition-transform duration-300 ease-in-out lg:hidden overflow-y-auto ${
          showSettingsSidebar ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 pt-20">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-blue-400">Settings</h3>
            <button
              onClick={toggleSettingsSidebar}
              className="text-gray-400 hover:text-white"
            >
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Algorithm Explanation Section */}
          <div className="mb-6 border-b border-slate-700 pb-4">
            <h4 className="text-sm font-semibold text-gray-400 mb-3">
              Explanation
            </h4>
            <div className="space-y-2 text-sm">
              {algorithm && (
                <>
                  <h5 className="text-white font-semibold mt-2">Key Concept</h5>
                  <p className="text-gray-300">
                    {explanations[
                      algorithm?.toLowerCase().replace(/[^a-z]/g, "")
                    ]?.keyConcept ||
                      "This algorithm uses dynamic programming to solve complex problems efficiently."}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Custom Input Section - directly in settings */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-400 mb-3">
              Custom Input
            </h4>

            {/* Algorithm-specific inputs */}
            <div className="space-y-4">
              {algorithm?.includes("fibonacci") && (
                <div className="flex items-center gap-2">
                  <label className="text-gray-300">N:</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={customInputs.fibonacci.n}
                    onChange={(e) =>
                      handleCustomInputChange(
                        "fibonacci",
                        "n",
                        Math.max(1, Math.min(20, parseInt(e.target.value) || 1))
                      )
                    }
                    className="w-20 px-2 py-1 text-white rounded bg-slate-600"
                  />
                </div>
              )}

              {algorithm?.includes("knapsack") && (
                <div className="space-y-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-gray-300">Values:</label>
                    <input
                      type="text"
                      value={customInputs.knapsack.values.join(", ")}
                      onChange={(e) =>
                        handleArrayInputChange(
                          "knapsack",
                          "values",
                          e.target.value
                        )
                      }
                      className="px-2 py-1 text-white rounded bg-slate-600"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-gray-300">Weights:</label>
                    <input
                      type="text"
                      value={customInputs.knapsack.weights.join(", ")}
                      onChange={(e) =>
                        handleArrayInputChange(
                          "knapsack",
                          "weights",
                          e.target.value
                        )
                      }
                      className="px-2 py-1 text-white rounded bg-slate-600"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-gray-300">Capacity:</label>
                    <input
                      type="number"
                      min="1"
                      value={customInputs.knapsack.capacity}
                      onChange={(e) =>
                        handleCustomInputChange(
                          "knapsack",
                          "capacity",
                          Math.max(1, parseInt(e.target.value) || 1)
                        )
                      }
                      className="px-2 py-1 text-white rounded bg-slate-600"
                    />
                  </div>
                </div>
              )}

              {algorithm?.includes("lcs") && (
                <div className="space-y-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-gray-300">String 1:</label>
                    <input
                      type="text"
                      value={customInputs.lcs.str1}
                      onChange={(e) =>
                        handleCustomInputChange("lcs", "str1", e.target.value)
                      }
                      className="px-2 py-1 text-white rounded bg-slate-600"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-gray-300">String 2:</label>
                    <input
                      type="text"
                      value={customInputs.lcs.str2}
                      onChange={(e) =>
                        handleCustomInputChange("lcs", "str2", e.target.value)
                      }
                      className="px-2 py-1 text-white rounded bg-slate-600"
                    />
                  </div>
                </div>
              )}

              {algorithm?.includes("lis") && (
                <div className="flex flex-col gap-1">
                  <label className="text-gray-300">Array:</label>
                  <input
                    type="text"
                    value={customInputs.lis.array.join(", ")}
                    onChange={(e) =>
                      handleArrayInputChange("lis", "array", e.target.value)
                    }
                    className="px-2 py-1 text-white rounded bg-slate-600"
                  />
                </div>
              )}

              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleApplyCustomInput}
                  className="px-3 py-2 text-sm text-white bg-blue-500 rounded hover:bg-blue-600 flex-1"
                >
                  Apply Input
                </button>
                <button
                  onClick={handleUseDefaultInput}
                  className="px-3 py-2 text-sm text-white bg-gray-500 rounded hover:bg-gray-600 flex-1"
                >
                  Use Default
                </button>
              </div>
            </div>
          </div>

          {/* Animation Speed Control */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-400 mb-2">
              Animation Speed
            </h4>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="1"
                max="100"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full"
              />
              <span className="w-8 text-center text-white">{speed}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Controls - Only visible on large screens */}
      <div className="fixed right-0 z-40 p-2 sm:p-4 border-b shadow-lg top-16 left-0 bg-slate-800 border-slate-700 hidden lg:block">
        {renderControls()}
      </div>

      {/* Main Content - Adjust margin for mobile with improved horizontal scrolling */}
      <div className="p-2 sm:p-4 mt-20 lg:mt-40 sm:lg:mt-48 flex flex-col min-h-screen sm:h-[calc(100vh-12rem)] pb-20 lg:pb-4">
        {visualizationType === "table" && (
          <div className="flex-1 p-2 sm:p-4 overflow-x-auto overflow-y-auto rounded-lg bg-slate-900 mt-12">
            <div className="flex items-center mt-40 justify-center min-w-max">
              {renderTable()}
            </div>
            {/* Mobile scrolling indicator - keep this but remove explanation */}
            <div className="lg:hidden text-xs text-center text-gray-400 mt-4 animate-pulse">
              ← Swipe horizontally to scroll →
            </div>
          </div>
        )}

        {visualizationType === "tree" && (
          <div
            ref={scrollRef}
            className="flex-1 p-2 sm:p-4 overflow-x-auto overflow-y-auto rounded-lg bg-slate-900 mt-12"
          >
            <div className="flex items-center justify-center min-w-max">
              <DPTreeVisualizer
                data={table}
                currentCell={currentCell}
                type={algorithm?.toLowerCase().replace(/[^a-z]/g, "")}
                algorithmResult={algorithmResult}
              />
            </div>
            {/* Mobile scrolling indicator - keep this but remove explanation */}
            <div className="lg:hidden text-xs text-center text-gray-400 mt-4 animate-pulse">
              ← Swipe horizontally to scroll →
            </div>
          </div>
        )}

        {visualizationType === "code" && (
          <div className="flex-1 p-2 sm:p-4 overflow-x-auto overflow-y-auto rounded-lg bg-slate-900 mt-12">
            <div className="min-w-max max-w-full">
              <CodeView
                algorithm={algorithm?.toLowerCase().replace(/[^a-z]/g, "")}
                currentCell={currentCell}
                isPlaying={isPlaying}
              />
            </div>
            {/* Mobile scrolling indicator - keep this but remove explanation */}
            <div className="lg:hidden text-xs text-center text-gray-400 mt-4 animate-pulse">
              ← Swipe to see full code →
            </div>
          </div>
        )}

        {/* Explanation Overlay - Only visible on large screens */}
        <div className="hidden lg:block fixed right-4 bottom-4 w-80 bg-slate-900 bg-opacity-90 p-4 rounded-lg shadow-lg border border-slate-700 z-30">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-bold text-blue-400">Explanation</h3>
          </div>

          {currentCell !== null && (
            <div className="text-yellow-300 font-medium mb-2">
              {getDynamicExplanation()}
            </div>
          )}

          <div className="text-white">
            <h4 className="font-semibold mb-1">Key Concept</h4>
            <p className="text-sm text-gray-300">
              {algorithm
                ? explanations[algorithm?.toLowerCase().replace(/[^a-z]/g, "")]
                    ?.keyConcept ||
                  "This algorithm uses dynamic programming to solve complex problems efficiently."
                : "Select an algorithm to see its explanation."}
            </p>
          </div>
        </div>
      </div>

      {/* Fixed Footer Controls for Mobile/Tablet */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-800 border-t border-slate-700 lg:hidden">
        <div className="flex flex-col gap-4">
          {/* Visualization Toggle in Footer */}
          <div className="flex justify-center gap-2">
            <button
              onClick={() => setVisualizationType("table")}
              className={`px-3 py-2 text-sm rounded flex-1 ${
                visualizationType === "table" ? "bg-blue-600" : "bg-slate-600"
              }`}
            >
              Table View
            </button>
            <button
              onClick={() => setVisualizationType("tree")}
              className={`px-3 py-2 text-sm rounded flex-1 ${
                visualizationType === "tree" ? "bg-blue-600" : "bg-slate-600"
              }`}
            >
              Tree View
            </button>
            <button
              onClick={() => setVisualizationType("code")}
              className={`px-3 py-2 text-sm rounded flex-1 ${
                visualizationType === "code" ? "bg-blue-600" : "bg-slate-600"
              }`}
            >
              Code View
            </button>
          </div>

          {/* Control Buttons - Added square settings icon in the middle */}
          <div className="flex justify-between">
            <button
              onClick={() =>
                isPlaying ? pauseAlgorithm() : handleRunAlgorithm()
              }
              className={`px-4 py-2 rounded flex-1 mr-2 ${
                isPlaying ? "bg-red-500" : "bg-green-500"
              }`}
            >
              {isPlaying ? "Pause" : "Start"}
            </button>
            <button
              onClick={toggleSettingsSidebar}
              className="px-3 py-2 bg-slate-600 rounded mx-2 hover:bg-slate-700"
            >
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
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
            <button
              onClick={() => startAlgorithm(algorithm)}
              className="px-4 py-2 bg-blue-500 rounded flex-1"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DPVisualizer;
