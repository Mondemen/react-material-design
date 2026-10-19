import type { SVGProps } from "react";

export const ShapeHeartPath = "M 251.1 17.13 C 229.439 17.13 210.113 27.3 197.481 43.2 L 160 84.51 L 160 84.38 L 122.519 43.06 C 109.887 27.17 90.561 17 68.9 17 C 30.848 17 0 48.37 0 87.06 C 0 121.06 28.375 146.47 48.919 170.88 C 69.389 195.21 89.856 219.52 110.323 243.84 L 156.272 298.44 C 157.516 299.91 158.756 301.39 160 302.87 L 160 303 C 161.244 301.52 162.484 300.05 163.728 298.57 C 179.043 280.37 194.358 262.18 209.677 243.98 C 230.144 219.66 250.614 195.34 271.081 171.02 C 291.625 146.61 320 121.2 320 87.19 C 320 48.5 289.152 17.13 251.1 17.13 Z";

export default function ShapeHeart(props: SVGProps<SVGSVGElement>)
{
	return (
		<svg width="320" height="320" viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
			<path d={ShapeHeartPath} fill="currentcolor"/>
		</svg>
	);
}
