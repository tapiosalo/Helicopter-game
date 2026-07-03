import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

const storage = new Map();
const localStorageStub = {
  getItem(key) {
    return storage.has(String(key)) ? storage.get(String(key)) : null;
  },
  setItem(key, value) {
    storage.set(String(key), String(value));
  },
  removeItem(key) {
    storage.delete(String(key));
  },
  clear() {
    storage.clear();
  },
};

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageStub,
  configurable: true,
});

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', {
    value: localStorageStub,
    configurable: true,
  });
}

afterEach(() => {
  cleanup();
});
