import * as d3 from "d3";

export const createTreeLayout = (data, width, height) => {
  // Properly create a hierarchy with parent references for animations
  const hierarchy = d3.hierarchy(data, (node) => {
    const children = [];
    if (node.left) children.push(node.left);
    if (node.right) children.push(node.right);
    return children.length ? children : null;
  });

  // Use fixed size with better spacing
  const nodeSize = 60; // Space for each node
  const levelHeight = 80; // Vertical space between levels

  // Calculate the width needed based on tree depth and breadth
  const maxDepth = hierarchy.height;
  const maxWidth = Math.pow(2, maxDepth) * nodeSize;
  const maxHeight = maxDepth * levelHeight;

  // Determine scaling factor to fit the tree within the viewport
  const scaleX = Math.min(1, width / maxWidth);
  const scaleY = Math.min(1, height / maxHeight);
  const scale = Math.min(scaleX, scaleY);

  // Create the tree layout with proper sizing
  const treeLayout = d3
    .tree()
    .nodeSize([nodeSize * 1.5, levelHeight]) // Adjusted node size and level height
    .size([width * 0.8, height * 0.7]); // Leave space at top and bottom

  // Apply the layout
  const root = treeLayout(hierarchy);

  // Compute offsets for correct centering
  const xMin = d3.min(root.descendants(), (d) => d.x);
  const xMax = d3.max(root.descendants(), (d) => d.x);
  const xOffset = -((xMin + xMax) / 2);

  const yMin = d3.min(root.descendants(), (d) => d.y);
  const yMax = d3.max(root.descendants(), (d) => d.y);
  const yOffset = -((yMin + yMax) / 2);

  // Create the nodes array with positions and parent references
  const nodes = root.descendants().map((node) => ({
    id: node.data.value,
    x: node.x + xOffset + width / 2, // Center horizontally
    y: node.y + yOffset + height / 2, // Center vertically
    data: node.data,
    parentId: node.parent ? node.parent.data.value : null,
    hasChildren: node.children && node.children.length > 0,
  }));

  // Create links with matching positions
  const links = root.links().map((link) => ({
    source: {
      id: link.source.data.value,
      x: link.source.x + xOffset + width / 2,
      y: link.source.y + yOffset + height / 2, // Match node position
    },
    target: {
      id: link.target.data.value,
      x: link.target.x + xOffset + width / 2,
      y: link.target.y + yOffset + height / 2, // Match node position
    },
  }));

  return { nodes, links };
};
