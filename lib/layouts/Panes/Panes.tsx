import OrderedCollection from "@components/misc/OrderedCollection";
import { formatSizeFromPx, getComponentTokenValue, isBrowser, parseSizeToPx, type SizeUnit } from "@utils";
import { useIsomorphicLayoutEffect } from "@utils/hooks";
import classNames from "classnames";
import { createContext, Fragment, useCallback, useContext, useEffectEvent, useMemo, useRef, useState, type PointerEvent, type PointerEventHandler, type PropsWithChildren } from "react";
import { useElementRef, useWindowEventListener } from "react-dom-event-hooks";
import type { PaneProps } from "./Pane";
import PaneRender from "./Pane.render";

import "./style.scss";

export interface SavedPane
{
	size: SizeUnit,
	collapsed: boolean
}

export interface PanesProps extends PropsWithChildren
{
	orientation?: "horizontal" | "vertical",
	className?: string,
	defaultLayout?: Record<string, SavedPane>
	autoSaveId?: string,
	onLayoutChange?: (layout: Record<string, SavedPane>) => void
}

export interface PaneData
{
	id: string,
	size: SizeUnit | "auto",
	snapped: boolean,
	collapsed: boolean,
	isRecovering: boolean,
	isAnimating: boolean
}

interface DragData
{
	leftId: string,
	rightId: string,
	startX: number,
	startY: number,
	startLeftPx: number,
	startRightPx: number
}

export interface PanesContext
{
	activeDrag: string | null;
	startDrag: (leftId: string, rightId: string, event: PointerEvent) => void
}

export const PanesContext = createContext<PanesContext | null>(null);

export const usePanes = () =>
{
	const context = useContext(PanesContext);

	if (!context)
		throw new Error("MenuPane or MenuGroup must be used in Menu component");
	return (context);
};

function ResizeHandle(props: { leftId: string; rightId: string })
{
	const {startDrag, activeDrag} = usePanes();
	const dragging = activeDrag === props.leftId;
	const onPointerDown = useCallback<PointerEventHandler<HTMLDivElement>>(event => startDrag(props.leftId, props.rightId, event), [props.leftId, props.rightId, startDrag]);

	return (<div className={classNames("ResizeHandle", {dragging})} role="separator" onPointerDown={onPointerDown}><div className="handle"/></div>);
}

export default function Panes(props: PanesProps)
{
	const {orientation = "horizontal", autoSaveId, onLayoutChange} = props;
	const [handleSize, setHandleSize] = useState(0);
	const [containerSizeBase, setContainerSize] = useState(0);
	const {saveRef: saveContainerRef} = useElementRef<HTMLDivElement>(useCallback(ref =>
	{
		const containerRect = ref.getBoundingClientRect();

		setContainerSize(orientation === "horizontal" ? containerRect.width : containerRect.height);
		setHandleSize(getComponentTokenValue(ref, "panes-handle-size"));
	}, [orientation]));
	const [paneProps, setPaneProps] = useState<Required<PaneProps>[]>([]);
	const [paneData, setPaneData] = useState<Record<string, PaneData>>({});
	const totalHandlesSize = useMemo(() => Math.max(0, paneProps.length - 1) * handleSize, [handleSize, paneProps.length]);
	const containerSize = useMemo(() => Math.max(0, containerSizeBase - totalHandlesSize), [containerSizeBase, totalHandlesSize]);
	const [activeDrag, setActiveDrag] = useState<string | null>(null);
	const savedLayoutRef = useRef<Record<string, SavedPane>>(null);
	const dragRef = useRef<DragData>(null);
	const recoveryTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
	const comparePaneProps = useCallback((previous: PaneProps, current: PaneProps) =>
	{
		if (previous.id !== current.id)
			return (false);
		if (previous.defaultSize !== current.defaultSize)
			return (false);
		if (previous.minSize !== current.minSize)
			return (false);
		if (previous.snapPoints?.length !== current.snapPoints?.length || current.snapPoints?.every((snapPoints, index) => snapPoints !== previous.snapPoints?.at(index)))
			return (false);
		if (previous.className !== current.className)
			return (false);
		if (previous.children !== current.children)
			return (false);
		return (true);
	}, []);
	const savePanes = useCallback((pane: Required<PaneProps>[]) =>
	{
		setPaneProps(pane);
		setPaneData(pane.reduce((newPaneData, pane) =>
		{
			const currentData = paneData[pane.id];

			newPaneData[pane.id] =
			{
				id: pane.id,
				size: currentData ? currentData.size : (savedLayoutRef.current?.[pane.id]?.size ?? pane.defaultSize ?? "auto"),
				snapped: currentData ? currentData.snapped : false,
				collapsed: currentData ? currentData.collapsed : (savedLayoutRef.current?.[pane.id]?.collapsed ?? false),
				isRecovering: currentData ? currentData.isRecovering : false,
				isAnimating: currentData ? currentData.isAnimating : false,
			};
			return (newPaneData);
		}, {} as typeof paneData));
	}, [paneData]);
	const updateDynamicPaneSize = useEffectEvent(() =>
	{
		setPaneData((prev) =>
		{
			const unassignedIds = paneProps.filter(props => prev[props.id]?.size === "auto");
			const next = {...prev};
			let size: SizeUnit;
			let totalAssignedPx = 0;
			let totalAssignedPercent = 0;
			let remaining: number;
			let sharePercent: number;

			if (unassignedIds.length === 0)
				return (prev);
			paneProps.forEach(props =>
			{
				size = prev[props.id]?.size;
				if (size && size !== "auto")
				{
					if (typeof size === "string" && size.endsWith("%"))
						totalAssignedPercent += parseFloat(size);
					totalAssignedPx += parseSizeToPx(size, containerSize, 0);
				}
			});

			if (containerSize > 0)
			{
				remaining = Math.max(0, containerSize - totalAssignedPx);
				sharePercent = ((remaining / containerSize) * 100) / unassignedIds.length;
				unassignedIds.forEach(props => next[props.id] = {...next[props.id], size: `${sharePercent}%`});
			}
			else
			{
				remaining = Math.max(0, 100 - totalAssignedPercent);
				sharePercent = remaining / unassignedIds.length;
				unassignedIds.forEach(props => next[props.id] = {...next[props.id], size: `${sharePercent}%`});
			}
			return (next);
		});
	});
	const persistLayout = useCallback((currentPanels: Record<string, PaneData>) =>
	{
		const layoutToSave: Record<string, SavedPane> = {};

		for (const key in currentPanels)
			layoutToSave[key] = {size: currentPanels[key].size, collapsed: currentPanels[key].collapsed};
		if (autoSaveId && typeof window !== "undefined")
			localStorage.setItem(`material-panes-${autoSaveId}`, JSON.stringify(layoutToSave));
		onLayoutChange?.(layoutToSave);
	}, [autoSaveId, onLayoutChange]);
	const context = useMemo<PanesContext>(() =>
	({
		activeDrag,
		startDrag(leftId, rightId, event)
		{
			const leftPanel = paneData[leftId];
			const rightPanel = paneData[rightId];

			if (!leftPanel || !rightPanel || !containerSize)
				return;
			event.preventDefault();
			event.currentTarget.setPointerCapture(event.pointerId)
			dragRef.current =
			{
				leftId,
				rightId,
				startX: event.clientX,
				startY: event.clientY,
				startLeftPx: parseSizeToPx(leftPanel.size, containerSize),
				startRightPx: parseSizeToPx(rightPanel.size, containerSize)
			};
			setActiveDrag(leftId);
		},
	}), [activeDrag, containerSize, paneData]);
	const renderPanes = useMemo(() => paneProps.map((props, index) =>
	{
		const data = paneData[props.id];

		if (!data)
			return (null);
		return (
			<Fragment key={data.id}>
				{!!index && <ResizeHandle leftId={paneProps[index - 1]?.id} rightId={props.id}/>}
				<PaneRender {...data} {...props} totalHandlesSize={totalHandlesSize} activeDrag={activeDrag}>{props.children}</PaneRender>
			</Fragment>
		);
	}), [activeDrag, paneData, paneProps, totalHandlesSize]);

	useWindowEventListener("pointermove", (event) =>
	{
		if (!dragRef.current)
			return;
		const {leftId, rightId, startX, startY, startLeftPx, startRightPx} = dragRef.current;
		const deltaPx = orientation === "horizontal" ? event.clientX - startX : event.clientY - startY;
		const total = startLeftPx + startRightPx;
		const leftPaneProps = paneProps.find(props => props.id === leftId);
		const rightPaneProps = paneProps.find(props => props.id === rightId);
		const leftPaneData = paneData[leftId];
		const rightPaneData = paneData[rightId];
		const leftMin = parseSizeToPx(leftPaneProps?.minSize, containerSize, 0);
		const rightMinPx = parseSizeToPx(rightPaneProps?.minSize, containerSize, 0);
		const snapThreshold = 20;
		let newLeft = startLeftPx + deltaPx;
		let newRight = startRightPx - deltaPx;
		let snap: number;
		let snapped = false;
		let leftCollapsed = false;
		let rightCollapsed = false;
		let leftSnapped = false;
		let rightSnapped = false;
		let leftNeedsRecovery: boolean;
		let rightNeedsRecovery: boolean;
		let isRecovering: boolean;

		if (leftPaneProps?.snapPoints)
		{
			for (const snapPoint of leftPaneProps.snapPoints)
			{
				snap = parseSizeToPx(snapPoint, containerSize);
				if (Math.abs(newLeft - snap) < snapThreshold)
				{
					newLeft = snap;
					newRight = total - newLeft;
					snapped = true;
					leftSnapped = true;
					break;
				}
			}
		}
		if (!snapped && rightPaneProps?.snapPoints)
		{
			for (const snapPoint of rightPaneProps.snapPoints)
			{
				snap = parseSizeToPx(snapPoint, containerSize);
				if (Math.abs(newRight - snap) < snapThreshold)
				{
					newRight = snap;
					newLeft = total - newRight;
					rightSnapped = true;
					break;
				}
			}
		}
		if (newLeft < (leftMin / 2))
		{
			leftCollapsed = true;
			newLeft = 0;
			newRight = total;
		}
		else if (newLeft < leftMin)
		{
			newLeft = leftMin;
			newRight = total - leftMin;
		}
		if (newRight < (rightMinPx / 2))
		{
			rightCollapsed = true;
			newRight = 0;
			newLeft = total;
		}
		else if (newRight < rightMinPx)
		{
			newRight = rightMinPx;
			newLeft = total - rightMinPx;
		}

		if (newLeft < 0)
		{
			newLeft = 0;
			newRight = total;
		}
		if (newRight < 0)
		{
			newLeft = total;
			newRight = 0;
		}
		leftNeedsRecovery = (!leftCollapsed && leftPaneData.collapsed) || (!leftSnapped && leftPaneData.snapped);
		rightNeedsRecovery = (!rightCollapsed && rightPaneData.collapsed) || (!rightSnapped && rightPaneData.snapped);
		isRecovering = leftPaneData.isRecovering || rightPaneData.isRecovering || false;
		if (leftNeedsRecovery || rightNeedsRecovery)
		{
			isRecovering = true;
			if (recoveryTimers.current[leftId])
				clearTimeout(recoveryTimers.current[leftId]);
			recoveryTimers.current[leftId] = setTimeout(() =>
			{
				setPaneData((p) =>
				{
					const next = {...p};

					if (next[leftId])
						next[leftId] = {...next[leftId], isRecovering: false, isAnimating: false};
					if (next[rightId])
						next[rightId] = {...next[rightId], isRecovering: false, isAnimating: false};
					return (next);
				});
			}, 200);
		}
		else if (leftCollapsed || leftSnapped || rightCollapsed || rightSnapped)
		{
			isRecovering = false;
			if (recoveryTimers.current[leftId])
				clearTimeout(recoveryTimers.current[leftId]);
		}

		setPaneData((prev) =>
		{
			const formatedNewLeftPx = formatSizeFromPx(newLeft, prev[leftId].size, containerSize);
			const formatedNewRightPx = formatSizeFromPx(newRight, prev[rightId].size, containerSize);
			const isAnimating = leftCollapsed || leftSnapped || rightCollapsed || rightSnapped || isRecovering;

			return ({
				...prev,
				[leftId]: {...prev[leftId], snapped: leftSnapped, collapsed: leftCollapsed, isRecovering, isAnimating, size: formatedNewLeftPx},
				[rightId]: {...prev[rightId], snapped: rightSnapped, collapsed: rightCollapsed, isRecovering, isAnimating, size: formatedNewRightPx}
			});
		});
	});
	useWindowEventListener("pointerup", () =>
	{
		if (!dragRef.current)
			return;
		persistLayout(paneData);
		dragRef.current = null;
		setActiveDrag(null);
	});

	useIsomorphicLayoutEffect(() =>
	{
		let strData: string | null;

		if (savedLayoutRef.current === null)
		{
			if (props.defaultLayout)
				savedLayoutRef.current = props.defaultLayout;
			else if (props.autoSaveId && isBrowser())
			{
				try
				{
					strData = localStorage.getItem(`material-panes-${props.autoSaveId}`);
					if (strData)
						savedLayoutRef.current = JSON.parse(strData);
				}
				catch (error)
				{console.error("localStorage error:", error)}
			}
			if (!savedLayoutRef.current)
				savedLayoutRef.current = {};
		}
		updateDynamicPaneSize();
	});

	return (
		<div ref={saveContainerRef} className={classNames("Panes", orientation, props.className)}>
			<PanesContext value={context}>
				{renderPanes}
				<OrderedCollection<Required<PaneProps>> childName="Pane" onChildrenChange={savePanes} compareChild={comparePaneProps}>{props.children}</OrderedCollection>
			</PanesContext>
		</div>
	);
}
