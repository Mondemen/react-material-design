import {act, type CSSProperties, type ReactNode} from "react";
import {createRoot, type Root} from "react-dom/client";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import Typography from "./index";

let root: Root | undefined;

function render(element: ReactNode)
{
	const container = document.createElement("div");

	document.body.append(container);
	root = createRoot(container);
	act(() => root?.render(element));
	return (container);
}

describe("Typography", () =>
{
	beforeEach(() =>
	{
		vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
	});

	afterEach(() =>
	{
		if (root)
		{
			act(() => root?.unmount());
			root = undefined;
		}
		document.body.replaceChildren();
		vi.unstubAllGlobals();
	});

	it("applies typography variables without mutating the supplied style", () =>
	{
		const suppliedStyle: CSSProperties =
		{
			color: "red",
			"--custom-token": "kept"
		};
		const container = render(
			<Typography font="Roboto" weight={500} style={suppliedStyle}>
				Example
			</Typography>
		);

		const element = container.querySelector(".Typography") as HTMLElement;

		expect(element.style.getPropertyValue("--typescale-font")).toBe("Roboto");
		expect(element.style.getPropertyValue("--typescale-weight")).toBe("500");
		expect(element.style.getPropertyValue("--custom-token")).toBe("kept");
		expect(suppliedStyle).toEqual({color: "red", "--custom-token": "kept"});
	});

	it("renders a span by default and preserves its children", () =>
	{
		const container = render(
			<Typography>
				<strong>Styled text</strong>
			</Typography>
		);
		const element = container.querySelector(".Typography");

		expect(element?.tagName).toBe("SPAN");
		expect(element?.querySelector("strong")?.textContent).toBe("Styled text");
	});

	it("renders with a custom element and forwards native properties", () =>
	{
		const onClick = vi.fn();
		const container = render(
			<Typography
				as="button"
				id="typography-button"
				className="custom-class"
				title="Typography title"
				aria-label="Typography button"
				onClick={onClick}
				style={{marginTop: 8}}
			>
				Action
			</Typography>
		);
		const element = container.querySelector("button") as HTMLButtonElement;

		expect(element.tagName).toBe("BUTTON");
		expect(element.id).toBe("typography-button");
		expect(element.title).toBe("Typography title");
		expect(element.getAttribute("aria-label")).toBe("Typography button");
		expect(element.classList.contains("Typography")).toBe(true);
		expect(element.classList.contains("custom-class")).toBe(true);
		expect(element.style.marginTop).toBe("8px");

		act(() => element.click());
		expect(onClick).toHaveBeenCalledOnce();
	});

	it.each([
		"display-large",
		"display-medium",
		"display-small",
		"headline-large",
		"headline-medium",
		"headline-small",
		"title-large",
		"title-medium",
		"title-small",
		"body-large",
		"body-medium",
		"body-small",
		"label-large",
		"label-medium",
		"label-small"
	] as const)("applies the %s typography role", type =>
	{
		const container = render(<Typography type={type}>Role</Typography>);

		expect(container.querySelector(".Typography")?.classList.contains(type)).toBe(true);
	});

	it("applies the emphasized class and merges it with a supplied className", () =>
	{
		const container = render(
			<Typography type="body-medium" emphasized className="custom emphasized-custom">
				Emphasized
			</Typography>
		);
		const element = container.querySelector(".Typography");

		expect(element?.classList.contains("body-medium")).toBe(true);
		expect(element?.classList.contains("emphasized")).toBe(true);
		expect(element?.classList.contains("custom")).toBe(true);
		expect(element?.classList.contains("emphasized-custom")).toBe(true);
	});

	it("applies all supported typography CSS variables", () =>
	{
		const container = render(
			<Typography
				font="Roboto Flex"
				weight={600}
				size={18}
				tracking={1.25}
				lineHeight={24}
				wght={450}
				grad={25}
				wdth={110}
				rond={30}
				opsz={20}
				crsv={0.5}
				slnt={-8}
				fill={1}
				hexp={15}
			>
				Variations
			</Typography>
		);
		const element = container.querySelector(".Typography") as HTMLElement;

		expect(element.style.getPropertyValue("--typescale-font")).toBe("Roboto Flex");
		expect(element.style.getPropertyValue("--typescale-weight")).toBe("600");
		expect(element.style.getPropertyValue("--typescale-size")).toBe("18px");
		expect(element.style.getPropertyValue("--typescale-tracking")).toBe("1.25px");
		expect(element.style.getPropertyValue("--typescale-line-height")).toBe("24px");
		expect(element.style.getPropertyValue("--typescale-wght")).toBe("450");
		expect(element.style.getPropertyValue("--typescale-grad")).toBe("25");
		expect(element.style.getPropertyValue("--typescale-wdth")).toBe("110");
		expect(element.style.getPropertyValue("--typescale-rond")).toBe("30");
		expect(element.style.getPropertyValue("--typescale-opsz")).toBe("20");
		expect(element.style.getPropertyValue("--typescale-crsv")).toBe("0.5");
		expect(element.style.getPropertyValue("--typescale-slnt")).toBe("-8");
		expect(element.style.getPropertyValue("--typescale-fill")).toBe("1");
		expect(element.style.getPropertyValue("--typescale-hexp")).toBe("15");
	});

	it("lets explicit typography props override matching custom style variables", () =>
	{
		const container = render(
			<Typography
				font="Roboto"
				weight={700}
				size={20}
				style={{
					"--typescale-font": "Fallback",
					"--typescale-weight": "400",
					"--typescale-size": "12px"
				}}
			>
				Override
			</Typography>
		);
		const element = container.querySelector(".Typography") as HTMLElement;

		expect(element.style.getPropertyValue("--typescale-font")).toBe("Roboto");
		expect(element.style.getPropertyValue("--typescale-weight")).toBe("700");
		expect(element.style.getPropertyValue("--typescale-size")).toBe("20px");
	});

	it("does not forward typography props as DOM attributes", () =>
	{
		const container = render(
			<Typography
				as="div"
				type="title-medium"
				emphasized
				font="Roboto"
				weight={500}
				size={16}
				tracking={0.5}
			>
				Excluded
			</Typography>
		);
		const element = container.querySelector(".Typography") as HTMLElement;

		for (const attribute of ["type", "emphasized", "font", "weight", "size", "tracking"])
			expect(element.hasAttribute(attribute)).toBe(false);
	});

	it("updates classes and variables when props change", () =>
	{
		const container = render(
			<Typography type="body-small" font="Roboto" weight={400}>
				Dynamic
			</Typography>
		);

		act(() => root?.render(
			<Typography type="headline-large" emphasized font="Roboto Flex" weight={700}>
				Dynamic
			</Typography>
		));

		const element = container.querySelector(".Typography") as HTMLElement;

		expect(element.classList.contains("body-small")).toBe(false);
		expect(element.classList.contains("headline-large")).toBe(true);
		expect(element.classList.contains("emphasized")).toBe(true);
		expect(element.style.getPropertyValue("--typescale-font")).toBe("Roboto Flex");
		expect(element.style.getPropertyValue("--typescale-weight")).toBe("700");
	});
});
