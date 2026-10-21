import type { ButtonGroupProps } from "@components/Button/group";
import ButtonGroupRender from "@components/Button/group/render";
import type { ContextMenuProps } from "@components/ContextMenu/render";
import ContextMenuRender from "@components/ContextMenu/render";
import OrderedCollection, { type OrderedCollectionChildData } from "@components/misc/OrderedCollection";
import type { ToolbarProps } from "@components/Toolbar";
import ToolbarRender from "@components/Toolbar/Toolbar.render";
import { shallowEqual } from "@utils";
import classNames from "classnames";
import { useCallback, useMemo, useState, type PropsWithChildren } from "react";
import type { ContentData } from "../Content";
import type { LayoutPadding } from "../types";

import "./style.scss";

export interface ToolboxProps extends PropsWithChildren, LayoutPadding {}

type ToolboxAcceptedComponent = ContentData | ToolbarProps | ButtonGroupProps | ContextMenuProps;

export default function Toolbox(props: ToolboxProps)
{
	const [contentProps, setContentProps] = useState<OrderedCollectionChildData<ToolboxAcceptedComponent>[]>([]);
	const acceptedChildren = useMemo(() => ["Content", "Toolbar", "ButtonGroup", "ContextMenu"], []);
	const content = useMemo(() => contentProps.filter((props): props is OrderedCollectionChildData<ContentData> => props.orderedCollectionName === "Content").at(0), [contentProps]);
	const toolbars = useMemo(() => contentProps.filter((props): props is OrderedCollectionChildData<ToolbarProps> => props.orderedCollectionName === "Toolbar"), [contentProps]);
	const buttonGroups = useMemo(() => contentProps.filter((props): props is OrderedCollectionChildData<ButtonGroupProps> => props.orderedCollectionName === "ButtonGroup"), [contentProps]);
	const contextMenus = useMemo(() => contentProps.filter((props): props is OrderedCollectionChildData<ContextMenuProps> => props.orderedCollectionName === "ContextMenu"), [contentProps]);
	const dockedToolbars = useMemo(() => toolbars.filter(toolbar => toolbar.variant === "docked"), [toolbars]);
	const floatingToolbars = useMemo(() => toolbars.filter(toolbar => toolbar.variant === "floating"), [toolbars]);
	const verticalFloatingToolbars = useMemo(() => floatingToolbars.filter(toolbar => toolbar.orientation === "vertical"), [floatingToolbars]);
	const horizontalFloatingToolbars = useMemo(() => floatingToolbars.filter(toolbar => !toolbar.orientation || toolbar.orientation === "horizontal"), [floatingToolbars]);
	const topButtonGroups = useMemo(() => buttonGroups.filter(props => props.position === "top"), [buttonGroups]);
	const bottomButtonGroups = useMemo(() => buttonGroups.filter(props => props.position === "bottom"), [buttonGroups]);
	const topTools = useMemo(() => topButtonGroups, [topButtonGroups]);
	const bottomTools = useMemo(() => [...dockedToolbars, ...horizontalFloatingToolbars, ...bottomButtonGroups], [dockedToolbars, horizontalFloatingToolbars, bottomButtonGroups]);
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
			case "ButtonGroup":
				return (<ButtonGroupRender key={props.id} {...props as ButtonGroupProps}/>);
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
			<div className={classNames("content", content?.className)} style={content?.style} {...content?.dataset}>
				{contextMenus.map(props => <ContextMenuRender key={props.id} {...props}/>)}
				{content?.children}
			</div>
			<OrderedCollection<ToolboxAcceptedComponent> name="Toolbox" childName={acceptedChildren} onChildrenChange={setContentProps} compareChild={shallowEqual}>{props.children}</OrderedCollection>
		</div>
	)
}