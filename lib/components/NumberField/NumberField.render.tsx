import IconButton from "@components/Button/icon";
import FilledField from "@components/containers/FilledField";
import OutlinedField from "@components/containers/OutlinedField";
import Icon, { convertIconDefinition } from "@components/Icon/Icon";
import StateLayer from "@components/misc/StateLayer";
import { clamp, isBrowser } from "@utils";
import classNames from "classnames";
import { useCallback, useMemo, useRef, useState, type ChangeEventHandler, type FocusEventHandler, type KeyboardEventHandler, type ReactEventHandler } from "react";
import { useWindowEventListener } from "react-dom-event-hooks";

import "./style.scss";
import type { TextFieldBaseProps } from "@components/TextField/TextField.render";

function getDecimalSeparator(locale: string | string[] | undefined, separatorType: Intl.NumberFormatPartTypes = "decimal")
{
	const number = 1000.1;

	return (Intl.NumberFormat(locale).formatToParts(number).find(part => part.type === separatorType)?.value as string);
}

function add(a: number, b: number, min: number, max: number, positions = 4)
{
	const factor = Math.pow(10, positions);

	return (clamp(((a.toFixed(positions) as any) * factor + (b.toFixed(positions) as any) * factor) / factor, min, max));
}
function sub(a: number, b: number, min: number, max: number, positions = 4)
{
	const factor = Math.pow(10, positions);

	return (clamp(((a.toFixed(positions) as any) * factor - (b.toFixed(positions) as any) * factor) / factor, min, max));
}

export interface NumberFieldProps extends Omit<TextFieldBaseProps, "type" | "minLength" | "maxLength" | "pattern">
{
	onValueChange?: (value: number) => void,
	defaultValue?: number,
	value?: number,
	hugeStep?: number | undefined,
	decimal?: number,
	hideArrow?: boolean
}

export default function NumberFieldRender(props: NumberFieldProps)
{
	const {shape, label, onValueChange, onChange: onChangeExternal, onInvalid: onInvalidExternal, value: externalValue, supportingText, clearable, decimal, hugeStep: hugeStepValue, hideArrow, leadingIcon: leadingIconProp, trailingIcon: trailingIconProp, prefix, suffix, ...inputProps} = props;
	const ref = useRef<HTMLInputElement>(null);
	const [internalValue, setInternalValue] = useState(externalValue?.toString() ?? props.defaultValue?.toString() ?? "");
	const value = externalValue?.toString() ?? internalValue;
	const [focus, setFocus] = useState(false);
	const [error, setError] = useState<string>();
	const [badFormat, setBadFormat] = useState(false);
	const shiftKey = useRef(false);
	const repeatFn = useRef<NodeJS.Timeout>(null);
	const repeatTimeout = useRef<NodeJS.Timeout>(null);
	const setShiftKey = useCallback((event: KeyboardEvent) => shiftKey.current = event.shiftKey, []);
	const filled = typeof props.value === "number" || !!value.length || badFormat || !!props.placeholder;
	const supportMessage = error ?? supportingText;
	const lang = props.lang ?? (isBrowser() ? window.navigator.language : undefined);
	const min = props.min !== undefined ? parseFloat(props.min.toString()) : undefined;
	const max = props.max !== undefined ? parseFloat(props.max.toString()) : undefined;
	const step = props.step !== undefined ? parseFloat(props.step.toString()) : undefined;
	const hugeStep = hugeStepValue !== undefined ? parseFloat(hugeStepValue.toString()) : undefined;
	const fullLabel = label ? (label + (props.required ? "*" : "")) : undefined;
	const setInputValue = useCallback((value: string) =>
	{
		if (externalValue === undefined)
			setInternalValue(value);
		setError(undefined);
		setBadFormat(false);
			onValueChange?.(parseFloat(value));
	}, [externalValue, onValueChange]);
	const onChange = useCallback<ChangeEventHandler<HTMLInputElement>>(event =>
	{
		setInputValue(event.target.value);
		onChangeExternal?.(event);
	}, [onChangeExternal, setInputValue]);
	const stopRepeat = useCallback(() =>
	{
		if (repeatTimeout.current !== null)
			clearTimeout(repeatTimeout.current);
		if (repeatFn.current !== null)
			clearInterval(repeatFn.current);
	}, []);
	const increment = useCallback((repeat = true) =>
	{
		const minV = min ?? -Infinity, maxV = max ?? Infinity;
		const getStep = () => clamp((shiftKey.current ? (hugeStep ?? step) : step) ?? 1, minV, maxV);

		setInputValue(add(parseFloat((value ? value : `${min ?? 0}`)), getStep(), minV, maxV).toString());
		if (!repeat)
			return;
		stopRepeat();
		repeatTimeout.current = setTimeout(() => repeatFn.current = setInterval(() => setInputValue(add(parseFloat((ref.current?.value ? ref.current.value : `${min ?? 0}`)), getStep(), minV, maxV).toString()), 20), 400);
	}, [hugeStep, max, min, setInputValue, step, stopRepeat, value]);
	const decrement = useCallback((repeat = true) =>
	{
		const minV = min ?? -Infinity, maxV = max ?? Infinity;
		const getStep = () => clamp((shiftKey.current ? (hugeStep ?? step) : step) ?? 1, min ?? -Infinity, max ?? Infinity);

		setInputValue(sub(parseFloat((value ? value : `${min ?? 0}`)), getStep(), minV, maxV).toString());
		if (!repeat)
			return;
		stopRepeat();
		repeatTimeout.current = setTimeout(() => repeatFn.current = setInterval(() => setInputValue(sub(parseFloat((ref.current?.value ? ref.current.value : `${min ?? 0}`)), getStep(), minV, maxV).toString()), 20), 400);
	}, [hugeStep, max, min, setInputValue, step, stopRepeat, value]);
	const onMouseInc = useCallback(() => increment(), [increment]);
	const onMouseDec = useCallback(() => decrement(), [decrement]);
	const onFocus = useCallback(() => setFocus(true), []);
	const onBlur = useCallback<FocusEventHandler<HTMLInputElement>>(event =>
	{
		setFocus(false);
		if (ref.current?.validity.badInput)
			setBadFormat(true);
		else if (ref.current?.validity.valid)
			event.currentTarget.value = event.currentTarget.valueAsNumber.toString();
	}, []);
	const onInvalid = useCallback<ReactEventHandler<HTMLInputElement>>(event =>
	{
		event.preventDefault();
		setError(event.currentTarget.validationMessage);
		onInvalidExternal?.(event);
		event.currentTarget.focus();
	}, [onInvalidExternal]);
	const leadingIcon = useMemo(() => convertIconDefinition(leadingIconProp), [leadingIconProp]);
	const trailingIconDefinition = useMemo(() =>
	{
		if (clearable)
			return (<IconButton icon={trailingIconProp ?? "close"} color="standard" onClick={() => setInputValue("")} className="trailing"/>)
		else if (error)
			return (<Icon name="error" fill className="error"/>)
		return (trailingIconProp);
	}, [clearable, trailingIconProp, error, setInputValue]);
	const trailingIcon = useMemo(() => convertIconDefinition(trailingIconDefinition), [trailingIconDefinition]);
	const onKeyDown = useCallback<KeyboardEventHandler<HTMLInputElement>>(event =>
	{
		const separator = getDecimalSeparator(lang);

		if (event.ctrlKey)
			return;
		if (new RegExp(`^[^\\d.${separator}]$`).test(event.key))
			event.preventDefault();
		if (shiftKey.current && (event.code ==="ArrowDown" || event.code ==="ArrowUp"))
		{
			event.preventDefault();
			if (event.code ==="ArrowUp")
				increment(false);
			else if (event.code ==="ArrowDown")
				decrement(false);
		}
	}, [lang, increment, decrement]);

	const input = useMemo(() =>
	(
		<input
			{...inputProps}
			ref={ref}
			type="number"
			lang={lang}
			required={props.required}
			onFocus={onFocus}
			onBlur={onBlur}
			value={value}
			onChange={onChange}
			onKeyDown={onKeyDown}
			onInvalid={onInvalid}
			title=""
		/>
	), [inputProps, lang, onBlur, onChange, onFocus, onInvalid, onKeyDown, props.required, value]);
	const content = useMemo(() =>
	{
		if (shape === "filled")
		{
			return (
				<>
					{leadingIcon}
					<div className="container" onMouseDown={() => requestAnimationFrame(() => ref.current?.focus())}>
						{label && <span className="label">{fullLabel}</span>}
						<div className={classNames("content", {prefix, suffix})}>
							{prefix && <span className="prefix">{prefix}</span>}
							{input}
							{suffix && <span className="suffix">{suffix}</span>}
						</div>
					</div>
					{trailingIcon}
					{!hideArrow &&
					(
						<div className="arrow">
							<div className="button" onMouseDown={onMouseInc}>
								<StateLayer/>
								<Icon name="keyboard_arrow_up"/>
							</div>
							<div className="button" onMouseDown={onMouseDec}>
								<StateLayer/>
								<Icon name="keyboard_arrow_down"/>
							</div>
						</div>
					)}
				</>
			);
		}
		return (
			<>
				{leadingIcon}
				<div className={classNames("content", {prefix, suffix})}>
					{prefix && <span className="prefix">{prefix}</span>}
					{input}
					{suffix && <span className="suffix">{suffix}</span>}
				</div>
				{trailingIcon}
				{!hideArrow &&
				(
					<div className="arrow">
						<div className="button" onMouseDown={onMouseInc}>
							<StateLayer/>
							<Icon name="keyboard_arrow_up"/>
						</div>
						<div className="button" onMouseDown={onMouseDec}>
							<StateLayer/>
							<Icon name="keyboard_arrow_down"/>
						</div>
					</div>
				)}
			</>
		);
	}, [shape, leadingIcon, prefix, suffix, input, trailingIcon, hideArrow, onMouseInc, onMouseDec, label, fullLabel]);

	useWindowEventListener("keydown", setShiftKey);
	useWindowEventListener("keyup", setShiftKey);
	useWindowEventListener("mouseup", stopRepeat);

	return (
		<div className={classNames("TextField", "NumberField", {error})}>
			{shape === "filled" ?
			(
				<FilledField label={fullLabel} filled={filled || !!props.prefix} focus={focus} error={!!error} className={classNames({leadingIcon, trailingIcon})}>
					{content}
				</FilledField>
			) :
			(
				<OutlinedField label={fullLabel} filled={filled || !!props.prefix} focus={focus} error={!!error} className={classNames({leadingIcon, trailingIcon})}>
					{content}
				</OutlinedField>
			)}
			{supportMessage && <div className="support">
				<div className="message">{supportMessage}</div>
			</div>}
		</div>
	);
}
