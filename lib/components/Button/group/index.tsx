import type { ButtonGroupProps } from "@components/Button/group/render";
import ButtonGroupRender from "@components/Button/group/render";
import { OrderedCollectionChild, useOrderedCollection } from "@components/misc/OrderedCollection";

export type {ButtonGroupProps, ConnectedButtonGroupProps, StandardButtonGroupProps} from "./render";

export default function ButtonGroup(props: ButtonGroupProps)
{
	const orderedCollection = useOrderedCollection();

	if (orderedCollection)
		return (<OrderedCollectionChild name="ButtonGroup" content={props}/>);
	return (<ButtonGroupRender {...props}/>);
}
