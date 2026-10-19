import type { Middleware, MiddlewareState } from "@hooks/useFloating/types";

export interface SizeOptions
{
	padding?: number,
	apply: (availableWidth: number, availableHeight: number, state: MiddlewareState) => void
}

export const size = (options: SizeOptions): Middleware => (state) =>
{
	const { placement, x, y, floatRect, viewport } = state;
	const padding = options.padding ?? 0;
	const [side] = placement.split("-");
	let availableWidth = viewport.width - padding * 2;
	let availableHeight = viewport.height - padding * 2;

	if (side === "top")
		availableHeight = Math.max(0, (y + floatRect.height) - viewport.top - padding);
	else if (side === "bottom")
		availableHeight = Math.max(0, viewport.bottom - y - padding);
	else if (side === "left")
		availableWidth = Math.max(0, (x + floatRect.width) - viewport.left - padding);
	else if (side === "right")
		availableWidth = Math.max(0, viewport.right - x - padding);
	options.apply(availableWidth, availableHeight, state);
	return ({});
};
