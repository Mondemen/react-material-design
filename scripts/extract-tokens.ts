import { program } from "commander";

function saveComponentToken(name: string, value: string)
{
	return (`@include theme.saveComponentToken(${name.replace(/^md\.comp\./, "").replace(/\./g, "-")}, ${value.replace(/^md\.sys\./, "").replace(/\./g, "-")});`);
}
function saveComponentTypescaleToken(name: string, value: string)
{
	return (`@include theme.saveComponentTypescaleTokens(${name.replace(/^md\.comp\./, "").replace(/\./g, "-")}, ${value.replace(/^md\.sys\.typescale\./, "").replace(/\./g, "-")});`);
}
function saveComponentTypescaleFontToken(name: string, value: string)
{
	return (`@include theme.saveComponentTypescaleTokens(${name.replace(/^md\.comp\./, "").replace(/\.font$/, "").replace(/\./g, "-")}, ${value.replace(/^md\.sys\.typescale\./, "").replace(/\.font$/, "").replace(/\./g, "-")});`);
}
function saveComponentSpring(name: string, value: string)
{
	return (`@include theme.saveComponentSpringTokens(${name.replace(/^md\.comp\./, "").replace(/\.damping$/, "").replace(/\./g, "-")}, ${value.replace(/^md\.sys\./, "").replace(/\.damping$/, "").replace(/^motion\.spring\./, "motion.spring.expressive.").replace(/\./g, "-")});`);
}
function saveComponentValue(name: string, value: any, type: "PERCENT" | "DIPS")
{
	if (value === undefined)
		throw new Error("Unknown value");
	switch (type.toUpperCase())
	{
		case "PERCENT":
			return (`@include theme.saveComponentValue(${name.replace(/^md\.comp\./, "").replace(/\./g, "-")}, ${value}%);`);
		case "DIPS":
			return (`@include theme.saveComponentValue(${name.replace(/^md\.comp\./, "").replace(/\./g, "-")}, ${value}px);`);
		default:
			throw new Error(`Unknown type ${type}`);
	}
}


type Element = Record<string, any> & {name: string, displayName: string};
type Groups = Map<string, {tokenSet: string, group: Element, children: string[], root: boolean}>;

const displayGroupSort = (a: Element, b: Element) => (a.orderInParentTokenSet ?? 0) - (b.orderInParentTokenSet ?? 0);
const parentDisplayGroupSort = (a: Element, b: Element) => (a.orderInParentDisplayGroup ?? 0) - (b.orderInParentDisplayGroup ?? 0);
const tokenSort = (a: Element, b: Element) => (a.orderInDisplayGroup ?? 0) - (b.orderInDisplayGroup ?? 0);
const tokenSetSort = (a: Element, b: Element) =>
{
	const nameA = a.displayName.toUpperCase();
	const nameB = b.displayName.toUpperCase();
	if (nameA < nameB)
		return (-1);
	if (nameA > nameB)
		return (1);
	return (0);
};

async function parseFile(url: string, extractTokenSets: string[])
{
	const response = await fetch(url);
	const definition = await response.json();
	const components = (definition as any).system.components;
	const tokenSets = (definition as any).system.tokenSets.filter((tokenSet: any) => !tokenSet.displayName.toLowerCase().includes("deprecated")).sort(tokenSetSort);
	const displayGroups = (definition as any).system.displayGroups.filter((displayGroup: any) => !displayGroup.displayName.toLowerCase().includes("deprecated")).sort(displayGroupSort) as Element[];
	const tokens = (definition as any).system.tokens as Element[];
	const values = (definition as any).system.values as Element[];
	const result: string[] = [];
	const groups: Groups = new Map();
	let componentTokenSets: any[];

	function generateTokens(tokens: Element[], tokenSetName: string, level = 0)
	{
		let value: any;
		let tokenValue: string | undefined;

		for (const token of tokens)
		{
			if (token.name.startsWith(tokenSetName) && !token.deprecationMessage)
			{
				value = values.find(value => value.name.startsWith(token.name));
				if (["COLOR", "ELEVATION", "SHAPE"].includes(token.tokenValueType) && value.tokenName)
					tokenValue = `${"\t".repeat(level)}${saveComponentToken(token.tokenName, value.tokenName)}`;
				else if (token.tokenValueType === "DURATION" && token.tokenName.endsWith("damping"))
					tokenValue = `${"\t".repeat(level)}${saveComponentSpring(token.tokenName, value.tokenName)}`;
				else if (token.tokenValueType === "TYPOGRAPHY" && value.tokenName)
					tokenValue = `${"\t".repeat(level)}${saveComponentTypescaleToken(token.tokenName, value.tokenName)}`;
				else if (token.tokenValueType === "FONT_NAMES" && value.tokenName)
					tokenValue = `${"\t".repeat(level)}${saveComponentTypescaleFontToken(token.tokenName, value.tokenName)}`;
				else if (token.tokenValueType === "OPACITY")
				{
					if (typeof value.opacity === "number")
						tokenValue = `${"\t".repeat(level)}${saveComponentValue(token.tokenName, value.opacity * 100, "PERCENT")}`;
					else
						tokenValue = `${"\t".repeat(level)}${saveComponentToken(token.tokenName, value.tokenName)}`;
				}
				else if (token.tokenValueType === "LENGTH")
				{
					if (value.length)
						tokenValue = `${"\t".repeat(level)}${saveComponentValue(token.tokenName, value.length.value ?? 0, value.length.unit)}`;
					else
						tokenValue = `${"\t".repeat(level)}${saveComponentToken(token.tokenName, value.tokenName)}`;
				}
				else
					tokenValue = undefined;
				if (tokenValue && !result.includes(tokenValue))
					result.push(tokenValue);
			}
		}
	}
	function loadGroup(groups: Groups, names: string[], tokenSetName: string, level = 0)
	{
		names.forEach(name =>
		{
			const group = groups.get(name);
			let tokenList: Element[];

			if (!group)
				return (console.error(`Name "${name}" not found`));
			tokenList = tokens.filter(token => token.displayGroup === group.group.name && !token.deprecationMessage).sort(tokenSort);
			if (!tokenList.length && !group.children.length)
				return;
			result.push(`${"\t".repeat(level)}/* ${group.group.displayName} */`);
			generateTokens(tokenList, tokenSetName, level +1);
			loadGroup(groups, group.children.map(child => groups.get(child)?.group as Element).sort(parentDisplayGroupSort).map(child => child.name), tokenSetName, level + 1);
		})
	}

	for (const component of components)
	{
		componentTokenSets = tokenSets.filter((tokenSet: any) => (component.tokenSets as string[]).includes(tokenSet.name));
		if (!componentTokenSets.length)
			continue;
		// result.push(`.${component.displayName}`);
		result.push(":root");
		result.push(`{`);
		for (const tokenSet of componentTokenSets)
		{
			result.push(`\t/* ${tokenSet.displayName} */`);
			displayGroups.filter(group => group.name.startsWith(tokenSet.name)).forEach(group =>
			{
				if (!group.parentGroup)
					groups.set(group.name, groups.get(group.name) ?? {tokenSet: tokenSet.name, group, children: [], root: true});
				else
					groups.set(group.name, groups.get(group.name) ?? {tokenSet: tokenSet.name, group, children: [], root: false});
			})
			displayGroups.filter(group => group.name.startsWith(tokenSet.name)).forEach(group =>
			{
				if (group.parentGroup)
				{
					if (groups.has(group.parentGroup))
						groups.get(group.parentGroup)?.children.push(group.name);
					else
						console.error("UNKNOWN PARENT GROUP FOR", group);
				}
			})
			generateTokens(tokens.filter(token => !token.displayGroup), tokenSet.name, 2);
			loadGroup(groups, Array.from(groups).filter(([, group]) => group.root && group.tokenSet === tokenSet.name).map(([name, group]) => group.group.name), tokenSet.name, 2);
			// result.push(`\t}`);
		}
		result.push("}");
	}

	for (const tokenSet of tokenSets.filter((tokenSet: any) => extractTokenSets.includes(tokenSet.displayName)))
		generateTokens(tokens.filter(token => !token.displayGroup), tokenSet.name, 1);
	console.log(result.join("\n"));

}

program
	.argument("tokens-url", "<string>")
	.option("-t, --tokens <strings...>", "Token sets to extract", [])
	.parse();

parseFile(program.args[0], program.opts().tokens);
