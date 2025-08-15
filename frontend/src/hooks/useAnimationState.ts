import { useState, useEffect } from 'react';

interface AnimationConfig {
  pageKey: string;
  triggerOnce?: boolean;
}

interface AnimationState {
  hasAnimated: boolean;
  shouldAnimate: boolean;
}

/**
 * Custom hook to manage animation state for pages
 * Ensures animations only play once per session using sessionStorage
 */
export const useAnimationState = ({ pageKey, triggerOnce = true }: AnimationConfig): AnimationState => {
  const [hasAnimated, setHasAnimated] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (!triggerOnce) {
      setShouldAnimate(true);
      return;
    }

    const sessionKey = `animation_${pageKey}`;
    const hasPlayedBefore = sessionStorage.getItem(sessionKey) === 'true';

    if (!hasPlayedBefore) {
      setShouldAnimate(true);
      setHasAnimated(false);
    } else {
      setShouldAnimate(false);
      setHasAnimated(true);
    }
  }, [pageKey, triggerOnce]);

  const markAsAnimated = () => {
    if (triggerOnce) {
      const sessionKey = `animation_${pageKey}`;
      sessionStorage.setItem(sessionKey, 'true');
      setHasAnimated(true);
      setShouldAnimate(false);
    }
  };

  return {
    hasAnimated,
    shouldAnimate,
    markAsAnimated
  };
};

/**
 * Hook for section-based animations that should only trigger once
 */
export const useSectionAnimation = (sectionKey: string, pageKey: string, inView: boolean) => {
  const { shouldAnimate, markAsAnimated } = useAnimationState({ 
    pageKey: `${pageKey}_${sectionKey}` 
  });

  useEffect(() => {
    if (inView && shouldAnimate) {
      // Small delay to ensure the animation is noticed
      const timer = setTimeout(markAsAnimated, 100);
      return () => clearTimeout(timer);
    }
  }, [inView, shouldAnimate, markAsAnimated]);

  return {
    shouldAnimate: shouldAnimate && inView,
    hasAnimated: !shouldAnimate
  };
};
