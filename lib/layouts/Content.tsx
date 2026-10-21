import { OrderedCollectionChild } from "@components/misc/OrderedCollection";
import { useId, useMemo, type CSSProperties, type PropsWithChildren } from "react";

export interface ContentProps extends PropsWithChildren
{
	className?: string,
	style?: CSSProperties
}

export interface ContentData extends ContentProps
{
	dataset: Record<string, string | boolean>
}

export default function Content(props: ContentProps)
{
	const id = useId();
	const dataProps = Object.fromEntries(Object.entries(props).filter(([name]) => name.startsWith("data-")));
	const content = useMemo<ContentData>(() => ({className: props.className, style: props.style, dataset: dataProps, children: props.children}), [dataProps, props.className, props.style, props.children]);

	return (<OrderedCollectionChild name="Content" id={id} content={content}/>);
}
