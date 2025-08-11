export function createInput(canvas) {
  const pointerDownHandlers = new Set();

  function getCanvasPoint(evt) {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const clientX = evt.clientX;
    const clientY = evt.clientY;
    const x = (clientX - rect.left) * dpr;
    const y = (clientY - rect.top) * dpr;
    return { x, y };
  }

  function onPointerDown(handler) {
    pointerDownHandlers.add(handler);
  }

  function offPointerDown(handler) {
    pointerDownHandlers.delete(handler);
  }

  function handleDown(evt) {
    const pt = getCanvasPoint(evt);
    for (const handler of pointerDownHandlers) handler(pt);
  }

  canvas.addEventListener('pointerdown', handleDown, { passive: true });

  return { onPointerDown, offPointerDown };
}