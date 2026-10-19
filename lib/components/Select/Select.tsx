import IconButton from "@components/Button/icon";
import Chip from "@components/Chip";
import FilledField from "@components/containers/FilledField";
import OutlinedField from "@components/containers/OutlinedField";
import Menu, {MenuItem} from "@components/Menu";
import OrderedCollection from "@components/misc/OrderedCollection";
import type { OptionProps } from "@components/Select/Option";
import { isBrowser } from "@utils";
import classNames from "classnames";
import type { PropsWithChildren, SelectHTMLAttributes } from "react";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { useWindowEventListener } from "react-dom-event-hooks";
import FloatingElement, { type FloatingElementProps } from "@components/misc/FloatingElement";
import { useTheme } from "@components/Theme/Theme";
import type { Side } from "@hooks/useFloating/types";

import "./style.scss";

function isMobile()
{
	if (isBrowser())
		return /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
	return (false);
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange" | "value" | "defaultValue">
{
	shape?: "filled" | "outlined",
	label?: string,
	defaultMenuIsOpen?: boolean,
	clearable?: boolean,
	searchable?: boolean,
	noOptionMessage?: string | null,
	hideErrorText?: boolean,
	supportingText?: string,
	tabIndex?: number,
	hideDropdownIndicator?: boolean,
	onMenuOpen?: () => void,
	onMenuClose?: () => void
}

export interface SingleSelectProps<T extends string | number = string> extends SelectProps
{
	multiple?: false,
	defaultValue?: T,
	value?: T,
	onValueChange?: (value: T | undefined) => void,
	onChange?: (newValue: OptionProps<T> | undefined) => void,
	small?: boolean
}

export interface MultiSelectProps<T extends string | number = string> extends SelectProps
{
	multiple: true,
	defaultValue?: T[],
	value?: T[],
	onValueChange?: (values: T[]) => void,
	onChange?: (newValue: OptionProps<T>[]) => void
}

export default function Select<T extends string | number = string>(props: PropsWithChildren<SingleSelectProps<T> | MultiSelectProps<T>>)
{
	const {shape, value: externalValue, multiple, searchable, supportingText, onValueChange, onChange, onInvalid} = props;
	const {popoversContainer} = useTheme("Select");
	const ref = useRef<HTMLDivElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const [options, setOptions] = useState<OptionProps<T>[]>([]);
	const [mobile, setMobile] = useState(isMobile());
	const [entry, setEntry] = useState("");
	const [internalValue, setInternalValue] = useState(props.value ?? props.defaultValue);
	const value = useMemo(() =>
	{
		let value = externalValue ?? internalValue;

		if (multiple)
			value ??= [];
		if (Array.isArray(value))
			return (value.map(value => options?.find(option => option.value === value)).filter(((value): value is OptionProps<T> => !!value)) );
		return (options?.find(option => option.value === value));
	}, [externalValue, internalValue, multiple, options]);
	const filteredOptions = useMemo(() => options.filter(option => option && (option.label ?? option.value.toString()).includes(entry)), [entry, options]);
	const fullLabel = props.label ? (props.label + (props.required ? "*" : "")) : undefined;
	const menuRef = useRef<HTMLDivElement>(null);
	const lock = useRef(false);
	const valueExists = (Array.isArray(value) && !!value.length) || (!Array.isArray(value) && value !== undefined);
	const filled = valueExists || !!entry.length;
	const [focus, setFocus] = useState(props.defaultMenuIsOpen ?? false);
	const [menuOpen, setIsMenuOpen] = useState(props.defaultMenuIsOpen ?? false);
	const isMenuOpen = useRef(props.defaultMenuIsOpen ?? false);
	const [error, setError] = useState<string>();
	const [validationError, setValidationError] = useState(false);
	const supportMessage = error ?? supportingText;
	const [side, setSide] = useState<Side | null>(null);
	const setMenuPlacement = useCallback<FloatingElementProps["onPlacementChange"] & {}>(placement => setSide(placement.split("-")[0] as Side), []);
	const currentOptions = options?.filter(option =>
	{
		if (props.multiple)
			return (!props.value?.includes(option.value));
		return (true);
	}).filter(options => !entry || options.label?.toLowerCase().includes(entry.trim().toLowerCase()));
	const [focusedOption, setFocusedOption] = useState<number | null>(options?.findIndex(option => (Array.isArray(value) && value.at(0)?.value === option.value) || (!Array.isArray(value) && value?.value === option.value)) ?? null);
	const inputValidation = useMemo(() =>
	(
		<input
			required={props.required}
			value={valueExists ? "true" : ""}
			onChange={() => {}}
			onInvalid={(event) =>
			{
				setValidationError(true);
				setError(event.currentTarget.validationMessage);
				event.preventDefault();
			}}
			style={{display: "none"}}
		/>
	), [props.required, valueExists]);

	const compareOption = useCallback((previous: OptionProps<T>, current: OptionProps<T>) =>
	{
		if (previous.label !== current.label) return (false);
		if (previous.value !== current.value) return (false);
		if (previous.icon !== current.icon) return (false);
		if (previous.className !== current.className) return (false);
		if (previous.disabled !== current.disabled) return (false);
		if (previous.default !== current.default) return (false);
		return (true);
	}, []);

	const setMenuOpen = useCallback((open: boolean) =>
	{
		setIsMenuOpen(open);
		isMenuOpen.current = open;
	}, []);
	const onMouseDown = useCallback(() =>
	{
		setMenuOpen(true);
		inputRef.current?.focus();
	}, [setMenuOpen]);
	const setValue = useCallback((newValue?: T) =>
	{
		let newValues: T[];

		if (multiple && Array.isArray(value))
		{
			if (newValue === undefined)
				return (onValueChange?.([]));
			newValues = value.map(({value}) => value);
			if (newValues.includes(newValue))
				newValues = newValues.filter(value => value !== newValue);
			else
				newValues.push(newValue);
			if (externalValue === undefined)
				setInternalValue(newValues);
			onValueChange?.(newValues);
			onChange?.(options?.filter(option => newValues.includes(option.value)) ?? []);
		}
		else if (!multiple)
		{
			if (externalValue === undefined)
				setInternalValue(newValue);
			onValueChange?.(newValue);
			onChange?.(options?.find(option => newValues.includes(option.value)));
		}
	}, [externalValue, multiple, onChange, onValueChange, options, value]);

	const onEntrySelect = useCallback((event: React.KeyboardEvent<HTMLInputElement>) =>
	{
		let currentOptionIndex: number | undefined;
		let option: OptionProps<T> | undefined;
		let index: number;

		if (props.disabled)
			return;
		switch (event.code)
		{
			case "ArrowDown":
			case "ArrowRight":
			{
				if (event.code === "ArrowRight" && menuOpen)
					break;
				if (currentOptions)
				{
					if (menuOpen)
					{
						index = focusedOption !== null ? ((focusedOption + 1) % currentOptions.length) : 0;
						setFocusedOption(index);
					}
					else if (!multiple)
					{
						index = Math.max(0, Math.min(currentOptions.length - 1, focusedOption !== null ? (focusedOption + 1) : 0));
						setFocusedOption(index);
						option = currentOptions?.at(index);
						if (option)
							setValue(option.value);
					}
				}
				event.preventDefault();
				break;
			}
			case "ArrowUp":
			case "ArrowLeft":
			{
				if (currentOptions)
				{
					if (event.code === "ArrowLeft" && menuOpen)
						break;
					if (menuOpen)
					{
						index = (focusedOption !== null && focusedOption > 0) ? ((focusedOption - 1) % currentOptions.length) : (currentOptions.length - 1);
						setFocusedOption(index);
					}
					else if (!multiple)
					{
						index = Math.max(0, Math.min(currentOptions.length - 1, focusedOption !== null ? (focusedOption - 1) : (currentOptions.length - 1)));
						setFocusedOption(index);
						option = currentOptions?.at(index);
						if (option)
							setValue(option.value);
					}
				}
				event.preventDefault();
				break;
			}
			case "Space":
			{
				if (focus && !menuOpen)
					setMenuOpen(true);
				break;
			}
			case "Enter":
			case "NumpadEnter":
			{
				option = focusedOption !== null ? currentOptions?.at(focusedOption) : undefined;
				if (option)
				{
					setValue(option.value);
					if (error)
						setError(undefined);
					setValidationError(false);
					containerRef.current?.classList.remove("invalid");
				}
				setMenuOpen(false);
				setEntry("");
				break;
			}
			case "Escape":
			{
				setMenuOpen(false);
				setEntry("");
				currentOptionIndex = currentOptions?.findIndex(opt => opt.label === internalValue || opt.value === internalValue);
				setFocusedOption(currentOptionIndex === undefined ? null : (currentOptionIndex < 0 ? null : currentOptionIndex));
				break;
			}
		}
	}, [currentOptions, error, focus, focusedOption, internalValue, menuOpen, multiple, props.disabled, setMenuOpen, setValue]);

	const deleteValue = useCallback((value: T) => setValue(value), [setValue]);
	const chipValues = useMemo(() =>
	{
		if (multiple && Array.isArray(value))
		{
			return (value.map(value =>
			(
				<Chip
					key={value.value}
					variant="input"
					label={value.label ?? value.value.toString()}
					data={value.value}
					type="button"
					tabIndex={-1}
					selectable={false}
					deletable
					onDelete={deleteValue}
					disabled={props.disabled}
				/>
			)));
		}
		return (null);
	}, [deleteValue, multiple, props.disabled, value]);

	const content = useMemo(() =>
	(
		<>
			<div className="control" onMouseDown={onMouseDown}>
				{chipValues}
				<input
					ref={inputRef}
					className={classNames({searchable: searchable})}
					value={focus ? entry : ""}
					placeholder={!Array.isArray(value) ? (value?.label ?? value?.value.toString()) : ""}
					readOnly={!searchable}
					disabled={props.disabled}
					onChange={event =>
					{
						setEntry(event.target.value);
						if (!menuOpen && event.target.value)
							setMenuOpen(true);
					}}
					onKeyDown={onEntrySelect}
					onMouseDown={() =>
					{
						if (props.disabled)
							return;
						setMenuOpen(!menuOpen);
						setEntry("");
					}}
					onFocus={() =>
					{
						if (props.disabled)
							return;
						setFocus(true);
						setMenuOpen(true);
						setEntry("");
					}}
					onBlur={() =>
					{
						if (props.disabled)
							return;
						if (lock.current)
							return;
						setFocus(false);
						// setMenuOpen(false);
					}}
				/>
			</div>
			{props.clearable &&
			(
				<IconButton
					className="clear-indicator"
					color="standard"
					icon="close"
					onClick={event => {event.preventDefault(); setValue();}}
					onTouchEnd={event => {event.preventDefault(); setValue();}}
					tabIndex={-1}
					disabled={props.disabled}
				/>
			)}
			<IconButton
				className={classNames("dropdown-indicator", {open: menuOpen})}
				color="standard"
				icon={!menuOpen ? "arrow_drop_down" : "arrow_drop_up"}
				tabIndex={-1}
				onMouseUp={() =>
				{
					if (props.disabled)
						return;
					setMenuOpen(!menuOpen);
					setEntry("");
				}}
				disabled={props.disabled}
				type="button"
			/>
		</>
	), [chipValues, entry, focus, menuOpen, onEntrySelect, onMouseDown, props.clearable, props.disabled, searchable, setMenuOpen, setValue, value]);

	useWindowEventListener("resize", () => setMobile(isMobile()));
	useWindowEventListener("mousedown", event =>
	{
		if (!ref.current?.contains(event.target as Node))
		{
			setMenuOpen(false);
			setFocus(false);
		}
	});

	return (
		<div ref={ref} className={classNames("Select", {error: error || validationError}, props.className)}>
			{inputValidation}
			{shape === "filled" ?
			(
				<FilledField disabled={props.disabled} label={fullLabel} filled={filled} focus={focus || menuOpen} error={!!error || validationError} className={classNames({searchable})}>
					{content}
				</FilledField>
			) :
			(
				<OutlinedField disabled={props.disabled} label={fullLabel} filled={filled} focus={focus || menuOpen} error={!!error || validationError} className={classNames({searchable})}>
					{content}
				</OutlinedField>
			)}
			{supportMessage && <span className="support">{supportMessage}</span>}
			<select
				multiple={multiple}
				value={Array.isArray(value) ? value.map(value => value.value.toString()) : value?.value}
				tabIndex={props.tabIndex}
				onFocus={props.onFocus}
				onInvalid={event =>
				{
					event.preventDefault();
					setError(event.currentTarget.validationMessage);
					onInvalid?.(event);
					event.currentTarget.focus();
				}}
				style={{display: mobile ? "block" : "none"}}
				onChange={event =>
				{
					const valueList: T[] = [];
					let newValue: OptionProps<T>[];

					for (let i = 0; i < event.target.selectedOptions.length; i++)
						valueList.push(event.target.selectedOptions[i].value as T);
					newValue = options.filter(option => valueList.includes(option.value)) ?? [];
					if (multiple)
					{
						onValueChange?.(valueList);
						onChange?.(newValue);
					}
					else
					{
						onValueChange?.(valueList.at(0) ?? "" as T);
						onChange?.(newValue.at(0));
					}
					if (error)
						setError(undefined);
					setValidationError(false);
					containerRef.current?.classList.remove("invalid");
				}}
				required={props.required}
			>
				{filteredOptions?.map((option) => (
					<option
						key={option.value as string}
						value={option.value as string}
						label={option.label}
					/>
				))}
			</select>
			<FloatingElement
				root={popoversContainer}
				flip={useMemo(() => ({allowedPlacements: ["top-start", "top-end", "bottom-start", "bottom-end"]}), [])}
				autoUpdate
				placement="bottom-start"
				open={menuOpen}
				onPlacementChange={setMenuPlacement}
			>
				<Menu
					ref={menuRef}
					className={classNames("sub-component", side, {visible: menuOpen})}
					onMouseEnter={() => {lock.current = true}}
					onMouseLeave={() => {lock.current = false}}
				>
					{filteredOptions?.map((option, index) =>
					(
						<MenuItem
							key={option.value}
							icon={option.icon}
							text={option.label ?? option.value.toString()}
							type="button"
							disabled={option.disabled}
							tabIndex={-1}
							selectable
							selected={(multiple && Array.isArray(value) && value.some(value => value.value === option.value)) || !Array.isArray(value) && value?.value === option.value}
							className={classNames(option.className, {hovered: focusedOption === index})}
							onClick={() =>
							{
								setValue(option.value);
								inputRef.current?.focus();
								// setFocus(false);
								// setMenuOpen(false);
								if (error)
									setError(undefined);
								setValidationError(false);
								containerRef.current?.classList.remove("invalid");
							}}
							onMouseEnter={() =>
							{
								if (isMenuOpen.current)
									setFocusedOption(index);
							}}
						/>
					))}
					{!options.length && props.noOptionMessage ? <MenuItem text={props.noOptionMessage} style={{justifyContent: "center", cursor: "default"}}/> : null}
				</Menu>
			</FloatingElement>
			<OrderedCollection<OptionProps<T>> childName="Option" onChildrenChange={setOptions} compareChild={compareOption}>{props.children}</OrderedCollection>
		</div>
	);
}