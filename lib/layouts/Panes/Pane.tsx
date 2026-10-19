import { OrderedCollectionChild } from "@components/misc/OrderedCollection";
import type { SizeUnit } from "@utils";
import { useId, useMemo, type PropsWithChildren } from "react";
import type { LayoutPadding } from "../types";

export interface PaneProps extends PropsWithChildren, LayoutPadding
{
	id?: string,
	defaultSize?: SizeUnit | "auto",
	minSize?: SizeUnit,
	snapPoints?: SizeUnit[],
	className?: string
}

export default function Pane(props: PaneProps)
{
	const id = useId();
	const realId = props.id ?? id;
	const content = useMemo(() =>
	({
		id: realId,
		defaultSize: props.defaultSize,
		minSize: props.minSize ?? "10%",
		snapPoints: props.snapPoints,
		inlineContentPadding: props.inlineContentPadding,
		blockContentPadding: props.blockContentPadding,
		contentPadding: props.contentPadding,
		className: props.className,
		children: props.children
	}), [props.blockContentPadding, props.children, props.className, props.contentPadding, props.defaultSize, props.inlineContentPadding, props.minSize, props.snapPoints, realId]);

	return (<OrderedCollectionChild name="Pane" parentName="Panes" content={content}/>);
}
