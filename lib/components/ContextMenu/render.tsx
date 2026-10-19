import type { MenuProps } from "@components/Menu/Menu.render";
import MenuRender from "@components/Menu/Menu.render";
import { useFloating, type UseFloatingOptions } from "@hooks/useFloating";
import { flip } from "@hooks/useFloating/middleware/flip";
import type { Side } from "@hooks/useFloating/types";
import { createCursorVirtualElement } from "@hooks/useFloating/utils";
import { getScrollParents } from "@utils";
import classNames from "classnames";
import { useCallback, useMemo, useState, type PropsWithChildren } from "react";
import { useConcatElementRef, useDocumentEventListener, useElementRef } from "react-dom-event-hooks";

export type ContextMenuProps = PropsWithChildren<MenuProps>;

export default function ContextMenuRender(props: ContextMenuProps)
{
	const options = useMemo<UseFloatingOptions>(() => ({placement: "bottom-right", middlewares: [flip({allowedPlacements: ["top-left", "top-right", "bottom-left", "bottom-right"]})]}), []);
	const {saveReference, saveFloating, setAutoUpdateEnabled, placement} = useFloating(options);
	const side = useMemo(() => placement.split("-")[0] as Side, [placement]);
	const [visible, setVisible] = useState(false);
	const onContextMenu = useCallback((event: PointerEvent) =>
	{
		event.preventDefault();
		event.stopPropagation();
		if (event.currentTarget instanceof HTMLElement)
			saveReference(createCursorVirtualElement(event, event.currentTarget));
		setVisible(true);
		setAutoUpdateEnabled(true);
	}, [saveReference, setAutoUpdateEnabled]);
	const onClose = useCallback(() =>
	{
		setVisible(false);
		setAutoUpdateEnabled(false);
	}, [setAutoUpdateEnabled]);
	const {ref, saveRef: saveEventRef} = useElementRef(useCallback(ref =>
	{
		const scrollable = getScrollParents(ref);

		ref.parentElement?.addEventListener("contextmenu", onContextMenu);
		scrollable.forEach(element => element.addEventListener("scroll", onClose, true));
		return (() =>
		{
			scrollable.forEach(element => element.removeEventListener("scroll", onClose, true));
			ref.parentElement?.removeEventListener("contextmenu", onContextMenu);
		});
	}, [onClose, onContextMenu]));
	const {saveRef} = useConcatElementRef(saveEventRef, saveFloating);

	useDocumentEventListener("keydown", event =>
	{
		if (event.code.toLowerCase().includes("escape"))
			onClose();
	})
	useDocumentEventListener("scroll", onClose)
	useDocumentEventListener("blur", onClose);
	useDocumentEventListener("pointerdown", useCallback(event =>
	{
		if (event.target instanceof Node && !ref.current?.contains(event.target))
			onClose()
	}, [onClose, ref]));

	return (
		<MenuRender {...props} ref={saveRef} className={classNames("context-menu", side, {visible}, props.className)}>
			{props.children}
		</MenuRender>
	);
}