import type { MenuGroupData } from "@components/Menu/MenuGroup";
import type { MenuItemData } from "@components/Menu/MenuItem";
import OrderedCollection, { type OrderedCollectionChildData } from "@components/misc/OrderedCollection";
import { shallowEqual } from "@utils";
import { useEffect, useMemo, useState, type PropsWithChildren } from "react";

export interface MenuContainerData
{
	setGroups: (groups: OrderedCollectionChildData<MenuGroupData>[]) => void
}

export default function MenuContainer(props: PropsWithChildren<MenuContainerData>)
{
	const {setGroups} = props;
	const [contentProps, setContentProps] = useState<OrderedCollectionChildData<MenuItemData | MenuGroupData>[]>([]);
	const defaultGroup = useMemo(() =>
	{
		const items = contentProps.filter((content): content is OrderedCollectionChildData<MenuItemData> => content.orderedCollectionName === "MenuItem");

		return ({id: "__default", orderedCollectionName: "MenuGroup", items} as OrderedCollectionChildData<MenuGroupData>);
	}, [contentProps]);
	const groups = useMemo(() => contentProps.filter((content): content is OrderedCollectionChildData<MenuGroupData> => content.orderedCollectionName === "MenuGroup"), [contentProps]);

	useEffect(() =>
	{
		if (defaultGroup.items.length)
			setGroups([defaultGroup, ...groups]);
		else
			setGroups(groups);
	}, [defaultGroup, groups, setGroups]);

	return (<OrderedCollection<MenuItemData | MenuGroupData> name="Menu" childName={["MenuItem", "MenuGroup"]} onChildrenChange={setContentProps} compareChild={shallowEqual}>{props.children}</OrderedCollection>);
}
