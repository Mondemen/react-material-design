import ShapeSidedCookie12, { ShapeSidedCookie12Path } from "./12_sided_cookie";
import ShapeLeafClover4, { ShapeLeafClover4Path } from "./4_leaf_clover";
import ShapeSidedCookie4, { ShapeSidedCookie4Path } from "./4_sided_cookie";
import ShapeSidedCookie6, { ShapeSidedCookie6Path } from "./6_sided_cookie";
import ShapeSidedCookie7, { ShapeSidedCookie7Path } from "./7_sided_cookie";
import ShapeLeafClover8, { ShapeLeafClover8Path } from "./8_leaf_clover";
import ShapeSidedCookie9, { ShapeSidedCookie9Path } from "./9_sided_cookie";
import ShapeArch, { ShapeArchPath } from "./arch";
import ShapeArrow, { ShapeArrowPath } from "./arrow";
import ShapeBoom, { ShapeBoomPath } from "./boom";
import ShapeBun, { ShapeBunPath } from "./bun";
import ShapeBurst, { ShapeBurstPath } from "./burst";
import ShapeCircle, { ShapeCirclePath } from "./circle";
import ShapeClamshell, { ShapeClamshellPath } from "./clamshell";
import ShapeDiamond, { ShapeDiamondPath } from "./diamond";
import ShapeFan, { ShapeFanPath } from "./fan";
import ShapeFlower, { ShapeFlowerPath } from "./flower";
import ShapeGem, { ShapeGemPath } from "./gem";
import ShapeGhostIsh, { ShapeGhostIshPath } from "./ghost_ish";
import ShapeHeart, { ShapeHeartPath } from "./heart";
import ShapeOval, { ShapeOvalPath } from "./oval";
import ShapePentagon, { ShapePentagonPath } from "./pentagon";
import ShapePill, { ShapePillPath } from "./pill";
import ShapePixelCircle, { ShapePixelCirclePath } from "./pixel_circle";
import ShapePixelTriangle, { ShapePixelTrianglePath } from "./pixel_triangle";
import ShapePuffy, { ShapePuffyPath } from "./puffy";
import ShapePuffyDiamond, { ShapePuffyDiamondPath } from "./puffy_diamond";
import ShapeSemicircle, { ShapeSemicirclePath } from "./semicircle";
import ShapeSlanted, { ShapeSlantedPath } from "./slanted";
import ShapeSoftBoom, { ShapeSoftBoomPath } from "./soft_boom";
import ShapeSoftBurst, { ShapeSoftBurstPath } from "./soft_burst";
import ShapeSquare, { ShapeSquarePath } from "./square";
import ShapeSunny, { ShapeSunnyPath } from "./sunny";
import ShapeTriangle, { ShapeTrianglePath } from "./triangle";
import ShapeVerySunny, { ShapeVerySunnyPath } from "./very_sunny";

export enum ShapePath
{
	Arch = `${ShapeArchPath}`,
	Arrow = `${ShapeArrowPath}`,
	Boom = `${ShapeBoomPath}`,
	Bun = `${ShapeBunPath}`,
	Burst = `${ShapeBurstPath}`,
	Circle = `${ShapeCirclePath}`,
	Clamshell = `${ShapeClamshellPath}`,
	Diamond = `${ShapeDiamondPath}`,
	Fan = `${ShapeFanPath}`,
	Flower = `${ShapeFlowerPath}`,
	Gem = `${ShapeGemPath}`,
	GhostIsh = `${ShapeGhostIshPath}`,
	Heart = `${ShapeHeartPath}`,
	LeafClover4 = `${ShapeLeafClover4Path}`,
	LeafClover8 = `${ShapeLeafClover8Path}`,
	Oval = `${ShapeOvalPath}`,
	Pentagon = `${ShapePentagonPath}`,
	Pill = `${ShapePillPath}`,
	PixelCircle = `${ShapePixelCirclePath}`,
	PixelTriangle = `${ShapePixelTrianglePath}`,
	Puffy = `${ShapePuffyPath}`,
	PuffyDiamond = `${ShapePuffyDiamondPath}`,
	Semicircle = `${ShapeSemicirclePath}`,
	SidedCookie12 = `${ShapeSidedCookie12Path}`,
	SidedCookie4 = `${ShapeSidedCookie4Path}`,
	SidedCookie6 = `${ShapeSidedCookie6Path}`,
	SidedCookie7 = `${ShapeSidedCookie7Path}`,
	SidedCookie9 = `${ShapeSidedCookie9Path}`,
	Slanted = `${ShapeSlantedPath}`,
	SoftBoom = `${ShapeSoftBoomPath}`,
	SoftBurst = `${ShapeSoftBurstPath}`,
	Square = `${ShapeSquarePath}`,
	Sunny = `${ShapeSunnyPath}`,
	Triangle = `${ShapeTrianglePath}`,
	VerySunny = `${ShapeVerySunnyPath}`
}

export const Shape =
{
	SidedCookie12: ShapeSidedCookie12,
	LeafClover4: ShapeLeafClover4,
	SidedCookie4: ShapeSidedCookie4,
	SidedCookie6: ShapeSidedCookie6,
	SidedCookie7: ShapeSidedCookie7,
	LeafClover8: ShapeLeafClover8,
	SidedCookie9: ShapeSidedCookie9,
	Arch: ShapeArch,
	Arrow: ShapeArrow,
	Boom: ShapeBoom,
	Bun: ShapeBun,
	Burst: ShapeBurst,
	Circle: ShapeCircle,
	Clamshell: ShapeClamshell,
	Diamond: ShapeDiamond,
	Fan: ShapeFan,
	Flower: ShapeFlower,
	Gem: ShapeGem,
	GhostIsh: ShapeGhostIsh,
	Heart: ShapeHeart,
	Oval: ShapeOval,
	Pentagon: ShapePentagon,
	Pill: ShapePill,
	PixelCircle: ShapePixelCircle,
	PixelTriangle: ShapePixelTriangle,
	Puffy: ShapePuffy,
	PuffyDiamond: ShapePuffyDiamond,
	Semicircle: ShapeSemicircle,
	Slanted: ShapeSlanted,
	SoftBoom: ShapeSoftBoom,
	SoftBurst: ShapeSoftBurst,
	Square: ShapeSquare,
	Sunny: ShapeSunny,
	Triangle: ShapeTriangle,
	VerySunny: ShapeVerySunny
}