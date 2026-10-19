import type { SVGProps } from "react";

export const ShapeArchPath = "M 320 267.074 C 320 273.505 320 276.726 319.674 279.432 C 317.168 300.537 300.537 317.168 279.432 319.674 C 276.726 320 273.505 320 267.074 320 L 52.927 320 C 46.494 320 43.277 320 40.573 319.674 C 19.468 317.168 2.829 300.537 0.321 279.432 C 0 276.726 0 273.505 0 267.074 L 0 160 C 0 71.632 71.635 0 160 0 C 248.368 0 320 71.632 320 160 L 320 267.074 Z";

export default function ShapeArch(props: SVGProps<SVGSVGElement>)
{
	return (
		<svg width="320" height="320" viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
			<path d={ShapeArchPath} fill="currentcolor"/>
		</svg>
	);
}
