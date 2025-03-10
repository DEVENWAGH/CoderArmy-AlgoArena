const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getDelay = (speed) => {
  return Math.floor(800 - (speed / 100) * 750); // Match the sorting delay formula
};

const waitForResume = async (getIsPlaying) => {
  while (!getIsPlaying()) {
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
};

export const linearSearch = async (
  array,
  target,
  onStep,
  getIsPlaying,
  getSpeed = () => 50
) => {
  for (let i = 0; i < array.length; i++) {
    if (!getIsPlaying()) await waitForResume(getIsPlaying);

    await onStep([...array], [i]);
    await delay(getDelay(getSpeed()));

    if (array[i] === target) return i;
  }
  return -1;
};

export const binarySearch = async (
  array,
  target,
  onStep,
  getIsPlaying,
  getSpeed = () => 50
) => {
  let left = 0;
  let right = array.length - 1;

  while (left <= right) {
    if (!getIsPlaying()) await waitForResume(getIsPlaying);

    const mid = Math.floor((left + right) / 2);
    await onStep([...array], [mid]);
    await delay(getDelay(getSpeed()));

    if (array[mid] === target) return mid;
    if (array[mid] < target) left = mid + 1;
    else right = mid - 1;
  }

  return -1;
};

export const getSearchAlgorithm = (name) => {
  const algorithms = {
    "linear-search": linearSearch,
    "binary-search": binarySearch,
  };
  return algorithms[name];
};
