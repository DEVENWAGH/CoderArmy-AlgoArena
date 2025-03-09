import { useEffect } from "react";
import { useParams } from "react-router-dom";
import useGreedyStore from "../../store/greedyStore";
import ActivitySelectionVisualizer from "./ActivitySelectionVisualizer";
import HuffmanCodingVisualizer from "./HuffmanCodingVisualizer";

const GreedyVisualizer = () => {
  const { algorithm } = useParams();
  const {
    isPlaying,
    isPaused,
    speed,
    setSpeed,
    startAlgorithm,
    runAlgorithm,
    pauseAlgorithm,
    resumeAlgorithm,
  } = useGreedyStore();

  useEffect(() => {
    // Only log once during initial mount or algorithm change
    if (process.env.NODE_ENV === "development") {
      console.log("Algorithm initialized:", algorithm);
    }

    if (algorithm) {
      startAlgorithm(algorithm);
    }
  }, [algorithm, startAlgorithm]);

  // Handle play/pause toggle
  const handlePlayPauseToggle = () => {
    if (isPlaying) {
      pauseAlgorithm();
    } else if (isPaused) {
      resumeAlgorithm();
    } else {
      runAlgorithm(algorithm);
    }
  };

  const renderAlgorithmVisualizer = () => {
    // Remove redundant logging here
    switch (algorithm) {
      case "activity-selection":
        return <ActivitySelectionVisualizer />;
      case "huffman-coding":
        return <HuffmanCodingVisualizer />;
      default:
        return (
          <div className="flex items-center justify-center h-64 text-xl text-white">
            Algorithm not found or not implemented yet: "{algorithm}"
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col w-full h-full bg-slate-800">
      {/* Controls Header - Hidden on mobile/tablet */}
      <div className="fixed right-0 z-40 p-4 border-b shadow-lg top-26 left-64 bg-slate-800 border-slate-700 hidden md:block">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white capitalize">
            {algorithm?.replace("-", " ")}
          </h2>

          <div className="flex items-center gap-4">
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

            <button
              onClick={handlePlayPauseToggle}
              className={`px-4 py-2 rounded ${
                isPlaying ? "bg-red-500" : "bg-green-500"
              }`}
            >
              {isPlaying ? "Pause" : isPaused ? "Resume" : "Start"}
            </button>

            <button
              onClick={() => startAlgorithm(algorithm)}
              className="px-4 py-2 bg-blue-500 rounded"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Page title for mobile - when header is hidden */}
      <div className="p-4 md:hidden">
        <h2 className="text-xl font-bold text-white capitalize">
          {algorithm?.replace("-", " ")}
        </h2>
      </div>

      {/* Main Content - Make this scrollable */}
      <div className="flex-1 p-6 md:mt-24 overflow-hidden">
        <div className="p-4 rounded-lg bg-slate-900 h-[calc(100vh-180px)] overflow-auto">
          {renderAlgorithmVisualizer()}
        </div>
      </div>

      {/* Bottom controls for mobile and tablet */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40 md:hidden">
        <div className="flex items-center space-x-3 bg-slate-800 bg-opacity-90 px-4 py-2 rounded-full shadow-lg">
          {/* Speed control - simplified for mobile */}
          <div className="flex items-center">
            <span className="text-gray-300 text-sm mr-2">{speed}%</span>
            <input
              type="range"
              min="1"
              max="100"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-20"
            />
          </div>

          {/* Play/Pause Button */}
          <button
            onClick={handlePlayPauseToggle}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md transition-colors
              ${
                isPlaying
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-green-500 hover:bg-green-600"
              }`}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
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
                  d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ) : (
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
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
          </button>

          {/* Reset Button */}
          <button
            onClick={() => startAlgorithm(algorithm)}
            className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-md hover:bg-blue-600 transition-colors"
            aria-label="Reset"
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GreedyVisualizer;
