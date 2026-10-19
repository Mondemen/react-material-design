import { convertReactStyleToDomStyle } from "@utils/dom";
import { useIsomorphicLayoutEffect } from "@utils/hooks";
import { useCallback, useEffectEvent, useRef, useState, type CSSProperties } from "react";
import { useResizeObserver } from "react-dom-event-hooks";
import type { AutoUpdateOptions } from "./autoUpdate";
import { autoUpdate } from "./autoUpdate";
import type { Middleware, MiddlewareReturn, MiddlewareState, Placement } from "./types";
import { computeBaseCoords } from "./utils";

export interface VirtualElement
{
	getBoundingClientRect(): DOMRect
	contextElement?: HTMLElement
}

export type ReferenceType = HTMLElement | VirtualElement;

export interface UseFloatingOptions
{
	strategy?: "absolute" | "fixed",
	placement?: Placement,
	middlewares?: Middleware[],
	autoUpdate?: boolean | AutoUpdateOptions,
	defaultAutoUpdateEnabled?: boolean,
	// lockAxis?:
	// {
	// 	x?: boolean;
	// 	y?: boolean;
	// },
	style?: CSSProperties
}

export function useFloating<RefType extends ReferenceType = ReferenceType, FloatType extends HTMLElement = HTMLElement>(options: UseFloatingOptions = {})
{
	const {placement = "top", strategy = "absolute", middlewares = [], autoUpdate: autoUpdateConfig = true, style} = options;
	const [isAutoUpdateEnabled, setAutoUpdateEnabled] = useState(options.defaultAutoUpdateEnabled ?? true);
	const [floatRect, setFloatRect] = useState<DOMRect | null>(null);
	const [reference, saveReference] = useState<RefType | null>(null);
	const {ref: floating, saveRef: saveFloating} = useResizeObserver<FloatType>(entries => entries.forEach(({borderBoxSize: [size]}) => setFloatRect(new DOMRect(0, 0, size.inlineSize, size.blockSize))));
	const coords = useRef({ x: 0, y: 0 });
	const [finalPlacement, setPlacement] = useState(placement);
	const isPositioned = useRef(false);
	const updatePosition = useEffectEvent(() =>
	{
		let refRect = reference?.getBoundingClientRect();
		const MAX_RESETS = 2;
		const visualViewport = window.visualViewport;
		const isAbsolute = strategy === "absolute";
		const originX = isAbsolute ? (visualViewport ? visualViewport.pageLeft : window.scrollX) : (visualViewport ? visualViewport.offsetLeft : 0);
		const originY = isAbsolute ? (visualViewport ? visualViewport.pageTop : window.scrollY) : (visualViewport ? visualViewport.offsetTop : 0);
		const vvWidth = visualViewport ? visualViewport.width : window.innerWidth;
		const vvHeight = visualViewport ? visualViewport.height : window.innerHeight;
		const viewport = new DOMRect(originX, originY, vvWidth, vvHeight);
		let resetCount = 0;
		let x: number, y: number;
		let currentPlacement = placement;
		let state: MiddlewareState;
		let middlewareResult: MiddlewareReturn;
		let computeCoords: DOMRect;

		if (!refRect || !floatRect || !floating.current || !floatRect)
			return;
		refRect = new DOMRect(refRect.left + window.scrollX, refRect.top + window.scrollY, refRect.width, refRect.height);
		computeCoords = computeBaseCoords(refRect, floatRect, currentPlacement);
		state = {placement: currentPlacement, refRect, floatRect, viewport, x: computeCoords.x, y: computeCoords.y};
		for (let i = 0; i < middlewares.length; i++)
		{
			middlewareResult = middlewares[i](state);
			if (middlewareResult.reset && resetCount < MAX_RESETS)
			{
				resetCount++;
				currentPlacement = middlewareResult.reset.placement;
				computeCoords = computeBaseCoords(refRect, floatRect, currentPlacement);
				state = {...state, placement: currentPlacement, x: computeCoords.x, y: computeCoords.y};
				i = 0;
				continue;
			}
			state = {...state, ...middlewareResult, x: middlewareResult.x ?? state.x, y: middlewareResult.y ?? state.y};
		}
		x = Math.round(state.x);
		y = Math.round(state.y);
		if (style)
			Object.assign(floating.current.style, convertReactStyleToDomStyle(style));
		if (x !== coords.current.x || y !== coords.current.y)
		{
			floating.current.style.setProperty("position", strategy);
			floating.current.style.setProperty("transform", `translate(${x}px, ${y}px)`);
			floating.current.style.removeProperty("visibility");
		}
		coords.current = { x, y };
		isPositioned.current = true;
		if (finalPlacement !== state.placement)
			setPlacement(state.placement);
	});
	const getCoords = useCallback(() => coords.current, []);
	const isPositionedCallback = useCallback(() => isPositioned.current, []);

	useIsomorphicLayoutEffect(() =>
	{
		const options = typeof autoUpdateConfig === "object" ? autoUpdateConfig : {};

		if (!isAutoUpdateEnabled || !reference || !floating.current || !floatRect)
			return;
		if (style)
			Object.assign(floating.current.style, convertReactStyleToDomStyle(style));
		if (!isPositioned.current)
		{
			floating.current.style.setProperty("position", strategy);
			floating.current.style.setProperty("top", "0");
			floating.current.style.setProperty("left", "0");
			floating.current.style.setProperty("visibility", "hidden");
		}
		if (autoUpdateConfig)
			return (autoUpdate(reference, floating.current, updatePosition, options));
	}, [autoUpdateConfig, floatRect, floating, isAutoUpdateEnabled, isPositioned, reference, strategy, style]);

	useIsomorphicLayoutEffect(() =>
	{
		if (placement && middlewares)
			updatePosition();
	}, [placement, isPositioned, middlewares]);

	return ({
		reference,
		saveReference,
		floating,
		saveFloating,
		getCoords,
		placement: finalPlacement,
		isPositioned: isPositionedCallback,
		isAutoUpdateEnabled,
		setAutoUpdateEnabled
	});
}
