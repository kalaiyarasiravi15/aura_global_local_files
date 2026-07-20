import { useEffect, useRef } from 'react';

/**
 * useScrollReveal — attaches IntersectionObserver to elements
 * and adds `is-revealed` class when they enter the viewport.
 *
 * Usage:
 *   const ref = useScrollReveal();
 *   <div ref={ref} className="reveal-fade-up"> ... </div>
 */
export function useScrollReveal(options = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      },
      { threshold: options.threshold ?? 0.12, ...options }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}

/**
 * useScrollRevealAll — observe multiple refs at once.
 * Returns a setter: ref={(el) => addRef(el, index)}
 */
export function useScrollRevealAll(count = 0, options = {}) {
  const refs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: options.threshold ?? 0.1, ...options }
    );

    refs.current.forEach((el) => { if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, [count]);

  return refs;
}