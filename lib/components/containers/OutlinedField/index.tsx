import classNames from "classnames";
import type React from "react";

import "./style.scss";

export interface OutlinedFieldProps extends React.HTMLAttributes<HTMLDivElement>, React.RefAttributes<HTMLDivElement>
{
	label?: string,
	filled?: boolean,
	focus?: boolean,
	disabled?: boolean,
	error?: boolean,
	density?: 0 | -1 | -2
}

export default function OutlinedField(props: React.PropsWithChildren<OutlinedFieldProps>)
{
	const {label, filled, focus, disabled, error, density = 0, ...divProps} = props;

	return (
		<div {...divProps} className={classNames("OutlinedField Field", {label, filled, focus, disabled, error}, `density-${density}`.replace(/-+/g, "-"), props.className)}>
			<div className="border-top">
				<span className="border start"/>
				{label && <span className="label"><span className="border start"/>{label}<span className="border end"/></span>}
				<span className="border end"/>
			</div>
			<div className="borders"/>
			{label && <span className="label">{label}</span>}
			{props.children}
		</div>
	)
}
