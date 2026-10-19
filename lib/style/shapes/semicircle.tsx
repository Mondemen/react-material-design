import type { SVGProps } from "react";

export const ShapeSemicirclePath = "M 320 226.92 C 320 245.19 305.19 260 286.921 260 L 33.079 260 C 14.81 260 0 245.19 0 226.92 L 0 220 C 0 131.63 71.634 60 160 60 C 248.366 60 320 131.63 320 220 L 320 226.92 Z";

export default function ShapeSemicircle(props: SVGProps<SVGSVGElement>)
{
	return (
		<svg width="320" height="320" viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
			<path d={ShapeSemicirclePath} fill="currentcolor"/>
		</svg>
	);
}
