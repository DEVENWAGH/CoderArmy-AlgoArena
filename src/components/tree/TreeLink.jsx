import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

const TreeLink = ({ link, isActive, isPath }) => {
  const pathRef = useRef(null)
  
  // Generate curved path between nodes
  const generatePath = () => {
    const sx = link.source.x
    const sy = link.source.y
    const tx = link.target.x
    const ty = link.target.y
    
    // Control point for the curve (between source and target)
    const midY = (sy + ty) / 2
    
    return `M ${sx} ${sy} C ${sx} ${midY}, ${tx} ${midY}, ${tx} ${ty}`
  }
  
  // Animate the link when active or in path
  useEffect(() => {
    if (!pathRef.current) return
    
    const tl = gsap.timeline({
      defaults: {
        duration: 0.3,
        ease: "power2.inOut"
      }
    })
    
    if (isPath) {
      tl.to(pathRef.current, {
        stroke: "#f59e0b",
        strokeWidth: 3,
        opacity: 1,
        overwrite: "auto"
      })
    } else if (isActive) {
      tl.to(pathRef.current, {
        stroke: "#38bdf8",
        strokeWidth: 2.5,
        opacity: 0.8,
        overwrite: "auto"
      })
    } else {
      tl.to(pathRef.current, {
        stroke: "#1e40af",
        strokeWidth: 2,
        opacity: 0.6, // Increased base opacity
        overwrite: "auto"
      })
    }
    
    return () => tl.kill()
  }, [isActive, isPath])

  return (
    <path
      ref={pathRef}
      d={generatePath()}
      className="tree-link"
      stroke="#1e40af"
      strokeWidth={2}
      fill="none"
      opacity={0.6} // Increased initial opacity
      strokeLinecap="round"
      style={{ pointerEvents: 'none' }} // Prevent interference with interactions
      vectorEffect="non-scaling-stroke" // Maintain consistent line width
    />
  )
}

export default TreeLink
