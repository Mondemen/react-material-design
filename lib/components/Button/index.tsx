import { useButtonGroupContext } from "@components/Button/group/render";
import { type CommonSelectableButtonProps } from "@components/Button/types";
import type { PolymorphicComponent } from "@components/misc/Polymorphic";
import { useCallback, useMemo, useState, type MouseEventHandler, type TouchEventHandler } from "react";

export function useCommonButtonProps(id: string, props: any, onPressed: (pressed: boolean) => void)
{
	const {selectable, selected: selectedExternal, defaultSelected, onSelected, onClick: onClickProp} = props as PolymorphicComponent<"Button", "button", "button", CommonSelectableButtonProps>;
	const groupContext = useButtonGroupContext();
	const [selectedInternal, setSelectedInternal] = useState((selectable ? (defaultSelected ?? selectedExternal) : false) ?? false);
	const selected = selectedExternal ?? selectedInternal;
	const [pressed, setPressed] = useState(false);
	const onClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) =>
	{
		if (groupContext?.selectable)
			groupContext.onSelected(id, !(groupContext.selected.get(id) ?? selected));
		else if (!groupContext && selectable)
		{
			if (selectedExternal === undefined)
				setSelectedInternal(!selected);

			onSelected?.(!selected);
		}
		onClickProp?.(event);
	}, [groupContext, id, onClickProp, onSelected, selectable, selected, selectedExternal]);
	const onPress = useCallback(() =>
	{
		setPressed(true);
		onPressed(true);
	}, [onPressed]);
	const onRelease = useCallback(() =>
	{
		setPressed(false);
		onPressed(false);
	}, [onPressed]);
	const onMouseDown = useCallback<MouseEventHandler<HTMLButtonElement>>(event =>
	{
		onPress();
		props.onMouseDown?.(event);
	}, [onPress, props]);
	const onMouseUp = useCallback<MouseEventHandler<HTMLButtonElement>>(event =>
	{
		onRelease();
		props.onMouseUp?.(event);
	}, [onRelease, props]);
	const onMouseLeave = useCallback<MouseEventHandler<HTMLButtonElement>>(event =>
	{
		onRelease();
		props.onMouseLeave?.(event);
	}, [onRelease, props]);
	const onTouchStart = useCallback<TouchEventHandler<HTMLButtonElement>>(event =>
	{
		onPress();
		props.onTouchStart?.(event);
	}, [onPress, props]);
	const onTouchEnd = useCallback((event: React.TouchEvent<HTMLButtonElement>) =>
	{
		onRelease();
		props.onTouchEnd?.(event);
	}, [onRelease, props]);
	const newProps = useMemo<React.HTMLAttributes<HTMLButtonElement>>(() =>
	({
		// id,
		onClick,
		onMouseDown,
		onMouseUp,
		onMouseLeave,
		onTouchStart,
		onTouchEnd
	}), [onClick, onMouseDown, onMouseLeave, onMouseUp, onTouchEnd, onTouchStart]);

	return ([newProps, selectedInternal, pressed] as const);
}