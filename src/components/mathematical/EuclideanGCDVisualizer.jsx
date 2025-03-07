import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';

const EuclideanGCDVisualizer = ({ num1, num2, isAnimating, speed, onComplete }) => {
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [result, setResult] = useState(null);
  const [animationCompleted, setAnimationCompleted] = useState(false);
  
  const animationRef = useRef(null);
  const stepsContainerRef = useRef(null);
  const rectanglesRef = useRef(null);
  
  // Calculate GCD steps
  useEffect(() => {
    if (num1 > 0 && num2 > 0) {
      const newSteps = calculateGCDSteps(num1, num2);
      setSteps(newSteps);
      setResult(newSteps[newSteps.length - 1].remainder === 0 ? newSteps[newSteps.length - 1].divisor : null);
      setCurrentStep(0);
      setAnimationCompleted(false);
    }
  }, [num1, num2]);
  
  // Handle animation
  useEffect(() => {
    if (isAnimating && steps.length > 0) {
      let stepIndex = 0;
      
      // Clear any existing animation
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
      
      // Start new animation
      animationRef.current = setInterval(() => {
        if (stepIndex < steps.length) {
          setCurrentStep(stepIndex);
          stepIndex++;
          
          // Scroll to show current step
          if (stepsContainerRef.current) {
            const stepElement = stepsContainerRef.current.querySelector(`.step-${stepIndex - 1}`);
            if (stepElement) {
              stepElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
          }
        } else {
          // Animation completed
          clearInterval(animationRef.current);
          setAnimationCompleted(true);
          if (onComplete) onComplete();
        }
      }, 1500 / speed); // Adjust speed based on the speed prop
      
      return () => {
        if (animationRef.current) {
          clearInterval(animationRef.current);
        }
      };
    }
  }, [isAnimating, steps, speed, onComplete]);
  
  // Visualization reset when animation is stopped
  useEffect(() => {
    if (!isAnimating) {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    }
  }, [isAnimating]);
  
  // Animation for rectangles visualization
  useEffect(() => {
    if (rectanglesRef.current && currentStep < steps.length) {
      const step = steps[currentStep];
      
      // Clear previous animations
      gsap.killTweensOf(".rectangle-block");
      
      // Animate current step
      const timeline = gsap.timeline();
      
      if (currentStep > 0) {
        timeline.to(".active-step", {
          backgroundColor: "rgba(14, 165, 233, 0.2)", // Reset previous active step
          duration: 0.3
        });
      }
      
      timeline.to(`.step-${currentStep}`, {
        backgroundColor: "rgba(14, 165, 233, 0.4)", // Highlight current step
        duration: 0.3
      });
      
      // Visualization logic for the current division step
    }
  }, [currentStep, steps]);
  
  // Helper function to calculate GCD steps
  const calculateGCDSteps = (a, b) => {
    // Ensure a is greater than or equal to b
    if (a < b) {
      [a, b] = [b, a];
    }
    
    const steps = [];
    let dividend = a;
    let divisor = b;
    
    while (divisor !== 0) {
      const quotient = Math.floor(dividend / divisor);
      const remainder = dividend % divisor;
      
      steps.push({
        dividend,
        divisor,
        quotient,
        remainder
      });
      
      dividend = divisor;
      divisor = remainder;
    }
    
    return steps;
  };

  return (
    <div className="flex flex-col md:flex-row h-full">
      <div className="w-full md:w-1/2 p-6 overflow-y-auto" ref={stepsContainerRef}>
        <h3 className="text-lg font-bold text-white mb-4">Calculation Steps</h3>
        
        {steps.map((step, index) => (
          <motion.div 
            key={index}
            className={`p-4 mb-4 rounded-lg bg-slate-800 step-${index} ${currentStep === index ? 'active-step' : ''}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-300">Step {index + 1}:</span>
              {currentStep === index && isAnimating && (
                <span className="text-xs px-2 py-1 bg-sky-600 rounded-full text-white">Current</span>
              )}
              {currentStep > index && (
                <span className="text-xs px-2 py-1 bg-green-600 rounded-full text-white">Completed</span>
              )}
            </div>
            
            <div className="bg-slate-700 p-3 rounded-md text-white">
              <div className="flex items-center gap-2">
                <span className="text-gray-300">Divide:</span>
                <span className="font-mono">{step.dividend} ÷ {step.divisor}</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-gray-300">Quotient:</span>
                <span className="font-mono">{step.quotient}</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-gray-300">Remainder:</span>
                <span className="font-mono">{step.remainder}</span>
              </div>
            </div>
            
            {step.remainder === 0 && (
              <div className="mt-3 text-green-400 font-semibold">
                Remainder is zero! GCD = {step.divisor}
              </div>
            )}
          </motion.div>
        ))}
        
        {animationCompleted && (
          <motion.div 
            className="p-4 mt-6 rounded-lg bg-green-700"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-xl font-bold text-white">Result: GCD({num1}, {num2}) = {result}</div>
          </motion.div>
        )}
      </div>
      
      <div className="w-full md:w-1/2 p-6 flex flex-col" ref={rectanglesRef}>
        <h3 className="text-lg font-bold text-white mb-4">Visual Representation</h3>
        
        <div className="flex-1 flex items-center justify-center">
          {currentStep < steps.length && (
            <div className="flex flex-col items-center">
              <div className="mb-8 flex flex-wrap max-w-md justify-center">
                {/* Rectangles visual representation - Dynamic based on current step */}
                {steps[currentStep].dividend > 0 && steps[currentStep].divisor > 0 && (
                  Array.from({ length: Math.min(steps[currentStep].divisor, 50) }).map((_, i) => (
                    <motion.div
                      key={`rect-${i}`}
                      className="rectangle-block m-1"
                      initial={{ opacity: 0 }}
                      animate={{ 
                        opacity: 1,
                        backgroundColor: i < steps[currentStep].remainder ? '#f59e0b' : '#3b82f6'
                      }}
                      transition={{ delay: i * 0.01 }}
                      style={{
                        width: `${Math.min(30, 300 / Math.min(steps[currentStep].divisor, 15))}px`,
                        height: `${Math.min(30, 300 / Math.min(steps[currentStep].divisor, 15))}px`,
                        borderRadius: '4px'
                      }}
                    />
                  ))
                )}
              </div>
              
              <div className="text-center text-white">
                <div className="mb-2 text-xl">
                  {steps[currentStep].dividend} = {steps[currentStep].divisor} × {steps[currentStep].quotient} + {steps[currentStep].remainder}
                </div>
                <div className="text-gray-400 text-sm">
                  {steps[currentStep].remainder === 0 ? 
                    `Since remainder is 0, GCD = ${steps[currentStep].divisor}` : 
                    `Continue with ${steps[currentStep].divisor} and ${steps[currentStep].remainder}`}
                </div>
              </div>
            </div>
          )}
          
          {animationCompleted && (
            <motion.div 
              className="flex flex-col items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-6xl font-bold text-green-400 mb-4">
                {result}
              </div>
              <div className="text-xl text-white">
                is the greatest common divisor of {num1} and {num2}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EuclideanGCDVisualizer;
