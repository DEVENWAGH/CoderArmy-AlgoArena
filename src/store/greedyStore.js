import { create } from 'zustand'
import { activitySelection, huffmanCoding } from '../algorithms/greedy/index'

const useGreedyStore = create((set, get) => ({
  // General state
  algorithm: null,
  isPlaying: false,
  isPaused: false,
  speed: 50,

  // Activity Selection
  activities: [],
  selectedActivities: [],

  // Huffman Coding
  frequencies: {},
  huffmanTree: null,
  huffmanCodes: {},

  // Setters and actions
  setSpeed: (speed) => set({ speed }),
  
  startAlgorithm: (algorithm) => {
    // Reset state based on algorithm
    if (algorithm === 'activity-selection') {
      // Generate random activities
      const activities = [];
      let startTime = 0;
      
      for (let i = 1; i <= 8; i++) {
        const duration = Math.floor(Math.random() * 3) + 1;
        const start = startTime;
        const finish = start + duration;
        
        activities.push({
          id: i,
          start,
          finish
        });
        
        // Add some gaps between activities
        startTime = finish + Math.floor(Math.random() * 2);
      }
      
      set({
        algorithm,
        activities,
        selectedActivities: [],
        isPlaying: false,
        isPaused: false
      });
    } 
    else if (algorithm === 'huffman-coding') {
      // Sample frequencies
      const frequencies = {
        'A': 5,
        'B': 9,
        'C': 12,
        'D': 13,
        'E': 16,
        'F': 45
      };
      
      set({
        algorithm,
        frequencies,
        huffmanTree: null,
        huffmanCodes: {},
        isPlaying: false,
        isPaused: false
      });
    }
  },
  
  runAlgorithm: async (algorithm) => {
    set({ isPlaying: true, isPaused: false });
    
    if (algorithm === 'activity-selection') {
      const activities = [...get().activities];
      
      // Run activity selection
      try {
        const selected = await activitySelection(
          activities,
          (selectedActivities) => set({ selectedActivities }),
          () => get().speed,
          () => get().isPlaying && !get().isPaused
        );
        
        set({ selectedActivities: selected, isPlaying: false });
      } catch (error) {
        console.error('Error running activity selection:', error);
        set({ isPlaying: false });
      }
    } 
    else if (algorithm === 'huffman-coding') {
      const frequencies = { ...get().frequencies };
      
      try {
        // Run Huffman coding with a more stable node structure
        const tree = await huffmanCoding(
          frequencies,
          (nodes) => {
            // Find the root node (becomes the tree)
            const root = nodes.length === 1 ? nodes[0] : null;
            
            // Make a deep clone of the tree to ensure stability
            const cloneNode = (node) => {
              if (!node) return null;
              const newNode = {
                char: node.char,
                freq: node.freq,
                left: cloneNode(node.left),
                right: cloneNode(node.right)
              };
              return newNode;
            };
            
            const stableTree = cloneNode(root);
            set({ huffmanTree: stableTree });
            
            // Generate codes if we have a root
            if (stableTree) {
              const codes = {};
              const generateCodes = (node, code = '') => {
                if (node.char) {
                  codes[node.char] = code;
                }
                if (node.left) generateCodes(node.left, code + '0');
                if (node.right) generateCodes(node.right, code + '1');
              };
              
              generateCodes(stableTree);
              set({ huffmanCodes: codes });
            }
          },
          () => get().speed,
          () => get().isPlaying && !get().isPaused
        );
        
        // Create a final stable version of the tree
        const cloneNode = (node) => {
          if (!node) return null;
          const newNode = {
            char: node.char,
            freq: node.freq,
            left: cloneNode(node.left),
            right: cloneNode(node.right)
          };
          return newNode;
        };
        
        const finalTree = cloneNode(tree);
        set({ huffmanTree: finalTree, isPlaying: false });
        
        // Generate final codes
        if (finalTree) {
          const codes = {};
          const generateCodes = (node, code = '') => {
            if (node.char) {
              codes[node.char] = code;
            }
            if (node.left) generateCodes(node.left, code + '0');
            if (node.right) generateCodes(node.right, code + '1');
          };
          
          generateCodes(finalTree);
          set({ huffmanCodes: codes });
        }
      } catch (error) {
        console.error('Error running Huffman coding:', error);
        set({ isPlaying: false });
      }
    }
  },
  
  pauseAlgorithm: () => set({ isPaused: true, isPlaying: false }),
  resumeAlgorithm: () => set({ isPaused: false, isPlaying: true }),
}));

export default useGreedyStore;
