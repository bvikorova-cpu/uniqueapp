// Global React namespace for legacy code compatibility
// This allows using React.KeyboardEvent etc. without explicit imports

import type {
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  FormEvent as ReactFormEvent,
  ChangeEvent as ReactChangeEvent,
  ReactNode as ReactReactNode,
  FC as ReactFC,
  RefObject as ReactRefObject,
  Dispatch as ReactDispatch,
  SetStateAction as ReactSetStateAction,
  CSSProperties as ReactCSSProperties,
} from "react";

export {};

declare global {
  namespace React {
    export type KeyboardEvent<T = Element> = ReactKeyboardEvent<T>;
    export type MouseEvent<T = Element, E = globalThis.MouseEvent> = ReactMouseEvent<T, E>;
    export type FormEvent<T = Element> = ReactFormEvent<T>;
    export type ChangeEvent<T = Element> = ReactChangeEvent<T>;
    export type ReactNode = ReactReactNode;
    export type FC<P = {}> = ReactFC<P>;
    export type RefObject<T> = ReactRefObject<T>;
    export type Dispatch<A> = ReactDispatch<A>;
    export type SetStateAction<S> = ReactSetStateAction<S>;
    export type CSSProperties = ReactCSSProperties;
  }
}
