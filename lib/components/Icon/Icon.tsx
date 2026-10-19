import classNames from "classnames";
import React, { createContext, useContext, useMemo } from "react";
import type {MaterialSymbol} from "material-symbols";

import "material-symbols/index.css";
import "./style.scss";

export interface IconProps
{
	name: MaterialSymbol,
	type?: "outlined" | "rounded" | "sharp",
	fill?: boolean,
	emphasis?: "low" | "normal" | "high",
	size?: number,
	opticalSize?: number,
	weight?: number,
	className?: string
}
export type IconDefinition = MaterialSymbol | React.ReactElement<IconProps> | null | undefined;

export type IconContextData = Omit<IconProps, "name" | "className">;

export function convertIconDefinition(icon: IconDefinition)
{
	if (typeof icon === "string")
		return (<Icon name={icon}/>);
	if (React.isValidElement(icon))
		return (icon);
	return (null);
}

const IconContext = createContext<IconContextData | null>(null);
export const useIconContext = () => useContext(IconContext);

export default function Icon(props: IconProps)
{
	const context = useIconContext();
	const size = typeof props.size === "number" ? `${props.size}px` : props.size;
	const opticalSize = props.opticalSize ?? (typeof props.size === "string" ? parseFloat(props.size) : props.size);
	const grade = props.emphasis === "low" ? -25 : (props.emphasis === "high" ? 200 : undefined);
	const contextGrade = context?.emphasis === "low" ? -25 : (context?.emphasis === "high" ? 200 : undefined);
	const classList = useMemo(() =>
	({
		[(!context ? props.type : context.type) ?? "outlined"]: true,
		fill: !context ? props.fill : context.fill
	}), [context, props.fill, props.type]);
	const style = useMemo(() =>
	({
		"--md-comp-icon-size": !context ? size :  (typeof context.size === "number" ? `${context.size}px` : context.size),
		"--md-comp-icon-weight": !context ? props.weight : context.weight,
		"--md-comp-icon-grade": !context ? grade : contextGrade,
		"--md-comp-icon-optical-size": !context ? opticalSize : context.opticalSize
	}), [context, contextGrade, grade, opticalSize, props.weight, size]);

	// if (!MaterialSymbols.includes(props.name))
	// 	throw new TypeError(`Unknown icon name "${props.name}"`);
	return (
		<span className={classNames("Icon", classList, props.className)} style={style}>
			{props.name}
		</span>
	);
}

export function IconProvider(props: React.PropsWithChildren<IconContextData>)
{
	return (<IconContext.Provider value={props}>{props.children}</IconContext.Provider>)
}
