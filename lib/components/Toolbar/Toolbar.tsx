import { OrderedCollectionChild, useOrderedCollection } from "@components/misc/OrderedCollection";
import ToolbarRender, { type ToolbarProps } from "@components/Toolbar/Toolbar.render";
import type { PropsWithChildren } from "react";

export default function Toolbar(props: PropsWithChildren<ToolbarProps>)
{
	const orderedCollection = useOrderedCollection();

	if (orderedCollection)
		return (<OrderedCollectionChild name="Toolbar" content={props}/>);
	return (<ToolbarRender {...props}/>);
}
