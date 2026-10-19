import { OrderedCollectionChild } from "@components/misc/OrderedCollection";
import { useId, useMemo, type PropsWithChildren } from "react";

export type DialogActionsProps = PropsWithChildren;

export default function DialogActions(props: DialogActionsProps)
{
	const id = useId();
	const content = useMemo(() => ({children: props.children}), [props.children]);

	return (<OrderedCollectionChild name="DialogAction" id={id} content={content}/>);
}
