import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";

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

  const sortingAlgorithms = [
    { name: "Bubble Sort", id: "bubble", color: "#FF5733" },
    { name: "Selection Sort", id: "selection", color: "#33FF57" },
    { name: "Insertion Sort", id: "insertion", color: "#3357FF" },
    { name: "Merge Sort", id: "merge", color: "#F033FF" },
    { name: "Quick Sort", id: "quick", color: "#FF33A8" },
    { name: "Heap Sort", id: "heap", color: "#33FFF3" },
  ];

  const searchingAlgorithms = [
    { name: "Linear Search", id: "linear", color: "#FF5733" },
    { name: "Binary Search", id: "binary", color: "#33FF57" },
    { name: "Jump Search", id: "jump", color: "#3357FF" },
    { name: "Interpolation Search", id: "interpolation", color: "#F033FF" },
  ];

  useEffect(() => {
    if (algorithmType === "sorting") {
      setAlgorithms(sortingAlgorithms);
    } else {
      setAlgorithms(searchingAlgorithms);
    }
    setSelectedAlgorithms([]);
    setRaceResults([]);
    setRaceStarted(false);
    setRaceFinished(false);
  }, [algorithmType]);

  useEffect(() => {
    generateArray();
  }, [arraySize, algorithmType]);

  const generateArray = () => {
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
  };

  const toggleAlgorithmSelection = (algorithm) => {
    if (selectedAlgorithms.some((alg) => alg.id === algorithm.id)) {
      setSelectedAlgorithms(
        selectedAlgorithms.filter((alg) => alg.id !== algorithm.id)
      );
    } else {
      if (selectedAlgorithms.length < 5) {
        // Limit to 5 algorithms
        setSelectedAlgorithms([...selectedAlgorithms, algorithm]);
      }
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

          // Speed factor based on algorithm efficiency
          let speedFactor = 1;
          if (algorithmType === "sorting") {
            // Simulated big-O performance
            switch (result.id) {
              case "quick":
              case "merge":
              case "heap":
                speedFactor = 1.8; // O(n log n)
                break;
              case "insertion":
                speedFactor = 0.9; // O(n²) but can be fast for small arrays
                break;
              case "selection":
              case "bubble":
                speedFactor = 0.6; // O(n²)
                break;
              default:
                speedFactor = 1;
            }
          } else {
            // Search algorithms
            switch (result.id) {
              case "binary":
              case "interpolation":
                speedFactor = 1.8; // O(log n)
                break;
              case "jump":
                speedFactor = 1.2; // O(√n)
                break;
              case "linear":
                speedFactor = 0.8; // O(n)
                break;
              default:
                speedFactor = 1;
            }
          }

          // Add some randomness to make it interesting
          speedFactor *= 0.8 + Math.random() * 0.4;

          // Calculate progress
          let progress = Math.min((elapsed * speedFactor) / 5000, 1);

          // Add steps based on algorithm
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

  // Play icon SVG component
  const PlayIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      className="bi bi-play-fill mr-2"
      viewBox="0 0 16 16"
    >
      <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z" />
    </svg>
  );

  return (
    <div className="flex flex-col w-full h-full bg-slate-900 text-white">
      <div className="flex flex-col items-center justify-center p-8 mt-20">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
          Algorithm Race Mode
        </h1>
        <p className="mt-4 text-lg text-center text-gray-300">
          Compare algorithm performance in real-time with our unique Race Mode.
        </p>

        <div className="w-full max-w-4xl mt-8">
          <div className="flex flex-col sm:flex-row justify-between mb-6">
            <div className="flex space-x-4 mb-4 sm:mb-0">
              <button
                className={`px-4 py-2 rounded-lg ${
                  algorithmType === "sorting" ? "bg-blue-600" : "bg-gray-700"
                }`}
                onClick={() => setAlgorithmType("sorting")}
              >
                Sorting Algorithms
              </button>
              <button
                className={`px-4 py-2 rounded-lg ${
                  algorithmType === "searching" ? "bg-blue-600" : "bg-gray-700"
                }`}
                onClick={() => setAlgorithmType("searching")}
              >
                Searching Algorithms
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <label className="text-gray-300">Array Size:</label>
              <input
                type="range"
                min="10"
                max="1000"
                value={arraySize}
                onChange={(e) => setArraySize(Number(e.target.value))}
                className="w-32"
                disabled={raceStarted || useCustomArray}
              />
              <span>{arraySize}</span>
            </div>
          </div>

          <div className="mb-4 flex justify-between">
            <button
              onClick={toggleCustomInput}
              className="px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700"
              disabled={raceStarted}
            >
              {useCustomArray ? "Edit Custom Array" : "Use Custom Array"}
            </button>

            {useCustomArray && (
              <button
                onClick={resetToRandomArray}
                className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-700"
                disabled={raceStarted}
              >
                Reset to Random Array
              </button>
            )}
          </div>

          {showCustomInput && (
            <div className="fixed inset-0 backdrop-blur-sm bg-slate-900/50 flex items-center justify-center z-50 p-4">
              <div className="bg-slate-800 rounded-lg p-6 w-full max-w-2xl shadow-xl">
                <h3 className="text-xl font-bold mb-4">Custom Array Input</h3>
                <p className="mb-2 text-gray-300">
                  Enter numbers separated by spaces or commas:
                </p>
                <textarea
                  className="w-full h-32 p-3 bg-slate-700 text-white rounded-lg resize-none"
                  value={customArrayInput}
                  onChange={(e) => setCustomArrayInput(e.target.value)}
                  placeholder="Example: 45, 23, 78, 12, 56"
                ></textarea>
                <div className="flex justify-end mt-4 space-x-4">
                  <button
                    className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-700"
                    onClick={cancelCustomArray}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700"
                    onClick={applyCustomArray}
                  >
                    Apply Custom Array
                  </button>
                </div>
              </div>
            </div>
          )}

          {useCustomArray && (
            <div className="mb-4 p-4 bg-slate-800 rounded-lg">
              <h3 className="font-bold mb-2">Custom Array:</h3>
              <div className="text-yellow-400 overflow-x-auto whitespace-nowrap">
                [{originalArray.join(", ")}]
              </div>
            </div>
          )}

          {algorithmType === "searching" && targetValue !== null && (
            <div className="mb-4 p-4 bg-slate-800 rounded-lg">
              <span className="font-bold">Target Value to Search: </span>
              <span className="text-yellow-400">{targetValue}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {algorithms.map((algorithm) => (
              <div
                key={algorithm.id}
                className={`p-4 rounded-lg cursor-pointer border-2 ${
                  selectedAlgorithms.some((alg) => alg.id === algorithm.id)
                    ? `border-${algorithm.color.substring(1)} bg-slate-700`
                    : "border-gray-700 bg-slate-800"
                }`}
                onClick={() =>
                  !raceStarted && toggleAlgorithmSelection(algorithm)
                }
                style={{
                  borderColor: selectedAlgorithms.some(
                    (alg) => alg.id === algorithm.id
                  )
                    ? algorithm.color
                    : undefined,
                }}
              >
                <h3 className="text-xl font-semibold">{algorithm.name}</h3>
                <p className="text-sm text-gray-400">
                  {algorithm.id === "bubble" &&
                    "O(n²) - Simple but inefficient"}
                  {algorithm.id === "selection" &&
                    "O(n²) - Simple selection method"}
                  {algorithm.id === "insertion" &&
                    "O(n²) - Good for small arrays"}
                  {algorithm.id === "merge" &&
                    "O(n log n) - Divide and conquer"}
                  {algorithm.id === "quick" && "O(n log n) - Fast but unstable"}
                  {algorithm.id === "heap" &&
                    "O(n log n) - Uses heap data structure"}
                  {algorithm.id === "linear" && "O(n) - Checks every element"}
                  {algorithm.id === "binary" &&
                    "O(log n) - Requires sorted array"}
                  {algorithm.id === "jump" && "O(√n) - Block jumping search"}
                  {algorithm.id === "interpolation" &&
                    "O(log log n) - Position estimation"}
                </p>
              </div>
            ))}
          </div>

          <div className="flex justify-center mb-8">
            {!raceStarted ? (
              <button
                className="px-6 py-3 bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                onClick={startRace}
                disabled={selectedAlgorithms.length < 2}
              >
                <PlayIcon />
                Start Race
              </button>
            ) : (
              <button
                className="px-6 py-3 bg-red-600 rounded-lg hover:bg-red-700"
                onClick={resetRace}
              >
                Reset Race
              </button>
            )}
          </div>

          {raceStarted && (
            <div className="w-full p-6 bg-slate-800 rounded-lg">
              <h2 className="text-2xl font-bold mb-4">Race Progress</h2>

              {raceResults.map((result, index) => (
                <div key={result.id} className="mb-6">
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold">{result.name}</span>
                    <span>
                      {Math.floor(result.progress * 100)}%
                      {result.finished &&
                        ` - ${(result.timeElapsed / 1000).toFixed(2)}s`}
                      {index === 0 && raceFinished && " 🏆"}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
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
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Steps: {result.steps.toLocaleString()}</span>
                    <span>{(result.timeElapsed / 1000).toFixed(2)}s</span>
                  </div>
                </div>
              ))}

              {raceFinished && (
                <div className="mt-8 p-4 bg-slate-700 rounded-lg">
                  <h3 className="text-xl font-bold mb-2">Leaderboard</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-600">
                          <th className="py-2 px-2 text-left">Rank</th>
                          <th className="py-2 px-2 text-left">Algorithm</th>
                          <th className="py-2 px-2 text-right">Time (s)</th>
                          <th className="py-2 px-2 text-right">Steps</th>
                        </tr>
                      </thead>
                      <tbody>
                        {raceResults
                          .sort((a, b) => a.timeElapsed - b.timeElapsed)
                          .map((result, i) => (
                            <tr
                              key={result.id}
                              className={`${
                                i === 0 ? "bg-green-900/30" : ""
                              } border-b border-gray-700`}
                            >
                              <td className="py-2 px-2">
                                {i + 1}
                                {i === 0 ? " 🏆" : ""}
                              </td>
                              <td className="py-2 px-2 font-medium">
                                <div className="flex items-center">
                                  <span
                                    className="w-3 h-3 rounded-full mr-2"
                                    style={{ backgroundColor: result.color }}
                                  ></span>
                                  {result.name}
                                </div>
                              </td>
                              <td className="py-2 px-2 text-right">
                                {(result.timeElapsed / 1000).toFixed(2)}
                              </td>
                              <td className="py-2 px-2 text-right">
                                {result.steps.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RaceMode;
