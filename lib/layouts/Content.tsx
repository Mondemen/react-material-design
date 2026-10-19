import { OrderedCollectionChild } from "@components/misc/OrderedCollection";
import { useId, useMemo, type PropsWithChildren } from "react";

export type ContentProps = PropsWithChildren;

export default function Content(props: ContentProps)
{
	const id = useId();
	const content = useMemo(() => ({children: props.children}), [props.children]);

	return (<OrderedCollectionChild name="Content" id={id} content={content}/>);
}
