import React, { useEffect, useState, useRef, useLayoutEffect } from "react";
import { useParams } from "react-router-dom";
import { gsap } from "gsap";
import useTreeStore from "../../store/treeStore";
import TreeNode from "./TreeNode";
import TreeLink from "./TreeLink";
import TreeControls from "./TreeControls";
import { createTreeLayout } from "../../utils/treeLayout";
import { createDefaultTree } from "../../utils/defaultTree";
import BSTOperationsForm from "./BSTOperationsForm";
import AVLOperationsForm from "./AVLOperationsForm";
import RBOperationsForm from "./RBOperationsForm";

const TreeVisualizer = () => {
  const { algorithm } = useParams();
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const {
    tree,
    visitedNodes,
    currentNode,
    setTree,
    resetVisualization,
    resetTraversal,
    traversalType,
    createSampleTree,
    createSampleAVL,
    createSampleRB,
    isTraversing,
    startTraversal,
    pauseTraversal,
    resumeTraversal,
    setTraversalType,
    traversalSpeed,
    setTraversalSpeed,
    // Add these missing functions for BST operations
    insertBST,
    deleteBST,
    searchBST,
    // Add AVL operations
    insertAVL,
    deleteAVL,
    // Add RB tree operations
    insertRB,
    deleteRB,
    randomizeRBTree,
    // Search and target values for UI feedback
    searchFound,
    bstTargetValue,
  } = useTreeStore();

  const [treeLayout, setTreeLayout] = useState({ nodes: [], links: [] });
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const [activeNodePath, setActiveNodePath] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const dragRef = useRef({ x: 0, y: 0 });
  const [showControls, setShowControls] = useState(true);
  const [nodeValue, setNodeValue] = useState("");
  const [showMobileSettings, setShowMobileSettings] = useState(false);

  // Add a check to determine if we're on the traversals page
  const isTraversalPage = algorithm === "tree-traversals";

  // Functions to handle tree operations for BST
  const handleAdd = () => {
    if (!nodeValue || isNaN(parseInt(nodeValue))) {
      alert("Please enter a valid number");
      return;
    }

    setIsAnimating(true);
    const value = parseInt(nodeValue);

    if (algorithm === "binary-search-tree") {
      insertBST(value).finally(() => {
        setIsAnimating(false);
        setNodeValue("");
        setShowMobileSettings(false); // Auto-close settings panel after operation
      });
    } else if (algorithm === "avl-tree") {
      insertAVL(value).finally(() => {
        setIsAnimating(false);
        setNodeValue("");
        setShowMobileSettings(false); // Auto-close settings panel after operation
      });
    } else if (algorithm === "red-black-tree") {
      insertRB(value).finally(() => {
        setIsAnimating(false);
        setNodeValue("");
        setShowMobileSettings(false); // Auto-close settings panel after operation
      });
    }
  };

  const handleRemove = () => {
    if (!nodeValue || isNaN(parseInt(nodeValue))) {
      alert("Please enter a valid number");
      return;
    }

    setIsAnimating(true);
    const value = parseInt(nodeValue);

    if (algorithm === "binary-search-tree") {
      deleteBST(value).finally(() => {
        setIsAnimating(false);
        setNodeValue("");
        setShowMobileSettings(false); // Auto-close settings panel after operation
      });
    } else if (algorithm === "avl-tree") {
      deleteAVL(value).finally(() => {
        setIsAnimating(false);
        setNodeValue("");
        setShowMobileSettings(false); // Auto-close settings panel after operation
      });
    } else if (algorithm === "red-black-tree") {
      deleteRB(value).finally(() => {
        setIsAnimating(false);
        setNodeValue("");
        setShowMobileSettings(false); // Auto-close settings panel after operation
      });
    }
  };

  const handleSearch = () => {
    if (!nodeValue || isNaN(parseInt(nodeValue))) {
      alert("Please enter a valid number");
      return;
    }

    setIsAnimating(true);
    const value = parseInt(nodeValue);

    searchBST(value).finally(() => {
      setIsAnimating(false);
      setShowMobileSettings(false); // Auto-close settings panel after operation
    });
  };

  const randomizeTree = () => {
    setIsAnimating(true);

    try {
      if (algorithm === "red-black-tree") {
        // Use the specialized RB tree randomization function
        randomizeRBTree();
        setTimeout(() => {
          setIsAnimating(false);
          setShowMobileSettings(false); // Auto-close settings panel after operation
        }, 500);
        return;
      }

      // Generate a balanced random tree with 7-15 nodes
      const nodeCount = Math.floor(Math.random() * 9) + 7; // 7 to 15 nodes
      const values = new Set();

      // Generate unique random values
      while (values.size < nodeCount) {
        values.add(Math.floor(Math.random() * 99) + 1); // 1 to 99
      }

      // Sort values for better tree creation
      const sortedValues = Array.from(values).sort((a, b) => a - b);

      // Create a balanced tree from sorted array
      const createBalancedTree = (arr, start, end) => {
        if (start > end) return null;

        const mid = Math.floor((start + end) / 2);
        const node = { value: arr[mid], left: null, right: null };

        // Recursively build left and right subtrees
        node.left = createBalancedTree(arr, start, mid - 1);
        node.right = createBalancedTree(arr, mid + 1, end);

        return node;
      };

      const newTree = createBalancedTree(
        sortedValues,
        0,
        sortedValues.length - 1
      );

      if (algorithm === "avl-tree") {
        // Convert to AVL tree by adding height properties
        const convertToAVL = (node) => {
          if (!node) return null;

          const avlNode = {
            value: node.value,
            left: convertToAVL(node.left),
            right: convertToAVL(node.right),
          };

          // Calculate height
          const leftHeight = avlNode.left ? avlNode.left.height : 0;
          const rightHeight = avlNode.right ? avlNode.right.height : 0;
          avlNode.height = Math.max(leftHeight, rightHeight) + 1;

          return avlNode;
        };

        setTree(convertToAVL(newTree));
      } else {
        setTree(newTree);
      }
    } catch (error) {
      console.error("Error creating random tree:", error);
      // Fall back to sample trees if randomization fails
      if (algorithm === "avl-tree") {
        setTree(createSampleAVL());
      } else {
        setTree(createSampleTree());
      }
    }

    setTimeout(() => {
      setIsAnimating(false);
      setShowMobileSettings(false); // Auto-close settings panel after operation
    }, 500);
  };

  // Remove the handleResetView function since we'll always maintain the proper view automatically

  // Function to handle traversal animation
  const handleStartTraversal = () => {
    if (isTraversing) {
      pauseTraversal();
    } else {
      startTraversal();
      setShowMobileSettings(false); // Auto-close settings panel when starting traversal
    }
  };

  const handleResetTraversal = () => {
    resetTraversal();
    setShowMobileSettings(false); // Auto-close settings panel when resetting
  };

  // Function to toggle mobile settings panel
  const toggleMobileSettings = () => {
    setShowMobileSettings(!showMobileSettings);
  };

  // Set up resize observer for responsive sizing
  useLayoutEffect(() => {
    if (!containerRef.current) return;

    // Initial size calculation
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        // Use the actual container height rather than arbitrary values
        setDimensions({
          width: rect.width,
          height: rect.height,
        });
      }
    };

    updateSize();

    // Create resize observer
    const observer = new ResizeObserver(() => {
      updateSize();
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Initialize tree with the appropriate default based on algorithm type
  useEffect(() => {
    // Now we can safely use the functions from the store
    if (algorithm === "avl-tree") {
      // Use the proper AVL tree creation function
      const avlTree = createSampleAVL();
      setTree(avlTree);
    } else if (algorithm === "red-black-tree") {
      // Use the Red-Black tree creation function
      const rbTree = createSampleRB();
      setTree(rbTree);
    } else {
      const defaultTree = createSampleTree();
      setTree(defaultTree);
    }

    // Short delay to ensure the container is sized
    setTimeout(() => {
      setIsLoaded(true);
    }, 10);

    return () => resetVisualization();
  }, [
    algorithm,
    createSampleAVL,
    createSampleRB,
    createSampleTree,
    setTree,
    resetVisualization,
  ]);

  // Generate layout when tree or dimensions change
  useEffect(() => {
    if (!tree || !isLoaded) return;

    try {
      // Special handling for Red-Black trees to ensure proper alignment
      const isRedBlackTree = algorithm === "red-black-tree";

      // Force a complete tree layout recalculation using a deep copy
      const treeForLayout = JSON.parse(JSON.stringify(tree));
      const layout = createTreeLayout(
        treeForLayout,
        dimensions.width,
        dimensions.height
      );

      // Store the updated layout
      setTreeLayout(layout);

      // Center the tree initially
      centerTreeInView();

      // Position nodes and links immediately without animations
      requestAnimationFrame(() => {
        // Directly set positions without animations
        layout.nodes.forEach((node) => {
          const element = document.querySelector(
            `.tree-node[data-id="${node.id}"]`
          );
          if (element) {
            gsap.set(element, {
              x: node.x,
              y: node.y,
              opacity: 1,
              scale: 1,
              transformOrigin: "50% 50%",
            });
          }
        });

        layout.links?.forEach((link) => {
          const element = document.querySelector(
            `path[data-link-id="${link.source.id}-${link.target.id}"]`
          );
          if (element) {
            gsap.set(element, {
              opacity: 1,
              visibility: "visible",
            });
          }
        });
      });
    } catch (error) {
      console.error("Error creating tree layout:", error);
      resetVisualization();

      // Use appropriate sample tree based on algorithm type
      setTimeout(() => {
        if (algorithm === "avl-tree") {
          setTree(createSampleAVL());
        } else if (algorithm === "red-black-tree") {
          setTree(createSampleRB());
        } else {
          setTree(createSampleTree());
        }
      }, 500);
    }
  }, [tree, dimensions, isLoaded, algorithm]);

  // Add specific handling for Red-Black tree operations
  useEffect(() => {
    // Only run for Red-Black trees
    if (algorithm !== "red-black-tree" || !treeLayout.nodes?.length) return;

    // Ensure proper color transitions when nodes change
    const redNodes = document.querySelectorAll('.tree-node[data-color="RED"]');
    const blackNodes = document.querySelectorAll(
      '.tree-node[data-color="BLACK"]'
    );

    gsap.to(redNodes, {
      duration: 0.5,
      onStart: function () {
        this.targets().forEach((node) => {
          const circle = node.querySelector("circle");
          if (circle) gsap.to(circle, { fill: "#ef4444", duration: 0.3 });
        });
      },
    });

    gsap.to(blackNodes, {
      duration: 0.5,
      onStart: function () {
        this.targets().forEach((node) => {
          const circle = node.querySelector("circle");
          if (circle) gsap.to(circle, { fill: "#1e293b", duration: 0.3 });
        });
      },
    });
  }, [algorithm, treeLayout.nodes]);

  // Calculate path from current node to root
  const findPathToRoot = (nodeId) => {
    if (!treeLayout.nodes) return [];

    const path = [nodeId];
    let currentNodeObj = treeLayout.nodes.find((n) => n.id === nodeId);

    while (currentNodeObj && currentNodeObj.parentId !== null) {
      path.push(currentNodeObj.parentId);
      currentNodeObj = treeLayout.nodes.find(
        (n) => n.id === currentNodeObj.parentId
      );
    }

    return path;
  };

  // Track current path when node changes
  useEffect(() => {
    if (!currentNode) {
      setActiveNodePath([]);
      return;
    }

    const path = findPathToRoot(currentNode);
    setActiveNodePath(path);

    // Animate current node with GSAP
    const currentNodeEl = document.querySelector(
      `.tree-node[data-id="${currentNode}"]`
    );
    if (currentNodeEl) {
      gsap
        .timeline()
        .to(currentNodeEl, {
          scale: 1.2,
          duration: 0.3,
          ease: "elastic.out(1.2, 0.5)",
        })
        .to(
          currentNodeEl.querySelector("circle"),
          {
            fill: "#0ea5e9",
            stroke: "#facc15",
            strokeWidth: 3,
            duration: 0.2,
          },
          "<"
        );
    }
  }, [currentNode, treeLayout]);

  // Get traversal info based on current type
  const getTraversalInfo = () => {
    if (algorithm === "avl-tree") {
      return {
        title: "AVL Tree",
        code: `insert(node, key)
  // 1. BST insert
  if (node == null)
    return new Node(key)
  if (key < node.key)
    node.left = insert(node.left, key)
  else if (key > node.key)
    node.right = insert(node.right, key)
  
  // 2. Update height
  node.height = max(height(node.left), 
                 height(node.right)) + 1
  
  // 3. Get balance factor
  int balance = getBalance(node)
  
  // 4. Rotate if unbalanced
  // Left Left Case
  if (balance > 1 && key < node.left.key)
    return rightRotate(node)
  // Right Right Case
  if (balance < -1 && key > node.right.key)
    return leftRotate(node)
  // Left Right Case
  if (balance > 1 && key > node.left.key) {
    node.left = leftRotate(node.left)
    return rightRotate(node)
  }
  // Right Left Case
  if (balance < -1 && key < node.right.key) {
    node.right = leftRotate(node)
    return leftRotate(node)
  }
  
  return node`,
        description:
          "AVL Tree is a self-balancing binary search tree where the difference between heights of left and right subtrees cannot be more than one for all nodes.",
      };
    }

    switch (traversalType) {
      case "inorder":
        return {
          title: "Inorder Traversal",
          code: `Inorder(root)
  if (root == null) return
  Inorder(root.left)
  Visit(root)
  Inorder(root.right)`,
          description:
            "Visits nodes in order: left subtree, current node, then right subtree. In a BST, this produces sorted values.",
        };
      case "preorder":
        return {
          title: "Preorder Traversal",
          code: `Preorder(root)
  if (root == null) return
  Visit(root)
  Preorder(root.left)
  Preorder(root.right)`,
          description:
            "Visits current node before subtrees. Useful for creating a copy of the tree or prefix expression evaluation.",
        };
      case "postorder":
        return {
          title: "Postorder Traversal",
          code: `Postorder(root)
  if (root == null) return
  Postorder(root.left)
  Postorder(root.right)
  Visit(root)`,
          description:
            "Visits current node after subtrees. Useful for deletion operations and postfix expression evaluation.",
        };
      case "levelorder":
        return {
          title: "Level Order Traversal",
          code: `LevelOrder(root)
  if (root == null) return
  Queue q
  q.enqueue(root)
  while (!q.isEmpty())
    node = q.dequeue()
    Visit(node)
    if (node.left) q.enqueue(node.left)
    if (node.right) q.enqueue(node.right)`,
          description:
            "Visits nodes level by level from top to bottom. Uses a queue to track nodes at each level.",
        };
      default:
        return { title: "", code: "", description: "" };
    }
  };

  const info = getTraversalInfo();

  // Add zoom handler with passive option support for mobile browsers
  const handleWheel = (e) => {
    try {
      e.preventDefault(); // Try to prevent default scroll
    } catch (err) {
      // Silent catch for browsers that don't allow preventDefault in passive listeners
    }

    const delta = -e.deltaY;
    const scaleFactor = 0.05;
    const newScale = Math.max(
      0.5,
      Math.min(2, transform.scale + (delta > 0 ? scaleFactor : -scaleFactor))
    );

    // Use requestAnimationFrame for smoother zooming
    requestAnimationFrame(() => {
      setTransform((prev) => ({
        ...prev,
        scale: newScale,
      }));
    });
  };

  // Add drag handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragRef.current = {
      x: e.clientX - transform.x,
      y: e.clientY - transform.y,
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    setTransform((prev) => ({
      ...prev,
      x: e.clientX - dragRef.current.x,
      y: e.clientY - dragRef.current.y,
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Remove double click to reset view since we're always maintaining proper view automatically
  const handleDoubleClick = () => {
    // Instead of resetting to default coordinates, recenter the tree
    centerTreeInView();
  };

  // Enhanced touch support for mobile devices
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    let touchStartX, touchStartY;
    let initialTransform = { ...transform };

    const handleTouchStart = (e) => {
      if (e.touches.length === 1) {
        // Single touch for dragging
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        initialTransform = { ...transform };
      } else if (e.touches.length === 2) {
        // Pinch to zoom
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        element.dataset.pinchDistance = dist;
      }
    };

    const handleTouchMove = (e) => {
      e.preventDefault();

      if (e.touches.length === 1) {
        // Handle dragging
        const deltaX = e.touches[0].clientX - touchStartX;
        const deltaY = e.touches[0].clientY - touchStartY;

        setTransform((prev) => ({
          ...prev,
          x: initialTransform.x + deltaX,
          y: initialTransform.y + deltaY,
        }));
      } else if (e.touches.length === 2 && element.dataset.pinchDistance) {
        // Handle pinch zooming
        const newDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );

        const oldDist = parseFloat(element.dataset.pinchDistance);
        const scaleFactor = 0.01;
        const deltaScale = (newDist - oldDist) * scaleFactor;

        const newScale = Math.max(
          0.5,
          Math.min(2, initialTransform.scale + deltaScale)
        );

        setTransform((prev) => ({
          ...prev,
          scale: newScale,
        }));

        element.dataset.pinchDistance = newDist;
      }
    };

    const handleTouchEnd = () => {
      delete element.dataset.pinchDistance;
    };

    element.addEventListener("touchstart", handleTouchStart);
    element.addEventListener("touchmove", handleTouchMove, { passive: false });
    element.addEventListener("touchend", handleTouchEnd);

    return () => {
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchmove", handleTouchMove);
      element.removeEventListener("touchend", handleTouchEnd);
    };
  }, [transform]);

  // Update animation speed handling for smoother transitions
  useEffect(() => {
    // Only run when traversal speed changes or traversal state changes
    if (isTraversing) {
      // Apply GSAP timing updates for animations based on current speed
      gsap.globalTimeline.timeScale(600 / traversalSpeed); // Invert ratio for more intuitive speed control
    } else {
      // Reset to normal timescale when not traversing
      gsap.globalTimeline.timeScale(1);
    }
  }, [traversalSpeed, isTraversing]);

  // Responsive improvements for the tree visualization
  useLayoutEffect(() => {
    const updateSizeForDevice = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const screenWidth = window.innerWidth;
      const isMobile = screenWidth < 768;
      const isTablet = screenWidth >= 768 && screenWidth < 1024;

      setDimensions({
        width: rect.width,
        height: rect.height - (isMobile ? 20 : 10),
      });

      // Don't set transform scale here - let centerTreeInView handle it
    };

    updateSizeForDevice();

    const observer = new ResizeObserver(() => {
      updateSizeForDevice();
      // Call centerTreeInView when container size changes
      if (treeLayout.nodes && treeLayout.nodes.length > 0) {
        centerTreeInView();
      }
    });

    observer.observe(containerRef.current);
    window.addEventListener("orientationchange", () => {
      setTimeout(updateSizeForDevice, 100);
      setTimeout(centerTreeInView, 150);
    });

    return () => {
      observer.disconnect();
      window.removeEventListener("orientationchange", updateSizeForDevice);
    };
  }, []);

  // Enhanced centerTreeInView function for better automatic positioning
  const centerTreeInView = () => {
    if (!tree || !treeLayout || !treeLayout.nodes || !treeLayout.nodes.length)
      return;

    const rootNode = treeLayout.nodes.find((n) => n.parentId === null);
    if (!rootNode) return;

    // Calculate viewport dimensions
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Get screen width to determine device type
    const screenWidth = window.innerWidth;

    // Determine appropriate scale based on device size and tree size
    let scale = 1;
    // Move tree upward by positioning centerY higher in the container
    let centerY = rect.height / 6; // Position tree higher (was rect.height/4)
    let horizontalOffset = 0;

    // Determine the tree width and height by finding extreme points
    const minX = Math.min(...treeLayout.nodes.map((n) => n.x || 0));
    const maxX = Math.max(...treeLayout.nodes.map((n) => n.x || 0));
    const treeWidth = maxX - minX + 80; // Add some padding

    const minY = Math.min(...treeLayout.nodes.map((n) => n.y || 0));
    const maxY = Math.max(...treeLayout.nodes.map((n) => n.y || 0));
    const treeHeight = maxY - minY + 80; // Add some padding

    // Calculate scale to fit tree in viewport
    const horizontalScale = rect.width / treeWidth;
    const verticalScale = (rect.height * 1.4) / treeHeight; // Increase vertical space by 40%

    // Use the smaller scale to ensure the entire tree fits, but with minimums to prevent over-shrinking
    const fitScale = Math.min(horizontalScale, verticalScale, 1);

    // Adjust scale based on device type with improved zooming for better visibility
    if (screenWidth < 640) {
      // Small mobile - more conservative scaling
      scale = Math.max(0.65, Math.min(fitScale, 0.75));
      centerY = rect.height / 6; // Position higher (was rect.height/4)
      horizontalOffset = rect.width * 0.05;
    } else if (screenWidth < 768) {
      // Mobile - slightly more generous scaling
      scale = Math.max(0.7, Math.min(fitScale, 0.8));
      centerY = rect.height / 5.5; // Position higher (was rect.height/3.8)
      horizontalOffset = rect.width * 0.03;
    } else if (screenWidth < 1024) {
      // Tablet - improved scaling for better visibility and larger size
      scale = Math.max(0.8, Math.min(fitScale, 0.9));
      centerY = rect.height / 5; // Position higher (was rect.height/3.5)
      // Adjust horizontal offset based on tree width to improve centering
      if (treeWidth * scale < rect.width * 0.8) {
        horizontalOffset = rect.width * 0.02;
      } else {
        horizontalOffset = 0;
      }
    } else {
      // Desktop
      scale = Math.min(fitScale, 1);
      centerY = rect.height / 5; // Position higher (was rect.height/3.2)
    }

    // Calculate center position for horizontal alignment
    let centerX = rect.width / 2 - (rootNode.x || 0);

    // Add the horizontal offset to move tree to the right on mobile/tablet
    centerX += horizontalOffset;

    // Apply additional centering adjustments for tablet view
    if (screenWidth >= 768 && screenWidth < 1024) {
      // Fine-tune vertical positioning for tablets - moved higher
      centerY = Math.min(centerY, rect.height / 5);

      // Adjust horizontal centering based on tree width for better proportioning
      const treeWidthScaled = treeWidth * scale;

      // For wider trees, ensure they're centered properly
      if (treeWidthScaled > rect.width * 0.7) {
        // Calculate exact center position based on scaled tree width
        centerX = (rect.width - treeWidthScaled) / 2 + minX * scale;
      }
    }

    // Ensure we have valid numbers before setting transform to avoid NaN errors
    if (isNaN(centerX) || isNaN(centerY) || isNaN(scale)) {
      console.warn("Invalid transform values detected:", {
        centerX,
        centerY,
        scale,
      });
      // Provide safe default values - move default position higher too
      setTransform({
        x: rect.width / 2,
        y: rect.height / 6, // Position higher (was rect.height/4)
        scale: 0.8,
      });
    } else {
      setTransform({
        x: centerX,
        y: centerY,
        scale: scale,
      });
    }
  };

  // Add feedback message for operations
  const getOperationFeedback = () => {
    if (searchFound === null || bstTargetValue === null) return null;

    if (searchFound) {
      return `Operation successful for value ${bstTargetValue}`;
    } else {
      return `Operation failed for value ${bstTargetValue}`;
    }
  };

  // Make sure to properly check for treeLayout before rendering
  useEffect(() => {
    if (treeLayout && treeLayout.nodes && treeLayout.nodes.length > 0) {
      centerTreeInView();
    }
  }, [treeLayout]);

  // Add safer wheel event listener with { passive: false }
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    // Use safe event binding for wheel events to prevent passive listener issues
    const safeHandleWheel = (e) => handleWheel(e);

    // Add event with passive: false to allow preventDefault()
    element.addEventListener("wheel", safeHandleWheel, { passive: false });

    return () => {
      element.removeEventListener("wheel", safeHandleWheel);
    };
  }, [transform.scale]); // Add transform.scale dependency so it updates when scale changes

  // Ensure tree is always properly positioned after any changes
  useEffect(() => {
    if (treeLayout && treeLayout.nodes && treeLayout.nodes.length > 0) {
      // Use a slightly longer timeout to ensure DOM is fully ready
      setTimeout(() => {
        centerTreeInView();
      }, 200);
    }
  }, [treeLayout]);

  // Add an additional effect to re-center the tree after operations
  useEffect(() => {
    if (tree && isLoaded) {
      // Center after operations like insert, delete, etc.
      setTimeout(() => {
        centerTreeInView();
      }, 300);
    }
  }, [tree, visitedNodes.length]);

  // Call centerTreeInView on window resize for responsive adjustment
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && treeLayout.nodes?.length > 0) {
        centerTreeInView();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [treeLayout]);

  return (
    <div className="flex flex-col w-full h-screen bg-slate-800">
      {/* Controls Section - only show fully on desktop, simplified on mobile/tablet */}
      <div className="fixed right-0 z-40 p-2 sm:p-4 shadow-lg top-20 md:top-26 left-0 md:left-64 bg-slate-800 border-b border-slate-700">
        <div className="flex flex-col sm:flex-row justify-between mb-2 gap-2">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white capitalize">
              {algorithm?.replace("-", " ")}
            </h2>

            {/* Show traversal info - brief one-line description ONLY ON DESKTOP */}
            {isTraversalPage && (
              <p className="hidden md:block text-sm text-gray-300 mt-1">
                {info.description}
              </p>
            )}
          </div>

          {/* Only show controls on desktop screens - REMOVED Reset View button */}
          <div className="hidden md:flex flex-wrap gap-2 items-center justify-end">
            {/* Only show tree manipulation controls if not on the traversals page */}
            {showControls && !isTraversalPage && (
              <>
                <button
                  onClick={handleAdd}
                  className="px-3 py-1 bg-green-600 rounded hover:bg-green-700 disabled:opacity-50"
                  disabled={isAnimating}
                >
                  Add Node
                </button>

                <button
                  onClick={handleRemove}
                  className="px-3 py-1 bg-red-600 rounded hover:bg-red-700 disabled:opacity-50"
                  disabled={isAnimating}
                >
                  Remove Node
                </button>

                <button
                  onClick={handleSearch}
                  className="px-3 py-1 bg-yellow-600 rounded hover:bg-yellow-700 disabled:opacity-50"
                  disabled={isAnimating}
                >
                  Search
                </button>

                <button
                  onClick={randomizeTree}
                  className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
                  disabled={isAnimating}
                >
                  Randomize
                </button>
              </>
            )}

            {/* Reset View button removed */}
          </div>
        </div>

        {/* Input Controls with better feedback - Only show on desktop */}
        {showControls && !isTraversalPage && (
          <div className="hidden md:block">
            <div className="flex flex-col sm:flex-row gap-2 mt-2">
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  value={nodeValue}
                  onChange={(e) => setNodeValue(e.target.value)}
                  placeholder="Node value"
                  className="px-3 py-1 text-white rounded bg-slate-700 border border-slate-600 w-full sm:w-auto"
                />
              </div>
            </div>

            {/* Operation feedback message */}
            {searchFound !== null && bstTargetValue !== null && (
              <div
                className={`mt-2 p-1 rounded text-sm ${
                  searchFound
                    ? "bg-green-800/40 text-green-200"
                    : "bg-red-800/40 text-red-200"
                }`}
              >
                {getOperationFeedback()}
              </div>
            )}

            {/* Tree type information */}
            <div className="mt-3 text-xs text-slate-400">
              {algorithm === "binary-search-tree" ? (
                <p>
                  Binary Search Tree: For each node, all nodes in left subtree
                  have smaller values, and all nodes in right subtree have
                  larger values.
                </p>
              ) : algorithm === "avl-tree" ? (
                <p>
                  AVL Tree: A self-balancing BST where the height difference
                  between left and right subtrees is at most 1 for all nodes.
                </p>
              ) : null}
            </div>
          </div>
        )}

        {/* Improved responsive traversal controls - Only show on desktop */}
        {isTraversalPage && (
          <div className="hidden md:block mt-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-start">
              {/* Algorithm selection - more mobile friendly */}
              <div className="bg-slate-700/50 p-2 rounded-lg">
                <h3 className="text-xs font-semibold text-gray-400 mb-1">
                  Traversal Algorithm
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
                  {["inorder", "preorder", "postorder", "levelorder"].map(
                    (type) => (
                      <button
                        key={type}
                        onClick={() => {
                          setTraversalType(type);
                          resetTraversal(); // Reset traversal when changing algorithm
                        }}
                        className={`px-2 py-1 text-xs rounded transition-colors ${
                          traversalType === type
                            ? "bg-blue-600 text-white"
                            : "bg-slate-600 text-gray-200 hover:bg-slate-500"
                        }`}
                        disabled={isTraversing}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Animation Controls - larger touch targets */}
              <div className="bg-slate-700/50 p-2 rounded-lg">
                <h3 className="text-xs font-semibold text-gray-400 mb-1">
                  Animation Controls
                </h3>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleStartTraversal}
                    className={`flex-1 px-3 py-1.5 rounded text-xs flex items-center justify-center gap-1 transition-colors ${
                      isTraversing
                        ? "bg-yellow-600 hover:bg-yellow-700"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    {isTraversing ? (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Pause
                      </>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Start
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleResetTraversal}
                    className="px-3 py-1.5 bg-red-600 rounded hover:bg-red-700 text-xs transition-colors flex items-center justify-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 mr-0.5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Reset
                  </button>
                </div>
              </div>

              {/* Speed control - simplified slider */}
              <div className="bg-slate-700/50 p-2 rounded-lg">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-gray-400">
                    Animation Speed
                  </h3>
                  <span className="text-xs text-blue-300">
                    {traversalSpeed}ms
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-gray-400">Fast</span>
                  <input
                    type="range"
                    min="100"
                    max="1000"
                    step="50"
                    value={traversalSpeed}
                    onChange={(e) => setTraversalSpeed(Number(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                  <span className="text-xs text-gray-400">Slow</span>
                </div>
              </div>
            </div>

            {/* Code display - simplified and more readable */}
            <div className="mt-3 bg-slate-900/70 p-2 rounded-lg border border-slate-700/50">
              <div className="flex flex-wrap items-start gap-1">
                <span className="text-xs font-medium text-blue-400 whitespace-nowrap">
                  {info.title}:
                </span>
                <code className="text-xs text-gray-100 font-mono break-all">
                  {info.code.replace(/\n/g, " ")}
                </code>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile/Tablet settings panel - slide up from bottom */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 md:hidden bg-slate-800 border-t border-slate-700 shadow-lg transition-transform duration-300 ease-in-out transform ${
          showMobileSettings ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="p-4 max-h-[80vh] overflow-y-auto">
          {/* Pull tab with handle */}
          <div className="absolute -top-6 left-0 right-0 h-6 bg-slate-800 border-t border-l border-r border-slate-700 rounded-t-lg flex justify-center items-center">
            <div className="w-16 h-1 bg-slate-600 rounded-full"></div>
          </div>

          <h3 className="text-lg font-bold text-white mb-4">Tree Controls</h3>

          {/* Tree manipulation controls */}
          {showControls && !isTraversalPage && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-300 mb-2">
                Operations
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleAdd}
                  className="px-3 py-2 bg-green-600 rounded hover:bg-green-700 disabled:opacity-50 text-sm"
                  disabled={isAnimating}
                >
                  Add Node
                </button>

                <button
                  onClick={handleRemove}
                  className="px-3 py-2 bg-red-600 rounded hover:bg-red-700 disabled:opacity-50 text-sm"
                  disabled={isAnimating}
                >
                  Remove Node
                </button>

                <button
                  onClick={handleSearch}
                  className="px-3 py-2 bg-yellow-600 rounded hover:bg-yellow-700 disabled:opacity-50 text-sm"
                  disabled={isAnimating}
                >
                  Search
                </button>

                <button
                  onClick={randomizeTree}
                  className="px-3 py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
                  disabled={isAnimating}
                >
                  Randomize
                </button>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-300 mb-2">
                  Input Value
                </h4>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    value={nodeValue}
                    onChange={(e) => setNodeValue(e.target.value)}
                    placeholder="Node value"
                    className="flex-1 px-3 py-2 text-white rounded bg-slate-700 border border-slate-600"
                  />
                </div>

                {/* Operation feedback message */}
                {searchFound !== null && bstTargetValue !== null && (
                  <div
                    className={`mt-2 p-2 rounded text-sm ${
                      searchFound
                        ? "bg-green-800/40 text-green-200"
                        : "bg-red-800/40 text-red-200"
                    }`}
                  >
                    {getOperationFeedback()}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Traversal Controls (if on traversal page) */}
          {isTraversalPage && (
            <div className="mb-4">
              <div className="grid grid-cols-1 gap-4">
                {/* Algorithm selection */}
                <div className="bg-slate-700/50 p-2 rounded-lg">
                  <h4 className="text-xs font-semibold text-gray-400 mb-2">
                    Traversal Algorithm
                  </h4>
                  {/* Add description for mobile here for better context */}
                  <p className="text-xs text-gray-400 mb-2">
                    {info.description}
                  </p>
                  <div className="grid grid-cols-2 gap-1">
                    {["inorder", "preorder", "postorder", "levelorder"].map(
                      (type) => (
                        <button
                          key={type}
                          onClick={() => {
                            setTraversalType(type);
                            resetTraversal(); // Reset traversal when changing algorithm
                          }}
                          className={`px-2 py-1.5 text-xs rounded transition-colors ${
                            traversalType === type
                              ? "bg-blue-600 text-white"
                              : "bg-slate-600 text-gray-200 hover:bg-slate-500"
                          }`}
                          disabled={isTraversing}
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Animation Controls */}
                <div className="bg-slate-700/50 p-2 rounded-lg">
                  <h4 className="text-xs font-semibold text-gray-400 mb-2">
                    Animation Controls
                  </h4>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleStartTraversal}
                      className={`flex-1 px-3 py-2 rounded text-sm flex items-center justify-center gap-2 transition-colors ${
                        isTraversing
                          ? "bg-yellow-600 hover:bg-yellow-700"
                          : "bg-green-600 hover:bg-green-700"
                      }`}
                    >
                      {isTraversing ? (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Pause
                        </>
                      ) : (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Start
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleResetTraversal}
                      className="px-3 py-2 bg-red-600 rounded hover:bg-red-700 text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Reset
                    </button>
                  </div>
                </div>

                {/* Speed control */}
                <div className="bg-slate-700/50 p-2 rounded-lg">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-gray-400">
                      Animation Speed
                    </h4>
                    <span className="text-xs text-blue-300">
                      {traversalSpeed}ms
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-xs text-gray-400">Fast</span>
                    <input
                      type="range"
                      min="100"
                      max="1000"
                      step="50"
                      value={traversalSpeed}
                      onChange={(e) =>
                        setTraversalSpeed(Number(e.target.value))
                      }
                      className="w-full accent-blue-500"
                    />
                    <span className="text-xs text-gray-400">Slow</span>
                  </div>
                </div>

                {/* Code display */}
                <div className="bg-slate-900/70 p-3 rounded-lg border border-slate-700/50">
                  <div className="flex flex-wrap items-start gap-1">
                    <span className="text-xs font-medium text-blue-400 whitespace-nowrap">
                      {info.title}:
                    </span>
                    <code className="text-xs text-gray-100 font-mono break-all">
                      {info.code.replace(/\n/g, " ")}
                    </code>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Common actions for all tree types - Removed Reset View button */}
          <div className="mt-4">
            {/* Tree type information */}
            {!isTraversalPage && (
              <div className="mt-1 text-xs text-slate-400">
                {algorithm === "binary-search-tree" ? (
                  <p>
                    Binary Search Tree: For each node, all nodes in left subtree
                    have smaller values, and all nodes in right subtree have
                    larger values.
                  </p>
                ) : algorithm === "avl-tree" ? (
                  <p>
                    AVL Tree: A self-balancing BST where the height difference
                    between left and right subtrees is at most 1 for all nodes.
                  </p>
                ) : algorithm === "red-black-tree" ? (
                  <p>
                    Red-Black Tree: A self-balancing BST where each node is
                    colored red or black to ensure the tree remains balanced
                    after insertions and deletions.
                  </p>
                ) : null}
              </div>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={toggleMobileSettings}
            className="mt-4 w-full py-2 bg-slate-700 rounded text-sm"
          >
            Close
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col h-full pt-16 md:pt-20 pb-4 px-2 sm:px-4">
        {/* Tree container */}
        <div
          ref={containerRef}
          className="flex-1 w-full h-full rounded-lg bg-slate-900 touch-none relative overflow-hidden"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onDoubleClick={handleDoubleClick}
        >
          <svg width="100%" height="100%" className="w-full h-full">
            <g
              transform={`translate(${isNaN(transform.x) ? 0 : transform.x}, ${
                isNaN(transform.y) ? 0 : transform.y
              }) scale(${isNaN(transform.scale) ? 1 : transform.scale})`}
            >
              {treeLayout.links?.map(
                (link) =>
                  link &&
                  link.source &&
                  link.target && (
                    <TreeLink
                      key={`${link.source.id}-${link.target.id}`}
                      link={link}
                      isActive={
                        activeNodePath.includes(link.source.id) &&
                        activeNodePath.includes(link.target.id)
                      }
                    />
                  )
              )}
              {treeLayout.nodes?.map(
                (node) =>
                  node && (
                    <TreeNode
                      key={node.id}
                      node={node}
                      isActive={activeNodePath.includes(node.id)}
                      isCurrent={currentNode === node.id}
                      isVisited={visitedNodes.includes(node.id)}
                    />
                  )
              )}
            </g>
          </svg>
          /* Tree position instructions */}
          <div className="absolute top-2 left-5 bg-slate-800 bg-opacity-90 p-2 rounded text-xs sm:text-sm text-white max-w-[180px] z-10">
            <p className="hidden sm:block">
              Mouse: drag to move, wheel to zoom, double-click to center
            </p>
            <p className="sm:hidden">
              Touch: drag to move, pinch to zoom, double-tap to center
            </p>
          </div>
          {/* Mobile settings floating button - positioned lower */}
          <div className="md:hidden absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
            <button
              onClick={toggleMobileSettings}
              className="w-16 h-16 flex items-center justify-center bg-slate-700 rounded-full shadow-lg hover:bg-slate-600 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-settings h-6 w-6"
              >
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Improve visited nodes display */}
      {isTraversalPage && visitedNodes.length > 0 && (
        <div className="fixed bottom-20 md:bottom-4 right-4 p-2 bg-slate-800/90 rounded-lg shadow-lg backdrop-blur-sm z-40">
          <p className="text-xs font-medium text-white mb-1 flex items-center">
            <span className="inline-block w-2 h-2 bg-blue-400 rounded-full mr-1"></span>
            Visited: {visitedNodes.length} nodes
          </p>
          <div className="flex flex-wrap gap-1 max-w-[240px]">
            {visitedNodes.map((nodeId, i) => (
              <div
                key={i}
                className="w-6 h-6 bg-blue-500 hover:bg-blue-400 rounded-full flex items-center justify-center text-xs text-white transition-colors"
              >
                {nodeId}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TreeVisualizer;
