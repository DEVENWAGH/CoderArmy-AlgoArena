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

  // Add start node to queue
  queue.push(startNode)

  while (queue.length > 0) {
    if (!getIsPlaying()) await waitForResume(getIsPlaying)
    
    const current = queue.shift()
    if (!visited.has(current)) {
      // Visit current node
      visited.add(current)
      setVisited(Array.from(visited))
      setCurrent(current)

      // Show parent relationship if exists
      if (parentMap[current]) {
        exploredPaths.push({
          source: parentMap[current],
          target: current,
          type: 'tree'
        })
        setExploredEdges([...exploredPaths])
      }

      await new Promise(r => setTimeout(r, getDelay(getSpeed())))

      // Find and process neighbors
      const currentNeighbors = edges.filter(e => 
        e.source === current || e.target === current
      )

      for (const edge of currentNeighbors) {
        const neighbor = edge.source === current ? edge.target : edge.source
        if (!visited.has(neighbor)) {
          // Show examining edge
          exploredPaths.push({
            source: current,
            target: neighbor,
            type: 'examining'
          })
          setExploredEdges([...exploredPaths])
          
          await new Promise(r => setTimeout(r, getDelay(getSpeed()) * 0.3))
          
          queue.push(neighbor)
          parentMap[neighbor] = current
          setParentNodes({...parentMap})
        }
      }
    }
  }

  return {
    visited,
    parentMap,
    exploredPaths
  }
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

export const dijkstra = async (nodes, edges, startNode, setVisited, setCurrent, getSpeed, getIsPlaying, setParentNodes, setExploredEdges) => {
  const distances = {}
  const parentMap = {}
  const visited = new Set()
  const exploredPaths = []
  const pq = new PriorityQueue()

  nodes.forEach(node => distances[node.id] = Infinity)
  distances[startNode] = 0
  pq.enqueue(startNode, 0)

  while (pq.values.length > 0) {
    if (!getIsPlaying()) await waitForResume(getIsPlaying)

    const { node: current, priority: currentDistance } = pq.dequeue()

    if (!visited.has(current)) {
      visited.add(current)
      setVisited(Array.from(visited))
      setCurrent(current)

      if (parentMap[current]) {
        exploredPaths.push({
          source: parentMap[current],
          target: current,
          type: 'tree',
          distance: currentDistance
        })
        setExploredEdges([...exploredPaths])
      }

      await new Promise(r => setTimeout(r, getDelay(getSpeed())))

      const neighbors = edges.filter(e => e.source === current || e.target === current)
      for (const edge of neighbors) {
        const neighbor = edge.source === current ? edge.target : edge.source
        if (!visited.has(neighbor)) {
          exploredPaths.push({
            source: current,
            target: neighbor,
            type: 'examining',
            weight: edge.weight
          })
          setExploredEdges([...exploredPaths])
          
          const newDistance = distances[current] + edge.weight
          if (newDistance < distances[neighbor]) {
            distances[neighbor] = newDistance
            parentMap[neighbor] = current
            setParentNodes({...parentMap})
            pq.enqueue(neighbor, newDistance)
          }
          await new Promise(r => setTimeout(r, getDelay(getSpeed()) * 0.3))
        }
      }
    }
  }

  return { visited, parentMap, exploredPaths, distances }
}

export const prim = async (nodes, edges, startNode, setVisited, setCurrent, getSpeed, getIsPlaying, setParentNodes, setExploredEdges) => {
  const visited = new Set()
  const parentMap = {}
  const exploredPaths = []
  const pq = new PriorityQueue()

  // Start with first node
  pq.enqueue(startNode, 0)

  while (pq.values.length > 0) {
    if (!getIsPlaying()) await waitForResume(getIsPlaying)

    const { node: current, priority: weight } = pq.dequeue()

    if (!visited.has(current)) {
      visited.add(current)
      setVisited(Array.from(visited))
      setCurrent(current)

      if (parentMap[current]) {
        exploredPaths.push({
          source: parentMap[current],
          target: current,
          type: 'tree',
          weight
        })
        setExploredEdges([...exploredPaths])
      }

      await new Promise(r => setTimeout(r, getDelay(getSpeed())))

      const neighbors = edges.filter(e => e.source === current || e.target === current)
      for (const edge of neighbors) {
        const neighbor = edge.source === current ? edge.target : edge.source
        if (!visited.has(neighbor)) {
          exploredPaths.push({
            source: current,
            target: neighbor,
            type: 'examining',
            weight: edge.weight
          })
          setExploredEdges([...exploredPaths])
          
          parentMap[neighbor] = current
          setParentNodes({...parentMap})
          pq.enqueue(neighbor, edge.weight)
          
          await new Promise(r => setTimeout(r, getDelay(getSpeed()) * 0.3))
        }
      }
    }
  }

  return { visited, parentMap, exploredPaths }
}

export const kruskal = async (nodes, edges, startNode, setVisited, setCurrent, getSpeed, getIsPlaying, setParentNodes, setExploredEdges) => {
  class UnionFind {
    constructor(nodes) {
      this.parent = {}
      nodes.forEach(node => this.parent[node.id] = node.id)
    }
    
    find(node) {
      if (this.parent[node] !== node) {
        this.parent[node] = this.find(this.parent[node])
      }
      return this.parent[node]
    }
    
    union(a, b) {
      this.parent[this.find(a)] = this.find(b)
    }
  }

  const visited = new Set()
  const parentMap = {}
  const exploredPaths = []
  const uf = new UnionFind(nodes)
  
  // Sort edges by weight
  const sortedEdges = [...edges].sort((a, b) => a.weight - b.weight)

  for (const edge of sortedEdges) {
    if (!getIsPlaying()) await waitForResume(getIsPlaying)

    const sourceRoot = uf.find(edge.source)
    const targetRoot = uf.find(edge.target)

    exploredPaths.push({
      source: edge.source,
      target: edge.target,
      type: 'examining',
      weight: edge.weight
    })
    setExploredEdges([...exploredPaths])
    await new Promise(r => setTimeout(r, getDelay(getSpeed()) * 0.3))

    if (sourceRoot !== targetRoot) {
      uf.union(edge.source, edge.target)
      visited.add(edge.source)
      visited.add(edge.target)
      setVisited(Array.from(visited))
      setCurrent(edge.target)

      parentMap[edge.target] = edge.source
      setParentNodes({...parentMap})

      exploredPaths.push({
        source: edge.source,
        target: edge.target,
        type: 'tree',
        weight: edge.weight
      })
      setExploredEdges([...exploredPaths])

      await new Promise(r => setTimeout(r, getDelay(getSpeed())))
    }
  }

  return { visited, parentMap, exploredPaths }
}

export const getGraphAlgorithm = (name) => {
  // Simplified name mapping
  const algorithms = {
    'bfs': bfs,
    'dfs': dfs,
    'dijkstra': dijkstra,
    'dijkstras': dijkstra,
    'prim': prim,
    'prims': prim,
    'kruskal': kruskal,
    'kruskals': kruskal
  }

  const key = name.toLowerCase().replace(/[^a-z]/g, '')
  console.log('Looking for algorithm:', key)
  return algorithms[key]
}
