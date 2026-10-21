import Button from "@components/Button/default";
import type { IconDefinition } from "@components/Icon";
import { convertIconDefinition } from "@components/Icon/Icon";
import type { MenuSectionData } from "@components/Menubar/MenuSection";
import OrderedCollection, { type OrderedCollectionChildData } from "@components/misc/OrderedCollection";
import { shallowEqual } from "@utils";
import classNames from "classnames";
import { useCallback, useMemo, useState, type PointerEventHandler, type PropsWithChildren } from "react";
import { useMultiElementRef, useWindowEventListener } from "react-dom-event-hooks";
import type { ContentData } from "../../layouts/Content";

import "./style.scss";

export interface MenubarProps extends PropsWithChildren
{
	icon?: IconDefinition,
	className?: string
}

export default function MenubarRender(props: MenubarProps)
{
	const dataset = Object.fromEntries(Object.entries(props).filter(([name]) => name.startsWith("data-")));
	const [contentProps, setContentProps] = useState<OrderedCollectionChildData<MenuSectionData | ContentData>[]>([]);
	const sections = useMemo(() => contentProps.filter((props): props is OrderedCollectionChildData<MenuSectionData> => props.orderedCollectionName === "MenuSection"), [contentProps]);
	const content = useMemo(() => contentProps.filter((props): props is OrderedCollectionChildData<ContentData> => props.orderedCollectionName === "Content").at(0), [contentProps]);
	const [open, setOpen] = useState<string>();
	const {saveRef: saveMenuRef, ref: menuRefs} = useMultiElementRef();
	const onPointerDown = useCallback<PointerEventHandler<HTMLButtonElement>>(event => event.stopPropagation(), []);
	const icon = useMemo(() => convertIconDefinition(props.icon), [props.icon]);

	useWindowEventListener("pointerdown", event =>
	{
		if (!(event.target instanceof Node))
			return;
		if (open && (!Array.from(menuRefs.current.values()).some(ref => ref.contains(event.target as Node))))
			setOpen(undefined);
	});
	useWindowEventListener("click", event =>
	{
		if (!(event.target instanceof Node))
			return;
		if (open && (!event.target.parentElement?.parentElement?.classList.contains("selectable") || !Array.from(menuRefs.current.values()).some(ref => ref.contains(event.target as Node))))
			setOpen(undefined);
	});

	return (
		<div {...dataset} className={classNames("Menubar", props.className)}>
			{icon && <div className="icon">{icon}</div>}
			<div className="container">
				{sections.map(props =>
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
			</div>
			{!!content && <div className={classNames("content", content.className)} style={content.style} {...content.dataset}>{content.children}</div>}
			<OrderedCollection<MenuSectionData | ContentData> childName={["MenuSection", "Content"]} onChildrenChange={setContentProps} compareChild={shallowEqual}>{props.children}</OrderedCollection>
		</div>
	)
}
