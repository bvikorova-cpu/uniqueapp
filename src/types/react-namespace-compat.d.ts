// Global React namespace for legacy code compatibility
// This allows using React.* types without explicit imports in every file

import type * as ReactTypes from "react";

export {};

declare global {
  namespace React {
    // Event types
    export type KeyboardEvent<T = Element> = ReactTypes.KeyboardEvent<T>;
    export type MouseEvent<T = Element, E = globalThis.MouseEvent> = ReactTypes.MouseEvent<T, E>;
    export type FormEvent<T = Element> = ReactTypes.FormEvent<T>;
    export type ChangeEvent<T = Element> = ReactTypes.ChangeEvent<T>;
    export type FocusEvent<T = Element, R = Element> = ReactTypes.FocusEvent<T, R>;
    export type DragEvent<T = Element> = ReactTypes.DragEvent<T>;
    export type TouchEvent<T = Element> = ReactTypes.TouchEvent<T>;
    export type PointerEvent<T = Element> = ReactTypes.PointerEvent<T>;
    export type ClipboardEvent<T = Element> = ReactTypes.ClipboardEvent<T>;
    
    // Component types
    export type ReactNode = ReactTypes.ReactNode;
    export type ReactElement<P = any, T extends string | ReactTypes.JSXElementConstructor<any> = string | ReactTypes.JSXElementConstructor<any>> = ReactTypes.ReactElement<P, T>;
    export type FC<P = {}> = ReactTypes.FC<P>;
    export type ComponentType<P = {}> = ReactTypes.ComponentType<P>;
    export type ComponentProps<T extends keyof JSX.IntrinsicElements | ReactTypes.JSXElementConstructor<any>> = ReactTypes.ComponentProps<T>;
    export type ComponentPropsWithRef<T extends ReactTypes.ElementType> = ReactTypes.ComponentPropsWithRef<T>;
    export type ComponentPropsWithoutRef<T extends ReactTypes.ElementType> = ReactTypes.ComponentPropsWithoutRef<T>;
    export type JSXElementConstructor<P> = ReactTypes.JSXElementConstructor<P>;
    export type ElementType<P = any> = ReactTypes.ElementType<P>;
    export type ElementRef<C extends ReactTypes.ForwardRefExoticComponent<any> | (new (props: any) => ReactTypes.Component<any>) | ((props: any, context?: any) => ReactTypes.ReactElement | null) | keyof JSX.IntrinsicElements> = ReactTypes.ElementRef<C>;
    
    // Ref types
    export type RefObject<T> = ReactTypes.RefObject<T>;
    export type MutableRefObject<T> = ReactTypes.MutableRefObject<T>;
    export type Ref<T> = ReactTypes.Ref<T>;
    export type RefCallback<T> = ReactTypes.RefCallback<T>;
    export type ForwardedRef<T> = ReactTypes.ForwardedRef<T>;
    export type LegacyRef<T> = ReactTypes.LegacyRef<T>;

    // State types
    export type Dispatch<A> = ReactTypes.Dispatch<A>;
    export type SetStateAction<S> = ReactTypes.SetStateAction<S>;

    // Style and HTML types
    export type CSSProperties = ReactTypes.CSSProperties;
    export type HTMLAttributes<T> = ReactTypes.HTMLAttributes<T>;
    export type InputHTMLAttributes<T> = ReactTypes.InputHTMLAttributes<T>;
    export type ButtonHTMLAttributes<T> = ReactTypes.ButtonHTMLAttributes<T>;
    export type TextareaHTMLAttributes<T> = ReactTypes.TextareaHTMLAttributes<T>;
    export type AnchorHTMLAttributes<T> = ReactTypes.AnchorHTMLAttributes<T>;
    export type ImgHTMLAttributes<T> = ReactTypes.ImgHTMLAttributes<T>;
    export type FormHTMLAttributes<T> = ReactTypes.FormHTMLAttributes<T>;
    export type SVGAttributes<T> = ReactTypes.SVGAttributes<T>;
    
    // Other commonly used types
    export type PropsWithChildren<P = unknown> = ReactTypes.PropsWithChildren<P>;
    export type PropsWithoutRef<P> = ReactTypes.PropsWithoutRef<P>;
    
    // Context types
    export type Context<T> = ReactTypes.Context<T>;
    export type Provider<T> = ReactTypes.Provider<T>;
    export type Consumer<T> = ReactTypes.Consumer<T>;

    // Forward ref types
    export type ForwardRefExoticComponent<P> = ReactTypes.ForwardRefExoticComponent<P>;
    export type ForwardRefRenderFunction<T, P = {}> = ReactTypes.ForwardRefRenderFunction<T, P>;
    
    // Hook types
    export type EffectCallback = ReactTypes.EffectCallback;
    export type DependencyList = ReactTypes.DependencyList;
    export type Reducer<S, A> = ReactTypes.Reducer<S, A>;
    export type ReducerState<R extends ReactTypes.Reducer<any, any>> = ReactTypes.ReducerState<R>;
    export type ReducerAction<R extends ReactTypes.Reducer<any, any>> = ReactTypes.ReducerAction<R>;
    
    // Functions (re-export as values for forwardRef usage)
    export const forwardRef: typeof ReactTypes.forwardRef;
    export const createContext: typeof ReactTypes.createContext;
    export const useContext: typeof ReactTypes.useContext;
    export const useState: typeof ReactTypes.useState;
    export const useEffect: typeof ReactTypes.useEffect;
    export const useRef: typeof ReactTypes.useRef;
    export const useMemo: typeof ReactTypes.useMemo;
    export const useCallback: typeof ReactTypes.useCallback;
    export const useReducer: typeof ReactTypes.useReducer;
    export const useLayoutEffect: typeof ReactTypes.useLayoutEffect;
    export const useImperativeHandle: typeof ReactTypes.useImperativeHandle;
    export const useDebugValue: typeof ReactTypes.useDebugValue;
    export const useId: typeof ReactTypes.useId;
    export const useSyncExternalStore: typeof ReactTypes.useSyncExternalStore;
    export const useTransition: typeof ReactTypes.useTransition;
    export const useDeferredValue: typeof ReactTypes.useDeferredValue;
    export const useInsertionEffect: typeof ReactTypes.useInsertionEffect;
    export const memo: typeof ReactTypes.memo;
    export const lazy: typeof ReactTypes.lazy;
    export const Suspense: typeof ReactTypes.Suspense;
    export const Fragment: typeof ReactTypes.Fragment;
    export const StrictMode: typeof ReactTypes.StrictMode;
    export const Children: typeof ReactTypes.Children;
    export const cloneElement: typeof ReactTypes.cloneElement;
    export const isValidElement: typeof ReactTypes.isValidElement;
    export const createElement: typeof ReactTypes.createElement;
  }
}
