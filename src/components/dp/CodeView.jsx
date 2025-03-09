import React, { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';
import { motion } from "motion/react"

const CodeView = ({ algorithm, currentCell, isPlaying }) => {
  const [highlightedLines, setHighlightedLines] = useState([]);
  const [explanation, setExplanation] = useState('');
  const codeRef = useRef(null);
  const timelineRef = useRef(null);
  
  // Algorithm code templates with execution sequence and explanations
  const codeSnippets = {
    fibonacci: {
      code: `function fibonacci(n) {
  // Base case
  if (n <= 1) return n;
  
  // Initialize DP array
  const dp = new Array(n + 1).fill(0);
  dp[1] = 1;
  
  // Calculate Fibonacci numbers
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i-1] + dp[i-2];
  }
  
  return dp[n];
}`,
      getHighlightedLines: (cell) => {
        if (cell === null) return [];
        if (cell <= 1) return [2, 3];
        return [9];
      },
      getExplanation: (cell) => {
        if (cell === null) return "Algorithm not started yet.";
        if (cell <= 1) return "Base case: For n=0 or n=1, we return the value directly.";
        return `Computing F(${cell}) = F(${cell-1}) + F(${cell-2}) = ${cell <= 1 ? cell : null}`;
      },
      // Animation sequence for educational purposes
      executionSequence: [
        { lines: [1], explanation: "Start the Fibonacci function" },
        { lines: [2, 3], explanation: "Check base cases: if n is 0 or 1, return n" },
        { lines: [5, 6], explanation: "Initialize array: dp[0]=0, dp[1]=1" },
        { lines: [8], explanation: "Start filling table from i=2 to n" },
        { lines: [9], explanation: "Formula: F(i) = F(i-1) + F(i-2)" },
        { lines: [12], explanation: "Return the final result at dp[n]" }
      ]
    },
    knapsack: {
      code: `function knapsack(weights, values, capacity) {
  const n = weights.length;
  
  // Initialize DP array
  const dp = Array(n + 1).fill().map(() => Array(capacity + 1).fill(0));
  
  // Fill the DP table
  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= capacity; w++) {
      // If current item can fit in the knapsack
      if (weights[i-1] <= w) {
        dp[i][w] = Math.max(
          values[i-1] + dp[i-1][w - weights[i-1]], // Take item
          dp[i-1][w] // Don't take item
        );
      } else {
        // Item doesn't fit, skip it
        dp[i][w] = dp[i-1][w];
      }
    }
  }
  
  return dp[n][capacity];
}`,
      getHighlightedLines: (cell) => {
        if (!cell || !Array.isArray(cell)) return [];
        const [i, w] = cell;
        if (i === 0 || w === 0) return [4];
        if (i > 0 && w > 0) {
          return w >= i ? [10, 11, 12] : [16];
        }
        return [];
      },
      getExplanation: (cell) => {
        if (!cell || !Array.isArray(cell)) return "Algorithm not started yet.";
        const [i, w] = cell;
        if (i === 0 || w === 0) return "Base case: Empty knapsack or no items has value 0";
        return w >= i ? 
          `Item ${i} fits in capacity ${w}. Choose max of: (1) Take item: value ${i} + dp[${i-1}][${w-i}], or (2) Skip item: dp[${i-1}][${w}]` :
          `Item ${i} doesn't fit in capacity ${w}. Skip it and use value from dp[${i-1}][${w}]`;
      },
      executionSequence: [
        { lines: [1, 2], explanation: "Start with n items and capacity W" },
        { lines: [4], explanation: "Initialize n+1 × W+1 table with zeros" },
        { lines: [7, 8], explanation: "For each item and capacity..." },
        { lines: [9, 10], explanation: "Check if item i fits in capacity w" },
        { lines: [10, 11, 12], explanation: "If it fits, decide whether to take or leave it" },
        { lines: [16], explanation: "If it doesn't fit, skip it" },
        { lines: [21], explanation: "Return the final value" }
      ]
    },
    lis: {
      code: `function lis(arr) {
  const n = arr.length;
  
  // Initialize DP array
  const dp = Array(n).fill(1);
  
  // Fill the DP table
  for (let i = 1; i < n; i++) {
    for (let j = 0; j < i; j++) {
      if (arr[i] > arr[j]) {
        dp[i] = Math.max(dp[i], dp[j] + 1);
      }
    }
  }
  
  return Math.max(...dp);
}`,
      getHighlightedLines: (cell) => {
        if (cell === null) return [];
        if (cell === 0) return [4];
        return [9];
      },
      getExplanation: (cell) => {
        if (cell === null) return "Algorithm not started yet.";
        if (cell === 0) return "Initialize all positions with LIS=1 (single element)";
        return `At position ${cell}, check all previous elements to extend LIS if possible`;
      },
      executionSequence: [
        { lines: [1, 2], explanation: "Start with array of length n" },
        { lines: [4], explanation: "Initialize with 1s - every element is a LIS of length 1" },
        { lines: [7], explanation: "For each element starting from index 1..." },
        { lines: [8], explanation: "Compare with all previous elements" },
        { lines: [9], explanation: "If current > previous and forms longer sequence, update" },
        { lines: [14], explanation: "Return the maximum LIS length found" }
      ]
    },
    lcs: {
      code: `function lcs(str1, str2) {
  const m = str1.length;
  const n = str2.length;
  
  // Initialize DP array
  const dp = Array(m + 1).fill().map(() => Array(n + 1).fill(0));
  
  // Fill the DP table
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i-1] === str2[j-1]) {
        dp[i][j] = dp[i-1][j-1] + 1; // Characters match
      } else {
        dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]); // Take the max
      }
    }
  }
  
  return dp[m][n];
}`,
      getHighlightedLines: (cell) => {
        if (!cell || !Array.isArray(cell)) return [];
        const [i, j] = cell;
        if (i === 0 || j === 0) return [5];
        return [10, 11, 12, 13];
      },
      getExplanation: (cell) => {
        if (!cell || !Array.isArray(cell)) return "Algorithm not started yet.";
        const [i, j] = cell;
        if (i === 0 || j === 0) return "Base case: Empty string has LCS of 0";
        return `Comparing characters at position ${i-1} in str1 and ${j-1} in str2`;
      },
      executionSequence: [
        { lines: [1, 2, 3], explanation: "Start with two strings of length m and n" },
        { lines: [5], explanation: "Initialize (m+1) × (n+1) table with zeros" },
        { lines: [8, 9], explanation: "For each character pair..." },
        { lines: [10], explanation: "Check if characters match" },
        { lines: [11], explanation: "If they match, extend LCS by 1 from previous result" },
        { lines: [13], explanation: "If they don't match, take best of excluding one character" },
        { lines: [18], explanation: "Return the final LCS length" }
      ]
    }
  };

  // Use gsap for smooth animations
  useEffect(() => {
    if (codeRef.current && isPlaying && algorithm && codeSnippets[algorithm]) {
      if (timelineRef.current) timelineRef.current.kill();
      
      const timeline = gsap.timeline();
      timelineRef.current = timeline;
      
      // Get execution sequence for the algorithm
      const { executionSequence } = codeSnippets[algorithm];
      
      // Animate each step in the sequence
      executionSequence.forEach((step, index) => {
        // Add highlighting animation
        timeline.to(`.code-line`, {
          backgroundColor: 'transparent',
          color: '#D1D5DB',
          duration: 0.2
        }, index * 1.5);
        
        step.lines.forEach(lineNum => {
          timeline.to(`.code-line:nth-child(${lineNum})`, {
            backgroundColor: 'rgba(253, 224, 71, 0.2)',
            color: 'white',
            duration: 0.3
          }, index * 1.5 + 0.2);
        });
        
        // Update explanation
        timeline.to({}, {
          duration: 0.1,
          onComplete: () => setExplanation(step.explanation)
        }, index * 1.5 + 0.3);
      });
      
      // Reset animation at the end
      timeline.to({}, {
        duration: 0.5,
        onComplete: () => {
          // Reset to current cell highlighting
          if (currentCell !== null) {
            const newHighlightedLines = codeSnippets[algorithm].getHighlightedLines(currentCell);
            setHighlightedLines(newHighlightedLines);
            setExplanation(codeSnippets[algorithm].getExplanation(currentCell));
          }
        }
      }, executionSequence.length * 1.5);
    }
  }, [isPlaying, algorithm]);

  // Update highlighted lines and explanation when current cell changes
  useEffect(() => {
    if (!algorithm || !codeSnippets[algorithm]) {
      setHighlightedLines([]);
      setExplanation("");
      return;
    }
    
    const { getHighlightedLines, getExplanation } = codeSnippets[algorithm];
    const newHighlightedLines = getHighlightedLines(currentCell);
    const newExplanation = getExplanation(currentCell);
    
    setHighlightedLines(newHighlightedLines);
    setExplanation(newExplanation);
  }, [currentCell, algorithm]);

  if (!algorithm || !codeSnippets[algorithm]) {
    return <div className="text-white">No code available for this algorithm</div>;
  }

  const { code } = codeSnippets[algorithm];
  const codeLines = code.split('\n');

  return (
    <div className="flex flex-col w-full h-full gap-4 overflow-hidden mt-5 lg:mt-0">
      {/* Code container with scrolling */}
      <div
        className="flex-grow w-full overflow-auto bg-gray-900 rounded-lg code-container"
        ref={codeRef}
        style={{ maxHeight: "calc(100% - 200px)" }}
      >
        {/* Add scrollbar styling */}
        <style jsx>{`
          .code-container::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          .code-container::-webkit-scrollbar-thumb {
            background: #4b5563;
            border-radius: 4px;
          }
          .code-container::-webkit-scrollbar-track {
            background: #1f2937;
          }
        `}</style>

        <pre className="p-4 font-mono text-sm text-gray-300">
          {codeLines.map((line, index) => (
            <motion.div
              key={index}
              className={`code-line py-1 px-2 ${
                highlightedLines.includes(index + 1)
                  ? "bg-yellow-500 bg-opacity-20 text-white"
                  : ""
              } ${line.trim() === "" ? "h-4" : ""}`}
              initial={{ backgroundColor: "transparent" }}
              animate={{
                backgroundColor: highlightedLines.includes(index + 1)
                  ? "rgba(253, 224, 71, 0.2)"
                  : "transparent",
                color: highlightedLines.includes(index + 1)
                  ? "white"
                  : "#D1D5DB",
              }}
              transition={{ duration: 0.3 }}
            >
              <span className="mr-4 text-gray-500 select-none">
                {index + 1}
              </span>
              {line}
            </motion.div>
          ))}
        </pre>
      </div>

      {/* Scroll indicator */}
      <div className="absolute px-2 py-1 text-xs text-gray-500 rounded bottom-4 right-4 bg-slate-700 opacity-70">
        Scroll to view more code
      </div>
    </div>
  );
};

export default CodeView;
