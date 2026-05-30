// Global React namespace for legacy code compatibility.
// Allows using React.* types (e.g. React.KeyboardEvent, React.ElementRef) without importing React.

import type * as ReactTypes from "react";

export {};

declare global {
  namespace React {
    // Core
    export type ReactNode = ReactTypes.ReactNode;
    export type ReactElement<P = any, T extends string | ReactTypes.JSXElementConstructor<any> = string | ReactTypes.JSXElementConstructor<any>> = ReactTypes.ReactElement<P, T>;
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    export type FC<P = {}> = ReactTypes.FC<P>;

    // Events
    export type KeyboardEvent<T = Element> = ReactTypes.KeyboardEvent<T>;
    export type MouseEvent<T = Element, E = globalThis.MouseEvent> = ReactTypes.MouseEvent<T, E>;
    export type FormEvent<T = Element> = ReactTypes.FormEvent<T>;
    export type ChangeEvent<T = Element> = ReactTypes.ChangeEvent<T>;

    // Common shadcn/ui generics
    export type ElementRef<C extends ReactTypes.ElementType> = ReactTypes.ElementRef<C>;
    export type ComponentPropsWithoutRef<T extends ReactTypes.ElementType> = ReactTypes.ComponentPropsWithoutRef<T>;
    export type ComponentPropsWithRef<T extends ReactTypes.ElementType> = ReactTypes.ComponentPropsWithRef<T>;

    // Misc used across app
    export type RefObject<T> = ReactTypes.RefObject<T>;
    export type Dispatch<A> = ReactTypes.Dispatch<A>;
    export type SetStateAction<S> = ReactTypes.SetStateAction<S>;
    export type CSSProperties = ReactTypes.CSSProperties;
    export type ComponentProps<T extends keyof JSX.IntrinsicElements | ReactTypes.JSXElementConstructor<any>> = ReactTypes.ComponentProps<T>;
  }
}
