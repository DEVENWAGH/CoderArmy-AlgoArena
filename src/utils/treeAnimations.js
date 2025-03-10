import { gsap } from "gsap";

/**
 * Creates a smooth animation for tree node transitions
 * @param {Object} options Animation options
 * @param {Array} options.nodes The nodes to animate
 * @param {Number} options.duration Animation duration in seconds
 * @param {Function} options.onComplete Callback when animation completes
 * @param {String} options.ease GSAP easing function
 * @returns {Object} GSAP timeline
 */
export function animateTreeTransition(options = {}) {
  const { duration = 0.8, onComplete = null, ease = "power3.out" } = options;

  // Create a new timeline for the animation sequence
  const timeline = gsap.timeline({
    defaults: { ease },
    onComplete,
  });

  // Only animate state changes, not initial load
  // Skip the initial setup animation that causes the shooting effect
  timeline
    .to(".tree-node", {
      opacity: 1,
      scale: 1,
      duration: duration,
      ease: "power2.out",
    })
    .to(
      ".tree-link",
      {
        opacity: 1,
        duration: duration * 0.8,
      },
      "-=0.4"
    );

  return timeline;
}

/**
 * Centers the tree in the viewport
 * @param {Object} tree The tree to center
 * @param {Object} dimensions Viewport dimensions
 * @param {Function} setTransform Function to update transform state
 */
export function centerTreeInViewport(tree, dimensions, setTransform) {
  if (!tree) return;

  // Find the root node
  let rootNode = tree;
  while (rootNode && rootNode.parent) {
    rootNode = rootNode.parent;
  }

  if (rootNode) {
    // Center the tree horizontally and position properly vertically
    setTransform((prev) => ({
      ...prev,
      x: dimensions.width / 2 - rootNode.x,
      y: dimensions.height / 5 - rootNode.y,
      scale: prev.scale || 1, // Keep current scale or default to 1
    }));
  }
}
