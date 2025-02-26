import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'

const DPTreeVisualizer = ({ data, currentCell, type }) => {
  const svgRef = useRef(null)
  const containerRef = useRef(null)
  const timelineRef = useRef(null)

  gsap.registerPlugin(useGSAP)
  
  useGSAP(() => {
    if (timelineRef.current) {
      timelineRef.current.kill()
    }
    timelineRef.current = gsap.timeline()
  }, { scope: containerRef })

  useEffect(() => {
    if (!data || !data.length) return
    
    const buildTree = () => {
      switch (type) {
        case 'fibonacci': 
          return buildFibonacciTree(data.length - 1)
        case 'lis':
          return buildLISTree(data)
        case 'knapsack':
          return buildKnapsackTree(data)
        default:
          return buildFibonacciTree(data.length - 1)
      }
    }

    // Build a fibonacci tree recursively
    const buildFibonacciTree = (n) => {
      if (n <= 1) {
        return {
          id: `fib-${n}`,
          name: `F(${n})`,
          value: n,
          isBaseCase: true,
          children: []
        }
      }

      return {
        id: `fib-${n}`,
        name: `F(${n})`,
        value: data[n],
        isBaseCase: false,
        isCurrent: currentCell === n,
        hasOverlap: false,
        children: [
          buildFibonacciTree(n-1),
          buildFibonacciTree(n-2)
        ]
      }
    }

    // Build an LIS tree
    const buildLISTree = (dp) => {
      // Simplified tree for LIS
      const root = {
        id: 'lis-root',
        name: 'LIS',
        value: Math.max(...dp),
        isBaseCase: false,
        children: []
      }
      
      // Create first level nodes for each element
      for (let i = 0; i < dp.length; i++) {
        const node = {
          id: `lis-${i}`,
          name: `LIS(${i})`,
          value: dp[i],
          isBaseCase: dp[i] === 1,
          isCurrent: currentCell === i,
          children: []
        }
        
        // Add dependencies
        for (let j = 0; j < i; j++) {
          if (data[j] < data[i]) {
            node.children.push({
              id: `lis-${j}`,
              name: `LIS(${j})`,
              value: dp[j],
              isBaseCase: dp[j] === 1,
              isCurrent: false,
              children: []
            })
          }
        }
        
        root.children.push(node)
      }
      
      return root
    }

    // Build a simplified knapsack tree
    const buildKnapsackTree = (dp) => {
      const rows = dp.length
      const cols = dp[0].length
      
      // Create a simplified tree
      const root = {
        id: 'knapsack-root',
        name: `KS(${rows-1},${cols-1})`,
        value: dp[rows-1][cols-1],
        isBaseCase: false,
        isCurrent: currentCell && currentCell[0] === rows-1 && currentCell[1] === cols-1,
        children: []
      }
      
      // Simplify by showing only a few significant sub-problems
      const addLevels = (node, i, w, depth = 0) => {
        if (depth > 3 || i <= 0 || w <= 0) {
          return
        }
        
        // Not taking the item
        const notTake = {
          id: `ks-${i-1}-${w}`,
          name: `KS(${i-1},${w})`,
          value: dp[i-1] ? dp[i-1][w] || 0 : 0,
          isBaseCase: i-1 === 0 || w === 0,
          isCurrent: currentCell && currentCell[0] === i-1 && currentCell[1] === w,
          children: []
        }
        
        // Taking the item (if possible)
        const take = {
          id: `ks-${i-1}-${w-1}`,
          name: `KS(${i-1},${w-1})`,
          value: (i-1 >= 0 && w-1 >= 0 && dp[i-1]) ? dp[i-1][w-1] || 0 : 0,
          isBaseCase: i-1 === 0 || w-1 === 0,
          isCurrent: currentCell && currentCell[0] === i-1 && currentCell[1] === w-1,
          children: []
        }
        
        node.children.push(notTake)
        node.children.push(take)
        
        // Recursively add more levels
        if (depth < 2) {
          addLevels(notTake, i-1, w, depth+1)
          if (w-1 >= 0) addLevels(take, i-1, w-1, depth+1)
        }
      }
      
      addLevels(root, rows-1, cols-1)
      return root
    }

    // Estimate tree size to determine SVG dimensions
    const estimateTreeSize = (root) => {
      const countNodes = (node) => {
        if (!node.children || node.children.length === 0) return 1
        return 1 + node.children.reduce((sum, child) => sum + countNodes(child), 0)
      }
      
      const totalNodes = countNodes(root)
      const estimatedWidth = Math.max(1200, totalNodes * 40)
      const estimatedHeight = Math.max(800, totalNodes * 15)
      
      return { width: estimatedWidth, height: estimatedHeight }
    }

    // Build the tree data
    const treeData = buildTree()
    const { width, height } = estimateTreeSize(treeData)
    
    // Clear previous content
    const svgEl = svgRef.current
    d3.select(svgEl).selectAll("*").remove()
    
    const svg = d3.select(svgEl)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
    
    // Create a group element to contain all elements
    const g = svg.append('g')
      .attr('transform', `translate(${width/2}, 50)`)
    
    // Create a hierarchical layout
    const root = d3.hierarchy(treeData)
    
    // Use tree layout
    const treeLayout = d3.tree()
      .size([width - 200, height - 150])
      .nodeSize([70, 100])
      .separation((a, b) => a.parent === b.parent ? 1.2 : 2)
    
    const tree = treeLayout(root)
    
    // Draw the links
    g.selectAll('path.link')
      .data(tree.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', d3.linkHorizontal()
        .x(d => d.y) // Swap x and y for horizontal layout
        .y(d => d.x))
      .attr('stroke', '#4B5563')
      .attr('stroke-width', 2)
      .attr('fill', 'none')
      .style('opacity', 0) // Start invisible
    
    // Create a group for each node
    const nodeGroups = g.selectAll('g.node')
      .data(tree.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.y},${d.x})`) // Swap x and y for horizontal layout
      .style('opacity', 0) // Start invisible
    
    // Add circles for nodes with different colors based on conditions
    nodeGroups.append('circle')
      .attr('r', d => d.data.isBaseCase ? 18 : 22)
      .attr('fill', d => {
        if (d.data.isCurrent) return '#FCD34D' // Yellow for current
        if (d.data.isBaseCase) return '#10B981' // Green for base cases
        if (d.data.hasOverlap) return '#60A5FA' // Blue for overlapping subproblems
        return '#3B82F6' // Default blue
      })
      .attr('stroke', '#E5E7EB')
      .attr('stroke-width', 2)
    
    // Add text for node names
    nodeGroups.append('text')
      .attr('dy', '.3em')
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('font-size', '14px')
      .text(d => d.data.name)
    
    // Add text for return values
    nodeGroups.append('text')
      .attr('dy', 30)
      .attr('text-anchor', 'middle')
      .attr('fill', '#D1D5DB')
      .attr('font-size', '12px')
      .text(d => d.data.value !== undefined ? d.data.value : '?')

    // Create a GSAP animation timeline
    const tl = timelineRef.current
    
    // Mark visited nodes first to simulate recursion traversal
    const markVisitedSequence = (nodes) => {
      // Sort nodes by depth for animation sequence
      return nodes.sort((a, b) => a.depth - b.depth)
    }
    
    // Create a sequence for depth-first-search like in recursion visualization
    const visitedSequence = markVisitedSequence(tree.descendants())
    
    // Animate nodes appearing
    visitedSequence.forEach((node, i) => {
      // Animate the node appearance
      tl.to(nodeGroups.nodes()[tree.descendants().indexOf(node)], {
        opacity: 1,
        duration: 0.3,
        ease: 'power1.inOut'
      }, i * 0.2)
      
      // If it has a parent, animate the link too
      if (node.parent) {
        const linkIndex = tree.links().findIndex(
          link => link.source === node.parent && link.target === node
        )
        if (linkIndex >= 0) {
          tl.to(g.selectAll('path.link').nodes()[linkIndex], {
            opacity: 1,
            duration: 0.3,
            ease: 'power1.inOut'
          }, i * 0.2)
        }
      }
    })
    
    // Add a title on top
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .attr('font-size', '20px')
      .attr('fill', 'white')
      .text(`${type.toUpperCase()} Recursion Tree`)

    // Add color legend
    const legend = svg.append('g')
      .attr('transform', `translate(20, ${height - 80})`)
    
    // Base case
    legend.append('circle')
      .attr('cx', 10)
      .attr('cy', 10)
      .attr('r', 10)
      .attr('fill', '#10B981')
    
    legend.append('text')
      .attr('x', 25)
      .attr('y', 15)
      .attr('fill', 'white')
      .text('Base Case')
    
    // Current node
    legend.append('circle')
      .attr('cx', 10)
      .attr('cy', 40)
      .attr('r', 10)
      .attr('fill', '#FCD34D')
    
    legend.append('text')
      .attr('x', 25)
      .attr('y', 45)
      .attr('fill', 'white')
      .text('Current Node')
    
    // Overlapping subproblem
    legend.append('circle')
      .attr('cx', 150)
      .attr('cy', 10)
      .attr('r', 10)
      .attr('fill', '#60A5FA')
    
    legend.append('text')
      .attr('x', 165)
      .attr('y', 15)
      .attr('fill', 'white')
      .text('Overlapping Subproblem')
    
    // Regular node
    legend.append('circle')
      .attr('cx', 150)
      .attr('cy', 40)
      .attr('r', 10)
      .attr('fill', '#3B82F6')
    
    legend.append('text')
      .attr('x', 165)
      .attr('y', 45)
      .attr('fill', 'white')
      .text('Regular Node')

    // Add controls
    const controls = svg.append('g')
      .attr('transform', `translate(${width - 150}, ${height - 60})`)
    
    // Play button
    controls.append('rect')
      .attr('width', 40)
      .attr('height', 40)
      .attr('rx', 5)
      .attr('fill', '#3B82F6')
      .attr('cursor', 'pointer')
      .on('click', () => {
        if (tl.paused()) tl.play()
        else tl.pause()
      })
    
    controls.append('text')
      .attr('x', 20)
      .attr('y', 25)
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('pointer-events', 'none')
      .text('▶/❚❚')
    
    // Reset button
    controls.append('rect')
      .attr('x', 50)
      .attr('width', 40)
      .attr('height', 40)
      .attr('rx', 5)
      .attr('fill', '#EF4444')
      .attr('cursor', 'pointer')
      .on('click', () => {
        tl.restart()
      })
    
    controls.append('text')
      .attr('x', 70)
      .attr('y', 25)
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('pointer-events', 'none')
      .text('↺')
    
    // Add zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
      })
    
    svg.call(zoom)
    
    // Auto-play the animation
    tl.play()
    
  }, [data, currentCell, type])

  return (
    <div ref={containerRef} className="flex items-center justify-center w-full h-full">
      <svg
        ref={svgRef}
        className="w-full h-full"
        style={{ 
          minHeight: "600px", 
          borderRadius: "0.5rem", 
          backgroundColor: "#1F2937" // Dark background
        }}
      />
      <div className="absolute text-sm text-gray-400 bottom-2 left-2">
        Scroll to zoom, drag to pan
      </div>
    </div>
  )
}

export default DPTreeVisualizer
