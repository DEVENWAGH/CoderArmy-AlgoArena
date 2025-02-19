export const linearSearch = async (array, target, onStep) => {
  for (let i = 0; i < array.length; i++) {
    await onStep([...array], [i]);
    if (array[i] === target) return i;
  }
  return -1;
};

export const binarySearch = async (array, target, onStep) => {
  let left = 0;
  let right = array.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    await onStep([...array], [mid]);
    
    if (array[mid] === target) return mid;
    if (array[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  
  return -1;
};
