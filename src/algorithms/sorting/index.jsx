const getDelay = (speed) => {
  // More responsive delay calculation with a better curve
  return Math.floor(1000 - (speed / 100) * 950);
};

const waitForResume = async (getIsPlaying) => {
  while (!getIsPlaying()) {
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
};

const animateSwap = async (arr, i, j, setArray, getSpeed) => {
  const delay = getDelay(getSpeed());

  // Set indices before swap to trigger animation
  setArray([...arr], i, j);
  await new Promise((resolve) => setTimeout(resolve, delay * 0.5));

  // Perform swap
  [arr[i], arr[j]] = [arr[j], arr[i]];

  // Update array to show new positions
  setArray([...arr]);
  await new Promise((resolve) => setTimeout(resolve, delay * 0.5));
};

const shouldSwap = (a, b, isAscending) => {
  return isAscending ? a > b : a < b;
};

const isInOrder = (a, b, isAscending) => {
  return isAscending ? a <= b : a >= b;
};

export const bubbleSort = async (
  array,
  setArray,
  setCurrentIndex,
  setCompareIndex,
  getSpeed,
  getIsPlaying,
  isAscending
) => {
  const arr = [...array];
  const n = arr.length;

  // Flag to track if any swaps occurred in the current pass
  let swapped;

  // Main bubble sort algorithm
  for (let i = 0; i < n - 1; i++) {
    swapped = false;

    // Each pass finds the next largest/smallest element
    for (let j = 0; j < n - i - 1; j++) {
      if (!getIsPlaying()) await waitForResume(getIsPlaying);

      // Highlight the two elements being compared
      setCurrentIndex(j);
      setCompareIndex(j + 1);
      await new Promise((resolve) => setTimeout(resolve, getDelay(getSpeed())));

      // Check if we need to swap based on sort direction
      if (shouldSwap(arr[j], arr[j + 1], isAscending)) {
        // Perform the swap with animation
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        setArray([...arr], j, j + 1);
        swapped = true;

        // Pause slightly longer on swap to make it visible
        await new Promise((resolve) =>
          setTimeout(resolve, getDelay(getSpeed()) * 0.7)
        );
      }
    }

    // If no swapping occurred in this pass, array is sorted
    if (!swapped) break;
  }

  // Clear highlighting when sort is complete
  setCurrentIndex(-1);
  setCompareIndex(-1);
  return arr;
};

export const insertionSort = async (
  array,
  setArray,
  setCurrentIndex,
  setCompareIndex,
  getSpeed,
  getIsPlaying,
  isAscending
) => {
  const arr = [...array];
  const n = arr.length;

  for (let i = 1; i < n; i++) {
    if (!getIsPlaying()) await waitForResume(getIsPlaying);

    setCurrentIndex(i);
    const key = arr[i];
    let j = i - 1;

    // Highlight the current element to be inserted
    await new Promise((resolve) =>
      setTimeout(resolve, getDelay(getSpeed()) * 0.5)
    );

    // Simple insertion sort for better visualization
    while (j >= 0 && shouldSwap(arr[j], key, isAscending)) {
      if (!getIsPlaying()) await waitForResume(getIsPlaying);

      setCompareIndex(j);
      await new Promise((resolve) =>
        setTimeout(resolve, getDelay(getSpeed()) * 0.5)
      );

      arr[j + 1] = arr[j];
      setArray([...arr], j + 1, j);
      await new Promise((resolve) =>
        setTimeout(resolve, getDelay(getSpeed()) * 0.5)
      );

      j--;
    }

    arr[j + 1] = key;
    setArray([...arr]);
    await new Promise((resolve) =>
      setTimeout(resolve, getDelay(getSpeed()) * 0.5)
    );
  }

  setCurrentIndex(-1);
  setCompareIndex(-1);
  return arr;
};

export const selectionSort = async (
  array,
  setArray,
  setCurrentIndex,
  setCompareIndex,
  getSpeed,
  getIsPlaying,
  isAscending
) => {
  const arr = [...array];
  const n = arr.length;

  for (let i = 0; i < n - 1; i++) {
    let extremeIdx = i;
    setCurrentIndex(i);

    for (let j = i + 1; j < n; j++) {
      if (!getIsPlaying()) await waitForResume(getIsPlaying);

      setCompareIndex(j);
      await new Promise((resolve) => setTimeout(resolve, getDelay(getSpeed())));

      // Fix comparison logic for ascending/descending
      if (isAscending ? arr[j] < arr[extremeIdx] : arr[j] > arr[extremeIdx]) {
        extremeIdx = j;
      }
    }

    if (extremeIdx !== i) {
      await animateSwap(arr, i, extremeIdx, setArray, getSpeed);
    }
  }

  setCurrentIndex(-1);
  setCompareIndex(-1);
  return arr;
};

export const mergeSort = async (
  array,
  setArray,
  setCurrentIndex,
  setCompareIndex,
  getSpeed,
  getIsPlaying,
  isAscending
) => {
  const arr = [...array];

  const merge = async (start, mid, end) => {
    // Create temporary arrays
    const leftArr = arr.slice(start, mid + 1);
    const rightArr = arr.slice(mid + 1, end + 1);
    let i = 0,
      j = 0,
      k = start;

    while (i < leftArr.length && j < rightArr.length) {
      if (!getIsPlaying()) await waitForResume(getIsPlaying);

      setCurrentIndex(start + i);
      setCompareIndex(mid + 1 + j);
      await new Promise((resolve) => setTimeout(resolve, getDelay(getSpeed())));

      // Use isInOrder with the correct order
      const shouldSelectLeft = isInOrder(leftArr[i], rightArr[j], isAscending);

      if (shouldSelectLeft) {
        arr[k] = leftArr[i];
        i++;
      } else {
        arr[k] = rightArr[j];
        j++;
      }
      setArray([...arr]);
      k++;
      await new Promise((resolve) =>
        setTimeout(resolve, getDelay(getSpeed()) / 2)
      );
    }

    // Copy remaining elements
    while (i < leftArr.length) {
      if (!getIsPlaying()) await waitForResume(getIsPlaying);
      arr[k] = leftArr[i];
      setArray([...arr]);
      setCurrentIndex(k);
      i++;
      k++;
      await new Promise((resolve) =>
        setTimeout(resolve, getDelay(getSpeed()) / 2)
      );
    }

    while (j < rightArr.length) {
      if (!getIsPlaying()) await waitForResume(getIsPlaying);
      arr[k] = rightArr[j];
      setArray([...arr]);
      setCompareIndex(k);
      j++;
      k++;
      await new Promise((resolve) =>
        setTimeout(resolve, getDelay(getSpeed()) / 2)
      );
    }
  };

  const mergeSortHelper = async (start, end) => {
    if (start < end) {
      const mid = Math.floor(start + (end - start) / 2);

      // Visualize division
      setCurrentIndex(start);
      setCompareIndex(end);
      await new Promise((resolve) => setTimeout(resolve, getDelay(getSpeed())));

      // Recursively sort
      await mergeSortHelper(start, mid);
      await mergeSortHelper(mid + 1, end);

      // Merge sorted halves
      await merge(start, mid, end);
    }
  };

  await mergeSortHelper(0, arr.length - 1);
  setCurrentIndex(-1);
  setCompareIndex(-1);
  return arr;
};

export const quickSort = async (
  array,
  setArray,
  setCurrentIndex,
  setCompareIndex,
  getSpeed,
  getIsPlaying,
  isAscending
) => {
  const arr = [...array];

  // Simplified pivot selection for better visualization
  const partition = async (low, high) => {
    const pivot = arr[high]; // Use the last element as pivot for clarity
    setCurrentIndex(high);
    await new Promise((resolve) =>
      setTimeout(resolve, getDelay(getSpeed()) * 0.5)
    );

    let i = low - 1;

    for (let j = low; j < high; j++) {
      if (!getIsPlaying()) await waitForResume(getIsPlaying);

      setCompareIndex(j);
      await new Promise((resolve) => setTimeout(resolve, getDelay(getSpeed())));

      if (isInOrder(arr[j], pivot, isAscending)) {
        i++;
        if (i !== j) {
          await animateSwap(arr, i, j, setArray, getSpeed);
        }
      }
    }

    await animateSwap(arr, i + 1, high, setArray, getSpeed);
    return i + 1;
  };

  const quickSortHelper = async (low, high) => {
    if (low < high) {
      const pi = await partition(low, high);

      // Visualize partitioning
      setCurrentIndex(-1);
      setCompareIndex(-1);
      await new Promise((resolve) =>
        setTimeout(resolve, getDelay(getSpeed()) * 0.3)
      );

      await quickSortHelper(low, pi - 1);
      await quickSortHelper(pi + 1, high);
    }
  };

  await quickSortHelper(0, arr.length - 1);
  setCurrentIndex(-1);
  setCompareIndex(-1);
  return arr;
};

export const getSortingAlgorithm = (name) => {
  const algorithms = {
    "bubble-sort": bubbleSort,
    "insertion-sort": insertionSort,
    "selection-sort": selectionSort,
    "merge-sort": mergeSort,
    "quick-sort": quickSort,
  };
  return algorithms[name];
};

export default {
  bubbleSort,
  insertionSort,
  selectionSort,
  mergeSort,
  quickSort,
};
