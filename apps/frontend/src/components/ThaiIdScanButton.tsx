'use client';

import { useEffect } from 'react';
import { ThaiIdData, THAI_ID_SETUP_DOWNLOAD_URL, useThaiIdScanner } from '@/hooks/useThaiIdScanner';

type ThaiIdScanButtonProps = {
  onSuccess: (data: ThaiIdData) => void;
  onError?: (message: string) => void;
  fallbackScan?: () => Promise<void> | void;
};

export function ThaiIdScanButton({
  onSuccess,
  onError,
  fallbackScan,
}: ThaiIdScanButtonProps) {
  const {
    status,
    data,
    error,
    scan,
    reset,
    triggerSetupDownload,
    isScanning,
  } = useThaiIdScanner();

  useEffect(() => {
    if (status === 'success' && data) {
      onSuccess(data);
      reset();
    }
  }, [data, onSuccess, reset, status]);

  useEffect(() => {
    if (status === 'error' && error) {
      onError?.(error);
    }
  }, [error, onError, status]);

  const onScanClick = async () => {
    const nativeScanStarted = scan();
    if (!nativeScanStarted && fallbackScan) {
      await fallbackScan();
    }
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        className={`min-h-10 rounded-md px-4 py-2 text-sm font-medium text-white transition focus:outline-none focus:ring-4 ${
          isScanning
            ? 'cursor-wait bg-emerald-500 focus:ring-emerald-100'
            : 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-100'
        }`}
        disabled={isScanning}
        onClick={() => void onScanClick()}
      >
        {isScanning ? 'Reading card...' : 'Scan CardID'}
      </button>

      {status === 'no_host' ? (
        <div className="max-w-xs rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-700">
          <p className="font-semibold">Thai ID Native Host is not installed.</p>
          <button type="button" className="mt-1 underline" onClick={triggerSetupDownload}>
            Download setup.exe
          </button>
          <p className="mt-1 text-blue-500">
            After installing, restart Chrome/Edge and scan again.
          </p>
        </div>
      ) : null}

      {status === 'no_extension' && !fallbackScan ? (
        <div className="max-w-xs rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
          <p className="font-semibold">Thai ID browser extension is not installed.</p>
          <p className="mt-1">
            Install the extension and place installer at{' '}
            <span className="font-mono">{THAI_ID_SETUP_DOWNLOAD_URL}</span>.
          </p>
        </div>
      ) : null}
    </div>
  );
}
