// Helper function to control animation speed
const wait = (speed) => new Promise(resolve => {
  setTimeout(resolve, Math.floor(800 - ((speed/100) * 750)))
})

export const activitySelection = async (activities, onStep, getSpeed, isPlaying) => {
  // Sort activities by finish time
  activities.sort((a, b) => a.finish - b.finish);
  
  // Wait to show initial state
  await wait(getSpeed());
  
  const selected = [activities[0]];
  let lastSelected = 0;
  
  onStep([...selected]);
  await wait(getSpeed());
  
  for (let i = 1; i < activities.length; i++) {
    if (!isPlaying()) {
      while (!isPlaying()) {
        await new Promise(r => setTimeout(r, 100));
      }
    }

    if (activities[i].start >= activities[lastSelected].finish) {
      selected.push(activities[i]);
      lastSelected = i;
      onStep([...selected]);
      await wait(getSpeed());
    } else {
      // Optionally show skipped activities with a brief highlight
      await wait(getSpeed() / 2);
    }
  }
  
  return selected;
};

export const huffmanCoding = async (frequencies, onStep, getSpeed, isPlaying) => {
  class Node {
    constructor(char, freq) {
      this.char = char;
      this.freq = freq;
      this.left = null;
      this.right = null;
    }
  }
  
  const nodes = Object.entries(frequencies).map(([char, freq]) => new Node(char, freq));
  
  // Initial wait to show the starting state
  await wait(getSpeed());
  await onStep([...nodes]); // Show initial nodes
  
  while (nodes.length > 1) {
    if (!isPlaying()) {
      while (!isPlaying()) {
        await new Promise(r => setTimeout(r, 100));
      }
    }
  
    nodes.sort((a, b) => a.freq - b.freq);
    
    const left = nodes.shift();
    const right = nodes.shift();
    
    const parent = new Node(null, left.freq + right.freq);
    parent.left = left;
    parent.right = right;
    
    nodes.push(parent);
    await wait(getSpeed());
    await onStep([...nodes]);
  }
  
  return nodes[0];
};

// Add more greedy algorithms here as needed
export const fractionalKnapsack = async (items, capacity, onStep, getSpeed, isPlaying) => {
  // Sort items by value/weight ratio in descending order
  items.sort((a, b) => (b.value / b.weight) - (a.value / a.weight));
  
  let totalValue = 0;
  let remainingCapacity = capacity;
  const selected = [];
  
  await onStep({ selected: [...selected], totalValue, remainingCapacity });
  await wait(getSpeed());
  
  for (let i = 0; i < items.length; i++) {
    if (!isPlaying()) {
      while (!isPlaying()) {
        await new Promise(r => setTimeout(r, 100));
      }
    }
    
    const item = items[i];
    
    if (remainingCapacity >= item.weight) {
      // Take the whole item
      selected.push({ ...item, fraction: 1 });
      totalValue += item.value;
      remainingCapacity -= item.weight;
    } else if (remainingCapacity > 0) {
      // Take a fraction of the item
      const fraction = remainingCapacity / item.weight;
      selected.push({ ...item, fraction });
      totalValue += item.value * fraction;
      remainingCapacity = 0;
    }
    
    await onStep({ selected: [...selected], totalValue, remainingCapacity });
    await wait(getSpeed());
    
    if (remainingCapacity === 0) break;
  }
  
  return { selected, totalValue };
};

export const jobScheduling = async (jobs, onStep, getSpeed, isPlaying) => {
  // Sort jobs by profit in descending order
  jobs.sort((a, b) => b.profit - a.profit);
  
  // Find the maximum deadline
  const maxDeadline = jobs.reduce((max, job) => Math.max(max, job.deadline), 0);
  
  // Initialize slots
  const slots = new Array(maxDeadline).fill(null);
  const scheduled = [];
  
  await onStep({ slots: [...slots], scheduled: [...scheduled] });
  await wait(getSpeed());
  
  for (let i = 0; i < jobs.length; i++) {
    if (!isPlaying()) {
      while (!isPlaying()) {
        await new Promise(r => setTimeout(r, 100));
      }
    }
    
    const job = jobs[i];
    
    // Find a slot for the job as close to deadline as possible
    for (let j = Math.min(maxDeadline - 1, job.deadline - 1); j >= 0; j--) {
      if (slots[j] === null) {
        slots[j] = job;
        scheduled.push(job);
        break;
      }
    }
    
    await onStep({ slots: [...slots], scheduled: [...scheduled] });
    await wait(getSpeed());
  }
  
  return { slots, scheduled };
};
