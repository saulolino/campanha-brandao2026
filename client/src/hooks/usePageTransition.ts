import { useEffect, useState } from "react";
import { useLocation } from "wouter";

export function usePageTransition() {
  const [location] = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [animationClass, setAnimationClass] = useState("page-enter");

  useEffect(() => {
    setIsTransitioning(true);
    setAnimationClass("page-enter-slide");

    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [location]);

  return { isTransitioning, animationClass };
}
