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
	// const [groups, setGroups] = useState<OrderedCollectionChildData<MenuGroupData>[]>([]);
	const content = useMemo<MenuSectionData>(() => ({id, label: props.label, children: props.children}), [id, props.children, props.label]);
	// const acceptedChildren = useMemo(() => ["MenuGroup", "MenuItem"], []);

	return (
		<>
			<OrderedCollectionChild name="MenuSection" id={id} content={content}/>
			{/* <MenuContainer setGroups={setGroups}>{props.children}</MenuContainer> */}
			{/* <OrderedCollection<MenuItemData> name="MenuSection" childName={acceptedChildren} onChildrenChange={setContentProps} compareChild={shallowEqual}>{props.children}</OrderedCollection> */}
		</>
	)
}
