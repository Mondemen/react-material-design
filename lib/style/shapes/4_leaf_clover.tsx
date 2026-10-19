import type { SVGProps } from "react";

export const ShapeLeafClover4Path = "M 22.702 160 C 8.54 143.07 0 121.222 0 97.362 C 0 43.59 43.362 0 96.864 0 C 121.07 0 143.21 8.93 160.184 23.686 C 177.124 8.93 199.21 0 223.362 0 C 276.736 0 320 43.59 320 97.362 C 320 121.222 311.482 143.07 297.352 160 C 311.482 176.93 320 198.778 320 222.638 C 320 276.41 276.736 320 223.362 320 C 199.21 320 177.124 311.07 160.184 296.314 C 143.21 311.07 121.07 320 96.864 320 C 43.362 320 0 276.41 0 222.638 C 0 198.778 8.54 176.93 22.702 160 Z";

export default function ShapeLeafClover4(props: SVGProps<SVGSVGElement>)
{
	return (
		<svg width="320" height="320" viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
			<path d={ShapeLeafClover4Path} fill="currentcolor"/>
		</svg>
	);
}
