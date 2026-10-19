import Divider from "@components/Divider";
import type { MenuPropsBase } from "@components/Menu/Menu.render";
import type { MenuGroupData } from "@components/Menu/MenuGroup";
import MenuItemRender from "@components/Menu/MenuItem.render";
import { Fragment } from "react";

export function MenuGroupsRender(props: {groups: MenuGroupData[], menuProps: MenuPropsBase})
{
	const {groups, menuProps} = props;

	return (groups.map((group, index) =>
	{
		if (menuProps.layout === "standard")
		{
			return (
				<Fragment key={group.id}>
					{!!index && <Divider/>}
					{group.label && <div className="label">{group.label}</div>}
					{group.items.map(item => <MenuItemRender key={item.id} item={item} menuProps={menuProps}/>)}
				</Fragment>
			);
		}
		return (
			<div key={group.id} className="MenuGroup" data-menu-group-id={group.id}>
				{group.label && <div className="label">{group.label}</div>}
				{group.items.map(item => <MenuItemRender key={item.id} item={item} menuProps={menuProps}/>)}
			</div>
		);
	}));
}
