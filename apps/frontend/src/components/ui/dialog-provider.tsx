'use client';

import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { XIcon } from '@/components/ui/icons';

type ToastType = 'info' | 'success' | 'error';
type ConfirmVariant = 'primary' | 'danger';

type ToastItem = {
  id: number;
  message: string;
  type: ToastType;
};

type ConfirmOptions = {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
};

type PromptOptions = {
  title?: string;
  message: string;
  defaultValue?: string;
  confirmText?: string;
  cancelText?: string;
};

type DialogContextValue = {
  notify: (message: string, type?: ToastType) => void;
  requestConfirmation: (options: ConfirmOptions | string) => Promise<boolean>;
  requestInput: (options: PromptOptions | string) => Promise<string | null>;
};

type ConfirmState = Required<Omit<ConfirmOptions, 'variant'>> & {
  variant: ConfirmVariant;
  resolve: (value: boolean) => void;
};

type PromptState = Required<PromptOptions> & {
  resolve: (value: string | null) => void;
};

const DialogContext = createContext<DialogContextValue | null>(null);

export function DialogProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const [promptState, setPromptState] = useState<PromptState | null>(null);
  const [promptValue, setPromptValue] = useState('');

  const notify = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, message, type }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 4200);
  }, []);

  const requestConfirmation = useCallback((options: ConfirmOptions | string) => {
    const normalized: ConfirmOptions = typeof options === 'string' ? { message: options } : options;
    return new Promise<boolean>((resolve) => {
      setConfirmState({
        title: normalized.title ?? 'Confirm action',
        message: normalized.message,
        confirmText: normalized.confirmText ?? 'Confirm',
        cancelText: normalized.cancelText ?? 'Cancel',
        variant: normalized.variant ?? 'primary',
        resolve,
      });
    });
  }, []);

  const requestInput = useCallback((options: PromptOptions | string) => {
    const normalized: PromptOptions = typeof options === 'string' ? { message: options } : options;
    setPromptValue(normalized.defaultValue ?? '');
    return new Promise<string | null>((resolve) => {
      setPromptState({
        title: normalized.title ?? 'Input required',
        message: normalized.message,
        defaultValue: normalized.defaultValue ?? '',
        confirmText: normalized.confirmText ?? 'OK',
        cancelText: normalized.cancelText ?? 'Cancel',
        resolve,
      });
    });
  }, []);

  const value = useMemo<DialogContextValue>(
    () => ({ notify, requestConfirmation, requestInput }),
    [notify, requestConfirmation, requestInput],
  );

  const closeConfirm = (result: boolean) => {
    confirmState?.resolve(result);
    setConfirmState(null);
  };

  const closePrompt = (result: string | null) => {
    promptState?.resolve(result);
    setPromptState(null);
  };

  return (
    <DialogContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2">
        {toasts.map((item) => (
          <div
            key={item.id}
            className={`pointer-events-auto rounded-lg border bg-white px-3 py-2 text-sm shadow-lg ${
              item.type === 'error'
                ? 'border-red-200 text-red-700'
                : item.type === 'success'
                  ? 'border-emerald-200 text-emerald-700'
                  : 'border-slate-200 text-slate-700'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="leading-5">{item.message}</p>
              <button
                type="button"
                className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                onClick={() => setToasts((current) => current.filter((toastItem) => toastItem.id !== item.id))}
                aria-label="Dismiss"
              >
                <XIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
      {confirmState ? (
        <DialogShell title={confirmState.title} message={confirmState.message} onClose={() => closeConfirm(false)}>
          <button type="button" className="toolbar-btn min-h-9 px-4" onClick={() => closeConfirm(false)}>
            {confirmState.cancelText}
          </button>
          <button
            type="button"
            className={`inline-flex min-h-9 items-center justify-center rounded-lg px-4 text-sm font-semibold text-white shadow-sm transition ${
              confirmState.variant === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-[#1478ff] hover:bg-[#0f67d8]'
            }`}
            onClick={() => closeConfirm(true)}
          >
            {confirmState.confirmText}
          </button>
        </DialogShell>
      ) : null}
      {promptState ? (
        <DialogShell title={promptState.title} message={promptState.message} onClose={() => closePrompt(null)}>
          <input
            value={promptValue}
            onChange={(event) => setPromptValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                closePrompt(promptValue);
              }
            }}
            className="form-input h-9 rounded-lg text-sm"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <button type="button" className="toolbar-btn min-h-9 px-4" onClick={() => closePrompt(null)}>
              {promptState.cancelText}
            </button>
            <button type="button" className="primary-btn min-h-9 px-4" onClick={() => closePrompt(promptValue)}>
              {promptState.confirmText}
            </button>
          </div>
        </DialogShell>
      ) : null}
    </DialogContext.Provider>
  );
}

function DialogShell({
  title,
  message,
  children,
  onClose,
}: {
  title: string;
  message: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="modal-backdrop fixed inset-0 z-[90] flex items-center justify-center px-4 py-6">
      <div className="modal-pop w-full max-w-md rounded-xl border border-slate-200 bg-white p-4 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-5 text-slate-600">{message}</p>
          </div>
          <button
            type="button"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            onClick={onClose}
            aria-label="Close"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-4 flex flex-col gap-3">{children}</div>
      </div>
    </div>
  );
}

export function useDialog() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used inside DialogProvider');
  }
  return context;
}
