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
  
  for (let i = 2; i <= n; i++) {
    if (!getIsPlaying()) await waitForResume(getIsPlaying)
    
    setCurrent(i)
    dp[i] = dp[i-1] + dp[i-2]
    setTable([...dp])
    await new Promise(r => setTimeout(r, getDelay(getSpeed())))
  }
  
  return dp[n]
}

export const knapsack = async (weights, values, capacity, setTable, setCurrent, getSpeed, getIsPlaying) => {
  const n = weights.length
  const dp = Array(n + 1).fill().map(() => Array(capacity + 1).fill(0))
  setTable(dp.map(row => [...row]))
  
  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= capacity; w++) {
      if (!getIsPlaying()) await waitForResume(getIsPlaying)
      
      setCurrent([i, w])
      if (weights[i-1] <= w) {
        dp[i][w] = Math.max(
          values[i-1] + dp[i-1][w - weights[i-1]],
          dp[i-1][w]
        )
      } else {
        dp[i][w] = dp[i-1][w]
      }
      setTable(dp.map(row => [...row]))
      await new Promise(r => setTimeout(r, getDelay(getSpeed())))
    }
  }
  
  return dp[n][capacity]
}

export const lcs = async (str1, str2, setTable, setCurrent, getSpeed, getIsPlaying) => {
  const m = str1.length
  const n = str2.length
  const dp = Array(m + 1).fill().map(() => Array(n + 1).fill(0))
  setTable(dp.map(row => [...row]))
  
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
      await new Promise(r => setTimeout(r, getDelay(getSpeed())))
    }
  }
  
  return dp[m][n]
}

export const lis = async (arr, setTable, setCurrent, getSpeed, getIsPlaying) => {
  const n = arr.length
  const dp = Array(n).fill(1)
  setTable([...dp])
  
  for (let i = 1; i < n; i++) {
    if (!getIsPlaying()) await waitForResume(getIsPlaying)
    
    setCurrent(i)
    for (let j = 0; j < i; j++) {
      if (arr[i] > arr[j]) {
        dp[i] = Math.max(dp[i], dp[j] + 1)
        setTable([...dp])
        await new Promise(r => setTimeout(r, getDelay(getSpeed()) * 0.5))
      }
    }
  }
  
  return Math.max(...dp)
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
