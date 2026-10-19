import type { SVGProps } from "react";

export const ShapeOvalPath = "M 241.309 241.31 C 171.705 310.91 78.877 330.94 33.971 286.03 C -10.935 241.12 9.087 148.29 78.691 78.69 C 148.295 9.09 241.123 -10.94 286.029 33.97 C 330.935 78.88 310.913 171.71 241.309 241.31 Z";

export default function ShapeOval(props: SVGProps<SVGSVGElement>)
{
	return (
		<svg width="320" height="320" viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
			<path d={ShapeOvalPath} fill="currentcolor"/>
		</svg>
	);
}
