import { useEffect, useRef } from 'react';

/**
 * ScrollReveal — wraps any child with a scroll-triggered class.
 * 
 * Props:
 *   animation  — CSS class: 'reveal-fade-up' | 'reveal-fade-left' | 'reveal-scale' | etc.
 *   delay      — CSS class: 'delay-100' to 'delay-800'
 *   threshold  — IntersectionObserver threshold (default 0.12)
 *   as         — element tag (default 'div')
 *   className  — additional classes
 */
export default function ScrollReveal({
  children,
  animation = 'reveal-fade-up',
  delay = '',
  threshold = 0.12,
  as: Tag = 'div',
  className = '',
  style = {},
}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-revealed');
          observer.unobserve(el);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <Tag
      ref={ref}
      className={[animation, delay, className].filter(Boolean).join(' ')}
      style={style}
    >
      {children}
    </Tag>
  );
}