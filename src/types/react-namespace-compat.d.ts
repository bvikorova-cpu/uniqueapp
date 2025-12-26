// This project uses the automatic JSX runtime, so React doesn't need to be imported in every file.
// However, many files still reference types like `React.KeyboardEvent`.
// In TS, the `React` namespace isn't global by default with the new runtime.
// This file provides a minimal global `React.*` namespace for common event types
// to prevent build-time type errors without requiring per-file imports.

import type * as ReactTypes from "react";

export {};

declare global {
  namespace React {
    // Commonly used event types across the codebase
    type KeyboardEvent<T = Element> = ReactTypes.KeyboardEvent<T>;
    type MouseEvent<T = Element, E = globalThis.MouseEvent> = ReactTypes.MouseEvent<T, E>;
    type FormEvent<T = Element> = ReactTypes.FormEvent<T>;
    type ChangeEvent<T = Element> = ReactTypes.ChangeEvent<T>;

    // Useful base types (often referenced in props)
    type ReactNode = ReactTypes.ReactNode;
    type FC<P = {}> = ReactTypes.FC<P>;
  }
}
