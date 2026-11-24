import TextFieldRender, { type TextFieldProps } from "@components/TextField/TextField";
import { OrderedCollectionChild, useOrderedCollection } from "@misc/OrderedCollection";

export type {TextFieldProps} from "./TextField";

export default function TextField(props: TextFieldProps)
{
	const orderedCollection = useOrderedCollection();

	if (orderedCollection)
		return (<OrderedCollectionChild name="TextField" content={props}/>);
	return (<TextFieldRender {...props}/>);
}
