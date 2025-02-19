export const bubbleSort = async (array, onStep) => {
  const n = array.length;
  let swapped;
  
  for (let i = 0; i < n - 1; i++) {
    swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      if (array[j] > array[j + 1]) {
        // Swap elements
        [array[j], array[j + 1]] = [array[j + 1], array[j]];
        swapped = true;
        // Callback for visualization
        await onStep([...array], [j, j + 1]);
      }
    }
    if (!swapped) break;
  }
  return array;
};

export const selectionSort = async (array, onStep) => {
  const n = array.length;
  
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      if (array[j] < array[minIdx]) {
        minIdx = j;
      }
    }
    if (minIdx !== i) {
      [array[i], array[minIdx]] = [array[minIdx], array[i]];
      await onStep([...array], [i, minIdx]);
    }
  }
  return array;
};

export const insertionSort = async (array, onStep) => {
  const n = array.length;
  
  for (let i = 1; i < n; i++) {
    let key = array[i];
    let j = i - 1;
    while (j >= 0 && array[j] > key) {
      array[j + 1] = array[j];
      j--;
      await onStep([...array], [j + 1, i]);
    }
    array[j + 1] = key;
    await onStep([...array], [j + 1]);
  }
  return array;
};

export const mergeSort = async (array, onStep) => {
  const merge = async (left, right) => {
    let result = [];
    let i = 0, j = 0;
    
    while (i < left.length && j < right.length) {
      if (left[i] <= right[j]) {
        result.push(left[i++]);
      } else {
        result.push(right[j++]);
      }
      await onStep([...result]);
    }
    
    return result.concat(left.slice(i)).concat(right.slice(j));
  };
  
  if (array.length <= 1) return array;
  
  const mid = Math.floor(array.length / 2);
  const left = await mergeSort(array.slice(0, mid), onStep);
  const right = await mergeSort(array.slice(mid), onStep);
  
  return merge(left, right);
};

export const quickSort = async (array, onStep) => {
  const partition = async (low, high) => {
    const pivot = array[high];
    let i = low - 1;
    
    for (let j = low; j < high; j++) {
      if (array[j] <= pivot) {
        i++;
        [array[i], array[j]] = [array[j], array[i]];
        await onStep([...array], [i, j]);
      }
    }
    
    [array[i + 1], array[high]] = [array[high], array[i + 1]];
    await onStep([...array], [i + 1, high]);
    return i + 1;
  };
  
  const sort = async (low, high) => {
    if (low < high) {
      const pi = await partition(low, high);
      await sort(low, pi - 1);
      await sort(pi + 1, high);
    }
  };
  
  await sort(0, array.length - 1);
  return array;
};
