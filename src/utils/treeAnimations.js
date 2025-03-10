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
 * Centers the tree in the viewport with improved device-specific handling
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
    // Get device type
    const screenWidth = window.innerWidth;

    // Set vertical position based on device type
    let verticalPosition = dimensions.height / 5;
    if (screenWidth < 768) {
      // Mobile devices - position tree higher
      verticalPosition = dimensions.height / 6;
    } else if (screenWidth < 1024) {
      // Tablets - adjust position for better visibility
      verticalPosition = dimensions.height / 5.5;
    }

    // Determine the appropriate scale based on device and viewport
    let scale = 1;
    if (screenWidth < 640) {
      // Small mobile devices
      scale = 0.7;
    } else if (screenWidth < 768) {
      // Standard mobile devices
      scale = 0.8;
    } else if (screenWidth < 1024) {
      // Tablets
      scale = 0.9;
    }

    // Center the tree horizontally and position properly vertically
    setTransform((prev) => ({
      ...prev,
      x: dimensions.width / 2 - rootNode.x,
      y: verticalPosition - rootNode.y,
      scale: scale, // Use device-specific scale
    }));
  }
}
