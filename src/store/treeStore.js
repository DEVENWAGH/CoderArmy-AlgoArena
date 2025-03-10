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
  traversalSpeed: 300, // Set default traversal speed to 300ms for smoother animations
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

  // Improved traversal functions for smoother animations and better visualization
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

    // Enhanced traversal functions with improved animations
    const traversalFunctions = {
      inorder: async (node) => {
        if (!node || get().isPaused) return;

        // Highlight current node as being processed
        set({ currentNode: node.value });
        await new Promise((r) => setTimeout(r, traversalSpeed / 3));

        // Process left subtree
        if (node.left) {
          await traversalFunctions.inorder(node.left);

          // Return focus to current node when coming back up
          set({ currentNode: node.value });
          await new Promise((r) => setTimeout(r, traversalSpeed / 5));
        }

        // Process current node with animation
        await new Promise((r) => setTimeout(r, traversalSpeed));
        set((state) => ({
          visitedNodes: [...state.visitedNodes, node.value],
          currentNode: node.value,
          traversalProgress: state.traversalProgress + 1,
        }));

        // Process right subtree
        if (node.right) {
          await new Promise((r) => setTimeout(r, traversalSpeed / 5));
          await traversalFunctions.inorder(node.right);
        }
      },

      preorder: async (node) => {
        if (!node || get().isPaused) return;

        // Visit root first - this is the key characteristic of preorder
        set({ currentNode: node.value });
        await new Promise((r) => setTimeout(r, traversalSpeed));
        set((state) => ({
          visitedNodes: [...state.visitedNodes, node.value],
          currentNode: node.value,
          traversalProgress: state.traversalProgress + 1,
        }));

        // Process left subtree
        if (node.left) {
          await new Promise((r) => setTimeout(r, traversalSpeed / 4));
          await traversalFunctions.preorder(node.left);
        }

        // Process right subtree after left is complete
        if (node.right) {
          // Return focus to current node briefly to show traversal path
          set({ currentNode: node.value });
          await new Promise((r) => setTimeout(r, traversalSpeed / 5));
          await traversalFunctions.preorder(node.right);
        }
      },

      postorder: async (node) => {
        if (!node || get().isPaused) return;

        // Highlight node to show we're processing it
        set({ currentNode: node.value });
        await new Promise((r) => setTimeout(r, traversalSpeed / 3));

        // Process left subtree first
        if (node.left) {
          await traversalFunctions.postorder(node.left);
        }

        // Process right subtree second
        if (node.right) {
          // Show we're at current node before going right
          set({ currentNode: node.value });
          await new Promise((r) => setTimeout(r, traversalSpeed / 5));
          await traversalFunctions.postorder(node.right);
        }

        // Visit current node last - key characteristic of postorder
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
        const levels = [[root]]; // Track nodes by level for better visualization
        const nodeToLevel = { [root.value]: 0 }; // Map node values to their levels

        // First identify all levels for better visualization
        let currentLevel = 0;
        while (queue.length > 0) {
          const levelSize = queue.length;
          const nextLevel = currentLevel + 1;

          for (let i = 0; i < levelSize; i++) {
            const node = queue.shift();

            if (node.left) {
              queue.push(node.left);
              nodeToLevel[node.left.value] = nextLevel;
              if (!levels[nextLevel]) levels[nextLevel] = [];
              levels[nextLevel].push(node.left);
            }

            if (node.right) {
              queue.push(node.right);
              nodeToLevel[node.right.value] = nextLevel;
              if (!levels[nextLevel]) levels[nextLevel] = [];
              levels[nextLevel].push(node.right);
            }
          }

          currentLevel = nextLevel;
        }

        // Now process level by level with animations
        for (let i = 0; i < levels.length; i++) {
          const levelNodes = levels[i];

          // Highlight entire level first
          for (const node of levelNodes) {
            set({ currentNode: node.value });
            await new Promise((r) => setTimeout(r, 100));
          }

          // Then process each node in the level
          for (const node of levelNodes) {
            if (get().isPaused) return;
            set({ currentNode: node.value });
            await new Promise((r) => setTimeout(r, traversalSpeed));

            set((state) => ({
              visitedNodes: [...state.visitedNodes, node.value],
              traversalProgress: state.traversalProgress + 1,
            }));
          }
        }
      },
    };

    try {
      const timeline = gsap.timeline();
      set({ timeline: timeline });

      await traversalFunctions[traversalType](tree);

      // Completion animation
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

    // Remove animation transition - just update the tree directly
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
    // Create a proper Red-Black tree for demonstration
    const root = get().createRBNode(20);
    root.color = "BLACK"; // Root is always black

    // Left subtree
    root.left = get().createRBNode(10);
    root.left.color = "BLACK";
    root.left.parent = root;

    root.left.left = get().createRBNode(5);
    root.left.left.parent = root.left;
    root.left.left.color = "RED";

    root.left.right = get().createRBNode(15);
    root.left.right.parent = root.left;
    root.left.right.color = "RED";

    // Right subtree
    root.right = get().createRBNode(30);
    root.right.color = "BLACK";
    root.right.parent = root;

    root.right.left = get().createRBNode(25);
    root.right.left.parent = root.right;
    root.right.left.color = "RED";

    root.right.right = get().createRBNode(40);
    root.right.right.parent = root.right;
    root.right.right.color = "RED";

    // Update parent references to ensure consistency
    updateParentReferences(root);

    // Calculate layout
    const layoutTree = get().calculateTreeLayout(root);
    return layoutTree;
  },

  // RB Tree Helper Functions
  isRed: (node) => {
    if (!node) return false; // Null nodes are BLACK
    return node.color === "RED";
  },

  // Left rotation with color management
  rbLeftRotate: (tree, x) => {
    // Store y
    const y = x.right;

    // Turn y's left subtree into x's right subtree
    x.right = y.left;

    // Update parent pointer of y's left child
    if (y.left !== null) {
      y.left.parent = x;
    }

    // Link x's parent to y
    y.parent = x.parent;

    // Handle root case
    if (x.parent === null) {
      tree = y;
    }
    // Handle x as left child
    else if (x === x.parent.left) {
      x.parent.left = y;
    }
    // Handle x as right child
    else {
      x.parent.right = y;
    }

    // Put x on y's left
    y.left = x;

    // Update x's parent
    x.parent = y;

    return tree; // Return the new root
  },

  // Right rotation with color management
  rbRightRotate: (tree, y) => {
    // Store x
    const x = y.left;

    // Turn x's right subtree into y's left subtree
    y.left = x.right;

    // Update parent pointer of x's right child
    if (x.right !== null) {
      x.right.parent = y;
    }

    // Link y's parent to x
    x.parent = y.parent;

    // Handle root case
    if (y.parent === null) {
      tree = x;
    }
    // Handle y as right child
    else if (y === y.parent.right) {
      y.parent.right = x;
    }
    // Handle y as left child
    else {
      y.parent.left = x;
    }

    // Put y on x's right
    x.right = y;

    // Update y's parent
    y.parent = x;

    return tree; // Return the new root
  },

  // Fix Red-Black Tree properties after insertion
  fixInsertRB: (tree, node) => {
    const isRed = get().isRed;
    const rbLeftRotate = get().rbLeftRotate;
    const rbRightRotate = get().rbRightRotate;

    // Keep fixing until reaching the root or until there's no red-red conflict
    while (node !== tree && node.parent !== null && isRed(node.parent)) {
      // If parent is a left child of grandparent
      if (node.parent.parent && node.parent === node.parent.parent.left) {
        const uncle = node.parent.parent.right;

        // Case 1: Uncle is red - just recolor
        if (uncle && isRed(uncle)) {
          node.parent.color = "BLACK";
          uncle.color = "BLACK";
          node.parent.parent.color = "RED";
          node = node.parent.parent;
        } else {
          // Case 2: Node is a right child - need left rotation first
          if (node === node.parent.right) {
            node = node.parent;
            tree = rbLeftRotate(tree, node);
          }

          // Case 3: Node is a left child - need right rotation
          if (node.parent && node.parent.parent) {
            node.parent.color = "BLACK";
            node.parent.parent.color = "RED";
            tree = rbRightRotate(tree, node.parent.parent);
          }
        }
      }
      // If parent is a right child of grandparent - mirror cases
      else if (node.parent.parent) {
        const uncle = node.parent.parent.left;

        // Case 1: Uncle is red - just recolor
        if (uncle && isRed(uncle)) {
          node.parent.color = "BLACK";
          uncle.color = "BLACK";
          node.parent.parent.color = "RED";
          node = node.parent.parent;
        } else {
          // Case 2: Node is a left child - need right rotation first
          if (node === node.parent.left) {
            node = node.parent;
            tree = rbRightRotate(tree, node);
          }

          // Case 3: Node is a right child - need left rotation
          if (node.parent && node.parent.parent) {
            node.parent.color = "BLACK";
            node.parent.parent.color = "RED";
            tree = rbLeftRotate(tree, node.parent.parent);
          }
        }
      }
    }

    // Root must be black
    tree.color = "BLACK";

    return tree;
  },

  // Fixed insertRB function with proper implementation
  insertRB: async (value) => {
    const { traversalSpeed } = get();
    let tree = get().tree;
    const isRed = get().isRed;

    // Reset visualization state
    set({
      searchPath: [],
      searchFound: null,
      bstTargetValue: value,
      currentNode: null,
      visitedNodes: [],
    });

    // Check if value already exists
    const valueExists = (node, val) => {
      if (!node) return false;
      if (node.value === val) return true;
      return val < node.value
        ? valueExists(node.left, val)
        : valueExists(node.right, val);
    };

    // If value already exists, don't insert
    if (valueExists(tree, value)) {
      set({ searchFound: false });
      return;
    }

    // Create new node
    const newNode = get().createRBNode(value);
    set({ searchFound: true });

    // If tree is empty, just set root as black and return
    if (!tree) {
      newNode.color = "BLACK";
      const layoutTree = get().calculateTreeLayout(newNode);
      set({ tree: layoutTree });
      return;
    }

    // Do BST insert first - with visualization
    const bstInsert = async (root, node) => {
      // Update visualization state
      set((state) => ({
        visitedNodes: [...state.visitedNodes, root.value],
        currentNode: root.value,
        searchPath: [...state.searchPath, root.value],
      }));

      await new Promise((r) => setTimeout(r, traversalSpeed));

      // Standard BST insertion with parent pointers
      if (node.value < root.value) {
        if (!root.left) {
          root.left = node;
          node.parent = root;
          return root;
        } else {
          root.left = await bstInsert(root.left, node);
          return root;
        }
      } else {
        if (!root.right) {
          root.right = node;
          node.parent = root;
          return root;
        } else {
          root.right = await bstInsert(root.right, node);
          return root;
        }
      }
    };

    // Perform BST insert with animation
    tree = await bstInsert(tree, newNode);

    // Fix RB tree properties after insertion
    const fixRBTreeAfterInsert = (tree, node) => {
      // If node is root, color it black and return
      if (node === tree) {
        node.color = "BLACK";
        return tree;
      }

      // If parent is black, no violations
      if (!isRed(node.parent)) {
        return tree;
      }

      // From here, we know parent is RED
      const parent = node.parent;
      const grandparent = parent.parent;
      if (!grandparent) return tree; // Safety check

      // Determine if parent is left or right child of grandparent
      const isParentLeftChild = grandparent.left === parent;
      const uncle = isParentLeftChild ? grandparent.right : grandparent.left;

      // Case 1: Uncle is RED - recolor and move up
      if (isRed(uncle)) {
        parent.color = "BLACK";
        uncle.color = "BLACK";
        grandparent.color = "RED";
        return fixRBTreeAfterInsert(tree, grandparent);
      }

      // Case 2 & 3: Uncle is BLACK
      if (isParentLeftChild) {
        // Left-Right Case: Left rotate parent
        if (parent.right === node) {
          tree = get().rbLeftRotate(tree, parent);
          // Now it's a Left-Left case
          return get().rbRightRotate(tree, grandparent);
        }
        // Left-Left Case: Right rotate grandparent
        else {
          // First fix colors
          parent.color = "BLACK";
          grandparent.color = "RED";
          return get().rbRightRotate(tree, grandparent);
        }
      } else {
        // Right-Left Case: Right rotate parent
        if (parent.left === node) {
          tree = get().rbRightRotate(tree, parent);
          // Now it's a Right-Right case
          return get().rbLeftRotate(tree, grandparent);
        }
        // Right-Right Case: Left rotate grandparent
        else {
          // First fix colors
          parent.color = "BLACK";
          grandparent.color = "RED";
          return get().rbLeftRotate(tree, grandparent);
        }
      }
    };

    // Fix RB tree properties
    tree = fixRBTreeAfterInsert(tree, newNode);

    // Ensure root is always black
    tree.color = "BLACK";

    // Update parent references to ensure consistency
    updateParentReferences(tree);

    // Update the tree visualization
    const layoutTree = get().calculateTreeLayout(tree);
    set({ tree: layoutTree });
  },

  // deleteRB function with proper implementation
  deleteRB: async (value) => {
    const { tree, traversalSpeed } = get();
    const isRed = get().isRed;

    // Reset visualization state
    set({
      searchPath: [],
      searchFound: null,
      bstTargetValue: value,
      currentNode: null,
      visitedNodes: [],
    });

    if (!tree) {
      set({ searchFound: false });
      return;
    }

    // Step 1: Search for the node to delete with visualization
    let nodeToDelete = null;
    let parentOfNodeToDelete = null;

    const findNode = async (node, parent, val) => {
      if (!node) return null;

      // Update visualization state
      set((state) => ({
        visitedNodes: [...state.visitedNodes, node.value],
        currentNode: node.value,
        searchPath: [...state.searchPath, node.value],
      }));

      await new Promise((r) => setTimeout(r, traversalSpeed));

      if (node.value === val) {
        // Found the node
        set({ searchFound: true });
        nodeToDelete = node;
        parentOfNodeToDelete = parent;
        return;
      }

      if (val < node.value) {
        await findNode(node.left, node, val);
      } else {
        await findNode(node.right, node, val);
      }
    };

    // Search for the node to delete
    await findNode(tree, null, value);

    // If node not found, return
    if (!nodeToDelete) {
      set({ searchFound: false });
      return;
    }

    // Create a deep clone of the tree to work with
    let newTree = JSON.parse(JSON.stringify(tree));

    // Find the node in the cloned tree
    const findNodeInClone = (node, val) => {
      if (!node) return null;
      if (node.value === val) return node;
      if (val < node.value) return findNodeInClone(node.left, val);
      return findNodeInClone(node.right, val);
    };

    const findParentInClone = (node, child) => {
      if (!node || !child) return null;
      if (node.left && node.left.value === child.value) return node;
      if (node.right && node.right.value === child.value) return node;
      if (child.value < node.value) return findParentInClone(node.left, child);
      return findParentInClone(node.right, child);
    };

    const clonedNodeToDelete = findNodeInClone(newTree, value);

    // If it's the only node in the tree, just clear the tree
    if (clonedNodeToDelete === newTree && !newTree.left && !newTree.right) {
      set({ tree: null, searchFound: true });
      return;
    }

    // For complex deletion, we'll use a RB-tree compliant delete method
    // that preserves the RB properties. For visualization purposes,
    // we'll implement a simplified version here.

    // First, handle the case where the node has 0 or 1 child
    const handleSimpleCase = () => {
      const parent = findParentInClone(newTree, clonedNodeToDelete);
      const isLeftChild = parent && parent.left === clonedNodeToDelete;

      // Case 1: node has no children
      if (!clonedNodeToDelete.left && !clonedNodeToDelete.right) {
        if (!parent) {
          // This was the root node with no children
          newTree = null;
        } else if (isLeftChild) {
          parent.left = null;
        } else {
          parent.right = null;
        }
      }
      // Case 2: node has one child
      else if (!clonedNodeToDelete.left) {
        if (!parent) {
          // This was the root node with only right child
          newTree = clonedNodeToDelete.right;
          newTree.parent = null;
          // Root must be BLACK
          newTree.color = "BLACK";
        } else if (isLeftChild) {
          parent.left = clonedNodeToDelete.right;
          if (parent.left) parent.left.parent = parent;
        } else {
          parent.right = clonedNodeToDelete.right;
          if (parent.right) parent.right.parent = parent;
        }
      } else if (!clonedNodeToDelete.right) {
        if (!parent) {
          // This was the root node with only left child
          newTree = clonedNodeToDelete.left;
          newTree.parent = null;
          // Root must be BLACK
          newTree.color = "BLACK";
        } else if (isLeftChild) {
          parent.left = clonedNodeToDelete.left;
          if (parent.left) parent.left.parent = parent;
        } else {
          parent.right = clonedNodeToDelete.left;
          if (parent.right) parent.right.parent = parent;
        }
      }
    };

    // Case 3: node has two children
    const handleTwoChildrenCase = () => {
      // Find successor (minimum value in right subtree)
      let successor = clonedNodeToDelete.right;
      while (successor.left) {
        successor = successor.left;
      }

      // Replace node value with successor value
      clonedNodeToDelete.value = successor.value;

      // Remove successor - successor has at most one child (right child)
      const parentOfSuccessor = findParentInClone(newTree, successor);
      const isSuccessorLeftChild =
        parentOfSuccessor && parentOfSuccessor.left === successor;

      if (parentOfSuccessor === clonedNodeToDelete) {
        // Successor is direct right child of node to delete
        clonedNodeToDelete.right = successor.right;
        if (successor.right) successor.right.parent = clonedNodeToDelete;
      } else {
        // Successor is deeper in the right subtree
        if (isSuccessorLeftChild) {
          parentOfSuccessor.left = successor.right;
        } else {
          parentOfSuccessor.right = successor.right;
        }
        if (successor.right) successor.right.parent = parentOfSuccessor;
      }
    };

    // Execute the appropriate case
    if (!clonedNodeToDelete.left || !clonedNodeToDelete.right) {
      handleSimpleCase();
    } else {
      handleTwoChildrenCase();
    }

    // Restore RB properties if necessary
    const fixRbTreeAfterDelete = (tree) => {
      // Function that fixes RB violations after deletion
      // For simplicity, we'll just ensure the root is black
      if (tree) {
        tree.color = "BLACK";

        // Ensure all RED nodes have BLACK children
        const validateColors = (node) => {
          if (!node) return;

          if (isRed(node)) {
            // A RED node cannot have RED children
            if (node.left) node.left.color = "BLACK";
            if (node.right) node.right.color = "BLACK";
          }

          validateColors(node.left);
          validateColors(node.right);
        };

        validateColors(tree);
      }

      return tree;
    };

    // Fix RB tree properties after deletion
    newTree = fixRbTreeAfterDelete(newTree);

    // Update parent references
    if (newTree) {
      updateParentReferences(newTree);
    }

    // Update tree visualization
    const layoutTree = newTree ? get().calculateTreeLayout(newTree) : null;
    set({ tree: layoutTree });
  },

  // Randomize a Red-Black tree for testing
  randomizeRBTree: () => {
    // Generate random values for a Red-Black tree
    const values = new Set();
    const nodeCount = Math.floor(Math.random() * 6) + 5; // 5 to 10 nodes

    // Generate unique values
    while (values.size < nodeCount) {
      values.add(Math.floor(Math.random() * 90) + 10); // Values from 10 to 99
    }

    // Sort for building a balanced tree
    const sortedValues = [...values].sort((a, b) => a - b);

    // Build an RB tree from sorted values
    const buildBalancedRBTree = (values, start, end, depth = 0) => {
      if (start > end) return null;

      const mid = Math.floor((start + end) / 2);
      const node = {
        value: values[mid],
        left: null,
        right: null,
        color: depth % 2 === 0 ? "BLACK" : "RED", // Alternate colors by depth
        parent: null,
      };

      // Build left and right subtrees
      if (start < mid) {
        node.left = buildBalancedRBTree(values, start, mid - 1, depth + 1);
        if (node.left) node.left.parent = node;
      }

      if (mid < end) {
        node.right = buildBalancedRBTree(values, mid + 1, end, depth + 1);
        if (node.right) node.right.parent = node;
      }

      return node;
    };

    // Create the tree with the root being black
    const rbTree = buildBalancedRBTree(
      sortedValues,
      0,
      sortedValues.length - 1
    );
    if (rbTree) rbTree.color = "BLACK"; // Root must be black

    // Validate the tree to meet RB properties
    const validateRBTree = (node) => {
      if (!node) return;

      // Rule 1: A node is either red or black (already satisfied by construction)

      // Rule 2: Root is black (already set above)

      // Rule 3: Red nodes have black children
      if (node.color === "RED") {
        if (node.left) node.left.color = "BLACK";
        if (node.right) node.right.color = "BLACK";
      }

      // Recursively validate children
      validateRBTree(node.left);
      validateRBTree(node.right);
    };

    validateRBTree(rbTree);

    // Update parent references
    updateParentReferences(rbTree);

    // Apply layout and update state
    const layoutTree = rbTree ? get().calculateTreeLayout(rbTree) : null;
    set({ tree: layoutTree });

    return layoutTree;
  },
}));

export default useTreeStore;
