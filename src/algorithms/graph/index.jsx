const getDelay = (speed) => {
  return Math.floor(800 - ((speed/100) * 750))
}

const waitForResume = async (getIsPlaying) => {
  while (!getIsPlaying()) {
    await new Promise(resolve => setTimeout(resolve, 50))
  }
}

// Optimized adjacency list with priority queue support
class PriorityQueue {
  constructor() {
    this.values = []
  }

  enqueue(node, priority) {
    this.values.push({ node, priority })
    this.sort()
  }

  dequeue() {
    return this.values.shift()
  }

  sort() {
    this.values.sort((a, b) => a.priority - b.priority)
  }
}

// Fix adjacency list builder to handle all edge cases
const buildAdjacencyList = (nodes, edges, { directed = false } = {}) => {
  const adjList = {}
  
  // Initialize all nodes first
  nodes.forEach(node => {
    adjList[node.id] = [] // Use simple array of IDs
  })

  // Add edges including weights
  edges.forEach(edge => {
    // Add forward edge
    adjList[edge.source].push(edge.target)
    
    // For undirected graphs, add reverse edge
    if (!directed) {
      adjList[edge.target].push(edge.source)
    }
  })

  return adjList
}

const animateNode = async (setVisited, setCurrent, visited, current, speed) => {
  setCurrent(current)
  visited.add(current)
  setVisited(Array.from(visited))
  await new Promise(resolve => setTimeout(resolve, getDelay(speed)))
}

const animateEdge = async (setExploredEdges, exploredPaths, source, target, level, speed) => {
  const newPath = { source, target, level }
  exploredPaths.push(newPath)
  setExploredEdges([...exploredPaths])
  await new Promise(resolve => setTimeout(resolve, getDelay(speed) * 0.5))
}

export const bfs = async (nodes, edges, startNode, setVisited, setCurrent, getSpeed, getIsPlaying, setParentNodes, setExploredEdges) => {
  const visited = new Set()
  const queue = []
  const parentMap = {}
  const exploredPaths = []
  const adjList = buildAdjacencyList(nodes, edges)

  const processNode = async (current) => {
    // Mark node as visited
    visited.add(current)
    setVisited(Array.from(visited))
    setCurrent(current)
    await new Promise(resolve => setTimeout(resolve, getDelay(getSpeed())))

    // Process neighbors in order
    const neighbors = adjList[current] || []
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        // Show examining neighbor
        exploredPaths.push({
          source: current,
          target: neighbor,
          type: 'examining'
        })
        setExploredEdges([...exploredPaths])
        await new Promise(resolve => setTimeout(resolve, getDelay(getSpeed()) * 0.3))

        // Add to queue and update parent
        queue.push(neighbor)
        parentMap[neighbor] = current
        setParentNodes({...parentMap})
      }
    }
  }

  // Start with initial node
  queue.push(startNode)
  
  while (queue.length > 0) {
    if (!getIsPlaying()) await waitForResume(getIsPlaying)
    
    const current = queue.shift()
    if (!visited.has(current)) {
      await processNode(current)
    }
  }

  return { visited, parentMap, exploredPaths }
}

export const dfs = async (nodes, edges, startNode, setVisited, setCurrent, getSpeed, getIsPlaying, setParentNodes, setExploredEdges) => {
  const visited = new Set()
  const parentMap = {}
  const exploredPaths = []
  const adjList = buildAdjacencyList(nodes, edges)
  const stack = [{ node: startNode, parent: null }]

  while (stack.length > 0) {
    if (!getIsPlaying()) await waitForResume(getIsPlaying)

    const { node: current, parent } = stack.pop()

    if (!visited.has(current)) {
      // Visit node
      visited.add(current)
      setVisited(Array.from(visited))
      setCurrent(current)

      // Update parent relationship
      if (parent !== null) {
        parentMap[current] = parent
        setParentNodes({...parentMap})
        exploredPaths.push({
          source: parent,
          target: current,
          type: 'tree'
        })
        setExploredEdges([...exploredPaths])
      }

      await new Promise(resolve => setTimeout(resolve, getDelay(getSpeed())))

      // Add unvisited neighbors to stack in reverse order
      const neighbors = [...(adjList[current] || [])].reverse()
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          // Show examining edge
          exploredPaths.push({
            source: current,
            target: neighbor,
            type: 'examining'
          })
          setExploredEdges([...exploredPaths])
          await new Promise(resolve => setTimeout(resolve, getDelay(getSpeed()) * 0.3))

          stack.push({ node: neighbor, parent: current })
        }
      }
    }
  }

  return { visited, parentMap, exploredPaths }
}

// Helper function to calculate angle between nodes for clockwise sorting
const getAngle = (center, point) => {
  return Math.atan2(point.y - center.y, point.x - center.x)
}

// Add modern helper functions used in industry
export const getShortestPath = (parents, target) => {
  const path = []
  let current = target
  
  while (current) {
    path.unshift(current)
    current = parents[current]
  }
  
  return path
}

export const getGraphAlgorithm = (name) => {
  const algorithms = {
    'bfs': bfs,
    'dfs': dfs,
    // Add more algorithms as needed
    'dijkstra': null, // TODO: Implement
    'prim': null,    // TODO: Implement
    'kruskal': null  // TODO: Implement
  }
  return algorithms[name]
}
