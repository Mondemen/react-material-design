import type { Middleware, OffsetOptions } from "../types";

export const offset = (options: number | OffsetOptions = {}): Middleware => (state) =>
{
	const {mainAxis = 0, crossAxis = 0} = typeof options === "number" ? { mainAxis: options } : options;
	let {x, y, placement} = state;

	switch (placement)
	{
		case "top":
		case "top-start":
		case "top-end":
			y -= mainAxis;
			x += crossAxis;
			break;
		case "bottom":
		case "bottom-start":
		case "bottom-end":
			y += mainAxis;
			x += crossAxis;
			break;
		case "left":
		case "left-start":
		case "left-end":
			x -= mainAxis;
			y += crossAxis;
			break;
		case "right":
		case "right-start":
		case "right-end":
			x += mainAxis;
			y += crossAxis;
			break;

		case "top-left":
			x -= crossAxis !== 0 ? crossAxis : mainAxis;
			y -= mainAxis;
			break;
		case "top-right":
			x += crossAxis !== 0 ? crossAxis : mainAxis;
			y -= mainAxis;
			break;
		case "bottom-left":
			x -= crossAxis !== 0 ? crossAxis : mainAxis;
			y += mainAxis;
			break;
		case "bottom-right":
			x += crossAxis !== 0 ? crossAxis : mainAxis;
			y += mainAxis;
			break;
	}

	return ({x, y});
};
