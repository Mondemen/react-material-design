import { OrderedCollectionChild, useOrderedCollection } from "@components/misc/OrderedCollection";
import TextFieldRender, { type TextFieldProps } from "@components/TextField/TextField.render";

export default function TextField(props: TextFieldProps)
{
	const orderedCollection = useOrderedCollection();

	if (orderedCollection)
		return (<OrderedCollectionChild name="TextField" content={props}/>);
	return (<TextFieldRender {...props}/>);
}
