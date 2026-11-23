import {act, memo, useState, type ReactNode} from "react";
import {createRoot, type Root} from "react-dom/client";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import Theme, {useTheme} from "./Theme";

const CustomButton = () => <button/>;
const roots: Root[] = [];

function ThemeProbe()
{
	const {colorScheme, setColorScheme, palette, config} = useTheme();

	return (
		<output
			id="theme-probe"
			data-color-scheme={colorScheme}
			data-primary-color={config.primaryColor}
			data-contrast={String(config.contrast)}
			data-custom-colors={JSON.stringify(config.customColors)}
			data-has-custom-button={String(config.componentTypes?.button === CustomButton)}
			data-primary-token={palette.light.primary}
			data-custom-color-token={palette.light.warning}
		>
			<button onClick={() => setColorScheme("dark")}>Switch to dark</button>
		</output>
	);
}

function render(element: ReactNode)
{
	const container = document.createElement("div");
	const root = createRoot(container);

	document.body.append(container);
	roots.push(root);
	act(() => root.render(element));
	return (container);
}

describe("Theme", () =>
{
	beforeEach(() =>
	{
		vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
		vi.stubGlobal("matchMedia", vi.fn((media: string) => ({
			matches: false,
			media,
			onchange: null,
			addListener: vi.fn(),
			removeListener: vi.fn(),
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			dispatchEvent: vi.fn()
		})));
	});

	afterEach(() =>
	{
		for (const root of roots.splice(0))
			act(() => root.unmount());
		document.body.replaceChildren();
		document.head.querySelectorAll('style[data-href^="theme_"]').forEach(style => style.remove());
		vi.unstubAllGlobals();
	});

	it.each(["light", "dark", "auto"] as const)("applies the %s color scheme", colorScheme =>
	{
		const container = render(
			<Theme id="scheme-theme" primaryColor="#6750A4" colorScheme={colorScheme}>
				<ThemeProbe/>
			</Theme>
		);
		const theme = container.querySelector("#scheme-theme")!;
		const probe = container.querySelector("#theme-probe")!;

		expect(probe.getAttribute("data-color-scheme")).toBe(colorScheme);
		expect(theme.classList.contains("light")).toBe(colorScheme === "light");
		expect(theme.classList.contains("dark")).toBe(colorScheme === "dark");
	});

	it("updates the color scheme through the context setter", () =>
	{
		const container = render(
			<Theme primaryColor="#6750A4" colorScheme="light">
				<ThemeProbe/>
			</Theme>
		);

		act(() => container.querySelector("button")!.click());

		expect(container.querySelector("#theme-probe")?.getAttribute("data-color-scheme")).toBe("dark");
		expect(container.querySelector(".Theme")?.classList.contains("dark")).toBe(true);
	});

	it("keeps theme consumers from rerendering when the parent rerenders without changing theme props", () =>
	{
		let consumerRenders = 0;
		const ThemeConsumer = memo(() =>
		{
			useTheme();
			consumerRenders++;
			return (<span>Theme consumer</span>);
		});
		function Parent()
		{
			const [count, setCount] = useState(0);

			return (
				<>
					<button onClick={() => setCount(count + 1)}>{count}</button>
					<Theme primaryColor="#6750A4">
						<ThemeConsumer/>
					</Theme>
				</>
			);
		}
		const container = render(<Parent/>);
		const initialConsumerRenders = consumerRenders;

		act(() => container.querySelector("button")!.click());

		expect(consumerRenders).toBe(initialConsumerRenders);
	});

	it("applies id, className, style and renders children", () =>
	{
		const container = render(
			<Theme
				id="custom-theme"
				primaryColor="#6750A4"
				className="custom-class"
				style={{backgroundColor: "rgb(1, 2, 3)"}}
			>
				<span>Theme content</span>
			</Theme>
		);
		const theme = container.querySelector("#custom-theme") as HTMLDivElement;

		expect(theme.classList.contains("custom-class")).toBe(true);
		expect(theme.style.backgroundColor).toBe("rgb(1, 2, 3)");
		expect(theme.classList.contains("base")).toBe(true);
		expect(document.querySelector('style[data-href="theme_base_custom-theme"]')).not.toBeNull();
		expect(theme.textContent).toContain("Theme content");
	});

	it("omits the base styles and base class when noDefaultStyle is set", () =>
	{
		const container = render(<Theme id="unstyled-theme" primaryColor="#6750A4" noDefaultStyle/>);

		expect(container.querySelector("#unstyled-theme")?.classList.contains("base")).toBe(false);
		expect(document.querySelector('style[data-href="theme_base_unstyled-theme"]')).toBeNull();
	});

	it.each([
		{scrollable: true, hasClass: true},
		{scrollable: false, hasClass: false}
	])("sets scrollable class for nested themes ($scrollable)", ({scrollable, hasClass}) =>
	{
		const container = render(
			<Theme primaryColor="#6750A4">
				<Theme id="nested-theme" primaryColor="#6750A4" scrollable={scrollable}/>
			</Theme>
		);

		expect(container.querySelector("#nested-theme")?.classList.contains("scrollable")).toBe(hasClass);
	});

	it("passes primaryColor, contrast, customColors and componentTypes into the theme context", () =>
	{
		const container = render(
			<Theme
				primaryColor="#006B5F"
				contrast={0.5}
				customColors={{warning: {color: "#B3261E", blend: false}}}
				componentTypes={{button: CustomButton}}
			>
				<ThemeProbe/>
			</Theme>
		);
		const probe = container.querySelector("#theme-probe")!;

		expect(probe.getAttribute("data-primary-color")).toBe("#006B5F");
		expect(probe.getAttribute("data-contrast")).toBe("0.5");
		expect(JSON.parse(probe.getAttribute("data-custom-colors")!)).toEqual({warning: {color: "#B3261E", blend: false}});
		expect(probe.getAttribute("data-has-custom-button")).toBe("true");
		expect(probe.getAttribute("data-custom-color-token")).toMatch(/^#[\da-f]{6}$/i);
	});

	it("uses primaryColor and contrast when generating the palette", () =>
	{
		const lowContrast = render(
			<Theme id="low-contrast-theme" primaryColor="#006B5F" contrast={-1}>
				<ThemeProbe/>
			</Theme>
		);
		const highContrast = render(
			<Theme id="high-contrast-theme" primaryColor="#006B5F" contrast={1}>
				<ThemeProbe/>
			</Theme>
		);
		const differentPrimaryColor = render(
			<Theme id="different-primary-theme" primaryColor="#6750A4" contrast={-1}>
				<ThemeProbe/>
			</Theme>
		);
		const lowContrastPrimary = lowContrast.querySelector("#theme-probe")?.getAttribute("data-primary-token");

		expect(lowContrastPrimary).not.toBe(highContrast.querySelector("#theme-probe")?.getAttribute("data-primary-token"));
		expect(lowContrastPrimary).not.toBe(differentPrimaryColor.querySelector("#theme-probe")?.getAttribute("data-primary-token"));
	});
});
