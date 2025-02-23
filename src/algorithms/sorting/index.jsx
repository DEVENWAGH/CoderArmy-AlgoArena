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
  let hasSwapped
  let lastUnsorted = arr.length

  // Optimization: Track last swap position
  do {
    hasSwapped = false
    for (let i = 0; i < lastUnsorted - 1; i++) {
      if (!getIsPlaying()) await waitForResume(getIsPlaying)

      setCurrentIndex(i)
      setCompareIndex(i + 1)
      await new Promise(resolve => setTimeout(resolve, getDelay(getSpeed())))
      
      if (shouldSwap(arr[i], arr[i + 1], isAscending)) {
        await animateSwap(arr, i, i + 1, setArray, getSpeed)
        hasSwapped = true
        lastUnsorted = i + 1 // Update last unsorted position
      }
    }
  } while (hasSwapped)

  setCurrentIndex(-1)
  setCompareIndex(-1)
  return arr
}

export const insertionSort = async (array, setArray, setCurrentIndex, setCompareIndex, getSpeed, getIsPlaying, isAscending) => {
  const arr = [...array]
  const n = arr.length

  // Optimization: Binary search for insertion point
  const binarySearch = (arr, item, start, end, isAscending) => {
    if (start >= end) return isAscending ? start : start + 1
    
    const mid = Math.floor((start + end) / 2)
    if (arr[mid] === item) return isAscending ? mid : mid + 1
    
    if (isAscending ? arr[mid] > item : arr[mid] < item) {
      return binarySearch(arr, item, start, mid - 1, isAscending)
    }
    return binarySearch(arr, item, mid + 1, end, isAscending)
  }

  for (let i = 1; i < n; i++) {
    if (!getIsPlaying()) await waitForResume(getIsPlaying)

    setCurrentIndex(i)
    const key = arr[i]
    
    // Find insertion point using binary search
    const pos = binarySearch(arr, key, 0, i - 1, isAscending)
    
    // Shift elements only if needed
    if (pos < i) {
      for (let j = i; j > pos; j--) {
        setCompareIndex(j - 1)
        await new Promise(resolve => setTimeout(resolve, getDelay(getSpeed())))
        arr[j] = arr[j - 1]
        setArray([...arr])
      }
      arr[pos] = key
      setArray([...arr])
    }
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
  
  // Optimization: Median-of-three pivot selection
  const medianOfThree = (arr, low, high) => {
    const mid = Math.floor((low + high) / 2)
    const a = arr[low]
    const b = arr[mid]
    const c = arr[high]
    
    // Sort a, b, c and put median at high-1
    if (a > b) [arr[low], arr[mid]] = [arr[mid], arr[low]]
    if (b > c) [arr[mid], arr[high]] = [arr[high], arr[mid]]
    if (a > b) [arr[low], arr[mid]] = [arr[mid], arr[low]]
    
    return mid
  }
  
  // Insertion sort for small subarrays
  const insertionSortRange = async (start, end) => {
    for (let i = start + 1; i <= end; i++) {
      if (!getIsPlaying()) await waitForResume(getIsPlaying)
      
      let key = arr[i]
      let j = i - 1
      
      while (j >= start && shouldSwap(arr[j], key, isAscending)) {
        setCurrentIndex(j + 1)
        setCompareIndex(j)
        await new Promise(resolve => setTimeout(resolve, getDelay(getSpeed())))
        
        arr[j + 1] = arr[j]
        setArray([...arr])
        j--
      }
      
      arr[j + 1] = key
      setArray([...arr])
    }
  }

  const partition = async (low, high) => {
    // Use median-of-three for pivot selection
    const pivotIndex = medianOfThree(arr, low, high)
    const pivot = arr[pivotIndex]
    await animateSwap(arr, pivotIndex, high, setArray, getSpeed)
    
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
    // Use insertion sort for small subarrays
    if (high - low < 10) {
      await insertionSortRange(low, high)
      return
    }
    
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
