import ButtonProvider, { type ButtonProviderProps } from "@components/Button/context";
import Button from "@components/Button/default";
import IconButton from "@components/Button/icon";
import type { DialogActionsProps } from "@components/Dialog/DialogActions";
import Divider from "@components/Divider";
import { convertIconDefinition, IconProvider, type IconDefinition } from "@components/Icon/Icon";
import type { OrderedCollectionChildData } from "@components/misc/OrderedCollection";
import OrderedCollection from "@components/misc/OrderedCollection";
import { useTheme } from "@components/Theme/Theme";
import { getComponentSizeName } from "@components/types";
import { shallowEqual, waitAnimationNameEndEvent } from "@utils";
import classNames from "classnames";
import React, { useCallback, useEffect, useEffectEvent, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useElementEventListener, useResizeObserver } from "react-dom-event-hooks";
import type { ContentData } from "../../layouts/Content";

import "./style.scss";

export interface BaseDialogProps extends React.HTMLAttributes<HTMLDialogElement>
{
	name?: string,
	open?: boolean,
	headline?: string,
	onClose?: () => void
}

export interface BasicDialogProps extends BaseDialogProps
{
	fullscreen?: false,
	size?: Parameters<typeof getComponentSizeName>[0] | false,
	icon?: IconDefinition,
	supportingText: string,
	maxWidth?: boolean
}

export interface FullscreenDialogProps extends BaseDialogProps
{
	fullscreen: true,
	buttonLabel: string,
	onButtonClick?: () => void
}

export type DialogProps = BasicDialogProps | FullscreenDialogProps;

export default function Dialog(props: DialogProps)
{
	const id = useId();
	const {setDialogState, dialogsContainer} = useTheme("Dialog");
	const ref = useRef<HTMLDialogElement>(null);
	const modalRef = useRef<HTMLDivElement>(null);
	const [contentProps, setContentProps] = useState<OrderedCollectionChildData<ContentData | DialogActionsProps>[]>([]);
	const content = useMemo(() => contentProps.filter((content): content is OrderedCollectionChildData<ContentData> => content.orderedCollectionName === "Content").at(0), [contentProps]);
	const actions = useMemo(() => contentProps.filter(content => content.orderedCollectionName === "DialogAction"), [contentProps]);
	const acceptedChildren = useMemo(() => ["Content", "DialogAction"], []);
	const defaultButtonVariant = useMemo<ButtonProviderProps["color"] & {}>(() => ({default: "text", icon: "standard"}), []);
	// @ts-expect-error
	const icon = useMemo(() => !props.fullscreen ?  convertIconDefinition(props.icon) : null, [props.fullscreen, props.icon]);
	const {saveRef} = useResizeObserver<HTMLDivElement>(useCallback(entries =>
	{
		entries.filter(entry => entry.borderBoxSize.forEach(boxSize =>
		{
			if (modalRef.current?.checkVisibility())
			{
				modalRef.current.style.setProperty("--modal-width", `${boxSize.inlineSize}px`);
				modalRef.current.style.setProperty("--modal-height", `${boxSize.blockSize}px`);
			}
		}));
	}, []));
	const {saveRef: saveContentRef} = useElementEventListener("scroll", useCallback(event =>
	{
		if (event.target instanceof HTMLDivElement)
		{
			if (event.target.scrollTop)
				event.target?.classList.add("on-scroll");
			else
				event.target?.classList.remove("on-scroll");
		}
	}, []));
	const open = useEffectEvent(() =>
	{
		setDialogState(id, true);
		ref.current?.classList.remove("close");
		ref.current?.classList.add("open");
		ref.current?.showModal();
	});
	const close = useEffectEvent(async () =>
	{
		setDialogState(id, false);
		ref.current?.classList.remove("open");
		ref.current?.classList.add("close");
		await waitAnimationNameEndEvent(modalRef.current, name => /^dialog-\w+-container-close$/.test(name));
		ref.current?.classList.remove("close");
		ref.current?.close();
	});

	const onClose = useCallback<React.ReactEventHandler<HTMLDialogElement>>((event) =>
	{
		event.stopPropagation();
		props.onClose?.();
	}, [props]);
	const onKeyDown = useCallback<React.KeyboardEventHandler<HTMLDialogElement>>(event =>
	{
		if (event.code.toLowerCase().includes("escape"))
		{
			event.stopPropagation();
			event.preventDefault();
			props.onClose?.();
		}
	}, [props]);

	useEffect(() =>
	{
		if (props.open)
			open();
		else
			close();
	}, [props.open]);

	if (!dialogsContainer)
		return (null);
	return (createPortal(
	(
		<dialog
			ref={ref}
			className="Dialog"
			onClose={onClose}
			onKeyDown={onKeyDown}
			aria-label={props.headline}
			role={!props.fullscreen ? "alertdialog" : "dialog"}
		>
			<div
				ref={modalRef}
				className={classNames(
					"modal",
					!props.fullscreen && props.size ? getComponentSizeName(props.size) : undefined,
					{fullscreen: props.fullscreen, headline: props.headline, icon: !props.fullscreen && props.icon}
				)}>
				<div ref={saveRef} className="container">
					{!props.fullscreen ?
					(
						<div className="description">
							{icon && <IconProvider size={24}>{icon}</IconProvider>}
							{props.headline && <span className="headline">{props.headline}</span>}
							<span className="supporting-text">{props.supportingText}</span>
						</div>
					) :
					(
						<div className="header">
								{/* <StateLayer className="icon" onClick={props.onClose} tabIndex={0}><Icon name="close"/></StateLayer> */}
								<IconButton className="icon" color="standard" icon="close" onClick={props.onClose}/>
								<span className="headline">{props.headline}</span>
								<Button className="action" color="text" label={props.buttonLabel} onClick={props.onButtonClick}/>
						</div>
					)}
					{!props.fullscreen && content && <Divider/>}
					{!!content && <div ref={saveContentRef} className={classNames("content", content.className)} style={content.style} {...content.dataset}>{content.children}</div>}
					{!props.fullscreen && content && <Divider/>}
					{!props.fullscreen && actions && <div className="actions">
						<ButtonProvider color={defaultButtonVariant}>
							{actions.map(actions => actions.children)}
						</ButtonProvider>
					</div>}
				</div>
			</div>
			<OrderedCollection<ContentData | DialogActionsProps> name="Dialog" childName={acceptedChildren} onChildrenChange={setContentProps} compareChild={shallowEqual}>{props.children}</OrderedCollection>
		</dialog>
	), dialogsContainer));
}
