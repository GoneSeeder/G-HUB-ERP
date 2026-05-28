'use client';

import { useCallback, useEffect, useState } from 'react';

export type ThaiIdScanStatus =
  | 'idle'
  | 'checking'
  | 'no_extension'
  | 'no_host'
  | 'scanning'
  | 'success'
  | 'error';

export interface ThaiIdData {
  ok?: boolean;
  cid?: string;
  citizenId?: string;
  titleTh?: string;
  firstNameTh?: string;
  lastNameTh?: string;
  fullNameTh?: string;
  titleEn?: string;
  firstNameEn?: string;
  lastNameEn?: string;
  fullName?: string;
  birthDate?: string;
  cardIssueDate?: string;
  cardExpireDate?: string;
  address?: string;
  imageUrl?: string;
  error?: string;
  message?: string;
}

type ThaiIdWindow = Window & {
  __GHUB_THAIID_EXTENSION__?: boolean;
};

type ThaiIdMessage = {
  type?: string;
  available?: boolean;
  success?: boolean;
  data?: ThaiIdData;
  error?: string;
};

export const THAI_ID_SETUP_DOWNLOAD_URL = '/downloads/thai-id-setup.exe';

export function useThaiIdScanner() {
  const [status, setStatus] = useState<ThaiIdScanStatus>('idle');
  const [data, setData] = useState<ThaiIdData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasExtension, setHasExtension] = useState(false);

  const checkExtension = useCallback(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return Boolean((window as ThaiIdWindow).__GHUB_THAIID_EXTENSION__);
  }, []);

  useEffect(() => {
    const refreshExtensionState = () => setHasExtension(checkExtension());
    refreshExtensionState();
    window.addEventListener('GHUB_THAIID_EXTENSION_READY', refreshExtensionState);
    return () => window.removeEventListener('GHUB_THAIID_EXTENSION_READY', refreshExtensionState);
  }, [checkExtension]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent<ThaiIdMessage>) => {
      if (event.source !== window) return;
      const message = event.data;

      if (message?.type === 'GHUB_THAIID_CHECK_RESULT') {
        if (message.available) {
          setStatus('scanning');
          window.postMessage({ type: 'GHUB_THAIID_SCAN' }, '*');
          return;
        }

        setStatus('no_host');
        setError(message.error || 'Thai ID native host is not installed.');
      }

      if (message?.type === 'GHUB_THAIID_RESULT') {
        if (message.success && message.data) {
          if (message.data.error) {
            setStatus('error');
            setError(message.data.message || message.data.error);
            return;
          }
          setData(message.data);
          setStatus('success');
          setError(null);
          return;
        }

        setStatus('error');
        setError(message.error || 'Thai ID extension did not return card data.');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const scan = useCallback(() => {
    setData(null);
    setError(null);
    setStatus('checking');

    if (!checkExtension()) {
      setHasExtension(false);
      setStatus('no_extension');
      return false;
    }

    setHasExtension(true);
    window.postMessage({ type: 'GHUB_THAIID_CHECK' }, '*');
    return true;
  }, [checkExtension]);

  const reset = useCallback(() => {
    setStatus('idle');
    setData(null);
    setError(null);
  }, []);

  const triggerSetupDownload = useCallback(() => {
    window.location.href = THAI_ID_SETUP_DOWNLOAD_URL;
  }, []);

  return {
    status,
    data,
    error,
    hasExtension,
    scan,
    reset,
    triggerSetupDownload,
    isScanning: status === 'checking' || status === 'scanning',
  };
}
