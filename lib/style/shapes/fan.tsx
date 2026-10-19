import type { SVGProps } from "react";

export const ShapeFanPath = "M 0 50.526 C 0 48.744 0 47.852 0.023 47.098 C 0.819 21.437 21.437 0.82 47.098 0.023 C 47.853 0 48.744 0 50.527 0 C 60.034 0 64.789 0 68.809 0.125 C 205.669 4.372 315.623 114.329 319.874 251.191 C 320 255.211 320 259.966 320 269.473 C 320 271.256 320 272.147 319.977 272.902 C 319.177 298.563 298.56 319.181 272.903 319.977 C 272.149 320 271.257 320 269.474 320 L 71.937 320 C 50.202 320 39.334 320 30.713 316.586 C 18.234 311.646 8.354 301.766 3.414 289.287 C 0 280.666 0 269.798 0 248.063 L 0 50.526 Z";

export default function ShapeFan(props: SVGProps<SVGSVGElement>)
{
	return (
		<svg width="320" height="320" viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
			<path d={ShapeFanPath} fill="currentcolor"/>
		</svg>
	);
}
