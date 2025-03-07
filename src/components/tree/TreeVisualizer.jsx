import React, { useEffect, useState, useRef, useLayoutEffect } from 'react'
import { useParams } from 'react-router-dom'
import { gsap } from 'gsap'
import useTreeStore from '../../store/treeStore'
import TreeNode from './TreeNode'
import TreeLink from './TreeLink'
import TreeControls from './TreeControls'
import { createTreeLayout } from '../../utils/treeLayout'
import { createDefaultTree } from '../../utils/defaultTree'
import BSTOperationsForm from './BSTOperationsForm'
import AVLOperationsForm from './AVLOperationsForm'
import RBOperationsForm from './RBOperationsForm'

const TreeVisualizer = () => {
  const { algorithm } = useParams()
  const svgRef = useRef(null)
  const containerRef = useRef(null)
  const { 
    tree, 
    visitedNodes, 
    currentNode,
    setTree, 
    resetVisualization,
    resetTraversal,
    traversalType,
    createSampleTree,  // Add these functions at component top level
    createSampleAVL,
    createSampleRB 
  } = useTreeStore()
  
  const [treeLayout, setTreeLayout] = useState({ nodes: [], links: [] })
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 })
  const [activeNodePath, setActiveNodePath] = useState([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 })
  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef({ x: 0, y: 0 })

  // Set up resize observer for responsive sizing
  useLayoutEffect(() => {
    if (!containerRef.current) return
    
    // Initial size calculation
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setDimensions({
          width: Math.max(800, rect.width), 
          height: Math.max(500, rect.height - 20)
        })
      }
    }
    
    updateSize()
    
    // Create resize observer
    const observer = new ResizeObserver(() => {
      updateSize()
    })
    
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  // Initialize tree with the appropriate default based on algorithm type
  useEffect(() => {
    // Now we can safely use the functions from the store
    if (algorithm === 'avl-tree') {
      // Use the proper AVL tree creation function
      const avlTree = createSampleAVL();
      setTree(avlTree);
    } else if (algorithm === 'red-black-tree') {
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
  }, [algorithm, createSampleAVL, createSampleRB, createSampleTree, setTree, resetVisualization]);

  // Generate layout when tree or dimensions change
  useEffect(() => {
    if (!tree || !isLoaded) return
    
    try {
      const layout = createTreeLayout(tree, dimensions.width, dimensions.height)
      setTreeLayout(layout)
      
      // Center the tree initially
      if (layout.nodes.length > 0) {
        const rootNode = layout.nodes.find(n => n.parentId === null);
        if (rootNode) {
          // Center horizontally by default
          setTransform(prev => ({
            ...prev,
            x: dimensions.width / 2 - rootNode.x,
          }));
        }
      }
      
      const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
      
      // Ensure links are visible during transition
      gsap.set(".tree-link", { 
        opacity: 1,
        visibility: "visible",
        pointerEvents: "none"
      });
      
      // First position the nodes instantly
      gsap.set(".tree-node", {
        opacity: 0.5,
        scale: 0.8
      });
      
      // Then animate them to their final positions
      timeline
        .to(".tree-node", {
          x: (i) => {
            if (i >= layout.nodes.length) return 0;
            return layout.nodes[i].x;
          },
          y: (i) => {
            if (i >= layout.nodes.length) return 0;
            return layout.nodes[i].y;
          },
          opacity: 1,
          scale: 1,
          duration: 0.8,
          stagger: {
            from: "start",
            amount: 0.3
          },
        })
        .to(".tree-link", {
          opacity: 1,
          duration: 0.5,
          stagger: 0.05,
          overwrite: "auto"
        }, "<0.1");
        
    } catch (error) {
      console.error("Error creating tree layout:", error);
    }
  }, [tree, dimensions, isLoaded])

  // Calculate path from current node to root
  const findPathToRoot = (nodeId) => {
    if (!treeLayout.nodes) return []
    
    const path = [nodeId]
    let currentNodeObj = treeLayout.nodes.find(n => n.id === nodeId)
    
    while (currentNodeObj && currentNodeObj.parentId !== null) {
      path.push(currentNodeObj.parentId)
      currentNodeObj = treeLayout.nodes.find(n => n.id === currentNodeObj.parentId)
    }
    
    return path
  }

  // Track current path when node changes
  useEffect(() => {
    if (!currentNode) {
      setActiveNodePath([])
      return
    }
    
    const path = findPathToRoot(currentNode)
    setActiveNodePath(path)
    
    // Animate current node with GSAP
    const currentNodeEl = document.querySelector(`.tree-node[data-id="${currentNode}"]`)
    if (currentNodeEl) {
      gsap.timeline()
        .to(currentNodeEl, { 
          scale: 1.2, 
          duration: 0.3,
          ease: "elastic.out(1.2, 0.5)"
        })
        .to(currentNodeEl.querySelector('circle'), {
          fill: "#0ea5e9",
          stroke: "#facc15",
          strokeWidth: 3,
          duration: 0.2
        }, "<")
    }
  }, [currentNode, treeLayout])

  // Get traversal info based on current type
  const getTraversalInfo = () => {
    if (algorithm === 'avl-tree') {
      return {
        title: 'AVL Tree',
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
    node.right = rightRotate(node.right)
    return leftRotate(node)
  }
  
  return node`,
        description: 'AVL Tree is a self-balancing binary search tree where the difference between heights of left and right subtrees cannot be more than one for all nodes.'
      };
    }
    
    switch (traversalType) {
      case 'inorder':
        return {
          title: 'Inorder Traversal',
          code: `Inorder(root)
  if (root == null) return
  Inorder(root.left)
  Visit(root)
  Inorder(root.right)`,
          description: 'Visits nodes in order: left subtree, current node, then right subtree. In a BST, this produces sorted values.'
        }
      case 'preorder':
        return {
          title: 'Preorder Traversal',
          code: `Preorder(root)
  if (root == null) return
  Visit(root)
  Preorder(root.left)
  Preorder(root.right)`,
          description: 'Visits current node before subtrees. Useful for creating a copy of the tree or prefix expression evaluation.'
        }
      case 'postorder':
        return {
          title: 'Postorder Traversal',
          code: `Postorder(root)
  if (root == null) return
  Postorder(root.left)
  Postorder(root.right)
  Visit(root)`,
          description: 'Visits current node after subtrees. Useful for deletion operations and postfix expression evaluation.'
        }
      case 'levelorder':
        return {
          title: 'Level Order Traversal',
          code: `LevelOrder(root)
  if (root == null) return
  Queue q
  q.enqueue(root)
  while (!q.isEmpty())
    node = q.dequeue()
    Visit(node)
    if (node.left) q.enqueue(node.left)
    if (node.right) q.enqueue(node.right)`,
          description: 'Visits nodes level by level from top to bottom. Uses a queue to track nodes at each level.'
        }
      default:
        return { title: '', code: '', description: '' }
    }
  }
  
  const info = getTraversalInfo()

  // Add zoom handler
  const handleWheel = (e) => {
    e.preventDefault()
    const delta = -e.deltaY
    const scaleFactor = 0.05
    const newScale = Math.max(0.5, Math.min(2, transform.scale + (delta > 0 ? scaleFactor : -scaleFactor)))
    
    setTransform(prev => ({
      ...prev,
      scale: newScale
    }))
  }

  // Add drag handlers
  const handleMouseDown = (e) => {
    setIsDragging(true)
    dragRef.current = {
      x: e.clientX - transform.x,
      y: e.clientY - transform.y
    }
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    
    setTransform(prev => ({
      ...prev,
      x: e.clientX - dragRef.current.x,
      y: e.clientY - dragRef.current.y
    }))
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Add double click to reset
  const handleDoubleClick = () => {
    setTransform({ x: 0, y: 0, scale: 1 })
  }

  return (
    <div className="flex flex-col w-full h-full p-4">
      <h2 className="text-xl font-bold text-sky-400 mb-8">
        {algorithm.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ')}
      </h2>

      {/* Show appropriate operations form based on algorithm */}
      {algorithm === 'binary-search-tree' ? (
        <BSTOperationsForm />
      ) : algorithm === 'avl-tree' ? (
        <AVLOperationsForm />
      ) : algorithm === 'red-black-tree' ? (
        <RBOperationsForm />
      ) : (
        <div className="mb-4 p-4 bg-slate-800 rounded-lg">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-lg text-white font-medium">{info.title}</h3>
              <p className="text-gray-300 mt-1 text-sm">{info.description}</p>
            </div>
            <div className="ml-4 p-3 bg-slate-900 rounded-md max-w-xs overflow-auto">
              <pre className="text-xs text-sky-300 font-mono whitespace-pre">
                {info.code}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Show TreeControls only for traversal algorithms */}
      {algorithm !== 'binary-search-tree' && algorithm !== 'avl-tree' && <TreeControls />}

      <div 
        ref={containerRef}
        className="flex-1 bg-slate-900 rounded-lg overflow-hidden mt-4 min-h-[400px]"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        {treeLayout.nodes?.length > 0 && (
          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
            preserveAspectRatio="xMidYMid meet"
          >
            <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}>
              {treeLayout.links?.map((link, i) => (
                <TreeLink
                  key={`link-${i}`}
                  link={link}
                  isActive={visitedNodes.includes(link.target.id)}
                  isPath={
                    activeNodePath.includes(link.source.id) && 
                    activeNodePath.includes(link.target.id)
                  }
                />
              ))}
              {treeLayout.nodes?.map((node) => (
                <TreeNode
                  key={`node-${node.id}`}
                  node={node}
                  visited={visitedNodes.includes(node.id)}
                  isCurrent={currentNode === node.id}
                  isInPath={activeNodePath.includes(node.id)}
                />
              ))}
            </g>
          </svg>
        )}
        <div className="absolute px-2 py-1 text-sm text-gray-300 rounded bg-slate-800 bg-opacity-70 bottom-2 left-70">
          Scroll to zoom, drag to Tree
        </div>
      </div>
    </div>
  )
}

export default TreeVisualizer
