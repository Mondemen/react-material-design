import { convertIconDefinition, type IconDefinition } from "@components/Icon/Icon";
import { OrderedCollectionChild } from "@components/misc/OrderedCollection";
import { useContext, useMemo, type PropsWithChildren } from "react";
import { TabsContext } from "./Tabs";
import type { LayoutPadding } from "../types";

export interface TabProps extends PropsWithChildren, LayoutPadding
{
	id: string,
	label: string | ((current: boolean) => string),
	icon?: IconDefinition | ((current: boolean) => IconDefinition)
}

export interface TabData extends TabProps
{
	label: string,
	icon?: IconDefinition
}

export default function Tab(props: TabProps)
{
	const {label: labelProp, icon: iconProp} = props;
	const active = useContext(TabsContext);
	const label = useMemo(() => (typeof labelProp === "function") ? labelProp(active === props.id) : labelProp, [active, labelProp, props.id]);
	const iconDefinition = useMemo(() => (typeof iconProp === "function") ? iconProp(active === props.id) : iconProp, [active, iconProp, props.id]);
	const icon = useMemo(() => convertIconDefinition(iconDefinition), [iconDefinition]);
	const content = useMemo(() =>
	({
		id: props.id,
		label,
		icon,
		inlineContentPadding: props.inlineContentPadding,
		blockContentPadding: props.blockContentPadding,
		contentPadding: props.contentPadding,
		children: props.children
	}), [icon, label, props.blockContentPadding, props.children, props.contentPadding, props.id, props.inlineContentPadding]);

	return (<OrderedCollectionChild name="Tab" id={props.id} content={content}/>);
}
