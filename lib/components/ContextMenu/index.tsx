import type { ContextMenuProps } from "@components/ContextMenu/render";
import ContextMenuRender from "@components/ContextMenu/render";
import { OrderedCollectionChild, useOrderedCollection } from "@components/misc/OrderedCollection";

export default function ContextMenu(props: ContextMenuProps)
{
	const orderedCollection = useOrderedCollection();

	if (orderedCollection)
		return (<OrderedCollectionChild name="ContextMenu" content={props}/>);
	return (<ContextMenuRender {...props}/>);
}
