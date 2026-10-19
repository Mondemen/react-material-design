import type { getComponentSizeName } from "../types";

export type CommonButtonColor = "filled" | "tonal" | "tertiary" | "outlined" | "success" | "error";
export type CommonButtonShape = "round" | "square";
export type CommonButtonWidth = "default";

export interface CommonButtonProps
{
	color?: CommonButtonColor
	size?: Parameters<typeof getComponentSizeName>[0],
	shape?: CommonButtonShape,
	disabled?: boolean,
	emphasized?: boolean,
	selectable?: false,
	density?: 0 | -1 | -2 | -3
}

export interface CommonSelectableButtonProps
{
	selectable: true,
	selected?: boolean,
	defaultSelected?: boolean,
	onSelected?: (selected: boolean) => void
}
