import type { SVGProps } from "react";

export const ShapeSidedCookie4Path = "M 33 160 C 19.9 144.34 12 124.13 12 102.06 C 12 52.32 52.11 12 101.6 12 C 123.99 12 144.47 20.26 160.17 33.91 C 175.84 20.26 196.27 12 218.61 12 C 267.98 12 308 52.32 308 102.06 C 308 124.13 300.12 144.34 287.05 160 C 300.12 175.66 308 195.87 308 217.94 C 308 267.68 267.98 308 218.61 308 C 196.27 308 175.84 299.74 160.17 286.09 C 144.47 299.74 123.99 308 101.6 308 C 52.11 308 12 267.68 12 217.94 C 12 195.87 19.9 175.66 33 160 Z";

export default function ShapeSidedCookie4(props: SVGProps<SVGSVGElement>)
{
	return (
		<svg width="320" height="320" viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
			<path d={ShapeSidedCookie4Path} fill="currentcolor"/>
		</svg>
	);
}
