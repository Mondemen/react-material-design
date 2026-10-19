export type Side = "top" | "bottom" | "left" | "right";
export type Alignment = "start" | "end";

export type StandardPlacement = Side | `${Side}-${Alignment}`;
export type DiagonalPlacement = "top-left" | "top-right" | "bottom-left" | "bottom-right";

export type Placement = StandardPlacement | DiagonalPlacement;

export interface MiddlewareState
{
	placement: Placement,
	x: number,
	y: number,
	refRect: DOMRect,
	floatRect: DOMRect,
	viewport: DOMRect,
	hasFlipped?: boolean
}

export interface MiddlewareReturn
{
	x?: number,
	y?: number,
	hasFlipped?: boolean,
	reset?: { placement: Placement }
}

export type Middleware = (state: MiddlewareState) => MiddlewareReturn;

export interface OffsetOptions
{
	mainAxis?: number,
	crossAxis?: number
}

export interface ShiftOptions
{
	padding?: number,
	limitShift?: number,
	crossAxis?: boolean,
	mainAxis?: boolean
}

export interface FlipOptions
{
	fallbackPlacements?: Placement[],
	allowedPlacements?: Placement[],
	padding?: number,
	offset?: number
}
