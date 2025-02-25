import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

const DPTreeVisualizer = ({ data, currentCell, type }) => {
  const svgRef = useRef()
  const [isRendering, setIsRendering] = useState(false)
  const animationRef = useRef(null)
  
  // Increase initial width for better visibility
  const width = data?.length <= 8 
    ? 1200
    : Math.max(3000, data?.length * 500)
  
  const height = Math.max(700, data?.length * 120)
  const isLargeTree = data?.length > 8

  // Debug to check if data is available
  useEffect(() => {
    console.log("Data received:", data, "Type:", type, "Current cell:", currentCell);
  }, [data, type, currentCell]);

  // Clean up any previous animations when component unmounts or data changes
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        animationRef.current.forEach(timer => {
          if (timer) clearTimeout(timer);
        });
      }
    };
  }, [data, currentCell, type]);

  useEffect(() => {
    // Immediate render for debugging - remove isRendering check temporarily
    if (!data || !data.length) return
    
    // Clear previous timeouts
    if (animationRef.current) {
      animationRef.current.forEach(timer => {
        if (timer) clearTimeout(timer);
      });
    }
    
    // Store all timeouts for cleanup
    const timeouts = [];
    animationRef.current = timeouts;
    
    // Clear previous content
    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    // Add a background rect for debugging
    svg.append("rect")
       .attr("width", width)
       .attr("height", height)
       .attr("fill", "#1E293B")
       .attr("stroke", "#475569")
       .attr("stroke-width", 1);

    // Position the tree more explicitly
    const g = svg.append("g")
      .attr("transform", `translate(${width/2},80)`)

    const createTreeData = (table, type, index = null) => {
      switch (type) {
        case 'fibonacci':
          if (index === null) index = table.length - 1
          if (index <= 1) {
            return {
              name: `F(${index})`,
              value: table[index],
              isBase: true,
              index: index,
              id: `node-${index}`
            }
          }
          return {
            name: `F(${index})`,
            value: table[index],
            index: index,
            id: `node-${index}`,
            children: [
              createTreeData(table, type, index - 1),
              createTreeData(table, type, index - 2)
            ]
          }
        // ...other cases remain the same
        default:
          return {
            name: 'Root',
            value: 0,
            id: 'root',
            children: []
          }
      }
    }

    try {
      // Create the tree data
      console.log("Creating tree data...");
      const treeData = createTreeData(data, type);
      console.log("Tree data created:", treeData);
      
      const root = d3.hierarchy(treeData);
      console.log("Hierarchy created:", root);

      // Configure the tree layout
      const treeLayout = d3.tree()
        .size([width * 0.8, height - 100]) // Use more space
        .nodeSize([isLargeTree ? 40 : 60, isLargeTree ? 60 : 90]) // Increase node spacing
        .separation((a, b) => {
          return a.parent === b.parent ? 
            (isLargeTree ? 1.8 : 2.0) : // Increase separation
            (isLargeTree ? 2.5 : 3.0)
        });

      const tree = treeLayout(root);
      console.log("Tree layout applied:", tree.descendants().length, "nodes");

      // Position adjustments - simplify
      tree.descendants().forEach(d => {
        d.y = d.depth * 100; // Fixed vertical spacing
        d.id = d.data.id;
      });

      // Draw all links first - make them visible immediately for debugging
      const allLinks = g.selectAll('path.link')
        .data(tree.links())
        .enter()
        .append('path')
        .attr('class', 'link')
        .attr('d', d3.linkVertical()
          .x(d => d.x)
          .y(d => d.y))
        .attr('stroke', '#4B5563')
        .attr('stroke-width', 1.5) // Thicker strokes
        .attr('fill', 'none')
        .style('opacity', 0.5); // Start semi-visible for debugging

      // Create all nodes - make them visible immediately for debugging
      const allNodes = g.selectAll('g.node')
        .data(tree.descendants())
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr('transform', d => `translate(${d.x},${d.y})`)
        .style('opacity', 0.8); // Start semi-visible for debugging

      allNodes.append('circle')
        .attr('r', d => d.data.isBase ? 15 : 18) // Larger circles
        .attr('fill', d => {
          if (d.data.name === `F(${currentCell})`) return '#FCD34D'
          if (d.data.isBase) return '#10B981'
          return '#3B82F6'
        })
        .attr('stroke', '#E5E7EB')
        .attr('stroke-width', 2);

      allNodes.append('text')
        .attr('dy', '.3em')
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .attr('font-size', '14px') // Larger text
        .text(d => d.data.index); // Display F(n) value inside the circle

      allNodes.append('text')
        .attr('dy', 30) // Position below the node
        .attr('text-anchor', 'middle')
        .attr('fill', '#D1D5DB') // Brighter text
        .attr('font-size', '12px')
        .text(d => d.data.value); // Display running output value outside the circle

      // For debugging, let's just show the tree immediately
      console.log("Tree rendering complete");
      
      // Optional: Add gradual animation after debug is complete
      if (!isRendering) {
        console.log("Starting animation");
        setIsRendering(true);
        
        // CHANGED: Use a level-order (breadth-first) traversal instead of depth-first
        // This will create a left-to-right animation pattern
        function getLevelOrderAnimationSequence(root) {
          const sequence = [];
          const queue = [root]; // Start with the root node
          const nodesByLevel = {};
          
          // First, group nodes by their level
          root.descendants().forEach(node => {
            if (!nodesByLevel[node.depth]) {
              nodesByLevel[node.depth] = [];
            }
            nodesByLevel[node.depth].push(node);
          });
          
          // Sort nodes at each level from left to right
          Object.values(nodesByLevel).forEach(nodes => {
            nodes.sort((a, b) => a.x - b.x);
          });
          
          // Now create the sequence level by level
          Object.keys(nodesByLevel).sort((a, b) => a - b).forEach(level => {
            nodesByLevel[level].forEach(node => {
              // Add node to the sequence
              sequence.push({
                node: node,
                parent: node.parent,
                type: "visit"
              });
              
              // If this node is completed (has no children or both children are in sequence)
              sequence.push({
                node: node,
                type: "complete"
              });
            });
          });
          
          return sequence;
        }

        // Create animation sequence using level-order traversal
        const animationSequence = getLevelOrderAnimationSequence(root);

        // Create node and link maps
        const nodeMap = new Map();
        tree.descendants().forEach((d, i) => {
          nodeMap.set(d.id, allNodes.nodes()[i]);
        });
        
        const linkMap = new Map();
        tree.links().forEach((d, i) => {
          const key = `${d.source.id}-${d.target.id}`;
          linkMap.set(key, allLinks.nodes()[i]);
        });

        // Make all elements invisible again for animation
        allNodes.style('opacity', 0);
        allLinks.style('opacity', 0);

        // Animate with proper timeouts for cleanup
        let delayCounter = 0;
        animationSequence.forEach((step, i) => {
          const delay = delayCounter * 300; // Use a consistent delay increment
          
          if (step.type === "visit") {
            delayCounter++; // Increment counter only for visit actions
            
            const timeout1 = setTimeout(() => {
              const node = nodeMap.get(step.node.id);
              if (node) {
                d3.select(node)
                  .transition()
                  .duration(300)
                  .style('opacity', 1);
              }
              
              // Show the connecting link from parent if it exists
              if (step.parent) {
                const linkKey = `${step.parent.id}-${step.node.id}`;
                const link = linkMap.get(linkKey);
                if (link) {
                  d3.select(link)
                    .transition()
                    .duration(300)
                    .style('opacity', 1);
                }
              }
            }, delay);
            
            timeouts.push(timeout1);
          }
          else if (step.type === "complete") {
            const timeout2 = setTimeout(() => {
              const node = nodeMap.get(step.node.id);
              if (node) {
                d3.select(node)
                  .select('circle')
                  .transition()
                  .duration(300)
                  .attr('fill', d => {
                    if (d.data.name === `F(${currentCell})`) return '#FCD34D'
                    if (d.data.isBase) return '#10B981'
                    return '#3B82F6'
                  });
              }
            }, delay + 150); // Slight delay after node appears
            
            timeouts.push(timeout2);
          }
        });

        // Add final timeout to reset rendering flag
        const finalTimeout = setTimeout(() => {
          setIsRendering(false);
        }, delayCounter * 300 + 1000);
        timeouts.push(finalTimeout);
      }
      
    } catch (error) {
      console.error("Error creating tree visualization:", error);
      // Show error message in SVG
      svg.append("text")
         .attr("x", width / 2)
         .attr("y", height / 2)
         .attr("text-anchor", "middle")
         .attr("fill", "red")
         .text("Error rendering tree: " + error.message);
      
      setIsRendering(false);
    }

  }, [data, currentCell, type, width, height, isLargeTree]);

  return (
    <div className="relative min-h-full">
      {/* Fixed Info panel */}
      <div className="fixed z-50 border rounded-lg shadow-lg left-72 top-48 bg-slate-800 border-slate-700">
        <div className="flex flex-col p-3 space-y-1 text-xs">
          <div className="font-medium text-yellow-400">Current: F({currentCell})</div>
          <div className="text-green-400">Base: F(0)=0, F(1)=1</div>
          <div className="text-blue-400">F(n) = F(n-1) + F(n-2)</div>
        </div>
      </div>

      <div className="flex justify-center px-4 mt-16">
        <svg
          ref={svgRef}
          className="rounded-lg"
          width={width}
          height={height}
          style={{ 
            width: "100%", 
            minHeight: "600px",
            border: "1px solid #475569", // Add border for visibility
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" 
          }}
          preserveAspectRatio="xMidYMid meet"
        />
      </div>
    </div>
  )
}

export default DPTreeVisualizer
