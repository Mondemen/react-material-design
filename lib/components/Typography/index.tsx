import type { PolymorphicComponent } from "@components/misc/Polymorphic";
import Polymorphic from "@components/misc/Polymorphic";
import classNames from "classnames";
import { useMemo, type ElementType, type PropsWithChildren } from "react";

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

		propsExtra.className = classNames(classList, props.className);
		propsExtra.style = props.style ?? {};
		if (props.font !== undefined)
			propsExtra.style["--typescale-font"] = props.font;
		if (props.weight !== undefined)
			propsExtra.style["--typescale-weight"] = props.weight;
		if (props.size !== undefined)
			propsExtra.style["--typescale-size"] = `${props.size}px`;
		if (props.tracking !== undefined)
			propsExtra.style["--typescale-tracking"] = `${props.tracking}px`;
		if (props.lineHeight !== undefined)
			propsExtra.style["--typescale-line-height"] = `${props.lineHeight}px`;
		if (props.wght !== undefined)
			propsExtra.style["--typescale-wght"] = props.wght;
		if (props.grad !== undefined)
			propsExtra.style["--typescale-grad"] = props.grad;
		if (props.wdth !== undefined)
			propsExtra.style["--typescale-wdth"] = props.wdth;
		if (props.rond !== undefined)
			propsExtra.style["--typescale-rond"] = props.rond;
		if (props.opsz !== undefined)
			propsExtra.style["--typescale-opsz"] = props.opsz;
		if (props.crsv !== undefined)
			propsExtra.style["--typescale-crsv"] = props.crsv;
		if (props.slnt !== undefined)
			propsExtra.style["--typescale-slnt"] = props.slnt;
		if (props.fill !== undefined)
			propsExtra.style["--typescale-fill"] = props.fill;
		if (props.hexp !== undefined)
			propsExtra.style["--typescale-hexp"] = props.hexp;
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