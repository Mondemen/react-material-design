import type { SVGProps } from "react";

export const ShapePixelTrianglePath = "M 91.64 0 L 36 0 L 36 320 L 91.64 320 L 91.64 292.174 L 134.56 292.174 L 134.56 265.739 L 179.08 265.739 L 179.08 235.13 L 215.64 235.13 L 215.64 210.086 L 252.21 210.086 L 252.21 179.478 L 284 179.478 L 284 140.522 L 252.21 140.522 L 252.21 109.912 L 215.64 109.912 L 215.64 84.869 L 179.08 84.869 L 179.08 54.261 L 134.56 54.261 L 134.56 27.826 L 91.64 27.826 L 91.64 0 Z";

export default function ShapePixelTriangle(props: SVGProps<SVGSVGElement>)
{
	return (
		<svg width="320" height="320" viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
			<path d={ShapePixelTrianglePath} fill="currentcolor"/>
		</svg>
	);
}
