import type { MenuItemData } from "@components/Menu/MenuItem";
import OrderedCollection, { OrderedCollectionChild, type OrderedCollectionChildData } from "@components/misc/OrderedCollection";
import { shallowEqual } from "@utils";
import { useId, useMemo, useState, type PropsWithChildren } from "react";

export interface MenuGroupProps
{
	label?: string
}
export interface MenuGroupData extends MenuGroupProps
{
	id: string,
	items: OrderedCollectionChildData<MenuItemData>[];
}

export default function MenuGroup(props: PropsWithChildren<MenuGroupProps>)
{
	const id = useId();
	const [contentProps, setContentProps] = useState<OrderedCollectionChildData<MenuItemData>[]>([]);
	const content = useMemo<MenuGroupData>(() => ({id, label: props.label, items: contentProps}), [contentProps, id, props.label]);

	return (
		<>
			<OrderedCollectionChild name="MenuGroup" id={id} content={content}/>
			<OrderedCollection<MenuItemData> name="MenuGroup" childName="MenuItem" onChildrenChange={setContentProps} compareChild={shallowEqual}>{props.children}</OrderedCollection>
		</>
	)
}
