import classNames from "classnames";
import type { PaneProps } from "./Pane";
import type { PaneData } from "./Panes";

export default function PaneRender(props: PaneProps & PaneData & {totalHandlesSize: number, activeDrag: string | null})
{
	const inlineContentPadding = props.inlineContentPadding ?? props.contentPadding ?? false;
	const blockContentPadding = props.blockContentPadding ?? props.contentPadding ?? false;
	let paneSize: number;
	let sizeStyle: string | number = "100%";

	if (props.size !== "auto")
	{
		if (typeof props.size === "string" && props.size.endsWith("%"))
		{
			paneSize = parseFloat(props.size);
			sizeStyle = props.totalHandlesSize > 0 ? `calc(${paneSize.toFixed(3)}% - ${Math.round((paneSize / 100) * props.totalHandlesSize)}px)` : `${paneSize.toFixed(3)}%`;
		}
		else if (typeof props.size === "number")
			sizeStyle = `calc(0% + ${Math.round(props.size)}px)`;
		else
			sizeStyle = props.size;
	}
	return (
		<section
			className={classNames("Pane",
			{
				snapped: props.snapped,
				collapsed: props.collapsed,
				"inline-padding": inlineContentPadding,
				"block-padding": blockContentPadding,
				animating: !props.activeDrag || props.isAnimating
			}, props.className)}
			data-key={props.id}
			style={{"--pane-size": sizeStyle}}
		>
			{props.children}
		</section>
	);
}