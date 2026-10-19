import { waitAnimationNameEndEvent } from "@utils";
import classNames from "classnames";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useResizeObserver } from "react-dom-event-hooks";

import "./style.scss";

export interface TransitionableProps extends React.HTMLAttributes<HTMLDivElement>
{
	value?: React.ReactNode,
	static?: boolean,
}

export default function Transitionable(props: TransitionableProps)
{
	const ref = useRef<HTMLDivElement>(null);
	const previousValueRef = useRef<HTMLSpanElement>(null);
	const {value, static: isStatic, ...otherProps} = props;
	const [currentValue, setCurrentValue] = useState(value);
	const [previousValue, setPreviousValue] = useState(value);
	const {saveRef, ref: valueRef} = useResizeObserver<HTMLSpanElement>(useCallback(entries =>
	{
		entries.forEach(entry =>
		{
			ref.current?.style.setProperty("--md-comp-transitionable-width", `${entry.contentRect.width}px`);
			ref.current?.style.setProperty("--md-comp-transitionable-height", `${entry.contentRect.height}px`);
		});
	}, []));
	// const {} = useMutationObserver()

	useEffect(() =>
	{
		requestAnimationFrame(() => flushSync(() =>
		{
			const testFadeName = (name: string) => name.startsWith("transitionable-fade");

			setCurrentValue(previousValue =>
			{
				setPreviousValue(previousValue);
				return (value);
			});
			valueRef.current?.classList.add("transition");
			previousValueRef.current?.classList.add("transition");
			Promise.all([waitAnimationNameEndEvent(valueRef.current, testFadeName), waitAnimationNameEndEvent(previousValueRef.current, testFadeName)]).then(() =>
			{
				valueRef.current?.classList.remove("transition");
				previousValueRef.current?.classList.remove("transition");
			});
		}));
	}, [value, valueRef]);

	return (
		<div {...otherProps} ref={ref} className={classNames("Transitionable", {static: isStatic}, props.className)}>
			<span ref={saveRef} className="value">{currentValue}</span>
			<span ref={previousValueRef} className="previous-value">{previousValue}</span>
		</div>
	);
}