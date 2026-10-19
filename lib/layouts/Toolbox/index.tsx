import type { ContextMenuProps } from "@components/ContextMenu/render";
import ContextMenuRender from "@components/ContextMenu/render";
import OrderedCollection, { type OrderedCollectionChildData } from "@components/misc/OrderedCollection";
import type { ToolbarProps } from "@components/Toolbar";
import ToolbarRender from "@components/Toolbar/Toolbar.render";
import { shallowEqual } from "@utils";
import classNames from "classnames";
import { Fragment, useCallback, useMemo, useState, type PropsWithChildren } from "react";
import type { ContentProps } from "../Content";
import type { LayoutPadding } from "../types";

import "./style.scss";

export interface ToolboxProps extends PropsWithChildren, LayoutPadding {}

type ToolboxAcceptedComponent = ContentProps | ToolbarProps | ContextMenuProps;

export default function Toolbox(props: ToolboxProps)
{
	const [contentProps, setContentProps] = useState<OrderedCollectionChildData<ToolboxAcceptedComponent>[]>([]);
	const acceptedChildren = useMemo(() => ["Content", "Toolbar", "ContextMenu"], []);
	const content = useMemo(() => contentProps.filter((props): props is OrderedCollectionChildData<ContentProps> => props.orderedCollectionName === "Content"), [contentProps]);
	const toolbars = useMemo(() => contentProps.filter((props): props is OrderedCollectionChildData<ToolbarProps> => props.orderedCollectionName === "Toolbar"), [contentProps]);
	const contextMenus = useMemo(() => contentProps.filter((props): props is OrderedCollectionChildData<ContextMenuProps> => props.orderedCollectionName === "ContextMenu"), [contentProps]);
	const dockedToolbars = useMemo(() => toolbars.filter(toolbar => toolbar.variant === "docked"), [toolbars]);
	const floatingToolbars = useMemo(() => toolbars.filter(toolbar => toolbar.variant === "floating"), [toolbars]);
	const verticalFloatingToolbars = useMemo(() => floatingToolbars.filter(toolbar => toolbar.orientation === "vertical"), [floatingToolbars]);
	const horizontalFloatingToolbars = useMemo(() => floatingToolbars.filter(toolbar => !toolbar.orientation || toolbar.orientation === "horizontal"), [floatingToolbars]);
	const topTools = useMemo(() => [], []);
	const bottomTools = useMemo(() => [...dockedToolbars, ...horizontalFloatingToolbars], [dockedToolbars, horizontalFloatingToolbars]);
	const leftTools = useMemo(() => verticalFloatingToolbars, [verticalFloatingToolbars]);
	const rightTools = useMemo(() => [], []);
	const inlineContentPadding = props.inlineContentPadding ?? props.contentPadding ?? false;
	const blockContentPadding = props.blockContentPadding ?? props.contentPadding ?? false;
	const renderTool = useCallback((props: (typeof contentProps)[number]) =>
	{
		switch (props.orderedCollectionName)
		{
			case "Toolbar":
				return (<ToolbarRender key={props.id} {...props as ToolbarProps}/>);
			default:
				return (null);
		}
	}, []);

	return (
		<div className={classNames("Toolbox", {"inline-padding": inlineContentPadding, "block-padding": blockContentPadding})}>
			{!!topTools.length && <div className="tools top">{topTools.map(renderTool)}</div>}
			{!!bottomTools.length && <div className="tools bottom">{bottomTools.map(renderTool)}</div>}
			{!!leftTools.length && <div className="tools left">{leftTools.map(renderTool)}</div>}
			{!!rightTools.length && <div className="tools right">{rightTools.map(renderTool)}</div>}
			<div className="content">
				{contextMenus.map(props => <ContextMenuRender key={props.id} {...props}/>)}
				{content.map(content => <Fragment key={content.id}>{content.children}</Fragment>)}
			</div>
			<OrderedCollection<ToolboxAcceptedComponent> name="Toolbox" childName={acceptedChildren} onChildrenChange={setContentProps} compareChild={shallowEqual}>{props.children}</OrderedCollection>
		</div>
	)
}