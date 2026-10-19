export enum ComponentSizeShort
{
	XS = "xs",
	S = "s",
	M = "m",
	L = "l",
	XL = "xl"
}

export enum ComponentSize
{
	ExtraSmall = "extra-small",
	Small = "small",
	Medium = "medium",
	Large = "large",
	ExtraLarge = "extra-large",
	XS = ComponentSizeShort.XS,
	S = ComponentSizeShort.S,
	M = ComponentSizeShort.M,
	L = ComponentSizeShort.L,
	XL = ComponentSizeShort.XL
}

export function getComponentSizeName(name?: `${ComponentSize}` | ComponentSize, defaultValue?: Exclude<`${ComponentSize}`, `${ComponentSizeShort}`>)
{
	switch (name)
	{
		case "xs": return ("extra-small");
		case "s": return ("small");
		case "m": return ("medium");
		case "l": return ("large");
		case "xl": return ("extra-large");
		default: return (name ?? defaultValue ?? "small");
	}
}
