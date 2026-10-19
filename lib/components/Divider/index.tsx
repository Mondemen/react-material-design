import classNames from "classnames";
import "./style.scss";

export interface DividerProps
{
	text?: string,
	vertical?: boolean,
	className?: string
}

export default function Divider(props: DividerProps)
{
	return (
		<div className={classNames("Divider", {vertical: props.vertical}, props.className)}>
			<div className="line"/>
			{props.text && <span className="text">{props.text}</span>}
			<div className="line"/>
		</div>
	);
}
