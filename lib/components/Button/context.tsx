import type { ButtonColor, ButtonWidth } from "@components/Button/default";
import type { IconButtonColor, IconButtonWidth } from "@components/Button/icon";
import type { CommonButtonColor, CommonButtonShape, CommonButtonWidth } from "@components/Button/types";
import { createContext, useContext, useMemo, type PropsWithChildren } from "react";

export interface ButtonProviderColors
{
	default?: ButtonColor,
	icon?: IconButtonColor
}
export interface ButtonProviderShapes
{
	default?: CommonButtonShape,
	icon?: CommonButtonShape
}
export interface ButtonProviderWidths
{
	default?: ButtonWidth,
	icon?: IconButtonWidth
}
export interface ButtonProviderProps
{
	color?: ButtonProviderColors | CommonButtonColor
	shape?: ButtonProviderShapes | CommonButtonShape,
	width?: ButtonProviderWidths | CommonButtonWidth
}
export interface ButtonContext extends ButtonProviderProps
{
	getColor(type: keyof ButtonProviderColors): ButtonColor | IconButtonColor | undefined,
	getShape(type: keyof ButtonProviderShapes): CommonButtonShape | undefined,
	getWidth(type: keyof ButtonProviderWidths): ButtonWidth | IconButtonWidth | undefined,
}

export const ButtonContext = createContext<ButtonContext | null>(null);

export const useButtonContext = () => useContext(ButtonContext);

export default function ButtonProvider(props: PropsWithChildren<ButtonProviderProps>)
{
	const context = useMemo<ButtonContext>(() =>
	({
		color: props.color,
		shape: props.shape,
		width: props.width,
		getColor(type)
		{
			if (typeof props.color === "string")
				return (props.color);
			switch (type)
			{
				case "default": return (props.color?.default);
				case "icon": return (props.color?.icon);
			}
		},
		getShape(type)
		{
			if (typeof props.shape === "string")
				return (props.shape);
			switch (type)
			{
				case "default": return (props.shape?.default);
				case "icon": return (props.shape?.icon);
			}
		},
		getWidth(type)
		{
			if (typeof props.width === "string")
				return (props.width);
			switch (type)
			{
				case "default": return (props.width?.default);
				case "icon": return (props.width?.icon);
			}
		}
	}), [props.color, props.shape, props.width]);

	return (<ButtonContext value={context}>{props.children}</ButtonContext>)
}
