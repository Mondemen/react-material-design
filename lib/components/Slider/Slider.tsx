import FloatingElement, { type FloatingElementProps } from "@components/misc/FloatingElement";
import type { FlipOptions, Side } from "@hooks/useFloating/types";
import { clamp, mapRange } from "@utils";
import classNames from "classnames";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useConcatElementRef, useDocumentEventListener, useElementEventListener } from "react-dom-event-hooks";
import { getComponentSizeName } from "../types";

import "./style.scss";
import { useTheme } from "@components/Theme/Theme";

export interface DefaultSliderProps extends React.HTMLAttributes<HTMLDivElement>
{
	type?: "standard" | "centered",
	orientation?: "horizontal" | "vertical",
	size?: Parameters<typeof getComponentSizeName>[0],
	inset?: React.ReactNode,
	valueIndicator?: boolean,
	stopIndicator?: boolean,
	min?: number,
	max?: number,
	step?: number | "any",
	value?: number,
	// disabled?: boolean,
	onValueChange?: (value: number) => void
}

export interface RangeSliderProps extends Omit<DefaultSliderProps, "type" | "orientation" | "value" | "onValueChange">
{
	type: "range",
	orientation?: "horizontal",
	startValue?: number,
	endValue?: number,
	onStartValueChange?: (value: number) => void
	onEndValueChange?: (value: number) => void
}

export type SliderProps = DefaultSliderProps | RangeSliderProps;

function listPossibleValues(min: number, max: number, step: number, fromMiddle = false)
{
	let result: number[] = [];

	if (fromMiddle)
	{
		for (let value = ((min + max) / 2) - step; value > min; value -= step)
			result.unshift(value);
		result.unshift(min);
		for (let value = ((min + max) / 2) + step; value < max; value += step)
			result.push(value);
		result.push(max);
	}
	else
	{
		for (let value = min; value < max; value += step)
			result.push(value);
		result.push(max);
	}
	return (Array.from(new Set(result)));
}

function getClosestValue(value: number, list: number[])
{
	return (list.reduce((previous, current) => Math.abs(current - value) < Math.abs(previous - value) ? current : previous));
}

export function usePropValue<Value>(prop: Value, updater?: ((value: Value) => void) | undefined): [Value, (value: Value) => void];
export function usePropValue<Value = undefined>(prop: Value | undefined, updater: ((value: Value) => void) | undefined, defaultValue: NonNullable<Value>): [NonNullable<Value>, (value: Value) => void]
export function usePropValue<Value>(prop: Value | undefined, updater: ((value: NonNullable<Value>) => void) | undefined, defaultValue?: any): [Value, (value: NonNullable<Value>) => void]
{
	const [value, setValue] = useState(defaultValue ?? prop);
	const update = useCallback<NonNullable<typeof updater>>(value =>
	{
		setValue(value);
		updater?.(value);
	}, [updater]);

	useEffect(() => {setValue(prop)}, [prop]); // eslint-disable-line react-hooks/set-state-in-effect
	return ([prop ?? value ?? defaultValue, update] as const);
}

function isRange(arg: any): arg is RangeSliderProps
{
	return (typeof arg === "object" && arg?.type === "range");
}

function ValueIndicator({orientation, value, hover}: {orientation: "horizontal" | "vertical", value: number, hover: boolean})
{
	const {popoversContainer} = useTheme("Slider");
	const [placement, setPlacement] = useState<Side | undefined>();
	const flipOptions = useMemo<FlipOptions>(() =>
	{
		if (orientation === "horizontal")
			return ({allowedPlacements: ["top", "bottom"]});
		return ({allowedPlacements: ["left", "right"]});
	}, [orientation]);
	const onPlacementChange = useCallback<FloatingElementProps["onPlacementChange"] & {}>((_, side) =>
	{
		setPlacement(side as Side);
	}, []);

	return (
		<>
			<div className={classNames("value-indicator", placement, {visible: hover})}>{value}</div>
			<FloatingElement root={popoversContainer} flip={flipOptions} autoUpdate onPlacementChange={onPlacementChange} open={hover}>
				<div className="SliderValueIndicator">{value}</div>
			</FloatingElement>
		</>
	);
}

export default function Slider(props: SliderProps)
{
	const {type = "standard", size, min = type === "centered" ? -100 : 0, max = 100, step = 1} = props;
	const orientation = type === "range" ? "horizontal" : (props.orientation ?? "horizontal");
	const [startValue, setStartValue] = usePropValue(isRange(props) ? props.startValue : props.value, isRange(props) ? props.onStartValueChange : props.onValueChange, type === "centered" ? 0 : min);
	const [endValue, setEndValue] = usePropValue(isRange(props) ? props.endValue : undefined, isRange(props) ? props.onEndValueChange : undefined, max);
	const stepList = useMemo(() => (typeof step === "number") ? listPossibleValues(min, max, step, type === "centered") : null, [max, min, step, type]);
	const closestValue = useCallback((value: number) => stepList ? getClosestValue(value, [...stepList, (min + max) / 2]) : value, [max, min, stepList]);
	const finalStartValue = useMemo(() => step === "any" ? parseFloat(closestValue(startValue).toFixed(2)) : closestValue(startValue) , [closestValue, startValue, step]);
	const finalEndValue = useMemo(() => step === "any" ? parseFloat(closestValue(endValue).toFixed(2)) : closestValue(endValue), [closestValue, endValue, step]);
	const startPercent = useMemo(() => mapRange(finalStartValue, min, max, 0, 100) , [finalStartValue, max, min]);
	const endPercent = useMemo(() => mapRange(finalEndValue, min, max, 0, 100), [finalEndValue, max, min]);
	const [hover, setHover] = useState(false);
	const ref = useRef<HTMLDivElement>(null);
	const activeHandle = useRef<"start" | "end">(null);
	const [focusHandle, setFocusHandle] = useState<"start" | "end" | null>(null);

	const getElementPosition = useCallback((name: string) =>
	{
		switch (name)
		{
			case "handle":
			case "startHandle":
			case "startInactiveTrack":
				return ((startPercent) + "%");
			case "endHandle":
				return ((endPercent) + "%");
			case "inactiveTrack":
				return ((100 - startPercent) + "%");
			case "activeTrack":
				return ((type === "standard" ? startPercent : type === "range" ? Math.abs(endPercent - startPercent) : 0) + "%");
			case "negativeInactiveTrack":
				return ((clamp(startPercent, 0, 50) * 2) + "%");
			case "negativeActiveTrack":
				return (((50 - clamp(startPercent, 0, 50)) * 2) + "%");
			case "positiveActiveTrack":
				return (((clamp(startPercent, 50, 100) - 50) * 2) + "%");
			case "positiveInactiveTrack":
				return (((100 - clamp(startPercent, 50, 100)) * 2) + "%");
			case "endInactiveTrack":
				return ((100 - endPercent) + "%");
		}
		return ("0%");
	}, [endPercent, startPercent, type]);

	const onPointerMove = useCallback((event: PointerEvent, drag = true) =>
	{
		let value: number;
		let coords: DOMRect;

		event.preventDefault();
		if (event.currentTarget instanceof Element)
			event.currentTarget.setPointerCapture(event.pointerId);
		if (!ref.current || !activeHandle.current)
			return;
		if (drag)
			ref.current.classList.add("drag");
		coords = ref.current.getBoundingClientRect();
		if (orientation === "horizontal")
			value = closestValue(mapRange(event.pageX - coords.x, 0, coords.width, min, max));
		else if (orientation === "vertical")
			value = closestValue(mapRange(event.pageY - coords.y, coords.height, 0, min, max));
		else
			return;
		if (type === "standard" || type === "centered")
			setStartValue(value);
		else if (type === "range")
		{
			if (activeHandle.current === "start")
				setStartValue(clamp(value, min, endValue));
			else if (activeHandle.current === "end")
				setEndValue(clamp(value, startValue, max));
		}
	}, [closestValue, endValue, max, min, orientation, setEndValue, setStartValue, startValue, type]);

	const onPointerDown = useCallback((event: PointerEvent) =>
	{
		let coords: DOMRect;
		let startDistance: number, endDistance: number;
		let clickValue: number;

		if (!ref.current)
			return;
		event.stopPropagation();
		event.preventDefault();
		if (event.button === 2)
			return;
		coords = ref.current.getBoundingClientRect();
		if (type === "standard" || type === "centered")
			activeHandle.current = "start";
		else if (type === "range")
		{
			activeHandle.current = "start";
			if (orientation === "horizontal")
				clickValue = closestValue(mapRange(event.pageX - coords.x, 0, coords.width, min, max));
			else if (orientation === "vertical")
				clickValue = 100 - closestValue(mapRange(event.pageY - coords.y, 0, coords.height, min, max));
			else
				return;
			startDistance = Math.abs(clickValue - startValue);
			endDistance = Math.abs(clickValue - endValue);
			if (startDistance < endDistance)
				activeHandle.current = "start";
			else
				activeHandle.current = "end";
		}
		setFocusHandle(activeHandle.current);
		onPointerMove(event, false);
	}, [closestValue, endValue, max, min, onPointerMove, orientation, startValue, type]);
	const onPointerUp = useCallback(() =>
	{
		ref.current?.classList.remove("drag");
		activeHandle.current = null;
		setFocusHandle(activeHandle.current);
	}, []);

	const onPointerClick = useCallback((event: PointerEvent) =>
	{
		onPointerDown(event);
		onPointerMove(event);
		onPointerUp();
	}, [onPointerDown, onPointerUp, onPointerMove]);


	const mouseClickListener = useElementEventListener("pointerup", onPointerClick);
	const mouseDownListener = useElementEventListener("pointerdown", onPointerDown);
	const mouseEnterListener = useElementEventListener("mouseenter", () => setHover(true));
	const mouseLeaveListener = useElementEventListener("mouseleave", () => setHover(false));
	const {saveRef} = useConcatElementRef(ref, mouseClickListener, mouseDownListener, mouseEnterListener, mouseLeaveListener);

	const renderSteps = useCallback((_renderMiddle = true) =>
	{
		if (step === "any" || !props.stopIndicator)
		{
			if (type === "standard")
				return (<div className="step" style={{"--slider-step-position": "100%"}}/>);
			return (null);
		}
		// .filter(value => minStep <= value && value <= maxStep)
		return (stepList?.map(step => <div key={step} className="step" style={{"--slider-step-position": `${mapRange(step, min, max, 0, 100)}%`}}/>));
	}, [max, min, props.stopIndicator, step, stepList, type]);

	const renderSliderType = useMemo(() =>
	{
		if (type === "standard")
		{
			return (
				<>
					<div style={{"--slider-track-size": getElementPosition("activeTrack")}} className={classNames("track active", orientation)}><div className="path">{renderSteps()}</div></div>
					<div style={{"--slider-track-size": getElementPosition("inactiveTrack")}} className={classNames("track inactive", orientation)}><div className="path">{renderSteps()}</div></div>
					{/* <div className={classNames("handleContainer", orientation, {focus: focusHandle === "start"})}><div style={{"--slider-handle-position": getElementPosition("handle")}} tabIndex={0} className="handle"><OverlayElement><div className="valueIndicator">{finalStartValue}</div></OverlayElement></div></div> */}
					<div className={classNames("handleContainer", orientation, {focus: focusHandle === "start"})}><div style={{"--slider-handle-position": getElementPosition("handle")}} tabIndex={0} className="handle">
						<ValueIndicator orientation={orientation} value={finalStartValue} hover={hover || focusHandle === "start"}/>
					</div></div>
				</>
			);
		}
		else if (type === "centered")
		{
			return (
				<>
					<div className="negative side">
						<div style={{"--slider-track-size": getElementPosition("negativeInactiveTrack")}} className={classNames("track inactive negative", orientation, {negativeValue: startValue <= (min + max) / 2})}><div className="path">{renderSteps(false)}</div></div>
						<div style={{"--slider-track-size": getElementPosition("negativeActiveTrack")}} className={classNames("track active negative", orientation, {negativeValue: startValue <= (min + max) / 2})}><div className="path">{renderSteps(false)}</div></div>
					</div>
					<div className="positive side">
						<div style={{"--slider-track-size": getElementPosition("positiveActiveTrack")}} className={classNames("track active positive", orientation, {positiveValue: startValue >= (min + max) / 2})}><div className="path">{renderSteps(false)}</div></div>
						<div style={{"--slider-track-size": getElementPosition("positiveInactiveTrack")}} className={classNames("track inactive positive", orientation, {positiveValue: startValue >= (min + max) / 2})}><div className="path">{renderSteps(false)}</div></div>
					</div>
					<div className={classNames("handleContainer", orientation, {focus: focusHandle === "start"})}><div style={{"--slider-handle-position": getElementPosition("handle")}} tabIndex={0} className="handle">
						<ValueIndicator orientation={orientation} value={finalStartValue} hover={hover || focusHandle === "start"}/>
					</div></div>
					<div className="triggerResize" style={{"--slider-trigger-resize": getElementPosition("handle")}}/>
				</>
			);
		}
		return (
			<>
				<div style={{"--slider-track-size": getElementPosition("startInactiveTrack")}} className={classNames("track inactive start", orientation)}><div className="path">{renderSteps()}</div></div>
				<div style={{"--slider-track-size": getElementPosition("activeTrack")}} className={classNames("track active", orientation)}><div className="path">{renderSteps()}</div></div>
				<div style={{"--slider-track-size": getElementPosition("endInactiveTrack")}} className={classNames("track inactive end", orientation)}><div className="path">{renderSteps()}</div></div>
				<div className={classNames("handleContainer", orientation, {focus: focusHandle === "start"})}><div style={{"--slider-handle-position": getElementPosition("startHandle")}} tabIndex={0} className="handle">
					<ValueIndicator orientation={orientation} value={finalStartValue} hover={hover || focusHandle === "start"}/>
				</div></div>
				<div className={classNames("handleContainer", orientation, {focus: focusHandle === "end"})}><div style={{"--slider-handle-position": getElementPosition("endHandle")}} tabIndex={0} className="handle end">
					<ValueIndicator orientation={orientation} value={finalEndValue} hover={hover || focusHandle === "end"}/>
				</div></div>
			</>
		);
	}, [finalEndValue, finalStartValue, focusHandle, getElementPosition, hover, max, min, orientation, renderSteps, startValue, type]);

	useDocumentEventListener("pointerup", onPointerUp);
	useDocumentEventListener("pointermove", onPointerMove);

	return (
		<div ref={saveRef} className={classNames("Slider", type, orientation, getComponentSizeName(size, "extra-small"))}>
			{renderSliderType}
		</div>
	)
}