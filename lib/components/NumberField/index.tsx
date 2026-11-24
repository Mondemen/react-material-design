import type { NumberFieldProps } from "@components/NumberField/NumberField";
import NumberFieldRender from "@components/NumberField/NumberField";
import { OrderedCollectionChild, useOrderedCollection } from "@misc/OrderedCollection";

export type {NumberFieldProps} from "./NumberField";

export default function NumberField(props: NumberFieldProps)
{
	const orderedCollection = useOrderedCollection();

	if (orderedCollection)
		return (<OrderedCollectionChild name="NumberField" content={props}/>);
	return (<NumberFieldRender {...props}/>);
}
