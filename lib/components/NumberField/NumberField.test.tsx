import {act, type ReactNode} from "react";
import {createRoot, type Root} from "react-dom/client";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import OrderedCollection, {type OrderedCollectionChildData} from "../../misc/OrderedCollection";
import Theme from "../Theme";
import NumberField, {type NumberFieldProps} from "./index";

const roots: Root[] = [];
const rootsByContainer = new WeakMap<HTMLElement, Root>();

function render(element: ReactNode)
{
	const container = document.createElement("div");
	const root = createRoot(container);

	document.body.append(container);
	roots.push(root);
	rootsByContainer.set(container, root);
	act(() => root.render(element));
	return (container);
}

function rerender(container: HTMLElement, element: ReactNode)
{
	const root = rootsByContainer.get(container);

	if (!root)
		throw new Error("Cannot rerender an unmounted container");
	act(() => root.render(element));
}

function changeInput(input: HTMLInputElement, value: string)
{
	const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;

	if (!setter)
		throw new Error("HTMLInputElement.value setter is unavailable");
	act(() =>
	{
		setter.call(input, value);
		input.dispatchEvent(new Event("input", {bubbles: true}));
	});
}

function stopArrowRepeat()
{
	act(() => window.dispatchEvent(new MouseEvent("mouseup", {bubbles: true})));
}

describe("NumberField", () =>
{
	beforeEach(() =>
	{
		vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
	});

	afterEach(() =>
	{
		for (const root of roots.splice(0))
			act(() => root.unmount());
		document.body.replaceChildren();
		vi.unstubAllGlobals();
	});

	it("forwards native number input attributes and renders its initial value", () =>
	{
		const container = render(
			<NumberField
				id="quantity"
				defaultValue={12}
				min={0}
				max={20}
				step={0.5}
				placeholder="Enter a quantity"
				disabled
				aria-label="Quantity"
				lang="en-US"
			/>
		);
		const input = container.querySelector("input")!;

		expect(input.id).toBe("quantity");
		expect(input.type).toBe("number");
		expect(input.value).toBe("12");
		expect(input.min).toBe("0");
		expect(input.max).toBe("20");
		expect(input.step).toBe("0.5");
		expect(input.placeholder).toBe("Enter a quantity");
		expect(input.disabled).toBe(true);
		expect(input.getAttribute("aria-label")).toBe("Quantity");
		expect(input.lang).toBe("en-US");
	});

	it("updates an uncontrolled value and calls both change callbacks", () =>
	{
		const onChange = vi.fn();
		const onValueChange = vi.fn();
		const container = render(<NumberField defaultValue={1} onChange={onChange} onValueChange={onValueChange}/>);
		const input = container.querySelector("input")!;

		changeInput(input, "2.5");

		expect(input.value).toBe("2.5");
		expect(onChange).toHaveBeenCalledOnce();
		expect(onValueChange).toHaveBeenCalledWith(2.5);
	});

	it("supports a controlled zero value and reflects owner updates", () =>
	{
		const onValueChange = vi.fn();
		const container = render(<NumberField value={0} defaultValue={5} onValueChange={onValueChange}/>);
		const input = container.querySelector("input")!;

		expect(input.value).toBe("0");
		changeInput(input, "3");

		expect(input.value).toBe("0");
		expect(onValueChange).toHaveBeenCalledWith(3);

		rerender(container, <NumberField value={7} onValueChange={onValueChange}/>);
		expect(input.value).toBe("7");
	});

	it("supports zero as an uncontrolled initial value", () =>
	{
		const container = render(<NumberField defaultValue={0}/>);

		expect(container.querySelector("input")?.value).toBe("0");
		expect(container.querySelector(".Field")?.classList.contains("filled")).toBe(true);
	});

	it("renders and focuses an associated label above the field", () =>
	{
		const container = render(<NumberField id="age" label="Age" required labelPosition="above"/>);
		const label = container.querySelector("label.label.above") as HTMLLabelElement;
		const input = container.querySelector("input")!;

		expect(label.htmlFor).toBe("age");
		expect(label.textContent).toBe("Age*");
		act(() => label.click());
		expect(document.activeElement).toBe(input);
	});

	it.each(["filled", "outlined"] as const)("renders its default label inside a %s field", shape =>
	{
		const container = render(<NumberField shape={shape} label="Quantity"/>);
		const input = container.querySelector("input")!;
		const labels = container.querySelectorAll(".Field .label");

		expect(labels.length).toBeGreaterThan(0);
		expect(Array.from(labels).every(label => label.textContent === "Quantity")).toBe(true);
		expect(container.querySelector("label")).toBeNull();
		expect(input.id).not.toBe("");
	});

	it("renders an associated inline label and focuses the input when clicked", () =>
	{
		const container = render(<NumberField id="amount" label="Amount" labelPosition="inline"/>);
		const label = container.querySelector("label.label.inline") as HTMLLabelElement;
		const input = container.querySelector("input")!;

		expect(label.htmlFor).toBe(input.id);
		act(() => label.click());
		expect(document.activeElement).toBe(input);
	});

	it("applies focus state to the field and removes it on blur", () =>
	{
		const container = render(<NumberField/>);
		const input = container.querySelector("input")!;
		const field = container.querySelector(".Field")!;

		act(() => input.focus());
		expect(field.classList.contains("focus")).toBe(true);

		act(() => input.blur());
		expect(field.classList.contains("focus")).toBe(false);
	});

	it("marks an empty field as filled when it has a placeholder", () =>
	{
		const empty = render(<NumberField/>);
		const placeholder = render(<NumberField placeholder="Quantity"/>);

		expect(empty.querySelector(".Field")?.classList.contains("filled")).toBe(false);
		expect(placeholder.querySelector(".Field")?.classList.contains("filled")).toBe(true);
	});

	it("increments and decrements by step while respecting min and max", () =>
	{
		const onValueChange = vi.fn();
		const container = render(<NumberField defaultValue={1} min={0} max={2} step={0.5} onValueChange={onValueChange}/>);
		const input = container.querySelector("input")!;
		const [increment, decrement] = Array.from(container.querySelectorAll(".arrow .button"));

		act(() => increment.dispatchEvent(new MouseEvent("mousedown", {bubbles: true})));
		stopArrowRepeat();
		expect(input.value).toBe("1.5");
		expect(onValueChange).toHaveBeenLastCalledWith(1.5);

		act(() => decrement.dispatchEvent(new MouseEvent("mousedown", {bubbles: true})));
		stopArrowRepeat();
		expect(input.value).toBe("1");
		expect(onValueChange).toHaveBeenLastCalledWith(1);
	});

	it("clamps arrow increments at the maximum", () =>
	{
		const container = render(<NumberField defaultValue={2} max={2}/>);
		const input = container.querySelector("input")!;
		const increment = container.querySelector(".arrow .button")!;

		act(() => increment.dispatchEvent(new MouseEvent("mousedown", {bubbles: true})));
		stopArrowRepeat();

		expect(input.value).toBe("2");
	});

	it("omits the arrow controls when hideArrow is set", () =>
	{
		const container = render(<NumberField hideArrow/>);

		expect(container.querySelector(".arrow")).toBeNull();
	});

	it("uses hugeStep for shifted arrow-key increments", () =>
	{
		const container = render(<NumberField defaultValue={1} step={1} hugeStep={5} lang="en-US"/>);
		const input = container.querySelector("input")!;

		act(() => window.dispatchEvent(new KeyboardEvent("keydown", {key: "Shift", shiftKey: true})));
		act(() => input.dispatchEvent(new KeyboardEvent("keydown", {key: "ArrowUp", code: "ArrowUp", shiftKey: true, bubbles: true, cancelable: true})));
		act(() => window.dispatchEvent(new KeyboardEvent("keyup", {key: "Shift", shiftKey: false})));

		expect(input.value).toBe("6");
	});

	it("blocks non-numeric keys and allows digits and the locale decimal separator", () =>
	{
		const container = render(<NumberField lang="en-US"/>);
		const input = container.querySelector("input")!;
		const letter = new KeyboardEvent("keydown", {key: "a", bubbles: true, cancelable: true});
		const digit = new KeyboardEvent("keydown", {key: "5", bubbles: true, cancelable: true});
		const decimal = new KeyboardEvent("keydown", {key: ".", bubbles: true, cancelable: true});

		act(() =>
		{
			input.dispatchEvent(letter);
			input.dispatchEvent(digit);
			input.dispatchEvent(decimal);
		});

		expect(letter.defaultPrevented).toBe(true);
		expect(digit.defaultPrevented).toBe(false);
		expect(decimal.defaultPrevented).toBe(false);
	});

	it.each(["filled", "outlined"] as const)("renders prefix and suffix with the %s shape", shape =>
	{
		const container = render(<NumberField shape={shape} prefix="$" suffix="USD" label="Amount"/>);

		expect(container.querySelector(".Field")?.classList.contains(shape === "filled" ? "FilledField" : "OutlinedField")).toBe(true);
		expect(container.querySelector("span.prefix")?.textContent).toBe("$");
		expect(container.querySelector("span.suffix")?.textContent).toBe("USD");
	});

	it("clears the value and calls onValueChange when clearable", () =>
	{
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
		const onValueChange = vi.fn();
		const container = render(
			<Theme primaryColor="#6750A4" colorScheme="light" noDefaultStyle>
				<NumberField defaultValue={42} clearable onValueChange={onValueChange}/>
			</Theme>
		);
		const input = container.querySelector("input")!;
		const clearButton = container.querySelector<HTMLButtonElement>("button.trailing")!;

		act(() => clearButton.click());

		expect(input.value).toBe("");
		expect(onValueChange).toHaveBeenCalledWith(Number.NaN);
	});

	it("shows supporting and invalid messages, then clears the error after editing", () =>
	{
		const onInvalid = vi.fn();
		const container = render(<NumberField required supportingText="Enter a number" onInvalid={onInvalid}/>);
		const input = container.querySelector("input")!;

		expect(container.querySelector(".message")?.textContent).toBe("Enter a number");
		act(() => input.dispatchEvent(new Event("invalid", {cancelable: true})));

		expect(onInvalid).toHaveBeenCalledOnce();
		expect(container.querySelector(".NumberField")?.classList.contains("error")).toBe(true);
		expect(container.querySelector(".message")?.textContent).toBe(input.validationMessage);

		changeInput(input, "4");
		expect(container.querySelector(".NumberField")?.classList.contains("error")).toBe(false);
		expect(container.querySelector(".message")?.textContent).toBe("Enter a number");
	});
});

describe("NumberField in OrderedCollection", () =>
{
	beforeEach(() =>
	{
		vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
	});

	afterEach(() =>
	{
		for (const root of roots.splice(0))
			act(() => root.unmount());
		document.body.replaceChildren();
		vi.unstubAllGlobals();
	});

	it("registers field props instead of rendering an input", () =>
	{
		const childrenUpdates: OrderedCollectionChildData<NumberFieldProps>[][] = [];
		const onChildrenChange = (children: OrderedCollectionChildData<NumberFieldProps>[]) => childrenUpdates.push(children);
		const container = render(
			<OrderedCollection<NumberFieldProps> name="Quantities" childName="NumberField" onChildrenChange={onChildrenChange}>
				<NumberField id="quantity" label="Quantity" defaultValue={3} step={0.5}/>
			</OrderedCollection>
		);

		expect(container.querySelector("input")).toBeNull();
		expect(container.querySelector(".OrderedCollectionChild")?.getAttribute("data-name")).toBe("NumberField");
		expect(childrenUpdates.at(-1)).toEqual([
			expect.objectContaining({
				id: "quantity",
				orderedCollectionName: "NumberField",
				label: "Quantity",
				defaultValue: 3,
				step: 0.5
			})
		]);
	});
});
