import { argbFromHex, customColor, Hct, hexFromArgb, SchemeTonalSpot, type ColorGroup, type CustomColorGroup } from "@material/material-color-utilities";
import { capitalize, hexToRgb, isBrowser } from "@utils";
import { useIsomorphicLayoutEffect } from "@utils/hooks";
import classNames from "classnames";
import { createContext, useCallback, useContext, useId, useMemo, useRef, useState } from "react";
import { useMediaQueryChange } from "react-dom-event-hooks";
import type { CustomColor, ExtractType, ThemeColorScheme, ThemeConfig, ThemeContext, ThemeContextInternal } from "./types";

import "@fontsource/roboto-flex/index.css";
import "@fontsource/roboto-mono/index.css";
import "@fontsource/roboto/index.css";
import "./style.scss";

function themeToObject(baseline: string, isDark = false, contrast?: number, customColors?: Record<string, CustomColor>)
{
	const baselineColor = argbFromHex(baseline);
	const schemeKeys: (keyof ThemeColorScheme)[] = ["background", "onBackground", "surface", "surfaceDim", "surfaceBright", "surfaceContainerLowest", "surfaceContainerLow", "surfaceContainer", "surfaceContainerHigh", "surfaceContainerHighest", "onSurface", "surfaceVariant", "onSurfaceVariant", "inverseSurface", "inverseOnSurface", "outline", "outlineVariant", "shadow", "scrim", "surfaceTint", "primary", "onPrimary", "primaryContainer", "onPrimaryContainer", "inversePrimary", "secondary", "onSecondary", "secondaryContainer", "onSecondaryContainer", "tertiary", "onTertiary", "tertiaryContainer", "onTertiaryContainer", "error", "onError", "errorContainer", "onErrorContainer", "primaryFixed", "primaryFixedDim", "onPrimaryFixed", "onPrimaryFixedVariant", "secondaryFixed", "secondaryFixedDim", "onSecondaryFixed", "onSecondaryFixedVariant", "tertiaryFixed", "tertiaryFixedDim", "onTertiaryFixed", "onTertiaryFixedVariant"];
	const customColorKeys: (keyof ColorGroup)[] = ["color", "colorContainer", "onColor", "onColorContainer"];
	const scheme = new SchemeTonalSpot(Hct.fromInt(baselineColor), isDark, contrast ?? 0, "2025");
	const result: Partial<ThemeColorScheme> = {};
	const getToken = (key: string, name: string) =>
	{
		key = key.replace("color", name);
		key = key.replace("Color", capitalize(name.toLowerCase()));
		return (key);
	};
	let color: CustomColorGroup;

	for (const key of schemeKeys)
		result[key] = hexFromArgb(scheme[key as keyof ExtractType<SchemeTonalSpot, number>]);
	for (const name in customColors)
	{
		for (const key of customColorKeys)
		{
			color = customColor(baselineColor, {name, value: typeof customColors[name].color === "string" ? argbFromHex(customColors[name].color) : customColors[name].color, blend: customColors[name].blend});
			result[getToken(key, name)] = hexFromArgb(color[isDark ? "dark" : "light"][key]);
		}
	}
	return (result as ThemeColorScheme);
}

function schemeToStyle(scheme: ThemeColorScheme)
{
	const getToken = (key: string) => `--md-sys-color-${key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}`;
	const style: string[] = [];
	let rgb: ReturnType<typeof hexToRgb>;

	for (const key in scheme)
	{
		rgb = hexToRgb(scheme[key]);
		style.push(`${getToken(key)}: ${scheme[key]};`);
		style.push(`${getToken(key)}-rgb: ${rgb?.r}, ${rgb?.g}, ${rgb?.b};`);
	}
	return (style.join("\n"));
}

const ThemeContextInternal = createContext<ThemeContextInternal | null>(null);

export function useThemeInternal(): ThemeContextInternal | null;
export function useThemeInternal(required: string): ThemeContextInternal;
export function useThemeInternal(required?: string)
{
	const context = useContext(ThemeContextInternal);

	if (required && !context)
		throw new Error(`${required} must be used in <Theme> component`);
	return (context);
};

export function useTheme()
{
	const context = useContext(ThemeContextInternal);

	if (!context)
		throw new Error(`useTheme() hook must be used in <Theme> component`);
	return (useMemo<ThemeContext>(() =>
	({
		colorScheme: context.colorScheme,
		setColorScheme: context.setColorScheme,
		palette: context.palette,
		config: context.config
	}), [context.palette, context.setColorScheme, context.colorScheme, context.config]));
}

export interface ThemeProps extends React.PropsWithChildren<ThemeConfig>
{
	id?: string,
	colorScheme?: "light" | "dark" | "auto",
	scrollable?: boolean,
	noDefaultStyle?: boolean,
	className?: string,
	style?: React.CSSProperties
}

export default function Theme(props: ThemeProps)
{
	const {colorScheme: defaulColorScheme = "auto", scrollable, children, noDefaultStyle, className, style, ...config} = props;
	const [colorScheme, setColorScheme] = useState(defaulColorScheme);
	const ref = useRef<HTMLDivElement>(null);
	const [tooltipsContainer, setTooltipsContainer] = useState<HTMLDivElement | null>(null);
	const [dialogsContainer, setDialogsContainer] = useState<HTMLDivElement | null>(null);
	const [popoversContainer, setPopoversContainer] = useState<HTMLDivElement | null>(null);
	const id = useId();
	const realId = props.id ?? id;
	const styleRef = useRef<HTMLStyleElement>(null);
	const dialogStates = useRef<Record<string, boolean>>({});
	const tooltipOpening = useRef<number>(null);
	const tooltipClosing = useRef<number>(null);
	const [isDark, setIsDark] = useState(isBrowser() ? window.matchMedia("(prefers-color-scheme: dark)").matches : false);
	const [tooltip, setTooltip] = useState<string>();
	const parentContext = useThemeInternal();
	const getRootContext = useCallback(() =>
	{
		let context = parentContext;

		if (!context)
			return (null);
		while (context?.context)
			context = context.context;
		return (context);
	}, [parentContext]);
	const customColors = useMemo(() => ({success: {color: "#257f00", blend: true}, ...props.customColors}), [props.customColors]);
	const palette = useMemo(() =>
	({
		light: themeToObject(props.primaryColor, false, props.contrast, customColors),
		dark: themeToObject(props.primaryColor, true, props.contrast, customColors)
	}), [customColors, props.primaryColor, props.contrast]);
	const context = useMemo<ThemeContextInternal>(() =>
	({
		colorScheme,
		setColorScheme,
		palette:
		{
			current: isDark ? palette.dark : palette.light,
			light: palette.light,
			dark: palette.dark
		},
		ref,
		tooltipsContainer: parentContext?.tooltipsContainer ?? tooltipsContainer,
		dialogsContainer: parentContext?.dialogsContainer ?? dialogsContainer,
		popoversContainer: parentContext?.popoversContainer ?? popoversContainer,
		config,
		tooltip: getRootContext()?.tooltip ?? tooltip,
		setTooltip(id)
		{
			const currentTooltip = getRootContext()?.tooltip ?? tooltip;

			if (typeof tooltipClosing.current === "number")
				tooltipClosing.current = window.clearTimeout(tooltipClosing.current) ?? null;
			if (id)
			{
				if (tooltipOpening.current !== null)
					tooltipOpening.current = window.clearTimeout(tooltipOpening.current) ?? null;
				if (!currentTooltip)
					tooltipOpening.current = window.setTimeout(() => setTooltip(id), 300);
				else
					setTooltip(id);
			}
			else
			{
				if (tooltipOpening.current !== null)
					tooltipOpening.current = window.clearTimeout(tooltipOpening.current) ?? null;
				tooltipClosing.current = window.setTimeout(() => setTooltip(undefined), 1500);
			}
			parentContext?.setTooltip(id);
		},
		setDialogState(id, open)
		{
			dialogStates.current[id] = open;
			if (Object.values(dialogStates.current).some(open => open))
				document.documentElement.style.setProperty("overflow", "hidden");
			else
				document.documentElement.style.removeProperty("overflow");
		},
		context: parentContext
	}), [config, dialogsContainer, getRootContext, parentContext, popoversContainer, tooltip, tooltipsContainer, palette.dark, palette.light, isDark, colorScheme]);
	const styles = useMemo(() =>
	{
		const lightTheme = schemeToStyle(palette.light);
		const darkTheme = schemeToStyle(palette.dark);

		if (!parentContext)
		{
			return ([
				`:root:not(:has(.Theme.light), :has(.Theme.dark)) {${lightTheme}}`,
				`@media (prefers-color-scheme: dark) {:root:not(:has(.Theme.light), :has(.Theme.dark)) {${darkTheme}}}`,
				`:root:has(.Theme.light) {${lightTheme}}`,
				`:root:has(.Theme.dark) {${darkTheme}}`
			].join("\n"));
		}
		return ([
			`:root:not(:has(.Theme.light), :has(.Theme.dark)) .Theme#${realId} {${lightTheme}}`,
			`@media (prefers-color-scheme: dark) {:root:not(:has(.Theme.light), :has(.Theme.dark)) .Theme#${realId} {${darkTheme}}}`,
			`:root:has(.Theme.light) .Theme#${realId} {${lightTheme}}`,
			`:root:has(.Theme.dark) .Theme#${realId} {${darkTheme}}`
		].join("\n"));
	}, [parentContext, realId, palette.dark, palette.light]);
	const classList = useMemo<Record<string, any>>(() =>
	({
		Theme: true,
		light: !parentContext && colorScheme === "light",
		dark: !parentContext && colorScheme === "dark",
		base: noDefaultStyle ? false : !parentContext,
		scrollable: !parentContext || scrollable,
	}), [parentContext, colorScheme, noDefaultStyle, scrollable]);

	useMediaQueryChange("(prefers-color-scheme: dark)", event => setIsDark(event.matches), {passive: true});

	useIsomorphicLayoutEffect(() =>
	{
		if (styleRef.current)
			styleRef.current.innerHTML = styles;
	}, [styles]);

	return (
		<ThemeContextInternal value={context}>
			{!noDefaultStyle && !parentContext && <style href={`theme_base_${realId}`} precedence="theme_base">{`body {margin: 0px}`}</style>}
			<style ref={styleRef} href={`theme_${realId}`} precedence="theme">{styles}</style>
			<div ref={ref} id={realId} className={classNames(classList, className)} style={style}>
				{children}
				{!parentContext &&
				(
					<>
						<div ref={setTooltipsContainer} className="portals toolips-container"/>
						<div ref={setDialogsContainer} className="portals dialogs-container"/>
						<div ref={setPopoversContainer} className="portals popovers-container"/>
					</>
				)}
			</div>
		</ThemeContextInternal>
	);
}
