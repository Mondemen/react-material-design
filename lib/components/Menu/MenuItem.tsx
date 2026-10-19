import type { IconDefinition } from "@components/Icon";
import MenuContainer from "@components/Menu/MenuContainer";
import type { MenuGroupData } from "@components/Menu/MenuGroup";
import { OrderedCollectionChild, type OrderedCollectionChildData } from "@components/misc/OrderedCollection";
import type { PolymorphicComponent } from "@components/misc/Polymorphic";
import { useId, useMemo, useState, type ElementType, type PropsWithChildren } from "react";

export type MenuItemProps<As extends ElementType = "button"> = PolymorphicComponent<"MenuItem", As, "button",
{
	id?: string,
	icon?: IconDefinition | ((selected: boolean) => IconDefinition)
	text: string | ((selected: boolean) => string),
	supportingText?: string | ((selected: boolean) => string),
	selectable?: boolean,
	selected?: boolean,
	onSelected?: (selected: boolean) => void,
	disabled?: boolean
}>;

export type MenuItemData<As extends ElementType = "button"> = MenuItemProps<As> &
{
	subMenuGroups: OrderedCollectionChildData<MenuGroupData>[]
}

export default function MenuItem<As extends ElementType = "button">(props: PropsWithChildren<MenuItemProps<As>>)
{
	const id = useId();
	const [groups, setGroups] = useState<OrderedCollectionChildData<MenuGroupData>[]>([]);
	const content = useMemo<MenuItemData<As>>(() =>
	({
		...props,
		subMenuGroups: groups,
	}), [groups, props]);

	return (
		<>
			<MenuContainer setGroups={setGroups}>{props.children}</MenuContainer>
			<OrderedCollectionChild name="MenuItem" id={props.id ?? id} content={content}/>
		</>
	);
}
