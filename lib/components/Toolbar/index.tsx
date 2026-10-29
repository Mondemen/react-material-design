import { OrderedCollectionChild, useOrderedCollection } from "@components/misc/OrderedCollection";
import ToolbarRender, { type ToolbarProps } from "@components/Toolbar/render";
import type { PropsWithChildren } from "react";

export type { DockedToolbarProps, FloatingToolbarProps, ToolbarProps } from "./render";

export default function Toolbar(props: PropsWithChildren<ToolbarProps>)
{
	const orderedCollection = useOrderedCollection();

	if (orderedCollection)
		return (<OrderedCollectionChild name="Toolbar" content={props}/>);
	return (<ToolbarRender {...props}/>);
}
