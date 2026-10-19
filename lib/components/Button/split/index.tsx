import classNames from "classnames";
import { useCallback, useState, type PropsWithChildren } from "react";
import Button from "../default";
import IconButton from "../icon";
import type { CommonButtonProps } from "../types";

import "./style.scss";

export interface SplitButtonProps extends Omit<CommonButtonProps, "shape" | "selectable">
{
	label: string
}

export default function SplitButton(props: PropsWithChildren<SplitButtonProps>)
{
	const [selected, setSelected] = useState(false);
	const onSelected = useCallback(() => setSelected(true), [])
	const onUnselected = useCallback(() => setSelected(false), [])

	return (
		<div className={classNames("SplitButton", {[props.size ?? "small"]: true})}>
			<div className="container">
				<Button color={props.color} size={props.size} label={props.label} className="leading"/>
				<IconButton
					color={props.color}
					size={props.size}
					icon="keyboard_arrow_down"
					className={classNames("trailing", {selected})}
					onMenuOpen={onSelected}
					onMenuClose={onUnselected}
					menuOpenBehavior="click"
				>
					{props.children}
				</IconButton>
			</div>
		</div>
	)
}