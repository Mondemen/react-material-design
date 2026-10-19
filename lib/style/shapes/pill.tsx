import type { SVGProps } from "react";

export const ShapePillPath = "M 89.86 47.77 C 140.22 -2.59 221.87 -2.59 272.23 47.77 C 322.59 98.13 322.59 179.78 272.23 230.14 L 230.14 272.23 C 179.78 322.59 98.13 322.59 47.77 272.23 C -2.59 221.87 -2.59 140.22 47.77 89.86 L 89.86 47.77 Z";

export default function ShapePill(props: SVGProps<SVGSVGElement>)
{
	return (
		<svg width="320" height="320" viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
			<path d={ShapePillPath} fill="currentcolor"/>
		</svg>
	);
}
