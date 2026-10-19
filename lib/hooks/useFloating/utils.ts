import type { VirtualElement } from "@hooks/useFloating";
import type { Alignment, DiagonalPlacement, Placement, Side } from "./types";

export function parsePlacement(placement: Placement)
{
	const isDiagonal = ["top-left", "top-right", "bottom-left", "bottom-right"].includes(placement);
	const [side, alignment] = placement.split("-") as [Side, Alignment | undefined];

	if (isDiagonal)
		return ({side: placement as DiagonalPlacement, isDiagonal: true});
	return ({side, alignment, isDiagonal: false});
}

export function getOppositeSide(side: Side)
{
	const sides: Record<Side, Side> = {top: "bottom", bottom: "top", left: "right", right: "left"};

	return (sides[side]);
}
export function getOppositeAlignment(alignment: Alignment)
{
	const alignments: Record<Alignment, Alignment> = {start: "end", end: "start"};

	return (alignments[alignment]);
}

export function getDiagonalCandidates(placement: DiagonalPlacement, overflowX: boolean, overflowY: boolean)
{
	const map: Record<DiagonalPlacement, {flipX: Placement; flipY: Placement; flipBoth: Placement}> =
	{
		"top-left": {flipX: "top-right", flipY: "bottom-left", flipBoth: "bottom-right"},
		"top-right": {flipX: "top-left", flipY: "bottom-right", flipBoth: "bottom-left"},
		"bottom-left": {flipX: "bottom-right", flipY: "top-left", flipBoth: "top-right"},
		"bottom-right": {flipX: "bottom-left", flipY: "top-right", flipBoth: "top-left"}
	};
	const { flipX, flipY, flipBoth } = map[placement];

	if (overflowX && overflowY)
		return ([flipBoth, flipX, flipY]);
	if (overflowX)
		return ([flipX, flipBoth, flipY]);
	return [flipY, flipBoth, flipX];
}

export function computeBaseCoords(refRect: DOMRect, floatRect: { width: number; height: number }, placement: Placement)
{
	let coords: {x: number, y: number};

	switch (placement)
	{
		case "top":
			coords = {x: refRect.left + (refRect.width - floatRect.width) / 2, y: refRect.top - floatRect.height}; break;
		case "top-start":
			coords = {x: refRect.left, y: refRect.top - floatRect.height}; break;
		case "top-end":
			coords = {x: refRect.right - floatRect.width, y: refRect.top - floatRect.height}; break;

		case "bottom":
			coords = {x: refRect.left + (refRect.width - floatRect.width) / 2, y: refRect.bottom}; break;
		case "bottom-start":
			coords = {x: refRect.left, y: refRect.bottom}; break;
		case "bottom-end":
			coords = {x: refRect.right - floatRect.width, y: refRect.bottom}; break;

		case "left":
			coords = {x: refRect.left - floatRect.width, y: refRect.top + (refRect.height - floatRect.height) / 2}; break;
		case "left-start":
			coords = {x: refRect.left - floatRect.width, y: refRect.top}; break;
		case "left-end":
			coords = {x: refRect.left - floatRect.width, y: refRect.bottom - floatRect.height}; break;

		case "right":
			coords = {x: refRect.right, y: refRect.top + (refRect.height - floatRect.height) / 2}; break;
		case "right-start":
			coords = {x: refRect.right, y: refRect.top}; break;
		case "right-end":
			coords = {x: refRect.right, y: refRect.bottom - floatRect.height}; break;

		case "top-left":
			coords = {x: refRect.left - floatRect.width, y: refRect.top - floatRect.height}; break;
		case "top-right":
			coords = {x: refRect.right, y: refRect.top - floatRect.height}; break;
		case "bottom-left":
			coords = {x: refRect.left - floatRect.width, y: refRect.bottom}; break;
		case "bottom-right":
			coords = {x: refRect.right, y: refRect.bottom}; break;

		default:
			coords = {x: refRect.left, y: refRect.top}; break;
	}
	return (new DOMRect(coords.x, coords.y, floatRect.width, floatRect.height));
}

export function createCursorVirtualElement(client: {clientX: number; clientY: number}, contextElement?: HTMLElement): VirtualElement
{
	return ({
		getBoundingClientRect: () => new DOMRect(client.clientX, client.clientY, 0, 0),
		contextElement,
	});
}