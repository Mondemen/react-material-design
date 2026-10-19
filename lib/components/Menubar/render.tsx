import Button from "@components/Button/default";
import type { MenuSectionData } from "@components/Menubar/MenuSection";
import OrderedCollection, { type OrderedCollectionChildData } from "@components/misc/OrderedCollection";
import { shallowEqual } from "@utils";
import { useCallback, useState, type PointerEventHandler, type PropsWithChildren } from "react";
import { useMultiElementRef, useWindowEventListener } from "react-dom-event-hooks";

import "./style.scss";

export type MenubarProps = PropsWithChildren;

export default function MenubarRender(props: MenubarProps)
{
	const [sectionsProps, setSectionProps] = useState<OrderedCollectionChildData<MenuSectionData>[]>([]);
	const [open, setOpen] = useState<string>();
	const {saveRef: saveMenuRef, ref: menuRefs} = useMultiElementRef();
	const onPointerDown = useCallback<PointerEventHandler<HTMLButtonElement>>(event => event.stopPropagation(), []);

	useWindowEventListener("pointerdown", event =>
	{
		// console.log("MOUSE DOWN");
		if (!(event.target instanceof Node))
			return;
		if (open && (!Array.from(menuRefs.current.values()).some(ref => ref.contains(event.target as Node))))
			setOpen(undefined);
	});
	useWindowEventListener("click", event =>
	{
		// console.log("MOUSE UP");
		if (!(event.target instanceof Node))
			return;
		if (open && (!event.target.parentElement?.parentElement?.classList.contains("selectable") || !Array.from(menuRefs.current.values()).some(ref => ref.contains(event.target as Node))))
			setOpen(undefined);
	});

	return (
		<div className="Menubar">
			{sectionsProps.map(props =>
			(
				<Button
					key={props.id}
					label={props.label}
					color="text"
					shape="square"
					size="extra-small"
					onClick={event =>
					{
						event.stopPropagation();
						setOpen(current => !current ? props.id : undefined);
					}}
					onPointerDown={onPointerDown}
					onMouseEnter={() => open && setOpen(props.id)}
					menuRef={saveMenuRef}
					menuOpen={open === props.id}
					density={-3}
					menuOpenBehavior="manual"
				>
					{props.children}
				</Button>
			))}
			<OrderedCollection<MenuSectionData> childName="MenuSection" onChildrenChange={setSectionProps} compareChild={shallowEqual}>{props.children}</OrderedCollection>
		</div>
	)
}
