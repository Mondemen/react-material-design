import type { ButtonProps } from "@components/Button/default";
import ButtonRender from "@components/Button/default/render";
import type { IconButtonProps } from "@components/Button/icon";
import IconButtonRender from "@components/Button/icon/render";
import OrderedCollection, { type OrderedCollectionChildData } from "@components/misc/OrderedCollection";
import Transitionable from "@components/misc/Transitionable";
import { getComponentSizeName } from "@components/types";
import { shallowEqual } from "@utils";
import classNames from "classnames";
import type React from "react";
import { createContext, useContext, useEffect, useId, useMemo, useState } from "react";
import { type CommonButtonProps } from "../types";

import "./style.scss";

interface BaseButtonGroupProps extends Pick<CommonButtonProps, "size" | "shape">, Omit<React.ButtonHTMLAttributes<HTMLElement>, "type">
{
	position?: "top" | "bottom",
	selectable?: false,
	children?: React.ReactNode
}

export interface BaseButtonGroupSelectable
{
	position?: "top" | "bottom",
	required?: boolean,
	requiredMessage?: string
}

export interface BaseButtonGroupSingleSelection extends BaseButtonGroupSelectable
{
	selectable: "single",
	selected?: string,
	onSelected?: (id: string | undefined) => void
}

export interface BaseButtonGroupMultipleSelection extends BaseButtonGroupSelectable
{
	selectable: "multiple",
	selected?: string[],
	onSelected?: (ids: string[]) => void
}

export interface StandardButtonGroupProps extends BaseButtonGroupProps
{
	type?: "standard",
	align?: "left" | "center" | "right",
}

export interface StandardButtonGroupSingleSelectionProps extends Omit<StandardButtonGroupProps, "selectable">, BaseButtonGroupSingleSelection {}
export interface StandardButtonGroupMultipleSelectionProps extends Omit<StandardButtonGroupProps, "selectable">, BaseButtonGroupMultipleSelection {}

export interface ConnectedButtonGroupProps extends BaseButtonGroupProps
{
	type: "connected"
}

export interface ConnectedButtonGroupSingleSelectionProps extends Omit<ConnectedButtonGroupProps, "selectable">, BaseButtonGroupSingleSelection {}
export interface ConnectedButtonGroupMultipleSelectionProps extends Omit<ConnectedButtonGroupProps, "selectable">, BaseButtonGroupMultipleSelection {}

type ButtonGroupSelectionProps =
	| StandardButtonGroupSingleSelectionProps
	| StandardButtonGroupMultipleSelectionProps
	| ConnectedButtonGroupSingleSelectionProps
	| ConnectedButtonGroupMultipleSelectionProps;

export type ButtonGroupProps =
	| StandardButtonGroupProps
	| ConnectedButtonGroupProps
	| ButtonGroupSelectionProps;

export interface ButtonGroupContext
{
	size: CommonButtonProps["size"],
	selectable: boolean,
	required: boolean,
	readonly selected: Map<string, boolean>,
	onSelected: (id: string, selected: boolean) => void
	onPressed: (id: string, ref: HTMLElement, pressed: boolean) => void,
}

const NativeProps: string[] =
[
	"type",
	"align",
	"size",
	"shape",
	"selectable",
	"selected",
	"onSelected",
	"required",
	"requiredMessage",
	"children"
];

function getNativeButtonGroupProps(props: ButtonGroupProps)
{
	const result: React.ComponentProps<any> = {...props};

	NativeProps.forEach(prop => delete result[prop as keyof typeof result])
	return (result);
}

export const ButtonGroupContext = createContext<ButtonGroupContext | null>(null);
export const useButtonGroupContext = () => useContext(ButtonGroupContext);

export default function ButtonGroupRender(props: ButtonGroupProps)
{
	const {onSelected} = props as ButtonGroupSelectionProps;
	const id = useId();
	const [buttonProps, setButtonProps] = useState<OrderedCollectionChildData<ButtonProps | IconButtonProps>[]>([]);
	const [error, setError] = useState<string>();
	const [selectedList, setSelectedList] = useState<string[]>([]);
	const acceptedChildren = useMemo(() => ["Button", "IconButton"], []);
	const classList: Record<string, any> = {};
	const context = useMemo<ButtonGroupContext>(() =>
	({
		size: props.size,
		selectable: !!props.selectable,
		required: !!(props.selectable && props.required),
		get selected() {return (buttonProps.reduce((list, props) => list.set(props.id, selectedList.includes(props.id)), new Map<string, boolean>()))},
		onSelected: (id, selected) =>
		{
			let newSelectedList: string[];

			if (props.selectable)
			{
				setError(undefined);
				if (props.selectable === "single")
				{
					newSelectedList = selected ? [id] : [];
					(onSelected as BaseButtonGroupSingleSelection["onSelected"])?.(selected ? id : undefined);
				}
				else
				{
					newSelectedList = [...selectedList];
					if (selected)
						newSelectedList.push(id);
					else
						newSelectedList = newSelectedList.filter(newId => newId !== id);
					(onSelected as BaseButtonGroupMultipleSelection["onSelected"])?.(newSelectedList);
				}
				setSelectedList(newSelectedList);
			}
		},
		onPressed: (_id, ref, pressed) =>
		{
			let size: number;
			let previousRef: HTMLElement | null = null;
			let nextRef: HTMLElement | null = null;

			if (props.type === "connected")
				return;
			if (ref?.previousElementSibling instanceof HTMLElement)
				previousRef = ref.previousElementSibling;
			if (ref?.nextElementSibling instanceof HTMLElement)
				nextRef = ref.nextElementSibling;
			if (pressed)
			{
				size = ref.getBoundingClientRect().width / 100 * 15;
				if (!previousRef && nextRef)
				{
					ref.style.setProperty("--button-width-extra", `${size / 2}px`);
					nextRef.style.setProperty("--button-width-extra", `-${size / 2}px`);
				}
				else if (previousRef && nextRef)
				{
					previousRef.style.setProperty("--button-width-extra", `-${size / 2}px`);
					ref.style.setProperty("--button-width-extra", `${size}px`);
					nextRef.style.setProperty("--button-width-extra", `-${size / 2}px`);
				}
				else if (previousRef && !nextRef)
				{
					previousRef.style.setProperty("--button-width-extra", `-${size / 2}px`);
					ref.style.setProperty("--button-width-extra", `${size / 2}px`);
				}
			}
			else
			{
				previousRef?.style.removeProperty("--button-width-extra");
				ref.style.removeProperty("--button-width-extra");
				nextRef?.style.removeProperty("--button-width-extra");
			}
		}
		// @ts-expect-error
	}), [buttonProps, onSelected, props.required, props.selectable, props.size, props.type, selectedList]);

	useEffect(() =>
	{
		if (props.selectable)
		{
			if (props.selectable === "single")
				setSelectedList(props.selected ? [props.selected] : []); // eslint-disable-line react-hooks/set-state-in-effect -- TO FIX
			else
				setSelectedList(props.selected ?? []);
		}
		// @ts-expect-error
	}, [props.selectable, props.selected]);

	classList["ButtonGroup"] = true;
	classList[props.type ?? "standard"] = true;
	if (props.type !== "connected")
		classList["align-" + (props.align ?? "left")] = true;
	classList[props.shape ?? "round"] = true;
	classList[getComponentSizeName(props.size)] = true;
	if (props.selectable)
	{
		classList["selectable"] = true;
		classList[props.selectable] = true;
	}
	return (
		<div {...getNativeButtonGroupProps(props)} className={classNames(classList, props.className)}>
			<div className="container">
				<ButtonGroupContext value={context}>
					{buttonProps.map(props =>
					{
						switch (props.orderedCollectionName)
						{
							case "Button":
								return (<ButtonRender key={props.id} {...props as ButtonProps}/>);
							case "IconButton":
								return (<IconButtonRender key={props.id} {...props as IconButtonProps}/>);
						}
					})}
					<OrderedCollection<ButtonProps | IconButtonProps> childName={acceptedChildren} onChildrenChange={setButtonProps} compareChild={shallowEqual}>{props.children}</OrderedCollection>
				</ButtonGroupContext>
			</div>
			{props.selectable && props.required && <Transitionable value={error} className="error"/>}
			<div style={useMemo(() => ({display: "none"}), [])}>
				{props.selectable && props.required && buttonProps.map((button, index) =>
				(
					<input
						key={button.id}
						type="radio"
						name={`group_${id}`}
						required={!index && !selectedList.length}
						defaultChecked={selectedList.includes(button.id)}
						onInvalid={event =>
						{
							setError((props.selectable ? props.requiredMessage : undefined) ?? event.currentTarget.validationMessage);
							event.preventDefault();
						}}
					/>
				))}
			</div>
		</div>
	)
}