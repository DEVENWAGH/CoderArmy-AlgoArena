export const createDefaultTree = () => ({
  value: 50,
  left: {
    value: 25,
    left: {
      value: 12,
      left: { value: 6 },
      right: { value: 18 },
    },
    right: {
      value: 37,
      left: { value: 31 },
      right: { value: 43 },
    },
  },
  right: {
    value: 75,
    left: {
      value: 62,
      left: { value: 56 },
      right: { value: 68 },
    },
    right: {
      value: 87,
      left: { value: 81 },
      right: { value: 93 },
    },
  },
});
