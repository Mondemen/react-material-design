import Icon, { convertIconDefinition, IconProvider, type IconDefinition } from "@components/Icon/Icon";
import type { PolymorphicComponent } from "@components/misc/Polymorphic";
import Polymorphic from "@components/misc/Polymorphic";
import StateLayer from "@components/misc/StateLayer";
import Transitionable from "@components/misc/Transitionable";
import classNames from "classnames";
import { useCallback, useMemo, useState, type ElementType, type MouseEvent, type MouseEventHandler } from "react";

import "./style.scss";

export interface ChipVariantProps
{
	elevated?: boolean,
}

export interface ChipCommonProps<T = any>
{
	tooltip?: string
	disabled?: boolean,
	data?: T
}

export interface ChipAssistProps<T = any> extends ChipCommonProps<T>, ChipVariantProps
{
	variant: "assist",
	icon?: IconDefinition
	label: string,
}

export interface ChipFilterProps<T = any> extends ChipCommonProps<T>, ChipVariantProps
{
	variant: "filter",
	label: string | ((selected: boolean, data: T) => string),
	selected?: boolean,
	defaultSelected?: boolean,
	selectable?: boolean,
	onSelected?: (selected: boolean, data: T) => void
}

export interface ChipInputProps<T = any> extends ChipCommonProps<T>
{
	variant: "input",
	selectable?: false,
	icon?: IconDefinition | ((data: T) => IconDefinition),
	label: string | ((data: T) => string),
	deletable?: boolean,
	onDelete?: (data: T) => void
}

export interface SelectableChipInputProps<T = any> extends ChipCommonProps<T>
{
	variant: "input",
	selectable: true,
	icon?: IconDefinition | ((data: T) => IconDefinition),
	label: string | ((data: T) => string),
	selected?: boolean,
	defaultSelected?: boolean,
	deletable?: boolean,
	onSelected?: (selected: boolean, data: T) => void
	onDelete?: (data: T) => void
}

export interface ChipSuggestionProps<T = any> extends ChipCommonProps<T>, ChipVariantProps
{
	variant: "suggestion"
	icon?: IconDefinition | ((data: T) => IconDefinition),
	label: string
}

export type ChipProps<As extends ElementType, T = any> = PolymorphicComponent<"Chip", As, "button", ChipAssistProps<T> | ChipFilterProps<T> | ChipInputProps<T> | SelectableChipInputProps<T> | ChipSuggestionProps<T>>;

const NativeProps =
[
	"elevated",
	"tooltip",
	"disabled",
	"variant",
	"icon",
	"label",
	"selectable",
	"selected",
	"defaultSelected",
	"onSelected",
	"deletable",
	"onDelete"
];

export default function Chip<As extends ElementType = "button", T = any>(props: ChipProps<As, T>)
{
	const {variant, label: propsLabel, disabled, onClick: onClickExternal} = props;
	const elevated = variant === "assist" || variant === "filter" || variant === "suggestion" ? (props.elevated ?? false) : false;
	const propsIcon = variant === "assist" || variant === "input" || variant === "suggestion" ? props.icon : undefined;
	const selectable = "selectable" in props ? (props.selectable ?? false) : false;
	const externalSelected: boolean | undefined = variant === "filter" || (variant === "input" && props.selectable === true && "selected" in props) ? props.selected : undefined;
	const onSelected: ChipFilterProps["onSelected"] = variant === "filter" || (variant === "input" && props.selectable === true && "onSelected" in props) ? props.onSelected : undefined;
	const deletable = variant === "input" ? (props.deletable ?? false) : false;
	const onDelete = variant === "input" ? props.onDelete : undefined;
	// const isSelectable = useCallback((props: ChipProps<As>): props is ChipFilterProps | SelectableChipInputProps => props.type === "filter" || (props.type === "input" && !!props.selectable), []);
	const [internalSelected, setSelected] = useState((variant === "filter" || (variant === "input" && props.selectable === true && "selected" in props) ? (props.defaultSelected ?? externalSelected) : false) ?? false);
	const selected = externalSelected ?? internalSelected;
	const classList = useMemo(() =>
	({
		Chip: true,
		[variant]: true,
		[elevated ? "elevated" : "flat"]: true,
		selected: (variant === "filter" || (variant === "input" && selectable === true) ? selected : false) ?? false,
		disabled: disabled
	}) satisfies Record<string, any>, [variant, elevated, selectable, selected, disabled]);
	const iconDefinition = useMemo(() =>
	{
		let icon: IconDefinition;

		if (variant === "assist")
			icon = (typeof propsIcon === "function") ? propsIcon?.(props.data as any) : propsIcon;
		else if (variant === "filter")
			icon = classList.selected ? "check" : undefined;
		else if (variant === "input" && selectable)
			icon = (typeof propsIcon === "function") ? propsIcon?.(props.data as any) : propsIcon;
		else if (variant === "input")
			icon = (typeof propsIcon === "function") ? propsIcon?.(props.data as any) : propsIcon;
		else if (variant === "suggestion")
			icon = (typeof propsIcon === "function") ? propsIcon?.(props.data as any) : propsIcon;
		return (icon);
	}, [classList.selected, props.data, propsIcon, selectable, variant]);
	const leadingIcon = useMemo(() => convertIconDefinition(iconDefinition), [iconDefinition]);
	const trailingIcon = useMemo(() =>
	{
		if (variant === "input" && deletable)
		{
			return (
				<div
					className="delete-button"
					onClick={event =>
					{
						event.stopPropagation();
						onDelete?.(props.data as any);
					}}
					onKeyDown={event =>
					{
						switch (event.code.toLowerCase())
						{
							case "enter":
							case "space":
							{
								event.preventDefault();
								event.currentTarget.click();
								break;
							}
						}
					}}
					tabIndex={0}
				>
					<StateLayer subLayer disabled={disabled}/>
					<Icon name="close"/>
				</div>
			);

		}
		return (null);
	}, [deletable, disabled, onDelete, props.data, variant]);
	const label = useMemo(() =>
	{
		let label: string | undefined;

		if (variant === "filter")
			label = (typeof propsLabel === "function") ? propsLabel?.(classList.selected, props.data as any) : propsLabel;
		else if (variant === "input" && selectable)
			label = (typeof propsLabel === "function") ? propsLabel?.(props.data as any) : propsLabel;
		else if (variant === "input")
			label = (typeof propsLabel === "function") ? propsLabel?.(props.data as any) : propsLabel;
		else
			label = propsLabel;
		return (label);
	}, [classList.selected, props.data, propsLabel, selectable, variant]);
	const onClick = useCallback((event: MouseEvent<HTMLElement>) =>
	{
		if (selectable)
		{
			if (externalSelected === undefined)
				setSelected(!selected);
			onSelected?.(!selected, props.data as any);
		}
		(onClickExternal as MouseEventHandler)?.(event);
	}, [selectable, onClickExternal, externalSelected, selected, onSelected, props.data]);
	const propsObject = useMemo(() =>
	{
		const propsExtra = {...props};

		propsExtra.className = classNames(classList, {icon: leadingIcon || trailingIcon, leading: leadingIcon, trailing: trailingIcon, label}, props.className);
		propsExtra["aria-label"] = label;
		propsExtra.role = "button";
		// propsExtra.type = "button";
		propsExtra.onClick = onClick;
		return (propsExtra);
	}, [classList, trailingIcon, leadingIcon, label, onClick, props]);

	const render = useMemo(() =>
	{
		switch (variant)
		{
			case "assist":
			{
				return (
					<>
						<Transitionable value={leadingIcon} className="icon leading"/>
						<Transitionable value={label} className="label"/>
					</>
				);
			}
			case "filter":
			{
				return (
					<>
						<Transitionable value={leadingIcon} className="icon leading"/>
						<Transitionable value={label} className="label"/>
						{/* <Transitionable value={icon} className="icon trailing"/> */}
					</>
				);
			}
			case "input":
			{
				return (
					<>
						{leadingIcon && <Transitionable value={leadingIcon} className="icon leading"/>}
						<Transitionable value={label} className="label"/>
						{trailingIcon && <Transitionable value={trailingIcon} className="icon trailing"/>}
					</>
				);
			}
		}
	}, [variant, leadingIcon, label, trailingIcon]);

	return (
		<Polymorphic
			name="Chip"
			as={props.as}
			base="button"
			props={propsObject}
			excludePropsName={NativeProps}
			disabled={props.disabled}
		>
			<StateLayer disabled={props.disabled}/>
			{props.tooltip}
			<IconProvider fill={(selectable ? selected : false) ?? false}>
				{render}
			</IconProvider>
		</Polymorphic>
	);
}