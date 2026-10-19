import type { IconDefinition } from "@components/Icon/Icon";
import { OrderedCollectionChild } from "@components/misc/OrderedCollection";
import { useMemo } from "react";

export interface OptionProps<T extends string | number = string>
{
	icon?: IconDefinition,
	label?: string,
	value: T,
	default?: boolean,
	disabled?: boolean,
	className?: string
}

export default function Option(props: OptionProps<string | number>)
{
	const content = useMemo(() =>
	({
		icon: props.icon,
		label: props.label,
		value: props.value,
		default: props.default,
		disabled: props.disabled,
		className: props.className
	}), [props.className, props.default, props.disabled, props.icon, props.label, props.value]);

	return (<OrderedCollectionChild name="Option" parentName="Select" content={content}/>);
}