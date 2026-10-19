export interface FontPresetProps
{
	role: "",
	size: "large" | "medium" | "small",
	emphasized?: boolean
}

export interface FontCustomProps
{

}

export type FontProps = FontPresetProps | FontCustomProps;

export default function Font()
{
	return (null);
}