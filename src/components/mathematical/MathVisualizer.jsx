import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import EuclideanGCDVisualizer from './EuclideanGCDVisualizer';
import SieveOfEratosthenesVisualizer from './SieveOfEratosthenesVisualizer';
import PrimeFactorizationVisualizer from './PrimeFactorizationVisualizer';

const MathVisualizer = () => {
  const { algorithm } = useParams();
  const [inputValues, setInputValues] = useState({ 
    num1: 48, 
    num2: 18,
    maxNumber: 100,
    factorNumber: 84
  });
  const [isAnimating, setIsAnimating] = useState(false);
  const [speed, setSpeed] = useState(1);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputValues(prev => ({
      ...prev,
      [name]: parseInt(value) || 0
    }));
  };
  
  const handleSpeedChange = (e) => {
    setSpeed(parseFloat(e.target.value));
  };
  
  const startVisualization = () => {
    if ((algorithm === 'gcd-(euclidean)' && inputValues.num1 > 0 && inputValues.num2 > 0) || 
        (algorithm === 'sieve-of-eratosthenes' && inputValues.maxNumber > 1) ||
        (algorithm === 'prime-factorization' && inputValues.factorNumber > 1)) {
      setIsAnimating(true);
    }
  };
  
  const stopVisualization = () => {
    setIsAnimating(false);
  };

  const renderVisualizer = () => {
    switch (algorithm) {
      case 'gcd-(euclidean)':
        return (
          <EuclideanGCDVisualizer 
            num1={inputValues.num1} 
            num2={inputValues.num2} 
            isAnimating={isAnimating}
            speed={speed}
            onComplete={() => setIsAnimating(false)}
          />
        );
      case 'sieve-of-eratosthenes':
        return (
          <SieveOfEratosthenesVisualizer 
            maxNumber={inputValues.maxNumber} 
            isAnimating={isAnimating}
            speed={speed}
            onComplete={() => setIsAnimating(false)}
          />
        );
      case 'prime-factorization':
        return (
          <PrimeFactorizationVisualizer 
            number={inputValues.factorNumber}
            isAnimating={isAnimating}
            speed={speed}
            onComplete={() => setIsAnimating(false)}
          />
        );
      default:
        return <div className="text-center text-gray-400 mt-12">Select a mathematical algorithm to visualize</div>;
    }
  };

  const getAlgorithmTitle = () => {
    switch (algorithm) {
      case 'gcd-(euclidean)':
        return 'Euclidean Algorithm (GCD)';
      case 'sieve-of-eratosthenes':
        return 'Sieve of Eratosthenes';
      case 'prime-factorization':
        return 'Prime Factorization';
      default:
        return algorithm ? algorithm.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ') : 'Mathematical Algorithm';
    }
  };

  return (
    <div className="flex flex-col w-full h-full p-4">
      <h2 className="text-xl font-bold text-sky-400 mb-6">
        {getAlgorithmTitle()}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="p-4 bg-slate-800 rounded-lg">
          <h3 className="text-lg text-white font-medium mb-4">Parameters</h3>
          <div className="space-y-4">
            {algorithm === 'gcd-(euclidean)' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">First Number</label>
                  <input
                    type="number"
                    name="num1"
                    value={inputValues.num1}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-3 py-2 bg-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Second Number</label>
                  <input
                    type="number"
                    name="num2"
                    value={inputValues.num2}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-3 py-2 bg-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </>
            )}
            {algorithm === 'sieve-of-eratosthenes' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Maximum Number</label>
                <input
                  type="number"
                  name="maxNumber"
                  value={inputValues.maxNumber}
                  onChange={handleInputChange}
                  min="2"
                  max="200"
                  className="w-full px-3 py-2 bg-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <p className="mt-1 text-xs text-gray-400">Maximum value: 200 (for visualization clarity)</p>
              </div>
            )}
            {algorithm === 'prime-factorization' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Number to Factorize</label>
                <input
                  type="number"
                  name="factorNumber"
                  value={inputValues.factorNumber}
                  onChange={handleInputChange}
                  min="2"
                  max="100000"
                  className="w-full px-3 py-2 bg-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            )}
          </div>
        </div>
        
        <div className="p-4 bg-slate-800 rounded-lg">
          <h3 className="text-lg text-white font-medium mb-4">Animation Controls</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Animation Speed</label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Slow</span>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.5"
                  value={speed}
                  onChange={handleSpeedChange}
                  className="flex-1"
                />
                <span className="text-xs text-gray-400">Fast</span>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={startVisualization}
                disabled={isAnimating}
                className={`px-4 py-2 rounded-lg flex-1 ${isAnimating ? 'bg-gray-600 text-gray-400' : 'bg-sky-500 text-white hover:bg-sky-600'}`}
              >
                Start
              </button>
              <button
                onClick={stopVisualization}
                disabled={!isAnimating}
                className={`px-4 py-2 rounded-lg flex-1 ${!isAnimating ? 'bg-gray-600 text-gray-400' : 'bg-red-500 text-white hover:bg-red-600'}`}
              >
                Stop
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-slate-800 rounded-lg">
          <h3 className="text-lg text-white font-medium mb-4">About the Algorithm</h3>
          <div className="text-sm text-gray-300">
            {algorithm === 'gcd-(euclidean)' ? (
              <>
                <p>The Euclidean algorithm is an efficient method for computing the greatest common divisor (GCD) of two integers.</p>
                <p className="mt-2">It works by repeatedly applying the division algorithm and taking remainders until reaching zero.</p>
                <p className="mt-2">Formula: gcd(a,b) = gcd(b, a mod b)</p>
              </>
            ) : algorithm === 'sieve-of-eratosthenes' ? (
              <>
                <p>The Sieve of Eratosthenes is an ancient algorithm for finding all prime numbers up to any given limit.</p>
                <p className="mt-2">It works by iteratively marking as composite (non-prime) the multiples of each prime, starting from 2.</p>
                <p className="mt-2">The algorithm efficiently finds all the prime numbers up to a specified integer.</p>
              </>
            ) : algorithm === 'prime-factorization' ? (
              <>
                <p>Prime factorization is the process of determining which prime numbers multiply together to form a given composite number.</p>
                <p className="mt-2">The algorithm works by testing potential prime factors, starting with 2, and dividing repeatedly until reaching 1.</p>
                <p className="mt-2">Every composite number can be expressed uniquely as a product of primes (Fundamental Theorem of Arithmetic).</p>
              </>
            ) : (
              <p>Select an algorithm to see its description.</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex-1 bg-slate-900 rounded-lg overflow-hidden min-h-[400px]">
        {renderVisualizer()}
      </div>
    </div>
  );
};

export default MathVisualizer;
