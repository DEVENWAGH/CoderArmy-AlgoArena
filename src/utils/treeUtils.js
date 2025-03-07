/**
 * Safely clone a tree with circular references
 * This function creates a deep copy of a tree while handling circular references like parent pointers
 */
export const safeCloneTree = (tree) => {
  if (!tree) return null;

  // Create a map to track already cloned nodes
  const cloneMap = new Map();

  // Inner recursive function to clone nodes
  const cloneNode = (node) => {
    if (!node) return null;

    // Return already cloned instance if this node was processed before
    if (cloneMap.has(node)) {
      return cloneMap.get(node);
    }

    // Create a new node with primitive properties
    const newNode = {
      value: node.value,
      color: node.color,
      x: node.x,
      y: node.y,
      level: node.level,
      height: node.height,
    };

    // Add to map before recursively cloning children to handle circular references
    cloneMap.set(node, newNode);

    // Clone left and right children
    newNode.left = cloneNode(node.left);
    newNode.right = cloneNode(node.right);

    // Handle parent reference safely
    if (node.parent) {
      // If parent exists, get the cloned parent or create a minimal reference
      // to avoid deep recursion into the parent's structure
      newNode.parent = cloneMap.get(node.parent) || {
        value: node.parent.value,
      };
    } else {
      newNode.parent = null;
    }

    return newNode;
  };

  return cloneNode(tree);
};

/**
 * Update parent references throughout the tree
 * This ensures parent references are correct after tree manipulations
 */
export const updateParentReferences = (node) => {
  if (!node) return;

  if (node.left) {
    node.left.parent = node;
    updateParentReferences(node.left);
  }

  if (node.right) {
    node.right.parent = node;
    updateParentReferences(node.right);
  }
};

/**
 * Prepare a tree for layout calculation by removing parent references
 * to avoid circular references during JSON operations
 */
export const prepareForLayout = (tree) => {
  if (!tree) return null;

  const traverse = (node) => {
    if (!node) return null;

    const newNode = { ...node };
    delete newNode.parent; // Remove parent reference

    if (node.left) newNode.left = traverse(node.left);
    if (node.right) newNode.right = traverse(node.right);

    return newNode;
  };

  return traverse(tree);
};
