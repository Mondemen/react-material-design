import type { Middleware, ShiftOptions } from "../types";
import { parsePlacement } from "../utils";

export const shift = (options: number | ShiftOptions = {}): Middleware => (state) =>
{
	const { x, y, placement, viewport, refRect, floatRect } = state;
	const { side, isDiagonal } = parsePlacement(placement);
	const isVertical = side === "top" || side === "bottom";
	const opts: ShiftOptions = typeof options === "number" ? { padding: options } : options;
	const padding = opts.padding ?? 8;
	const crossAxis = opts.crossAxis ?? true;
	const mainAxis = opts.mainAxis ?? false;
	const limit = typeof opts.limitShift === "number" ? opts.limitShift : (opts.limitShift ? 0 : null);
	let minX = viewport.left + padding;
	let maxX = viewport.right - floatRect.width - padding;
	let minY = viewport.top + padding;
	let maxY = viewport.bottom - floatRect.height - padding;
	let newX = x, newY = y;
	let limitMinX: number, limitMaxX: number, limitMinY: number, limitMaxY: number;

	if (limit !== null)
	{
		limitMinX = refRect.left - floatRect.width + limit;
		limitMaxX = refRect.right + limit;
		limitMinY = refRect.top - floatRect.height + limit;
		limitMaxY = refRect.bottom + limit;
		if (limitMinX <= limitMaxX)
		{
			minX = Math.max(minX, limitMinX);
			maxX = Math.min(maxX, limitMaxX);
		}
		if (limitMinY <= limitMaxY)
		{
			minY = Math.max(minY, limitMinY);
			maxY = Math.min(maxY, limitMaxY);
		}
	}
	minX = Math.min(minX, maxX);
	minY = Math.min(minY, maxY);
	if (isDiagonal)
	{
		if (mainAxis || crossAxis)
		{
			newX = Math.max(minX, Math.min(newX, maxX));
			newY = Math.max(minY, Math.min(newY, maxY));
		}
	}
	else
	{
		if ((isVertical && crossAxis) || (!isVertical && mainAxis))
			newX = Math.max(minX, Math.min(newX, maxX));
		if ((isVertical && mainAxis) || (!isVertical && crossAxis))
			newY = Math.max(minY, Math.min(newY, maxY));
	}
	return ({ x: newX, y: newY });
};
