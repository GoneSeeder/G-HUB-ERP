(function injectAvailabilityFlag() {
  const script = document.createElement('script');
  script.textContent = [
    'window.__GHUB_THAIID_EXTENSION__ = true;',
    'window.dispatchEvent(new CustomEvent("GHUB_THAIID_EXTENSION_READY"));',
  ].join('\n');
  (document.documentElement || document.head).appendChild(script);
  script.remove();
})();

window.addEventListener('message', (event) => {
  if (event.source !== window) return;
  if (!event.data?.type?.startsWith('GHUB_THAIID_')) return;

  if (event.data.type === 'GHUB_THAIID_CHECK') {
    chrome.runtime.sendMessage({ type: 'CHECK_HOST' }, (response) => {
      window.postMessage({ type: 'GHUB_THAIID_CHECK_RESULT', ...(response || {}) }, '*');
    });
  }

  if (event.data.type === 'GHUB_THAIID_SCAN') {
    chrome.runtime.sendMessage({ type: 'SCAN_CARD' }, (response) => {
      window.postMessage({ type: 'GHUB_THAIID_RESULT', ...(response || {}) }, '*');
    });
  }
});
