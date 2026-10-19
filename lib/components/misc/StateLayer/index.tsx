import classNames from "classnames";
import { useCallback, useRef } from "react";
import { useElementEventListener, useElementRef, type UseElementEventListenerCallback } from "react-dom-event-hooks";

import "./style.scss";

enum RippleState
{
	Started = "STARTED",
	Waiting = "WAITING",
	Endind = "ENDING"
}

export interface StateLayerProps
{
	ripple?: boolean,
	dragged?: boolean,
	disabled?: boolean,
	subLayer?: boolean
}

export default function StateLayer(props: StateLayerProps)
{
	const {ripple: isRipple} = props;
	const ripplesRef = useRef<HTMLDivElement>(null);
	const startRipple = useCallback((event: MouseEvent) =>
	{
		let container: HTMLDivElement | null;
		let containerRect: DOMRect | undefined;
		let ripple: HTMLSpanElement;
		let diameter: number, radius: number;

		if (isRipple === false)
			return;
		if (props.subLayer)
			event.stopPropagation();
		container = ripplesRef.current;
		containerRect = container?.getBoundingClientRect();
		ripple = document.createElement("span");
		diameter = Math.max(containerRect?.width ?? 0, containerRect?.height ?? 0);
		radius = diameter / 2;
		if (!container || !containerRect)
			return (ripple.remove());
		ripple.style.width = ripple.style.height = `${diameter}px`;
		ripple.style.left = `${event.clientX - containerRect.left - radius}px`;
		ripple.style.top = `${event.clientY - containerRect.top - radius}px`;
		ripple.classList.add("ripple", "start");
		ripple.dataset.state = RippleState.Started;
		ripple.addEventListener("animationend", event =>
		{
			if (ripple.dataset.state === RippleState.Waiting && event.animationName.toLowerCase().includes("startRippleEffect".toLowerCase()))
			{
				ripple.classList.replace("start", "end");
				ripple.dataset.state = RippleState.Endind;
			}
			else if (event.animationName.toLowerCase().includes("endRippleEffect".toLowerCase()))
				ripple.remove();
			else
				ripple.dataset.state = RippleState.Waiting;
		});
		container.appendChild(ripple);
	}, [isRipple, props.subLayer]);
	const endRipple = useCallback(() =>
	{
		const container = ripplesRef.current;
		const ripples = container?.querySelectorAll<HTMLElement>(".ripple");

		ripples?.forEach(ripple =>
		{
			if (ripple.dataset.state === RippleState.Waiting)
				ripple.classList.replace("start", "end");
			ripple.dataset.state = RippleState.Waiting;
		});
	}, []);
	const onKeyDown = useCallback<UseElementEventListenerCallback<"keydown">>(event =>
	{
		switch (event.code.toLowerCase())
		{
			case "enter":
			case "space":
			{
				const element = event.currentTarget;
				let rect: DOMRect;

				event.preventDefault();
				if (props.subLayer)
					event.stopPropagation();
				if (element instanceof HTMLElement)
				{
					rect = element.getBoundingClientRect();
					element?.click();
					element.dispatchEvent(new MouseEvent("mousedown", {clientX: rect.x + rect.width / 2, clientY: rect.y + rect.height / 2}));
					setTimeout(() => element.dispatchEvent(new MouseEvent("mouseup", {clientX: rect.x + rect.width / 2, clientY: rect.y + rect.height / 2})), 150);
				}
				break;
			}
		}
	}, [props.subLayer]);

	const keyDownListener = useElementEventListener("keydown", onKeyDown);
	const mouseDownListener = useElementEventListener("mousedown", startRipple);
	const mouseUpListener = useElementEventListener("mouseup", endRipple);
	const mouseLeaveListener = useElementEventListener("mouseleave", endRipple);
	const {saveRef} = useElementRef<HTMLElement>(useCallback(ref =>
	{
		const cleanupKeyDownListener = keyDownListener.saveRef?.(ref.parentElement);
		const cleanupMouseDownListener = mouseDownListener.saveRef?.(ref.parentElement);
		const cleanupMouseUpListener = mouseUpListener.saveRef?.(ref.parentElement);
		const cleanupMouseLeaveListener = mouseLeaveListener.saveRef?.(ref.parentElement);

		return (() =>
		{
			cleanupMouseLeaveListener?.();
			cleanupMouseUpListener?.();
			cleanupMouseDownListener?.();
			cleanupKeyDownListener?.();
		})
	}, [keyDownListener, mouseDownListener, mouseLeaveListener, mouseUpListener]));

	return (
		<div
			ref={saveRef}
			className={classNames("StateLayer", {disabled: props.disabled, dragged: props.dragged})}
		>
			<div className="target"/>
			<div className="ripples" ref={ripplesRef}/>
		</div>
	);
}
