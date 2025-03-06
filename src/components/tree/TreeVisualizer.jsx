import React, { useEffect, useState, useRef, useLayoutEffect } from 'react'
import { useParams } from 'react-router-dom'
import { gsap } from 'gsap'
import useTreeStore from '../../store/treeStore'
import TreeNode from './TreeNode'
import TreeLink from './TreeLink'
import TreeControls from './TreeControls'
import { createTreeLayout } from '../../utils/treeLayout'
import { createDefaultTree } from '../../utils/defaultTree'

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
    traversalType
  } = useTreeStore()
  
  const [treeLayout, setTreeLayout] = useState({ nodes: [], links: [] })
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 })
  const [activeNodePath, setActiveNodePath] = useState([])
  const [isLoaded, setIsLoaded] = useState(false)

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

  // Initialize tree with a balanced tree on component mount
  useEffect(() => {
    const defaultTree = createDefaultTree()
    setTree(defaultTree)
    
    // Short delay to ensure the container is sized
    setTimeout(() => {
      setIsLoaded(true)
    }, 10)
    
    return () => resetVisualization()
  }, [])

  // Generate layout when tree or dimensions change
  useEffect(() => {
    if (!tree || !isLoaded) return
    
    try {
      // Create tree layout with current dimensions
      const layout = createTreeLayout(tree, dimensions.width, dimensions.height)
      setTreeLayout(layout)
      
      // Animate nodes with stagger effect
      const timeline = gsap.timeline()
      
      // First clear existing animations
      gsap.set(".tree-node", { clearProps: "transform, opacity" })
      
      // Animate nodes appearing
      timeline.to(".tree-node", {
        x: (i) => layout.nodes[i].x,
        y: (i) => layout.nodes[i].y,
        opacity: 1,
        duration: 0.4,
        stagger: {
          from: "center",
          amount: 0.8
        },
        ease: "back.out(1.7)"
      })
      
      // Fade in links after nodes appear
      timeline.from(".tree-link", {
        opacity: 0,
        duration: 0.3,
        stagger: 0.03,
        ease: "power1.inOut"
      }, "-=0.5")
      
    } catch (error) {
      console.error("Error creating tree layout:", error)
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

  return (
    <div className="flex flex-col w-full h-full p-4">
      <h2 className="text-xl font-bold text-sky-400 mb-2">
        {algorithm.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ')}
      </h2>
      
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

      <TreeControls />

      <div 
        ref={containerRef}
        className="flex-1 bg-slate-900 rounded-lg overflow-hidden mt-4 min-h-[400px]"
      >
        {treeLayout.nodes?.length > 0 && (
          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
            preserveAspectRatio="xMidYMid meet"
          >
            <g>
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
      </div>
    </div>
  )
}

export default TreeVisualizer
