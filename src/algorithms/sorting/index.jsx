const getDelay = (speed) => {
  return Math.floor(800 - ((speed/100) * 750))
}

const waitForResume = async (getIsPlaying) => {
  while (!getIsPlaying()) {
    await new Promise(resolve => setTimeout(resolve, 50))
  }
}

export const bubbleSort = async (array, setArray, setCurrentIndex, setCompareIndex, getSpeed, getIsPlaying) => {
  const arr = [...array]
  
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      if (!getIsPlaying()) {
        await waitForResume(getIsPlaying)
      }

      setCurrentIndex(j)
      setCompareIndex(j + 1)
      
      await new Promise(resolve => setTimeout(resolve, getDelay(getSpeed())))
      
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]
        setArray([...arr])
        await new Promise(resolve => setTimeout(resolve, getDelay(getSpeed()) / 2))
      }
    }
  }
  
  setCurrentIndex(-1)
  setCompareIndex(-1)
  return arr
}

export const insertionSort = async (array, setArray, setCurrentIndex, setCompareIndex, getSpeed, getIsPlaying) => {
  const arr = [...array]
  const n = arr.length

  for (let i = 1; i < n; i++) {
    let key = arr[i]
    let j = i - 1

    setCurrentIndex(i)
    
    while (j >= 0 && arr[j] > key) {
      if (!getIsPlaying()) {
        await waitForResume(getIsPlaying)
      }

      setCompareIndex(j)
      await new Promise(resolve => setTimeout(resolve, getDelay(getSpeed())))

      arr[j + 1] = arr[j]
      setArray([...arr])
      j--
    }
    
    arr[j + 1] = key
    setArray([...arr])
    await new Promise(resolve => setTimeout(resolve, getDelay(getSpeed())))
  }

  setCurrentIndex(-1)
  setCompareIndex(-1)
  return arr
}

export const selectionSort = async (array, setArray, setCurrentIndex, setCompareIndex, getSpeed, getIsPlaying) => {
  const arr = [...array]
  const n = arr.length
  
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i
    setCurrentIndex(i)
    
    for (let j = i + 1; j < n; j++) {
      if (!getIsPlaying()) {
        await waitForResume(getIsPlaying)
      }
      
      setCompareIndex(j)
      await new Promise(resolve => setTimeout(resolve, getDelay(getSpeed())))
      
      if (arr[j] < arr[minIdx]) {
        minIdx = j
      }
    }
    
    if (minIdx !== i) {
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]]
      setArray([...arr])
      await new Promise(resolve => setTimeout(resolve, getDelay(getSpeed())))
    }
  }
  
  setCurrentIndex(-1)
  setCompareIndex(-1)
  return arr
}

export const getSortingAlgorithm = (name) => {
  const algorithms = {
    'bubble-sort': bubbleSort,
    'insertion-sort': insertionSort,
    'selection-sort': selectionSort
  }
  return algorithms[name]
}

export default {
  bubbleSort,
  insertionSort,
  selectionSort
}
