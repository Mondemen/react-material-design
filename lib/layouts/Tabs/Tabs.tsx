import { IconProvider } from "@components/Icon/Icon";
import OrderedCollection from "@components/misc/OrderedCollection";
import StateLayer from "@components/misc/StateLayer";
import Transitionable from "@components/misc/Transitionable";
import { getRelativeRect, shallowEqual } from "@utils";
import { useIsomorphicLayoutEffect } from "@utils/hooks";
import classNames from "classnames";
import { Activity, createContext, useCallback, useMemo, useRef, useState, type MouseEventHandler, type PropsWithChildren } from "react";
import { useMultiElementRef, useResizeObserver } from "react-dom-event-hooks";
import type { TabData } from "./Tab";

import "./style.scss";

export interface TabsProps
{
	variant?: "primary" | "secondary",
	defaultActiveTab?: string,
	activeTab?: string,
	onActiveTabChange?: (active: string) => void
}

export const TabsContext = createContext<string | undefined>(undefined);

export default function Tabs(props: PropsWithChildren<TabsProps>)
{
	const {variant = "primary", defaultActiveTab, activeTab: activeTabExternal, onActiveTabChange} = props;
	const [tabs, setTabs] = useState<TabData[]>([]);
	const hasLabels = useMemo(() => tabs.some(tab => !!tab.label), [tabs]);
	const hasIcons = useMemo(() => tabs.some(tab => !!tab.icon), [tabs]);
	const [activeTabInternal, setActiveTab] = useState(defaultActiveTab ?? activeTabExternal ?? "");
	const activeTab = useMemo(() =>
	{
		const active = activeTabExternal ?? activeTabInternal;

		if (tabs.find(tab => tab.id === active))
			return (active);
		return (defaultActiveTab);
	}, [activeTabExternal, activeTabInternal, defaultActiveTab, tabs]);
	const {saveRef: saveTabButtonRef, ref: tabButtonRefs} = useMultiElementRef<HTMLDivElement>();
	const navigationContainerRef = useRef<HTMLDivElement>(null);
	const tabIndicatorRef = useRef<HTMLDivElement>(null);
	const animationFrame = useRef<number>(null);
	const setNewTabs = useCallback((tabs: TabData[]) =>
	{
		setActiveTab(active => !active ? tabs.at(0)?.id ?? "" : active);
		setTabs(tabs);
	}, []);
	const updateIndicatorPosition = useCallback((immediate = false) =>
	{
		const element = tabButtonRefs.current.get(activeTab ?? "");
		let containerRect: DOMRect;
		let rect: DOMRect;

		if (animationFrame.current !== null)
			animationFrame.current = cancelAnimationFrame(animationFrame.current) ?? null;
		animationFrame.current = requestAnimationFrame(() =>
		{
			if (!element || !navigationContainerRef.current)
				return;
			containerRect = navigationContainerRef.current.getBoundingClientRect();
			if (variant === "primary")
				rect = getRelativeRect(element, containerRect);
			else
				rect = getRelativeRect(element.parentElement, containerRect);
			if (immediate)
				tabIndicatorRef.current?.classList.add("immediate");
			tabIndicatorRef.current?.style.setProperty("--position-left", `${rect.left}px`);
			tabIndicatorRef.current?.style.setProperty("--position-right", `${containerRect.width - rect.right}px`);
			if (immediate)
				setTimeout(() => tabIndicatorRef.current?.classList.remove("immediate"));
		});
	}, [activeTab, tabButtonRefs, variant]);
	const {saveRef: saveNavigationRef} = useResizeObserver(() => updateIndicatorPosition(true));
	const onClick = useCallback<MouseEventHandler<HTMLButtonElement>>(event =>
	{
		const id = event.currentTarget.dataset.id;

		if (!id)
			return;
		if (!activeTabExternal)
			setActiveTab(id);
		onActiveTabChange?.(id);
	}, [activeTabExternal, onActiveTabChange]);

	useIsomorphicLayoutEffect(() => {updateIndicatorPosition()}, [activeTab, tabs.length, updateIndicatorPosition]);

	return (
		<TabsContext value={activeTab}>
			<div className={classNames("Tabs", variant)}>
				<nav ref={saveNavigationRef} className={classNames("navigation", {labels: hasLabels, icons: hasIcons})}>
					<div ref={navigationContainerRef} className="container">
						{tabs.map(tab =>
						(
							<button key={tab.id} className={classNames("button", {active: tab.id === activeTab})} data-id={tab.id} onClick={onClick}>
								<StateLayer/>
								<div ref={saveTabButtonRef} className="content" data-key={tab.id}>
									<IconProvider size={24} fill={tab.id === activeTab}><Transitionable value={tab.icon} className="icon"/></IconProvider>
									<Transitionable value={tab.label} className="label"/>
								</div>
							</button>
						))}
						<div ref={tabIndicatorRef} className="indicator"/>
					</div>
				</nav>
				<div className="activities">
					{tabs.map(tab =>
					(
						<Activity key={tab.id} name={"Tab_" + tab.id} mode={tab.id === activeTab ? "visible" : "hidden"}>
							<div
								className={classNames("content",
								{
									"inline-padding": tab.inlineContentPadding ?? tab.contentPadding ?? false,
									"block-padding": tab.blockContentPadding ?? tab.contentPadding ?? false
								})}
							>
								{tab.children}
							</div>
						</Activity>
					))}
				</div>
				<OrderedCollection<TabData> name="Tabs" childName="Tab" onChildrenChange={setNewTabs} compareChild={shallowEqual}>{props.children}</OrderedCollection>
			</div>
		</TabsContext>
	);
}
