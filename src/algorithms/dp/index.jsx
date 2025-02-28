const getDelay = (speed) => Math.floor(800 - ((speed/100) * 750))

const waitForResume = async (getIsPlaying) => {
  while (!getIsPlaying()) {
    await new Promise(resolve => setTimeout(resolve, 50))
  }
}

export const fibonacci = async (n, setTable, setCurrent, getSpeed, getIsPlaying) => {
  const dp = new Array(n + 1).fill(0)
  dp[1] = 1
  setTable([...dp])
  
  // Remove BFS steps generation code
  
  // Normal fibonacci calculation
  for (let i = 2; i <= n; i++) {
    if (!getIsPlaying()) await waitForResume(getIsPlaying)
    
    setCurrent(i)
    dp[i] = dp[i-1] + dp[i-2]
    setTable([...dp])
    await new Promise(r => setTimeout(r, getDelay(getSpeed())))
  }
  
  // Return just the result, no BFS steps
  return dp[n]
}

export const knapsack = async (weights, values, capacity, setTable, setCurrent, getSpeed, getIsPlaying) => {
  // Create initialized table with proper dimensions
  const n = weights.length
  const dp = Array(n + 1).fill().map(() => Array(capacity + 1).fill(0))
  
  // Initialize the table first
  setTable([...dp.map(row => [...row])])
  await new Promise(r => setTimeout(r, getDelay(getSpeed()) * 2))

  // Fill the DP table cells one by one
  for (let i = 0; i <= n; i++) {
    for (let w = 0; w <= capacity; w++) {
      if (!getIsPlaying()) await waitForResume(getIsPlaying)
      
      // Skip first row and column base cases (already set to 0)
      if (i === 0 || w === 0) {
        setCurrent([i, w])
        await new Promise(r => setTimeout(r, getDelay(getSpeed()) / 2))
        continue
      }
      
      setCurrent([i, w])
      
      // If current item fits in the knapsack
      if (weights[i-1] <= w) {
        // Calculate value with and without taking the item
        dp[i][w] = Math.max(
          values[i-1] + dp[i-1][w - weights[i-1]], // Take item
          dp[i-1][w] // Don't take item
        )
      } else {
        // If item doesn't fit, skip it
        dp[i][w] = dp[i-1][w]
      }
      
      // Update the displayed table
      setTable([...dp.map(row => [...row])])
      await new Promise(r => setTimeout(r, getDelay(getSpeed())))
    }
  }
  
  return {
    result: dp[n][capacity],
    weights,
    values
  }
}

export const lcs = async (str1, str2, setTable, setCurrent, getSpeed, getIsPlaying) => {
  const m = str1.length
  const n = str2.length
  const dp = Array(m + 1).fill().map(() => Array(n + 1).fill(0))
  setTable(dp.map(row => [...row]))
  
  // Wait function for better control
  const wait = async (ms) => {
    const speed = getSpeed()
    const delay = Math.floor(ms * (100 - speed) / 50)
    await new Promise(r => setTimeout(r, delay))
  }
  
  await wait(500) // Initial pause to show the starting state
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (!getIsPlaying()) await waitForResume(getIsPlaying)
      
      setCurrent([i, j])
      
      if (str1[i-1] === str2[j-1]) {
        dp[i][j] = dp[i-1][j-1] + 1
      } else {
        dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1])
      }
      
      setTable(dp.map(row => [...row]))
      await wait(300)
    }
  }
  
  setCurrent(null)
  
  return {
    result: dp[m][n],
    str1, // Return the original strings for reference
    str2
  }
}

export const lis = async (arr, setTable, setCurrent, getSpeed, getIsPlaying) => {
  const n = arr.length
  const dp = Array(n).fill(1)
  setTable([...dp])
  
  // Wait function for better control
  const wait = async (ms) => {
    const speed = getSpeed()
    const delay = Math.floor(ms * (100 - speed) / 50)
    await new Promise(r => setTimeout(r, delay))
  }
  
  await wait(500) // Initial pause to show the starting state
  
  for (let i = 1; i < n; i++) {
    if (!getIsPlaying()) await waitForResume(getIsPlaying)
    
    setCurrent(i)
    await wait(300)
    
    for (let j = 0; j < i; j++) {
      if (!getIsPlaying()) await waitForResume(getIsPlaying)
      
      // Compare with each previous element
      if (arr[i] > arr[j]) {
        dp[i] = Math.max(dp[i], dp[j] + 1)
        setTable([...dp])
        await wait(200)
      }
    }
    
    setTable([...dp])
    await wait(300)
  }
  
  setCurrent(null)
  
  return {
    result: Math.max(...dp),
    array: arr // Return the original array for reference
  }
}

export const getDPAlgorithm = (name) => {
  const algorithms = {
    'fibonacci': fibonacci,
    'knapsack': knapsack,
    'lcs': lcs,
    'lis': lis
  }
  return algorithms[name.toLowerCase()]
}
