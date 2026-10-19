import ButtonRender from "@components/Button/default/render";
import { type CommonButtonColor, type CommonButtonProps, type CommonButtonWidth, type CommonSelectableButtonProps } from "@components/Button/types";
import { type IconDefinition } from "@components/Icon/Icon";
import { OrderedCollectionChild, useOrderedCollection } from "@components/misc/OrderedCollection";
import { type PolymorphicComponent } from "@components/misc/Polymorphic";
import type { TooltipProps } from "@components/Tooltip";
import type { ElementType, ReactElement, Ref } from "react";

import "./style.scss";

export type ButtonColor = "elevated" | CommonButtonColor | "text";
export type ButtonWidth = CommonButtonWidth | "stretch";

export interface DefaultButtonProps extends Omit<CommonButtonProps, "color">
{
	color?: ButtonColor,
	label: string | (() => string),
	icon?: IconDefinition | (() => IconDefinition),
	width?: ButtonWidth,
	title?: string | ReactElement<TooltipProps>,
	menuRef?: Ref<HTMLDivElement>,
	menuOpenBehavior?: "manual" | "hover" | "click",
	menuOpen?: boolean,
	onMenuOpen?: () => void,
	onMenuClose?: () => void
}

export interface SelectableButtonProps extends Omit<DefaultButtonProps, "color" | "selectable" | "label" | "icon">, CommonSelectableButtonProps
{
	color?: Exclude<DefaultButtonProps["color"], "text">,
	label: string | ((selected: boolean) => string),
	icon?: IconDefinition | ((selected: boolean) => IconDefinition)
}

export type ButtonProps<As extends ElementType = "button"> = PolymorphicComponent<"Button", As, "button", DefaultButtonProps | SelectableButtonProps>;

export default function Button<As extends ElementType = "button">(props: ButtonProps<As>)
{
	const orderedCollection = useOrderedCollection();

	if (orderedCollection)
		return (<OrderedCollectionChild name="Button" content={props}/>);
	return (<ButtonRender {...props}/>);
}
