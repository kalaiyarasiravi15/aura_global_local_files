import { useEffect, useRef } from 'react';
import './CustomCursor.css';

export default function CustomCursor() {
  const dotRef   = useRef(null);
  const ringRef  = useRef(null);
  const posRef   = useRef({ x: -100, y: -100 });
  const ringPos  = useRef({ x: -100, y: -100 });
  const rafRef   = useRef(null);

  useEffect(() => {
    const dot  = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const onMove = (e) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%,-50%)`;
    };

    const lerp = (a, b, t) => a + (b - a) * t;

    const animate = () => {
      ringPos.current.x = lerp(ringPos.current.x, posRef.current.x, 0.12);
      ringPos.current.y = lerp(ringPos.current.y, posRef.current.y, 0.12);
      ring.style.transform = `translate(${ringPos.current.x}px, ${ringPos.current.y}px) translate(-50%,-50%)`;
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    const onEnterInteractive = () => {
      dot.classList.add('cursor-dot--hover');
      ring.classList.add('cursor-ring--hover');
    };
    const onLeaveInteractive = () => {
      dot.classList.remove('cursor-dot--hover');
      ring.classList.remove('cursor-ring--hover');
    };
    const onEnterLink = () => {
      ring.classList.add('cursor-ring--link');
      dot.classList.add('cursor-dot--link');
    };
    const onLeaveLink = () => {
      ring.classList.remove('cursor-ring--link');
      dot.classList.remove('cursor-dot--link');
    };

    const onMouseDown = () => ring.classList.add('cursor-ring--click');
    const onMouseUp   = () => ring.classList.remove('cursor-ring--click');

    document.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup',   onMouseUp);

    const addHoverListeners = () => {
      document.querySelectorAll('button, [role="button"], input, select, textarea').forEach(el => {
        el.addEventListener('mouseenter', onEnterInteractive);
        el.addEventListener('mouseleave', onLeaveInteractive);
      });
      document.querySelectorAll('a').forEach(el => {
        el.addEventListener('mouseenter', onEnterLink);
        el.addEventListener('mouseleave', onLeaveLink);
      });
    };

    addHoverListeners();
    const mo = new MutationObserver(addHoverListeners);
    mo.observe(document.body, { childList: true, subtree: true });

    // Hide default cursor
    document.body.classList.add('custom-cursor-active');

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mouseup',   onMouseUp);
      cancelAnimationFrame(rafRef.current);
      mo.disconnect();
      document.body.classList.remove('custom-cursor-active');
    };
  }, []);

  return (
    <>
      <div ref={dotRef}  className="cursor-dot"  aria-hidden="true" />
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
    </>
  );
}