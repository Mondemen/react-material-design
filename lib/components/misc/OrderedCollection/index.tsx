import { useIsomorphicLayoutEffect } from "@utils/hooks";
import { createContext, useCallback, useContext, useEffectEvent, useId, useLayoutEffect, useMemo, useRef, useState, type PropsWithChildren } from "react";
import { useMutationObserver } from "react-dom-event-hooks";

import "./style.scss";

export interface OrderedCollectionContext<D = any>
{
	name?: string,
	saveChildData: (id: string, name: string, data: D) => void
}

export interface OrderedCollectionProps<D = any>
{
	name?: string,
	childName: string | string[],
	compareChild?: (previous: D, current: D) => boolean,
	onChildrenChange?: (children: OrderedCollectionChildData<D>[]) => void
}

export type OrderedCollectionChildData<P = unknown> = P &
{
	id: string,
	orderedCollectionName: string
};

export interface OrderedCollectionChildProps<D = any>
{
	name: string,
	parentName?: string,
	id?: string,
	content?: D
}

export function cleanOrderedCollectionProps<P>(props: P): Omit<P, keyof OrderedCollectionChildData>
{
	const result = {...props} as Partial<OrderedCollectionChildData<P>>;

	delete result.id;
	delete result.orderedCollectionName;
	return (result as P);
}

export const OrderedCollectionContext = createContext<OrderedCollectionContext | null>(null);

export function useOrderedCollection(): OrderedCollectionContext | null;
export function useOrderedCollection(parentName: string | undefined, childName: string): OrderedCollectionContext;
export function useOrderedCollection(parentName?: string, childName?: string)
{
	const context = useContext(OrderedCollectionContext);

	if (!context && (parentName || childName))
		throw new Error(`${childName ?? "OrderedCollectionChild"} must be used in ${parentName ?? "OrderedCollection"} component`);
	return (context);
}

export default function OrderedCollection<D = any>(props: PropsWithChildren<OrderedCollectionProps<D>>)
{
	const [registry, setRegistry] = useState<Record<string, OrderedCollectionChildData<D>>>({});
	const children = useRef<OrderedCollectionChildData<D>[]>([]);
	const saveChildData = useCallback((id: string, name: string, data: any) => setRegistry((prev) => ({ ...prev, [id]: {...data, orderedCollectionName: name}})), []);
	const {saveRef, ref} = useMutationObserver(mutations => mutations.forEach(mutation => mutation.removedNodes.forEach(node =>
	{
		if (node instanceof HTMLElement)
		{
			setRegistry(prev =>
			{
				const next = {...prev};

				if (node.dataset.id)
					delete next[node.dataset.id];
				return (next);
			});
		}
	})), useMemo(() => ({childList: true}), []));
	const context = useMemo(() => ({name: props.name, saveChildData}), [props.name, saveChildData]);
	const updateOrder = useEffectEvent(() =>
	{
		const compareChild = (child: (typeof children.current)[number], index: number) =>
		{
			if (child.id !== newChildren[index]?.id)
				return (true);
			if (props.compareChild && newChildren[index])
				return (!props.compareChild(child, newChildren[index]));
			return (false);
		};
		const childNames = Array.isArray(props.childName) ? props.childName : [props.childName];
		let childElements: HTMLSpanElement[];
		let newChildren: typeof children.current;

		if (!ref.current)
			return;
		childElements = Array.from(ref.current.querySelectorAll<HTMLSpanElement>(`:scope > .OrderedCollectionChild:is(${childNames.map(name => `[data-name="${name}"]`).join(", ")})`));
		newChildren = childElements.map(node => node.getAttribute("data-id")).filter((id): id is string => typeof id === "string").map(id =>
		{
			if (!registry[id])
				return (null);
			return ({...registry[id], id: registry[id].id ?? id});
		}).filter((id): id is (OrderedCollectionChildData<D>) => !!id);
		if (children.current.length !== newChildren.length || children.current.some(compareChild))
		{
			props.onChildrenChange?.(newChildren);
			children.current = newChildren;
		}
	})

	useLayoutEffect(() => updateOrder());

	return (
		<OrderedCollectionContext value={context}>
			<div ref={saveRef} className="OrderedCollection" data-name={props.name} aria-hidden="true">
				{props.children}
			</div>
		</OrderedCollectionContext>
	)
}

export function OrderedCollectionChild<D = any>(props: OrderedCollectionChildProps<D>)
{
	const idBase = useId();
	const id = props.id ?? idBase;
	const {saveChildData} = useOrderedCollection(props.parentName, props.name);

	useIsomorphicLayoutEffect(() => saveChildData(id, props.name, props.content), [id, props.content, props.name, saveChildData]);

	return (<span className="OrderedCollectionChild" data-name={props.name} data-id={id} aria-hidden="true"/>);
}