import ButtonProvider from "@components/Button/context";
import type { ButtonProps } from "@components/Button/default";
import ButtonRender from "@components/Button/default/render";
import type { IconButtonProps } from "@components/Button/icon";
import IconButtonRender from "@components/Button/icon/render";
import OrderedCollection, { type OrderedCollectionChildData } from "@components/misc/OrderedCollection";
import TextFieldRender, { type TextFieldProps } from "@components/TextField/TextField.render";
import { shallowEqual } from "@utils";
import classNames from "classnames";
import { useMemo, useState, type PropsWithChildren } from "react";
import NumberFieldRender, { type NumberFieldProps } from "@components/NumberField/NumberField.render";

import "./style.scss";

export interface BaseToolbarProps
{
	color?: "standard" | "vibrant"
}

export interface DockedToolbarProps extends BaseToolbarProps
{
	variant: "docked"
}

export interface FloatingToolbarProps extends BaseToolbarProps
{
	variant: "floating",
	orientation?: "horizontal" | "vertical",
	placement?: "left" | "center" | "right"
}

export type ToolbarProps = DockedToolbarProps | FloatingToolbarProps

export default function ToolbarRender(props: PropsWithChildren<ToolbarProps>)
{
	const {color = "standard"} = props;
	const [contentProps, setContentProps] = useState<OrderedCollectionChildData<ButtonProps | IconButtonProps | TextFieldProps | NumberFieldProps>[]>([]);
	// @ts-expect-error
	const acceptedChildren = useMemo(() => props.variant === "floating" && props.orientation === "vertical" ? "IconButton" : ["Button", "IconButton", "TextField", "NumberField"], [props.orientation, props.variant]);

	return (
		<div className={classNames("Toolbar", props.variant, color, props.variant === "floating" ? [props.orientation ?? "horizontal", props.placement ?? "center"] : "")}>
			<ButtonProvider color={{default: "text", icon: "standard"}} shape="round" width="default">
				{contentProps.map(props =>
				{
					switch (props.orderedCollectionName)
					{
						case "Button":
							return (<ButtonRender key={props.id} {...props as ButtonProps}/>);
						case "IconButton":
							return (<IconButtonRender key={props.id} {...props as IconButtonProps}/>);
						case "TextField":
							return (<TextFieldRender key={props.id} {...props as TextFieldProps}/>);
						case "NumberField":
							return (<NumberFieldRender key={props.id} {...props as NumberFieldProps}/>);
						default:
							return (null);
					}
				})}
				<OrderedCollection<ButtonProps | IconButtonProps | TextFieldProps | NumberFieldProps> name="Toolbar" childName={acceptedChildren} onChildrenChange={setContentProps} compareChild={shallowEqual}>{props.children}</OrderedCollection>
			</ButtonProvider>
		</div>
	)
}
