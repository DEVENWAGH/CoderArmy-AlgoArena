const getDelay = (speed) => {
  return Math.floor(800 - ((speed/100) * 750))
}

const waitForResume = async (getIsPlaying) => {
  while (!getIsPlaying()) {
    await new Promise(resolve => setTimeout(resolve, 50))
  }
}

const animateSwap = async (arr, i, j, setArray, getSpeed) => {
  const delay = getDelay(getSpeed());
  
  // Set indices before swap to trigger animation
  setArray([...arr], i, j);
  await new Promise(resolve => setTimeout(resolve, delay * 0.5));
  
  // Perform swap
  [arr[i], arr[j]] = [arr[j], arr[i]];
  
  // Update array to show new positions
  setArray([...arr]);
  await new Promise(resolve => setTimeout(resolve, delay * 0.5));
}

const shouldSwap = (a, b, isAscending) => {
  return isAscending ? a > b : a < b;
}

const isInOrder = (a, b, isAscending) => {
  return isAscending ? a <= b : a >= b;
}

export const bubbleSort = async (array, setArray, setCurrentIndex, setCompareIndex, getSpeed, getIsPlaying, isAscending) => {
  const arr = [...array]
  
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      if (!getIsPlaying()) await waitForResume(getIsPlaying)

      setCurrentIndex(j)
      setCompareIndex(j + 1)
      await new Promise(resolve => setTimeout(resolve, getDelay(getSpeed())))
      
      if (shouldSwap(arr[j], arr[j + 1], isAscending)) {
        await animateSwap(arr, j, j + 1, setArray, getSpeed)
      }
    }
  }
  
  setCurrentIndex(-1)
  setCompareIndex(-1)
  return arr
}

export const insertionSort = async (array, setArray, setCurrentIndex, setCompareIndex, getSpeed, getIsPlaying, isAscending) => {
  const arr = [...array]
  const n = arr.length

  for (let i = 1; i < n; i++) {
    let key = arr[i]
    let j = i - 1

    setCurrentIndex(i)
    
    while (j >= 0 && shouldSwap(arr[j], key, isAscending)) {
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

export const selectionSort = async (array, setArray, setCurrentIndex, setCompareIndex, getSpeed, getIsPlaying, isAscending) => {
  const arr = [...array]
  const n = arr.length
  
  for (let i = 0; i < n - 1; i++) {
    let extremeIdx = i
    setCurrentIndex(i)
    
    for (let j = i + 1; j < n; j++) {
      if (!getIsPlaying()) await waitForResume(getIsPlaying)
      
      setCompareIndex(j)
      await new Promise(resolve => setTimeout(resolve, getDelay(getSpeed())))
      
      // Fix comparison logic for ascending/descending
      if (isAscending ? arr[j] < arr[extremeIdx] : arr[j] > arr[extremeIdx]) {
        extremeIdx = j
      }
    }
    
    if (extremeIdx !== i) {
      await animateSwap(arr, i, extremeIdx, setArray, getSpeed)
    }
  }
  
  setCurrentIndex(-1)
  setCompareIndex(-1)
  return arr
}

export const mergeSort = async (array, setArray, setCurrentIndex, setCompareIndex, getSpeed, getIsPlaying, isAscending) => {
  const arr = [...array]
  
  const merge = async (start, mid, end) => {
    const leftArr = arr.slice(start, mid + 1)
    const rightArr = arr.slice(mid + 1, end + 1)
    let i = 0, j = 0, k = start
    
    while (i < leftArr.length && j < rightArr.length) {
      if (!getIsPlaying()) await waitForResume(getIsPlaying)
      
      setCurrentIndex(start + i)
      setCompareIndex(mid + 1 + j)
      await new Promise(resolve => setTimeout(resolve, getDelay(getSpeed())))
      
      if (isInOrder(leftArr[i], rightArr[j], isAscending)) {
        arr[k] = leftArr[i]
        i++
      } else {
        arr[k] = rightArr[j]
        j++
      }
      setArray([...arr])
      k++
      await new Promise(resolve => setTimeout(resolve, getDelay(getSpeed()) / 2))
    }
    
    // Copy remaining elements
    while (i < leftArr.length) {
      if (!getIsPlaying()) await waitForResume(getIsPlaying)
      arr[k] = leftArr[i]
      setArray([...arr])
      setCurrentIndex(k)
      i++
      k++
      await new Promise(resolve => setTimeout(resolve, getDelay(getSpeed()) / 2))
    }
    
    while (j < rightArr.length) {
      if (!getIsPlaying()) await waitForResume(getIsPlaying)
      arr[k] = rightArr[j]
      setArray([...arr])
      setCompareIndex(k)
      j++
      k++
      await new Promise(resolve => setTimeout(resolve, getDelay(getSpeed()) / 2))
    }
  }
  
  const mergeSortHelper = async (start, end) => {
    if (start < end) {
      const mid = Math.floor(start + (end - start) / 2)
      
      // Visualize division
      setCurrentIndex(start)
      setCompareIndex(end)
      await new Promise(resolve => setTimeout(resolve, getDelay(getSpeed())))
      
      // Recursively sort
      await mergeSortHelper(start, mid)
      await mergeSortHelper(mid + 1, end)
      
      // Merge sorted halves
      await merge(start, mid, end)
    }
  }
  
  await mergeSortHelper(0, arr.length - 1)
  setCurrentIndex(-1)
  setCompareIndex(-1)
  return arr
}

export const quickSort = async (array, setArray, setCurrentIndex, setCompareIndex, getSpeed, getIsPlaying, isAscending) => {
  const arr = [...array]
  
  const partition = async (low, high) => {
    const pivot = arr[high]
    let i = low - 1
    
    for (let j = low; j < high; j++) {
      if (!getIsPlaying()) await waitForResume(getIsPlaying)
      
      setCurrentIndex(j)
      setCompareIndex(high)
      await new Promise(resolve => setTimeout(resolve, getDelay(getSpeed())))
      
      if (isInOrder(arr[j], pivot, isAscending)) {
        i++
        if (i !== j) {
          await animateSwap(arr, i, j, setArray, getSpeed)
        }
      }
    }
    
    await animateSwap(arr, i + 1, high, setArray, getSpeed)
    return i + 1
  }
  
  const quickSortHelper = async (low, high) => {
    if (low < high) {
      const pi = await partition(low, high)
      await quickSortHelper(low, pi - 1)
      await quickSortHelper(pi + 1, high)
    }
  }
  
  await quickSortHelper(0, arr.length - 1)
  setCurrentIndex(-1)
  setCompareIndex(-1)
  return arr
}

export const getSortingAlgorithm = (name) => {
  const algorithms = {
    'bubble-sort': bubbleSort,
    'insertion-sort': insertionSort,
    'selection-sort': selectionSort,
    'merge-sort': mergeSort,
    'quick-sort': quickSort
  }
  return algorithms[name]
}

export default {
  bubbleSort,
  insertionSort,
  selectionSort,
  mergeSort,
  quickSort
}
