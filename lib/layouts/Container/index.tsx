import classNames from "classnames";
import type { Property } from "csstype";
import type { PropsWithChildren } from "react";

import "./style.scss";

export interface ContainerProps
{
	orientation?: "horizontal" | "vertical",
	reverse?: boolean
	alignItems?: Property.AlignItems,
	justifyContent?: Property.JustifyContent,
	spacing?: 0 | 0.25 | 0.5 | 0.75 | 1 | 1.25 | 1.5 | 1.75 | 2 | 2.5 | 3 | 4 | 4.5 | 5 | 6 | 7 | 8 | 9,
	className?: string
}

export default function Container(props: PropsWithChildren<ContainerProps>)
{
	const {orientation = "vertical", justifyContent = "start", alignItems = "stretch", spacing = 0} = props;

	return (
		<div
			className={classNames("Container", orientation, {reverse: props.reverse}, props.className)}
			style={{justifyContent, alignItems, "--container-spacing": spacing}}
		>
			{props.children}
		</div>
	);
}
