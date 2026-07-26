const REFRESH_EVENT = 'app-data-changed';

export function triggerRefresh() {
  window.dispatchEvent(new CustomEvent(REFRESH_EVENT));
}

export function onRefresh(callback: () => void): () => void {
  const handler = () => callback();
  window.addEventListener(REFRESH_EVENT, handler);
  return () => window.removeEventListener(REFRESH_EVENT, handler);
}
