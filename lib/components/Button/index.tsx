import { useButtonGroupContext } from "@components/Button/group/render";
import { type CommonSelectableButtonProps } from "@components/Button/types";
import type { PolymorphicComponent } from "@components/misc/Polymorphic";
import { useCallback, useMemo, useState, type MouseEventHandler, type TouchEventHandler } from "react";

export function useCommonButtonProps(id: string, props: any, onPressed: (pressed: boolean) => void)
{
	const {
		selectable,
		selected: selectedExternal,
		defaultSelected,
		onSelected,
		onClick: onClickProp,
		onMouseDown: onMouseDownProp,
		onMouseUp: onMouseUpProp,
		onMouseLeave: onMouseLeaveProp,
		onTouchStart: onTouchStartProp,
		onTouchEnd: onTouchEndProp,
	} = props as PolymorphicComponent<"Button", "button", "button", CommonSelectableButtonProps>;
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
		onMouseDownProp?.(event);
	}, [onPress, onMouseDownProp]);
	const onMouseUp = useCallback<MouseEventHandler<HTMLButtonElement>>(event =>
	{
		onRelease();
		onMouseUpProp?.(event);
	}, [onRelease, onMouseUpProp]);
	const onMouseLeave = useCallback<MouseEventHandler<HTMLButtonElement>>(event =>
	{
		onRelease();
		onMouseLeaveProp?.(event);
	}, [onRelease, onMouseLeaveProp]);
	const onTouchStart = useCallback<TouchEventHandler<HTMLButtonElement>>(event =>
	{
		onPress();
		onTouchStartProp?.(event);
	}, [onPress, onTouchStartProp]);
	const onTouchEnd = useCallback((event: React.TouchEvent<HTMLButtonElement>) =>
	{
		onRelease();
		onTouchEndProp?.(event);
	}, [onRelease, onTouchEndProp]);
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