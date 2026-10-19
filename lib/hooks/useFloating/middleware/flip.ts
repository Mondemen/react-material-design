import type { Alignment, DiagonalPlacement, FlipOptions, Middleware, Placement, Side } from "../types";
import { computeBaseCoords, getOppositeAlignment, getOppositeSide, parsePlacement } from "../utils";

function getDiagonalPlacementCandidates(placement: DiagonalPlacement, overflowX: boolean, overflowY: boolean)
{
	const map: Record<DiagonalPlacement, {flipX: Placement; flipY: Placement; flipBoth: Placement}> =
	{
		"top-left": {flipX: "top-right", flipY: "bottom-left", flipBoth: "bottom-right"},
		"top-right": {flipX: "top-left", flipY: "bottom-right", flipBoth: "bottom-left"},
		"bottom-left": {flipX: "bottom-right", flipY: "top-left", flipBoth: "top-right"},
		"bottom-right": {flipX: "bottom-left", flipY: "top-right", flipBoth: "top-left"}
	};
	const {flipX, flipY, flipBoth} = map[placement];

	if (overflowX && overflowY)
		return ([placement, flipBoth, flipX, flipY]);
	if (overflowX)
		return ([placement, flipX, flipBoth, flipY]);
	return ([placement, flipY, flipBoth, flipX]);
}

function getStandardPlacementCandidates(placement: Placement, overflowX: boolean, overflowY: boolean)
{
	const [side, alignment] = placement.split("-") as [Side, Alignment];
	const oppositeSide = getOppositeSide(side);
	const oppositeAlign = getOppositeAlignment(alignment);

	const isVertical = side === "top" || side === "bottom";
	const mainOverflow = isVertical ? overflowY : overflowX;
	const crossOverflow = isVertical ? overflowX : overflowY;
	const candidates: Placement[] = [placement, oppositeSide as Placement];

	const flipSide = `${oppositeSide}-${alignment}` as Placement; // Ex: bottom-start
	const flipAlign = `${side}-${oppositeAlign}` as Placement;   // Ex: top-end
	const flipBoth = `${oppositeSide}-${oppositeAlign}` as Placement;   // Ex: bottom-end

	if (!oppositeSide)
		return ([placement]);
	if (!alignment)
	{
		if (isVertical)
			candidates.push("left", "right");
		else
			candidates.push("top", "bottom");
		return (candidates);
	}
	if (!oppositeAlign)
		return ([placement, `${oppositeSide}-${alignment}` as Placement]);
	if (mainOverflow && crossOverflow)
		return ([placement, flipBoth, flipSide, flipAlign]);
	if (mainOverflow)
		return ([placement, flipSide, flipBoth, flipAlign]);
	if (crossOverflow)
		return ([placement, flipAlign, flipBoth, flipSide]);
	return ([placement, flipSide, flipAlign, flipBoth]);
}

export const flip = (options: FlipOptions = {}): Middleware => (state) =>
{
	const {padding = 0, offset = 0, fallbackPlacements = []} = options;
	const { x, y, placement, refRect, floatRect, hasFlipped, viewport } = state;
	const overflowX = viewport.left > x || (x + floatRect.width) > viewport.right;
	const overflowY = viewport.top > y || (y + floatRect.height) > viewport.bottom;
	const { isDiagonal } = parsePlacement(placement);
	let side: Side;
	let candidates = fallbackPlacements;
	let coords: DOMRect;
	let bestPlacement = placement;
	let bestX = x;
	let bestY = y;
	let checkX: number;
	let checkY: number;
	let minOverflow = Infinity;
	let totalOverflow: number;
	let overflowTop: number, overflowBottom: number, overflowLeft: number, overflowRight: number;

	if (hasFlipped)
		return ({});
	if (candidates.length === 0)
	{
		if (isDiagonal)
			candidates = getDiagonalPlacementCandidates(placement as DiagonalPlacement, overflowX, overflowY);
		else
			candidates = getStandardPlacementCandidates(placement, overflowX, overflowY);
	}
	if (options.allowedPlacements && options.allowedPlacements.length > 0)
		candidates = candidates.filter((p) => options.allowedPlacements?.includes(p));
	for (const targetPlacement of candidates)
	{
		checkX = state.x;
		checkY = state.y;
		if (targetPlacement !== placement)
		{
			coords = computeBaseCoords(refRect, floatRect, targetPlacement);
			checkX = coords.x;
			checkY = coords.y;
			if (offset > 0)
			{
				side = targetPlacement.split("-").at(0) as Side;
				if (side === "top")
					checkY -= offset;
				if (side === "bottom")
					checkY += offset;
				if (side === "left")
					checkX -= offset;
				if (side === "right")
					checkX += offset;
			}
		}

		overflowTop = Math.max(0, (viewport.top + padding) - checkY);
		overflowBottom = Math.max(0, (checkY + floatRect.height) - (viewport.bottom - padding));
		overflowLeft = Math.max(0, (viewport.left + padding) - checkX);
		overflowRight = Math.max(0, (checkX + floatRect.width) - (viewport.right - padding));
		totalOverflow = overflowTop + overflowBottom + overflowLeft + overflowRight;
		if (totalOverflow === 0)
		{
			if (targetPlacement === placement)
				return ({});
			return ({hasFlipped: true, reset: { placement: targetPlacement }, x: checkX, y: checkY});
		}
		if (totalOverflow < minOverflow)
		{
			minOverflow = totalOverflow;
			bestPlacement = targetPlacement;
			bestX = checkX;
			bestY = checkY;
		}
	}
	if (bestPlacement !== placement)
		return ({x: bestX, y: bestY, hasFlipped: true, reset: {placement: bestPlacement}});
	return ({});
};
