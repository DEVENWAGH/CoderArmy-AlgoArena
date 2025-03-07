import { useEffect, useState, useRef } from 'react';
import { motion } from "motion/react"

const PrimeFactorizationVisualizer = ({ number, isAnimating, speed, onComplete }) => {
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [factors, setFactors] = useState([]);
  const [currentDivisor, setCurrentDivisor] = useState(null);
  const [animationCompleted, setAnimationCompleted] = useState(false);
  const [message, setMessage] = useState('');
  
  const animationRef = useRef(null);
  const stepsContainerRef = useRef(null);
  
  // Add new state for visualization controls
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ x: 0, y: 0 });
  const svgRef = useRef(null);
  
  // Calculate factorization steps
  useEffect(() => {
    if (number <= 1) {
      setSteps([]);
      setFactors([]);
      setMessage(`${number} is neither prime nor composite`);
      return;
    }
    
    const { steps, factors } = calculateFactorizationSteps(number);
    setSteps(steps);
    setFactors(factors);
    setCurrentStep(0);
    setCurrentDivisor(null);
    setMessage(`Ready to factorize ${number}`);
    setAnimationCompleted(false);
    
    // Reset transform when number changes
    setTransform({ x: 0, y: 0, scale: 1 });
  }, [number]);
  
  // Handle animation
  useEffect(() => {
    if (!isAnimating || steps.length === 0) return;
    
    let stepIndex = 0;
    
    // Clear any existing animation
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
    
    const runAnimation = () => {
      if (stepIndex >= steps.length) {
        // Animation completed
        setAnimationCompleted(true);
        setMessage(`Factorization complete! ${number} = ${factors.join(' × ')}`);
        if (onComplete) onComplete();
        return;
      }
      
      const step = steps[stepIndex];
      setCurrentStep(stepIndex);
      setCurrentDivisor(step.divisor);
      
      if (step.isDivisible) {
        setMessage(`${step.number} is divisible by ${step.divisor}: ${step.number} ÷ ${step.divisor} = ${step.quotient}`);
      } else {
        setMessage(`${step.number} is not divisible by ${step.divisor}, trying next divisor`);
      }
      
      // Scroll to show current step
      if (stepsContainerRef.current) {
        const stepElement = stepsContainerRef.current.querySelector(`.step-${stepIndex}`);
        if (stepElement) {
          stepElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
      
      stepIndex++;
      animationRef.current = setTimeout(runAnimation, 1500 / speed);
    };
    
    // Start animation
    setMessage('Starting prime factorization...');
    animationRef.current = setTimeout(runAnimation, 500);
    
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [isAnimating, steps, speed, number, factors, onComplete]);
  
  // Cleanup animation when stopped
  useEffect(() => {
    if (!isAnimating) {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    }
  }, [isAnimating]);
  
  // Helper function to calculate prime factorization steps
  const calculateFactorizationSteps = (num) => {
    const steps = [];
    const factors = [];
    let currentNumber = num;
    let divisor = 2;
    
    while (currentNumber > 1) {
      if (currentNumber % divisor === 0) {
        // Number is divisible by the current divisor
        steps.push({
          number: currentNumber,
          divisor,
          quotient: currentNumber / divisor,
          isDivisible: true
        });
        
        currentNumber = currentNumber / divisor;
        factors.push(divisor);
      } else {
        // Number is not divisible, note this step and move to next divisor
        steps.push({
          number: currentNumber,
          divisor,
          isDivisible: false
        });
        
        divisor++;
      }
    }
    
    return { steps, factors };
  };
  
  // Helper function to check if a number is prime
  const isPrime = (num) => {
    if (num <= 1) return false;
    if (num <= 3) return true;
    if (num % 2 === 0 || num % 3 === 0) return false;
    
    for (let i = 5; i * i <= num; i += 6) {
      if (num % i === 0 || num % (i + 2) === 0) return false;
    }
    
    return true;
  };

  // Helper function for tree layout calculation
  const calculateTreeLayout = (factors) => {
    if (!factors || factors.length === 0) return [];
    
    const nodes = [];
    // Root node is the original number
    nodes.push({
      id: 'root',
      value: number,
      x: 0,
      y: 0,
      parentId: null
    });
    
    // Create a more balanced tree
    let currentLevel = 1;
    let levelWidth = 120; // Width between nodes in the same level
    let levelHeight = 80; // Height between levels
    let nodesInCurrentLevel = Math.min(4, factors.length);
    let processedFactors = 0;
    
    while (processedFactors < factors.length) {
      const startX = -((nodesInCurrentLevel - 1) * levelWidth) / 2;
      
      for (let i = 0; i < nodesInCurrentLevel && processedFactors < factors.length; i++) {
        const factor = factors[processedFactors];
        const nodeId = `node-${processedFactors}`;
        
        nodes.push({
          id: nodeId,
          value: factor,
          x: startX + i * levelWidth,
          y: currentLevel * levelHeight,
          parentId: currentLevel === 1 ? 'root' : `node-${Math.floor((processedFactors - 1) / 2)}`
        });
        
        processedFactors++;
      }
      
      currentLevel++;
      nodesInCurrentLevel = Math.min(nodesInCurrentLevel * 2, factors.length - processedFactors);
      // Adjust spacing for deeper levels
      levelWidth = levelWidth * 0.7;
    }
    
    return nodes;
  };

  // Add zoom handler
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = -e.deltaY;
    const scaleFactor = 0.1;
    const newScale = Math.max(0.5, Math.min(3, transform.scale + (delta > 0 ? scaleFactor : -scaleFactor)));
    
    setTransform(prev => ({
      ...prev,
      scale: newScale
    }));
  };

  // Add drag handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragRef.current = {
      x: e.clientX - transform.x,
      y: e.clientY - transform.y
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    setTransform(prev => ({
      ...prev,
      x: e.clientX - dragRef.current.x,
      y: e.clientY - dragRef.current.y
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add double click to reset
  const handleDoubleClick = () => {
    setTransform({ x: 0, y: 0, scale: 1 });
  };

  // Calculate the tree nodes for visualization
  const treeNodes = calculateTreeLayout(factors);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 bg-slate-800 rounded-lg mb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Current Status:</h3>
          {currentDivisor && (
            <span className="px-3 py-1 bg-sky-600 rounded-full text-white text-sm">
              Testing Divisor: {currentDivisor}
            </span>
          )}
        </div>
        <p className="mt-2 text-gray-300">{message}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
        {/* Left side - Steps */}
        <div className="p-4 bg-slate-900 rounded-lg overflow-auto h-[45%]" ref={stepsContainerRef}>
          <h3 className="text-lg font-bold text-white mb-4">Factorization Steps</h3>
          
          {steps.length > 0 ? (
            steps.map((step, index) => (
              <motion.div 
                key={index}
                className={`p-3 mb-3 rounded-lg step-${index} ${
                  currentStep === index 
                    ? 'bg-sky-900 border border-sky-500' 
                    : currentStep > index 
                      ? 'bg-slate-800' 
                      : 'bg-slate-800 opacity-50'
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Step {index + 1}</span>
                  {step.isDivisible ? (
                    <span className="text-xs px-2 py-1 bg-green-600 rounded-full text-white">Divisible</span>
                  ) : (
                    <span className="text-xs px-2 py-1 bg-red-600 rounded-full text-white">Not Divisible</span>
                  )}
                </div>
                
                <div className="mt-2 p-2 bg-slate-700 rounded-md">
                  <div className="flex gap-2 items-center">
                    <span className="font-mono text-white">{step.number}</span>
                    <span className="text-gray-400">÷</span>
                    <span className="font-mono text-white">{step.divisor}</span>
                    
                    {step.isDivisible && (
                      <>
                        <span className="text-gray-400">=</span>
                        <span className="font-mono text-white">{step.quotient}</span>
                      </>
                    )}
                  </div>
                  
                  <div className="mt-2 text-sm">
                    {step.isDivisible ? (
                      <span className="text-green-400">
                        Factor found: {step.divisor}
                      </span>
                    ) : (
                      <span className="text-red-400">
                        Not divisible by {step.divisor}, try next divisor
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center text-gray-400 py-8">Enter a number greater than 1 to see factorization steps</div>
          )}
          
          {animationCompleted && (
            <motion.div 
              className="p-4 mt-6 rounded-lg bg-green-700"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-xl font-bold text-white">
                Prime Factorization: {number} = {factors.join(' × ')}
              </div>
            </motion.div>
          )}
        </div>
        
        {/* Right side - Visual representation */}
        <div className="p-4 bg-slate-900 rounded-lg flex flex-col h-[40%]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Visual Representation</h3>
            <div className="text-xs text-gray-400">
              Scroll to zoom, drag to move, double-click to reset
            </div>
          </div>
          
          <div 
            className="flex-1 relative overflow-hidden bg-slate-800 rounded-lg"
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onDoubleClick={handleDoubleClick}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          >
            {steps.length > 0 ? (
              <div className="w-full mt-12 h-full flex items-center justify-center">
                {/* Factor Tree Visualization */}
                <svg 
                  ref={svgRef}
                  width="100%" 
                  height="100%" 
                  className="overflow-visible"
                  viewBox="-180 -40 360 300"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}>
                    {/* Render edges first so they appear behind nodes */}
                    {treeNodes.map((node) => {
                      if (node.parentId) {
                        const parentNode = treeNodes.find(n => n.id === node.parentId);
                        if (!parentNode) return null;
                        
                        return (
                          <motion.line 
                            key={`edge-${node.id}`}
                            x1={parentNode.x} 
                            y1={parentNode.y} 
                            x2={node.x} 
                            y2={node.y} 
                            stroke="#4b5563" 
                            strokeWidth="2"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ 
                              pathLength: 1, 
                              opacity: animationCompleted || factors.indexOf(node.value) < currentStep ? 1 : 0.3
                            }}
                            transition={{ 
                              delay: factors.indexOf(node.value) * 0.2,
                              duration: 0.5
                            }}
                          />
                        );
                      }
                      return null;
                    })}
                    
                    {/* Root node */}
                    <motion.circle 
                      cx="0" 
                      cy="0" 
                      r="30" 
                      fill="#3b82f6"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                    />
                    <motion.text 
                      x="0" 
                      y="0" 
                      textAnchor="middle" 
                      dy=".3em" 
                      fill="white" 
                      fontSize="16"
                      fontWeight="bold"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      {number}
                    </motion.text>
                    
                    {/* Factor nodes */}
                    {treeNodes.filter(node => node.id !== 'root').map((node, i) => {
                      const factor = node.value;
                      const isVisible = animationCompleted || factors.indexOf(factor) < currentStep;
                      
                      return (
                        <g key={`node-${node.id}`}>
                          <motion.circle 
                            cx={node.x} 
                            cy={node.y} 
                            r="24" 
                            fill={isPrime(factor) ? "#10b981" : "#3b82f6"}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ 
                              scale: isVisible ? 1 : 0.5, 
                              opacity: isVisible ? 1 : 0.5
                            }}
                            transition={{ 
                              delay: factors.indexOf(factor) * 0.2 + 0.1,
                              duration: 0.5
                            }}
                          />
                          
                          <motion.text 
                            x={node.x} 
                            y={node.y} 
                            textAnchor="middle" 
                            dy=".3em" 
                            fill="white" 
                            fontSize="14"
                            fontWeight={isPrime(factor) ? "bold" : "normal"}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: isVisible ? 1 : 0.5 }}
                            transition={{ 
                              delay: factors.indexOf(factor) * 0.2 + 0.2,
                              duration: 0.5
                            }}
                          >
                            {factor}
                          </motion.text>
                        </g>
                      );
                    })}
                  </g>
                </svg>
                
                {/* Transparent overlay for mouse events */}
                <div 
                  className="absolute inset-0 z-10 bg-transparent"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onDoubleClick={handleDoubleClick}
                ></div>
              </div>
            ) : (
              <div className="text-center text-gray-400 h-full flex items-center justify-center">
                Enter a number to see its prime factorization
              </div>
            )}
          </div>
          
          {/* Factor Breakdown */}
          <div className="mt-4 text-center p-3 bg-slate-800 rounded-lg overflow-auto">
            <h4 className="text-md font-bold text-white mb-3">Prime Factors</h4>
            <div className="flex flex-wrap justify-center gap-2">
              {animationCompleted ? (
                factors.map((factor, index) => (
                  <motion.div 
                    key={index}
                    className={`px-3 py-2 rounded-lg ${isPrime(factor) ? 'bg-green-600' : 'bg-blue-600'}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <span className="text-white font-mono">{factor}</span>
                  </motion.div>
                ))
              ) : (
                factors.slice(0, currentStep).map((factor, index) => (
                  <motion.div 
                    key={index}
                    className={`px-3 py-2 rounded-lg ${isPrime(factor) ? 'bg-green-600' : 'bg-blue-600'}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <span className="text-white font-mono">{factor}</span>
                  </motion.div>
                ))
              )}
            </div>
            
            {animationCompleted && (
              <motion.div 
                className="mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <span className="text-white">{number} = </span>
                {factors.map((factor, index) => (
                  <span key={index} className="text-white">
                    {factor}{index < factors.length - 1 ? ' × ' : ''}
                  </span>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrimeFactorizationVisualizer;
