import { create } from 'zustand'
import { getGraphAlgorithm } from '../algorithms/graph'

const useGraphStore = create((set, get) => ({
  nodes: [],
  edges: [],
  isDirected: false,
  isLarge: false,
  representationType: 'logical', // 'logical', 'adjacencyList', 'adjacencyMatrix'
  visitedNodes: [],
  currentNode: null,
  speed: 50,
  isPlaying: false,
  isPaused: false,
  currentAlgorithm: null,  // Add this line
  layoutType: 'circular', // Add this line
  gridVariant: 'square', // Add this line
  parentNodes: {}, // Add this line

  setGraphType: (isDirected) => set({ isDirected }),
  setGraphSize: (isLarge) => {
    set({ isLarge })
    get().generateGraph()
  },
  setRepresentation: (type) => set({ representationType: type }),

  setCurrentAlgorithm: (algorithm) => {
    set({ 
      currentAlgorithm: algorithm,
      visitedNodes: [],
      currentNode: null,
      isPlaying: false,
      isPaused: false,
      parentNodes: {} // Reset parent nodes
    })
  },

  setLayoutType: (type) => {
    set({ layoutType: type })
    get().updateLayout()
  },

  setGridVariant: (variant) => {
    set({ gridVariant: variant })
    if (get().layoutType === 'grid') {
      get().updateLayout()
    }
  },

  setParentNodes: (parentNodes) => set({ parentNodes }),

  updateLayout: () => {
    const { nodes, layoutType, gridVariant } = get()
    const width = 800
    const height = 500
    const centerX = width / 2
    const centerY = height / 2
    const nodeSize = 48 // Node diameter for overlap prevention
    
    switch (layoutType) {
      case 'circular':
        const radius = Math.min(width, height) / 3
        nodes.forEach((node, i) => {
          const angle = (i * 2 * Math.PI) / nodes.length
          node.x = centerX + radius * Math.cos(angle)
          node.y = centerY + radius * Math.sin(angle)
        })
        break

      case 'grid':
        const nodeCount = nodes.length
        switch (gridVariant) {
          case 'square':
            const cols = Math.ceil(Math.sqrt(nodeCount))
            const rows = Math.ceil(nodeCount / cols)
            const cellWidth = width / (cols + 1)
            const cellHeight = height / (rows + 1)
            
            nodes.forEach((node, i) => {
              const row = Math.floor(i / cols)
              const col = i % cols
              node.x = (col + 1) * cellWidth
              node.y = (row + 1) * cellHeight
            })
            break

          case 'hexagonal':
            const hexRadius = Math.min(width, height) / Math.sqrt(nodeCount * 4)
            nodes.forEach((node, i) => {
              const row = Math.floor(i / 5)
              const col = i % 5
              node.x = centerX + (col * hexRadius * 1.7) + (row % 2 ? hexRadius : 0)
              node.y = centerY + (row * hexRadius * 1.5)
            })
            break

          case 'spiral':
            const angle = 2 * Math.PI / nodeCount
            const spiralRadius = Math.min(width, height) / 4
            nodes.forEach((node, i) => {
              const radius = spiralRadius * (i / nodeCount)
              const theta = i * angle
              node.x = centerX + radius * Math.cos(theta)
              node.y = centerY + radius * Math.sin(theta)
            })
            break
        }
        break

      case 'random':
        const padding = nodeSize * 2
        const maxAttempts = 50
        
        nodes.forEach(node => {
          let validPosition = false
          let attempts = 0
          
          while (!validPosition && attempts < maxAttempts) {
            node.x = padding + Math.random() * (width - 2 * padding)
            node.y = padding + Math.random() * (height - 2 * padding)
            
            // Check for overlaps with other nodes
            validPosition = nodes.every(otherNode => {
              if (otherNode === node) return true
              const dx = otherNode.x - node.x
              const dy = otherNode.y - node.y
              const distance = Math.sqrt(dx * dx + dy * dy)
              return distance > nodeSize * 1.5
            })
            
            attempts++
          }
        })
        break
    }
    
    set({ nodes: [...nodes] })
  },

  generateGraph: () => {
    const { isLarge, isDirected, layoutType } = get()
    const nodeCount = isLarge ? 15 : 8
    
    // Generate nodes
    const nodes = Array.from({ length: nodeCount }, (_, i) => ({
      id: `node-${i}`,
      label: String.fromCharCode(65 + i),
      x: 0, // Initial position, will be updated by layout
      y: 0
    }))

    // Generate edges (ensure connectivity)
    const edges = []
    const edgeCount = isLarge ? 25 : 12

    // Ensure all nodes are connected
    for (let i = 1; i < nodeCount; i++) {
      const source = Math.floor(Math.random() * i)
      edges.push({
        id: `edge-${edges.length}`,
        source: nodes[source].id,
        target: nodes[i].id,
        weight: Math.floor(Math.random() * 9) + 1
      })
    }

    // Add additional random edges
    while (edges.length < edgeCount) {
      const source = Math.floor(Math.random() * nodeCount)
      let target = Math.floor(Math.random() * nodeCount)
      
      // Avoid self-loops and duplicate edges
      while (target === source || edges.some(e => 
        e.source === nodes[source].id && e.target === nodes[target].id)) {
        target = Math.floor(Math.random() * nodeCount)
      }
      
      edges.push({
        id: `edge-${edges.length}`,
        source: nodes[source].id,
        target: nodes[target].id,
        weight: Math.floor(Math.random() * 9) + 1
      })
    }

    set({ 
      nodes, 
      edges,
      visitedNodes: [],
      currentNode: null,
      parentNodes: {},
      exploredEdges: []
    })
    
    get().updateLayout()
  },

  startTraversal: async (startNodeId) => {
    const { nodes, edges, currentAlgorithm, isDirected } = get()
    if (!nodes.length || !currentAlgorithm) return

    console.log('Starting algorithm:', currentAlgorithm)

    // Clean algorithm name for matching
    const cleanName = currentAlgorithm
      .toLowerCase()
      .replace(/'s algorithm$/, '')  // Remove "'s algorithm"
      .replace(/[^a-z]/, '')       // Remove special characters
      .trim()

    console.log('Cleaned name:', cleanName)
    const algorithm = getGraphAlgorithm(cleanName)

    if (!algorithm) {
      console.error('Algorithm not found:', cleanName)
      return
    }

    set({
      isPlaying: true,
      isPaused: false,
      visitedNodes: [],
      currentNode: null,
      parentNodes: {},
      exploredEdges: []
    })

    try {
      const result = await algorithm(
        nodes,
        edges,
        startNodeId,
        (visited) => set({ visitedNodes: [...visited] }),
        (current) => set({ currentNode: current }),
        () => get().speed,
        () => get().isPlaying,
        (parents) => set({ parentNodes: {...parents} }),
        (explored) => set({ exploredEdges: [...explored] })
      )

      if (result) {
        set({
          visitedNodes: Array.from(result.visited),
          parentNodes: result.parentMap,
          exploredEdges: result.exploredPaths
        })
      }
    } catch (error) {
      console.error('Traversal error:', error)
    } finally {
      set({ isPlaying: false })
    }
  },

  pauseTraversal: () => set({ isPlaying: false, isPaused: true }),
  resumeTraversal: () => set({ isPlaying: true, isPaused: false }),
  setSpeed: (speed) => set({ speed })
}))

export default useGraphStore
