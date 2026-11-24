import StateLayer from "@misc/StateLayer";
import classNames from "classnames";
import type React from "react";

import "./style.scss";

export interface FilledFieldProps extends React.HTMLAttributes<HTMLDivElement>, React.RefAttributes<HTMLDivElement>
{
	label?: string,
	filled?: boolean,
	focus?: boolean,
	disabled?: boolean,
	error?: boolean,
	density?: 0 | -1 | -2
}

export default function FilledField(props: React.PropsWithChildren<FilledFieldProps>)
{
	const {label, filled, focus, disabled, error, density = 0, ...divProps} = props;

	return (
		<div {...divProps} className={classNames("FilledField Field", {label, filled, focus, disabled, error}, `density-${density}`.replace(/-+/g, "-"), props.className)}>
			<StateLayer ripple={false}/>
			{label && <span className="label">{label}</span>}
			{props.children}
			<span className="indicator"/>
		</div>
	)
}
