import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

const TreeNode = ({ node, visited, isCurrent, isInPath }) => {
  const nodeRef = useRef(null)
  const circleRef = useRef(null)
  const textRef = useRef(null)
  
  // Setup initial node animation
  useEffect(() => {
    if (!nodeRef.current) return
    
    // For proper GSAP targeting
    nodeRef.current.setAttribute('data-id', node.id)
  }, [node.id])

  // Handle animations for node state changes
  useEffect(() => {
    if (!nodeRef.current || !circleRef.current || !textRef.current) return
    
    const tl = gsap.timeline({ defaults: { duration: 0.3 } })
    
    if (isCurrent) {
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
      // Use node color if it exists (for RB tree), otherwise default color
      const nodeFill = node.data.color === 'RED' ? "#ef4444" : 
                       node.data.color === 'BLACK' ? "#1e293b" : "#1e293b";
      
      tl.to(circleRef.current, {
        r: 20,
        fill: nodeFill,
        stroke: "#38bdf8",
        strokeWidth: 2,
        ease: "power1.inOut"
      })
      .to(nodeRef.current, {
        scale: 1,
        ease: "power1.inOut"
      }, "<")
      .to(textRef.current, {
        fill: "#e5e7eb",
        fontWeight: "normal"
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
        stroke="#38bdf8"
        strokeWidth={2}
      />
      <text
        ref={textRef}
        dy=".35em"
        textAnchor="middle"
        className="text-sm fill-gray-200 font-medium select-none"
      >
        {node.data.value}
      </text>
    </g>
  )
}

export default TreeNode
