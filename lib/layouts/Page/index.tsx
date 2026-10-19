import type { ContextMenuProps } from "@components/ContextMenu/render";
import ContextMenuRender from "@components/ContextMenu/render";
import type { MenubarProps } from "@components/Menubar/render";
import MenubarRender from "@components/Menubar/render";
import OrderedCollection, { type OrderedCollectionChildData } from "@components/misc/OrderedCollection";
import type { ToolbarProps } from "@components/Toolbar";
import ToolbarRender from "@components/Toolbar/Toolbar.render";
import { shallowEqual } from "@utils";
import classNames from "classnames";
import { Fragment, useCallback, useMemo, useState, type PropsWithChildren } from "react";
import type { ContentProps } from "../Content";

import "./style.scss";

export interface PageProps extends PropsWithChildren
{
	contentPadding?: boolean,
	inlineContentPadding?: boolean,
	blockContentPadding?: boolean
}

type PageAcceptedComponent = ContentProps | MenubarProps | ToolbarProps | ContextMenuProps;

export default function Page(props: PageProps)
{
	const [contentProps, setContentProps] = useState<OrderedCollectionChildData<PageAcceptedComponent>[]>([]);
	const acceptedChildren = useMemo(() => ["Content", "Menubar", "Toolbar", "ContextMenu"], []);
	const content = useMemo(() => contentProps.filter((props): props is OrderedCollectionChildData<ContentProps> => props.orderedCollectionName === "Content"), [contentProps]);
	const menubars = useMemo(() => contentProps.filter((props): props is OrderedCollectionChildData<MenubarProps> => props.orderedCollectionName === "Menubar"), [contentProps]);
	const toolbars = useMemo(() => contentProps.filter((props): props is OrderedCollectionChildData<ToolbarProps> => props.orderedCollectionName === "Toolbar"), [contentProps]);
	const contextMenus = useMemo(() => contentProps.filter((props): props is OrderedCollectionChildData<ContextMenuProps> => props.orderedCollectionName === "ContextMenu"), [contentProps]);
	const dockedToolbars = useMemo(() => toolbars.filter(toolbar => toolbar.variant === "docked"), [toolbars]);
	const floatingToolbars = useMemo(() => toolbars.filter(toolbar => toolbar.variant === "floating"), [toolbars]);
	const verticalFloatingToolbars = useMemo(() => floatingToolbars.filter(toolbar => toolbar.orientation === "vertical"), [floatingToolbars]);
	const horizontalFloatingToolbars = useMemo(() => floatingToolbars.filter(toolbar => !toolbar.orientation || toolbar.orientation === "horizontal"), [floatingToolbars]);
	const topTools = useMemo(() => menubars, [menubars]);
	const bottomTools = useMemo(() => [...dockedToolbars, ...horizontalFloatingToolbars], [dockedToolbars, horizontalFloatingToolbars]);
	const leftTools = useMemo(() => verticalFloatingToolbars, [verticalFloatingToolbars]);
	const rightTools = useMemo(() => [], []);
	const inlineContentPadding = props.inlineContentPadding ?? props.contentPadding ?? false;
	const blockContentPadding = props.blockContentPadding ?? props.contentPadding ?? false;
	const renderTool = useCallback((props: (typeof contentProps)[number]) =>
	{
		switch (props.orderedCollectionName)
		{
			case "Menubar":
				return (<MenubarRender key={props.id} {...props as MenubarProps}/>);
			case "Toolbar":
				return (<ToolbarRender key={props.id} {...props as ToolbarProps}/>);
			default:
				return (null);
		}
	}, []);

	return (
		<div className={classNames("Page", {"inline-padding": inlineContentPadding, "block-padding": blockContentPadding})}>
			{!!topTools.length && <div className="tools top">{topTools.map(renderTool)}</div>}
			{!!bottomTools.length && <div className="tools bottom">{bottomTools.map(renderTool)}</div>}
			{!!leftTools.length && <div className="tools left">{leftTools.map(renderTool)}</div>}
			{!!rightTools.length && <div className="tools right">{rightTools.map(renderTool)}</div>}
			<div className="content">
				{contextMenus.map(props => <ContextMenuRender key={props.id} {...props}/>)}
				{content.map(content => <Fragment key={content.id}>{content.children}</Fragment>)}
			</div>
			<OrderedCollection<PageAcceptedComponent> name="Page" childName={acceptedChildren} onChildrenChange={setContentProps} compareChild={shallowEqual}>{props.children}</OrderedCollection>
		</div>
	)
}