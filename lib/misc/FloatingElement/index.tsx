import { useFloating, type UseFloatingOptions } from "@hooks/useFloating";
import type { AutoUpdateOptions } from "@hooks/useFloating/autoUpdate";
import { flip } from "@hooks/useFloating/middleware/flip";
import { offset } from "@hooks/useFloating/middleware/offset";
import { shift } from "@hooks/useFloating/middleware/shift";
import { size, type SizeOptions } from "@hooks/useFloating/middleware/size";
import type { Alignment, DiagonalPlacement, FlipOptions, Middleware, OffsetOptions, Placement, ShiftOptions, Side } from "@hooks/useFloating/types";
import { parsePlacement } from "@hooks/useFloating/utils";
import { useIsomorphicLayoutEffect } from "@utils/hooks";
import classNames from "classnames";
import { useCallback, useEffect, useMemo, type CSSProperties, type PropsWithChildren, type Ref, type RefCallback, type RefObject } from "react";
import { createPortal } from "react-dom";
import { useConcatElementRef, useElementRef } from "react-dom-event-hooks";

import "./style.scss";

export interface FloatingElementProps
{
	ref?: Ref<HTMLElement>,
	placement?: Placement,
	autoUpdate?: boolean | AutoUpdateOptions,
	offset?: number | OffsetOptions,
	flip?: boolean | FlipOptions,
	size?: boolean | number,
	shift?: number| ShiftOptions,
	root?: HTMLElement | RefObject<HTMLElement | null> | null,
	open?: boolean,
	onPlacementChange?: (placement: Placement, side: Side | DiagonalPlacement, alignment: Alignment | undefined, isDiagonal: boolean) => void,
	style?: CSSProperties
}

export default function FloatingElement(props: PropsWithChildren<FloatingElementProps>)
{
	const {ref: refProp, style: styleProp, onPlacementChange} = props;
	const styleStr = useMemo(() => styleProp ? JSON.stringify(styleProp) : undefined, [styleProp]);
	const style = useMemo<CSSProperties>(() => styleStr ? JSON.parse(styleStr) : undefined, [styleStr]);
	const {saveRef: saveCallbackFloating, ref: floating} = useElementRef();
	const applySize = useCallback<SizeOptions["apply"]>((width, height, state) =>
	{
		if (state.placement.startsWith("top") || state.placement.startsWith("bottom"))
		{
			floating.current?.style.setProperty("height", `${height}px`);
			floating.current?.style.removeProperty("width");
		}
		else
		{
			floating.current?.style.setProperty("width", `${width}px`);
			floating.current?.style.removeProperty("height");
		}
	}, [floating]);
	const options = useMemo<UseFloatingOptions>(() =>
	{
		const middlewares: Middleware[] = [];

		if (props.flip)
			middlewares.push(flip(props.flip === true ? {padding: 20} : props.flip));
		if (props.offset !== undefined)
			middlewares.push(offset(props.offset));
		if (props.size !== undefined)
			middlewares.push(size(typeof props.size === "boolean" ? {apply: applySize} : {padding: props.size, apply: applySize}));
		if (props.shift !== undefined)
			middlewares.push(shift(props.shift));
		return ({placement: props.placement, middlewares, autoUpdate: props.autoUpdate, defaultAutoUpdateEnabled: true, style});
	}, [applySize, props.autoUpdate, props.flip, props.offset, props.placement, props.shift, props.size, style]);
	const {saveReference, saveFloating, setAutoUpdateEnabled, placement} = useFloating(options);
	const {saveRef: saveFloatingRef} = useConcatElementRef(saveCallbackFloating, saveFloating);
	const {side, alignment, isDiagonal: diagonal} = useMemo(() => parsePlacement(placement), [placement]);
	const root = props.root instanceof HTMLElement ? props.root : props.root?.current ?? null;
	const saveTarget = useCallback<RefCallback<HTMLSpanElement>>(ref =>
	{
		let saveReferenceCleanup: ReturnType<RefCallback<HTMLElement>>;
		let refCleanup: ReturnType<RefCallback<HTMLElement>>;

		if (ref?.parentElement)
		{
			saveReferenceCleanup = saveReference(ref.parentElement);
			if (typeof refProp === "function")
				refCleanup = refProp(ref.parentElement);
			else if (refProp)
				refProp.current = ref.parentElement;
			return (() =>
			{
				saveReferenceCleanup?.();
				if (typeof refProp === "function")
					refCleanup?.();
				else if (refProp)
					refProp.current = null;
			});
		}
	}, [refProp, saveReference]);

	useIsomorphicLayoutEffect(() =>
	{
		if (typeof props.open === "boolean")
			setAutoUpdateEnabled(props.open);
	}, [props.open, setAutoUpdateEnabled]);
	useEffect(() => {onPlacementChange?.(placement, side, alignment, diagonal)}, [alignment, diagonal, onPlacementChange, placement, side]);

	if (root)
	{
		return (
			<>
				<span ref={saveTarget} className="FloatingElementTarget"/>
				{createPortal(<div ref={saveFloatingRef} className={classNames("FloatingElement", placement, side, alignment, {diagonal, open: props.open})} style={style}>{props.children}</div>, root)}
			</>
		);
	}
	return (null);
}
