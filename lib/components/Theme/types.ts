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
	ref: RefObject<HTMLDivElement | null>,
	tooltipsContainer: HTMLDivElement | null,
	dialogsContainer: HTMLDivElement | null,
	popoversContainer: HTMLDivElement | null,
	config: ThemeConfig,
	tooltip?: string,
	setTooltip: (id?: string) => void,
	setDialogState: (id: string, open: boolean) => void,
	context: ThemeContext | null
}
