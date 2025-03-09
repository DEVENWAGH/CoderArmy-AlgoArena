import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

const DPTreeVisualizer = ({
  data,
  currentCell,
  type,
  algorithmResult = null,
}) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const timelineRef = useRef(null);

  gsap.registerPlugin(useGSAP);

  useGSAP(
    () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
      timelineRef.current = gsap.timeline();
    },
    { scope: containerRef }
  );

  useEffect(() => {
    const buildTree = () => {
      switch (type) {
        case "fibonacci":
          return buildFibonacciTree(data.length - 1);
        case "lis":
          return buildLISTree(data);
        case "lcs":
          return buildLCSTree(data);
        case "knapsack":
          return buildKnapsackTree(data);
        default:
          return buildFibonacciTree(data.length - 1);
      }
    };

    // Build a fibonacci tree recursively
    const buildFibonacciTree = (n) => {
      n = Math.min(n, 8); // Ensure n does not exceed 8
      if (n <= 1) {
        return {
          id: `fib-${n}`,
          name: `F(${n})`,
          value: n,
          isBaseCase: true,
          children: [],
        };
      }

      return {
        id: `fib-${n}`,
        name: `F(${n})`,
        value: data[n],
        isBaseCase: false,
        isCurrent: currentCell === n,
        hasOverlap: false,
        children: [buildFibonacciTree(n - 1), buildFibonacciTree(n - 2)],
      };
    };

    // Build an LIS tree
    const buildLISTree = (dp) => {
      // Check if dp is a 1D array (handle both formats)
      const is1DArray = !Array.isArray(dp[0]);

      // Get max LIS value safely
      const getMaxValue = () => {
        if (is1DArray) {
          return Math.max(...dp); // Safe for 1D array
        } else {
          // Find max in 2D array safely
          return dp.reduce((max, row) => {
            const rowMax = row.reduce((m, val) => Math.max(m, val), 0);
            return Math.max(max, rowMax);
          }, 0);
        }
      };

      const root = {
        id: "lis-root",
        name: "LIS",
        value: getMaxValue(),
        isBaseCase: false,
        children: [],
      };

      // Create nodes for each position based on array type
      if (is1DArray) {
        // Handle 1D array case
        for (let i = 0; i < dp.length; i++) {
          const node = {
            id: `lis-${i}`,
            name: `LIS(${i})`,
            value: dp[i],
            isBaseCase: dp[i] === 1,
            isCurrent: currentCell === i,
            children: [],
          };

          // Find dependencies (nodes that could have contributed to this LIS)
          for (let j = 0; j < i; j++) {
            if (dp[j] < dp[i]) {
              node.children.push({
                id: `lis-dep-${j}`,
                name: `LIS(${j})`,
                value: dp[j],
                isBaseCase: dp[j] === 1,
                children: [],
              });
            }
          }

          root.children.push(node);
        }
      } else {
        // Handle 2D array case if that's how your algorithm stores data
        for (let i = 0; i < dp.length; i++) {
          const node = {
            id: `lis-${i}`,
            name: `LIS(${i})`,
            value: dp[i][i] || dp[i][0] || 1, // Adapt based on your DP structure
            isBaseCase: dp[i][i] === 1 || dp[i][0] === 1,
            isCurrent: Array.isArray(currentCell)
              ? currentCell[0] === i && currentCell[1] === i
              : currentCell === i,
            children: [],
          };

          root.children.push(node);
        }
      }

      return root;
    };

    // Build an LCS tree
    const buildLCSTree = (dp) => {
      if (!dp || !dp.length || !dp[0]) return null;

      const root = {
        id: "lcs-root",
        name: "LCS",
        value: dp[dp.length - 1][dp[0].length - 1],
        isBaseCase: false,
        children: [],
      };

      const buildSubtree = (i, j, depth = 0) => {
        if (depth > 3 || i < 0 || j < 0) return null;

        const node = {
          id: `lcs-${i}-${j}`,
          name: `LCS(${i},${j})`,
          value: dp[i][j],
          isBaseCase: i === 0 || j === 0,
          isCurrent:
            Array.isArray(currentCell) &&
            currentCell[0] === i &&
            currentCell[1] === j,
          children: [],
        };

        if (i > 0 && j > 0) {
          const left = buildSubtree(i, j - 1, depth + 1);
          const up = buildSubtree(i - 1, j, depth + 1);
          const diag = buildSubtree(i - 1, j - 1, depth + 1);

          if (left) node.children.push(left);
          if (up) node.children.push(up);
          if (diag) node.children.push(diag);
        }

        return node;
      };

      const m = dp.length - 1;
      const n = dp[0].length - 1;
      return buildSubtree(m, n);
    };

    // Fixed knapsack tree builder with actual weights and values from algorithm result
    const buildKnapsackTree = (dp) => {
      if (!dp || !dp.length || !dp[0] || !dp[0].length) {
        return { id: "empty", name: "No Data", value: 0, children: [] };
      }

      const rows = dp.length;
      const cols = dp[0].length;

      // Use actual weights and values if available
      const weights =
        algorithmResult?.weights ||
        Array.from({ length: rows - 1 }, (_, i) => i + 1);
      const values =
        algorithmResult?.values ||
        Array.from({ length: rows - 1 }, (_, i) => i + 2);

      // Create the root node for the tree
      const root = {
        id: "knapsack-root",
        name: `KS(${rows - 1},${cols - 1})`,
        value: dp[rows - 1]?.[cols - 1] || 0,
        isBaseCase: false,
        isCurrent:
          currentCell &&
          currentCell[0] === rows - 1 &&
          currentCell[1] === cols - 1,
        children: [],
      };
      const buildSubtree = (i, w, depth = 0) => {
        // Limit tree depth for visualization
        if (depth > 3 || i < 0 || w <= 0) {
          return null;
        }

        // Create node for this subproblem
        const node = {
          id: `ks-${i}-${w}`,
          name: `KS(${i},${w})`,
          value: dp[i]?.[w] || 0,
          isBaseCase: i === 0 || w === 0,
          isCurrent:
            currentCell && currentCell[0] === i && currentCell[1] === w,
          children: [],
        };

        // If not a base case, add children representing subproblems
        if (i > 0 && w > 0) {
          // Don't take current item
          const withoutItem = buildSubtree(i - 1, w, depth + 1);
          if (withoutItem) {
            withoutItem.decision = "Skip";
            node.children.push(withoutItem);
          }

          // Take current item if it fits
          if (w >= weights[i - 1]) {
            const withItem = buildSubtree(i - 1, w - weights[i - 1], depth + 1);
            if (withItem) {
              withItem.decision = `Take (w:${weights[i - 1]}, v:${
                values[i - 1]
              })`;
              node.children.push(withItem);
            }
          }
        }

        return node;
      };

      // Build tree starting from the bottom right (final state)
      return buildSubtree(rows - 1, cols - 1);
    };

    // Estimate tree size to determine SVG dimensions
    const estimateTreeSize = (root) => {
      const countNodes = (node) => {
        if (!node.children || node.children.length === 0) return 1;
        return (
          1 + node.children.reduce((sum, child) => sum + countNodes(child), 0)
        );
      };

      const totalNodes = countNodes(root);
      const estimatedWidth = Math.max(1200, totalNodes * 40);
      const estimatedHeight = Math.max(800, totalNodes * 15);

      return { width: estimatedWidth, height: estimatedHeight };
    };

    // Build the tree data
    const treeData = buildTree();
    const { width, height } = estimateTreeSize(treeData);
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;
    const initialScale = 0.602;
    const initialTranslateX = 726.5;
    const initialTranslateY = 180;

    // Log the initial position and scale
    console.log("Initial Translate X:", initialTranslateX);
    console.log("Initial Translate Y:", initialTranslateY);
    console.log("Initial Scale:", initialScale);

    // Clear previous content
    const svgEl = svgRef.current;
    d3.select(svgEl).selectAll("*").remove();

    const svg = d3
      .select(svgEl)
      .attr("viewBox", `0 0 ${width} ${height}`) // Use viewBox for responsive SVG
      .attr("preserveAspectRatio", "xMidYMid meet"); // Preserve aspect ratio and center

    // Set initial transform centered in viewport
    const g = svg
      .append("g")
      .attr(
        "transform",
        `translate(${initialTranslateX}, ${initialTranslateY}) scale(${initialScale})`
      ) // Center the tree and scale to fit
      .attr("class", "main-group");

    // Create a hierarchical layout
    const root = d3.hierarchy(treeData);

    // Use vertical tree layout with better spacing
    const treeLayout = d3
      .tree()
      .size([width - 300, height - 200]) // Reduce size to prevent nodes at edges
      .nodeSize([80, 100]) // Increase spacing between nodes
      .separation((a, b) => (a.parent === b.parent ? 1.5 : 2.5)); // More separation

    const tree = treeLayout(root);

    // Draw the links with smoother curves
    g.selectAll("path.link")
      .data(tree.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr(
        "d",
        d3
          .linkVertical()
          .x((d) => d.x)
          .y((d) => d.y)
      )
      .attr("stroke", "#4B5563")
      .attr("stroke-width", 2)
      .attr("fill", "none")
      .style("opacity", 1); // Make links visible immediately for better orientation

    // Create a group for each node - make visible immediately
    const nodeGroups = g
      .selectAll("g.node")
      .data(tree.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d) => `translate(${d.x},${d.y})`)
      .style("opacity", 0.3); // Partially visible at start for better orientation

    // Add circles for nodes with different colors based on conditions
    nodeGroups
      .append("circle")
      .attr("r", (d) => (d.data.isBaseCase ? 18 : 22))
      .attr("fill", (d) => {
        if (d.data.isCurrent) return "#FCD34D"; // Yellow for current
        if (d.data.isBaseCase) return "#10B981"; // Green for base cases
        if (d.data.hasOverlap) return "#60A5FA"; // Blue for overlapping subproblems
        return "#3B82F6"; // Default blue
      })
      .attr("stroke", "#E5E7EB")
      .attr("stroke-width", 2);

    // Add text for node names
    nodeGroups
      .append("text")
      .attr("dy", ".3em")
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("font-size", "14px")
      .text((d) => d.data.name);

    // Add text for return values
    nodeGroups
      .append("text")
      .attr("dy", 30)
      .attr("text-anchor", "middle")
      .attr("fill", "#D1D5DB")
      .attr("font-size", "12px")
      .text((d) => {
        if (!d.data) return "";
        const value = d.data.value !== undefined ? d.data.value : "?";

        if (type === "knapsack" && d.data.decision) {
          return `${value} (${d.data.decision})`;
        }
        return value;
      });

    // Add an extra line for knapsack decisions if needed
    if (type === "knapsack") {
      nodeGroups
        .filter((d) => d.data.decision)
        .append("text")
        .attr("dy", "42px")
        .attr("text-anchor", "middle")
        .attr("fill", "#9CA3AF")
        .attr("font-size", "10px")
        .text((d) => d.data.decision);
    }

    // Create a GSAP animation timeline
    const tl = (timelineRef.current = gsap.timeline());

    // Mark visited nodes first to simulate recursion traversal
    const markVisitedSequence = (nodes) => {
      // Sort nodes by depth for animation sequence
      return nodes.sort((a, b) => a.depth - b.depth);
    };

    // Create a sequence for depth-first-search like in recursion visualization
    const visitedSequence = markVisitedSequence(tree.descendants());

    // Animate nodes appearing
    visitedSequence.forEach((node, i) => {
      // Animate the node appearance
      tl.to(
        nodeGroups.nodes()[tree.descendants().indexOf(node)],
        {
          opacity: 1,
          duration: 0.3,
          ease: "power1.inOut",
        },
        i * 0.2
      );

      // If it has a parent, animate the link too
      if (node.parent) {
        const linkIndex = tree
          .links()
          .findIndex(
            (link) => link.source === node.parent && link.target === node
          );
        if (linkIndex >= 0) {
          tl.to(
            g.selectAll("path.link").nodes()[linkIndex],
            {
              opacity: 1,
              duration: 0.3,
              ease: "power1.inOut",
            },
            i * 0.2
          );
        }
      }
    });

    // Add a title on top
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .attr("font-size", "20px")
      .attr("fill", "white")
      .text(`${type.toUpperCase()} Recursion Tree`);

    // Add color legend
    const legend = svg
      .append("g")
      .attr("transform", `translate(20, ${height - 80})`);

    // Base case
    legend
      .append("circle")
      .attr("cx", 10)
      .attr("cy", 10)
      .attr("r", 10)
      .attr("fill", "#10B981");

    legend
      .append("text")
      .attr("x", 25)
      .attr("y", 15)
      .attr("fill", "white")
      .text("Base Case");

    // Current node
    legend
      .append("circle")
      .attr("cx", 10)
      .attr("cy", 40)
      .attr("r", 10)
      .attr("fill", "#FCD34D");

    legend
      .append("text")
      .attr("x", 25)
      .attr("y", 45)
      .attr("fill", "white")
      .text("Current Node");

    // Overlapping subproblem
    legend
      .append("circle")
      .attr("cx", 150)
      .attr("cy", 10)
      .attr("r", 10)
      .attr("fill", "#60A5FA");

    legend
      .append("text")
      .attr("x", 165)
      .attr("y", 15)
      .attr("fill", "white")
      .text("Overlapping Subproblem");

    // Regular node
    legend
      .append("circle")
      .attr("cx", 150)
      .attr("cy", 40)
      .attr("r", 10)
      .attr("fill", "#3B82F6");

    legend
      .append("text")
      .attr("x", 165)
      .attr("y", 45)
      .attr("fill", "white")
      .text("Regular Node");

    // Add controls
    const controls = svg
      .append("g")
      .attr("transform", `translate(${width - 150}, ${height - 60})`);

    // Play button
    controls
      .append("rect")
      .attr("width", 40)
      .attr("height", 40)
      .attr("rx", 5)
      .attr("fill", "#3B82F6")
      .attr("cursor", "pointer")
      .on("click", () => {
        if (tl.paused()) tl.play();
        else tl.pause();
      });

    controls
      .append("text")
      .attr("x", 20)
      .attr("y", 25)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("pointer-events", "none")
      .text("▶/❚❚");

    // Reset button
    controls
      .append("rect")
      .attr("x", 50)
      .attr("width", 40)
      .attr("height", 40)
      .attr("rx", 5)
      .attr("fill", "#EF4444")
      .attr("cursor", "pointer")
      .on("click", () => {
        tl.restart();
      });

    controls
      .append("text")
      .attr("x", 70)
      .attr("y", 25)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("pointer-events", "none")
      .text("↺");

    // Improved zoom behavior with better defaults and constraints
    const zoom = d3
      .zoom()
      .scaleExtent([0.2, 3])
      .translateExtent([
        [-width, -height],
        [width * 2, height * 2],
      ])
      .on("zoom", (event) => {
        // Apply zoom to the main group
        g.attr("transform", event.transform);
      })
      .filter((event) => {
        // Allow zoom on all inputs but prevent double-triggering on some events
        return !event.ctrlKey && !event.button;
      });

    // Initialize with a slight zoom out for better initial view
    svg
      .call(zoom)
      .call(
        zoom.transform,
        d3.zoomIdentity
          .translate(initialTranslateX, initialTranslateY)
          .scale(initialScale)
      ); // Apply initial zoom and translation

    // Configure the timeline with delayed start for better control
    timelineRef.current.pause();
    timelineRef.current.delay(0.5); // Give time for initial render before animation

    // Animate nodes appearing - simplified sequence
    tree.descendants().forEach((node, i) => {
      // Group nodes by level for better visual flow
      const delay = node.depth * 0.3 + i * 0.03;

      // Animate opacity and slight scale increase for better visibility
      timelineRef.current.to(
        nodeGroups.nodes()[tree.descendants().indexOf(node)],
        {
          opacity: 1,
          scale: 1,
          duration: 0.4,
          ease: "power2.out",
        },
        delay
      );
    });

    // Add a reset zoom button for convenience
    const resetButton = svg
      .append("g")
      .attr("transform", `translate(${width - 90}, ${height - 60})`)
      .attr("class", "control-button")
      .style("cursor", "pointer")
      .on("click", () => {
        svg
          .transition()
          .duration(750)
          .call(
            zoom.transform,
            d3.zoomIdentity.translate(width / 2, 80).scale(0.8)
          );
      });

    resetButton
      .append("rect")
      .attr("width", 40)
      .attr("height", 40)
      .attr("rx", 5)
      .attr("fill", "#4B5563");

    resetButton
      .append("text")
      .attr("x", 20)
      .attr("y", 25)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .text("⟲");

    // Start animation only when component is fully mounted
    setTimeout(() => {
      timelineRef.current.play();
    }, 100);
  }, [data, currentCell, type, algorithmResult]);

  return (
    <div
      ref={containerRef}
      className="flex items-center justify-center w-full h-full"
    >
      <svg
        ref={svgRef}
        className="w-full h-full"
        style={{
          minHeight: "600px",
          borderRadius: "0.5rem",
          backgroundColor: "#1F2937",
          touchAction: "none", // Important for mobile devices
        }}
      />
      <div className="absolute px-3 py-1 text-sm text-gray-300 rounded bg-slate-800 bg-opacity-70 bottom-2 left-2">
        Scroll to zoom, drag to pan, double-click to reset
      </div>
    </div>
  );
};

export default DPTreeVisualizer;
