export const setTimeout = async (delay?: number) => new Promise(resolve => window.setTimeout(() => resolve(undefined), delay));

export function isBrowser()
{
	return (typeof window !== "undefined");
}

export function randomUUID(): ReturnType<typeof crypto["randomUUID"]>
{
	if (isBrowser() && "randomUUID" in crypto)
		return (crypto.randomUUID());
	return ("10000000-1000-4000-8000-100000000000".replace(/[018]/g, c => (+c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))).toString(16)) as any);
}

let timeout: number | undefined;
export function onPageLoading(loading: boolean)
{
	if (isBrowser())
	{
		if (loading)
		{
			if (timeout)
			{
				clearTimeout(timeout);
				timeout = undefined;
			}
			document.getElementById("page_loader_indicator")?.classList.add("visible");
		}
		else
		{
			if (!timeout)
				timeout = window.setTimeout(() => document.getElementById("page_loader_indicator")?.classList.remove("visible"), 50);
		}
	}
}

export function compareDeps<T>(target: T, previous: T)
{
	if (Array.isArray(target))
	{
		if (!Array.isArray(previous))
			return (false);
		if (target.length !== previous.length)
			return (false);
		return (target.every((target, i) => target === previous[i]))
	}
	else
		return (target === previous);
}

export function hex2rgb(hex: string)
{
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    return ({r, g, b});
}

export function isLight(color?: string | {r: number, g: number, b: number})
{
	if (!color)
		return (true);
	if (typeof color === "string")
		color = hex2rgb(color);
	return ((((color.r * 299) + (color.g * 587) + (color.b * 114)) / 1000) >= 128);
}

export const compareRect = (a?: DOMRect, b?: DOMRect) => (a?.top === b?.top && a?.left === b?.left && a?.width === b?.width && a?.height === b?.height);

export function isDeepEqual(object1: any, object2: any)
{
	const objKeys1 = Object.keys(object1);
	const objKeys2 = Object.keys(object2);
	let value1: any, value2: any;
	let isObjects: boolean;

	if (objKeys1.length !== objKeys2.length)
		return (false);
	for (const key of objKeys1)
	{
		value1 = object1[key];
		value2 = object2[key];
		isObjects = isObject(value1) && isObject(value2);
		if ((isObjects && !isDeepEqual(value1, value2)) || (!isObjects && value1 !== value2))
			return (false);
	}
	return (true);
}

export const isObject = (object: any) => object !== null && typeof object === "object";

export const clamp = (input: number, min: number, max: number) => (input < min ? min : input > max ? max : input)
export const mapRange = (current: number, inMin: number, inMax: number, outMin: number, outMax: number) => clamp(((current - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin, outMin, outMax);

export function getMaxWords(str: string, max: number)
{
	const regex = /\b\w+\b/g;
	let count = 0;

	while (regex.exec(str) !== null)
	{
		count++;
		if (count >= max)
			return (str.slice(0, regex.lastIndex));
	}
	return (str);
}

export function waitAnimationFrame(frame = 1)
{
	return (new Promise<DOMHighResTimeStamp>((resolve, reject) =>
	{
		if (frame <= 1)
			requestAnimationFrame(resolve);
		else
			waitAnimationFrame(frame - 1).then(resolve).catch(reject);
	}));
};

export const waitAnimationFrameTimeout = (delay = 0) => new Promise<DOMHighResTimeStamp>(resolve => setTimeout(delay ?? 0).then(() => requestAnimationFrame(resolve)));

export async function waitTransitionEndEvent(element: HTMLElement | null | undefined, condition: (event: TransitionEvent) => boolean, targetOnly = true)
{
	return (new Promise<void>(resolve =>
	{
		let interval: NodeJS.Timeout | null = null;
		const listener = (event: TransitionEvent) =>
		{
			if (((targetOnly && event.target instanceof HTMLElement && element?.isSameNode(event.target)) || !targetOnly) && condition(event))
			{
				element?.removeEventListener("transitionend", listener);
				if (interval)
					clearInterval(interval);
				resolve();
			}
		}

		if (!element || window.getComputedStyle(element).transitionProperty.includes("none"))
			return (resolve());
		interval = setInterval(() =>
		{
			if (window.getComputedStyle(element).transitionProperty.includes("none"))
			{
				if (interval)
					clearInterval(interval);
				resolve();
			}
		}, 100);
		element.addEventListener("transitionend", listener);
	}))
}

export async function waitTransitionNameEndEvent(element: HTMLElement | null | undefined, name: string | ((name: string) => boolean), targetOnly = true)
{
	return (waitTransitionEndEvent(element, event =>
	{
		if (typeof name === "string")
			return (event.propertyName === name);
		else
			return (name(event.propertyName));
	}, targetOnly));
}

export async function waitAnimationEndEvent(element: HTMLElement | null | undefined, condition: (event: AnimationEvent) => boolean)
{
	return (new Promise<void>(resolve =>
	{
		let interval: NodeJS.Timeout | null = null;
		const listener = (event: AnimationEvent) =>
		{
			if (condition(event))
			{
				element?.removeEventListener("animationend", listener);
				if (interval)
					clearInterval(interval);
				resolve();
			}
		}

		if (!element || window.getComputedStyle(element).animationName.includes("none"))
			return (resolve());
		interval = setInterval(() =>
		{
			if (window.getComputedStyle(element).animationName.includes("none"))
			{
				if (interval)
					clearInterval(interval);
				resolve();
			}
		}, 100);
		element.addEventListener("animationend", listener);
	}));
}

export async function waitAnimationNameEndEvent(element: HTMLElement | null | undefined, name: string | ((name: string) => boolean))
{
	return (waitAnimationEndEvent(element, event =>
	{
		if (event.target !== element)
			return (false);
		if (typeof name === "string")
			return (event.animationName === name);
		return (name(event.animationName));
	}));
}

export type SizeUnit = string | number;

export function parseSizeToPx(val: SizeUnit | undefined, containerSize: number, fallback = 0)
{
	if (val === undefined || val === null)
		return (fallback);
	if (typeof val === "string")
	{
		if (val.endsWith("%"))
			return ((parseFloat(val) / 100) * containerSize);
		if (val.endsWith("px"))
			return (parseFloat(val));
	}
	return (Number(val) || fallback);
}

export function formatSizeFromPx(pxValue: number, originalUnit: SizeUnit, containerSize: number): SizeUnit
{
	if (typeof originalUnit === "string")
	{
		if (originalUnit.endsWith("%"))
			return (`${(pxValue / containerSize) * 100}%`);
		if (originalUnit.endsWith("px"))
			return (`${pxValue}px`);
	}
	return (pxValue);
}

export function getPropertyValue(element: HTMLElement | SVGElement | undefined | null, property: string, unit?: string): number | undefined;
export function getPropertyValue<D extends string | number>(element: HTMLElement | SVGElement | undefined | null, property: string, unit: string | undefined, defaultValue: D): D;
export function getPropertyValue<D extends string | number>(element: HTMLElement | SVGElement | undefined | null, property: string, unit?: string, defaultValue?: D): D | number | undefined;
export function getPropertyValue<D extends string | number>(element: HTMLElement | SVGElement | undefined | null, property: string, unit?: string, defaultValue?: D): D | number | undefined
{
	let match: RegExpExecArray  | null;
	let value: CSSStyleValue | undefined;

	if (!element)
		return (defaultValue);
	if (!element.computedStyleMap)
	{
		if ((match = /^(?<value>\d+)(?<unit>[a-zA-Z]+)?$/.exec(window.getComputedStyle(element).getPropertyValue(property) || "0")) !== null)
			value = {value: parseFloat(match.groups?.["value"] ?? ""), unit: match.groups?.["unit"] ?? ""} as CSSUnitValue;
	}
	else
	{
		value = element.computedStyleMap().get(property);
		if (value instanceof CSSUnparsedValue)
			value = CSSNumericValue.parse(value.toString());
	}
	if (value && "value" in value && "unit" in value && typeof value.value === "number" && typeof value.unit === "string")
	{
		if (["ms", "s"].includes(value.unit.toLowerCase()))
		{
			if (unit?.toLowerCase() === "ms" && value.unit.toLowerCase() === "s")
				return (value.value * 1000);
			else if (unit?.toLowerCase() === "s" && value.unit.toLowerCase() === "ms")
				return (value.value / 1000);
		}
		return (value.value);
	}
	return (defaultValue);
}

export function getComponentTokenValue(element: HTMLElement | SVGElement | undefined | null, token: string)
{
	return (getPropertyValue(element, `--md-comp-${token}`) ?? 0);
}

export function getRelativeRect(target?: HTMLElement | DOMRect | null, relativeTo?: HTMLElement | DOMRect | null)
{
	const targetRect = target instanceof HTMLElement ? target.getBoundingClientRect() : target;
	const relativeRect = relativeTo instanceof HTMLElement ? relativeTo.getBoundingClientRect() : relativeTo;

	if (!targetRect)
		return (new DOMRect());
	if (!relativeRect)
		return (targetRect);
	return (new DOMRect(targetRect.x - relativeRect.x, targetRect.y - relativeRect.y, targetRect.width, targetRect.height));
}

export function isRectInside(rectA: DOMRect, rectB: DOMRect)
{
  return (
    rectA.top >= rectB.top &&
    rectA.left >= rectB.left &&
    rectA.bottom <= rectB.bottom &&
    rectA.right <= rectB.right
  );
}
export function shallowEqual(objA: any, objB: any)
{
	let keysA: string[];
	let keysB: string[];

	if (Object.is(objA, objB))
		return (true);
	if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null)
		return (false);
	keysA = Object.keys(objA);
	keysB = Object.keys(objB);
	if (keysA.length !== keysB.length)
		return (false);
	for (let i = 0; i < keysA.length; i++)
		if (!Object.prototype.hasOwnProperty.call(objB, keysA[i]) || !Object.is(objA[keysA[i]], objB[keysA[i]]))
			return (false);
	return (true);
}

export function getScrollParents(node: Element): Element[]
{
	const scrollParents: Element[] = [];
	let current = node.parentElement;

	while (current)
	{
		const style = window.getComputedStyle(current);

		if (/(auto|scroll|overlay)/.test(style.overflow + style.overflowY + style.overflowX))
			scrollParents.push(current);
		current = current.parentElement;
	}
	return (scrollParents);
}

export function getViewportRect()
{
	const vv = window.visualViewport;

	return ({
		width: vv ? vv.width : window.innerWidth,
		height: vv ? vv.height : window.innerHeight,
		offsetLeft: vv ? vv.offsetLeft : 0,
		offsetTop: vv ? vv.offsetTop : 0,
	});
}
