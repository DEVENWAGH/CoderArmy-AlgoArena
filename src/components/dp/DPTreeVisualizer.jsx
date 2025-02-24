import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import * as d3 from 'd3'

const DPTreeVisualizer = ({ data, currentCell, type }) => {
  const svgRef = useRef()
  const containerRef = useRef()
  
  // Adjust width calculations for better centering
  const width = data?.length <= 8 
    ? 1100
    : Math.max(3000, data?.length * 500) // Reduced multiplier for better fit
  
  const height = Math.max(600, data?.length * 100)
  const isLargeTree = data?.length > 8

  // Update scroll position on tree changes
  useEffect(() => {
    if (containerRef.current && data?.length > 8) {
      requestAnimationFrame(() => {
        const container = containerRef.current
        const scrollWidth = container.scrollWidth - container.clientWidth
        // Set scroll to 70% of total scroll width
        container.scrollLeft = scrollWidth * 0.7
      })
    }
  }, [data, width])

  useEffect(() => {
    if (!data || !data.length) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const g = svg.append("g")
      .attr("transform", `translate(${width/2 + 200},40)`) // Added 200px left margin

    const createTreeData = (table, type, index = null) => {
      switch (type) {
        case 'fibonacci':
          if (index === null) index = table.length - 1
          if (index <= 1) {
            return {
              name: `F(${index})`,
              value: table[index],
              isBase: true
            }
          }
          return {
            name: `F(${index})`,
            value: table[index],
            children: [
              createTreeData(table, type, index - 1),
              createTreeData(table, type, index - 2)
            ]
          }

        case 'knapsack':
          if (!Array.isArray(table[0])) return null
          const rows = table.length
          const cols = table[0].length
          return {
            name: `K(${rows-1},${cols-1})`,
            value: table[rows-1][cols-1],
            children: [
              {
                name: `K(${rows-1},${cols-2})`,
                value: table[rows-1][cols-2],
                children: []
              },
              {
                name: `K(${rows-2},${cols-1})`,
                value: table[rows-2][cols-1],
                children: []
              }
            ]
          }

        default:
          return {
            name: 'Root',
            value: 0,
            children: []
          }
      }
    }

    const treeData = createTreeData(data, type)
    const root = d3.hierarchy(treeData)

    const treeLayout = d3.tree()
      .size([width - 200, height - 60]) // Increased left/right margins
      .nodeSize([isLargeTree ? 30 : 45, isLargeTree ? 50 : 70])
      .separation((a, b) => {
        // More spacing between nodes
        return a.parent === b.parent ? 
          (isLargeTree ? 1.5 : 1.2) : 
          (isLargeTree ? 2.2 : 1.5)
      })

    const tree = treeLayout(root)

    // Adjust positions differently based on tree size
    tree.descendants().forEach(d => {
      d.y = d.depth * (isLargeTree ? 70 : 90)
      // Only scale positions for large trees
      if (isLargeTree) {
        d.x = d.x * 0.8
      }
    })

    // Center nodes horizontally at each level
    const levels = {}
    tree.descendants().forEach(d => {
      if (!levels[d.depth]) levels[d.depth] = []
      levels[d.depth].push(d)
    })

    Object.values(levels).forEach(nodes => {
      const levelWidth = nodes.reduce((w, n) => w + Math.abs(n.x), 0) / nodes.length
      nodes.forEach(node => {
        node.x = node.x * 0.8  // Scale x positions for centering
        node.y = node.depth * 80  // Fixed vertical spacing
      })
    })

    // Add vertical links
    const links = g.selectAll('path.link')
      .data(tree.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', d3.linkVertical()
        .x(d => d.x)
        .y(d => d.y))
      .attr('stroke', '#4B5563')
      .attr('stroke-width', 2)
      .attr('fill', 'none')

    // Add nodes with animations
    const nodes = g.selectAll('g.node')
      .data(tree.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x},${d.y})`)

    // Smaller nodes and text for large trees
    nodes.append('circle')
      .attr('r', 0)
      .attr('fill', d => {
        if (d.data.isBase) return '#10B981'
        if (d.data.name === `F(${currentCell})`) return '#FCD34D'
        return '#3B82F6'
      })
      .attr('stroke', '#E5E7EB')
      .attr('stroke-width', 1)
      .transition()
      .duration(500)
      .attr('r', d => {
        const baseSize = isLargeTree ? 10 : 14
        return d.data.isBase ? baseSize - 2 : baseSize
      })

    // Add value text
    nodes.append('text')
      .attr('dy', '0.3em')
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('font-size', isLargeTree ? '8px' : '10px')
      .text(d => d.data.value)

    // Remove duplicate function labels
    nodes.append('text')
      .attr('dy', isLargeTree ? -10 : -12)
      .attr('text-anchor', 'middle')
      .attr('fill', '#9CA3AF')
      .attr('font-size', isLargeTree ? '7px' : '9px')
      .text(d => d.data.name)

    // Add recursive formula below current node
    if (currentCell > 1) {
      nodes.append('text')
        .attr('dy', 20)  // Closer to node
        .attr('text-anchor', 'middle')
        .attr('fill', '#60A5FA')
        .attr('font-size', '10px')
        .text(d => {
          if (d.data.name === `F(${currentCell})`) {
            return `${d.data.value} = ${data[currentCell-1]} + ${data[currentCell-2]}`
          }
          return ''
        })
    }

  }, [data, currentCell, type])

  // Center scroll on load for large trees
  useEffect(() => {
    if (containerRef.current && data?.length > 8) {
      setTimeout(() => {
        const container = containerRef.current
        container.scrollLeft = (container.scrollWidth - container.clientWidth) / 2
      }, 100)
    }
  }, [data?.length])

  return (
    <div className="relative min-h-full">
      {/* Fixed Info panel - adjusted top position */}
      <div className="fixed z-50 border rounded-lg shadow-lg left-72 top-48 bg-slate-800 border-slate-700">
        <div className="flex flex-col p-3 space-y-1 text-xs">
          <div className="font-medium text-yellow-400">Current: F({currentCell})</div>
          <div className="text-green-400">Base: F(0)=0, F(1)=1</div>
          <div className="text-blue-400">F(n) = F(n-1) + F(n-2)</div>
        </div>
      </div>

      {/* Container with different styles based on tree size */}
      <div 
        ref={containerRef}
        className={`mt-16 ${
          data?.length <= 8 
            ? 'flex justify-center px-4' 
            : 'min-w-max overflow-x-auto px-8'
        }`}
        style={data?.length > 8 ? { 
          scrollBehavior: 'smooth',
          scrollPaddingLeft: '70%' 
        } : {}}
      >
        <div className={data?.length <= 8 ? 'w-[90%]' : ''}>
          <svg
            ref={svgRef}
            className="rounded-lg bg-slate-900"
            width={width}
            height={height}
            style={{ 
              width: data?.length <= 8 ? '100%' : width,
              minWidth: data?.length <= 8 ? 'auto' : width,
              maxWidth: data?.length <= 8 ? '100%' : 'none'
            }}
            preserveAspectRatio="xMidYMin meet"
          />
        </div>
      </div>
    </div>
  )
}

export default DPTreeVisualizer
