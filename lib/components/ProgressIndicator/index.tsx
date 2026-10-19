import classNames from "classnames";
import React from "react";

import "./style.scss";

export interface ProgressIndicatorProps
{
	id?: string,
	type?: "circular" | "linear",
	progress?: number,
	className?: string,
	style?: React.CSSProperties
}

export default function ProgressIndicator(props: ProgressIndicatorProps)
{
	const {type = "circular"} = props;
	const radius = 22;
	const width = 4;
	let offset = 0;

	if (props.progress !== undefined)
		offset = (100 - props.progress) / 100 * (radius * 2 * Math.PI);
	return (
		<div id={props.id} className={classNames("ProgressIndicator", props.className, type)} style={props.style}>
			{type === "circular" ? (
				<svg className={classNames("ProgressIndicator_circular", {progress: props.progress !== undefined})} viewBox="0 0 48 48">
					<circle
						className="ProgressIndicator_path"
						fill="none"
						strokeLinecap="butt"
						strokeWidth={width}
						strokeDasharray={radius * 2 * Math.PI}
						strokeDashoffset={offset}
						cx={radius + width / 2}
						cy={radius + width / 2}
						r={radius}
					/>
				</svg>
			) : (
				<div className="ProgressIndicator_linear"><div className="ProgressIndicator_indicator"/></div>
			)}
		</div>
	);
}