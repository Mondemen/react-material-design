import type { CSSProperties } from "react";

const IS_UNITLESS_PROPERTY: Record<string, boolean> =
{
	animationIterationCount: true, borderImageOutset: true, borderImageSlice: true,
	borderImageWidth: true, boxFlex: true, boxFlexGroup: true, boxOrdinalGroup: true,
	columnCount: true, columns: true, flex: true, flexGrow: true, flexPositive: true,
	flexShrink: true, flexNegative: true, flexOrder: true, gridArea: true,
	gridRow: true, gridRowEnd: true, gridRowSpan: true, gridRowStart: true,
	gridColumn: true, gridColumnEnd: true, gridColumnSpan: true, gridColumnStart: true,
	fontWeight: true, lineClamp: true, lineHeight: true, opacity: true,
	order: true, orphans: true, tabSize: true, widows: true, zIndex: true,
	zoom: true, fillOpacity: true, floodOpacity: true, stopOpacity: true,
	strokeDasharray: true, strokeDashoffset: true, strokeMiterlimit: true,
	strokeOpacity: true, strokeWidth: true
};

export function convertReactStyleToDomStyle(reactStyle: CSSProperties)
{
	const domStyle: Record<string, string> = {};
	let kebabKey: string;
	let finalValue: string;

	if (!reactStyle || typeof reactStyle !== "object")
		return ({});
	for (const [key, value] of Object.entries(reactStyle))
	{
		if (value === null || value === undefined || value === "")
			continue;
		finalValue = value;
		if (typeof value === "number" && value !== 0 && !IS_UNITLESS_PROPERTY[key])
			finalValue = `${value}px`;
		kebabKey = key.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
		if (kebabKey.startsWith("ms-"))
			kebabKey = "-" + kebabKey;
		domStyle[kebabKey] = finalValue;
	}
	return (domStyle);
}
