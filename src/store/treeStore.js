import { create } from "zustand";
import { gsap } from "gsap";

const useTreeStore = create((set, get) => ({
  tree: null,
  visitedNodes: [],
  currentNode: null,
  traversalSpeed: 1000,
  timeline: null, // Add timeline state

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

    // First pass: calculate tree depth and width
    const getDepth = (node) => {
      if (!node) return 0;
      return Math.max(getDepth(node.left), getDepth(node.right)) + 1;
    };

    const treeDepth = getDepth(tree);

    // Second pass: assign x and y coordinates
    const nodeWidth = 80; // Increased width between nodes for better visibility
    const levelHeight = 100; // Increased height between levels

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

    return assignCoordinates(JSON.parse(JSON.stringify(tree))); // Deep copy to avoid mutating original tree
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
}));

export default useTreeStore;
