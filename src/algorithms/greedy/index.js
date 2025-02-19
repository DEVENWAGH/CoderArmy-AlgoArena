export const activitySelection = async (activities, onStep) => {
  // Sort activities by finish time
  activities.sort((a, b) => a.finish - b.finish);
  
  const selected = [activities[0]];
  let lastSelected = 0;
  
  for (let i = 1; i < activities.length; i++) {
    if (activities[i].start >= activities[lastSelected].finish) {
      selected.push(activities[i]);
      lastSelected = i;
      await onStep(selected);
    }
  }
  
  return selected;
};

export const huffmanCoding = async (frequencies, onStep) => {
  class Node {
    constructor(char, freq) {
      this.char = char;
      this.freq = freq;
      this.left = null;
      this.right = null;
    }
  }
  
  const nodes = Object.entries(frequencies).map(([char, freq]) => new Node(char, freq));
  
  while (nodes.length > 1) {
    nodes.sort((a, b) => a.freq - b.freq);
    
    const left = nodes.shift();
    const right = nodes.shift();
    
    const parent = new Node(null, left.freq + right.freq);
    parent.left = left;
    parent.right = right;
    
    nodes.push(parent);
    await onStep(nodes);
  }
  
  return nodes[0];
};
