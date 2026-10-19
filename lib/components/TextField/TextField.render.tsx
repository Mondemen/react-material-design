import IconButton from "@components/Button/icon";
import Icon, { type IconDefinition } from "@components/Icon";
import { convertIconDefinition } from "@components/Icon/Icon";
import FilledField from "@components/containers/FilledField";
import OutlinedField from "@components/containers/OutlinedField";
import { getMaxWords } from "@utils";
import classNames from "classnames";
import { useCallback, useMemo, useRef, useState, type InputHTMLAttributes, type MouseEventHandler } from "react";

import "./style.scss";

export interface TextFieldBaseProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "value">
{
	shape?: "filled" | "outlined",
	label?: string,
	supportingText?: string,
	leadingIcon?: IconDefinition,
	trailingIcon?: IconDefinition,
	prefix?: string,
	suffix?: string,
	clearable?: boolean
}

export interface TextFieldProps extends Omit<TextFieldBaseProps, "min" | "max" | "step">
{
	onValueChange?: (value: string) => void,
	defaultValue?: string,
	value?: string,
	counter?: boolean | "word"
}

export default function TextFieldRender(props: TextFieldProps)
{
	const {shape, label, onValueChange, onChange: onChangeExternal, onInvalid: onInvalidExternal, value: externalValue, supportingText, counter: isCounter = true, clearable, leadingIcon, trailingIcon: trailingIconValue, prefix, suffix, ...inputProps} = props;
	const ref = useRef<HTMLInputElement>(null);
	const [internalValue, setInternalValue] = useState(externalValue ?? props.defaultValue ?? "");
	const value = externalValue ?? internalValue;
	const filled = !!value.length;
	const [focus, setFocus] = useState(false);
	const [passwordVisibility, setPasswordVisibility] = useState(false);
	const fullLabel = label ? (label + (props.required ? "*" : "")) : undefined;
	const [error, setError] = useState<string>();
	const [counter, setCounter] = useState(0);
	const supportMessage = error ?? supportingText;
	const setInputValue = useCallback((value: string) =>
	{
		let wordCount: number;

		if (props.maxLength && isCounter === "word")
		{
			wordCount = value.match(/\b\w+\b/g)?.length ?? 0;
			if (wordCount >= props.maxLength)
				value = getMaxWords(value, props.maxLength);
			setCounter(wordCount);
		}
		else if (props.maxLength)
		{
			value = value.slice(0, props.maxLength);
			setCounter(value.length);
		}
		if (externalValue === undefined)
			setInternalValue(value);
		setError(undefined);
		onValueChange?.(value);
	}, [externalValue, isCounter, onValueChange, props.maxLength]);
	const clearValue = useCallback<MouseEventHandler>(event =>
	{
		event.preventDefault();
		setInputValue("");
	}, [setInputValue]);
	const trailingIcon = useMemo(() =>
	{
		if (props.type === "password")
			return (<IconButton selectable selected={passwordVisibility} icon={selected => trailingIconValue ?? (selected ? "visibility_off" : "visibility")} color="standard" onClick={() => setPasswordVisibility(!passwordVisibility)} className="trailing"/>)
		else if (clearable)
			return (<IconButton icon={trailingIconValue ?? "close"} color="standard" onClick={clearValue} className="trailing"/>)
		else if (error)
			return (<Icon name="error" fill className="error"/>)
		return (convertIconDefinition(trailingIconValue));
	}, [props.type, passwordVisibility, clearable, trailingIconValue, clearValue, error]);
	const input = useMemo(() =>
	(
		<input
			{...inputProps}
			ref={ref}
			type={props.type === "password" ? (passwordVisibility ? "text" : "password") : props.type}
			required={props.required}
			onFocus={() => setFocus(true)}
			onBlur={() => setFocus(false)}
			value={value}
			onChange={event =>
			{
				setInputValue(event.target.value);
				onChangeExternal?.(event);
			}}
			maxLength={props.maxLength && isCounter === "word" ? undefined : props.maxLength}
			onInvalid={event =>
			{
				event.preventDefault();
				setError(event.currentTarget.validationMessage);
				onInvalidExternal?.(event);
				event.currentTarget.focus();
			}}
			title=""
		/>
	), [inputProps, props.type, props.required, props.maxLength, passwordVisibility, value, isCounter, setInputValue, onChangeExternal, onInvalidExternal]);
	const content = useMemo(() =>
	{
		if (shape === "filled")
		{
			return (
				<>
					{convertIconDefinition(leadingIcon)}
					<div className="container" onMouseDown={() => requestAnimationFrame(() => ref.current?.focus())}>
						{label && <span className="label">{fullLabel}</span>}
						<div className={classNames("content", {prefix, suffix})}>
							{prefix && <span className="prefix">{prefix}</span>}
							{input}
							{suffix && <span className="suffix">{suffix}</span>}
						</div>
					</div>
					{trailingIcon}
				</>
			);
		}
		return (
			<>
				{convertIconDefinition(leadingIcon)}
				<div className={classNames("content", {prefix, suffix})}>
					{prefix && <span className="prefix">{prefix}</span>}
					{input}
					{suffix && <span className="suffix">{suffix}</span>}
				</div>
				{trailingIcon}
			</>
		);
	}, [fullLabel, input, label, leadingIcon, prefix, shape, suffix, trailingIcon]);

	return (
		<div className={classNames("TextField", props.type, {error})}>
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
			{(supportMessage || (props.maxLength && isCounter)) && <div className="support">
				<div className="message">{supportMessage}</div>
				{(props.maxLength && isCounter) && <div className="counter">{counter} / {props.maxLength}</div>}
			</div>}
		</div>
	);
}
