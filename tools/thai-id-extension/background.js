const NATIVE_HOST = 'com.ghub.thaiid';

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === 'CHECK_HOST') {
    checkHostAvailable(sendResponse);
    return true;
  }

  if (message?.type === 'SCAN_CARD') {
    scanCard(sendResponse);
    return true;
  }

  return false;
});

function checkHostAvailable(sendResponse) {
  let responded = false;

  try {
    const port = chrome.runtime.connectNative(NATIVE_HOST);
    const timer = setTimeout(() => {
      if (responded) return;
      responded = true;
      try {
        port.disconnect();
      } catch {}
      sendResponse({ available: false, error: 'Native host did not respond.' });
    }, 2500);

    port.onMessage.addListener((response) => {
      if (responded) return;
      responded = true;
      clearTimeout(timer);
      port.disconnect();
      sendResponse({ available: !response?.error, data: response, error: response?.message || response?.error });
    });

    port.onDisconnect.addListener(() => {
      if (responded) return;
      responded = true;
      clearTimeout(timer);
      const error = chrome.runtime.lastError;
      sendResponse({ available: false, error: error?.message || 'Native host disconnected.' });
    });

    port.postMessage({ command: 'ping' });
  } catch (error) {
    sendResponse({ available: false, error: error instanceof Error ? error.message : String(error) });
  }
}

function scanCard(sendResponse) {
  let responded = false;

  try {
    const port = chrome.runtime.connectNative(NATIVE_HOST);
    const timer = setTimeout(() => {
      if (responded) return;
      responded = true;
      try {
        port.disconnect();
      } catch {}
      sendResponse({ success: false, error: 'Thai ID reader timed out.' });
    }, 15000);

    port.onMessage.addListener((response) => {
      if (responded) return;
      responded = true;
      clearTimeout(timer);
      port.disconnect();
      sendResponse({ success: !response?.error, data: response, error: response?.message || response?.error });
    });

    port.onDisconnect.addListener(() => {
      if (responded) return;
      responded = true;
      clearTimeout(timer);
      const error = chrome.runtime.lastError;
      sendResponse({ success: false, error: error?.message || 'Native host disconnected.' });
    });

    port.postMessage({ command: 'read_card' });
  } catch (error) {
    sendResponse({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
}
