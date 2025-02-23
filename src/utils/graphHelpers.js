export const validateGraph = (nodes, edges) => {
  // Check for invalid edges
  const nodeSet = new Set(nodes.map(n => n.id))
  const invalidEdges = edges.filter(
    e => !nodeSet.has(e.source) || !nodeSet.has(e.target)
  )
  
  if (invalidEdges.length > 0) {
    throw new Error('Graph contains invalid edges')
  }

  // Check for duplicate node IDs
  const seen = new Set()
  const duplicates = nodes.filter(n => {
    const isDuplicate = seen.has(n.id)
    seen.add(n.id)
    return isDuplicate
  })

  if (duplicates.length > 0) {
    throw new Error('Graph contains duplicate node IDs')
  }

  return true
}

export const getConnectedComponents = (nodes, edges) => {
  const adjList = new Map()
  const visited = new Set()
  const components = []

  // Build adjacency list
  nodes.forEach(node => adjList.set(node.id, []))
  edges.forEach(edge => {
    adjList.get(edge.source).push(edge.target)
    adjList.get(edge.target).push(edge.source)
  })

  // DFS to find components
  const dfs = (node, component) => {
    visited.add(node)
    component.push(node)
    
    adjList.get(node).forEach(neighbor => {
      if (!visited.has(neighbor)) {
        dfs(neighbor, component)
      }
    })
  }

  // Find all components
  nodes.forEach(node => {
    if (!visited.has(node.id)) {
      const component = []
      dfs(node.id, component)
      components.push(component)
    }
  })

  return components
}
