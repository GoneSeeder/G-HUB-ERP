import type { KeyboardEvent } from 'react';

export function preventEnterSubmit(event: KeyboardEvent<HTMLFormElement>) {
  if (event.key !== 'Enter') {
    return;
  }

  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    event.preventDefault();
    return;
  }

  const tagName = target.tagName;
  if (tagName === 'TEXTAREA' || tagName === 'BUTTON' || target.isContentEditable) {
    return;
  }

  event.preventDefault();
}
