export const fibonacci = async (n, onStep) => {
  if (n <= 1) return n;
  
  let prev = 0, curr = 1;
  await onStep([prev, curr]);
  
  for (let i = 2; i <= n; i++) {
    const next = prev + curr;
    prev = curr;
    curr = next;
    await onStep([prev, curr]);
  }
  
  return curr;
};

export const factorial = async (n, onStep) => {
  let result = 1;
  await onStep([result]);
  
  for (let i = 2; i <= n; i++) {
    result *= i;
    await onStep([result]);
  }
  
  return result;
};

export const gcd = async (a, b, onStep) => {
  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
    await onStep([a, b]);
  }
  return a;
};

export const sieveOfEratosthenes = async (n, onStep) => {
  const isPrime = Array(n + 1).fill(true);
  isPrime[0] = isPrime[1] = false;
  
  for (let i = 2; i * i <= n; i++) {
    if (isPrime[i]) {
      for (let j = i * i; j <= n; j += i) {
        isPrime[j] = false;
        await onStep([...isPrime]);
      }
    }
  }
  
  return isPrime;
};

export const primeFactorization = async (n, onStep) => {
  const factors = [];
  let num = n;
  
  for (let i = 2; i * i <= n; i++) {
    while (num % i === 0) {
      factors.push(i);
      num /= i;
      await onStep([...factors]);
    }
  }
  
  if (num > 1) {
    factors.push(num);
    await onStep([...factors]);
  }
  
  return factors;
};
