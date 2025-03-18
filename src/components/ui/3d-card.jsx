"use client";

import { createContext, useContext, useState, useMemo } from "react";
import { motion } from "framer-motion";
import PropTypes from "prop-types"; // Add PropTypes import

// Create context for the card
const CardContext = createContext();

export function CardContainer({ children, className, ...rest }) {
  const [isHovered, setIsHovered] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!isHovered) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * 7.5;
    const rotateX = -((e.clientY - centerY) / (rect.height / 2)) * 7.5;

    setRotation({ x: rotateX, y: rotateY });
  };

  // Memoize context value to fix re-render issue
  const contextValue = useMemo(() => {
    return { isHovered, rotation };
  }, [isHovered, rotation]);

  return (
    <div
      className={`py-10 flex items-center justify-center ${className}`}
      style={{ perspective: "1000px" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setRotation({ x: 0, y: 0 });
      }}
      onMouseMove={handleMouseMove}
      {...rest}
    >
      <CardContext.Provider value={contextValue}>
        {children}
      </CardContext.Provider>
    </div>
  );
}

// Add PropTypes validation
CardContainer.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export function CardBody({ children, className, ...rest }) {
  const { rotation } = useContext(CardContext);

  return (
    <motion.div
      className={`relative w-full h-full ${className}`}
      style={{
        transformStyle: "preserve-3d",
      }}
      animate={{
        rotateX: rotation.x,
        rotateY: rotation.y,
      }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

// Add PropTypes validation
CardBody.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export function CardItem({
  children,
  className,
  translateX = 0,
  translateY = 0,
  translateZ = 0,
  rotateX = 0,
  rotateY = 0,
  rotateZ = 0,
  as: Component = "div",
  ...rest
}) {
  const { isHovered } = useContext(CardContext);

  return (
    <Component
      className={className}
      style={{
        transform: isHovered
          ? `translateX(${translateX}px) translateY(${translateY}px) translateZ(${translateZ}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`
          : "none",
        transition: "transform 0.3s ease-out",
      }}
      {...rest}
    >
      {children}
    </Component>
  );
}

// Add PropTypes validation
CardItem.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  translateX: PropTypes.number,
  translateY: PropTypes.number,
  translateZ: PropTypes.number,
  rotateX: PropTypes.number,
  rotateY: PropTypes.number,
  rotateZ: PropTypes.number,
  as: PropTypes.elementType,
};
