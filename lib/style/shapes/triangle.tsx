import type { SVGProps } from "react";

export const ShapeTrianglePath = "M 105.783 67.038 C 121.111 40.324 128.775 26.967 138.068 21.327 C 151.542 13.144 168.458 13.144 181.932 21.327 C 191.225 26.967 198.889 40.324 214.217 67.038 L 297.022 211.362 C 312.202 237.823 319.792 251.048 319.993 261.853 C 320.283 277.529 311.847 292.071 298.09 299.605 C 288.601 304.81 273.336 304.81 242.805 304.81 L 77.195 304.81 C 46.664 304.81 31.398 304.81 21.91 299.605 C 8.152 292.071 -0.284 277.529 0.007 261.853 C 0.208 251.048 7.797 237.823 22.978 211.362 L 105.783 67.038 Z";

export default function ShapeTriangle(props: SVGProps<SVGSVGElement>)
{
	return (
		<svg width="320" height="320" viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
			<path d={ShapeTrianglePath} fill="currentcolor"/>
		</svg>
	);
}
