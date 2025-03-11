/**
 * Utility to manage array sizes across different devices
 */

const sizeManager = {
  // Get the default size based on screen width
  getDefaultSize: () => {
    const screenWidth = window.innerWidth;
    if (screenWidth < 640) return 15; // Mobile
    if (screenWidth < 1024) return 20; // Tablet
    return 36; // Desktop
  },

  // Get min and max array sizes based on device
  getSizeLimits: () => {
    const screenWidth = window.innerWidth;
    if (screenWidth < 640) {
      // Mobile
      return { min: 5, max: 30 };
    } else if (screenWidth < 1024) {
      // Tablet
      return { min: 8, max: 50 };
    } else {
      // Desktop
      return { min: 10, max: 100 };
    }
  },

  // Calculate optimal bar width and gap for given array length
  calculateBarDimensions: (arrayLength) => {
    const screenWidth = window.innerWidth;
    const isMobile = screenWidth < 640;
    const isTablet = screenWidth >= 640 && screenWidth < 1024;

    // Determine minimum bar width for 3 digits
    const minBarWidth = isMobile ? 14 : isTablet ? 18 : 22;

    // Calculate container width
    const containerWidth = screenWidth - (isMobile ? 20 : isTablet ? 60 : 300);
    const rightPadding = isMobile ? 40 : 200;

    // Calculate initial gap
    let gap = isMobile ? 1 : isTablet ? 2 : 3;

    // Calculate bar width based on space constraints
    let barWidth = Math.max(
      minBarWidth,
      Math.floor(
        (containerWidth - rightPadding - arrayLength * gap) / arrayLength
      )
    );

    // If bars are too thin, reduce gap and recalculate
    if (barWidth < minBarWidth && gap > 1) {
      gap = 1;
      barWidth = Math.max(
        minBarWidth,
        Math.floor(
          (containerWidth - rightPadding - arrayLength * gap) / arrayLength
        )
      );
    }

    // If bars are still too thin, use minimum width (will require scrolling)
    barWidth = Math.max(barWidth, minBarWidth);

    return {
      barWidth,
      gap,
      containerWidth: (barWidth + gap) * arrayLength + rightPadding,
    };
  },

  // Determine optimal array size based on screen width for best visualization
  getOptimalArraySize: () => {
    const screenWidth = window.innerWidth;

    // Calculate how many bars can fit well on screen
    const minBarWidth = screenWidth < 640 ? 14 : screenWidth < 1024 ? 18 : 22;
    const gap = 2;
    const padding = screenWidth < 640 ? 60 : screenWidth < 1024 ? 120 : 300;

    // Calculate the optimal number of bars that fit comfortably
    const availableWidth = screenWidth - padding;
    const optimalSize = Math.floor(availableWidth / (minBarWidth + gap));

    // Apply constraints
    const { min, max } = sizeManager.getSizeLimits();
    return Math.min(Math.max(optimalSize, min), max);
  },
};

export default sizeManager;
