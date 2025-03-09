/**
 * Parses a string representation of a tree into a tree structure
 * @param {string} input - Comma-separated values like "1,2,3,null,4,5"
 * @returns {Object|null} The root node of the tree or null if invalid
 */
export const parseTreeInput = (input) => {
  try {
    // Parse the input string into an array of values
    const values = input.split(",").map((val) => {
      const trimmed = val.trim();
      return trimmed === "null" || trimmed === ""
        ? null
        : parseInt(trimmed, 10);
    });

    if (values.length === 0 || (values.length === 1 && values[0] === null)) {
      return null;
    }

    // Create nodes from the array (level-order representation)
    const nodes = values.map((val) =>
      val === null ? null : { value: val, left: null, right: null }
    );

    // Connect nodes to form the tree
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i] !== null) {
        // Left child
        const leftIndex = 2 * i + 1;
        if (leftIndex < nodes.length) {
          nodes[i].left = nodes[leftIndex];
        }

        // Right child
        const rightIndex = 2 * i + 2;
        if (rightIndex < nodes.length) {
          nodes[i].right = nodes[rightIndex];
        }
      }
    }

    return nodes[0]; // Return the root of the tree
  } catch (error) {
    console.error("Error parsing tree input:", error);
    return null;
  }
};

/**
 * Creates a balanced binary search tree from an array of values
 * @param {Array} values - Array of numeric values
 * @returns {Object|null} The root node of the balanced BST or null if empty
 */
export const createBalancedTree = (values) => {
  if (!values || values.length === 0) return null;

  // Sort and remove duplicates
  const sortedValues = [...new Set(values)].sort((a, b) => a - b);

  // Helper function to create a balanced BST from sorted array
  const buildBalancedBST = (arr, start, end) => {
    if (start > end) return null;

    // Find the middle element and make it root
    const mid = Math.floor((start + end) / 2);
    const node = { value: arr[mid], left: null, right: null };

    // Recursively build left and right subtrees
    node.left = buildBalancedBST(arr, start, mid - 1);
    node.right = buildBalancedBST(arr, mid + 1, end);

    return node;
  };

  return buildBalancedBST(sortedValues, 0, sortedValues.length - 1);
};
