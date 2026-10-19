import { OrderedCollectionChild, useOrderedCollection } from "@components/misc/OrderedCollection";
import NumberFieldRender, { type NumberFieldProps } from "@components/NumberField/NumberField.render";

export default function NumberField(props: NumberFieldProps)
{
	const orderedCollection = useOrderedCollection();

	if (orderedCollection)
		return (<OrderedCollectionChild name="NumberField" content={props}/>);
	return (<NumberFieldRender {...props}/>);
}
