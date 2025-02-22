const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const getDelay = (speed) => {
  return Math.floor(800 - ((speed/100) * 750)) // Match the sorting delay formula
}

const waitForResume = async (getIsPlaying) => {
  while (!getIsPlaying()) {
    await new Promise(resolve => setTimeout(resolve, 50))
  }
}

export const linearSearch = async (array, target, setCurrentIndex, getIsPlaying, getSpeed) => {
  for (let i = 0; i < array.length; i++) {
    if (!getIsPlaying()) await waitForResume(getIsPlaying)
    
    setCurrentIndex(i)
    await new Promise(resolve => setTimeout(resolve, getDelay(getSpeed())))
    
    if (array[i] === target) {
      return i
    }
  }
  return -1
}

export const binarySearch = async (array, target, setCurrentIndex, getIsPlaying, getSpeed) => {
  let left = 0
  let right = array.length - 1
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2)
    if (!getIsPlaying()) await waitForResume(getIsPlaying)
    
    setCurrentIndex(mid)
    await new Promise(resolve => setTimeout(resolve, getDelay(getSpeed())))
    
    if (array[mid] === target) {
      return mid
    }
    
    if (array[mid] < target) {
      left = mid + 1
    } else {
      right = mid - 1
    }
  }
  
  return -1
}

export const getSearchAlgorithm = (name) => {
  const algorithms = {
    'linear-search': linearSearch,
    'binary-search': binarySearch
  }
  return algorithms[name]
}
