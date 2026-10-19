import type { SVGProps } from "react";

export const ShapeBunPath = "M 5 81.36 C 5 36.42 41.42 0 86.36 0 L 233.64 0 C 278.58 0 315 36.42 315 81.36 C 315 118.41 290.23 149.68 256.34 159.5 C 256.12 159.57 255.97 159.77 255.97 160 C 255.97 160.23 256.12 160.43 256.34 160.5 C 290.23 170.32 315 201.59 315 238.64 C 315 283.58 278.58 320 233.64 320 L 86.36 320 C 41.42 320 5 283.58 5 238.64 C 5 201.83 29.45 170.73 63 160.69 C 63.3 160.6 63.51 160.32 63.51 160 C 63.51 159.68 63.3 159.4 63 159.31 C 29.45 149.27 5 118.17 5 81.36 Z";

export default function ShapeBun(props: SVGProps<SVGSVGElement>)
{
	return (
		<svg width="320" height="320" viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
			<path d={ShapeBunPath} fill="currentcolor"/>
		</svg>
	);
}
