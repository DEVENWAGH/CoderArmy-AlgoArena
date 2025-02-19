class TreeNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
    this.height = 1;
  }
}

export const treeTraversals = async (root, onStep) => {
  const result = {
    inorder: [],
    preorder: [],
    postorder: []
  };

  const inorder = async (node) => {
    if (node) {
      await inorder(node.left);
      result.inorder.push(node.value);
      await onStep({ ...result });
      await inorder(node.right);
    }
  };

  const preorder = async (node) => {
    if (node) {
      result.preorder.push(node.value);
      await onStep({ ...result });
      await preorder(node.left);
      await preorder(node.right);
    }
  };

  const postorder = async (node) => {
    if (node) {
      await postorder(node.left);
      await postorder(node.right);
      result.postorder.push(node.value);
      await onStep({ ...result });
    }
  };

  await Promise.all([
    inorder(root),
    preorder(root),
    postorder(root)
  ]);

  return result;
};

export const bstOperations = {
  insert: async (root, value, onStep) => {
    if (!root) {
      root = new TreeNode(value);
      await onStep(root);
      return root;
    }

    if (value < root.value) {
      root.left = await bstOperations.insert(root.left, value, onStep);
    } else if (value > root.value) {
      root.right = await bstOperations.insert(root.right, value, onStep);
    }

    await onStep(root);
    return root;
  },

  delete: async (root, value, onStep) => {
    if (!root) return root;

    if (value < root.value) {
      root.left = await bstOperations.delete(root.left, value, onStep);
    } else if (value > root.value) {
      root.right = await bstOperations.delete(root.right, value, onStep);
    } else {
      if (!root.left) {
        await onStep(root.right);
        return root.right;
      } else if (!root.right) {
        await onStep(root.left);
        return root.left;
      }

      root.value = await bstOperations.minValue(root.right);
      root.right = await bstOperations.delete(root.right, root.value, onStep);
    }

    await onStep(root);
    return root;
  },

  minValue: async (root) => {
    let minv = root.value;
    while (root.left) {
      minv = root.left.value;
      root = root.left;
    }
    return minv;
  }
};

export const avlRotations = {
  getHeight: (node) => {
    return node ? node.height : 0;
  },

  getBalance: (node) => {
    return node ? avlRotations.getHeight(node.left) - avlRotations.getHeight(node.right) : 0;
  },

  rightRotate: async (y, onStep) => {
    const x = y.left;
    const T2 = x.right;

    x.right = y;
    y.left = T2;

    y.height = Math.max(avlRotations.getHeight(y.left), avlRotations.getHeight(y.right)) + 1;
    x.height = Math.max(avlRotations.getHeight(x.left), avlRotations.getHeight(x.right)) + 1;

    await onStep(x);
    return x;
  },

  leftRotate: async (x, onStep) => {
    const y = x.right;
    const T2 = y.left;

    y.left = x;
    x.right = T2;

    x.height = Math.max(avlRotations.getHeight(x.left), avlRotations.getHeight(x.right)) + 1;
    y.height = Math.max(avlRotations.getHeight(y.left), avlRotations.getHeight(y.right)) + 1;

    await onStep(y);
    return y;
  }
};

export const findLCA = async (root, n1, n2, onStep) => {
  if (!root) return null;

  await onStep(root);

  if (root.value === n1 || root.value === n2) {
    return root;
  }

  const leftLCA = await findLCA(root.left, n1, n2, onStep);
  const rightLCA = await findLCA(root.right, n1, n2, onStep);

  if (leftLCA && rightLCA) {
    return root;
  }

  return leftLCA ? leftLCA : rightLCA;
};

// Helper function to create a binary tree from array
export const createTree = (arr) => {
  if (!arr.length) return null;
  
  const root = new TreeNode(arr[0]);
  const queue = [root];
  let i = 1;
  
  while (queue.length && i < arr.length) {
    const node = queue.shift();
    
    if (i < arr.length && arr[i] !== null) {
      node.left = new TreeNode(arr[i]);
      queue.push(node.left);
    }
    i++;
    
    if (i < arr.length && arr[i] !== null) {
      node.right = new TreeNode(arr[i]);
      queue.push(node.right);
    }
    i++;
  }
  
  return root;
};
