import * as d3 from "d3";

export const createTreeLayout = (data, width, height) => {
  try {
    // Safety check for input data
    if (!data) {
      console.warn("No data provided for tree layout");
      return { nodes: [], links: [] };
    }

    // Properly create a hierarchy with parent references for animations
    const hierarchy = d3.hierarchy(data, (node) => {
      if (!node) return null;
      const children = [];
      if (node.left) children.push(node.left);
      if (node.right) children.push(node.right);
      return children.length ? children : null;
    });

    // If hierarchy creation failed, return empty layout
    if (!hierarchy) {
      console.warn("Failed to create hierarchy from data");
      return { nodes: [], links: [] };
    }

    // Use fixed size with better spacing
    // Get screen width to adjust node spacing for mobile/tablet
    const screenWidth =
      typeof window !== "undefined" ? window.innerWidth : 1200;

    // Adjust node size and spacing based on screen width for better responsive layout
    let nodeSize = 60; // Default space for each node
    let levelHeight = 80; // Default vertical space between levels
    let nodeSeparation = 1.5; // Default separation between nodes

    // Adjust spacing for smaller screens with improved tablet values
    if (screenWidth < 640) {
      // Small mobile
      nodeSize = 40;
      levelHeight = 60;
      nodeSeparation = 1.2;
    } else if (screenWidth < 768) {
      // Mobile
      nodeSize = 45;
      levelHeight = 65;
      nodeSeparation = 1.3;
    } else if (screenWidth < 1024) {
      // Tablet - improved spacing for better visibility and increased size
      nodeSize = 55; // Reduced slightly from 65 for better horizontal spacing
      levelHeight = 75; // Adjusted from 85 for better vertical distribution
      nodeSeparation = 1.4; // Reduced from 1.6 for more compact but still clear layout
    }

    // Calculate the width needed based on tree depth and breadth
    const maxDepth = hierarchy.height || 0;
    const nodeCount = hierarchy.descendants().length || 0;

    // Adjust maxWidth calculation specifically for tablets to prevent excessive spacing
    let maxWidth;
    if (screenWidth >= 768 && screenWidth < 1024) {
      // More compact width calculation for tablets to avoid empty space on sides
      maxWidth = Math.max(
        Math.pow(2, maxDepth) * (nodeSize * 0.9),
        nodeCount * (nodeSize * 1.0)
      );
    } else {
      maxWidth = Math.max(
        Math.pow(2, maxDepth) * nodeSize,
        nodeCount * (nodeSize * 1.2)
      );
    }

    const maxHeight = maxDepth * levelHeight * 1.2;

    // Adjust scale to ensure nodes don't overlap
    const scaleX = Math.min(1, width / maxWidth);
    const scaleY = Math.min(1, height / maxHeight);
    const scale = Math.min(scaleX, scaleY);

    // Create the tree layout with dynamic sizing
    const treeLayout = d3
      .tree()
      .nodeSize([nodeSize * 2, levelHeight])
      .separation((a, b) => {
        // Special handling for tablets - more balanced horizontal spacing
        if (screenWidth >= 768 && screenWidth < 1024) {
          return a.parent === b.parent ? nodeSeparation : nodeSeparation + 0.2;
        }
        return a.parent === b.parent ? nodeSeparation : nodeSeparation + 0.5;
      });

    // Apply the layout
    const root = treeLayout(hierarchy);

    // Compute offsets for correct centering with tablet-specific adjustments
    const xMin = d3.min(root.descendants(), (d) => d.x) || 0;
    const xMax = d3.max(root.descendants(), (d) => d.x) || 0;

    // Improve horizontal centering logic for tablets and mobile
    let xOffset = -((xMin + xMax) / 2);

    // Add device-specific offsets - refined for better positioning
    if (screenWidth < 640) {
      // Small mobile - increase rightward shift for better centering
      xOffset += nodeSize * 0.15;
    } else if (screenWidth < 768) {
      // Mobile - moderate rightward shift
      xOffset += nodeSize * 0.2;
    } else if (screenWidth >= 768 && screenWidth < 1024) {
      // Tablet - reduced rightward shift for better balanced appearance
      xOffset += nodeSize * 0.25;
    }

    const yMin = d3.min(root.descendants(), (d) => d.y) || 0;
    const yMax = d3.max(root.descendants(), (d) => d.y) || 0;
    const yOffset = -((yMin + yMax) / 2);

    // Create the nodes array with positions and parent references
    // Add data validation throughout the process
    const nodes = root.descendants().map((node) => ({
      id: node.data.value,
      x: (node.x || 0) + xOffset + width / 2, // Center horizontally with adjustment
      y: (node.y || 0) + yOffset + height / 2, // Center vertically
      data: node.data,
      parentId: node.parent ? node.parent.data.value : null,
      hasChildren: node.children && node.children.length > 0,
    }));

    // Create links with matching positions and add buffers
    const links = root.links().map((link) => ({
      source: {
        id: link.source.data.value,
        x: (link.source.x || 0) + xOffset + width / 2,
        y: (link.source.y || 0) + yOffset + height / 2,
      },
      target: {
        id: link.target.data.value,
        x: (link.target.x || 0) + xOffset + width / 2,
        y: (link.target.y || 0) + yOffset + height / 2,
      },
      // Add unique identifier for better GSAP targeting
      id: `${link.source.data.value}-${link.target.data.value}`,
    }));

    return {
      nodes,
      links,
      width: maxWidth * scale,
      height: maxHeight * scale,
    };
  } catch (error) {
    console.error("Error in createTreeLayout:", error);
    // Return safe empty structure on error
    return { nodes: [], links: [] };
  }
};
