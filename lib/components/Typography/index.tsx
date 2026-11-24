import type { PolymorphicComponent } from "@misc/Polymorphic";
import Polymorphic from "@misc/Polymorphic";
import classNames from "classnames";
import { useMemo, type CSSProperties, type ElementType, type PropsWithChildren } from "react";

import "./style.scss";

const NativeProps: string[] =
[
	"type",
	"emphasized",
	"font",
	"weight",
	"size",
	"tracking",
	"lineHeight",
	"wght",
	"grad",
	"wdth",
	"rond",
	"opsz",
	"crsv",
	"slnt",
	"fill",
	"hexp"
];

export type TypographyRole = "display" | "headline" | "title" | "body" | "label";
export type TypographySize = "large" | "medium" | "small";

export interface TypographyBaseProps
{
	type?: `${TypographyRole}-${TypographySize}`,
	emphasized?: boolean,
	font?: string,
	weight?: number,
	size?: number,
	tracking?: number,
	lineHeight?: number,
	wght?: number,
	grad?: number,
	wdth?: number,
	rond?: number,
	opsz?: number,
	crsv?: number,
	slnt?: number,
	fill?: number,
	hexp?: number
}

export type TypographyProps<As extends ElementType = "span"> = PolymorphicComponent<"Typography", As, "span", TypographyBaseProps>;

export default function Typography<As extends ElementType = "span">(props: PropsWithChildren<TypographyProps<As>>)
{
	const classList = useMemo(() =>
	{
		const classList : Record<string, any>= {};

		classList["Typography"] = true;
		if (props.type)
			classList[props.type] = true;
		classList.emphasized = props.emphasized;
		return (classList);
	}, [props.emphasized, props.type]);
	const propsObject = useMemo(() =>
	{
		const propsExtra = {...props};
		const style: CSSProperties = {...props.style};

		propsExtra.className = classNames(classList, props.className);
		if (props.font !== undefined)
			style["--typescale-font"] = props.font;
		if (props.weight !== undefined)
			style["--typescale-weight"] = props.weight;
		if (props.size !== undefined)
			style["--typescale-size"] = `${props.size}px`;
		if (props.tracking !== undefined)
			style["--typescale-tracking"] = `${props.tracking}px`;
		if (props.lineHeight !== undefined)
			style["--typescale-line-height"] = `${props.lineHeight}px`;
		if (props.wght !== undefined)
			style["--typescale-wght"] = props.wght;
		if (props.grad !== undefined)
			style["--typescale-grad"] = props.grad;
		if (props.wdth !== undefined)
			style["--typescale-wdth"] = props.wdth;
		if (props.rond !== undefined)
			style["--typescale-rond"] = props.rond;
		if (props.opsz !== undefined)
			style["--typescale-opsz"] = props.opsz;
		if (props.crsv !== undefined)
			style["--typescale-crsv"] = props.crsv;
		if (props.slnt !== undefined)
			style["--typescale-slnt"] = props.slnt;
		if (props.fill !== undefined)
			style["--typescale-fill"] = props.fill;
		if (props.hexp !== undefined)
			style["--typescale-hexp"] = props.hexp;
		propsExtra.style = style;
		return (propsExtra);
	}, [classList, props]);

	return (
		<Polymorphic
			name="Typography"
			as={props.as}
			base="span"
			props={propsObject}
			excludePropsName={NativeProps}
		>
			{props.children}
		</Polymorphic>
)
}