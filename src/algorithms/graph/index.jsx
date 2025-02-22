const getDelay = (speed) => {
  return Math.floor(800 - ((speed/100) * 750))
}

const waitForResume = async (getIsPlaying) => {
  while (!getIsPlaying()) {
    await new Promise(resolve => setTimeout(resolve, 50))
  }
}

export const bfs = async (nodes, edges, startNode, setVisited, setCurrent, getSpeed, getIsPlaying) => {
  const visited = new Set()
  const queue = [startNode]
  const adjacencyList = buildAdjacencyList(nodes, edges)

  while (queue.length > 0) {
    if (!getIsPlaying()) await waitForResume(getIsPlaying)
    
    const current = queue.shift()
    setCurrent(current)
    
    if (!visited.has(current)) {
      visited.add(current)
      setVisited(Array.from(visited))
      await new Promise(resolve => setTimeout(resolve, getDelay(getSpeed())))

      const neighbors = adjacencyList[current] || []
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          queue.push(neighbor)
        }
      }
    }
  }
}

export const dfs = async (nodes, edges, startNode, setVisited, setCurrent, getSpeed, getIsPlaying) => {
  const visited = new Set()
  const adjacencyList = buildAdjacencyList(nodes, edges)

  const dfsHelper = async (node) => {
    if (!getIsPlaying()) await waitForResume(getIsPlaying)
    
    setCurrent(node)
    visited.add(node)
    setVisited(Array.from(visited))
    await new Promise(resolve => setTimeout(resolve, getDelay(getSpeed())))

    const neighbors = adjacencyList[node] || []
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        await dfsHelper(neighbor)
      }
    }
  }

  await dfsHelper(startNode)
}

const buildAdjacencyList = (nodes, edges) => {
  const adjacencyList = {}
  
  nodes.forEach(node => {
    adjacencyList[node.id] = []
  })

  edges.forEach(edge => {
    adjacencyList[edge.source].push(edge.target)
  })

  return adjacencyList
}

export const getGraphAlgorithm = (name) => {
  const algorithms = {
    'bfs': bfs,
    'dfs': dfs
  }
  return algorithms[name]
}
