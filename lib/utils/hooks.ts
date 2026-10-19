import { type DependencyList, type RefObject, useCallback, useEffect, useEffectEvent, useLayoutEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useWindowEventListener } from "react-dom-event-hooks";
import { compareDeps, isBrowser } from ".";

export function useAsyncMemo<T>(factory: () => Promise<T> | undefined | null, deps: DependencyList): T | undefined
export function useAsyncMemo<T>(factory: () => Promise<T> | undefined | null, deps: DependencyList, initial: T): T
export function useAsyncMemo<T>(factory: () => Promise<T> | undefined | null, deps: DependencyList, initial?: T)
{
	const [val, setVal] = useState<T | undefined>(initial);

	useEffect(() =>
	{
		const promise = factory();
		let cancel = false;

		if (promise === undefined || promise === null)
			return;
		promise.then((val) =>
		{
			if (!cancel)
				setVal(val);
		});
		return (() => {cancel = true});
	}, deps); // eslint-disable-line react-hooks/exhaustive-deps
  	return (val);
}

export function usePrevious<S = undefined>(): S | undefined;
export function usePrevious<S>(value: S, init?: boolean): S;
export function usePrevious<S>(value?: S, init = false)
{
	const ref = useRef<S>(init ? value : undefined);

	useEffect(() => {ref.current = value}, [value]);
	return (ref.current); // eslint-disable-line react-hooks/refs
}

export function useResizeObserver<T extends Element | null>(target: T | T[], callback: ResizeObserverCallback, options?: ResizeObserverOptions)
{
	const previousTarget = usePrevious(target, true);

	useEffect(() =>
	{
		const element = Array.isArray(target) ? target.filter(t => t) as Element[] : target;
		let observer: ResizeObserver;

		if (!isBrowser())
			return;
		if (!element || (Array.isArray(element) && !element.length))
			return;
		observer = new ResizeObserver(callback);
		if (Array.isArray(element))
			element.forEach(element => observer.observe(element, options));
		else
			observer.observe(element, options);
		return (() => observer.disconnect());
	}, [compareDeps(target, previousTarget), options?.box, callback]); // eslint-disable-line react-hooks/exhaustive-deps
}

export function useIntersectionObserver<T extends Element | null>(target: T | T[], callback: IntersectionObserverCallback, options?: IntersectionObserverInit)
{
	useEffect(() =>
	{
		const element = Array.isArray(target) ? target.filter(t => t) as Element[] : target;
		let observer: IntersectionObserver;

		if (!isBrowser())
			return;
		if (!element || (Array.isArray(element) && !element.length))
			return;
		observer = new IntersectionObserver(callback, options);
		if (Array.isArray(element))
			element.forEach(element => observer.observe(element));
		else
			observer.observe(element);
		return (() => observer.disconnect());
	}, [callback, !options ? options : JSON.stringify(options), target]); // eslint-disable-line react-hooks/exhaustive-deps
}

export function useEventListener<K extends keyof HTMLElementEventMap, T extends HTMLElement | Element | null | undefined>(target: T | T[], type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => void, options?: boolean | AddEventListenerOptions): void;
export function useEventListener<K extends keyof WindowEventMap, T extends Window | null | undefined>(target: T | T[], type: K, listener: (this: HTMLElement, ev: WindowEventMap[K]) => void, options?: boolean | AddEventListenerOptions): void;
export function useEventListener<K extends keyof DocumentEventMap, T extends Document | null | undefined>(target: T | T[], type: K, listener: (this: HTMLElement, ev: DocumentEventMap[K]) => void, options?: boolean | AddEventListenerOptions): void;
export function useEventListener<K extends keyof MediaQueryListEventMap, T extends MediaQueryList | null | undefined>(target: T | T[], type: K, listener: (this: MediaQueryList, ev: MediaQueryListEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
export function useEventListener<K extends keyof (HTMLElementEventMap | DocumentEventMap | WindowEventMap | MediaQueryListEventMap), T extends HTMLElement | Element | Document | Window | MediaQueryList | null | undefined>(target: T | T[], type: K, listener: (object: Event) => void, options?: boolean | AddEventListenerOptions): void;
export function useEventListener<K extends keyof (HTMLElementEventMap | DocumentEventMap | WindowEventMap | MediaQueryListEventMap), T extends HTMLElement | Element | Document | Window | MediaQueryList | null | undefined>(target: T | T[], type: K, listener: (object: Event) => void, options?: boolean | AddEventListenerOptions)
{
	// const previousTarget = usePrevious(target, true);

	useEffect(() =>
	{
		if (!isBrowser())
			return;
		if (Array.isArray(target))
			target.forEach(target => target?.addEventListener(type, listener, options));
		else
			target?.addEventListener(type, listener, options);
		return (() =>
		{
			if (Array.isArray(target))
				target.forEach(target => target?.removeEventListener(type, listener, options));
			else
				target?.removeEventListener(type, listener, options);
		});
	}, [target, listener, typeof options !== "object" ? options : JSON.stringify(options)]); // eslint-disable-line react-hooks/exhaustive-deps
}

function getParents(node?: Element | null): Element[]
{
	if (node)
		return ([node, ...getParents(node.parentElement)]);
	return ([]);
}

function getScrollableParents(node?: Element | null): Element[]
{
	function isOverflow(node: Element)
	{
		const style = getComputedStyle(node);

		if (style.overflow === "scroll" || style.overflow === "auto")
			return (true);
		if (style.overflowX === "scroll" || style.overflowX === "auto")
			return (true);
		if (style.overflowY === "scroll" || style.overflowY === "auto")
			return (true);
		return (false)
	}
	if (node && (node.scrollHeight > node.clientHeight || isOverflow(node)))
		return ([...getScrollableParents(node.parentElement), node]);
	else if (node)
		return (getScrollableParents(node.parentElement));
	return ([]);
}

export function useFollowElement(target: RefObject<Element | null>, callback: (rect: DOMRect | undefined, visible: boolean) => void)
{
	const scrollableParents = useMemo(() => getScrollableParents(target.current), [target]);
	const resizableParents = useMemo(() => getParents(target.current).map(parent => parent !== target.current ? Array.from(parent.children) : []).flat().filter(element => element !== target.current && !target.current?.contains(element) && getComputedStyle(element).display !== "none"), [target.current]); // eslint-disable-line react-hooks/exhaustive-deps
	const visible = useRef<boolean>(undefined);
	const onIntersect = useCallback<IntersectionObserverCallback>(event => visible.current = event[0].isIntersecting, []);
	const refresh = useCallback(() =>
	{
		if (typeof visible.current === "boolean")
			callback(target.current?.getBoundingClientRect(), visible.current);
	}, [callback, target]);

	useWindowEventListener("resize", refresh);
	useWindowEventListener("scroll", refresh);
	useEventListener(scrollableParents, "scroll", refresh);
	useResizeObserver(resizableParents, refresh, {box: "border-box"});

	useIntersectionObserver(target.current, onIntersect);
	// useIntersectionObserver(children?.map(child => child.current) ?? null, () => refresh);
	return (refresh);
}

export function useViewTransitions(callback?: (viewTransition?: ViewTransition) => void)
{
	return (() =>
	{
		let viewTransition: ViewTransition;

		if (isBrowser() && "startViewTransition" in document)
			viewTransition = document.startViewTransition(() => callback ? flushSync(() => callback(viewTransition)) : null);
		else
			callback?.();
	});
}

export const useIsomorphicLayoutEffect = isBrowser() ? useLayoutEffect : useEffect;

export function useMount(effect: () => void)
{
	const onMount = useEffectEvent(effect);

	useIsomorphicLayoutEffect(() => {onMount()}, []);
}

export function useUnmount(effect: () => void)
{
	const onUnmount = useEffectEvent(effect);

	useIsomorphicLayoutEffect(() => {return (() => {onUnmount()})}, []);
}
