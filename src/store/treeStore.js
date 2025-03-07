import { create } from "zustand";
import { gsap } from "gsap";
import {
  safeCloneTree,
  updateParentReferences,
  prepareForLayout,
} from "../utils/treeUtils";

const useTreeStore = create((set, get) => ({
  tree: null,
  visitedNodes: [],
  currentNode: null,
  traversalSpeed: 1000,
  timeline: null,
  searchPath: [], // Add this to track BST search path
  searchFound: null, // Add this to track if value was found
  bstTargetValue: null, // Add this to track search/insert value

  // Create a proper binary tree node
  createNode: (value) => {
    return {
      value,
      left: null,
      right: null,
      x: 0,
      y: 0,
      level: 0,
    };
  },

  // Create a sample binary search tree for testing
  createSampleTree: () => {
    // Create a basic binary search tree for testing
    const root = get().createNode(20);
    root.left = get().createNode(10);
    root.right = get().createNode(30);
    root.left.left = get().createNode(5);
    root.left.right = get().createNode(15);
    root.right.left = get().createNode(25);
    root.right.right = get().createNode(35);

    set({ tree: root });

    return root;
  },

  // Insert a value into the binary search tree
  insertNode: (value) => {
    const { tree } = get();

    // Create new node
    const newNode = get().createNode(value);

    // If tree is empty, set new node as root
    if (!tree) {
      set({ tree: newNode });
      return;
    }

    // Insert into existing tree
    const insert = (node, newNode) => {
      if (newNode.value < node.value) {
        if (node.left === null) {
          node.left = newNode;
        } else {
          insert(node.left, newNode);
        }
      } else {
        if (node.right === null) {
          node.right = newNode;
        } else {
          insert(node.right, newNode);
        }
      }
    };

    // Create a deep copy of the tree to avoid direct mutations
    const updatedTree = JSON.parse(JSON.stringify(tree));
    insert(updatedTree, newNode);

    set({ tree: updatedTree });
  },

  setTree: (tree) => set({ tree }),
  setVisitedNodes: (nodes) => set({ visitedNodes: nodes }),
  setCurrentNode: (node) => set({ currentNode: node }),
  setTraversalSpeed: (speed) => set({ traversalSpeed: speed }),

  resetVisualization: () => {
    const { tree, timeline } = get();
    set({
      visitedNodes: [],
      currentNode: null,
      isPlaying: false,
      isPaused: false,
    });

    // Kill the timeline if it exists
    if (timeline) {
      timeline.kill();
      set({ timeline: null });
    }
  },

  isPlaying: false,
  isPaused: false,
  traversalType: "inorder", // 'inorder', 'preorder', 'postorder', 'levelorder'

  setTraversalType: (type) => set({ traversalType: type }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setIsPaused: (isPaused) => set({ isPaused }),

  traversalProgress: 0,
  traversalTotal: 0,

  startTraversal: async () => {
    const { tree, traversalType, traversalSpeed } = get();

    // Reset state
    set({
      isPlaying: true,
      isPaused: false,
      visitedNodes: [],
      currentNode: null,
      traversalProgress: 0,
      traversalTotal: 0,
    });

    // First count total nodes to track progress
    let totalNodes = 0;
    const countNodes = (node) => {
      if (!node) return;
      totalNodes++;
      if (node.left) countNodes(node.left);
      if (node.right) countNodes(node.right);
    };
    countNodes(tree);
    set({ traversalTotal: totalNodes });

    // Define traversal functions with better animations
    const traversalFunctions = {
      inorder: async (node) => {
        if (!node || get().isPaused) return;

        // Animate traversal down left
        if (node.left) {
          set({ currentNode: node.value });
          await new Promise((r) => setTimeout(r, traversalSpeed / 3));
          await traversalFunctions.inorder(node.left);
        }

        // Process current node with animation
        await new Promise((r) => setTimeout(r, traversalSpeed));
        set((state) => ({
          visitedNodes: [...state.visitedNodes, node.value],
          currentNode: node.value,
          traversalProgress: state.traversalProgress + 1,
        }));

        // Animate traversal down right
        if (node.right) {
          set({ currentNode: node.value });
          await new Promise((r) => setTimeout(r, traversalSpeed / 3));
          await traversalFunctions.inorder(node.right);
        }
      },

      // Enhanced animations for other traversal types
      preorder: async (node) => {
        if (!node || get().isPaused) return;

        // Visit root first
        await new Promise((r) => setTimeout(r, traversalSpeed));
        set((state) => ({
          visitedNodes: [...state.visitedNodes, node.value],
          currentNode: node.value,
          traversalProgress: state.traversalProgress + 1,
        }));
        if (node.left) {
          set({ currentNode: node.value });
          await new Promise((r) => setTimeout(r, traversalSpeed / 3));
          await traversalFunctions.preorder(node.left);
        }
        if (node.right) {
          set({ currentNode: node.value });
          await new Promise((r) => setTimeout(r, traversalSpeed / 3));
          await traversalFunctions.preorder(node.right);
        }
      },
      postorder: async (node) => {
        if (!node || get().isPaused) return;
        if (node.left) {
          set({ currentNode: node.value });
          await new Promise((r) => setTimeout(r, traversalSpeed / 3));
          await traversalFunctions.postorder(node.left);
        }
        if (node.right) {
          set({ currentNode: node.value });
          await new Promise((r) => setTimeout(r, traversalSpeed / 3));
          await traversalFunctions.postorder(node.right);
        }
        await new Promise((r) => setTimeout(r, traversalSpeed));
        set((state) => ({
          visitedNodes: [...state.visitedNodes, node.value],
          currentNode: node.value,
          traversalProgress: state.traversalProgress + 1,
        }));
      },
      levelorder: async (root) => {
        if (!root) return;
        const queue = [root];
        while (queue.length > 0 && !get().isPaused) {
          const node = queue.shift();
          await new Promise((r) => setTimeout(r, traversalSpeed));
          set((state) => ({
            visitedNodes: [...state.visitedNodes, node.value],
            currentNode: node.value,
            traversalProgress: state.traversalProgress + 1,
          }));
          if (node.left) queue.push(node.left);
          if (node.right) queue.push(node.right);
        }
      },
    };

    try {
      const timeline = gsap.timeline();
      set({ timeline: timeline }); // Store timeline in state

      await traversalFunctions[traversalType](tree);
      timeline.to(".tree-node circle", {
        keyframes: [
          { scale: 1.1, duration: 0.2 },
          { scale: 1, duration: 0.2 },
        ],
        stagger: 0.05,
        ease: "power2.inOut",
      });
      set({ isPlaying: false, currentNode: null });
    } catch (error) {
      console.error("Traversal error:", error);
      set({ isPlaying: false, isPaused: false });
    }
  },

  pauseTraversal: () => {
    const { timeline } = get();
    if (timeline) {
      timeline.pause();
    }
    set({ isPlaying: false, isPaused: true });
  },

  resumeTraversal: () => {
    const { timeline } = get();
    if (timeline) {
      timeline.resume();
    }
    set({ isPlaying: true, isPaused: false });
  },

  // Calculate positions for tree visualization
  calculateTreeLayout: (tree) => {
    if (!tree) return null;

    // First prepare tree for layout by removing parent references
    const preparedTree = prepareForLayout(tree);

    // First pass: calculate tree depth and width
    const getDepth = (node) => {
      if (!node) return 0;
      return Math.max(getDepth(node.left), getDepth(node.right)) + 1;
    };

    const treeDepth = getDepth(preparedTree);

    // Second pass: assign x and y coordinates with better spacing
    const nodeWidth = 85; // Slightly increased for better visibility
    const levelHeight = 100; // Height between levels

    const assignCoordinates = (
      node,
      level = 0,
      leftPos = 0,
      rightPos = Math.pow(2, treeDepth) - 1
    ) => {
      if (!node) return;

      const mid = Math.floor((leftPos + rightPos) / 2);
      node.x = mid * nodeWidth;
      node.y = level * levelHeight;
      node.level = level;

      // Recursively assign positions to children
      if (node.left) assignCoordinates(node.left, level + 1, leftPos, mid - 1);
      if (node.right)
        assignCoordinates(node.right, level + 1, mid + 1, rightPos);

      return node;
    };

    // Assign coordinates without modifying the original tree
    const layoutTree = assignCoordinates(preparedTree);

    return layoutTree;
  },

  // Prepare tree for visualization
  prepareTreeVisualization: () => {
    const { tree } = get();
    if (!tree) return;

    const layoutTree = get().calculateTreeLayout(tree);
    set({ tree: layoutTree });
  },

  resetTraversal: () => {
    const { timeline } = get();
    // Kill the timeline if it exists
    if (timeline) {
      timeline.kill();
      set({ timeline: null });
    }
    set({
      visitedNodes: [],
      currentNode: null,
      isPlaying: false,
      isPaused: false,
    });
  },

  // Initialize or update tree with layout information
  setTreeWithLayout: (newTree) => {
    if (!newTree) {
      set({ tree: null });
      return;
    }
    const layoutTree = get().calculateTreeLayout(newTree);
    console.log("Tree with layout:", layoutTree); // For debugging
    set({ tree: layoutTree });
  },

  // Debug function to check tree structure
  debugTree: () => {
    console.log("Current tree structure:", JSON.stringify(get().tree, null, 2));
  },

  searchBST: async (value) => {
    const { tree, traversalSpeed } = get();
    set({
      searchPath: [],
      searchFound: null,
      bstTargetValue: value,
      currentNode: null,
      visitedNodes: [], // Clear visited nodes
    });

    const search = async (node) => {
      if (!node) return null;

      // Update visited nodes and current node
      set((state) => ({
        visitedNodes: [...state.visitedNodes, node.value],
        currentNode: node.value,
        searchPath: [...state.searchPath, node.value],
      }));

      await new Promise((r) => setTimeout(r, traversalSpeed));

      if (value === node.value) {
        set({ searchFound: true });
        return node;
      }

      if (value < node.value) {
        const result = await search(node.left);
        if (result) return result;
      } else {
        const result = await search(node.right);
        if (result) return result;
      }

      return null;
    };

    const result = await search(tree);
    set({ searchFound: result !== null });
  },

  insertBST: async (value) => {
    const { tree, traversalSpeed } = get();
    set({
      searchPath: [],
      searchFound: null,
      bstTargetValue: value,
      currentNode: null,
      visitedNodes: [],
    });

    const insert = async (node) => {
      if (!node) {
        const newNode = get().createNode(value);
        set({ searchFound: true });
        return newNode;
      }

      set((state) => ({
        visitedNodes: [...state.visitedNodes, node.value],
        currentNode: node.value,
        searchPath: [...state.searchPath, node.value],
      }));
      await new Promise((r) => setTimeout(r, traversalSpeed));

      if (value < node.value) {
        node.left = await insert(node.left);
      } else if (value > node.value) {
        node.right = await insert(node.right);
      } else {
        set({ searchFound: false }); // Value already exists
        return node;
      }
      return node;
    };

    const updatedTree = await insert(tree);
    // Recalculate layout after insertion
    const layoutTree = get().calculateTreeLayout(updatedTree);
    set({ tree: layoutTree });
  },

  // AVL Tree specific functions
  createAVLNode: (value) => {
    return {
      value,
      left: null,
      right: null,
      height: 1, // Height of a new node is 1
      x: 0,
      y: 0,
      level: 0,
    };
  },

  // Get height of AVL node
  getHeight: (node) => {
    if (node === null) return 0;
    return node.height;
  },

  // Get balance factor of AVL node
  getBalanceFactor: (node) => {
    if (node === null) return 0;
    return get().getHeight(node.left) - get().getHeight(node.right);
  },

  // Right rotation for AVL rebalancing
  rightRotate: (y) => {
    const x = y.left;
    const T2 = x.right;

    // Perform rotation
    x.right = y;
    y.left = T2;

    // Update heights
    y.height = Math.max(get().getHeight(y.left), get().getHeight(y.right)) + 1;
    x.height = Math.max(get().getHeight(x.left), get().getHeight(x.right)) + 1;

    // Return new root
    return x;
  },

  // Left rotation for AVL rebalancing
  leftRotate: (x) => {
    const y = x.right;
    const T2 = y.left;

    // Perform rotation
    y.left = x;
    x.right = T2;

    // Update heights
    x.height = Math.max(get().getHeight(x.left), get().getHeight(x.right)) + 1;
    y.height = Math.max(get().getHeight(y.left), get().getHeight(y.right)) + 1;

    // Return new root
    return y;
  },

  // Convert any tree node to AVL node (ensure height property)
  convertToAVLNode: (node) => {
    if (!node) return null;

    // If it's not already an AVL node (with height), convert it
    if (node.height === undefined) {
      node.height = 1;

      // Recursively convert child nodes
      if (node.left) {
        node.left = get().convertToAVLNode(node.left);
      }
      if (node.right) {
        node.right = get().convertToAVLNode(node.right);
      }

      // Update height based on children
      node.height =
        1 + Math.max(get().getHeight(node.left), get().getHeight(node.right));
    }

    return node;
  },

  // Create a sample AVL tree
  createSampleAVL: () => {
    // Create a basic AVL tree for testing (already balanced)
    const root = get().createAVLNode(15);
    root.left = get().createAVLNode(10);
    root.right = get().createAVLNode(20);
    root.left.left = get().createAVLNode(5);
    root.left.right = get().createAVLNode(12);
    root.right.left = get().createAVLNode(17);
    root.right.right = get().createAVLNode(25);

    // Update heights
    root.left.height = 2;
    root.right.height = 2;
    root.height = 3;

    // Calculate proper layout
    const layoutTree = get().calculateTreeLayout(root);
    set({ tree: layoutTree });
    return layoutTree;
  },

  // Insert a node into AVL tree with balancing
  insertAVL: async (value) => {
    const { traversalSpeed } = get();
    // Make sure we're working with an AVL tree by converting if needed
    let tree = get().tree;
    if (tree && tree.height === undefined) {
      tree = get().convertToAVLNode(JSON.parse(JSON.stringify(tree)));
    }

    // Store the old tree for animation comparison
    const oldTree = JSON.parse(JSON.stringify(tree));

    set({
      tree, // Set the converted tree
      searchPath: [],
      searchFound: null,
      bstTargetValue: value,
      currentNode: null,
      visitedNodes: [],
    });

    const insert = async (node) => {
      // Regular BST insert
      if (node === null) {
        const newNode = get().createAVLNode(value);
        set({ searchFound: true });
        return newNode;
      }

      set((state) => ({
        visitedNodes: [...state.visitedNodes, node.value],
        currentNode: node.value,
        searchPath: [...state.searchPath, node.value],
      }));
      await new Promise((r) => setTimeout(r, traversalSpeed));

      if (value < node.value) {
        node.left = await insert(node.left);
      } else if (value > node.value) {
        node.right = await insert(node.right);
      } else {
        set({ searchFound: false }); // Value already exists
        return node;
      }

      // Ensure node has height property (defensive)
      if (node.height === undefined) {
        node.height = 1;
      }

      // Update height of current node
      node.height =
        Math.max(get().getHeight(node.left), get().getHeight(node.right)) + 1;

      // Get balance factor to check if rebalancing is needed
      const balance = get().getBalanceFactor(node);

      // Left Left Case
      if (balance > 1 && value < node.left.value) {
        return get().rightRotate(node);
      }

      // Right Right Case
      if (balance < -1 && value > node.right.value) {
        return get().leftRotate(node);
      }

      // Left Right Case
      if (balance > 1 && value > node.left.value) {
        node.left = get().leftRotate(node.left);
        return get().rightRotate(node);
      }

      // Right Left Case
      if (balance < -1 && value < node.right.value) {
        node.right = get().rightRotate(node.right);
        return get().leftRotate(node);
      }

      // Return the unchanged node if no rotation was needed
      return node;
    };

    const updatedTree = await insert(tree);

    // Create a smooth transition by setting up animation
    gsap.to(".tree-node", {
      opacity: 0.7,
      scale: 0.9,
      duration: 0.3,
      ease: "power2.out",
    });

    // Short pause to show the change
    await new Promise((r) => setTimeout(r, 100));

    // Recalculate layout after insertion
    const layoutTree = get().calculateTreeLayout(updatedTree);
    set({ tree: layoutTree });
  },

  // Delete a node from AVL tree with rebalancing
  deleteAVL: async (value) => {
    const { traversalSpeed } = get();

    // Make sure we're working with an AVL tree by converting if needed
    let tree = get().tree;
    if (tree && tree.height === undefined) {
      tree = get().convertToAVLNode(JSON.parse(JSON.stringify(tree)));
    }

    set({
      tree, // Set the converted tree
      searchPath: [],
      searchFound: null,
      bstTargetValue: value,
      currentNode: null,
      visitedNodes: [],
    });

    // Node found flag
    let nodeFound = false;

    const minValueNode = (node) => {
      let current = node;
      while (current && current.left !== null) {
        current = current.left;
      }
      return current;
    };

    const deleteNode = async (node, valueToDelete) => {
      if (node === null) {
        return null;
      }

      // Update visited nodes for visualization
      set((state) => ({
        visitedNodes: [...state.visitedNodes, node.value],
        currentNode: node.value,
        searchPath: [...state.searchPath, node.value],
      }));
      await new Promise((r) => setTimeout(r, traversalSpeed));

      // Regular BST delete
      if (valueToDelete < node.value) {
        node.left = await deleteNode(node.left, valueToDelete);
      } else if (valueToDelete > node.value) {
        node.right = await deleteNode(node.right, valueToDelete);
      } else {
        // Node with the target value found
        nodeFound = true;

        // Node with only one child or no child
        if (node.left === null) {
          return node.right;
        } else if (node.right === null) {
          return node.left;
        }

        // Node with two children: Get the inorder successor (smallest in right subtree)
        const successor = minValueNode(node.right);

        // Copy the successor's value to this node
        node.value = successor.value;

        // Delete the successor (which has at most one child)
        node.right = await deleteNode(node.right, successor.value);
      }

      // If tree had only one node that was deleted, return null
      if (node === null) return null;

      // Update height of current node
      node.height =
        1 + Math.max(get().getHeight(node.left), get().getHeight(node.right));

      // Get balance factor to check if rebalancing is needed
      const balance = get().getBalanceFactor(node);

      // Left Left Case
      if (balance > 1 && get().getBalanceFactor(node.left) >= 0) {
        return get().rightRotate(node);
      }

      // Left Right Case
      if (balance > 1 && get().getBalanceFactor(node.left) < 0) {
        node.left = get().leftRotate(node.left);
        return get().rightRotate(node);
      }

      // Right Right Case
      if (balance < -1 && get().getBalanceFactor(node.right) <= 0) {
        return get().leftRotate(node);
      }

      // Right Left Case
      if (balance < -1 && get().getBalanceFactor(node.right) > 0) {
        node.right = get().rightRotate(node.right);
        return get().leftRotate(node);
      }

      return node;
    };

    try {
      // Call the delete function with our tree and the value to delete
      const updatedTree = await deleteNode(tree, value);

      // Set searchFound based on whether the node was found
      set({ searchFound: nodeFound });

      if (nodeFound) {
        // Create a smooth transition animation
        gsap.to(".tree-node", {
          opacity: 0.7,
          scale: 0.9,
          duration: 0.3,
          ease: "power2.out",
        });

        // Short pause to show the change
        await new Promise((r) => setTimeout(r, 100));

        // Recalculate layout after deletion and update the tree
        const layoutTree = get().calculateTreeLayout(updatedTree);
        set({ tree: layoutTree });
      }
    } catch (error) {
      console.error("Error deleting node:", error);
      set({ searchFound: false });
    }
  },

  // Function to update tree state (used to refresh visualization)
  updateTreeState: () => {
    const { tree } = get();
    if (!tree) return;
    const layoutTree = get().calculateTreeLayout(
      JSON.parse(JSON.stringify(tree))
    );
    set({ tree: layoutTree });
  },

  // Add BST delete function if it doesn't exist
  deleteBST: async (value) => {
    const { tree, traversalSpeed } = get();

    set({
      searchPath: [],
      searchFound: null,
      bstTargetValue: value,
      currentNode: null,
      visitedNodes: [],
    });

    // Node found flag
    let nodeFound = false;

    const minValueNode = (node) => {
      let current = node;
      while (current && current.left !== null) {
        current = current.left;
      }
      return current;
    };

    const deleteNode = async (node, valueToDelete) => {
      if (node === null) return null;

      // Update visited nodes for visualization
      set((state) => ({
        visitedNodes: [...state.visitedNodes, node.value],
        currentNode: node.value,
        searchPath: [...state.searchPath, node.value],
      }));
      await new Promise((r) => setTimeout(r, traversalSpeed));

      // Standard BST delete
      if (valueToDelete < node.value) {
        node.left = await deleteNode(node.left, valueToDelete);
      } else if (valueToDelete > node.value) {
        node.right = await deleteNode(node.right, valueToDelete);
      } else {
        // Node with the value found
        nodeFound = true;

        // Node with only one child or no child
        if (node.left === null) {
          return node.right;
        } else if (node.right === null) {
          return node.left;
        }

        // Node with two children: Get the inorder successor
        const successor = minValueNode(node.right);

        // Copy the successor's value to this node
        node.value = successor.value;

        // Delete the inorder successor
        node.right = await deleteNode(node.right, successor.value);
      }
      return node;
    };

    try {
      const updatedTree = await deleteNode(tree, value);

      // Set searchFound based on whether the node was found
      set({ searchFound: nodeFound });

      if (nodeFound) {
        // Create a smooth transition animation
        gsap.to(".tree-node", {
          opacity: 0.7,
          scale: 0.9,
          duration: 0.3,
          ease: "power2.out",
        });

        // Short pause to show the change
        await new Promise((r) => setTimeout(r, 100));

        // Recalculate layout after deletion
        const layoutTree = get().calculateTreeLayout(updatedTree);
        set({ tree: layoutTree });
      }
    } catch (error) {
      console.error("Error deleting node:", error);
      set({ searchFound: false });
    }
  },

  // Red-Black Tree specific functions
  createRBNode: (value) => {
    return {
      value,
      left: null,
      right: null,
      color: "RED", // New nodes are always RED
      parent: null, // RB trees need parent pointers for rebalancing
      x: 0,
      y: 0,
      level: 0,
    };
  },

  // Create a sample Red-Black tree
  createSampleRB: () => {
    // Create a basic Red-Black tree for demonstration
    const root = get().createRBNode(20);
    root.color = "BLACK"; // Root is always black

    // Left subtree
    root.left = get().createRBNode(10);
    root.left.parent = root;
    root.left.color = "BLACK";

    root.left.left = get().createRBNode(5);
    root.left.left.parent = root.left;

    root.left.right = get().createRBNode(15);
    root.left.right.parent = root.left;

    // Right subtree
    root.right = get().createRBNode(30);
    root.right.parent = root;
    root.right.color = "BLACK";

    root.right.left = get().createRBNode(25);
    root.right.left.parent = root.right;

    root.right.right = get().createRBNode(40);
    root.right.right.parent = root.right;

    // Update all parent references
    updateParentReferences(root);

    // Calculate layout
    const layoutTree = get().calculateTreeLayout(root);
    set({ tree: layoutTree });
    return layoutTree;
  },

  // RB Tree Helper Functions
  isRed: (node) => {
    if (!node) return false; // Null nodes are BLACK
    return node.color === "RED";
  },

  // Left rotation with color management
  rbLeftRotate: (x) => {
    const y = x.right;
    x.right = y.left;

    if (y.left) y.left.parent = x;
    y.parent = x.parent;

    if (!x.parent) {
      // x was root
    } else if (x === x.parent.left) {
      x.parent.left = y;
    } else {
      x.parent.right = y;
    }

    y.left = x;
    x.parent = y;
    return y;
  },

  // Right rotation with color management
  rbRightRotate: (y) => {
    const x = y.left;
    y.left = x.right;

    if (x.right) x.right.parent = y;
    x.parent = y.parent;

    if (!y.parent) {
      // y was root
    } else if (y === y.parent.right) {
      y.parent.right = x;
    } else {
      y.parent.left = x;
    }

    x.right = y;
    y.parent = x;
    return x;
  },

  // Fix Red-Black Tree properties after insertion
  fixInsertRB: (root, node) => {
    let parent = null;
    let grandParent = null;

    // Keep going until we reach root or find no red-red conflict
    while (node !== root && get().isRed(node) && get().isRed(node.parent)) {
      parent = node.parent;
      grandParent = parent.parent;

      // Case A: Parent is left child of grandparent
      if (parent === grandParent.left) {
        const uncle = grandParent.right;

        // Case 1: Uncle is also red - only recoloring needed
        if (get().isRed(uncle)) {
          grandParent.color = "RED";
          parent.color = "BLACK";
          uncle.color = "BLACK";
          node = grandParent; // Move up the tree
        } else {
          // Case 2: Node is right child - left rotation needed
          if (node === parent.right) {
            get().rbLeftRotate(parent);
            node = parent;
            parent = node.parent;
          }

          // Case 3: Node is left child - right rotation needed
          get().rbRightRotate(grandParent);
          // Swap colors of parent and grandparent
          const tempColor = parent.color;
          parent.color = grandParent.color;
          grandParent.color = tempColor;
          node = parent; // Move up the tree
        }
      }
      // Case B: Parent is right child of grandparent
      else {
        const uncle = grandParent.left;

        // Case 1: Uncle is also red - only recoloring needed
        if (get().isRed(uncle)) {
          grandParent.color = "RED";
          parent.color = "BLACK";
          uncle.color = "BLACK";
          node = grandParent; // Move up the tree
        } else {
          // Case 2: Node is left child - right rotation needed
          if (node === parent.left) {
            get().rbRightRotate(parent);
            node = parent;
            parent = node.parent;
          }

          // Case 3: Node is right child - left rotation needed
          get().rbLeftRotate(grandParent);
          // Swap colors of parent and grandparent
          const tempColor = parent.color;
          parent.color = grandParent.color;
          grandParent.color = tempColor;
          node = parent; // Move up the tree
        }
      }
    }

    // Ensure root is black
    root.color = "BLACK";
    return root;
  },

  // Insert into Red-Black Tree
  insertRB: async (value) => {
    const { traversalSpeed } = get();
    let tree = get().tree;

    // Reset visualization state
    set({
      searchPath: [],
      searchFound: null,
      bstTargetValue: value,
      currentNode: null,
      visitedNodes: [],
    });

    const insertNode = async (root, node) => {
      // Standard BST insert
      if (root === null) {
        set({ searchFound: true });
        return node;
      }

      // Update visualization state
      set((state) => ({
        visitedNodes: [...state.visitedNodes, root.value],
        currentNode: root.value,
        searchPath: [...state.searchPath, root.value],
      }));
      await new Promise((r) => setTimeout(r, traversalSpeed));

      // Recursive insert
      if (node.value < root.value) {
        root.left = await insertNode(root.left, node);
        root.left.parent = root;
      } else if (node.value > root.value) {
        root.right = await insertNode(root.right, node);
        root.right.parent = root;
      } else {
        // Value already exists
        set({ searchFound: false });
        return root;
      }

      return root;
    };

    // Create new node
    const newNode = get().createRBNode(value);

    // Do the standard BST insertion first
    if (tree === null) {
      newNode.color = "BLACK"; // Root is always black
      set({
        tree: newNode,
        searchFound: true,
      });
      return;
    }

    tree = await insertNode(tree, newNode);

    // Fix Red-Black properties
    tree = get().fixInsertRB(tree, newNode);

    // Animate the transition
    gsap.to(".tree-node", {
      opacity: 0.7,
      scale: 0.9,
      duration: 0.3,
      ease: "power2.out",
    });

    // Short pause to show the change
    await new Promise((r) => setTimeout(r, 100));

    // Use a safe tree preparation for layout calculation
    const layoutTree = get().calculateTreeLayout(tree);

    // Create a new tree object to avoid issues with circular references
    const newTree = safeCloneTree(tree);
    set({ tree: layoutTree });
  },

  // Delete from Red-Black Tree (simplified version)
  deleteRB: async (value) => {
    const { tree, traversalSpeed } = get();

    // Reset visualization state
    set({
      searchPath: [],
      searchFound: null,
      bstTargetValue: value,
      currentNode: null,
      visitedNodes: [],
    });

    let nodeFound = false;

    // Find and delete the node (simplified for visualization purposes)
    const deleteNode = async (node, valueToDelete) => {
      if (node === null) return null;

      // Update visualization state
      set((state) => ({
        visitedNodes: [...state.visitedNodes, node.value],
        currentNode: node.value,
        searchPath: [...state.searchPath, node.value],
      }));
      await new Promise((r) => setTimeout(r, traversalSpeed));

      // Standard BST delete logic
      if (valueToDelete < node.value) {
        node.left = await deleteNode(node.left, valueToDelete);
        if (node.left) node.left.parent = node;
      } else if (valueToDelete > node.value) {
        node.right = await deleteNode(node.right, valueToDelete);
        if (node.right) node.right.parent = node;
      } else {
        // Node found
        nodeFound = true;

        // Handle leaf node or node with one child
        if (node.left === null) {
          return node.right;
        } else if (node.right === null) {
          return node.left;
        }

        // Node with two children
        // Find successor (smallest in right subtree)
        let successor = node.right;
        while (successor.left) {
          successor = successor.left;
        }

        // Copy value
        node.value = successor.value;

        // Delete successor
        node.right = await deleteNode(node.right, successor.value);
        if (node.right) node.right.parent = node;
      }

      return node;
    };

    try {
      // Delete the node
      const updatedTree = await deleteNode(tree, value);
      set({ searchFound: nodeFound });

      if (nodeFound) {
        // Animate the transition
        gsap.to(".tree-node", {
          opacity: 0.7,
          scale: 0.9,
          duration: 0.3,
          ease: "power2.out",
        });

        // Short pause
        await new Promise((r) => setTimeout(r, 100));

        // Update the tree with new layout, handling parent references safely
        const layoutTree = get().calculateTreeLayout(updatedTree);
        set({ tree: layoutTree });
      }
    } catch (error) {
      console.error("Error deleting from RB tree:", error);
      set({ searchFound: false });
    }
  },

  // Create a sample Red-Black tree
  createSampleRB: () => {
    // Create a basic Red-Black tree for demonstration
    const root = get().createRBNode(20);
    root.color = "BLACK"; // Root is always black

    // Left subtree
    root.left = get().createRBNode(10);
    root.left.color = "BLACK";

    root.left.left = get().createRBNode(5);

    root.left.right = get().createRBNode(15);

    // Right subtree
    root.right = get().createRBNode(30);
    root.right.color = "BLACK";

    root.right.left = get().createRBNode(25);

    root.right.right = get().createRBNode(40);

    // Update all parent references
    updateParentReferences(root);

    // Calculate layout
    const layoutTree = get().calculateTreeLayout(root);
    set({ tree: layoutTree });
    return layoutTree;
  },
}));

export default useTreeStore;
