import type { MenuProps as MenuPropsBase } from "@components/Menu/Menu.render";
import MenuRender from "@components/Menu/Menu.render";
import type { PropsWithChildren } from "react";

export type MenuProps = Omit<MenuPropsBase, "menuProps" | "groups">;

export default function Menu(props: PropsWithChildren<MenuProps>)
{
	return (<MenuRender {...props}/>)
}
