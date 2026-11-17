import type { RefObject } from "react";

export type ExtractType<Data, Type> = {[K in keyof Data as Data[K] extends Type ? K : never]: Data[K]};

export interface ThemeConfig
{
	primaryColor: string,
	contrast?: number,
	customColors?: Record<string, CustomColor>,
	componentTypes?: ThemeComponentTypeConfig
}

export interface ThemeComponentTypeConfig
{
	[type: string]: React.ElementType | undefined
}

export type DefaultThemeComponentType<Name extends string, Default extends React.ElementType> =
(
	/*if*/ ThemeComponentTypeConfig[Name] extends (props: any) => React.ReactNode | Promise<React.ReactNode> ?
		ThemeComponentTypeConfig[Name]
	/*else if*/ : ThemeComponentTypeConfig[Name] extends keyof React.JSX.IntrinsicElements ?
		ThemeComponentTypeConfig[Name]
	/*else*/ :
		Default
)

export interface CustomColor
{
    color: number | string,
    blend: boolean
}

export interface ThemeContext
{
    colorScheme: "light" | "dark" | "auto",
    setColorScheme: (scheme: this["colorScheme"]) => void,
    palette:
    {
        current: ThemeColorScheme,
        light: ThemeColorScheme,
        dark: ThemeColorScheme
    },
	config: ThemeConfig
}

export interface ThemeContextInternal extends ThemeContext
{
	ref: RefObject<HTMLDivElement | null>,
	tooltipsContainer: HTMLDivElement | null,
	dialogsContainer: HTMLDivElement | null,
	popoversContainer: HTMLDivElement | null,
	tooltip?: string,
	setTooltip: (id?: string) => void,
	setDialogState: (id: string, open: boolean) => void,
	context: ThemeContextInternal | null
}

export interface ThemeColorScheme
{
	[name: string]: string;
    background: string;
    onBackground: string;
    surface: string;
    surfaceDim: string;
    surfaceBright: string;
    surfaceContainerLowest: string;
    surfaceContainerLow: string;
    surfaceContainer: string;
    surfaceContainerHigh: string;
    surfaceContainerHighest: string;
    onSurface: string;
    surfaceVariant: string;
    onSurfaceVariant: string;
    inverseSurface: string;
    inverseOnSurface: string;
    outline: string;
    outlineVariant: string;
    shadow: string;
    scrim: string;
    surfaceTint: string;
    primary: string;
    primaryDim: string;
    onPrimary: string;
    primaryContainer: string;
    onPrimaryContainer: string;
    primaryFixed: string;
    primaryFixedDim: string;
    onPrimaryFixed: string;
    onPrimaryFixedVariant: string;
    inversePrimary: string;
    secondary: string;
    secondaryDim: string;
    onSecondary: string;
    secondaryContainer: string;
    onSecondaryContainer: string;
    secondaryFixed: string;
    secondaryFixedDim: string;
    onSecondaryFixed: string;
    onSecondaryFixedVariant: string;
    tertiary: string;
    tertiaryDim: string;
    onTertiary: string;
    tertiaryContainer: string;
    onTertiaryContainer: string;
    tertiaryFixed: string;
    tertiaryFixedDim: string;
    onTertiaryFixed: string;
    onTertiaryFixedVariant: string;
    error: string;
    errorDim: string;
    onError: string;
    errorContainer: string;
    onErrorContainer: string;
    success: string;
    onSuccess: string;
    successContainer: string;
    onSuccessContainer: string;
}
