import BezierEasing from "bezier-easing";

interface MotionSpringCssConfig
{
	duration: number,
	easing: string
}

interface MotionSpringConfig
{
	duration: number,
	easing: (offset: number) => number
}

const SpringExpressiveFastSpatial = {duration: 350, easing: [0.42, 1.67, 0.21, 0.9]}
const SpringExpressiveDefaultSpatial = {duration: 500, easing: [0.38, 1.21, 0.22, 1]}
const SpringExpressiveSlowSpatial = {duration: 650, easing: [0.39, 1.29, 0.35, 0.98]}

const SpringExpressiveFastEffects = {duration: 150, easing: [0.31, 0.94, 0.34, 1]}
const SpringExpressiveDefaultEffects = {duration: 200, easing: [0.34, 0.8, 0.34, 1]}
const SpringExpressiveSlowEffects = {duration: 300, easing: [0.34, 0.88, 0.34, 1]}

const SpringStandardFastSpatial = {duration: 350, easing: [0.27, 1.06, 0.18, 1]}
const SpringStandardDefaultSpatial = {duration: 500, easing: [0.27, 1.06, 0.18, 1]}
const SpringStandardSlowSpatial = {duration: 750, easing: [0.27, 1.06, 0.18, 1]}

const SpringStandardFastEffects = {duration: 150, easing: [0.31, 0.94, 0.34, 1]}
const SpringStandardDefaultEffects = {duration: 200, easing: [0.34, 0.8, 0.34, 1]}
const SpringStandardSlowEffects = {duration: 300, easing: [0.34, 0.88, 0.34, 1]}

export const MotionSpringCss =
{
	ExpressiveFastSpatial: <MotionSpringCssConfig>{duration: SpringExpressiveFastSpatial.duration, easing: `cubic-bezier(${SpringExpressiveFastSpatial.easing.join(", ")})`},
	ExpressiveDefaultSpatial: <MotionSpringCssConfig>{duration: SpringExpressiveDefaultSpatial.duration, easing: `cubic-bezier(${SpringExpressiveDefaultSpatial.easing.join(", ")})`},
	ExpressiveSlowSpatial: <MotionSpringCssConfig>{duration: SpringExpressiveSlowSpatial.duration, easing: `cubic-bezier(${SpringExpressiveSlowSpatial.easing.join(", ")})`},
	ExpressiveFastEffects: <MotionSpringCssConfig>{duration: SpringExpressiveFastEffects.duration, easing: `cubic-bezier(${SpringExpressiveFastEffects.easing.join(", ")})`},
	ExpressiveDefaultEffects: <MotionSpringCssConfig>{duration: SpringExpressiveDefaultEffects.duration, easing: `cubic-bezier(${SpringExpressiveDefaultEffects.easing.join(", ")})`},
	ExpressiveSlowEffects: <MotionSpringCssConfig>{duration: SpringExpressiveSlowEffects.duration, easing: `cubic-bezier(${SpringExpressiveSlowEffects.easing.join(", ")})`},
	StandardFastSpatial: <MotionSpringCssConfig>{duration: SpringStandardFastSpatial.duration, easing: `cubic-bezier(${SpringStandardFastSpatial.easing.join(", ")})`},
	StandardDefaultSpatial: <MotionSpringCssConfig>{duration: SpringStandardDefaultSpatial.duration, easing: `cubic-bezier(${SpringStandardDefaultSpatial.easing.join(", ")})`},
	StandardSlowSpatial: <MotionSpringCssConfig>{duration: SpringStandardSlowSpatial.duration, easing: `cubic-bezier(${SpringStandardSlowSpatial.easing.join(", ")})`},
	StandardFastEffects: <MotionSpringCssConfig>{duration: SpringStandardFastEffects.duration, easing: `cubic-bezier(${SpringStandardFastEffects.easing.join(", ")})`},
	StandardDefaultEffects: <MotionSpringCssConfig>{duration: SpringStandardDefaultEffects.duration, easing: `cubic-bezier(${SpringStandardDefaultEffects.easing.join(", ")})`},
	StandardSlowEffects: <MotionSpringCssConfig>{duration: SpringStandardSlowEffects.duration, easing: `cubic-bezier(${SpringStandardSlowEffects.easing.join(", ")})`},
}

export const MotionSpring =
{
	ExpressiveFastSpatial: <MotionSpringConfig>{duration: SpringExpressiveFastSpatial.duration, easing: BezierEasing.apply(this, SpringExpressiveFastSpatial.easing as Parameters<typeof BezierEasing>)},
	ExpressiveDefaultSpatial: <MotionSpringConfig>{duration: SpringExpressiveDefaultSpatial.duration, easing: BezierEasing.apply(this, SpringExpressiveDefaultSpatial.easing as Parameters<typeof BezierEasing>)},
	ExpressiveSlowSpatial: <MotionSpringConfig>{duration: SpringExpressiveSlowSpatial.duration, easing: BezierEasing.apply(this, SpringExpressiveSlowSpatial.easing as Parameters<typeof BezierEasing>)},
	ExpressiveFastEffects: <MotionSpringConfig>{duration: SpringExpressiveFastEffects.duration, easing: BezierEasing.apply(this, SpringExpressiveFastEffects.easing as Parameters<typeof BezierEasing>)},
	ExpressiveDefaultEffects: <MotionSpringConfig>{duration: SpringExpressiveDefaultEffects.duration, easing: BezierEasing.apply(this, SpringExpressiveDefaultEffects.easing as Parameters<typeof BezierEasing>)},
	ExpressiveSlowEffects: <MotionSpringConfig>{duration: SpringExpressiveSlowEffects.duration, easing: BezierEasing.apply(this, SpringExpressiveSlowEffects.easing as Parameters<typeof BezierEasing>)},
	StandardFastSpatial: <MotionSpringConfig>{duration: SpringStandardFastSpatial.duration, easing: BezierEasing.apply(this, SpringStandardFastSpatial.easing as Parameters<typeof BezierEasing>)},
	StandardDefaultSpatial: <MotionSpringConfig>{duration: SpringStandardDefaultSpatial.duration, easing: BezierEasing.apply(this, SpringStandardDefaultSpatial.easing as Parameters<typeof BezierEasing>)},
	StandardSlowSpatial: <MotionSpringConfig>{duration: SpringStandardSlowSpatial.duration, easing: BezierEasing.apply(this, SpringStandardSlowSpatial.easing as Parameters<typeof BezierEasing>)},
	StandardFastEffects: <MotionSpringConfig>{duration: SpringStandardFastEffects.duration, easing: BezierEasing.apply(this, SpringStandardFastEffects.easing as Parameters<typeof BezierEasing>)},
	StandardDefaultEffects: <MotionSpringConfig>{duration: SpringStandardDefaultEffects.duration, easing: BezierEasing.apply(this, SpringStandardDefaultEffects.easing as Parameters<typeof BezierEasing>)},
	StandardSlowEffects: <MotionSpringConfig>{duration: SpringStandardSlowEffects.duration, easing: BezierEasing.apply(this, SpringStandardSlowEffects.easing as Parameters<typeof BezierEasing>)},
}