import type { SVGProps } from "react";

export const ShapeGhostIshPath = "M 0 152.381 C 0 68.223 71.634 0 160 0 C 248.365 0 320 68.223 320 152.381 L 320 259.047 C 320 292.711 291.346 320 256 320 C 245.523 320 235.635 317.602 226.905 313.353 C 222.458 311.186 218.02 308.813 213.563 306.428 C 197.88 298.038 181.964 289.524 164.555 289.524 L 155.445 289.524 C 138.036 289.524 122.12 298.038 106.437 306.428 C 101.98 308.813 97.542 311.186 93.095 313.353 C 84.365 317.602 74.477 320 64 320 C 28.654 320 0 292.711 0 259.047 L 0 152.381 Z";

export default function ShapeGhostIsh(props: SVGProps<SVGSVGElement>)
{
	return (
		<svg width="320" height="320" viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
			<path d={ShapeGhostIshPath} fill="currentcolor"/>
		</svg>
	);
}
