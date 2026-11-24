import {act, type ReactNode} from "react";
import {createRoot, type Root} from "react-dom/client";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import Theme from "../Theme";
import Select, {Option} from "./index";

const roots: Root[] = [];
const rootsByContainer = new WeakMap<HTMLElement, Root>();

function render(element: ReactNode)
{
	const container = document.createElement("div");
	const root = createRoot(container);

	document.body.append(container);
	roots.push(root);
	rootsByContainer.set(container, root);
	act(() => root.render(
		<Theme primaryColor="#6750A4" colorScheme="light" noDefaultStyle>
			{element}
		</Theme>
	));
	return (container);
}

function rerender(container: HTMLElement, element: ReactNode)
{
	const root = rootsByContainer.get(container);

	if (!root)
		throw new Error("Cannot rerender an unmounted container");
	act(() => root.render(
		<Theme primaryColor="#6750A4" colorScheme="light" noDefaultStyle>
			{element}
		</Theme>
	));
}

function controlInput(container: HTMLElement)
{
	return (container.querySelector<HTMLInputElement>(".control input")!);
}

async function changeInput(input: HTMLInputElement, value: string)
{
	const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;

	if (!setter)
		throw new Error("HTMLInputElement.value setter is unavailable");
	await act(async () =>
	{
		setter.call(input, value);
		input.dispatchEvent(new Event("input", {bubbles: true}));
		await new Promise(resolve => setTimeout(resolve, 0));
	});
}

function pointerUp(element: HTMLElement)
{
	act(() => element.dispatchEvent(new Event("pointerup", {bubbles: true, cancelable: true})));
}

function menuItem(container: HTMLElement, label: string)
{
	return (Array.from(container.querySelectorAll<HTMLButtonElement>(".MenuItem")).find(item => item.textContent?.includes(label)));
}

describe("Select and Option", () =>
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
		vi.stubGlobal("ResizeObserver", class
		{
			observe = vi.fn();
			unobserve = vi.fn();
			disconnect = vi.fn();
		});
	});

	afterEach(() =>
	{
		for (const root of roots.splice(0))
			act(() => root.unmount());
		document.body.replaceChildren();
		document.head.querySelectorAll('style[href^="theme_"]').forEach(style => style.remove());
		vi.unstubAllGlobals();
	});

	it("registers Option children as native options and menu items", () =>
	{
		const container = render(
			<Select defaultMenuIsOpen aria-label="Favorite color">
				<Option value="red" label="Red"/>
				<Option value="blue" label="Blue"/>
				<Option value="green"/>
			</Select>
		);
		const nativeSelect = container.querySelector("select")!;

		expect(Array.from(nativeSelect.options).map(option => option.value)).toEqual(["red", "blue", "green"]);
		expect(Array.from(nativeSelect.options).map(option => option.label)).toEqual(["Red", "Blue", "green"]);
		expect(nativeSelect.getAttribute("aria-label")).toBe("Favorite color");
		expect(nativeSelect.hasAttribute("defaultMenuIsOpen")).toBe(false);
		expect(menuItem(container, "Red")).not.toBeUndefined();
		expect(menuItem(container, "Blue")).not.toBeUndefined();
		expect(menuItem(container, "green")).not.toBeUndefined();
		expect(container.querySelector(".OrderedCollectionChild[data-name='Option']")).not.toBeNull();
	});

	it("shows the selected option label for a default value", () =>
	{
		const container = render(
			<Select defaultValue="blue" label="Color">
				<Option value="red" label="Red"/>
				<Option value="blue" label="Blue"/>
			</Select>
		);

		expect(controlInput(container).placeholder).toBe("Blue");
		expect(container.querySelector("select")?.value).toBe("blue");
	});

	it.each(["filled", "outlined"] as const)("renders its default label inside the %s field", shape =>
	{
		const container = render(
			<Select shape={shape} label="Color">
				<Option value="red" label="Red"/>
			</Select>
		);
		const labels = container.querySelectorAll(".Field .label");

		expect(labels.length).toBeGreaterThan(0);
		expect(Array.from(labels).every(label => label.textContent === "Color")).toBe(true);
		expect(container.querySelector("label")).toBeNull();
	});

	it.each(["inline", "above"] as const)("renders an associated %s label", labelPosition =>
	{
		const container = render(
			<Select id="color" label="Color" labelPosition={labelPosition}>
				<Option value="red" label="Red"/>
			</Select>
		);
		const label = container.querySelector(`label.label.${labelPosition}`) as HTMLLabelElement;
		const nativeSelect = container.querySelector("select")!;

		expect(label.htmlFor).toBe("color");
		expect(nativeSelect.id).toBe("color");
		act(() => label.click());
		expect(container.querySelector(".Field")?.classList.contains("focus")).toBe(true);
	});

	it("applies focus styling and clears it after clicking outside", () =>
	{
		const container = render(
			<Select>
				<Option value="red" label="Red"/>
			</Select>
		);
		const input = controlInput(container);
		const field = container.querySelector(".Field")!;

		act(() => input.focus());
		expect(field.classList.contains("focus")).toBe(true);

		act(() => document.body.dispatchEvent(new MouseEvent("mousedown", {bubbles: true})));
		expect(field.classList.contains("focus")).toBe(false);
	});

	it("selects a single option and calls both value and option callbacks", () =>
	{
		const onValueChange = vi.fn();
		const onChange = vi.fn();
		const container = render(
			<Select defaultMenuIsOpen onValueChange={onValueChange} onChange={onChange}>
				<Option value="red" label="Red"/>
				<Option value="blue" label="Blue" icon="star" default/>
			</Select>
		);

		act(() => menuItem(container, "Blue")?.click());

		expect(onValueChange).toHaveBeenCalledWith("blue");
		expect(onChange).toHaveBeenCalledWith(expect.objectContaining({value: "blue", label: "Blue", icon: "star", default: true}));
		expect(controlInput(container).placeholder).toBe("Blue");
	});

	it("preserves numeric option values in callbacks", () =>
	{
		const onValueChange = vi.fn();
		const container = render(
			<Select<number> defaultMenuIsOpen onValueChange={onValueChange}>
				<Option value={42} label="Forty-two"/>
			</Select>
		);

		act(() => menuItem(container, "Forty-two")?.click());

		expect(onValueChange).toHaveBeenCalledWith(42);
		expect(container.querySelector("select")?.value).toBe("42");
	});

	it("updates an uncontrolled selection through the native mobile select", () =>
	{
		vi.stubGlobal("navigator", {userAgent: "iPhone", language: "en-US"});
		const onValueChange = vi.fn();
		const onChange = vi.fn();
		const container = render(
			<Select onValueChange={onValueChange} onChange={onChange}>
				<Option value="red" label="Red"/>
				<Option value="blue" label="Blue"/>
			</Select>
		);
		const nativeSelect = container.querySelector("select")!;
		const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value")?.set;

		expect(nativeSelect.style.display).toBe("block");
		if (!setter)
			throw new Error("HTMLSelectElement.value setter is unavailable");
		act(() =>
		{
			setter.call(nativeSelect, "blue");
			nativeSelect.dispatchEvent(new Event("change", {bubbles: true}));
		});

		expect(onValueChange).toHaveBeenCalledWith("blue");
		expect(onChange).toHaveBeenCalledWith(expect.objectContaining({value: "blue", label: "Blue"}));
		expect(controlInput(container).placeholder).toBe("Blue");
	});

	it("keeps a controlled selection until the owner updates it", () =>
	{
		const onValueChange = vi.fn();
		const container = render(
			<Select value="red" defaultMenuIsOpen onValueChange={onValueChange}>
				<Option value="red" label="Red"/>
				<Option value="blue" label="Blue"/>
			</Select>
		);

		act(() => menuItem(container, "Blue")?.click());

		expect(onValueChange).toHaveBeenCalledWith("blue");
		expect(controlInput(container).placeholder).toBe("Red");
	});

	it("toggles multiple selections and renders selected values as chips", () =>
	{
		const onValueChange = vi.fn();
		const onChange = vi.fn();
		const container = render(
			<Select multiple defaultValue={["red"]} defaultMenuIsOpen onValueChange={onValueChange} onChange={onChange}>
				<Option value="red" label="Red"/>
				<Option value="blue" label="Blue"/>
			</Select>
		);

		act(() => menuItem(container, "Blue")?.click());

		expect(onValueChange).toHaveBeenCalledWith(["red", "blue"]);
		expect(onChange).toHaveBeenCalledWith([
			expect.objectContaining({value: "red", label: "Red"}),
			expect.objectContaining({value: "blue", label: "Blue"})
		]);
		expect(Array.from(container.querySelectorAll(".Chip")).some(chip => chip.textContent?.includes("Blue"))).toBe(true);
	});

	it("keeps a controlled multiple selection until the owner updates it", () =>
	{
		const onValueChange = vi.fn();
		const options = (
			<>
				<Option value="red" label="Red"/>
				<Option value="blue" label="Blue"/>
			</>
		);
		const container = render(
			<Select multiple value={["red"]} defaultMenuIsOpen onValueChange={onValueChange}>
				{options}
			</Select>
		);

		act(() => menuItem(container, "Blue")?.click());
		expect(onValueChange).toHaveBeenCalledWith(["red", "blue"]);
		expect(Array.from(container.querySelectorAll(".Chip")).some(chip => chip.textContent?.includes("Blue"))).toBe(false);

		rerender(container,
			<Select multiple value={["red", "blue"]} defaultMenuIsOpen onValueChange={onValueChange}>
				{options}
			</Select>
		);
		expect(Array.from(container.querySelectorAll(".Chip")).some(chip => chip.textContent?.includes("Blue"))).toBe(true);
	});

	it("filters options by the searchable input", async () =>
	{
		const container = render(
			<Select searchable defaultMenuIsOpen>
				<Option value="alpha" label="Alpha"/>
				<Option value="beta" label="Beta"/>
				<Option value="gamma" label="Gamma"/>
			</Select>
		);
		const input = controlInput(container);

		await changeInput(input, "Beta");

		expect(menuItem(container, "Beta")).not.toBeUndefined();
		expect(menuItem(container, "Alpha")).toBeUndefined();
		expect(menuItem(container, "Gamma")).toBeUndefined();
	});

	it("filters case-insensitively and displays noOptionMessage when there are no matches", async () =>
	{
		const container = render(
			<Select searchable defaultMenuIsOpen noOptionMessage="No matches">
				<Option value="beta" label="Beta"/>
				<Option value="alpha" label="Alpha"/>
			</Select>
		);
		const input = controlInput(container);

		await changeInput(input, "be");
		expect(menuItem(container, "Beta")).not.toBeUndefined();
		expect(menuItem(container, "Alpha")).toBeUndefined();

		await changeInput(input, "missing");
		expect(menuItem(container, "No matches")).not.toBeUndefined();
	});

	it("selects the focused option with the keyboard", () =>
	{
		const onValueChange = vi.fn();
		const container = render(
			<Select defaultMenuIsOpen onValueChange={onValueChange}>
				<Option value="red" label="Red"/>
				<Option value="blue" label="Blue"/>
			</Select>
		);
		const input = controlInput(container);

		act(() => input.dispatchEvent(new KeyboardEvent("keydown", {key: "ArrowDown", code: "ArrowDown", bubbles: true, cancelable: true})));
		act(() => input.dispatchEvent(new KeyboardEvent("keydown", {key: "Enter", code: "Enter", bubbles: true, cancelable: true})));

		expect(onValueChange).toHaveBeenCalledWith("red");
		expect(controlInput(container).placeholder).toBe("Red");
	});

	it("closes the menu and clears the search entry on Escape", () =>
	{
		const container = render(
			<Select searchable defaultMenuIsOpen>
				<Option value="red" label="Red"/>
				<Option value="blue" label="Blue"/>
			</Select>
		);
		const input = controlInput(container);
		const menu = container.querySelector(".Menu.visible")!;

		act(() => input.dispatchEvent(new KeyboardEvent("keydown", {key: "Escape", code: "Escape", bubbles: true})));

		expect(menu.classList.contains("visible")).toBe(false);
		expect(input.value).toBe("");
	});

	it("does not open when disabled", () =>
	{
		const container = render(
			<Select disabled>
				<Option value="red" label="Red"/>
			</Select>
		);
		const input = controlInput(container);

		expect(input.disabled).toBe(true);
		expect(container.querySelector(".Menu.visible")).toBeNull();
	});

	it("marks required empty selection invalid and shows the validation message", () =>
	{
		const onInvalid = vi.fn();
		const container = render(
			<Select required onInvalid={onInvalid} supportingText="Choose a color">
				<Option value="red" label="Red"/>
			</Select>
		);
		const validationInput = container.querySelector<HTMLInputElement>("input[required]")!;

		expect(container.querySelector(".support")?.textContent).toBe("Choose a color");
		act(() => validationInput.dispatchEvent(new Event("invalid", {cancelable: true})));

		expect(container.querySelector(".Select")?.classList.contains("error")).toBe(true);
		expect(container.querySelector(".support")?.textContent).toBe(validationInput.validationMessage);
	});

	it("hides the validation message but keeps supporting text when hideErrorText is set", () =>
	{
		const container = render(
			<Select required hideErrorText supportingText="Choose an option">
				<Option value="red" label="Red"/>
			</Select>
		);
		const validationInput = container.querySelector<HTMLInputElement>("input[required]")!;

		act(() => validationInput.dispatchEvent(new Event("invalid", {cancelable: true})));

		expect(container.querySelector(".Select")?.classList.contains("error")).toBe(true);
		expect(container.querySelector(".support")?.textContent).toBe("Choose an option");
	});

	it("shows noOptionMessage when no options are provided", () =>
	{
		const container = render(<Select defaultMenuIsOpen noOptionMessage="No colors available"/>);

		expect(menuItem(container, "No colors available")).not.toBeUndefined();
	});

	it("clears a single selection and notifies value and option callbacks", () =>
	{
		const onValueChange = vi.fn();
		const onChange = vi.fn();
		const container = render(
			<Select defaultValue="red" clearable onValueChange={onValueChange} onChange={onChange}>
				<Option value="red" label="Red"/>
				<Option value="blue" label="Blue"/>
			</Select>
		);

		expect(container.querySelector("select")?.hasAttribute("clearable")).toBe(false);
		pointerUp(container.querySelector<HTMLElement>(".clear-indicator")!);

		expect(onValueChange).toHaveBeenCalledWith(undefined);
		expect(onChange).toHaveBeenCalledWith(undefined);
		expect(controlInput(container).placeholder).toBe("");
	});

	it("clears all values from a multiple selection", () =>
	{
		const onValueChange = vi.fn();
		const onChange = vi.fn();
		const container = render(
			<Select multiple defaultValue={["red", "blue"]} clearable onValueChange={onValueChange} onChange={onChange}>
				<Option value="red" label="Red"/>
				<Option value="blue" label="Blue"/>
			</Select>
		);

		pointerUp(container.querySelector<HTMLElement>(".clear-indicator")!);

		expect(onValueChange).toHaveBeenCalledWith([]);
		expect(onChange).toHaveBeenCalledWith([]);
		expect(container.querySelectorAll(".Chip")).toHaveLength(0);
	});

	it("reports menu open and close transitions", () =>
	{
		const onMenuOpen = vi.fn();
		const onMenuClose = vi.fn();
		const container = render(
			<Select onMenuOpen={onMenuOpen} onMenuClose={onMenuClose}>
				<Option value="red" label="Red"/>
			</Select>
		);
		const dropdown = container.querySelector<HTMLElement>(".dropdown-indicator")!;

		pointerUp(dropdown);
		expect(onMenuOpen).toHaveBeenCalledOnce();
		expect(container.querySelector(".Menu.visible")).not.toBeNull();

		pointerUp(dropdown);
		expect(onMenuClose).toHaveBeenCalledOnce();
		expect(container.querySelector(".Menu.visible")).toBeNull();
	});

	it("does not show the dropdown indicator when hideDropdownIndicator is set", () =>
	{
		const visible = render(<Select><Option value="red"/></Select>);
		const hidden = render(<Select hideDropdownIndicator><Option value="red"/></Select>);

		expect(visible.querySelector(".dropdown-indicator")).not.toBeNull();
		expect(hidden.querySelector(".dropdown-indicator")).toBeNull();
	});

	it("applies the disabled and custom classes from Option", () =>
	{
		const onValueChange = vi.fn();
		const container = render(
			<Select defaultMenuIsOpen onValueChange={onValueChange}>
				<Option value="red" label="Red" disabled className="custom-option"/>
				<Option value="blue" label="Blue"/>
			</Select>
		);
		const disabledOption = menuItem(container, "Red")!;

		expect(disabledOption.disabled).toBe(true);
		expect(disabledOption.classList.contains("custom-option")).toBe(true);
		act(() => disabledOption.click());
		expect(onValueChange).not.toHaveBeenCalled();
	});

	it.each(["filled", "outlined"] as const)("renders labels and adornments with the %s shape", shape =>
	{
		const container = render(
			<Select shape={shape} label="Amount">
				<Option value="one" label="One"/>
			</Select>
		);

		expect(container.querySelector(".Field")?.classList.contains(shape === "filled" ? "FilledField" : "OutlinedField")).toBe(true);
		expect(container.querySelector(".Field .label")?.textContent).toBe("Amount");
	});
});
