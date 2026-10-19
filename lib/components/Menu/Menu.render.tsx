import MenuContainer from "@components/Menu/MenuContainer";
import type { MenuGroupData } from "@components/Menu/MenuGroup";
import { MenuGroupsRender } from "@components/Menu/MenuGroup.render";
import { cleanOrderedCollectionProps, type OrderedCollectionChildData } from "@components/misc/OrderedCollection";
import classNames from "classnames";
import { useId, useMemo, useState, type HTMLAttributes, type PropsWithChildren, type Ref } from "react";
import { useResizeObserver } from "react-dom-event-hooks";

import "./style.scss";

export interface MenuPropsBase
{
	color?: "standard" | "vibrant",
	layout?: "standard" | "grouped";
	density?: 0 | -1 | -2 | -3,
	className?: string
}

export interface MenuProps extends Omit<HTMLAttributes<HTMLDivElement>, "color">, MenuPropsBase
{
	ref?: Ref<HTMLDivElement>,
	menuProps?: MenuProps,
	groups?: OrderedCollectionChildData<MenuGroupData>[]
}

export default function MenuRender(props: PropsWithChildren<MenuProps>)
{
	const id = useId();
	const
	{
		ref,
		color = props.menuProps?.color ?? "standard",
		layout = props.menuProps?.layout ?? "standard",
		density = props.menuProps?.density ?? 0,
		groups: groupsExternal,
		menuProps: menuPropsExternal,
		...baseProps
	} = props;
	const [groupsInternal, setGroups] = useState<OrderedCollectionChildData<MenuGroupData>[]>([]);
	const groups = groupsExternal ?? groupsInternal;
	const [height, setHeight] = useState(0);
	const menuProps = useMemo<MenuPropsBase>(() => menuPropsExternal ?? ({color, layout, density, classNames: props.className}), [color, density, layout, menuPropsExternal, props.className]);
	const renderGroups = useMemo(() => <MenuGroupsRender groups={groups} menuProps={menuProps}/>, [groups, menuProps]);
	const render = useMemo(() => layout === "standard" ? <div className="MenuGroup container">{renderGroups}</div> : renderGroups, [layout, renderGroups]);
	const {saveRef} = useResizeObserver(([entry]) => setHeight(entry.borderBoxSize.at(0)?.blockSize ?? 0));

	return (
		<div {...useMemo(() => cleanOrderedCollectionProps(baseProps), [baseProps])} ref={ref} className={classNames("Menu", {"SubMenu": props.groups?.length, [`${layout}-layout`]: true, [`${color}-color`]: true, [`density${density}`]: density}, props.className)} data-key={props.id ?? id} style={{"--menu-height": `${height}px`}}>
			{!!groups.length && render}
			<div ref={saveRef} className="size-ref">{render}</div>
			{!groupsExternal && <MenuContainer setGroups={setGroups}>{props.children}</MenuContainer>}
		</div>
	);
}
