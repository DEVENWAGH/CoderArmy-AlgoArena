import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

const TreeNode = ({ node, visited, isCurrent, isInPath }) => {
  const nodeRef = useRef(null)
  const circleRef = useRef(null)
  const textRef = useRef(null)
  
  // Setup initial node animation and data attributes
  useEffect(() => {
    if (!nodeRef.current) return
    
    // For proper GSAP targeting
    nodeRef.current.setAttribute('data-id', node.id)
    
    // Ensure node is positioned precisely at its coordinates
    // This is critical for single node insertions
    gsap.set(nodeRef.current, {
      x: node.x,
      y: node.y
    });
    
    // Add color data attribute for Red-Black trees
    if (node.data.color) {
      nodeRef.current.setAttribute('data-color', node.data.color)
    }
  }, [node.id, node.data.color, node.x, node.y])

  // Handle animations for node state changes
  useEffect(() => {
    if (!nodeRef.current || !circleRef.current || !textRef.current) return
    
    const tl = gsap.timeline({ defaults: { duration: 0.3 } })
    
    if (isCurrent) {
      // Highlight current node with animation
      tl.to(circleRef.current, {
        r: 25,
        fill: "#0ea5e9",
        stroke: "#facc15",
        strokeWidth: 3,
        ease: "back.out(1.7)"
      })
      .to(nodeRef.current, {
        scale: 1.2,
        ease: "elastic.out(1.2, 0.5)"
      }, "<")
      .to(textRef.current, {
        fill: "#ffffff",
        fontWeight: "bold",
      }, "<")
    } else if (isInPath) {
      // Style nodes in the current path
      tl.to(circleRef.current, {
        r: 22,
        fill: "#38bdf8",
        stroke: "#facc15", 
        strokeWidth: 2,
        ease: "power1.inOut"
      })
      .to(nodeRef.current, {
        scale: 1.1,
        ease: "back.out(1.5)"
      }, "<")
      .to(textRef.current, {
        fill: "#ffffff",
      }, "<")
    } else if (visited) {
      // Style for visited nodes
      tl.to(circleRef.current, {
        r: 20,
        fill: "#22c55e",
        stroke: "#38bdf8",
        strokeWidth: 2,
        ease: "power1.inOut"
      })
      .to(nodeRef.current, {
        scale: 1,
        ease: "power1.inOut"
      }, "<")
      .to(textRef.current, {
        fill: "#ffffff",
        fontWeight: "normal"
      }, "<")
    } else {
      // Default styling with special handling for Red-Black trees
      const isRedNode = node.data.color === 'RED';
      const nodeFill = isRedNode ? "#ef4444" : 
                      node.data.color === 'BLACK' ? "#1e293b" : "#1e293b";
      
      tl.to(circleRef.current, {
        r: isRedNode ? 18 : 20, // Red nodes slightly smaller for visual distinction
        fill: nodeFill,
        stroke: isRedNode ? "#fed7d7" : "#38bdf8", // Lighter stroke for red nodes
        strokeWidth: isRedNode ? 1.5 : 2,
        ease: "power1.inOut"
      })
      .to(nodeRef.current, {
        scale: 1,
        ease: "power1.inOut"
      }, "<")
      .to(textRef.current, {
        fill: "#e5e7eb",
        fontWeight: isRedNode ? "medium" : "normal" // Slightly bolder text for red nodes
      }, "<")
    }
    
    return () => {
      tl.kill()
    }
  }, [isCurrent, isInPath, visited, node.data.color])

  return (
    <g
      ref={nodeRef}
      className="tree-node"
      transform={`translate(${node.x},${node.y})`}
    >
      <circle
        ref={circleRef}
        r={20}
        fill={node.data.color === 'RED' ? "#ef4444" : "#1e293b"}
        stroke={node.data.color === 'RED' ? "#fed7d7" : "#38bdf8"}
        strokeWidth={node.data.color === 'RED' ? 1.5 : 2}
      />
      <text
        ref={textRef}
        dy=".35em"
        textAnchor="middle"
        className={`text-sm fill-gray-200 select-none ${node.data.color === 'RED' ? 'font-medium' : 'font-normal'}`}
      >
        {node.data.value}
      </text>
    </g>
  )
}

export default TreeNode
