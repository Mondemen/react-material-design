import { OrderedCollectionChild } from "@components/misc/OrderedCollection";
import { useId, useMemo, type PropsWithChildren } from "react";

export interface MenuSectionProps extends PropsWithChildren
{
	label: string
}

export interface MenuSectionData extends MenuSectionProps
{
	id: string,
}

export default function MenuSection(props: PropsWithChildren<MenuSectionProps>)
{
	const id = useId();
	const content = useMemo<MenuSectionData>(() => ({id, label: props.label, children: props.children}), [id, props.children, props.label]);

	return (<OrderedCollectionChild name="MenuSection" id={id} content={content}/>);
}
