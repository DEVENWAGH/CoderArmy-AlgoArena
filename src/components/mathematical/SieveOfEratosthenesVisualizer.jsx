import { useEffect, useState, useRef } from 'react';
import { motion } from "motion/react"
import { gsap } from 'gsap';

const SieveOfEratosthenesVisualizer = ({ maxNumber, isAnimating, speed, onComplete }) => {
  const [grid, setGrid] = useState([]);
  const [currentPrime, setCurrentPrime] = useState(null);
  const [currentMultiple, setCurrentMultiple] = useState(null);
  const [primes, setPrimes] = useState([]);
  const [step, setStep] = useState(0);
  const [animationCompleted, setAnimationCompleted] = useState(false);
  const [message, setMessage] = useState('');
  
  const animationRef = useRef(null);
  const gridRef = useRef(null);
  
  // Initialize the grid
  useEffect(() => {
    if (maxNumber < 2) return;
    
    // Create a grid of numbers from 2 to maxNumber
    const initialGrid = Array.from({ length: maxNumber - 1 }, (_, i) => ({
      number: i + 2,
      isPrime: true,
      isHighlighted: false,
      isCurrentlyChecking: false,
      isCurrentPrime: false,
      isProcessed: false
    }));
    
    setGrid(initialGrid);
    setPrimes([]);
    setCurrentPrime(null);
    setCurrentMultiple(null);
    setStep(0);
    setMessage('Ready to find prime numbers up to ' + maxNumber);
    setAnimationCompleted(false);
  }, [maxNumber]);

  // Calculate the column count based on the maxNumber
  const getColumnCount = () => {
    if (maxNumber <= 25) return 5;
    if (maxNumber <= 50) return 10;
    if (maxNumber <= 100) return 15;
    return 20;
  };
  
  // Run the Sieve of Eratosthenes algorithm
  useEffect(() => {
    if (!isAnimating || grid.length === 0) return;
    
    let currentStep = step;
    
    // Clear any existing animation
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
    
    const runSieveStep = () => {
      setStep(currentStep);
      
      // Find the next prime number
      const nextUnmarkedIndex = grid.findIndex(
        item => item.isPrime && !item.isProcessed
      );
      
      // If there are no more unmarked numbers, we're done
      if (nextUnmarkedIndex === -1) {
        setAnimationCompleted(true);
        setMessage('Algorithm completed! All prime numbers found.');
        if (onComplete) onComplete();
        return;
      }
      
      const nextPrime = grid[nextUnmarkedIndex].number;
      setCurrentPrime(nextPrime);
      setMessage(`Found prime number: ${nextPrime}. Now marking all multiples as non-prime.`);
      
      // Update the grid to mark the new prime
      const updatedGrid = [...grid];
      updatedGrid[nextUnmarkedIndex].isCurrentPrime = true;
      setPrimes(prev => [...prev, nextPrime]);
      
      // Reset the current multiple
      setCurrentMultiple(null);
      
      // Mark the prime as processed
      updatedGrid[nextUnmarkedIndex].isProcessed = true;
      setGrid(updatedGrid);
      
      currentStep++;
      
      // Schedule the next step to mark multiples
      animationRef.current = setTimeout(() => markMultiples(nextPrime), 1500 / speed);
    };
    
    const markMultiples = (prime) => {
      let updatedGrid = [...grid];
      let currentMultipleVal = prime * 2;
      let allMarked = true;
      
      // If we've already marked all multiples for this prime
      if (currentMultipleVal > maxNumber) {
        runSieveStep();
        return;
      }
      
      // Mark one multiple at a time for visual clarity
      const multipleIndex = updatedGrid.findIndex(
        item => item.number === currentMultipleVal && item.isPrime
      );
      
      if (multipleIndex !== -1) {
        setCurrentMultiple(currentMultipleVal);
        setMessage(`Marking ${currentMultipleVal} (multiple of ${prime}) as non-prime`);
        
        // Mark this multiple as non-prime
        updatedGrid[multipleIndex].isPrime = false;
        updatedGrid[multipleIndex].isHighlighted = true;
        
        // Set temporary highlight state
        setGrid(updatedGrid);
        
        // Clear highlight after a delay
        setTimeout(() => {
          const clearedGrid = [...updatedGrid];
          clearedGrid[multipleIndex].isHighlighted = false;
          setGrid(clearedGrid);
        }, 800 / speed);
        
        allMarked = false;
        currentStep++;
        
        // Schedule next multiple
        animationRef.current = setTimeout(
          () => markMultiples(prime, prime * 2), 
          600 / speed
        );
        
        return;
      }
      
      // Find next multiple to mark
      for (let i = currentMultipleVal + prime; i <= maxNumber; i += prime) {
        const idx = updatedGrid.findIndex(item => item.number === i && item.isPrime);
        if (idx !== -1) {
          allMarked = false;
          
          // Schedule marking this multiple
          animationRef.current = setTimeout(() => {
            setCurrentMultiple(i);
            setMessage(`Marking ${i} (multiple of ${prime}) as non-prime`);
            
            const nextGrid = [...grid];
            nextGrid[idx].isPrime = false;
            nextGrid[idx].isHighlighted = true;
            setGrid(nextGrid);
            
            // Clear highlight after a delay
            setTimeout(() => {
              const clearedGrid = [...nextGrid];
              clearedGrid[idx].isHighlighted = false;
              setGrid(clearedGrid);
            }, 800 / speed);
            
            // Continue with next multiple
            animationRef.current = setTimeout(
              () => markMultiples(prime, i + prime), 
              600 / speed
            );
          }, 600 / speed);
          
          return;
        }
      }
      
      // If all multiples are marked, proceed to the next prime
      if (allMarked) {
        // Reset current prime highlight
        updatedGrid = updatedGrid.map(item => ({
          ...item,
          isCurrentPrime: item.number === prime ? false : item.isCurrentPrime
        }));
        setGrid(updatedGrid);
        
        // Schedule next step
        animationRef.current = setTimeout(runSieveStep, 1000 / speed);
      }
    };
    
    // Start the animation
    if (currentStep === 0) {
      setMessage('Starting Sieve of Eratosthenes...');
      animationRef.current = setTimeout(runSieveStep, 1000 / speed);
    }
    
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [isAnimating, grid, step, maxNumber, speed, onComplete]);
  
  // Animation for completion visualization
  useEffect(() => {
    if (animationCompleted && primes.length > 0) {
      // Highlight all prime numbers with a celebratory animation
      const timeline = gsap.timeline();
      
      primes.forEach((prime, index) => {
        const element = document.querySelector(`.number-cell-${prime}`);
        if (element) {
          timeline.to(element, {
            backgroundColor: 'rgba(34, 197, 94, 0.8)',
            scale: 1.1,
            yoyo: true,
            repeat: 1,
            duration: 0.3,
            delay: index * 0.05
          }, index * 0.05);
        }
      });
    }
  }, [animationCompleted, primes]);
  
  // Calculate the grid's column width
  const columnCount = getColumnCount();
  const columnWidth = `repeat(${columnCount}, minmax(0, 1fr))`;

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 bg-slate-800 rounded-lg mb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Current Status:</h3>
          <div>
            {currentPrime && (
              <span className="px-3 py-1 bg-sky-600 rounded-full text-white text-sm mr-3">
                Current Prime: {currentPrime}
              </span>
            )}
            {currentMultiple && (
              <span className="px-3 py-1 bg-yellow-600 rounded-full text-white text-sm">
                Checking Multiple: {currentMultiple}
              </span>
            )}
          </div>
        </div>
        <p className="mt-2 text-gray-300">
          {message}
        </p>
      </div>
      
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center p-6 bg-slate-900 rounded-lg overflow-auto" ref={gridRef}>
        <div 
          className="grid gap-2 w-full max-w-4xl mx-auto" 
          style={{ gridTemplateColumns: columnWidth }}
        >
          {grid.map((cell) => (
            <motion.div 
              key={cell.number}
              className={`number-cell number-cell-${cell.number} relative flex items-center justify-center p-2 rounded-lg font-mono text-lg
                ${cell.isPrime 
                  ? cell.isCurrentPrime 
                    ? 'bg-sky-600 text-white' 
                    : cell.isProcessed 
                      ? 'bg-green-600 text-white' 
                      : 'bg-blue-500 text-white'
                  : cell.isHighlighted 
                    ? 'bg-yellow-500 text-white' 
                    : 'bg-slate-700 text-gray-400'
                }
              `}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                backgroundColor: cell.isHighlighted 
                  ? 'rgb(234, 179, 8)' // yellow-500
                  : cell.isCurrentPrime 
                    ? 'rgb(2, 132, 199)' // sky-600
                    : cell.isPrime && cell.isProcessed 
                      ? 'rgb(22, 163, 74)' // green-600
                      : cell.isPrime 
                        ? 'rgb(59, 130, 246)' // blue-500
                        : 'rgb(51, 65, 85)' // slate-700
              }}
              transition={{ 
                duration: 0.3,
                delay: cell.number * 0.003
              }}
            >
              {cell.number}
            </motion.div>
          ))}
        </div>
        
        {animationCompleted && (
          <motion.div 
            className="mt-8 p-4 bg-green-700 rounded-lg max-w-md mx-auto text-center md:mt-0 md:ml-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-xl font-bold text-white mb-2">Algorithm Complete!</h3>
            <p className="text-white">Found {primes.length} prime numbers:</p>
            <div className="mt-2 flex flex-col md:flex-row md:flex-wrap md:justify-center gap-2 primes-list">
              {primes.map(prime => (
                <span key={prime} className="px-2 py-1 bg-green-900 rounded-md text-green-100">
                  {prime}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SieveOfEratosthenesVisualizer;
