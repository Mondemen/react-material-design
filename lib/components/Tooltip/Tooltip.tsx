import FloatingElement from "@components/misc/FloatingElement";
import { useTheme } from "@components/Theme/Theme";
import type { FlipOptions, ShiftOptions } from "@hooks/useFloating/types";
import classNames from "classnames";
import { useId, useMemo, type PropsWithChildren } from "react";
import { useElementRef } from "react-dom-event-hooks";

import "./style.scss";

export interface PlainTooltipProps
{
	variant: "plain",
	text: string
}

export interface RichTooltipProps
{
	variant: "rich",
	subhead?: string,
	text: string
}

export type TooltipProps = PlainTooltipProps | RichTooltipProps;

export default function Tooltip(props: PropsWithChildren<TooltipProps>)
{
	const id = useId();
	const {tooltip, setTooltip, tooltipsContainer} = useTheme("Tooltip");
	const flipOptions = useMemo<FlipOptions>(() => ({padding: 12, allowedPlacements: ["top", "bottom"]}), []);
	const shiftOptions = useMemo<ShiftOptions>(() => ({padding: 8, limitShift: 8}), []);
	const open = tooltip === id;
	const {saveRef} = useElementRef<HTMLElement>(ref =>
	{
		const onMouseEnter = () => setTooltip(id);
		const onMouseLeave = () => setTooltip();

		ref.addEventListener("mouseenter", onMouseEnter);
		ref.addEventListener("mouseleave", onMouseLeave);
		// ref.addEventListener("focus", onMouseEnter);
		// ref.addEventListener("blur", onMouseLeave);
		return (() =>
		{
			ref.removeEventListener("mouseenter", onMouseEnter);
			ref.removeEventListener("mouseleave", onMouseLeave);
			// ref.removeEventListener("focus", onMouseEnter);
			// ref.removeEventListener("blur", onMouseLeave);
		});
	});

	if (props.variant === "plain")
	{
		return (
			<FloatingElement
				ref={saveRef}
				root={tooltipsContainer}
				placement="top"
				offset={4}
				flip={flipOptions}
				shift={shiftOptions}
				open={open}
			>
				<div className={classNames("Tooltip plain", {open})} role="tooltip">{props.text}</div>
			</FloatingElement>
		);

	}
}