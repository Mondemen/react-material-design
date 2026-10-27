import { useCommonButtonProps } from "@components/Button";
import { useButtonContext } from "@components/Button/context";
import { useButtonGroupContext } from "@components/Button/group/render";
import type { IconButtonProps } from "@components/Button/icon";
import { type IconDefinition, IconProvider, convertIconDefinition } from "@components/Icon/Icon";
import Menu from "@components/Menu";
import FloatingElement from "@components/misc/FloatingElement";
import Polymorphic from "@components/misc/Polymorphic";
import StateLayer from "@components/misc/StateLayer";
import Transitionable from "@components/misc/Transitionable";
import { useTheme } from "@components/Theme/Theme";
import Tooltip from "@components/Tooltip";
import { getComponentSizeName } from "@components/types";
import type { FlipOptions } from "@hooks/useFloating/types";
import classNames from "classnames";
import { type ElementType, useCallback, useId, useMemo, useState } from "react";
import { useConcatElementRef, useElementEventListener, useResizeObserver, useWindowEventListener } from "react-dom-event-hooks";

export const CommonButtonNativeProps =
[
	"color",
	"size",
	"shape",
	"disabled",
	"emphasized",
	"selectable",
	"selected",
	"onSelected"
];

const NativeProps: string[] =
[
	...CommonButtonNativeProps,
	"icon",
	"menuRef",
	"menuOpenBehavior",
	"menuOpen",
	"onMenuOpen",
	"onMenuClose",
	"tooltip",
	"width"
];

export default function IconButtonRender<As extends ElementType = "button">(props: IconButtonProps<As>)
{
	const {icon: iconProp, menuOpenBehavior = "hover", menuRef: menuRefExternal, menuOpen: menuOpenExternal, onMenuOpen, onMenuClose} = props;
	const {popoversContainer} = useTheme("IconButton");
	const flipOptions = useMemo<FlipOptions>(() => ({allowedPlacements: ["top-start", "top-end", "bottom-start", "bottom-end"]}), []);
	const idBase = useId();
	const id = props.id ?? idBase;
	const buttonContext = useButtonContext();
	const groupContext = useButtonGroupContext();
	const color = props.color ?? buttonContext?.getColor("icon") ?? "filled";
	const shape = buttonContext?.getShape("icon") ?? props.shape ?? "round";
	const width = buttonContext?.getWidth("icon") ?? props.width ?? "default";
	const size = getComponentSizeName(groupContext ? groupContext.size : props.size);
	const [menuOpenInternal, setMenuOpenInternal] = useState(menuOpenExternal ?? false);
	const menuOpen = menuOpenExternal ?? menuOpenInternal;
	const setMenuOpen = useCallback((open: boolean) =>
	{
		if (menuOpenExternal === undefined)
			setMenuOpenInternal(open);
		if (open)
			onMenuOpen?.();
		else
			onMenuClose?.();
	}, [menuOpenExternal, onMenuClose, onMenuOpen]);
	const openMenu = useElementEventListener(menuOpenBehavior === "click" ? "pointerdown" : "pointerenter", event =>
	{
		if (!props.children || menuOpenBehavior === "manual")
			return;
		if (menuOpenBehavior === "click")
		{
			event.stopPropagation();
			setMenuOpen(!menuOpen)
		}
		else
			setMenuOpen(true);
	});
	const closeMenu = useElementEventListener("pointerleave", () => menuOpenBehavior === "hover" && props.children ? setMenuOpen(false) : null);
	const onMenuEnter = useElementEventListener("pointerenter", () =>
	{
		if (!props.children || menuOpenBehavior === "manual")
			return;
		setMenuOpen(true);
	});
	const onMenuLeave = useElementEventListener("pointerleave", () => menuOpenBehavior === "hover" && props.children ? setMenuOpen(false) : null);
	const {saveRef, ref} = useConcatElementRef(openMenu, closeMenu);
	const {saveRef: saveMenuRef, ref: menuRef} = useConcatElementRef(menuRefExternal, onMenuEnter, onMenuLeave);
	const [otherProps, selected] = useCommonButtonProps(id, props, useCallback(pressed =>
	{
		if (ref.current)
			groupContext?.onPressed(id, ref.current, pressed);
	}, [ref, groupContext, id]));
	const classList = useMemo(() =>
	{
		const classList : Record<string, any>= {};

		classList["IconButton"] = true;
		classList["CommonButton"] = true;
		classList[color] = true;
		classList[shape] = true;
		classList[size] = true;
		classList[width] = true;
		classList.disabled = props.disabled;
		classList.emphasized = props.emphasized;
		classList.selectable = groupContext?.selectable ?? props.selectable;
		if (groupContext?.selectable)
			classList.selected = groupContext.selected.get(id) ?? selected;
		else if (!groupContext && props.selectable)
			classList.selected = props.selected ?? selected;
		return (classList);
		// @ts-expect-error
	}, [color, groupContext, id, props.disabled, props.emphasized, props.selectable, props.selected, selected, shape, size, width]);
	const iconDefinition = useMemo(() =>
	{
		let icon: IconDefinition;

		if (props.selectable)
			icon = (typeof iconProp === "function") ? iconProp?.((groupContext?.selectable ? groupContext?.selected.get(id) : props.selected) ?? selected) : iconProp;
		else
			icon = (typeof iconProp === "function") ? (iconProp as () => IconDefinition)() : iconProp;
		return (icon);
		// @ts-expect-error
	}, [groupContext?.selectable, groupContext?.selected, iconProp, id, props.selectable, props.selected, selected]);
	const icon = useMemo(() => convertIconDefinition(iconDefinition), [iconDefinition]);
	const propsObject = useMemo(() =>
	{
		const propsExtra = {...props, ...otherProps};

		propsExtra.className = classNames(classList, props.className);
		propsExtra.role = "button";
		if (groupContext)
			propsExtra.type = "button";
		delete propsExtra.title;
		return (propsExtra);
	}, [classList, groupContext, otherProps, props]);
	const {saveRef: saveContainerRef} = useResizeObserver(useCallback(entries => entries.forEach(entry => ref.current?.style.setProperty("--md-comp-icon-button-container-width", `${entry.contentRect.width}px`)), [ref]));

	useWindowEventListener("pointerdown", event =>
	{
		if (!(event.target instanceof Node))
			return;
		if (menuOpen && (!event.target.parentElement?.parentElement?.classList.contains("selectable") || (!ref.current?.contains(event.target) && !menuRef.current?.contains(event.target))))
			setMenuOpen(false);
	});

	return (
		<div ref={saveRef} className={classNames("ButtonContainer", size)}>
			<Polymorphic
				name="IconButton"
				as={props.as}
				base="button"
				props={propsObject}
				excludePropsName={NativeProps}
				disabled={props.disabled}
			>
				<StateLayer disabled={props.disabled}/>
				{typeof props.title === "string" ? <Tooltip variant="plain" text={props.title}/> : props.title}
				<IconProvider fill={props.selectable ? classList.selected : true}>
					<div className="container">
						<Transitionable value={icon} className="icon"/>
					</div>
					<div ref={saveContainerRef} className="container size-ref">
						<Transitionable static value={icon} className="icon"/>
					</div>
				</IconProvider>
			</Polymorphic>
			{props.children && (
				<>
					<div className="menu-hover"/>
					<FloatingElement
						root={popoversContainer}
						flip={flipOptions}
						autoUpdate
						placement="bottom-start"
						open={menuOpen}
					>
						<Menu ref={saveMenuRef} className={classNames("sub-component", {visible: menuOpen})}>
							{props.children}
						</Menu>
					</FloatingElement>
				</>
			)}
		</div>
	);
}
