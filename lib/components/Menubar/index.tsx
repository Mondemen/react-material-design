import MenubarRender, { type MenubarProps } from "@components/Menubar/render";
import { OrderedCollectionChild, useOrderedCollection } from "@components/misc/OrderedCollection";

export { default as MenuSection, type MenuSectionProps } from "./MenuSection";
export type { MenubarProps } from "./render";

export default function Menubar(props: MenubarProps)
{
	const orderedCollection = useOrderedCollection();

	if (orderedCollection)
		return (<OrderedCollectionChild name="Menubar" content={props}/>);
	return (<MenubarRender {...props}/>);
}
