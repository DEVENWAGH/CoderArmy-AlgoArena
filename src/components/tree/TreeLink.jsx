import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";

const TreeLink = ({ link, isActive, isPath }) => {
  const pathRef = useRef(null);

  useEffect(() => {
    if (!pathRef.current) return;

    // Add data attributes for more reliable targeting
    pathRef.current.setAttribute(
      "data-link-id",
      `${link.source.id}-${link.target.id}`
    );

    // Ensure initial path is correctly rendered - display immediately
    const path = generatePath();
    if (pathRef.current.getAttribute("d") !== path) {
      pathRef.current.setAttribute("d", path);
    }

    // Make link visible immediately without animation
    gsap.set(pathRef.current, {
      opacity: 1,
      visibility: "visible",
    });
  }, [
    link.source.id,
    link.target.id,
    link.source.x,
    link.source.y,
    link.target.x,
    link.target.y,
  ]);

  // Handle animations only for state changes, not initial render
  useEffect(() => {
    if (!pathRef.current) return;

    const tl = gsap.timeline();

    if (isPath) {
      tl.to(pathRef.current, {
        stroke: "#f59e0b",
        strokeWidth: 3,
        opacity: 1,
        overwrite: "auto",
      });
    } else if (isActive) {
      tl.to(pathRef.current, {
        stroke: "#38bdf8",
        strokeWidth: 2.5,
        opacity: 0.8,
        overwrite: "auto",
      });
    } else {
      tl.to(pathRef.current, {
        stroke: "#1e40af",
        strokeWidth: 2,
        opacity: 0.6,
        overwrite: "auto",
      });
    }

    return () => tl.kill();
  }, [isActive, isPath]);

  // Generate a smooth curved path between nodes
  const generatePath = () => {
    const { source, target } = link;

    // Ensure coordinates exist to prevent NaN errors that break paths
    if (
      !source ||
      !source.x === undefined ||
      !target ||
      target.x === undefined
    ) {
      return "";
    }

    // Calculate control points for smoother curve
    const midY = (source.y + target.y) / 2;

    return `M ${source.x},${source.y} 
            C ${source.x},${midY} 
              ${target.x},${midY} 
              ${target.x},${target.y}`;
  };

  return (
    <path
      ref={pathRef}
      d={generatePath()}
      className="tree-link"
      stroke="#1e40af"
      strokeWidth={2}
      fill="none"
      opacity={0.6} // Start with decent opacity
      strokeLinecap="round"
      style={{ pointerEvents: "none" }}
      vectorEffect="non-scaling-stroke" // Maintain consistent line width
    />
  );
};

export default TreeLink;
