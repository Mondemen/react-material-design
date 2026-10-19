import type { ReferenceType } from "@hooks/useFloating";
import { getScrollParents } from "@utils";

export interface AutoUpdateOptions
{
	ancestorScroll?: boolean;
	ancestorResize?: boolean;
	elementResize?: boolean;
	layoutShift?: boolean;
	animationFrame?: boolean | "adaptive";
}

export function autoUpdate(reference: ReferenceType, floating: HTMLElement, updatePosition: () => void, options: AutoUpdateOptions = {})
{
	const config =
	{
		ancestorScroll: true,
		ancestorResize: true,
		elementResize: true,
		layoutShift: true,
		animationFrame: false,
		...options
	};
	const scrollParents = new Set([...(reference instanceof Element ? getScrollParents(reference) : []), ...getScrollParents(floating)]);
	const tick = () =>
	{
		if (!isIntersecting)
			return;
		if (frameId === null)
		{
			frameId = requestAnimationFrame(() =>
			{
				if (io)
					io.disconnect();
				updatePosition();
				frameId = null;
				if (config.layoutShift && config.animationFrame !== true && !isAdaptiveTracking)
					armLayoutShiftObserver();
			});
		}
	};
	const armLayoutShiftObserver = () =>
	{
		const rect = reference.getBoundingClientRect();
		const vw = window.visualViewport?.width || document.documentElement.clientWidth;
		const vh = window.visualViewport?.height || document.documentElement.clientHeight;
		const top = Math.round(rect.top);
		const right = Math.round(vw - rect.right);
		const bottom = Math.round(vh - rect.bottom);
		const left = Math.round(rect.left);
		let isInitial = true;

		if (!(reference instanceof Element) || !reference.isConnected || !isIntersecting)
			return;
		if (rect.width === 0 && rect.height === 0)
			return;
		if (io)
			io.disconnect();

		try
		{
			io = new IntersectionObserver(() =>
			{
				if (isInitial)
					return (isInitial = false);
				tick();
				if (config.animationFrame === "adaptive")
					startAdaptiveTracking();
			}, {rootMargin: `${-top}px ${-right}px ${-bottom}px ${-left}px`, threshold: 1});
			io.observe(reference);
		}
		catch {}
	};
	const startAdaptiveTracking = () =>
	{
		const loop = () =>
		{
			const rect = reference.getBoundingClientRect();
			const hasMoved = rect.x !== prevRect.x || rect.y !== prevRect.y;

			if (!isAdaptiveTracking || !isIntersecting)
				return;
			if (hasMoved)
			{
				prevRect = { x: rect.x, y: rect.y };
				updatePosition();
				adaptiveStillFrames = 0;
			}
			else
				adaptiveStillFrames++;
			if (adaptiveStillFrames > 10)
			{
				isAdaptiveTracking = false;
				if (config.layoutShift)
					armLayoutShiftObserver();
			}
			else
				rAF_Loop = requestAnimationFrame(loop);
		};

		if (isAdaptiveTracking || config.animationFrame !== "adaptive" || !isIntersecting)
			return;
		if (rAF_Loop !== null)
			cancelAnimationFrame(rAF_Loop);
		if (io)
			io.disconnect();
		isAdaptiveTracking = true;
		adaptiveStillFrames = 0;
		rAF_Loop = requestAnimationFrame(loop);
	};
	const loop = () =>
	{
		if (isIntersecting)
			updatePosition();
		rAF_Loop = requestAnimationFrame(loop);
	};
	let frameId: number | null = null;
	let resizeObserver: ResizeObserver | null = null;
	let io: IntersectionObserver | null = null;
	let isInitial = true;
	let screenIo: IntersectionObserver | null = null;
	let rAF_Loop: number | null = null;
	let isAdaptiveTracking = false;
	let adaptiveStillFrames = 0;
	let prevRect = { x: 0, y: 0 };
	let prevSize = { width: 0, height: 0 };
	let isIntersecting = true;

	if (reference instanceof Element)
	{
		screenIo = new IntersectionObserver(([entry]) =>
		{
			if (isInitial)
				return (isInitial = false);
			isIntersecting = entry.isIntersecting;
			if (isIntersecting)
			{
				updatePosition();
				if (config.layoutShift && config.animationFrame !== true)
					armLayoutShiftObserver();
			}
			 else if (io)
				io.disconnect();
		}, {threshold: 0});
		screenIo.observe(reference);
	}
	if (config.ancestorScroll || config.ancestorResize)
	{
		scrollParents.forEach((parent) =>
		{
			if (config.ancestorScroll)
				parent.addEventListener("scroll", tick, { passive: true });
			if (config.ancestorResize)
				parent.addEventListener("resize", tick, { passive: true });
		});
		if (config.ancestorResize)
		{
			window.addEventListener("resize", tick, { passive: true });
			window.visualViewport?.addEventListener("resize", tick);
			window.visualViewport?.addEventListener("scroll", tick);
		}
		if (config.ancestorScroll)
			window.addEventListener("scroll", tick, { passive: true, capture: true });
	}
	if (config.elementResize && typeof ResizeObserver !== "undefined")
	{
		resizeObserver = new ResizeObserver(([entry]) =>
		{
			if (entry.contentRect.width === prevSize.width && entry.contentRect.height === prevSize.height)
				return;
			prevSize.width = entry.contentRect.width;
			prevSize.height = entry.contentRect.height;
			tick();

		});
		if (reference instanceof Element)
			resizeObserver.observe(reference);
		resizeObserver.observe(floating);
	}
	if (config.layoutShift && config.animationFrame !== true)
		armLayoutShiftObserver();
	if (config.animationFrame === true)
		rAF_Loop = requestAnimationFrame(loop);
	else if (reference instanceof Element && config.animationFrame === "adaptive")
	{
		reference.addEventListener("transitionstart", startAdaptiveTracking, { passive: true });
		reference.addEventListener("animationstart", startAdaptiveTracking, { passive: true });
	}
	// updatePosition();
	return () =>
	{
		if (frameId !== null)
			cancelAnimationFrame(frameId);
		if (rAF_Loop !== null)
			cancelAnimationFrame(rAF_Loop);
		if (resizeObserver)
			resizeObserver.disconnect();
		if (io)
			io.disconnect();
		if (screenIo)
			screenIo.disconnect();
		scrollParents.forEach((parent) =>
		{
			parent.removeEventListener("scroll", tick);
			parent.removeEventListener("resize", tick);
		});
		window.removeEventListener("resize", tick);
		window.removeEventListener("scroll", tick, { capture: true });
		window.visualViewport?.removeEventListener("resize", tick);
		window.visualViewport?.removeEventListener("scroll", tick);
		if (reference instanceof Element)
		{
			reference.removeEventListener("transitionstart", startAdaptiveTracking);
			reference.removeEventListener("animationstart", startAdaptiveTracking);
		}
	};
}
