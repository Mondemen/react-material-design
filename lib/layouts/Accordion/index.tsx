import IconButton from "@components/Button/icon";
import type { IconDefinition } from "@components/Icon";
import { convertIconDefinition } from "@components/Icon/Icon";
import StateLayer from "@misc/StateLayer";
import Transitionable from "@misc/Transitionable";
import classNames from "classnames";
import { useMemo, useRef, useState, type PropsWithChildren } from "react";
import { useResizeObserver } from "react-dom-event-hooks";
import type { LayoutPadding } from "../types";

import "./style.scss";

export interface AccordionProps extends LayoutPadding
{
	variant?: "standard" | "flat",
	expanded?: boolean,
	onChange?: (expanded: boolean) => void,
	title: string | ((expanded: boolean) => string),
	subtitle?: string | ((expanded: boolean) => string),
	icon?: IconDefinition | ((expanded: boolean) => IconDefinition),
	expandIcon?: IconDefinition | ((expanded: boolean) => IconDefinition),
}

export default function Accordion(props: PropsWithChildren<AccordionProps>)
{
	const {variant = "standard", title: titleExternal, subtitle: subtitleExternal, icon: iconExternal, expandIcon: expandIconExternal = "keyboard_arrow_down", expanded: expandedExternal, onChange} = props;
	const [expandedInternal, setExpanded] = useState(props.expanded ?? false);
	const ref = useRef<HTMLDivElement>(null);
	const expanded = expandedExternal ?? expandedInternal;
	const title = useMemo(() => typeof titleExternal === "function" ? titleExternal(expanded) : titleExternal, [titleExternal, expanded]);
	const subtitle = useMemo(() => typeof subtitleExternal === "function" ? subtitleExternal(expanded) : subtitleExternal, [subtitleExternal, expanded]);
	const iconDefinition = useMemo(() => typeof iconExternal === "function" ? iconExternal(expanded) : iconExternal, [iconExternal, expanded]);
	const icon = useMemo(() => convertIconDefinition(iconDefinition), [iconDefinition]);
	const expandIcon = useMemo(() => typeof expandIconExternal === "function" ? expandIconExternal(expanded) : expandIconExternal, [expandIconExternal, expanded]);
	const {saveRef: saveHeaderRef} = useResizeObserver(([entry]) => ref.current?.style.setProperty("--accordion-header-size", `${entry.borderBoxSize.at(0)?.blockSize ?? 0}px`));
	const {saveRef: saveContentRef} = useResizeObserver(([entry]) => ref.current?.style.setProperty("--accordion-container-size", `${entry.borderBoxSize.at(0)?.blockSize ?? 0}px`));
	const inlineContentPadding = props.inlineContentPadding ?? props.contentPadding ?? false;
	const blockContentPadding = props.blockContentPadding ?? props.contentPadding ?? false;

	function onClick()
	{
		const newExpanded = !expanded;

		if (expandedExternal === undefined)
			setExpanded(newExpanded);
		onChange?.(newExpanded);
	}

	return (
		<div ref={ref} className={classNames("Accordion", variant, {expanded})}>
			<div ref={saveHeaderRef} className="header" onClick={onClick}>
				<StateLayer/>
				{icon && <Transitionable value={icon} className="icon"/>}
				<div className="summary">
					<span className="title">{title}</span>
					{subtitle && <span className="subtitle">{subtitle}</span>}
				</div>
				<IconButton icon={expandIcon} size="extra-small" width="narrow" color="standard" className="expand-icon"/>
			</div>
			<div className="container">
				<div ref={saveContentRef} className={classNames("content", {"inline-padding": inlineContentPadding, "block-padding": blockContentPadding})}>{props.children}</div>
			</div>
		</div>
	)
}