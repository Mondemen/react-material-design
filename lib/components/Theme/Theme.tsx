import { argbFromHex, customColor, Hct, hexFromArgb, SchemeTonalSpot, type ColorGroup, type CustomColorGroup } from "@material/material-color-utilities";
import classNames from "classnames";
import { createContext, useCallback, useContext, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CustomColor, ExtractType, ThemeConfig, ThemeContext } from "./types";

import "@fontsource/roboto/index.css";
import "@fontsource/roboto-flex/index.css";
import "@fontsource/roboto-mono/index.css";
import "./style.scss";

function hexToRgb(hex: string)
{
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return (result ? {r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16)} : null);
}
function themeToStyle(baseline: string, isDark = false, contrast?: number, customColors?: Record<string, CustomColor>)
{
	const baselineColor = argbFromHex(baseline);
	const schemeKeys: (keyof ExtractType<SchemeTonalSpot, number>)[] = ["background", "onBackground", "surface", "surfaceDim", "surfaceBright", "surfaceContainerLowest", "surfaceContainerLow", "surfaceContainer", "surfaceContainerHigh", "surfaceContainerHighest", "onSurface", "surfaceVariant", "onSurfaceVariant", "inverseSurface", "inverseOnSurface", "outline", "outlineVariant", "shadow", "scrim", "surfaceTint", "primary", "onPrimary", "primaryContainer", "onPrimaryContainer", "inversePrimary", "secondary", "onSecondary", "secondaryContainer", "onSecondaryContainer", "tertiary", "onTertiary", "tertiaryContainer", "onTertiaryContainer", "error", "onError", "errorContainer", "onErrorContainer", "primaryFixed", "primaryFixedDim", "onPrimaryFixed", "onPrimaryFixedVariant", "secondaryFixed", "secondaryFixedDim", "onSecondaryFixed", "onSecondaryFixedVariant", "tertiaryFixed", "tertiaryFixedDim", "onTertiaryFixed", "onTertiaryFixedVariant"];
	const customColorKeys: (keyof ColorGroup)[] = ["color", "colorContainer", "onColor", "onColorContainer"];
	const scheme = new SchemeTonalSpot(Hct.fromInt(baselineColor), isDark, contrast ?? 0, "2025");
	const style: string[] = [];
	const getToken = (key: string, name?: string) =>
	{
		let value = key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

		if (name)
			value = value.replace("color", name);
		return (`--md-sys-color-${value}`);
	};
	let color: CustomColorGroup;
	let hex: string;
	let rgb: ReturnType<typeof hexToRgb>;

	for (const key of schemeKeys)
	{
		hex = hexFromArgb(scheme[key]);
		rgb = hexToRgb(hex);
		style.push(`${getToken(key)}: ${hex};`);
		style.push(`${getToken(key)}-rgb: ${rgb?.r}, ${rgb?.g}, ${rgb?.b};`);
	}
	for (const name in customColors)
	{
		for (const key of customColorKeys)
		{
			color = customColor(baselineColor, {name, value: typeof customColors[name].color === "string" ? argbFromHex(customColors[name].color) : customColors[name].color, blend: customColors[name].blend});
			style.push(`${getToken(key, name)}: ${hexFromArgb(color[isDark ? "dark" : "light"][key])};`);
		}
	}
	return (style.join("\n"));
}

const ThemeContext = createContext<ThemeContext | null>(null);

export function useTheme(): ThemeContext | null;
export function useTheme(required: string): ThemeContext;
export function useTheme(required?: string)
{
	const context = useContext(ThemeContext);

	if (required && !context)
		throw new Error(`${required} must be used in <Theme> component`);
	return (context);
};

export interface ThemeProps extends React.PropsWithChildren<ThemeConfig>
{
	id?: string,
	theme?: "light" | "dark" | "auto",
	scrollable?: boolean,
	noDefaultStyle?: boolean,
	className?: string,
	style?: React.CSSProperties
}

export default function Theme(props: ThemeProps)
{
	const {theme = "auto", scrollable, children, noDefaultStyle, className, style, ...config} = props;
	const ref = useRef<HTMLDivElement>(null);
	const [tooltipsContainer, setTooltipsContainer] = useState<HTMLDivElement | null>(null);
	const [dialogsContainer, setDialogsContainer] = useState<HTMLDivElement | null>(null);
	const [popoversContainer, setPopoversContainer] = useState<HTMLDivElement | null>(null);
	const id = useId();
	const realId = props.id ?? id;
	const styleRef = useRef<HTMLStyleElement>(null);
	const dialogStates = useRef<Record<string, boolean>>({});
	const tooltipClosing = useRef<number>(null);
	const [tooltip, setTooltip] = useState<string>();
	const parentContext = useTheme();
	const getRootContext = useCallback(() =>
	{
		let context = parentContext;

		if (!context)
			return (null);
		while (context?.context)
			context = context.context;
		return (context);
	}, [parentContext]);
	const context = useMemo<ThemeContext>(() =>
	({
		ref,
		tooltipsContainer: parentContext?.tooltipsContainer ?? tooltipsContainer,
		dialogsContainer: parentContext?.dialogsContainer ?? dialogsContainer,
		popoversContainer: parentContext?.popoversContainer ?? popoversContainer,
		config,
		tooltip: getRootContext()?.tooltip ?? tooltip,
		setTooltip(id)
		{
			if (typeof tooltipClosing.current === "number")
				tooltipClosing.current = window.clearTimeout(tooltipClosing.current) ?? null;
			if (id)
				setTooltip(id);
			else
				tooltipClosing.current = window.setTimeout(() => setTooltip(undefined), 1500);
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
	}), [config, dialogsContainer, getRootContext, parentContext, popoversContainer, tooltip, tooltipsContainer]);
	const customColors = useMemo(() => ({success: {color: "#257f00", blend: true}, ...props.customColors}), [props.customColors]);
	const styles = useMemo(() =>
	{
		if (!parentContext)
		{
			return ([
				`:root:not(:has(.Theme.light), :has(.Theme.dark)) {${themeToStyle(props.primaryColor, false, props.contrast, customColors)}}`,
				`@media (prefers-color-scheme: dark) {:root:not(:has(.Theme.light), :has(.Theme.dark)) {${themeToStyle(props.primaryColor, true, props.contrast, customColors)}}}`,
				`:root:has(.Theme.light) {${themeToStyle(props.primaryColor, false, props.contrast, customColors)}}`,
				`:root:has(.Theme.dark) {${themeToStyle(props.primaryColor, true, props.contrast, customColors)}}`
			].join("\n"));
		}
		return ([
			`:root:not(:has(.Theme.light), :has(.Theme.dark)) .Theme#${realId} {${themeToStyle(props.primaryColor, false, props.contrast, customColors)}}`,
			`@media (prefers-color-scheme: dark) {:root:not(:has(.Theme.light), :has(.Theme.dark)) .Theme#${realId} {${themeToStyle(props.primaryColor, true, props.contrast, customColors)}}}`,
			`:root:has(.Theme.light) .Theme#${realId} {${themeToStyle(props.primaryColor, false, props.contrast, customColors)}}`,
			`:root:has(.Theme.dark) .Theme#${realId} {${themeToStyle(props.primaryColor, true, props.contrast, customColors)}}`
		].join("\n"));
	}, [parentContext, realId, props.primaryColor, props.contrast, customColors]);
	const classList = useMemo<Record<string, any>>(() =>
	({
		Theme: true,
		light: !parentContext && theme === "light",
		dark: !parentContext && theme === "dark",
		base: noDefaultStyle ? false : !parentContext,
		scrollable: !parentContext || scrollable,
	}), [parentContext, theme, noDefaultStyle, scrollable]);

	useLayoutEffect(() =>
	{
		if (styleRef.current)
			styleRef.current.innerHTML = styles;
	}, [styles]);

	return (
		<ThemeContext value={context}>
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
		</ThemeContext>
	);
}
