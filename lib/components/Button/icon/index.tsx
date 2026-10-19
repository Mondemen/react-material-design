import IconButtonRender from "@components/Button/icon/render";
import { type IconDefinition } from "@components/Icon/Icon";
import { OrderedCollectionChild, useOrderedCollection } from "@components/misc/OrderedCollection";
import { type PolymorphicComponent } from "@components/misc/Polymorphic";
import { type ElementType, type ReactNode, type Ref } from "react";
import { type CommonButtonColor, type CommonButtonProps, type CommonButtonWidth, type CommonSelectableButtonProps } from "../types";

import "./style.scss";

export type IconButtonColor = CommonButtonColor | "standard";
export type IconButtonWidth = CommonButtonWidth | "narrow" | "wide";

export interface DefaultIconButtonProps extends Omit<CommonButtonProps, "color">
{
	color?: IconButtonColor,
	icon: IconDefinition | (() => IconDefinition),
	width?: IconButtonWidth,
	tooltip?: ReactNode,
	menuRef?: Ref<HTMLDivElement>,
	menuOpenBehavior?: "manual" | "hover" | "click",
	menuOpen?: boolean,
	onMenuOpen?: () => void,
	onMenuClose?: () => void
}

export interface SelectableIconButtonProps extends Omit<DefaultIconButtonProps, "selectable" | "icon">, CommonSelectableButtonProps
{
	icon: IconDefinition | ((selected: boolean) => IconDefinition)
}

export type IconButtonProps<As extends ElementType = "button"> = PolymorphicComponent<"IconButton", As, "button", DefaultIconButtonProps | SelectableIconButtonProps>;

export default function IconButton<As extends ElementType = "button">(props: IconButtonProps<As>)
{
	const orderedCollection = useOrderedCollection();

	if (orderedCollection)
		return (<OrderedCollectionChild name="IconButton" content={props}/>);
	return (<IconButtonRender {...props}/>);
}
