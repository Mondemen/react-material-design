import MenubarRender from "@components/Menubar/render";
import { OrderedCollectionChild, useOrderedCollection } from "@components/misc/OrderedCollection";
import type { PropsWithChildren } from "react";

export {default as MenuSection, type MenuSectionProps} from "./MenuSection";

export default function Menubar(props: PropsWithChildren)
{
	const orderedCollection = useOrderedCollection();

	if (orderedCollection)
		return (<OrderedCollectionChild name="Menubar" content={props}/>);
	return (<MenubarRender {...props}/>);
}
