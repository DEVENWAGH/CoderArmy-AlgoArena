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
      nodeSize = 65; // Increased from 58 for larger nodes
      levelHeight = 85; // Increased from 75 for better vertical spacing
      nodeSeparation = 1.6; // Increased from 1.5 for wider horizontal spacing
    }

    // Calculate the width needed based on tree depth and breadth
    const maxDepth = hierarchy.height || 0;
    const nodeCount = hierarchy.descendants().length || 0;

    // Adjust maxWidth calculation specifically for tablets to prevent excessive spacing
    let maxWidth;
    if (screenWidth >= 768 && screenWidth < 1024) {
      // Less compact width calculation for tablets to allow bigger tree display
      maxWidth = Math.max(
        Math.pow(2, maxDepth) * (nodeSize * 1.0),
        nodeCount * (nodeSize * 1.15)
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
        // Special handling for tablets - more horizontal spacing
        if (screenWidth >= 768 && screenWidth < 1024) {
          return a.parent === b.parent ? nodeSeparation : nodeSeparation + 0.4;
        }
        return a.parent === b.parent ? nodeSeparation : nodeSeparation + 0.5;
      });

    // Apply the layout
    const root = treeLayout(hierarchy);

    // Compute offsets for correct centering with tablet-specific adjustments
    const xMin = d3.min(root.descendants(), (d) => d.x) || 0;
    const xMax = d3.max(root.descendants(), (d) => d.x) || 0;

    // Adjust horizontal centering for tablets and mobile - add a stronger rightward shift
    let xOffset = -((xMin + xMax) / 2);

    // Add device-specific offsets
    if (screenWidth < 640) {
      // Small mobile
      xOffset += nodeSize * 0.25; // Increased rightward shift
    } else if (screenWidth < 768) {
      // Mobile
      xOffset += nodeSize * 0.3; // Increased rightward shift
    } else if (screenWidth >= 768 && screenWidth < 1024) {
      xOffset += nodeSize * 0.5; // Increased from 0.35 to 0.5 for stronger rightward shift
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
