import Icon, { convertIconDefinition } from "@components/Icon/Icon";
import MenuRender, { type MenuPropsBase } from "@components/Menu/Menu.render";
import type { MenuItemData } from "@components/Menu/MenuItem";
import Polymorphic from "@components/misc/Polymorphic";
import StateLayer from "@components/misc/StateLayer";
import Transitionable from "@components/misc/Transitionable";
import classNames from "classnames";
import { useCallback, useState } from "react";

export const MenuItemNativeProps =
[
	"id",
	"text",
	"tooltip",
	"disabled",
	"icon",
	"test",
	"supportingText",
	"selectable",
	"selected",
	"onSelected",
];

export default function MenuItemRender(props: {item: MenuItemData, menuProps: MenuPropsBase})
{
	const {item: {subMenuGroups, onSelected, ...item}, menuProps} = props;
	const [selectedInternal, setSelectedInternal] = useState((item.selectable ? item.selected : undefined) ?? false);
	const selected = item.selectable ? (item.selected ?? selectedInternal) : false;
	const iconDefinition = ((typeof item?.icon === "function") ? item?.icon?.(selected ?? false) : item?.icon) ?? (selected ? "check" : undefined);
	const iconComponent = convertIconDefinition(iconDefinition);
	const text = (typeof item?.text === "function") ? item?.text?.(selected ?? false) : item?.text;
	const supportingText = (typeof item?.supportingText === "function") ? item?.supportingText?.(selected ?? false) : item?.supportingText;
	const propsExtra: typeof item = {...item};
	// const flipOptions = useMemo<FlipOptions>(() => ({allowedPlacements: ["left-start", "left-end", "right-start", "right-end"]}), []);
	const onClick = useCallback(() =>
	{
		if (!item.selectable)
			return;
		if (item.selected === undefined)
			setSelectedInternal(!selected);
		onSelected?.(!selected);
	}, [item.selectable, item.selected, onSelected, selected]);

	propsExtra.className = classNames("MenuItem", {selectable: item.selectable, selected, disabled: item.disabled}, item.className);
	propsExtra["aria-label"] = text;
	propsExtra.role = "button";
	propsExtra.onClick = item.onClick;
	return (
		<div className="item" onClick={onClick}>
			<Polymorphic
				key={item.id}
				name="MenuItem"
				as={item.as}
				base="button"
				props={propsExtra}
				excludePropsName={MenuItemNativeProps}
				disabled={item.disabled}
			>
				<StateLayer subLayer disabled={item.disabled}/>
				<Transitionable value={iconComponent} className="icon leading"/>
				<Transitionable value={text} className="text"/>
				<Transitionable value={supportingText} className="supporting-text"/>
				<div className="spacer"/>
				{!!subMenuGroups.length && <Transitionable value={<Icon name="arrow_right"/>} className="icon trailing"/>}
			</Polymorphic>
			{!!subMenuGroups.length &&
			(
				// <FloatingElement root={document.body} placement="right-start" flip={flipOptions} autoUpdate>
					<MenuRender menuProps={menuProps} groups={subMenuGroups}/>
				// </FloatingElement>
			)}
		</div>
	);
}
